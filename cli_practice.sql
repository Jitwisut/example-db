-- แบบฝึก SQLite CLI ตามส่วน Commands และ Syntax ของเอกสาร
-- รัน python3 main.py ให้สร้าง tutorial.db ก่อน
-- จาก Terminal ในโฟลเดอร์นี้ เปิด sqlite3 tutorial.db แล้วสั่ง:
-- .read cli_practice.sql
-- ไฟล์นี้มี dot commands จึงใช้ conn.execute() หรือ executescript() ไม่ได้
-- ทุก SELECT ด้านล่างอ่านข้อมูลอย่างเดียว ไม่แก้ไขตาราง people

.bail on
.headers on
.mode column
.print '=== Connected databases ==='
.databases
.print '=== Tables ==='
.tables
.print '=== Schema of people ==='
.schema people

-- SQL จบด้วย ; แต่ dot command ข้างบนไม่ใส่ ;
/* บล็อกคอมเมนต์ SQL หลายบรรทัดใช้รูปแบบนี้ */
.print '=== All people ==='
SELECT id, name, age, city FROM people ORDER BY id;

.print '=== WHERE with AND, BETWEEN and IN ==='
SELECT name, age FROM people
WHERE age BETWEEN 25 AND 27 AND city IN ('Hyderabad', 'Bangalore', 'Chennai')
ORDER BY id;

.print '=== LIKE, ORDER BY and LIMIT ==='
SELECT name, age FROM people WHERE name LIKE 'Ra%' ORDER BY age, id LIMIT 3;

.print '=== GROUP BY and HAVING ==='
SELECT age, COUNT(*) AS people_count FROM people
GROUP BY age HAVING COUNT(*) > 1 ORDER BY age;

.print '=== Storage classes ==='
SELECT typeof(NULL) AS a, typeof(42) AS b, typeof(3.5) AS c,
       typeof('SQLite') AS d, typeof(X'0102') AS e;

.print '=== PRAGMA table_info ==='
PRAGMA table_info(people);
.print '=== Finished: people still has 6 rows ==='
SELECT COUNT(*) AS total_people FROM people;
