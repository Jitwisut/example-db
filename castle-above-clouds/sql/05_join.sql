-- =====================================================================
--  05 · JOIN · ปุ่ม JOIN
--  จับคู่แถวจาก 2 ตาราง ด้วยคีย์ที่ตรงกัน (FOREIGN KEY = PRIMARY KEY)
--  ในฉาก: เกาะใหม่ "JOIN Isle" ลอยขึ้นเหนือปราสาท
--    ซ้าย  = แถวของตาราง FROM
--    ขวา   = แถวของตาราง JOIN
--    สะพานแสง 1 เส้น = ผลลัพธ์ 1 แถว · สีเดียวกัน = ค่าคีย์เดียวกัน
--    แถวที่จาง = ไม่อยู่ในผลลัพธ์ · กล่อง NULL = LEFT JOIN หาคู่ไม่เจอ
-- =====================================================================

-- คำสั่งที่ปุ่ม JOIN ใส่ให้ (ตัวอย่างที่ 1: buildings ⋈ islands)
-- อาคารแต่ละหลังอยู่บนเกาะไหน
SELECT buildings.name AS building,
       islands.name   AS island
FROM buildings
JOIN islands
  ON buildings.island_id = islands.id;


-- ตัวอย่างที่ 2: residents ⋈ buildings
-- ใครอาศัยอยู่บ้านหลังไหน
SELECT residents.name  AS resident,
       buildings.name  AS home
FROM residents
JOIN buildings
  ON residents.building_id = buildings.id;


-- ตัวอย่างที่ 3: lanterns LEFT ⋈ buildings
-- LEFT JOIN เก็บแถวฝั่งซ้ายไว้ทุกแถว ถึงจะหาคู่ไม่เจอก็ตาม
-- ตะเกียง #5 แขวนบนเกาะ ไม่ได้ติดกับอาคาร → building เป็น NULL
SELECT lanterns.id,
       lanterns.color,
       buildings.name AS building
FROM lanterns
LEFT JOIN buildings
  ON lanterns.building_id = buildings.id;


-- ตัวอย่างที่ 4: islands LEFT ⋈ buildings
-- เกาะ Lantern Rock ไม่มีอาคารเลย → building เป็น NULL
SELECT islands.name   AS island,
       buildings.name AS building
FROM islands
LEFT JOIN buildings
  ON buildings.island_id = islands.id;


-- เปรียบเทียบ: JOIN ธรรมดา (INNER JOIN) จะตัดแถวที่ไม่มีคู่ทิ้ง
-- ผลลัพธ์นี้จะไม่มี Lantern Rock
SELECT islands.name   AS island,
       buildings.name AS building
FROM islands
JOIN buildings
  ON buildings.island_id = islands.id;
