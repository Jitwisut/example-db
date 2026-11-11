/* =====================================================================
   queries.js · SQL ทุกคำสั่งที่หน้าเว็บเรียกใช้เอง (ผู้ใช้ไม่ได้พิมพ์)
   ---------------------------------------------------------------------
   แยกไว้ที่เดียว อ่านง่าย และตรงกับไฟล์ sql/12_behind_the_scenes.sql
   ? = พารามิเตอร์ที่ส่งแยกจากตัว SQL (prepared statement) ป้องกัน SQL injection
   ===================================================================== */

/* ---------- ไฟล์ตั้งต้นของเมือง (โฟลเดอร์ sql/) ---------- */
export const CASTLE_SETUP_FILES = [
  'sql/00_schema.sql',      // CREATE TABLE ทั้ง 5 ตาราง
  'sql/01_seed_data.sql',   // ข้อมูลเริ่มต้น
]

/* ---------- SNAPSHOT: อ่านทุกตารางหลังรันคำสั่ง แล้วปรับฉาก 3D ให้ตรง ---------- */
export const TABLES = ['islands', 'buildings', 'residents', 'lanterns', 'routes']

export const selectWholeTable = table => `
  SELECT *
  FROM ${table}
  ORDER BY id`


/* ---------- INSPECTOR: คลิกวัตถุในฉาก แล้วแสดงข้อมูลของแถวนั้น ---------- */
export const INSPECT = {

  building: `
    SELECT b.id, b.name, b.type, b.roof_color, b.occupied,
           i.name AS island
    FROM buildings b
    JOIN islands i ON i.id = b.island_id
    WHERE b.id = ?`,

  residentsOfBuilding: `
    SELECT name, occupation, age
    FROM residents
    WHERE building_id = ?
    ORDER BY id`,

  lanternsOfBuilding: `
    SELECT id, brightness, active, color
    FROM lanterns
    WHERE building_id = ?
    ORDER BY id`,

  island: `
    SELECT id, name, altitude, district,
           (SELECT COUNT(*)
            FROM buildings
            WHERE island_id = islands.id) AS buildings
    FROM islands
    WHERE id = ?`,

  lantern: `
    SELECT l.id, l.brightness, l.active, b.name, l.island_id, l.color
    FROM lanterns l
    LEFT JOIN buildings b ON b.id = l.building_id
    WHERE l.id = ?`,
}


/* ---------- TABLE GUIDE: อ่านโครงสร้างตารางจริงจาก SQLite ---------- */
export const GUIDE = {
  columns:     table => `PRAGMA table_info(${table})`,
  foreignKeys: table => `PRAGMA foreign_key_list(${table})`,
}


/* =====================================================================
   SQL INJECTION LAB (ฐานข้อมูลแยก · ข้อมูลสมมติทั้งหมด)
   ===================================================================== */
export const LAB_SETUP = `
  CREATE TABLE accounts (
    id        INTEGER PRIMARY KEY,
    username  TEXT NOT NULL,
    password  TEXT NOT NULL,
    role      TEXT NOT NULL
  );
  INSERT INTO accounts (id, username, password, role) VALUES
    (1, 'warden',      'moonlight-42', 'keeper'),
    (2, 'scribe',      'inkwell-7',    'archivist'),
    (3, 'lamplighter', 'ember-19',     'staff');

  CREATE TABLE vault (
    id      INTEGER PRIMARY KEY,
    item    TEXT NOT NULL,
    secret  TEXT NOT NULL
  );
  INSERT INTO vault (id, item, secret) VALUES
    (1, 'Moonstone Crown', 'chest code 7714'),
    (2, 'Star Charts',     'under the 3rd stair'),
    (3, 'Gold Reserve',    '4,800 crowns');`

/*  VULNERABLE · ต่อสตริง: ข้อความที่ผู้ใช้พิมพ์กลายเป็นส่วนหนึ่งของคำสั่ง SQL */
export const LOGIN_SQL_PARTS = {
  beforeUser: "SELECT id, username, role FROM accounts\nWHERE username = '",
  betweenUserAndPass: "' AND password = '",
  afterPass: "'",
}
export function buildVulnerableLogin(username, password) {
  const { beforeUser, betweenUserAndPass, afterPass } = LOGIN_SQL_PARTS
  return beforeUser + username + betweenUserAndPass + password + afterPass
}

/*  PROTECTED · prepared statement: SQL ตายตัว ค่าที่พิมพ์ส่งแยกเป็นพารามิเตอร์ */
export const LOGIN_PROTECTED = `
  SELECT id, username, role
  FROM accounts
  WHERE username = ? AND password = ?`

/* ค่าที่ห้ามหลุดออกจากฐานข้อมูล · ใช้แค่ระบายสีแดงในตารางผลลัพธ์ */
export const LAB_SECRET_VALUES = `
  SELECT password FROM accounts
  UNION
  SELECT secret FROM vault`
