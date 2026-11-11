# Castle Above Clouds — SQL World

A single-file, real-time Three.js PBR scene: a floating castle-town above moonlit clouds whose buildings,
lit windows, lanterns and routes are rows in a live SQLite database (sql.js / WebAssembly, in a worker).

Run it from the repository root (needs Python 3 and an internet connection for the CDN libraries):

```bash
python3 dev.py
```

On Windows use `py dev.py`. It serves this folder on http://127.0.0.1:5180 (or the next free port) and opens your browser; Ctrl+C stops it.

## The database file: `castle.db`

The world's five tables live in the SQLite file **`castle-above-clouds/castle.db`**. Open it with any SQLite tool:

```bash
sqlite3 castle-above-clouds/castle.db ".tables"
```

- On load the page reads `castle.db` into SQLite (sql.js). If the file is missing, the page builds it from the seed data and saves it.
- After every INSERT / UPDATE / DELETE the page writes the whole database back to `castle.db` (`PUT /castle.db`, handled by `dev.py`). The status line shows `saved to castle.db`. Changes survive a reload.
- **RESET** puts the seed data back and overwrites `castle.db` with it.
- If you edit `castle.db` in another tool while the page is open, reload the page first. Otherwise the page's next save overwrites your edits.
- Saving needs `dev.py`. A plain static server (e.g. `python3 -m http.server`) can only read the file, and the status line says `not saved`.
- If `castle.db` is not a valid SQLite file, the page shows the seed data and leaves the file untouched.
- The SQL injection lab uses its own database (`accounts`, `vault`), which stays in memory and is not saved. `?selftest` neither reads nor writes `castle.db`.

- `EXPLORE SQL` opens the command dock: SELECT · WHERE · ORDER BY · JOIN · GROUP BY · INSERT · UPDATE · DELETE · LIGHT COLOR · SQL INJECTION LAB.
- `TABLE GUIDE · คู่มือตาราง` lists the five tables (live columns, row counts, what each looks like in the scene) and, per building, its rows in `buildings`, `residents` and `lanterns`.
- `lanterns.color` sets each lamp's light colour: `UPDATE lanterns SET color = 'blue' WHERE id = 3;` — English or Thai names (red, แดง …), any CSS colour, or `#hex`. Unknown values fall back to warm with a warning. The bulb button (bottom left) tags every data lantern with its id and colour.
- Every visual response comes from real query results; mapping queries return the ids of the rows involved.
- JOIN raises a temporary **JOIN Isle** above the castle: rows of the FROM table on the left, the JOIN table on the right, one coloured bridge per result row, `NULL` boxes for LEFT JOIN rows without a match. Four example chips cover INNER and LEFT JOINs.
- The injection lab shows the rows each payload returns, in the panel and on a records board behind the gate; secret values (passwords, vault) are flagged red. Payloads: `OR 1=1` bypass, `UNION` password dump, `UNION` read of the `vault` table.
- `sql/` holds every SQL statement the site uses, one commented file per button, for presenting — see `sql/README.md`.
- `js/sql/` is all the code that talks to SQLite: `database.js` (what the page calls), `queries.js` (every built-in query), `sql-worker.js` (sql.js in a Web Worker). The town is created from `sql/00_schema.sql` + `sql/01_seed_data.sql`; `?selftest` checks that seed still matches the 3D world.
- `?selftest` runs every example plus the injection cases and prints the results; `?instant` skips the opening flight.
