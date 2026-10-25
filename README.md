# Python SQLite Tutorial พร้อมคู่มือใช้งานทีละขั้นตอน

งานสำหรับนำเสนอวันจันทร์ที่ **2 พฤศจิกายน พ.ศ. 2569 (ค.ศ. 2026)**

โค้ดอยู่ใน `main.py` พร้อมคอมเมนต์ภาษาไทยอธิบายแนวคิด คำสั่ง SQL และการทำงานทีละส่วน ใช้ข้อมูลบุคคลจากงาน MongoDB เดิมเพื่อให้เทียบก่อนและหลังเปลี่ยนเป็น SQLite ได้

## 1. ขอบเขตและเอกสารอ้างอิงที่ใช้จริง

ตรวจเทียบกับไฟล์ที่ผู้ใช้ส่งมาทั้งสองไฟล์แล้ว:

1. `sqlite_tutorial.pdf` ของ TutorialsPoint จำนวน **29 หน้าไฟล์ PDF** เป็น ebook preview มีเนื้อหาภาพรวม การติดตั้ง คำสั่ง CLI ไวยากรณ์ และชนิดข้อมูล
2. `sqlite_installation.pdf` จำนวน **2 หน้าไฟล์ PDF** อธิบายการติดตั้งและเปิด SQLite CLI บน Windows, Linux และ macOS

หมายเลขหน้าที่ระบุด้านล่างนับจากหน้าแรกของไฟล์ PDF รวมปกและสารบัญ จึงต่างจากเลขหน้าที่พิมพ์ในหนังสือ

| เนื้อหาที่มีในไฟล์จริง | หน้าไฟล์ PDF | ส่วนที่ใช้ในงานนี้ |
| --- | --- | --- |
| Overview และประเภทคำสั่ง | Tutorial 9-11 | บท 1 และคำอธิบาย DDL/DML/DQL ด้านล่าง |
| Installation | Tutorial 12-13 และ Installation 1-2 | ขั้นตอนตรวจ Python, ตรวจ CLI และติดตั้งเครื่องมือในหัวข้อ 3-5 |
| Dot commands และจัดรูปแบบผลลัพธ์ | Tutorial 14-18 | หัวข้อ 8-10 และ `cli_practice.sql` |
| Syntax และรูปแบบคำสั่ง SQL | Tutorial 19-25 | ตัวอย่าง CRUD ใน `main.py` และแบบฝึก CLI บางคำสั่ง |
| Storage Class และ Type Affinity | Tutorial 26-28 | `demo_data_types()` และหัวข้อ 11 |
| Boolean และ Date/Time | Tutorial 28 | `demo_data_types()` และหัวข้อ 11 |

**ข้อจำกัดของไฟล์ต้นฉบับ:** สารบัญใน Tutorial แสดงบทจำนวนมากรวมถึง Python ที่เลขหน้าหนังสือ 183-190 แต่เนื้อหาเหล่านั้นไม่ได้รวมอยู่ใน PDF ที่ส่งมา หน้าไฟล์ที่ 29 ระบุว่าจบ preview ดังนั้นโค้ด Python นี้เป็นตัวอย่างที่เขียนและปรับให้รันได้ตามแนวคิด/ไวยากรณ์ที่มีจริง พร้อมคง 11 หัวข้อจากงาน MongoDB เดิม ไม่ใช่การถอดโค้ดจากบท Python ที่ขาดอยู่ และไม่ได้อ้างว่าทำทุกหัวข้อในสารบัญครบ

คำแนะนำบางส่วนใน PDF อ้างอิง SQLite รุ่นเก่า คู่มือนี้จึงตรวจวิธีใช้งานกับเอกสารทางการเพิ่มเติม ดูหัวข้อ 14 สำหรับรายละเอียดที่แก้ไข

## 2. ไฟล์ในโปรเจกต์

```text
python-sqlite-tutorial/
├── main.py                  โค้ด Python พร้อมคอมเมนต์ภาษาไทย
├── README.md                คู่มือนี้
├── tutorial.db              ฐานข้อมูลตัวอย่าง สร้างใหม่ได้เมื่อรัน main.py
├── example_output.txt       ผลจากการรัน main.py จริง
├── cli_practice.sql         แบบฝึกอ่านข้อมูลผ่าน SQLite CLI
├── cli_example_output.txt   ผลจากการรันแบบฝึก CLI จริง
└── .vscode/
    └── settings.json        ตั้งโฟลเดอร์ทำงานของ Python Terminal
```

ไม่ต้องใช้ `requirements.txt` เพราะโค้ดใช้ `sqlite3` และ `pathlib` จาก Python รุ่นทั่วไป ไม่ต้องติดตั้ง `pymongo` หรือเปิด Docker/MongoDB Server

`sqlite3` เป็นโมดูลเสริมของ CPython ที่ชุดติดตั้งทั่วไปมีมาให้ ถ้าทดสอบ import แล้วไม่พบ ต้องใช้ชุดติดตั้ง Python ที่มีโมดูลนี้ ไม่ใช่สั่ง `pip install sqlite3`

## 3. สิ่งที่ต้องแยกให้ออกก่อนเริ่ม

| สิ่งที่ใช้ | หน้าที่ | ต้องใช้เมื่อใด |
| --- | --- | --- |
| Python + โมดูล `sqlite3` | รันโค้ดใน `main.py` เพื่อสั่ง SQLite engine | จำเป็นสำหรับเดโม Python |
| โปรแกรม `sqlite3` หรือ `sqlite3.exe` | พิมพ์ SQL และ dot commands ผ่าน Terminal | ใช้เมื่อฝึก CLI ตาม PDF |
| VS Code | เปิดโค้ด อ่านคอมเมนต์ และเรียก Terminal | ใช้เป็นเครื่องมือเขียนโค้ด |
| ไฟล์ `tutorial.db` | เก็บตารางและข้อมูล | Python และ CLI เปิดไฟล์เดียวกันได้ |

Python ใช้งาน SQLite ได้แม้ยังไม่มีโปรแกรม CLI ใน PATH และ CLI ที่ติดตั้งแยกอาจใช้ SQLite คนละเวอร์ชันกับที่ Python ใช้

## 4. เริ่มต้นบน macOS เครื่องนี้

### 4.1 เปิดโฟลเดอร์ให้ถูกต้อง

ใน VS Code เลือก **File > Open Folder...** แล้วเลือกโฟลเดอร์ `python-sqlite-tutorial` ที่ได้จากงานนี้ จากนั้นเลือก **Terminal > New Terminal**

ตำแหน่งบนเครื่องนี้คือ:

```text
/Users/jitwisutthobut/Documents/Codex/2026-10-25/s/outputs/python-sqlite-tutorial
```

ถ้าเปิด Terminal แยกเอง ให้เข้าโฟลเดอร์ด้วยคำสั่ง:

```bash
cd "/Users/jitwisutthobut/Documents/Codex/2026-10-25/s/outputs/python-sqlite-tutorial"
```

ถ้าย้ายหรือแตก ZIP ไว้ที่อื่น ให้ใช้ตำแหน่งใหม่แทน ไม่ต้องแก้ `DB_PATH` ในโค้ด เพราะโปรแกรมหาฐานข้อมูลจากตำแหน่ง `main.py`

### 4.2 ตรวจ Python

```bash
python3 --version
python3 -c "import sqlite3; print('SQLite engine:', sqlite3.sqlite_version)"
```

คำสั่งแรกควรแสดง Python 3 ส่วนคำสั่งที่สองควรแสดงเวอร์ชัน SQLite โดยไม่เกิด error ตัวเลขเวอร์ชันไม่จำเป็นต้องตรงกับใน PDF

ถ้าไม่พบ `python3` ให้ติดตั้ง Python 3 จาก [python.org](https://www.python.org/downloads/) แล้วเปิด Terminal ใหม่ก่อนตรวจอีกครั้ง

### 4.3 ตรวจ SQLite CLI ตามไฟล์ Installation

```bash
sqlite3 --version
```

ถ้าแสดงเวอร์ชัน แปลว่าใช้ CLI ได้แล้ว ถ้าไม่พบคำสั่ง ยังสามารถรัน `main.py` ได้เมื่อขั้นตอน 4.2 ผ่าน

หากต้องการติดตั้ง CLI เพิ่ม ให้ใช้เครื่องมือจาก [SQLite Download](https://www.sqlite.org/download.html) เลือกส่วน Mac OS X ที่ตรงกับเครื่อง ARM64 หรือ x64 และทำตามคำแนะนำของผู้จัดทำ ไม่ต้องดาวน์โหลดเวอร์ชัน 3.7.15.2 ตามตัวอย่างเก่าใน PDF

### 4.4 เลือก Python ใน VS Code

1. เปิด `main.py`
2. ถ้า VS Code ยังไม่มีคำสั่ง Python ให้ติดตั้งส่วนขยาย **Python ของ Microsoft** ผ่านหน้า Extensions
3. กด `Cmd+Shift+P` แล้วเลือก **Python: Select Interpreter**
4. เลือก Python 3 ที่ตรวจแล้วว่า `import sqlite3` ได้
5. เปิด Terminal ใหม่ จากนั้นรันตามหัวข้อ 6

ไม่จำเป็นต้องสร้าง virtual environment สำหรับโปรเจกต์นี้ เพราะไม่มีแพ็กเกจจาก pip แต่หากใช้ environment ส่วนตัว ให้ตรวจ `import sqlite3` ใน interpreter ตัวนั้นด้วย

## 5. หากนำไปใช้บน Windows หรือ Linux

### Windows: เดโม Python

1. ติดตั้ง Python 3 จากเว็บไซต์ทางการ หากยังไม่มี
2. แตก ZIP แล้วเปิดโฟลเดอร์โปรเจกต์ใน VS Code
3. เปิด Terminal ในโฟลเดอร์นั้น ตรวจและรัน:

```powershell
py --version
py -c "import sqlite3; print(sqlite3.sqlite_version)"
py main.py
```

หากไม่มีคำสั่ง `py` แต่ใช้ `python` ได้ ให้ใช้ `python` แทนในทุกบรรทัด

### Windows: เพิ่ม CLI เพื่อฝึกตาม PDF

1. เปิด [SQLite Download](https://www.sqlite.org/download.html)
2. เลือกชุด **sqlite-tools-win-...zip** ในส่วน Windows ให้ตรงกับสถาปัตยกรรม เช่น x64 หรือ ARM64 ชุดนี้มี command-line shell
3. แตกไฟล์ไว้ในโฟลเดอร์ เช่น `C:\sqlite` ตรวจว่ามี `sqlite3.exe`
4. เปิด Start แล้วค้นหา **Edit environment variables for your account**
5. ใน User variables เลือก `Path` > **Edit** > **New** แล้วใส่ `C:\sqlite`
6. กด OK เพื่อบันทึก แล้วปิด/เปิด Terminal ใหม่
7. ทดสอบด้วย `sqlite3 --version`

หากยังไม่เพิ่ม PATH สามารถเรียกจากตำแหน่งเต็มใน PowerShell เช่น:

```powershell
& "C:\sqlite\sqlite3.exe" --version
```

สำหรับการใช้ CLI ให้เลือกชุด tools ไม่ใช่ดาวน์โหลดเฉพาะ DLL ตามชื่อแพ็กเกจเก่าใน PDF และไม่ต้องนำ DLL ไปแทนไฟล์ของ Python

### Linux

ตรวจด้วย `python3 --version`, `python3 -c "import sqlite3; print(sqlite3.sqlite_version)"` และ `sqlite3 --version` ก่อน หากขาดโปรแกรมให้ติดตั้ง Python/SQLite CLI ผ่าน package manager ของดิสโทรที่ใช้ แล้วเปิดโปรเจกต์และรัน:

```bash
python3 main.py
```

PDF อธิบายการ compile จาก source ด้วย `configure` และ `make` ซึ่งเป็นอีกวิธีหนึ่ง แต่ไม่จำเป็นสำหรับเดโมนี้เมื่อเครื่องมี Python พร้อมโมดูล SQLite อยู่แล้ว

## 6. รันเดโม Python และตรวจผล

จาก Terminal ในโฟลเดอร์โปรเจกต์:

```bash
python3 main.py
```

ลำดับการทำงาน:

1. แสดงเวอร์ชัน SQLite engine ที่ Python ใช้
2. เชื่อมต่อ `tutorial.db` ถ้ายังไม่มีไฟล์จะสร้างให้
3. แสดงบทเสริมชนิดข้อมูลตาม PDF
4. สร้างตาราง `people` แล้วรันตัวอย่างครบ 11 หัวข้อเดิม
5. แสดงข้อความ `รันตัวอย่างครบทั้ง 11 บทแล้ว` พร้อมตำแหน่งฐานข้อมูล
6. ปิด connection และเก็บข้อมูลตัวอย่าง 6 คนไว้ให้เปิดตรวจต่อ

รันซ้ำได้ด้วยคำสั่งเดิม โค้ดจะจัดข้อมูลเดโมใน `people` ใหม่ก่อนตัวอย่างที่ต้องเริ่มจากชุดข้อมูลเดิม ดังนั้น **อย่าเก็บข้อมูลจริงในตารางนี้** โปรแกรมไม่ได้ลบไฟล์ฐานข้อมูลทั้งไฟล์

`example_output.txt` มีผลจากการรันจริง ใช้เทียบชื่อคน จำนวนแถว และค่าที่ได้ ตัวเลขเวอร์ชันและตำแหน่งไฟล์อาจต่างกันตามเครื่อง

## 7. อธิบายโค้ดครบ 11 หัวข้อ

### บท 1: Introduction

`ch01_introduction()` อธิบายว่า SQLite ทำงานภายในโปรแกรมและเข้าถึงไฟล์โดยตรง จึงไม่มีขั้นตอนเชื่อมต่อ MongoDB Server

### บท 2: Create Database

`ch02_create_database()` ใช้ `sqlite3.connect()` เพื่อเปิดไฟล์ แล้วตั้ง `row_factory = sqlite3.Row` เพื่ออ่านค่าตามชื่อคอลัมน์ได้ จากนั้นใช้ `PRAGMA database_list` ดูฐานข้อมูลที่ connection นี้เชื่อมต่อ

`DB_PATH` อ้างอิงโฟลเดอร์ของ `main.py` จึงไม่สร้างฐานข้อมูลผิดที่เมื่อสั่งรันจากโฟลเดอร์อื่น

### บท 3: Create Table

`ch03_create_table()` สร้างตารางด้วย:

```sql
CREATE TABLE IF NOT EXISTS people (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 0),
    city TEXT NOT NULL
);
```

`id` เป็นรหัสข้อความที่ไม่ซ้ำ `NOT NULL` ห้ามค่า SQL NULL ส่วน `CHECK` ตรวจเงื่อนไขอายุไม่ติดลบ คำว่า `IF NOT EXISTS` ป้องกัน error เมื่อตารางมีแล้ว แต่ไม่แก้ schema ของตารางเก่าให้อัตโนมัติ ตารางนี้เป็นตารางธรรมดาที่ใช้ type affinity ไม่ได้ประกาศ `STRICT`

### บท 4: Insert

`ch04_insert_one()` ใช้ `execute()` เพิ่มหนึ่งแถว ส่วน `ch04_insert_many()` ใช้ `executemany()` ส่ง SQL เดียวกับ tuple หลายชุด

```python
with conn:
    conn.execute(
        "INSERT INTO people (id, name, age, city) VALUES (?, ?, ?, ?)",
        ("100", "Ram", 26, "Hyderabad"),
    )
```

เครื่องหมาย `?` คือ placeholder สำหรับค่าข้อมูล ส่งค่าตามลำดับแยกจาก SQL เพื่อไม่ต้องต่อข้อความผู้ใช้เข้าไปในคำสั่ง ใช้แทนชื่อตาราง/คอลัมน์ไม่ได้

### บท 5: Find เปลี่ยนเป็น SELECT

`ch05_find_one()` ใช้ `fetchone()` อ่านหนึ่งแถว ถ้าไม่พบจะได้ `None` ส่วน `ch05_find()` ใช้ `fetchall()` อ่านผลที่เหลือทั้งหมดเป็น list

```python
row = conn.execute(
    "SELECT * FROM people WHERE id = ?", ("103",)
).fetchone()
```

`("103",)` มี comma เพื่อให้เป็น tuple หนึ่งสมาชิก ถ้าเขียน `("103")` จะยังเป็น string

### บท 6: Query ด้วย WHERE

`ch06_query_equal()` ค้นชื่อ Sarmista และ `ch06_query_gt()` ค้นอายุมากกว่า 26:

```sql
SELECT * FROM people WHERE name = 'Sarmista' ORDER BY id;
SELECT * FROM people WHERE age > 26 ORDER BY id;
```

ตัวอย่าง SQL ในคู่มือนี้ใช้ค่าคงที่เพื่อพิมพ์ใน CLI ส่วนโค้ด Python ใช้ placeholder

### บท 7: Sort

`ch07_sort()` ใช้ `ORDER BY age ASC, id ASC` เรียงอายุน้อยไปมาก ถ้าอายุเท่ากันให้เรียงรหัสเป็นลำดับรอง หากต้องการอายุมากไปน้อย ใช้ `DESC`

### บท 8: Delete

`ch08_delete_one()` ใช้ `WHERE id = ?` บน PRIMARY KEY จึงลบได้ไม่เกินหนึ่งแถว ส่วน `ch08_delete_many()` ใช้เงื่อนไขอายุเพื่อลบหลายแถว แล้วสาธิต `DELETE FROM people` ซึ่งลบทุกแถวแต่เก็บตารางไว้

SQL ไม่มีข้อจำกัดว่าจะลบเพียงหนึ่งแถวหาก WHERE ตรงหลายแถว จึงต้องเลือกเงื่อนไขที่เหมาะสม

### บท 9: Drop Table

`ch09_drop_table()` สร้าง `demo_collection` และ `demo_data` แล้วลบทิ้งด้วย `DROP TABLE` เพื่อสาธิตการลบโครงสร้างตาราง ใช้ `sqlite_master` แสดงรายการก่อนและหลัง และเก็บ `people` ไว้ใช้ต่อ

### บท 10: Update

`ch10_update_one()` เปลี่ยนเมืองเฉพาะ id 102 ส่วน `ch10_update_many()` แก้เมืองของทุกแถวในชุดตัวอย่าง

```sql
UPDATE people SET city = 'Visakhapatnam' WHERE id = '102';
```

คำสั่งนี้เป็นตัวอย่างรูปแบบ SQL เท่านั้น หลังรัน main จบ รหัสในฐานข้อมูลเป็นชุด 1001-1006 จึงไม่มี id 102 แล้ว หากจะลองกับข้อมูลหลังรัน ให้ใช้ id 1002 และครอบ transaction ตามหัวข้อ 9

### บท 11: Limit

`ch11_limit()` ใช้ `ORDER BY id ASC LIMIT ?` เพื่ออ่าน 3 คนแรกตามรหัส `LIMIT` จำกัดจำนวน ส่วน `ORDER BY` กำหนดว่าแถวใดมาก่อน ไม่มี `ORDER BY` จะไม่รับประกันลำดับ

### ผลลัพธ์ที่ควรได้ในแต่ละตัวอย่าง

| ตัวอย่าง | ผลลัพธ์สำคัญ |
| --- | --- |
| Insert one / many | เพิ่ม 1 และ 3 แถว รวม 4 แถวในช่วงนี้ |
| Query name = Sarmista | Sarmista อายุ 23 เมือง Delhi |
| Query age > 26 | Rahim อายุ 27 และ Robert อายุ 28 |
| Sort age ASC | อายุ 23, 25, 26, 26, 27, 28 |
| Delete id = 1006 | ลบ 1 แถว เหลือ 5 |
| Delete age > 26 | ลบ 2 แถว เหลือ 4 ก่อนสาธิตลบทุกแถว |
| Delete ไม่มี WHERE | เหลือ 0 แถว แต่ตารางยังอยู่ |
| Update id = 102 | เมืองของ Rahim เปลี่ยนเป็น Visakhapatnam |
| Update ไม่มี WHERE | เปลี่ยนเมืองของทั้ง 3 คนในชุดตัวอย่าง |
| Limit 3 | Ram, Rahim, Robert ตาม id 1001, 1002, 1003 |

แต่ละตัวอย่างมีการเตรียมข้อมูลตามชุดที่ต้องใช้ รหัสชุด 101-103 และ 1001-1006 จึงไม่ได้อยู่พร้อมกันเสมอ ดู `reset_people()` ในคอมเมนต์เพื่ออธิบายการจัดข้อมูลเดโม

## 8. ฝึก SQLite CLI ตาม PDF

ทำหลัง `main.py` รันสำเร็จแล้ว เปิด Terminal ในโฟลเดอร์โปรเจกต์ และพิมพ์:

```bash
sqlite3 tutorial.db
```

จะเข้าสู่ prompt ของ SQLite จากนั้นพิมพ์คำสั่งต่อไปนี้ทีละบรรทัด **ไม่ต้องพิมพ์คำว่า sqlite> ตามไปด้วย**

```text
.help
.databases
.tables
.schema people
.headers on
.mode column
```

แล้วลอง SQL:

```sql
SELECT id, name, age, city FROM people ORDER BY id;
SELECT name, age FROM people WHERE age > 26 ORDER BY id;
SELECT name, age FROM people ORDER BY age, id LIMIT 3;
```

- `.help` แสดงวิธีใช้ CLI
- `.databases` แสดงไฟล์ที่ connection นี้เปิดอยู่
- `.tables` แสดงชื่อตาราง
- `.schema people` แสดง SQL ที่ใช้สร้างตาราง
- `.headers on` เปิดชื่อคอลัมน์ และ `.mode column` จัดผลเป็นคอลัมน์
- SQL ใน CLI จบด้วย `;` ส่วน dot commands ขึ้นต้นด้วย `.` และไม่ใส่ `;`

dot commands เป็นคำสั่งของโปรแกรม CLI ไม่ใช่ SQL จึงส่ง `.tables` หรือ `.read` เข้า `conn.execute()` ไม่ได้ ใน Python ให้ใช้ SQL เช่น `SELECT name FROM sqlite_master WHERE type = 'table'` แทน

ออกจาก CLI ด้วย:

```text
.quit
```

ถ้า prompt รอคำสั่งต่อเพราะลืม `;` ให้พิมพ์ `;` แล้ว Enter เพื่อจบ SQL ก่อน

### รันแบบฝึกที่จัดไว้ให้

หลังเปิด `sqlite3 tutorial.db` แล้วพิมพ์:

```text
.read cli_practice.sql
```

ไฟล์นี้สาธิต dot commands, WHERE, AND, BETWEEN, IN, LIKE, ORDER BY, LIMIT, GROUP BY, HAVING และ PRAGMA ด้วยข้อมูลที่มีอยู่ อ่านข้อมูลอย่างเดียว และจบด้วยจำนวนคน 6 แถว ใช้ `cli_example_output.txt` เทียบผลได้

## 9. ฝึก UPDATE / DELETE ด้วย transaction

หลังรัน `main.py` จบแล้ว ให้เปิด `sqlite3 tutorial.db` ตามหัวข้อ 8 จากนั้นลองเปลี่ยนข้อมูลชั่วคราว:

```sql
BEGIN;
UPDATE people SET city = 'Bangkok' WHERE id = '1002';
SELECT id, name, city FROM people WHERE id = '1002';
ROLLBACK;
SELECT id, name, city FROM people WHERE id = '1002';
```

ระหว่าง transaction จะเห็นเมือง Bangkok แต่หลัง `ROLLBACK` จะกลับเป็น Bangalore เหมือนก่อนแก้ไข

ลองลบแล้วคืนกลับ:

```sql
BEGIN;
DELETE FROM people WHERE age > 26;
SELECT COUNT(*) AS total_people FROM people;
ROLLBACK;
SELECT COUNT(*) AS total_people FROM people;
```

จำนวนจะเป็น 4 แล้วกลับเป็น 6 หากต้องการยืนยันการเปลี่ยนแปลงจริง ให้ใช้ `COMMIT` แทน `ROLLBACK`

ใน Python โค้ดนี้เลือก `isolation_level="DEFERRED"` เมื่อมี INSERT/UPDATE/DELETE จะเริ่ม transaction ตามรูปแบบของโมดูล การใช้ `with conn:` จะ commit เมื่อจบปกติ และ rollback transaction เมื่อมีข้อผิดพลาดหลุดออกจากบล็อก โดย **ไม่ได้ปิด connection** จึงมี `conn.close()` ใน `finally` แยกอีกขั้น

## 10. สำรองข้อมูลและ export SQL ผ่าน CLI

เมื่ออยู่ใน `sqlite3 tutorial.db` สามารถสำรองไฟล์ได้ด้วย:

```text
.backup tutorial_backup.db
```

หากต้องการ export เป็นไฟล์ SQL ที่อ่านได้:

```text
.output tutorial_dump.sql
.dump
.output stdout
```

`.output stdout` เปลี่ยนผลลัพธ์กลับมาแสดงบนหน้าจอ หากลืมคำสั่งนี้ ผลลัพธ์ต่อไปจะยังเขียนลงไฟล์

ไฟล์สำรองเหล่านี้จะสร้างใน working directory ของ CLI ควรอยู่ในโฟลเดอร์โปรเจกต์ตามขั้นตอนก่อนหน้า อย่าสั่ง `.read tutorial_dump.sql` ทับฐานข้อมูลที่มีตารางชื่อเดิมอยู่แล้ว หากต้องการคืนข้อมูลให้เปิดฐานข้อมูลปลายทางใหม่ที่ยังว่างก่อน

## 11. ชนิดข้อมูลตาม PDF

`demo_data_types()` สร้างตาราง TEMP เพื่อสาธิต แล้ว SQLite จะลบตาราง TEMP เมื่อปิด connection จึงไม่เพิ่มตารางถาวรใน `tutorial.db`

| ค่า Python | Storage Class ใน SQLite | ค่า typeof ที่เห็น |
| --- | --- | --- |
| `None` | NULL | `null` |
| `42` | INTEGER | `integer` |
| `3.5` | REAL | `real` |
| `"SQLite"` | TEXT | `text` |
| `b"\x01\x02"` | BLOB | `blob` |

**Type Affinity:** คอลัมน์ INTEGER ที่รับข้อความ `"26"` จะแปลงเป็นเลขได้ ส่วนคอลัมน์ TEXT ที่รับเลข `26` จะแปลงเป็นข้อความ อย่าสับสน affinity กับการบังคับชนิดเข้มงวดทุกกรณี ดูค่าจริงด้วย `typeof()`

**Boolean:** ตัวอย่างส่ง Python `True` และ `False` ซึ่งได้ INTEGER 1 และ 0 ไม่ได้มี storage class Boolean แยก

**วันที่:** ตัวอย่างใช้ TEXT แบบ `YYYY-MM-DD` สำหรับวันนำเสนอเป็น `2026-11-02` โดยเก็บปี ค.ศ. ไม่ใช้ `2569-11-02` SQLite ยังรองรับวิธีแทนวันเวลาเป็นเลข REAL หรือ INTEGER ตามบริบทที่เลือก

**ประเภทคำสั่งใน PDF:** DDL ใช้กำหนดโครงสร้าง เช่น CREATE/ALTER/DROP, DML เปลี่ยนข้อมูล เช่น INSERT/UPDATE/DELETE และ DQL อ่านข้อมูลด้วย SELECT

## 12. แนวทางใช้ประกอบการนำเสนอ

1. อธิบายว่าเปลี่ยนจาก MongoDB document/collection มาเป็น SQLite row/table และใช้ไฟล์ฐานข้อมูล
2. แสดงขั้นตอนตรวจ Python และ `import sqlite3` ให้เห็นว่าเดโมพร้อมทำงาน
3. เปิด `main.py` อธิบาย DB_PATH, schema, placeholder และการยืนยัน transaction
4. รันทั้งไฟล์ แล้วชี้ผล Query, Sort, Update, Delete และ Limit
5. เปิด `tutorial.db` ผ่าน CLI แสดง `.tables`, `.schema people` และ SELECT
6. หากต้องอธิบายตาม PDF เพิ่ม ให้แสดง `demo_data_types()` และ `.read cli_practice.sql`

ไม่มีการกำหนดเวลานำเสนอหรือชื่อผู้เสนอในโค้ด เพราะยังไม่ได้รับข้อมูลส่วนนี้

## 13. แก้ปัญหาที่พบบ่อย

| อาการ | วิธีตรวจและแก้ |
| --- | --- |
| `python3: command not found` | ติดตั้ง Python 3 และเปิด Terminal ใหม่ บน Windows ลอง `py` |
| `No module named sqlite3` หรือ `_sqlite3` | ตรวจ interpreter ที่เลือก ใช้ชุดติดตั้ง Python ที่มี SQLite support ไม่ใช่ pip install sqlite3 |
| `sqlite3: command not found` | ขาด CLI หรือยังไม่มีใน PATH แต่ Python เดโมยังรันได้ถ้า import ผ่าน |
| `can't open file main.py` | เปิด Terminal ในโฟลเดอร์ผิด ให้ cd ไปโฟลเดอร์โปรเจกต์ |
| `no such table: people` | รัน main.py ให้จบก่อน และใช้ `.databases` ตรวจว่า CLI เปิด tutorial.db ถูกไฟล์ |
| `.tables` ไม่แสดงตาราง | อาจเปิดฐานข้อมูลใหม่ผิดที่ เพราะ sqlite3 สร้างไฟล์ใหม่ได้เมื่อสะกดชื่อ/path ผิด |
| `UNIQUE constraint failed: people.id` | เพิ่ม id ซ้ำ ให้ใช้ id ใหม่ หรือรัน main.py เพื่อเตรียมชุดเดโมใหม่ |
| `database is locked` | จบ transaction ด้วย COMMIT/ROLLBACK และปิด connection ที่ค้างก่อนลองอีกครั้ง |
| `.read cli_practice.sql` หาไฟล์ไม่เจอ | เริ่ม CLI จากโฟลเดอร์โปรเจกต์ หรือส่ง path ของไฟล์ที่ถูกต้องให้ .read |
| `.tables` ใช้ใน Python แล้ว syntax error | dot command ใช้เฉพาะ CLI ให้ใช้ SELECT จาก sqlite_master ใน Python |
| ผลลัพธ์ไม่เหมือนรอบก่อน | รัน main.py ใหม่ให้จบเพื่อจัดข้อมูลเดโมกลับมา และตรวจ ORDER BY |
| รหัส 102 หาไม่เจอหลังจบเดโม | สถานะสุดท้ายใช้ชุด 1001-1006 ดูคำอธิบายในหัวข้อ 7 |

## 14. จุดที่ปรับจากเอกสารเก่าและแหล่งตรวจสอบ

- **Installation:** PDF ยกตัวอย่าง 3.7.15.2 และชื่อแพ็กเกจเก่า คู่มือนี้ให้เลือก CLI tools ที่ตรงระบบจาก [SQLite Download](https://www.sqlite.org/download.html) โดยไม่บังคับเลขเวอร์ชันเก่า
- **Python กับ CLI:** แยกขั้นตอนให้ชัดเจนตาม [เอกสาร Python sqlite3](https://docs.python.org/3/library/sqlite3.html) และ [SQLite CLI](https://www.sqlite.org/cli.html) เพราะการมีโมดูล Python ไม่ได้แปลว่ามีคำสั่ง sqlite3 ใน PATH
- **คำสั่ง DROP ใน Tutorial หน้าไฟล์ 22:** ตัวอย่างใต้หัวข้อ DROP VIEW และ DROP TRIGGER พิมพ์เป็น DROP INDEX ซึ่งผิดประเภท คำสั่งที่ถูกคือ `DROP VIEW view_name;` และ `DROP TRIGGER trigger_name;` ดู [DROP VIEW](https://www.sqlite.org/lang_dropview.html) และ [DROP TRIGGER](https://www.sqlite.org/lang_droptrigger.html) งานหลักนี้ใช้ DROP TABLE
- **ข้อจำกัดใน Tutorial หน้าไฟล์ 10:** ข้อความว่าไม่รองรับ RIGHT/FULL OUTER JOIN และ DROP COLUMN เป็นข้อมูลตามรุ่นเก่า SQLite เพิ่ม RIGHT/FULL OUTER JOIN ใน 3.39.0 และ DROP COLUMN ใน 3.35.0 ดู [Release History](https://www.sqlite.org/changes.html) เดโมนี้ไม่ได้ใช้คุณสมบัติเหล่านั้น
- **Affinity:** PDF ใช้ชื่อ NONE สำหรับ affinity ที่ไม่พยายามแปลงชนิด ปัจจุบันเอกสารทางการเรียก BLOB affinity ดู [Datatypes in SQLite](https://www.sqlite.org/datatype3.html)
- **ข้อมูลตัวอย่าง:** งานนี้คงชื่อและเมืองจากโค้ด MongoDB เดิม ไม่ได้คัดลอกชุด COMPANY ใน PDF และปรับอายุทุกแถวเป็น int เพื่อเปรียบเทียบตัวเลขให้สม่ำเสมอ

เอกสารเพิ่มเติม: [SQLite SQL Language](https://www.sqlite.org/lang.html) และ [CREATE TABLE](https://www.sqlite.org/lang_createtable.html)
