# SQL / DIMENSION (เว็บ)

เว็บรวมคำสั่ง SQL แยกเป็นหมวด กดรันดูผลจริงจาก SQLite (sql.js / WebAssembly) ที่ทำงานในเบราว์เซอร์ และมี SQL Lab ให้ลองเขียนเอง
ข้อมูลตั้งต้นคือตาราง EMPLOYEE, EMP, CONTACT ชุดเดียวกับ `../main.py`

```bash
cd web
npm install
npm run dev        # เปิด http://localhost:5173
npm test           # รันเทสต์ engine + ตัวอย่างทุกหัวข้อ
npm run build      # สร้างไฟล์สำหรับ deploy ใน dist/
npm run preview    # เปิดดู build จริง
```

- `src/content/topics.ts` เนื้อหาและตัวอย่าง SQL ของแต่ละหัวข้อ (เพิ่มหัวข้อใหม่ได้ที่นี่)
- `src/sql/seed.ts` ข้อมูลตั้งต้น
- `src/sql/engine.ts` รัน SQL ทีละคำสั่ง จำกัดผลไม่เกิน 500 แถว
- `src/sql/sql.worker.ts` + `client.ts` รัน SQLite ใน Web Worker ถ้า query เกิน 4 วินาทีจะหยุดและรีเซ็ตฐานข้อมูล
