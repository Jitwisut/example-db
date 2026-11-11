-- =====================================================================
--  01 · SEED DATA · ข้อมูลเริ่มต้นของเมือง
--  ปุ่ม RESET ในเว็บจะล้างฐานข้อมูลแล้วรันไฟล์ 00 + 01 ใหม่
-- =====================================================================

-- เกาะลอยฟ้า 7 เกาะ (altitude = ความสูงเป็นเมตร)
INSERT INTO islands (id, name, altitude, district) VALUES
  (1, 'Castle Isle',  1200, 'Keep'),
  (2, 'Ember Rest',   1206, 'Hearth'),
  (3, 'Porchlight',   1192, 'Porch'),
  (4, 'Lantern Rock', 1178, 'Lanterns'),
  (5, 'Flag Spire',   1224, 'Watch'),
  (6, 'Millbrook',    1196, 'Market'),
  (7, 'Thornwick',    1216, 'Archive');

-- อาคาร 17 หลัง · island_id ชี้ไปที่ islands.id · occupied 1 = มีคนอยู่, 0 = ว่าง
INSERT INTO buildings (id, island_id, name, type, roof_color, occupied) VALUES
  (1,  1, 'Great Keep',        'keep',    'red',   1),
  (2,  1, 'Moon Tower',        'tower',   'red',   1),
  (3,  1, 'East Tower',        'tower',   'red',   1),
  (4,  1, 'West Tower',        'tower',   'red',   1),
  (5,  1, 'Green Hall',        'hall',    'green', 1),
  (6,  1, 'Market Stall',      'stall',   'cream', 0),
  (7,  1, 'Lamplighter House', 'cottage', 'slate', 1),
  (8,  2, 'Ember Cottage',     'cottage', 'red',   1),
  (9,  3, 'Porch House',       'house',   'slate', 1),
  (10, 5, 'Flag Spire',        'tower',   'red',   0),
  (11, 6, 'Mill House',        'house',   'green', 1),
  (12, 6, 'Baker''s Rest',     'cottage', 'red',   1),
  (13, 6, 'Weaver Cottage',    'cottage', 'slate', 1),
  (14, 6, 'Tall Barn',         'barn',    'brown', 0),
  (15, 7, 'Scribe Hall',       'hall',    'slate', 1),
  (16, 7, 'Thorn Cottage',     'cottage', 'green', 1),
  (17, 7, 'Watch Hut',         'cottage', 'brown', 0);

-- ผู้อยู่อาศัย 17 คน · building_id ชี้ไปที่ buildings.id
INSERT INTO residents (id, building_id, name, occupation, age) VALUES
  (1,  1,  'Aurel Vane',  'steward',      58),
  (2,  1,  'Mira Vane',   'astronomer',   54),
  (3,  2,  'Sefa Lune',   'archivist',    31),
  (4,  3,  'Tomas Reed',  'bellkeeper',   46),
  (5,  4,  'Ila Brand',   'cartographer', 29),
  (6,  5,  'Oren Pike',   'cook',         41),
  (7,  5,  'Nell Pike',   'gardener',     38),
  (8,  7,  'Bram Hollow', 'lamplighter',  63),
  (9,  8,  'Rosa Ember',  'potter',       35),
  (10, 9,  'Kit Marlow',  'weaver',       27),
  (11, 9,  'June Marlow', 'weaver',       25),
  (12, 11, 'Hugo Crane',  'miller',       52),
  (13, 12, 'Petra Bloom', 'baker',        44),
  (14, 13, 'Lio Fenn',    'dyer',         33),
  (15, 15, 'Odile Quill', 'scribe',       47),
  (16, 15, 'Yan Quill',   'apprentice',   19),
  (17, 16, 'Wren Thorn',  'herbalist',    36);

-- ตะเกียง 11 ดวง · ติดกับอาคาร (building_id) หรือแขวนบนเกาะ (island_id) อย่างใดอย่างหนึ่ง
INSERT INTO lanterns (id, building_id, island_id, brightness, active, color) VALUES
  (1,  6,    NULL, 0.8,  1, 'warm'),
  (2,  1,    NULL, 0.55, 1, 'warm'),
  (3,  9,    NULL, 0.9,  1, 'warm'),
  (4,  8,    NULL, 0.7,  1, 'warm'),
  (5,  NULL, 4,    0.85, 1, 'cyan'),
  (6,  11,   NULL, 0.6,  1, 'warm'),
  (7,  12,   NULL, 0.75, 1, 'warm'),
  (8,  15,   NULL, 0.65, 1, 'purple'),
  (9,  17,   NULL, 0.5,  0, 'warm'),
  (10, 7,    NULL, 0.9,  1, 'warm'),
  (11, 5,    NULL, 0.7,  1, 'warm');

-- เส้นทาง 9 เส้นระหว่างเกาะ
INSERT INTO routes (id, from_island_id, to_island_id, route_type) VALUES
  (1, 1, 2, 'lantern path'),
  (2, 1, 3, 'timber bridge'),
  (3, 1, 4, 'sky ferry'),
  (4, 1, 5, 'lantern path'),
  (5, 1, 6, 'timber bridge'),
  (6, 1, 7, 'lantern path'),
  (7, 6, 2, 'sky ferry'),
  (8, 7, 5, 'lantern path'),
  (9, 3, 7, 'sky ferry');
