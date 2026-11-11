"""Run Castle Above Clouds locally.

    python3 dev.py               (Windows: py dev.py)
    python3 dev.py 8000          choose a port
    python3 dev.py --no-browser  don't open a browser tab

Serves castle-above-clouds/ and opens it in your browser. Ctrl+C to stop.
The page loads Three.js and sql.js from a CDN, so an internet connection is required.

The castle's database is the SQLite file castle-above-clouds/castle.db. The page reads it
on load and sends the whole file back (PUT /castle.db) after every INSERT / UPDATE / DELETE,
so the file on disk always matches what you see. If it is missing, the page creates it.

The file is updated in place through SQLite (not replaced), so a program that already has
castle.db open, such as DB Browser for SQLite, shows the new rows after a refresh.
"""
import http.server
import os
import pathlib
import sqlite3
import sys
import tempfile
import time
import webbrowser

ROOT = pathlib.Path(__file__).resolve().parent / "castle-above-clouds"
DB_NAME = "castle.db"
DB_PATH = ROOT / DB_NAME
MAX_DB_BYTES = 50 * 1024 * 1024
SQLITE_HEADER = b"SQLite format 3\x00"


SAVE_TIMEOUT_S = 3


def give_up_after(seconds):
    """Backup progress callback. Python's backup() retries forever while another program
    holds a lock on castle.db; this stops it with "database is locked" instead."""
    deadline = time.monotonic() + seconds

    def progress(status, remaining, total):
        if status in (sqlite3.SQLITE_BUSY, sqlite3.SQLITE_LOCKED) and time.monotonic() > deadline:
            raise sqlite3.OperationalError("database is locked")

    return progress


def save_database(data: bytes) -> None:
    """Copy the database the page sent into castle.db, in place, using SQLite's backup API.

    castle.db stays the same file, so programs that have it open (DB Browser for SQLite)
    read the new rows on their next query. SQLite's locks and journal make the copy
    all-or-nothing: castle.db is never left half-written.
    """
    fd, tmp = tempfile.mkstemp(dir=ROOT, prefix=".castle-", suffix=".db.tmp")
    try:
        with os.fdopen(fd, "wb") as f:
            f.write(data)
        incoming = sqlite3.connect(tmp)
        try:
            incoming.execute("SELECT count(*) FROM sqlite_master")  # refuses a damaged file
            target = sqlite3.connect(DB_PATH, timeout=SAVE_TIMEOUT_S)
            try:
                incoming.backup(target, progress=give_up_after(SAVE_TIMEOUT_S))
            finally:
                target.close()
        finally:
            incoming.close()
    finally:
        os.unlink(tmp)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        if self.path.split("?")[0] == "/" + DB_NAME:
            self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_PUT(self):
        """Save the database file sent by the page. Only castle.db can be written."""
        if self.path.split("?")[0] != "/" + DB_NAME:
            self.send_error(403, "Only /castle.db can be saved")
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = 0
        if not 0 < length <= MAX_DB_BYTES:
            self.send_error(413 if length > MAX_DB_BYTES else 400, "Bad database size")
            return
        data = self.rfile.read(length)
        if len(data) != length or not data.startswith(SQLITE_HEADER):
            self.send_error(400, "Not a SQLite database file")
            return
        try:
            save_database(data)
        except sqlite3.OperationalError as e:
            # another program holds a write lock, e.g. DB Browser with unsaved changes
            self.send_error(409, f"castle.db is busy: {e}")
            return
        except (OSError, sqlite3.Error) as e:
            self.send_error(500, f"Could not save: {e}")
            return
        self.send_response(204)
        self.end_headers()

    def log_message(self, *args):  # keep the terminal quiet (favicon 404s etc.)
        pass


def main():
    if not (ROOT / "index.html").exists():
        sys.exit(f"Cannot find {ROOT / 'index.html'} — run this from the example-db repository.")
    args = [a for a in sys.argv[1:] if a != "--no-browser"]
    open_browser = "--no-browser" not in sys.argv[1:]
    start = int(args[0]) if args else 5180
    for port in range(start, start + 20):  # if the port is busy, try the next one
        try:
            server = http.server.ThreadingHTTPServer(("127.0.0.1", port), Handler)
            break
        except OSError:
            continue
    else:
        sys.exit(f"No free port between {start} and {start + 19}.")

    url = f"http://127.0.0.1:{port}"
    print(f"Castle Above Clouds → {url}   (Ctrl+C to stop)", flush=True)
    print(f"Database file: {DB_PATH}", flush=True)
    if open_browser:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
