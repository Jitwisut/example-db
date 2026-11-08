// เนื้อหาหัวข้อ SQL แยกตามหมวด ข้อมูลอ้างอิงตาราง EMPLOYEE / EMP / CONTACT จาก main.py
// ผลลัพธ์ทุกตัวอย่างมาจากการรันจริงใน SQLite ไม่มีการเขียนผลลัพธ์ไว้ล่วงหน้า

export interface Example {
  label: string
  sql: string
}

export interface Topic {
  id: string
  keyword: string
  title: string
  summary: string
  body: string[]
  syntax: string
  examples: Example[]
  tables: string[]
  tips: string[]
}

export interface Category {
  id: string
  code: string
  name: string
  accent: 'cyan' | 'blue' | 'amber' | 'violet' | 'green'
  topics: Topic[]
}

export const CATEGORIES: Category[] = [
  {
    id: 'table',
    code: '01',
    name: 'สร้างและจัดการตาราง',
    accent: 'blue',
    topics: [
      {
        id: 'create-table',
        keyword: 'CREATE TABLE',
        title: 'สร้างตาราง',
        summary: 'กำหนดชื่อตาราง ชื่อคอลัมน์ และชนิดข้อมูลของแต่ละคอลัมน์',
        body: [
          'ตาราง (table) คือที่เก็บข้อมูลเป็นแถว (row) และคอลัมน์ (column) ก่อนจะเก็บข้อมูลได้ต้องสร้างตารางก่อน',
          'แต่ละคอลัมน์ระบุชนิดข้อมูล เช่น INT, TEXT, FLOAT และข้อกำหนดเพิ่มเติม เช่น NOT NULL (ห้ามว่าง) หรือ PRIMARY KEY (ค่าห้ามซ้ำ ใช้ระบุแถว)',
        ],
        syntax: 'CREATE TABLE ชื่อตาราง (\n  คอลัมน์1 ชนิด [ข้อกำหนด],\n  คอลัมน์2 ชนิด\n);',
        examples: [
          {
            label: 'สร้างตาราง PRODUCT',
            sql: `CREATE TABLE PRODUCT(
  ID    INTEGER PRIMARY KEY,
  NAME  TEXT NOT NULL,
  PRICE FLOAT
);

-- ดูโครงสร้างที่เพิ่งสร้าง
PRAGMA table_info(PRODUCT);`,
          },
          {
            label: 'IF NOT EXISTS',
            sql: `-- EMPLOYEE มีอยู่แล้ว ใส่ IF NOT EXISTS จึงไม่ error
CREATE TABLE IF NOT EXISTS EMPLOYEE(FIRST_NAME TEXT);

SELECT name FROM sqlite_master WHERE type = 'table';`,
          },
        ],
        tables: [],
        tips: [
          'ถ้าสร้างตารางชื่อซ้ำจะเกิด error "table already exists" ลองลบ IF NOT EXISTS ในตัวอย่างที่ 2 ดู',
          'SQLite ยืดหยุ่นเรื่องชนิดข้อมูล (type affinity) CHAR(20) ไม่ได้จำกัดความยาวจริง',
        ],
      },
      {
        id: 'insert',
        keyword: 'INSERT',
        title: 'เพิ่มข้อมูล',
        summary: 'เพิ่มแถวใหม่ลงในตาราง ทีละแถวหรือหลายแถวพร้อมกัน',
        body: [
          'INSERT INTO ใช้เพิ่มแถวใหม่ ระบุชื่อคอลัมน์ในวงเล็บ แล้วตามด้วย VALUES ที่เรียงลำดับตรงกัน',
          'คอลัมน์ที่ไม่ได้ระบุจะได้ค่า NULL (ถ้าไม่มีค่า DEFAULT) และใส่หลายแถวได้โดยคั่นแต่ละวงเล็บด้วยจุลภาค',
        ],
        syntax: 'INSERT INTO ตาราง (คอลัมน์1, คอลัมน์2)\nVALUES (ค่า1, ค่า2);',
        examples: [
          {
            label: 'เพิ่ม 1 แถว',
            sql: `INSERT INTO EMPLOYEE(FIRST_NAME, LAST_NAME, AGE, SEX, INCOME)
VALUES ('Nina', 'Patel', 30, 'F', 12000);

SELECT * FROM EMPLOYEE;`,
          },
          {
            label: 'หลายแถว + คอลัมน์ว่าง',
            sql: `INSERT INTO EMPLOYEE(FIRST_NAME, AGE) VALUES
  ('Arjun', 29),
  ('Meera', 31);

-- LAST_NAME, SEX, INCOME ที่ไม่ได้ใส่จะเป็น NULL
SELECT * FROM EMPLOYEE;`,
          },
        ],
        tables: ['EMPLOYEE'],
        tips: [
          'FIRST_NAME เป็น NOT NULL ลองเพิ่มแถวโดยไม่ใส่ FIRST_NAME ดูจะเห็น error',
          'ข้อความต้องอยู่ใน single quote \'...\' ส่วนตัวเลขไม่ต้อง',
        ],
      },
      {
        id: 'table-info',
        keyword: 'PRAGMA',
        title: 'ดูโครงสร้างตาราง',
        summary: 'ตรวจว่าฐานข้อมูลมีตารางอะไร และแต่ละตารางมีคอลัมน์อะไรบ้าง',
        body: [
          'sqlite_master เป็นตารางระบบที่เก็บรายชื่อตารางและคำสั่ง CREATE ของแต่ละตาราง',
          'PRAGMA table_info(ชื่อตาราง) แสดงรายละเอียดคอลัมน์: ลำดับ ชื่อ ชนิด NOT NULL ค่าเริ่มต้น และ PRIMARY KEY',
        ],
        syntax: 'PRAGMA table_info(ชื่อตาราง);',
        examples: [
          {
            label: 'รายชื่อตาราง',
            sql: `SELECT name, sql FROM sqlite_master WHERE type = 'table';`,
          },
          { label: 'คอลัมน์ของ EMPLOYEE', sql: `PRAGMA table_info(EMPLOYEE);` },
          {
            label: 'typeof()',
            sql: `SELECT typeof(NULL), typeof(42), typeof(3.5), typeof('SQLite');`,
          },
        ],
        tables: [],
        tips: ['เทียบได้กับ .tables และ .schema ใน SQLite CLI (ดู cli_practice.sql)'],
      },
      {
        id: 'drop-table',
        keyword: 'DROP TABLE',
        title: 'ลบตาราง',
        summary: 'ลบทั้งตารางรวมถึงข้อมูลทั้งหมดออกจากฐานข้อมูล',
        body: [
          'DROP TABLE ลบทั้งโครงสร้างและข้อมูล ต่างจาก DELETE ที่ลบเฉพาะแถวแต่ตารางยังอยู่',
          'ใส่ IF EXISTS เพื่อไม่ให้เกิด error ถ้าไม่มีตารางนั้น',
        ],
        syntax: 'DROP TABLE [IF EXISTS] ชื่อตาราง;',
        examples: [
          {
            label: 'ลบตาราง CONTACT',
            sql: `DROP TABLE IF EXISTS CONTACT;

-- เหลือตารางอะไรบ้าง
SELECT name FROM sqlite_master WHERE type = 'table';`,
          },
        ],
        tables: [],
        tips: ['หน้าหัวข้อจะรีเซ็ตฐานข้อมูลทุกครั้งที่กดรัน ลบตารางไปแล้วกดรันใหม่ตารางก็กลับมา'],
      },
    ],
  },
  {
    id: 'read',
    code: '02',
    name: 'ดึงข้อมูล',
    accent: 'cyan',
    topics: [
      {
        id: 'select',
        keyword: 'SELECT',
        title: 'เลือกคอลัมน์',
        summary: 'อ่านข้อมูลจากตาราง เลือกทุกคอลัมน์หรือเฉพาะที่ต้องการ',
        body: [
          'SELECT * อ่านทุกคอลัมน์ หรือระบุชื่อคอลัมน์คั่นด้วยจุลภาคเพื่อเลือกเฉพาะบางคอลัมน์',
          'ตั้งชื่อเล่นให้คอลัมน์ด้วย AS และคำนวณค่าใหม่จากคอลัมน์เดิมได้ เช่น INCOME * 12',
        ],
        syntax: 'SELECT คอลัมน์1, คอลัมน์2 FROM ตาราง;',
        examples: [
          { label: 'ทุกคอลัมน์', sql: `SELECT * FROM EMPLOYEE;` },
          { label: 'บางคอลัมน์', sql: `SELECT FIRST_NAME, AGE FROM EMPLOYEE;` },
          {
            label: 'AS และการคำนวณ',
            sql: `SELECT FIRST_NAME || ' ' || LAST_NAME AS FULL_NAME,
       INCOME * 12 AS YEARLY_INCOME
FROM EMPLOYEE;`,
          },
        ],
        tables: ['EMPLOYEE'],
        tips: ['|| ใช้ต่อข้อความใน SQLite', 'ใช้ * สะดวกตอนสำรวจ แต่ในโปรแกรมจริงควรระบุคอลัมน์ให้ชัด'],
      },
      {
        id: 'where',
        keyword: 'WHERE',
        title: 'กรองแถว',
        summary: 'เลือกเฉพาะแถวที่ตรงเงื่อนไข',
        body: [
          'WHERE ตามด้วยเงื่อนไข แถวที่เงื่อนไขเป็นจริงเท่านั้นที่จะอยู่ในผลลัพธ์',
          'ตัวเปรียบเทียบ: = เท่ากับ, <> หรือ != ไม่เท่ากับ, > < >= <=',
        ],
        syntax: 'SELECT * FROM ตาราง WHERE เงื่อนไข;',
        examples: [
          { label: 'อายุน้อยกว่า 23', sql: `SELECT * FROM EMPLOYEE WHERE AGE < 23;` },
          { label: 'เพศหญิง', sql: `SELECT FIRST_NAME, SEX FROM EMPLOYEE WHERE SEX = 'F';` },
          { label: 'รายได้ไม่เท่ากับ 6000', sql: `SELECT FIRST_NAME, INCOME FROM EMPLOYEE WHERE INCOME <> 6000;` },
        ],
        tables: ['EMPLOYEE'],
        tips: ['ตัวอย่างแรกตรงกับบทที่ 6 ใน main.py'],
      },
      {
        id: 'conditions',
        keyword: 'AND · OR · IN · BETWEEN',
        title: 'รวมหลายเงื่อนไข',
        summary: 'ต่อเงื่อนไขหลายข้อเข้าด้วยกัน และเช็กช่วงหรือรายการค่า',
        body: [
          'AND ต้องจริงทุกข้อ ส่วน OR จริงข้อใดข้อหนึ่งก็พอ ใช้วงเล็บกำหนดลำดับเมื่อผสมกัน',
          'IN (...) เช็กว่าค่าอยู่ในรายการ และ BETWEEN a AND b เช็กช่วงโดยรวมค่าปลายทั้งสองด้าน',
        ],
        syntax: "WHERE เงื่อนไข1 AND (เงื่อนไข2 OR เงื่อนไข3)\nWHERE คอลัมน์ IN ('a', 'b')\nWHERE คอลัมน์ BETWEEN 10 AND 20",
        examples: [
          {
            label: 'AND',
            sql: `SELECT FIRST_NAME, AGE, SEX FROM EMPLOYEE
WHERE SEX = 'F' AND AGE > 25;`,
          },
          {
            label: 'OR',
            sql: `SELECT FIRST_NAME, AGE, INCOME FROM EMPLOYEE
WHERE AGE < 21 OR INCOME >= 10000;`,
          },
          {
            label: 'BETWEEN + IN',
            sql: `SELECT FIRST_NAME, AGE, SEX FROM EMPLOYEE
WHERE AGE BETWEEN 24 AND 27 AND SEX IN ('F');`,
          },
        ],
        tables: ['EMPLOYEE'],
        tips: ['AND ทำก่อน OR เสมอ ถ้าไม่แน่ใจให้ใส่วงเล็บ'],
      },
      {
        id: 'like',
        keyword: 'LIKE',
        title: 'ค้นหาข้อความตามรูปแบบ',
        summary: 'ค้นข้อความที่ขึ้นต้น ลงท้าย หรือมีคำที่ต้องการ',
        body: [
          '% แทนตัวอักษรกี่ตัวก็ได้ (รวมศูนย์ตัว) และ _ แทนตัวอักษร 1 ตัวพอดี',
          'LIKE ใน SQLite ไม่สนตัวพิมพ์เล็ก/ใหญ่สำหรับตัวอักษรภาษาอังกฤษ',
        ],
        syntax: "WHERE คอลัมน์ LIKE 'S%'",
        examples: [
          { label: "ขึ้นต้นด้วย S", sql: `SELECT FIRST_NAME FROM EMPLOYEE WHERE FIRST_NAME LIKE 'S%';` },
          { label: "มีคำว่า ar", sql: `SELECT FIRST_NAME, LAST_NAME FROM EMPLOYEE WHERE LAST_NAME LIKE '%ar%';` },
          { label: 'ยาว 5 ตัวอักษร', sql: `SELECT FIRST_NAME FROM EMPLOYEE WHERE FIRST_NAME LIKE '_____';` },
        ],
        tables: ['EMPLOYEE'],
        tips: ['ใช้ NOT LIKE เพื่อเอาแถวที่ไม่ตรงรูปแบบ'],
      },
      {
        id: 'null',
        keyword: 'IS NULL',
        title: 'จัดการค่าว่าง',
        summary: 'NULL หมายถึง "ไม่มีค่า" ต้องใช้ IS NULL ไม่ใช่ = NULL',
        body: [
          'NULL ไม่เท่ากับอะไรเลย แม้แต่ NULL ด้วยกัน เงื่อนไข = NULL จึงไม่เคยเป็นจริง',
          'ใช้ IS NULL / IS NOT NULL เพื่อเช็ก และ COALESCE(ค่า, ค่าสำรอง) เพื่อแทนค่าว่าง',
        ],
        syntax: 'WHERE คอลัมน์ IS NULL',
        examples: [
          { label: 'IS NULL', sql: `SELECT FIRST_NAME, CONTACT FROM EMP WHERE CONTACT IS NULL;` },
          { label: '= NULL (ผิด)', sql: `-- ได้ 0 แถว เพราะ NULL = NULL ไม่เป็นจริง\nSELECT FIRST_NAME, CONTACT FROM EMP WHERE CONTACT = NULL;` },
          {
            label: 'COALESCE',
            sql: `SELECT FIRST_NAME, COALESCE(CONTACT, 'ไม่มีข้อมูล') AS CONTACT FROM EMP;`,
          },
        ],
        tables: ['EMP'],
        tips: ['Tripthi ในตาราง EMP ไม่มี CONTACT จึงเป็น NULL'],
      },
      {
        id: 'order-by',
        keyword: 'ORDER BY',
        title: 'เรียงลำดับ',
        summary: 'เรียงผลลัพธ์จากน้อยไปมาก (ASC) หรือมากไปน้อย (DESC)',
        body: [
          'ค่าเริ่มต้นคือ ASC (น้อยไปมาก) ถ้าต้องการมากไปน้อยให้เติม DESC',
          'เรียงได้หลายคอลัมน์ คอลัมน์แรกเท่ากันจะดูคอลัมน์ถัดไป',
        ],
        syntax: 'SELECT ... FROM ตาราง ORDER BY คอลัมน์ [ASC|DESC];',
        examples: [
          { label: 'อายุน้อยไปมาก', sql: `SELECT FIRST_NAME, AGE FROM EMPLOYEE ORDER BY AGE;` },
          { label: 'รายได้มากไปน้อย', sql: `SELECT FIRST_NAME, INCOME FROM EMPLOYEE ORDER BY INCOME DESC;` },
          {
            label: 'สองคอลัมน์',
            sql: `SELECT FIRST_NAME, INCOME, AGE FROM EMPLOYEE
ORDER BY INCOME DESC, AGE ASC;`,
          },
        ],
        tables: ['EMPLOYEE'],
        tips: ['ตัวอย่างที่ 3: Vinay และ Tripthi รายได้ 6000 เท่ากัน จึงเรียงตามอายุต่อ'],
      },
      {
        id: 'limit',
        keyword: 'LIMIT',
        title: 'จำกัดจำนวนแถว',
        summary: 'เอาแค่ N แถวแรกของผลลัพธ์ และข้ามแถวด้วย OFFSET',
        body: [
          'LIMIT n คืนผลลัพธ์ไม่เกิน n แถว มักใช้คู่กับ ORDER BY เพื่อหา "อันดับต้น ๆ"',
          'OFFSET m ข้าม m แถวแรกก่อน ใช้ทำการแบ่งหน้า (pagination)',
        ],
        syntax: 'SELECT ... LIMIT n [OFFSET m];',
        examples: [
          { label: '3 แถวแรก', sql: `SELECT * FROM EMPLOYEE LIMIT 3;` },
          {
            label: 'รายได้สูงสุด 2 คน',
            sql: `SELECT FIRST_NAME, INCOME FROM EMPLOYEE
ORDER BY INCOME DESC LIMIT 2;`,
          },
          { label: 'OFFSET', sql: `SELECT FIRST_NAME FROM EMPLOYEE LIMIT 2 OFFSET 2;` },
        ],
        tables: ['EMPLOYEE'],
        tips: ['ถ้าไม่มี ORDER BY ลำดับแถวไม่รับประกัน "3 แถวแรก" อาจเปลี่ยนได้'],
      },
      {
        id: 'distinct',
        keyword: 'DISTINCT',
        title: 'ตัดค่าซ้ำ',
        summary: 'แสดงเฉพาะค่าที่ไม่ซ้ำกัน',
        body: ['SELECT DISTINCT ตัดแถวที่ค่าซ้ำกันทุกคอลัมน์ที่เลือกออก เหลือไว้แถวเดียว'],
        syntax: 'SELECT DISTINCT คอลัมน์ FROM ตาราง;',
        examples: [
          { label: 'อีเมลไม่ซ้ำ', sql: `SELECT DISTINCT EMAIL FROM CONTACT;` },
          { label: 'รายได้ไม่ซ้ำ', sql: `SELECT DISTINCT INCOME FROM EMPLOYEE ORDER BY INCOME;` },
        ],
        tables: ['CONTACT'],
        tips: ['CONTACT มี 4 แถว แต่มีอีเมลแค่ 2 แบบ'],
      },
    ],
  },
  {
    id: 'modify',
    code: '03',
    name: 'แก้ไขและลบข้อมูล',
    accent: 'amber',
    topics: [
      {
        id: 'update',
        keyword: 'UPDATE',
        title: 'แก้ไขข้อมูล',
        summary: 'เปลี่ยนค่าในแถวที่มีอยู่แล้ว',
        body: [
          'UPDATE ... SET คอลัมน์ = ค่าใหม่ แก้ค่าในทุกแถวที่ตรง WHERE',
          'ถ้าลืม WHERE จะแก้ทุกแถวในตาราง ควรทดลอง SELECT ด้วย WHERE เดียวกันก่อนเสมอ',
        ],
        syntax: 'UPDATE ตาราง SET คอลัมน์ = ค่า WHERE เงื่อนไข;',
        examples: [
          {
            label: 'เพิ่มอายุผู้ชาย 1 ปี',
            sql: `UPDATE EMPLOYEE SET AGE = AGE + 1 WHERE SEX = 'M';

SELECT FIRST_NAME, SEX, AGE FROM EMPLOYEE;`,
          },
          {
            label: 'ขึ้นเงินเดือน 10%',
            sql: `UPDATE EMPLOYEE SET INCOME = INCOME * 1.1 WHERE INCOME < 8000;

SELECT FIRST_NAME, INCOME FROM EMPLOYEE;`,
          },
        ],
        tables: ['EMPLOYEE'],
        tips: ['ตัวอย่างแรกตรงกับบทที่ 8 ใน main.py', 'ผลของ UPDATE บอกจำนวนแถวที่ถูกแก้'],
      },
      {
        id: 'delete',
        keyword: 'DELETE',
        title: 'ลบแถว',
        summary: 'ลบแถวที่ตรงเงื่อนไขออกจากตาราง',
        body: [
          'DELETE FROM ลบทั้งแถว ตารางยังอยู่ (ต่างจาก DROP TABLE)',
          'DELETE FROM ตาราง โดยไม่มี WHERE จะลบทุกแถว',
        ],
        syntax: 'DELETE FROM ตาราง WHERE เงื่อนไข;',
        examples: [
          {
            label: 'ลบคนอายุเกิน 25',
            sql: `DELETE FROM EMPLOYEE WHERE AGE > 25;

SELECT * FROM EMPLOYEE;`,
          },
          {
            label: 'ลบทุกแถว',
            sql: `DELETE FROM CONTACT;

SELECT COUNT(*) AS REMAINING FROM CONTACT;`,
          },
        ],
        tables: ['EMPLOYEE'],
        tips: ['ตัวอย่างแรกตรงกับบทที่ 9 ใน main.py'],
      },
    ],
  },
  {
    id: 'aggregate',
    code: '04',
    name: 'สรุปข้อมูล',
    accent: 'violet',
    topics: [
      {
        id: 'aggregate-functions',
        keyword: 'COUNT · SUM · AVG',
        title: 'ฟังก์ชันสรุปผล',
        summary: 'นับ รวม หาค่าเฉลี่ย ค่าน้อยสุด และมากสุดจากหลายแถว',
        body: [
          'COUNT(*) นับจำนวนแถว, SUM รวม, AVG เฉลี่ย, MIN ค่าน้อยสุด, MAX ค่ามากสุด',
          'COUNT(คอลัมน์) นับเฉพาะแถวที่คอลัมน์นั้นไม่เป็น NULL',
        ],
        syntax: 'SELECT COUNT(*), SUM(คอลัมน์), AVG(คอลัมน์) FROM ตาราง;',
        examples: [
          {
            label: 'สรุปรายได้',
            sql: `SELECT COUNT(*)    AS PEOPLE,
       SUM(INCOME) AS TOTAL,
       AVG(INCOME) AS AVERAGE,
       MIN(INCOME) AS LOWEST,
       MAX(INCOME) AS HIGHEST
FROM EMPLOYEE;`,
          },
          {
            label: 'COUNT(*) vs COUNT(คอลัมน์)',
            sql: `SELECT COUNT(*) AS ALL_ROWS, COUNT(CONTACT) AS HAS_CONTACT FROM EMP;`,
          },
        ],
        tables: ['EMPLOYEE'],
        tips: ['ใช้ ROUND(AVG(...), 2) เพื่อปัดทศนิยม'],
      },
      {
        id: 'group-by',
        keyword: 'GROUP BY',
        title: 'จัดกลุ่ม',
        summary: 'แบ่งแถวเป็นกลุ่มตามค่าของคอลัมน์ แล้วสรุปผลแต่ละกลุ่ม',
        body: [
          'GROUP BY รวมแถวที่มีค่าเหมือนกันเป็นกลุ่มเดียว แล้วฟังก์ชันสรุปผลจะคำนวณแยกต่อกลุ่ม',
          'คอลัมน์ใน SELECT ควรเป็นคอลัมน์ที่ใช้จัดกลุ่ม หรือเป็นฟังก์ชันสรุปผล',
        ],
        syntax: 'SELECT คอลัมน์, COUNT(*) FROM ตาราง GROUP BY คอลัมน์;',
        examples: [
          { label: 'นับตามเพศ', sql: `SELECT SEX, COUNT(*) AS TOTAL FROM EMPLOYEE GROUP BY SEX;` },
          {
            label: 'รายได้เฉลี่ยตามเพศ',
            sql: `SELECT SEX, ROUND(AVG(INCOME), 2) AS AVG_INCOME, MAX(AGE) AS OLDEST
FROM EMPLOYEE GROUP BY SEX;`,
          },
          { label: 'นับตามอีเมล', sql: `SELECT EMAIL, COUNT(*) AS CITIES FROM CONTACT GROUP BY EMAIL;` },
        ],
        tables: ['EMPLOYEE'],
        tips: ['ลำดับการทำงาน: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT'],
      },
      {
        id: 'having',
        keyword: 'HAVING',
        title: 'กรองกลุ่ม',
        summary: 'กรองผลหลังจัดกลุ่ม (WHERE กรองแถว แต่ HAVING กรองกลุ่ม)',
        body: [
          'WHERE ทำงานก่อนจัดกลุ่มจึงใช้ฟังก์ชันสรุปผลไม่ได้ ถ้าจะกรองด้วย COUNT/SUM ต้องใช้ HAVING',
        ],
        syntax: 'SELECT ... GROUP BY คอลัมน์ HAVING เงื่อนไขของกลุ่ม;',
        examples: [
          {
            label: 'กลุ่มที่มีมากกว่า 1 คน',
            sql: `SELECT SEX, COUNT(*) AS TOTAL FROM EMPLOYEE
GROUP BY SEX HAVING COUNT(*) > 1 ORDER BY SEX;`,
          },
          {
            label: 'WHERE + HAVING',
            sql: `SELECT SEX, SUM(INCOME) AS TOTAL_INCOME FROM EMPLOYEE
WHERE AGE >= 24
GROUP BY SEX
HAVING SUM(INCOME) > 10000;`,
          },
        ],
        tables: ['EMPLOYEE'],
        tips: ['ลองเปลี่ยน HAVING เป็น WHERE ในตัวอย่างที่ 1 จะเห็น error'],
      },
    ],
  },
  {
    id: 'join',
    code: '05',
    name: 'เชื่อมหลายตาราง',
    accent: 'green',
    topics: [
      {
        id: 'inner-join',
        keyword: 'INNER JOIN',
        title: 'เชื่อมเฉพาะที่จับคู่ได้',
        summary: 'รวมแถวจากสองตารางที่ค่าในคอลัมน์เชื่อมตรงกัน',
        body: [
          'JOIN จับคู่แถวจากสองตารางตามเงื่อนไขใน ON เช่น EMP.CONTACT = CONTACT.ID',
          'INNER JOIN (หรือเขียนแค่ JOIN) เอาเฉพาะแถวที่จับคู่ได้ทั้งสองฝั่ง แถวที่หาคู่ไม่ได้จะหายไป',
        ],
        syntax: 'SELECT ...\nFROM A INNER JOIN B ON A.คอลัมน์ = B.คอลัมน์;',
        examples: [
          {
            label: 'EMP + CONTACT',
            sql: `SELECT EMP.FIRST_NAME, EMP.LAST_NAME, CONTACT.EMAIL, CONTACT.CITY
FROM EMP INNER JOIN CONTACT ON EMP.CONTACT = CONTACT.ID;`,
          },
          {
            label: 'ใช้ชื่อย่อ (alias)',
            sql: `SELECT e.FIRST_NAME, c.CITY
FROM EMP AS e
JOIN CONTACT AS c ON e.CONTACT = c.ID
WHERE c.CITY <> 'Pune';`,
          },
        ],
        tables: ['EMP', 'CONTACT'],
        tips: ['Tripthi มี CONTACT เป็น NULL จึงไม่ปรากฏในผลของ INNER JOIN (ตรงกับบทที่ 12 ใน main.py)'],
      },
      {
        id: 'left-join',
        keyword: 'LEFT JOIN',
        title: 'เก็บทุกแถวฝั่งซ้าย',
        summary: 'แถวฝั่งซ้ายอยู่ครบ ถ้าหาคู่ไม่ได้ ฝั่งขวาจะเป็น NULL',
        body: [
          'LEFT JOIN คืนทุกแถวของตารางซ้าย (ตารางหลัง FROM) ถ้าไม่มีคู่ในตารางขวา คอลัมน์ฝั่งขวาจะเป็น NULL',
          'ใช้หา "แถวที่ไม่มีคู่" ได้ด้วย WHERE ฝั่งขวา IS NULL',
        ],
        syntax: 'SELECT ...\nFROM A LEFT JOIN B ON A.คอลัมน์ = B.คอลัมน์;',
        examples: [
          {
            label: 'ครบทุกคน',
            sql: `SELECT EMP.FIRST_NAME, CONTACT.EMAIL, CONTACT.CITY
FROM EMP LEFT JOIN CONTACT ON EMP.CONTACT = CONTACT.ID;`,
          },
          {
            label: 'หาคนที่ไม่มีข้อมูลติดต่อ',
            sql: `SELECT EMP.FIRST_NAME
FROM EMP LEFT JOIN CONTACT ON EMP.CONTACT = CONTACT.ID
WHERE CONTACT.ID IS NULL;`,
          },
        ],
        tables: ['EMP', 'CONTACT'],
        tips: ['เทียบกับ INNER JOIN: ผลมี 5 แถวแทน 4 แถว เพราะ Tripthi ยังอยู่'],
      },
    ],
  },
]

export const ALL_TOPICS = CATEGORIES.flatMap((c) => c.topics.map((t) => ({ ...t, category: c })))

export type TopicWithCategory = (typeof ALL_TOPICS)[number]

export function findTopic(id: string | undefined): TopicWithCategory | undefined {
  return ALL_TOPICS.find((t) => t.id === id)
}
