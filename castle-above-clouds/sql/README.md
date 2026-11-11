# SQL ทั้งหมดที่ใช้ในเว็บ Castle Above Clouds

ทุกไฟล์รันได้จริงใน SQLite. ไฟล์ 02–10 และ 12 ต้องสร้างตารางก่อนด้วย `00` + `01`. ไฟล์ 11 รันเดี่ยวได้เลย

| ไฟล์ | ปุ่มในเว็บ | สิ่งที่สอน |
|---|---|---|
| [00_schema.sql](00_schema.sql) | (ตอนเปิดหน้า) | สร้าง 5 ตาราง + FOREIGN KEY |
| [01_seed_data.sql](01_seed_data.sql) | RESET | ข้อมูลเริ่มต้นของเมือง |
| [02_select.sql](02_select.sql) | SELECT | เลือกคอลัมน์ |
| [03_where.sql](03_where.sql) | WHERE | กรองแถว |
| [04_order_by.sql](04_order_by.sql) | ORDER BY | เรียงลำดับ, LIMIT |
| [05_join.sql](05_join.sql) | JOIN | JOIN / LEFT JOIN (4 ตัวอย่างตามปุ่มลัด) |
| [06_group_by.sql](06_group_by.sql) | GROUP BY | จัดกลุ่ม + COUNT |
| [07_insert.sql](07_insert.sql) | INSERT | เพิ่มแถว, FOREIGN KEY error |
| [08_update.sql](08_update.sql) | UPDATE | แก้ค่า |
| [09_light_color.sql](09_light_color.sql) | LIGHT COLOR | UPDATE สีไฟ |
| [10_delete.sql](10_delete.sql) | DELETE | ลบแถว, ON DELETE CASCADE |
| [11_sql_injection_lab.sql](11_sql_injection_lab.sql) | SQL INJECTION LAB | OR 1=1, UNION, prepared statement |
| [12_behind_the_scenes.sql](12_behind_the_scenes.sql) | (เบื้องหลัง) | คำสั่งที่เว็บรันเองเพื่อวาดฉาก 3D |

## โค้ดที่เรียกใช้ SQL (JavaScript) · `js/sql/`

| ไฟล์ | หน้าที่ |
|---|---|
| [../js/sql/database.js](../js/sql/database.js) | ตัวกลางที่หน้าเว็บเรียก: `castleDb.run()`, `castleDb.query()`, `castleDb.snapshot()`, `lab.loginVulnerable()`, `lab.loginProtected()` |
| [../js/sql/queries.js](../js/sql/queries.js) | SQL ทุกคำสั่งที่เว็บรันเอง (inspector, table guide, lab) และการต่อสตริงที่ทำให้เกิด SQL injection |
| [../js/sql/sql-worker.js](../js/sql/sql-worker.js) | SQLite (sql.js / WebAssembly) ที่รันใน Web Worker: `open`, `run`, `query`, `export` |

ลำดับการทำงาน: หน้าเว็บ → `database.js` → (postMessage) → `sql-worker.js` → SQLite → ส่งแถวกลับ
ตอนเปิดหน้า เมืองถูกสร้างจากไฟล์ `00_schema.sql` + `01_seed_data.sql` ในโฟลเดอร์นี้โดยตรง

## วิธีรัน

สร้างฐานข้อมูลแล้วลองหมวด JOIN:

```bash
cat 00_schema.sql 01_seed_data.sql 05_join.sql | sqlite3 -column -header :memory:
```

ห้องแล็บ SQL injection:

```bash
sqlite3 -column -header :memory: < 11_sql_injection_lab.sql
```

หรือเปิดไฟล์ใน DB Browser for SQLite / VS Code (SQLite extension) แล้วรันทีละคำสั่ง

> ไฟล์เหล่านี้คัดมาจาก `index.html` เพื่อใช้นำเสนอ. ถ้าแก้ SQL ในเว็บ ให้แก้ไฟล์ที่นี่ตามด้วย
