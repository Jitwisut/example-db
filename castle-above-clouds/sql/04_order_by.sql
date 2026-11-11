-- =====================================================================
--  04 · ORDER BY · ปุ่ม ORDER BY
--  เรียงลำดับผลลัพธ์
--  ในฉาก: ป้ายลำดับ #1, #2, … ลอยเหนือเกาะตามลำดับที่ได้
-- =====================================================================

-- คำสั่งที่ปุ่ม ORDER BY ใส่ให้: เกาะจากสูงสุดไปต่ำสุด
SELECT *
FROM islands
ORDER BY altitude DESC;


-- ตัวอย่างเพิ่มเติม ----------------------------------------------------

-- จากต่ำไปสูง (ASC คือค่าเริ่มต้น)
SELECT *
FROM islands
ORDER BY altitude ASC;

-- เรียงตามชื่อ A → Z
SELECT *
FROM islands
ORDER BY name;

-- เอาแค่ 3 อันดับแรก
SELECT name, altitude
FROM islands
ORDER BY altitude DESC
LIMIT 3;
