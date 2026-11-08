# Castle Above Clouds — SQL World

A single-file, real-time Three.js PBR scene: a floating castle-town above moonlit clouds whose buildings,
lit windows, lanterns and routes are rows in a live SQLite database (sql.js / WebAssembly, in a worker).

Run it from the repository root (needs Python 3 and an internet connection for the CDN libraries):

```bash
python3 dev.py
```

On Windows use `py dev.py`. It serves this folder on http://127.0.0.1:5180 (or the next free port) and opens your browser; Ctrl+C stops it.

- `EXPLORE SQL` opens the command dock: SELECT · WHERE · ORDER BY · JOIN · GROUP BY · INSERT · UPDATE · DELETE · LIGHT COLOR · SQL INJECTION LAB.
- `TABLE GUIDE · คู่มือตาราง` lists the five tables (live columns, row counts, what each looks like in the scene) and, per building, its rows in `buildings`, `residents` and `lanterns`.
- `lanterns.color` sets each lamp's light colour: `UPDATE lanterns SET color = 'blue' WHERE id = 3;` — English or Thai names (red, แดง …), any CSS colour, or `#hex`. Unknown values fall back to warm with a warning. The bulb button (bottom left) tags every data lantern with its id and colour.
- Every visual response comes from real query results; mapping queries return the ids of the rows involved.
- `?selftest` runs every example plus the injection cases and prints the results; `?instant` skips the opening flight.
