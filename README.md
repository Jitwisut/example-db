# Python MongoDB Tutorial

ตัวอย่างโค้ด **pymongo** ทั้งหมดจากเอกสาร *Python MongoDB Tutorial* รวมไว้ในไฟล์เดียว (`main.py`) รันครั้งเดียวได้ครบทุกบท

## เนื้อหาที่ครอบคลุม

| บท | หัวข้อ | ฟังก์ชันใน `main.py` |
|---|---|---|
| 1 | Introduction | `ch01_introduction` |
| 2 | Create Database | `ch02_create_database` |
| 3 | Create Collection | `ch03_create_collection` |
| 4 | Insert Document (`insert_one`, `insert_many`) | `ch04_insert_one`, `ch04_insert_many` |
| 5 | Find (`find_one`, `find`) | `ch05_find_one`, `ch05_find` |
| 6 | Query (`$gt`, equality) | `ch06_query_equal`, `ch06_query_gt` |
| 7 | Sort | `ch07_sort` |
| 8 | Delete Document (`delete_one`, `delete_many`) | `ch08_delete_one`, `ch08_delete_many` |
| 9 | Drop Collection | `ch09_drop_collection` |
| 10 | Update (`update_one`, `update_many`) | `ch10_update_one`, `ch10_update_many` |
| 11 | Limit | `ch11_limit` |

## สิ่งที่ต้องมี

- Python 3.8 ขึ้นไป
- Docker (ใช้รัน MongoDB) หรือ MongoDB ที่ติดตั้งในเครื่อง ที่ `localhost:27017`

## ติดตั้ง

**1. เปิด MongoDB ด้วย Docker**

ครั้งแรก:

```bash
docker compose up -d
```

ครั้งต่อไป (ถ้า container ถูกสร้างไว้แล้ว):

```bash
docker start mongodb
```

**2. สร้าง virtual environment และติดตั้ง pymongo**

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

> ถ้ามีโฟลเดอร์ `.venv` อยู่แล้ว ข้ามไปขั้น `source .venv/bin/activate` ได้เลย

## วิธีรัน

**ใน terminal** (ต้องอยู่ในโฟลเดอร์นี้):

```bash
source .venv/bin/activate
python main.py
```

หรือรันโดยไม่ต้อง activate:

```bash
.venv/bin/python main.py
```

**ใน VS Code:** เปิด `main.py` แล้วกด ▶ Run ได้เลย (`.vscode/settings.json` ตั้งให้ใช้ `.venv` ไว้แล้ว)
ถ้า VS Code ยังไม่เลือก `.venv` ให้กด `Cmd+Shift+P` → **Python: Select Interpreter** → เลือกตัวที่มี `.venv`

ออกจาก venv:

```bash
deactivate
```

## ตัวอย่างผลลัพธ์

```
======================================================================
7. Python MongoDB — Sort
======================================================================
Data inserted ......
List of documents (sorted in ascending order based on age):
{'_id': '1005', 'name': 'Sarmista', 'age': 23, 'city': 'Delhi'}
{'_id': '1004', 'name': 'Romeo', 'age': 25, 'city': 'Pune'}
...
All examples finished.
```

## สิ่งที่ปรับจากโค้ดในเอกสาร

เพื่อให้ทุกตัวอย่างรันต่อกันในไฟล์เดียว และรันซ้ำได้หลายครั้ง:

- **ล้างข้อมูลก่อนรัน** — `reset()` ลบทุก database ที่ tutorial ใช้ก่อนเริ่ม จึงไม่เกิด `DuplicateKeyError` เวลารันซ้ำ
- **`mydb` กับ `myDB`** — MongoDB ไม่อนุญาตให้มี database ที่ชื่อต่างกันแค่ตัวพิมพ์เล็ก/ใหญ่ จึงลบ `mydb` ก่อนตัวอย่างที่ใช้ `myDB`
- **บท Update** — ลบ collection `myDB.example` ก่อนแต่ละตัวอย่าง เพราะบท Find ใส่ `_id` ชุดเดียวกันไว้แล้ว
- **บท Create Database** — `mydb` จะยังไม่ขึ้นใน `list_database_names()` เพราะ MongoDB สร้าง database จริงก็ต่อเมื่อมีข้อมูลถูกเขียนลงไป
- **บท Drop Collection** — ลำดับรายชื่อ collection อาจไม่ตรงกับในเอกสาร เป็นเรื่องปกติ

## แก้ปัญหา

| อาการ | สาเหตุ / วิธีแก้ |
|---|---|
| `no such file or directory: .venv/bin/python` | ไม่ได้อยู่ในโฟลเดอร์โปรเจกต์ → `cd python-mongodb-tutorial` ก่อน |
| `ModuleNotFoundError: No module named 'pymongo'` | ใช้ Python ผิดตัว → `source .venv/bin/activate` หรือเลือก interpreter `.venv` ใน VS Code |
| `ServerSelectionTimeoutError` | MongoDB ไม่ได้รัน → `docker start mongodb` |

## โครงสร้างไฟล์

```
python-mongodb-tutorial/
├── main.py              # โค้ดทุกบท
├── requirements.txt     # pymongo
├── docker-compose.yml   # MongoDB 7 ที่ port 27017
├── .vscode/settings.json
└── .venv/               # virtual environment
```
