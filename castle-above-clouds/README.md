# Castle Above Clouds — SQL World

A single-file, real-time Three.js PBR scene: a floating castle-town above moonlit clouds whose buildings,
lit windows, lanterns and routes are rows in a live SQLite database (sql.js / WebAssembly, in a worker).

Run it from any static server (the page loads Three.js 0.160.0 and sql.js from jsDelivr):

```bash
python3 -m http.server 5180 --directory castle-above-clouds
```

Then open http://localhost:5180.

- `EXPLORE SQL` opens the command dock: SELECT · WHERE · ORDER BY · JOIN · GROUP BY · INSERT · UPDATE · DELETE · SQL INJECTION LAB.
- Every visual response comes from real query results; mapping queries return the ids of the rows involved.
- `?selftest` runs every example plus the injection cases and prints the results; `?instant` skips the opening flight.
