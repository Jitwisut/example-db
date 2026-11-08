"""Run Castle Above Clouds locally.

    python3 dev.py          (Windows: py dev.py)
    python3 dev.py 8000     choose a port

Serves castle-above-clouds/ and opens it in your browser. Ctrl+C to stop.
The page loads Three.js and sql.js from a CDN, so an internet connection is required.
"""
import http.server
import pathlib
import sys
import webbrowser

ROOT = pathlib.Path(__file__).resolve().parent / "castle-above-clouds"


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, *args):  # keep the terminal quiet (favicon 404s etc.)
        pass


def main():
    if not (ROOT / "index.html").exists():
        sys.exit(f"Cannot find {ROOT / 'index.html'} — run this from the example-db repository.")
    start = int(sys.argv[1]) if len(sys.argv) > 1 else 5180
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
    webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
