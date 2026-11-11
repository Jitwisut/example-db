-- =====================================================================
--  11 · SQL INJECTION LAB · ปุ่ม SQL INJECTION LAB (ห้องลับใน Moon Tower)
--  ฐานข้อมูลจำลองแยกจากเมือง · บัญชีและข้อมูลลับทั้งหมดเป็นของสมมติ
-- =====================================================================

-- ---------------------------------------------------------------------
--  A. ฐานข้อมูลของห้องแล็บ
-- ---------------------------------------------------------------------
CREATE TABLE accounts (
  id        INTEGER PRIMARY KEY,
  username  TEXT NOT NULL,
  password  TEXT NOT NULL,     -- ข้อมูลลับ (ในระบบจริงต้องเก็บเป็น hash)
  role      TEXT NOT NULL
);

INSERT INTO accounts (id, username, password, role) VALUES
  (1, 'warden',      'moonlight-42', 'keeper'),
  (2, 'scribe',      'inkwell-7',    'archivist'),
  (3, 'lamplighter', 'ember-19',     'staff');

-- ห้องเก็บสมบัติ: ตารางที่หน้า login ไม่ควรอ่านได้เลย
CREATE TABLE vault (
  id      INTEGER PRIMARY KEY,
  item    TEXT NOT NULL,
  secret  TEXT NOT NULL
);

INSERT INTO vault (id, item, secret) VALUES
  (1, 'Moonstone Crown', 'chest code 7714'),
  (2, 'Star Charts',     'under the 3rd stair'),
  (3, 'Gold Reserve',    '4,800 crowns');


-- ---------------------------------------------------------------------
--  B. โหมด VULNERABLE · สร้างคำสั่งด้วยการ "ต่อสตริง" (อันตราย!)
--
--  โค้ดในเว็บ (JavaScript):
--    "SELECT id, username, role FROM accounts
--     WHERE username = '" + USERNAME + "' AND password = '" + PASSWORD + "'"
--
--  ข้อความที่ผู้ใช้พิมพ์ถูกแปะลงไปในคำสั่งตรง ๆ จึงเปลี่ยนความหมายของ SQL ได้
-- ---------------------------------------------------------------------

-- 1) valid login · USERNAME = warden · PASSWORD = moonlight-42
--    → ได้ 1 แถว: ประตูเปิดตามปกติ
SELECT id, username, role FROM accounts
WHERE username = 'warden' AND password = 'moonlight-42';


-- 2) bypass · OR 1=1
--    USERNAME = ' OR 1=1 --       PASSWORD = anything
--    ' ปิดสตริงเอง · OR 1=1 ทำให้ WHERE เป็นจริงทุกแถว
--    -- ทำให้ส่วนตรวจรหัสผ่านกลายเป็นคอมเมนต์
--    → ได้บัญชีทั้ง 3 แถว ทั้งที่ไม่รู้รหัสผ่าน
SELECT id, username, role FROM accounts
WHERE username = '' OR 1=1 --' AND password = 'anything'
;


-- 3) UNION · ขโมยรหัสผ่าน
--    USERNAME = ' UNION SELECT id, username, password FROM accounts --
--    UNION ต่อผลลัพธ์ของคำสั่งที่ 2 เข้าไป (ต้องมี 3 คอลัมน์เท่ากัน)
--    → คอลัมน์ role กลับมีรหัสผ่านทุกคนอยู่ข้างใน
SELECT id, username, role FROM accounts
WHERE username = '' UNION SELECT id, username, password FROM accounts --' AND password = 'anything'
;


-- 4) UNION · ขโมยข้อมูลจากตารางอื่น (vault)
--    USERNAME = ' UNION SELECT id, item, secret FROM vault --
--    → หน้า login แสดงข้อมูลลับของห้องสมบัติออกมา
SELECT id, username, role FROM accounts
WHERE username = '' UNION SELECT id, item, secret FROM vault --' AND password = 'anything'
;


-- ---------------------------------------------------------------------
--  C. โหมด PROTECTED · Prepared statement (วิธีที่ถูกต้อง)
--
--  คำสั่งถูกเขียนตายตัว มีแค่ ? เป็นช่องว่างสำหรับข้อมูล
--  ค่าที่ผู้ใช้พิมพ์ถูกส่งแยก (bind) เป็น "ข้อมูล" ไม่ถูกอ่านเป็น SQL
--
--    SELECT id, username, role FROM accounts
--    WHERE username = ? AND password = ?
--
--    bind → [ "' UNION SELECT id, username, password FROM accounts --", "anything" ]
--
--  SQLite จึงค้นหาผู้ใช้ที่ชื่อเป็นข้อความทั้งก้อนนั้นจริง ๆ → ไม่พบ → 0 แถว
--  ผลเทียบเท่ากับ (เครื่องหมาย ' ในข้อความถูก escape เป็น '' ให้อัตโนมัติ):
-- ---------------------------------------------------------------------
SELECT id, username, role FROM accounts
WHERE username = ''' UNION SELECT id, username, password FROM accounts --'
  AND password = 'anything';
