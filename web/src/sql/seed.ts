// ข้อมูลตั้งต้นชุดเดียวกับ main.py (reset_employee และบท 12 Join)
// ทุกครั้งที่สร้างฐานข้อมูลใหม่จะได้ข้อมูลชุดนี้เสมอ

export const SEED_SQL = `
CREATE TABLE EMPLOYEE(
  FIRST_NAME CHAR(20) NOT NULL,
  LAST_NAME  CHAR(20),
  AGE        INT,
  SEX        CHAR(1),
  INCOME     FLOAT
);
INSERT INTO EMPLOYEE(FIRST_NAME, LAST_NAME, AGE, SEX, INCOME) VALUES
  ('Ramya',    'Rama priya',  27, 'F', 9000),
  ('Vinay',    'Battacharya', 20, 'M', 6000),
  ('Sharukh',  'Sheik',       25, 'M', 8300),
  ('Sarmista', 'Sharma',      26, 'F', 10000),
  ('Tripthi',  'Mishra',      24, 'F', 6000);

CREATE TABLE EMP(
  FIRST_NAME CHAR(20) NOT NULL,
  LAST_NAME  CHAR(20),
  AGE        INT,
  SEX        CHAR(1),
  INCOME     FLOAT,
  CONTACT    INT
);
INSERT INTO EMP VALUES
  ('Ramya',    'Rama priya',  27, 'F', 9000,  101),
  ('Vinay',    'Battacharya', 20, 'M', 6000,  102),
  ('Sharukh',  'Sheik',       25, 'M', 8300,  103),
  ('Sarmista', 'Sharma',      26, 'F', 10000, 104),
  ('Tripthi',  'Mishra',      24, 'F', 6000,  NULL);

CREATE TABLE CONTACT(
  ID    INT,
  EMAIL CHAR(20),
  CITY  CHAR(20)
);
INSERT INTO CONTACT VALUES
  (101, 'Krishna@mymail.com', 'Hyderabad'),
  (102, 'Raja@mymail.com',    'Vishakhapatnam'),
  (103, 'Krishna@mymail.com', 'Pune'),
  (104, 'Raja@mymail.com',    'Mumbai');
`
