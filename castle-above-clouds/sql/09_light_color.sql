-- =====================================================================
--  09 · LIGHT COLOR · ปุ่ม LIGHT COLOR
--  เปลี่ยนสีหลอดไฟด้วย UPDATE คอลัมน์ color
--  ในฉาก: ตะเกียง #3 (หน้า Porch House) เปลี่ยนสีทั้งโคมและแสงที่ตกกระทบ
--  ใช้ได้ทั้ง red, blue … / แดง, น้ำเงิน … / gold, magenta / '#00e0ff'
-- =====================================================================

-- คำสั่งที่ปุ่ม LIGHT COLOR ใส่ให้
UPDATE lanterns
SET color = 'red'
WHERE id = 3;


-- ตัวอย่างเพิ่มเติม ----------------------------------------------------

-- ชื่อสีภาษาไทย
UPDATE lanterns
SET color = 'แดง'
WHERE id = 4;

-- รหัสสี hex
UPDATE lanterns
SET color = '#00e0ff'
WHERE id = 6;

-- เปลี่ยนหลายดวงพร้อมกัน
UPDATE lanterns
SET color = 'green'
WHERE building_id IN (11, 12);

-- ดูว่าดวงไหนไม่ใช่สีปกติ
SELECT id, color
FROM lanterns
WHERE color <> 'warm';

-- นับตามสี
SELECT color, COUNT(*)
FROM lanterns
GROUP BY color;
