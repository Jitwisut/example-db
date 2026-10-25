"""Python SQLite Tutorial พร้อมคำอธิบายภาษาไทยสำหรับอ่านและนำเสนอ

วันนำเสนอ: วันจันทร์ที่ 2 พฤศจิกายน พ.ศ. 2569 (ค.ศ. 2026)
วิธีรัน: python3 main.py

ปรับจากงาน Python MongoDB เดิม โดยคงหัวข้อเดิมครบ 11 บท
ตรวจเทียบ sqlite_tutorial.pdf และ sqlite_installation.pdf แล้ว
เพิ่มบทเสริมชนิดข้อมูลตาม Tutorial หน้าไฟล์ PDF 26-28
ขั้นตอนติดตั้งและ dot commands ของ SQLite CLI อธิบายไว้ใน README.md
หมายเหตุ: Tutorial ที่ได้รับเป็น preview 29 หน้า ไม่ได้มีบท Python ฉบับเต็ม
ใช้ sqlite3 ซึ่งมากับ Python รุ่นทั่วไป จึงไม่ต้อง pip install pymongo
และไม่ต้องเปิด Docker หรือ MongoDB Server

แนวคิดที่เปลี่ยน:
    MongoDB database    -> ไฟล์ tutorial.db ของ SQLite
    collection          -> table (ตาราง)
    document            -> row (แถว)
    field               -> column (คอลัมน์)
    _id                 -> id ที่ประกาศเป็น PRIMARY KEY
    คำสั่งผ่าน pymongo  -> คำสั่ง SQL ผ่าน sqlite3

โปรแกรมนี้เป็นเดโม: แต่ละตัวอย่างจะจัดข้อมูลเริ่มต้นในตาราง people ใหม่
เพื่อให้รันซ้ำได้และให้ผลเหมือนเดิม ห้ามนำข้อมูลจริงมาเก็บในตารางเดโมนี้
โปรแกรมจะลบเฉพาะข้อมูลใน people และตารางทดลองของบท 9 ที่ระบุไว้ในโค้ด
ไม่ได้ลบไฟล์ฐานข้อมูลทั้งไฟล์

อ้างอิง API: https://docs.python.org/3/library/sqlite3.html
อ้างอิง SQL: https://www.sqlite.org/lang.html
"""

# sqlite3 เป็นโมดูลสำหรับติดต่อ SQLite จาก Python
# Path ใช้ประกอบตำแหน่งไฟล์ให้ทำงานได้ทั้ง macOS, Windows และ Linux
import sqlite3
from pathlib import Path


# __file__ คือตำแหน่งไฟล์ main.py ส่วน .parent คือโฟลเดอร์ที่ไฟล์นี้อยู่
# จึงได้ tutorial.db อยู่ข้าง main.py เสมอ แม้สั่งรันจากโฟลเดอร์อื่น
# ถ้าใช้เพียง "tutorial.db" ไฟล์จะไปอยู่ใน working directory ของ Terminal
DB_PATH = Path(__file__).resolve().parent / "tutorial.db"

# ใช้ชื่อและเมืองจากตัวอย่างเดิม แต่เปลี่ยนอายุทุกค่าเป็น int
# เพื่อให้เปรียบเทียบและเรียงตามค่าตัวเลขได้อย่างสม่ำเสมอ
# เก็บ id เป็นข้อความเหมือน _id ของเดิม เช่น "101" และ "1001"
# แต่ละ tuple มีลำดับ (id, name, age, city) ตรงกับคอลัมน์ตอน INSERT
PEOPLE_THREE = (
    ("101", "Ram", 26, "Hyderabad"),
    ("102", "Rahim", 27, "Bangalore"),
    ("103", "Robert", 28, "Mumbai"),
)

PEOPLE_SIX = (
    ("1001", "Ram", 26, "Hyderabad"),
    ("1002", "Rahim", 27, "Bangalore"),
    ("1003", "Robert", 28, "Mumbai"),
    ("1004", "Romeo", 25, "Pune"),
    ("1005", "Sarmista", 23, "Delhi"),
    ("1006", "Rasajna", 26, "Chennai"),
)

# ? เป็น placeholder สำหรับ "ค่าข้อมูล" ให้ sqlite3 จัดการการส่งค่า
# ห้ามต่อข้อมูลจากผู้ใช้เข้า SQL ด้วย f-string หรือเครื่องหมาย +
# placeholder ใช้แทนชื่อตารางหรือชื่อคอลัมน์ไม่ได้
INSERT_PERSON = "INSERT INTO people (id, name, age, city) VALUES (?, ?, ?, ?)"


def banner(title):
    """แสดงหัวข้อเพื่อแยกผลลัพธ์แต่ละตัวอย่างใน Terminal"""
    print("\n" + "=" * 72)
    print(title)
    print("=" * 72)


def show_rows(rows):
    """แปลง sqlite3.Row เป็น dict เพื่อให้เห็นทั้งชื่อคอลัมน์และค่าข้อมูล"""
    # เพราะตั้ง conn.row_factory = sqlite3.Row ไว้ จึงแปลงเป็น dict ได้
    # ถ้าไม่ตั้ง row_factory ผลลัพธ์แต่ละแถวจะเป็น tuple ตามค่าเริ่มต้น
    if not rows:
        print("(ไม่พบข้อมูล)")
    for row in rows:
        print(dict(row))


def reset_people(conn, rows=PEOPLE_SIX):
    """เตรียมข้อมูลเดโมใหม่ก่อนตัวอย่างที่ต้องเริ่มจากข้อมูลชุดเดิม"""
    # ฟังก์ชันนี้เป็นส่วนเตรียมเดโม ไม่ใช่ข้อบังคับของ SQLite
    # DELETE ไม่มี WHERE จึงลบทุกแถวใน people แต่โครงสร้างตารางยังอยู่
    # executemany ใช้ SQL เดียวกันกับ tuple แต่ละชุดใน rows
    # with conn จะ commit เมื่อจบบล็อกโดยไม่มีข้อผิดพลาด
    # หากเกิดข้อผิดพลาดใน transaction จะ rollback แทน
    with conn:
        conn.execute("DELETE FROM people")
        conn.executemany(INSERT_PERSON, rows)


# ---------------------------------------------------------------------------
# บท 1: Introduction
# ---------------------------------------------------------------------------
def ch01_introduction():
    banner("1. Introduction: Python กับ SQLite")
    # SQLite ทำงานในโปรเซสของโปรแกรมและบันทึกข้อมูลลงไฟล์
    # ต่างจากเดิมที่ MongoClient เชื่อมต่อ MongoDB Server ที่ port 27017
    # sqlite_version คือเวอร์ชัน SQLite engine ที่ Python นี้ใช้งานจริง
    print("SQLite engine version:", sqlite3.sqlite_version)
    print("ใช้ import sqlite3 และเก็บข้อมูลในไฟล์ tutorial.db")


# ---------------------------------------------------------------------------
# บท 2: Create Database
# ---------------------------------------------------------------------------
def ch02_create_database(db_path):
    banner("2. Create Database: เชื่อมต่อไฟล์ฐานข้อมูล")
    # connect เปิดฐานข้อมูลเดิม ถ้ายังไม่มีไฟล์ก็จะสร้างไฟล์ให้
    # ในตัวอย่างนี้ parent directory มีอยู่แล้ว ไม่ต้องสร้างโฟลเดอร์เพิ่ม
    # isolation_level="DEFERRED" ระบุรูปแบบ transaction อย่างชัดเจน
    # เมื่อเริ่ม INSERT / UPDATE / DELETE จะเปิด transaction อัตโนมัติ
    # จึงต้อง commit หรือใช้ with conn เพื่อยืนยันการเปลี่ยนแปลง
    conn = sqlite3.connect(str(db_path), isolation_level="DEFERRED")
    conn.row_factory = sqlite3.Row

    # PRAGMA เป็นคำสั่งเฉพาะ SQLite สำหรับดูหรือตั้งค่าฐานข้อมูล
    # database_list แสดงฐานข้อมูลที่เชื่อมต่ออยู่ใน connection นี้
    # ไม่ใช่การค้นหาไฟล์ .db ทั้งหมดในเครื่อง
    print("ฐานข้อมูลที่เชื่อมต่อ:")
    show_rows(conn.execute("PRAGMA database_list").fetchall())
    return conn


# ---------------------------------------------------------------------------
# บท 3: Create Table แทน Create Collection
# ---------------------------------------------------------------------------
def ch03_create_table(conn):
    banner("3. Create Table: สร้างตาราง people")
    # CREATE TABLE กำหนดโครงสร้างตารางก่อนเพิ่มข้อมูล
    # IF NOT EXISTS ช่วยให้รันซ้ำโดยไม่เกิดข้อผิดพลาดว่าตารางมีอยู่แล้ว
    # แต่ไม่ได้เปลี่ยน schema ของตารางเดิม ถ้าเคยสร้างไว้ต่างรูปแบบกัน
    # id เป็น PRIMARY KEY ทำให้แต่ละคนมีรหัสไม่ซ้ำ และ NOT NULL ห้ามค่าว่าง
    # name / city เก็บข้อความ ส่วน age ประกาศ INTEGER และส่งค่าเป็น int
    # SQLite ตารางปกติใช้ type affinity ไม่ได้บังคับชนิดเข้มงวดแบบ STRICT
    # CHECK(age >= 0) ตรวจเงื่อนไขอายุห้ามติดลบ และ NOT NULL ห้ามค่า NULL
    conn.execute("""
        CREATE TABLE IF NOT EXISTS people (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            age INTEGER NOT NULL CHECK (age >= 0),
            city TEXT NOT NULL
        )
    """)
    # commit ยืนยัน transaction ที่ค้างอยู่ ถ้าไม่มี transaction จะไม่มีผล
    # ในโหมดนี้ CREATE TABLE ที่อยู่นอก transaction ทำงานเสร็จได้ทันที
    conn.commit()
    print("สร้างตาราง people แล้ว: id, name, age, city")


# ---------------------------------------------------------------------------
# บทเสริมจาก sqlite_tutorial.pdf หน้าไฟล์ PDF 26-28: Data Type
# ---------------------------------------------------------------------------
def demo_data_types(conn):
    banner("บทเสริมตาม PDF: Storage Class, Type Affinity, Boolean และวันที่")
    # storage class คือชนิดของค่าที่เก็บจริง ต่างจากชนิดที่ประกาศให้คอลัมน์
    # ตารางชั่วคราวนี้ไม่มี type ที่คอลัมน์ value จึงมี BLOB affinity
    # ค่าแต่ละชนิดจะไม่ถูกบังคับให้แปลงเป็นชนิดใดก่อนเก็บ
    # TEMP TABLE อยู่ในฐานข้อมูล temp ของ connection และหายไปเมื่อ close
    conn.execute("CREATE TEMP TABLE IF NOT EXISTS demo_types (seq INTEGER, value)")
    samples = (
        (1, None),          # Python None ส่งเป็น SQL NULL
        (2, 42),            # Python int ส่งเป็น INTEGER
        (3, 3.5),           # Python float ส่งเป็น REAL
        (4, "SQLite"),      # Python str ส่งเป็น TEXT
        (5, b"\x01\x02"),  # Python bytes ส่งเป็น BLOB
    )
    with conn:
        conn.execute("DELETE FROM temp.demo_types")
        conn.executemany("INSERT INTO temp.demo_types VALUES (?, ?)", samples)
    # typeof คืนชื่อ storage class ตัวพิมพ์เล็ก เช่น integer, text, blob
    # quote ช่วยแสดงค่าตามรูปแบบ SQL เช่น NULL, 'SQLite' และ X'0102'
    print("Storage Class ทั้ง 5 ชนิด:")
    show_rows(conn.execute("""
        SELECT typeof(value) AS storage_class, quote(value) AS sql_literal
        FROM temp.demo_types ORDER BY seq
    """).fetchall())

    # affinity เป็นแนวทางแปลงค่าเมื่อเขียนลงคอลัมน์ ไม่ใช่ strict typing
    # "26" ที่ส่งเข้า INTEGER แปลงเป็นเลข 26 ได้
    # เลข 26 ที่ส่งเข้า TEXT จะแปลงเป็นข้อความ "26"
    conn.execute("""
        CREATE TEMP TABLE IF NOT EXISTS demo_affinity (
            age INTEGER, label TEXT
        )
    """)
    with conn:
        conn.execute("DELETE FROM temp.demo_affinity")
        conn.execute("INSERT INTO temp.demo_affinity VALUES (?, ?)", ("26", 26))
    print("Type Affinity ของคอลัมน์ INTEGER และ TEXT:")
    show_rows(conn.execute("""
        SELECT age, typeof(age) AS age_type, label, typeof(label) AS label_type
        FROM temp.demo_affinity
    """).fetchall())

    # SQLite ไม่มี storage class ชื่อ Boolean แยกต่างหาก
    # Python True / False จะส่งเป็น INTEGER 1 / 0 ตามลำดับ
    print("Boolean ผ่าน parameter binding:")
    show_rows(conn.execute("""
        SELECT ? AS true_value, ? AS false_value, typeof(?) AS storage_class
    """, (True, False, True)).fetchall())

    # SQLite ไม่มี storage class DATE แยกต่างหากเช่นกัน
    # ตัวอย่างนี้ใช้ TEXT แบบ YYYY-MM-DD โดยใช้ปี ค.ศ. ในข้อมูล
    # พ.ศ. 2569 ตรงกับ ค.ศ. 2026 จึงส่ง 2026-11-02 สำหรับวันนำเสนอ
    # date(?) แสดงค่าวันที่ และ typeof(date(?)) ยืนยันว่าเก็บผลเป็น text
    print("วันที่นำเสนอในรูปแบบ TEXT:")
    show_rows(conn.execute("""
        SELECT date(?) AS presentation_date, typeof(date(?)) AS storage_class
    """, ("2026-11-02", "2026-11-02")).fetchall())


# ---------------------------------------------------------------------------
# บท 4: Insert แทน insert_one / insert_many
# ---------------------------------------------------------------------------
def ch04_insert_one(conn):
    banner("4.1 Insert One: เพิ่มข้อมูล 1 แถว")
    # เตรียมตารางว่างสำหรับสาธิตการเพิ่มข้อมูลครั้งแรก
    reset_people(conn, ())
    person = ("100", "Ram", 26, "Hyderabad")
    with conn:
        # execute รัน SQL หนึ่งคำสั่ง โดยแทน ? ทั้งสี่ตามลำดับใน person
        # ระบุ id เองเป็น "100" จึงใช้ person[0] แสดงรหัสที่เพิ่ม
        cursor = conn.execute(INSERT_PERSON, person)
    print("จำนวนแถวที่เพิ่ม:", cursor.rowcount)
    print("รหัสที่เพิ่ม:", person[0])
    show_rows(conn.execute("SELECT * FROM people ORDER BY id").fetchall())


def ch04_insert_many(conn):
    banner("4.2 Insert Many: เพิ่มข้อมูลหลายแถว")
    # executemany ใช้ SQL เดิมกับข้อมูลทั้งสามชุดใน PEOPLE_THREE
    # id 101-103 ไม่ซ้ำกับ 100 ที่เพิ่มในตัวอย่างก่อนหน้า
    # การทำงานทั้งหมดอยู่ใน transaction เดียวกันของ with conn
    with conn:
        cursor = conn.executemany(INSERT_PERSON, PEOPLE_THREE)
    print("จำนวนแถวที่เพิ่ม:", cursor.rowcount)
    print("รหัสที่เพิ่ม:", [person[0] for person in PEOPLE_THREE])
    # ORDER BY ทำให้ลำดับแถวที่แสดงแน่นอน ไม่พึ่งลำดับภายในของฐานข้อมูล
    show_rows(conn.execute("SELECT * FROM people ORDER BY id").fetchall())


# ---------------------------------------------------------------------------
# บท 5: SELECT แทน find_one / find
# ---------------------------------------------------------------------------
def ch05_find_one(conn):
    banner("5.1 Select One: อ่านข้อมูล 1 แถว")
    reset_people(conn, PEOPLE_THREE)
    # SELECT * อ่านทุกคอลัมน์ และ LIMIT 1 จำกัดผลลัพธ์ไม่เกินหนึ่งแถว
    # fetchone อ่านหนึ่งแถวจาก cursor และคืน None ถ้าไม่มีผลลัพธ์เหลือ
    # SQL ไม่มี ORDER BY จะไม่รับประกันว่าแถวใดเป็นแถวแรก
    first = conn.execute("SELECT * FROM people ORDER BY id LIMIT 1").fetchone()
    print("แถวแรกเมื่อเรียงตาม id:")
    print(dict(first) if first is not None else "ไม่พบข้อมูล")

    # tuple ที่มีสมาชิกตัวเดียวต้องมี comma: ("103",)
    # ("103") เฉย ๆ จะเป็น string ไม่ใช่ tuple สำหรับส่ง parameter
    row = conn.execute("SELECT * FROM people WHERE id = ?", ("103",)).fetchone()
    print("แถวที่มี id = 103:")
    print(dict(row) if row is not None else "ไม่พบข้อมูล")


def ch05_find(conn):
    banner("5.2 Select Many: อ่านหลายแถว")
    reset_people(conn, PEOPLE_THREE)
    # fetchall อ่านแถวที่เหลือทั้งหมดจาก cursor เป็น list
    # เหมาะกับข้อมูลเดโมขนาดเล็ก ถ้าข้อมูลมากควรอ่านเป็นช่วงหรือวน cursor
    print("ข้อมูลทุกแถว:")
    rows = conn.execute("SELECT * FROM people ORDER BY id").fetchall()
    show_rows(rows)
    print("คนที่อายุมากกว่า 26:")
    rows = conn.execute(
        "SELECT * FROM people WHERE age > ? ORDER BY id", (26,)
    ).fetchall()
    show_rows(rows)


# ---------------------------------------------------------------------------
# บท 6: Query ด้วย WHERE
# ---------------------------------------------------------------------------
def ch06_query_equal(conn):
    banner("6.1 Query Equal: ค้นหาชื่อ Sarmista")
    reset_people(conn)
    # find({"name": "Sarmista"}) ของเดิมเปลี่ยนเป็น WHERE name = ?
    # ส่งข้อความแยกจาก SQL เพื่อจัดการเครื่องหมายคำพูดในข้อมูลได้ถูกต้อง
    rows = conn.execute(
        "SELECT * FROM people WHERE name = ? ORDER BY id", ("Sarmista",)
    ).fetchall()
    show_rows(rows)


def ch06_query_gt(conn):
    banner("6.2 Query Greater Than: ค้นหาอายุมากกว่า 26")
    reset_people(conn)
    # $gt ของ MongoDB เปลี่ยนเป็นตัวดำเนินการ > ของ SQL
    # ส่ง 26 เป็น int เพื่อเปรียบเทียบอายุเป็นตัวเลข
    # ผลลัพธ์คือ Rahim อายุ 27 และ Robert อายุ 28
    rows = conn.execute(
        "SELECT * FROM people WHERE age > ? ORDER BY id", (26,)
    ).fetchall()
    show_rows(rows)


# ---------------------------------------------------------------------------
# บท 7: Sort ด้วย ORDER BY
# ---------------------------------------------------------------------------
def ch07_sort(conn):
    banner("7. Sort: เรียงอายุจากน้อยไปมาก")
    reset_people(conn)
    # ASC เรียงจากน้อยไปมาก ส่วน DESC เรียงจากมากไปน้อย
    # คนอายุเท่ากันจะเรียงตาม id ASC เป็นเงื่อนไขลำดับรอง
    # ผลอายุที่ได้คือ 23, 25, 26, 26, 27, 28
    rows = conn.execute(
        "SELECT * FROM people ORDER BY age ASC, id ASC"
    ).fetchall()
    show_rows(rows)


# ---------------------------------------------------------------------------
# บท 8: Delete ด้วย DELETE FROM
# ---------------------------------------------------------------------------
def ch08_delete_one(conn):
    banner("8.1 Delete One: ลบคนที่มี id = 1006")
    reset_people(conn)
    # SQLite ไม่ต้องมีเมธอด delete_one แยกต่างหาก
    # WHERE id = ? บน PRIMARY KEY ที่ไม่ซ้ำจะตรงได้ไม่เกินหนึ่งแถว
    # ถ้า WHERE ใช้คอลัมน์ที่ซ้ำได้ อาจลบหลายแถว จึงไม่เท่ากับ delete_one
    with conn:
        cursor = conn.execute("DELETE FROM people WHERE id = ?", ("1006",))
    print("จำนวนแถวที่ลบ:", cursor.rowcount)
    show_rows(conn.execute("SELECT * FROM people ORDER BY id").fetchall())


def ch08_delete_many(conn):
    banner("8.2 Delete Many: ลบหลายแถวและลบข้อมูลทั้งหมด")
    reset_people(conn)
    # DELETE จะลบทุกแถวที่ตรงกับ WHERE ในที่นี้คือคนอายุมากกว่า 26
    with conn:
        cursor = conn.execute("DELETE FROM people WHERE age > ?", (26,))
    print("จำนวนแถวที่ลบเมื่อ age > 26:", cursor.rowcount)
    show_rows(conn.execute("SELECT * FROM people ORDER BY id").fetchall())

    # ไม่มี WHERE หมายถึงลบข้อมูลทุกแถว ต้องระวังเมื่อใช้กับข้อมูลจริง
    # DELETE ไม่ได้ลบตาราง จึงยัง SELECT COUNT(*) ได้และเพิ่มข้อมูลใหม่ได้
    with conn:
        conn.execute("DELETE FROM people")
    count = conn.execute("SELECT COUNT(*) FROM people").fetchone()[0]
    print("จำนวนแถวหลัง DELETE โดยไม่มี WHERE:", count)


# ---------------------------------------------------------------------------
# บท 9: Drop Table แทน Drop Collection
# ---------------------------------------------------------------------------
def ch09_drop_table(conn):
    banner("9. Drop Table: ลบตารางทดลอง")
    # แยกตารางทดลองสำหรับบทนี้ เพื่อให้ people ยังใช้งานในบทถัดไปได้
    # ระบุชื่อตารางเป็นค่าคงที่ ไม่รับชื่อตารางจากผู้ใช้แล้วนำมาต่อ SQL
    conn.execute("CREATE TABLE IF NOT EXISTS demo_collection (name TEXT)")
    conn.execute("CREATE TABLE IF NOT EXISTS demo_data (name TEXT)")
    conn.commit()

    # sqlite_master เป็นตารางระบบที่เก็บ schema ของฐานข้อมูล
    # กรองเฉพาะ type = 'table' และเรียงชื่อเพื่อแสดงผลให้คงที่
    list_tables = "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name"
    print("ตารางก่อน DROP:")
    show_rows(conn.execute(list_tables).fetchall())

    # DROP TABLE ลบทั้งโครงสร้างและข้อมูล ต่างจาก DELETE ที่เก็บโครงสร้างไว้
    # IF EXISTS ช่วยให้สั่งซ้ำได้ แม้ตารางเป้าหมายจะไม่มีอยู่แล้ว
    conn.execute("DROP TABLE IF EXISTS demo_collection")
    conn.execute("DROP TABLE IF EXISTS demo_data")
    conn.commit()
    print("ตารางหลัง DROP:")
    show_rows(conn.execute(list_tables).fetchall())


# ---------------------------------------------------------------------------
# บท 10: Update ด้วย UPDATE ... SET ... WHERE
# ---------------------------------------------------------------------------
def ch10_update_one(conn):
    banner("10.1 Update One: เปลี่ยนเมืองของ id = 102")
    reset_people(conn, PEOPLE_THREE)
    print("ก่อนแก้ไข:")
    show_rows(conn.execute("SELECT * FROM people ORDER BY id").fetchall())
    # $set ของ MongoDB เปลี่ยนเป็น SET ของ SQL
    # parameter แรกคือเมืองใหม่ ส่วน parameter ที่สองคือรหัสที่ต้องการแก้
    # ใช้ WHERE บน PRIMARY KEY จึงแก้ไขได้ไม่เกินหนึ่งแถว
    with conn:
        cursor = conn.execute(
            "UPDATE people SET city = ? WHERE id = ?",
            ("Visakhapatnam", "102"),
        )
    print("จำนวนแถวที่แก้ไข:", cursor.rowcount)
    print("หลังแก้ไข:")
    show_rows(conn.execute("SELECT * FROM people ORDER BY id").fetchall())


def ch10_update_many(conn):
    banner("10.2 Update Many: เปลี่ยนเมืองของทุกคน")
    reset_people(conn, PEOPLE_THREE)
    # UPDATE โดยไม่มี WHERE จะแก้ไขทุกแถวในตาราง
    # ตรงกับ update_many({}, {"$set": {"city": "Visakhapatnam"}}) ของเดิม
    # ถ้าต้องการแก้หลายแถวตามเงื่อนไข ให้เพิ่ม WHERE เช่น WHERE age > ?
    with conn:
        cursor = conn.execute("UPDATE people SET city = ?", ("Visakhapatnam",))
    print("จำนวนแถวที่แก้ไข:", cursor.rowcount)
    show_rows(conn.execute("SELECT * FROM people ORDER BY id").fetchall())


# ---------------------------------------------------------------------------
# บท 11: Limit
# ---------------------------------------------------------------------------
def ch11_limit(conn):
    banner("11. Limit: อ่านเพียง 3 แถวแรกตาม id")
    reset_people(conn)
    # LIMIT ? จำกัดจำนวนแถวสูงสุด ส่วน ORDER BY กำหนดว่าเลือกแถวไหนก่อน
    # LIMIT 3 ไม่ได้แปลว่าแถวล่าสุดเสมอไป ต้องดู ORDER BY ที่ใช้ด้วย
    # ตัวอย่างนี้ได้ Ram, Rahim, Robert ตาม id 1001, 1002, 1003
    rows = conn.execute(
        "SELECT * FROM people ORDER BY id ASC LIMIT ?", (3,)
    ).fetchall()
    show_rows(rows)


def run_examples(conn):
    """เรียกทุกตัวอย่างตามหัวข้อเดิม โดยใช้ connection เดียวกัน"""
    # บท 3 ต้องสร้างตารางก่อน จึงค่อยเริ่มอ่านหรือเขียนในบทถัดไป
    # ตัวอย่างที่แก้หรือลบข้อมูลจะเรียก reset_people เพื่อเตรียมข้อมูลใหม่
    # เมื่อจบบท 11 จะมีข้อมูลตัวอย่างครบ 6 คนให้เปิดดูใน tutorial.db ต่อได้
    ch03_create_table(conn)
    ch04_insert_one(conn)
    ch04_insert_many(conn)
    ch05_find_one(conn)
    ch05_find(conn)
    ch06_query_equal(conn)
    ch06_query_gt(conn)
    ch07_sort(conn)
    ch08_delete_one(conn)
    ch08_delete_many(conn)
    ch09_drop_table(conn)
    ch10_update_one(conn)
    ch10_update_many(conn)
    ch11_limit(conn)


def main():
    ch01_introduction()
    conn = ch02_create_database(DB_PATH)
    try:
        demo_data_types(conn)
        run_examples(conn)
    finally:
        # finally ทำงานทั้งเมื่อรันสำเร็จและเมื่อเกิดข้อผิดพลาด
        # with conn จัดการ commit / rollback แต่ไม่ได้ปิด connection
        # จึงต้อง close เองเมื่อใช้งานเสร็จ เพื่อคืนทรัพยากรของฐานข้อมูล
        conn.close()

    print("\nรันตัวอย่างครบทั้ง 11 บทแล้ว")
    print("ไฟล์ฐานข้อมูล:", DB_PATH)


# บล็อกนี้ทำงานเมื่อสั่ง python3 main.py โดยตรง
# ถ้าไฟล์อื่น import main เพื่อใช้งานฟังก์ชัน จะไม่รันเดโมทันที
if __name__ == "__main__":
    main()
