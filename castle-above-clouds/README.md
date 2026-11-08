# Castle Above Clouds — SQL World

A single-file, real-time Three.js PBR scene: a floating castle-town above moonlit clouds whose buildings,
lit windows, lanterns and routes are rows in a live SQLite database (sql.js / WebAssembly, in a worker).

Run it from the repository root (needs Python 3 and an internet connection for the CDN libraries):

```bash
python3 dev.py
```

On Windows use `py dev.py`. It serves this folder on http://127.0.0.1:5180 (or the next free port) and opens your browser; Ctrl+C stops it.

- `EXPLORE SQL` opens the command dock: SELECT · WHERE · ORDER BY · JOIN · GROUP BY · INSERT · UPDATE · DELETE · SQL INJECTION LAB.
- Every visual response comes from real query results; mapping queries return the ids of the rows involved.
- `?selftest` runs every example plus the injection cases and prints the results; `?instant` skips the opening flight.
