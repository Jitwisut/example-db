-- =====================================================================
--  00 · SCHEMA · โครงสร้างฐานข้อมูลของเมือง Castle Above Clouds
--  ทุกอย่างในฉาก 3D คือแถวในตารางเหล่านี้ (เว็บรันคำสั่งชุดนี้ตอนเปิดหน้า)
-- =====================================================================

-- เปิดการตรวจ FOREIGN KEY (SQLite ปิดไว้เป็นค่าเริ่มต้น)
PRAGMA foreign_keys = ON;

-- เกาะลอยฟ้า · 1 แถว = 1 เกาะ
CREATE TABLE islands (
  id        INTEGER PRIMARY KEY,
  name      TEXT    NOT NULL,          -- ชื่อเกาะ
  altitude  INTEGER NOT NULL,          -- ความสูง (เมตร) → ความสูงของเกาะในฉาก
  district  TEXT    NOT NULL           -- ย่าน
);

-- อาคาร · 1 แถว = 1 หลัง · อยู่บนเกาะไหน ดูจาก island_id
CREATE TABLE buildings (
  id          INTEGER PRIMARY KEY,
  island_id   INTEGER NOT NULL
              REFERENCES islands(id) ON DELETE CASCADE,
  name        TEXT    NOT NULL,
  type        TEXT    NOT NULL,        -- keep, tower, hall, cottage, house …
  roof_color  TEXT    NOT NULL,        -- สีหลังคา
  occupied    INTEGER NOT NULL DEFAULT 1   -- 1 = มีคนอยู่ (หน้าต่างสว่าง), 0 = ว่าง
);

-- ผู้อยู่อาศัย · 1 แถว = 1 คน · อยู่ในอาคารไหน ดูจาก building_id
CREATE TABLE residents (
  id           INTEGER PRIMARY KEY,
  building_id  INTEGER NOT NULL
               REFERENCES buildings(id) ON DELETE CASCADE,
  name         TEXT    NOT NULL,
  occupation   TEXT    NOT NULL,
  age          INTEGER NOT NULL
);

-- ตะเกียง · 1 แถว = ไฟ 1 ดวง
-- ติดกับอาคาร (building_id) หรือแขวนบนเกาะ (island_id) อย่างใดอย่างหนึ่ง
CREATE TABLE lanterns (
  id           INTEGER PRIMARY KEY,
  building_id  INTEGER REFERENCES buildings(id) ON DELETE CASCADE,
  island_id    INTEGER REFERENCES islands(id)   ON DELETE CASCADE,
  brightness   REAL    NOT NULL DEFAULT 0.7
               CHECK (brightness BETWEEN 0 AND 1),   -- ความสว่าง 0 – 1
  active       INTEGER NOT NULL DEFAULT 1,           -- 1 = เปิด, 0 = ปิด
  color        TEXT    NOT NULL DEFAULT 'warm'       -- สีไฟ: red, blue, แดง, '#00e0ff' …
);

-- เส้นทางระหว่างเกาะ · 1 แถว = 1 เส้นทาง
CREATE TABLE routes (
  id              INTEGER PRIMARY KEY,
  from_island_id  INTEGER NOT NULL REFERENCES islands(id) ON DELETE CASCADE,
  to_island_id    INTEGER NOT NULL REFERENCES islands(id) ON DELETE CASCADE,
  route_type      TEXT    NOT NULL     -- sky ferry, timber bridge, lantern path
);
