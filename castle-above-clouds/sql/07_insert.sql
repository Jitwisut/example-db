-- =====================================================================
--  07 · INSERT · ปุ่ม INSERT
--  เพิ่มแถวใหม่ลงตาราง
--  ในฉาก: ของใหม่ปรากฏขึ้น แล้วกล้องพาไปดู (ตะเกียง · เกาะ · อาคาร)
-- =====================================================================

-- คำสั่งที่ปุ่ม INSERT ใส่ให้
-- ไม่ต้องใส่ id: SQLite สร้างให้เอง (INTEGER PRIMARY KEY)
INSERT INTO lanterns (building_id, brightness, active)
VALUES (3, 0.8, 1);


-- ตัวอย่างเพิ่มเติม ----------------------------------------------------

-- ใส่สีไฟด้วย
INSERT INTO lanterns (building_id, brightness, active, color)
VALUES (16, 0.9, 1, 'pink');

-- สร้างเกาะใหม่ · ในฉาก: เกาะลอยขึ้นจากทะเลเมฆ แล้วกล้องพาไปดู
-- ไม่ต้องใส่ id: เกาะใหม่ได้ id ต่อจากเกาะสุดท้าย
INSERT INTO islands (name, altitude, district)
VALUES ('Starfall Isle', 1210, 'Observatory');

-- สร้างอาคารบนเกาะที่เพิ่งสร้าง · ในฉาก: บ้านถูกสร้างขึ้นจริงบนเกาะนั้น
-- type: cottage, house, tower, keep, hall, barn, stall · roof_color: red, blue, น้ำเงิน, '#3060c0' …
-- (SELECT MAX(id) FROM islands) = id ของเกาะล่าสุด
INSERT INTO buildings (island_id, name, type, roof_color)
VALUES ((SELECT MAX(id) FROM islands), 'Star House', 'cottage', 'blue');

-- หอคอยสีเขียวบน Castle Isle (เกาะ 1) · ระบบหาที่ว่างบนเกาะให้เอง
INSERT INTO buildings (island_id, name, type, roof_color)
VALUES (1, 'Watch Tower', 'tower', 'green');

-- ตะเกียงแขวนบนเกาะล่าสุด (ไม่ได้ติดกับอาคาร)
INSERT INTO lanterns (island_id, brightness, active, color)
VALUES ((SELECT MAX(id) FROM islands), 0.9, 1, 'cyan');

-- ผิดโดยตั้งใจ: ไม่มีอาคาร id 99 → FOREIGN KEY constraint failed
-- INSERT INTO lanterns (building_id, brightness, active)
-- VALUES (99, 0.5, 1);
