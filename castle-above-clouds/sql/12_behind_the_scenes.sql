-- =====================================================================
--  12 · BEHIND THE SCENES · คำสั่งที่เว็บรันเองเบื้องหลัง
--  ผู้ใช้ไม่ได้พิมพ์ แต่เว็บใช้คำสั่งเหล่านี้ทำให้ฉาก 3D ตรงกับข้อมูลจริง
-- =====================================================================

-- ---------------------------------------------------------------------
--  A. SNAPSHOT · หลังรันทุกคำสั่ง เว็บอ่านทุกตารางใหม่ แล้วปรับฉากตาม
--     (ตะเกียงเกิด/หาย, หลังคาเปลี่ยนสี, หน้าต่างดับ ฯลฯ)
-- ---------------------------------------------------------------------
SELECT * FROM islands   ORDER BY id;
SELECT * FROM buildings ORDER BY id;
SELECT * FROM residents ORDER BY id;
SELECT * FROM lanterns  ORDER BY id;
SELECT * FROM routes    ORDER BY id;


-- ---------------------------------------------------------------------
--  B. COMPANION QUERY · คำสั่งคู่ขนานที่บอกว่า "แถวไหนคือวัตถุไหน"
--     ใช้ FROM / WHERE เดียวกับคำสั่งของผู้ใช้ แต่ขอ id มาด้วย
-- ---------------------------------------------------------------------

-- ผู้ใช้รัน: SELECT * FROM buildings WHERE roof_color = 'red';
-- เว็บรันคู่: (เพื่อรู้ว่าอาคาร id ไหนต้องเรืองแสง)
SELECT buildings.id AS __id, buildings.*
FROM buildings
WHERE roof_color = 'red';

-- ผู้ใช้รัน: SELECT * FROM islands ORDER BY altitude DESC;
-- เว็บรันคู่: (เพื่อวางป้ายลำดับ #1, #2, …)
SELECT islands.id AS __id, altitude AS __ord, islands.*
FROM islands
ORDER BY altitude DESC;

-- ผู้ใช้รัน: JOIN ระหว่าง buildings กับ islands
-- เว็บรันคู่: (ได้คู่ id ซ้าย-ขวา เพื่อวาดสะพานบน JOIN Isle)
SELECT buildings.id, islands.id
FROM buildings
JOIN islands
  ON buildings.island_id = islands.id;

-- ผู้ใช้รัน: SELECT roof_color, COUNT(*) FROM buildings GROUP BY roof_color;
-- เว็บรันคู่: (เพื่อรู้ว่าอาคารไหนอยู่กลุ่มไหน)
SELECT buildings.id, roof_color
FROM buildings;


-- ---------------------------------------------------------------------
--  C. INSPECTOR · คลิกวัตถุในฉาก แล้วกล่องข้อมูลอ่านจากคำสั่งเหล่านี้
--     (? คือพารามิเตอร์ = id ของวัตถุที่คลิก · ตัวอย่างใช้ id = 1)
-- ---------------------------------------------------------------------

-- คลิกอาคาร
SELECT b.id, b.name, b.type, b.roof_color, b.occupied,
       i.name AS island
FROM buildings b
JOIN islands i ON i.id = b.island_id
WHERE b.id = 1;

SELECT name, occupation, age
FROM residents
WHERE building_id = 1
ORDER BY id;

SELECT id, brightness, active, color
FROM lanterns
WHERE building_id = 1
ORDER BY id;

-- คลิกเกาะ (นับอาคารด้วย subquery)
SELECT id, name, altitude, district,
       (SELECT COUNT(*) FROM buildings
        WHERE island_id = islands.id) AS buildings
FROM islands
WHERE id = 1;

-- คลิกตะเกียง
SELECT l.id, l.brightness, l.active, b.name, l.island_id, l.color
FROM lanterns l
LEFT JOIN buildings b ON b.id = l.building_id
WHERE l.id = 1;


-- ---------------------------------------------------------------------
--  D. TABLE GUIDE · หน้าคู่มือตาราง อ่านโครงสร้างตารางจริง
-- ---------------------------------------------------------------------
PRAGMA table_info(buildings);
PRAGMA foreign_key_list(buildings);

-- ปุ่มลัดในหน้าคู่มือ (ตัวอย่าง: อาคาร id 1, เกาะ id 4)
SELECT * FROM residents WHERE building_id = 1;
SELECT * FROM lanterns  WHERE building_id = 1;
SELECT * FROM lanterns  WHERE island_id = 4;
