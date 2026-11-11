-- =====================================================================
--  03 · WHERE · ปุ่ม WHERE
--  กรองเฉพาะแถวที่ตรงเงื่อนไข
--  ในฉาก: อาคารที่ตรงเงื่อนไขเรืองแสง (◆) ที่เหลือจางลง
-- =====================================================================

-- คำสั่งที่ปุ่ม WHERE ใส่ให้: อาคารหลังคาสีแดง
SELECT *
FROM buildings
WHERE roof_color = 'red';


-- ตัวอย่างเพิ่มเติม ----------------------------------------------------

-- อาคารที่ว่าง (ไม่มีคนอยู่)
SELECT *
FROM buildings
WHERE occupied = 0;

-- เฉพาะกระท่อม
SELECT *
FROM buildings
WHERE type = 'cottage';

-- ตะเกียงที่สว่างกว่า 0.7
SELECT *
FROM lanterns
WHERE brightness > 0.7;

-- หลายเงื่อนไขพร้อมกัน (AND)
SELECT name, type
FROM buildings
WHERE roof_color = 'red'
  AND type = 'tower';
