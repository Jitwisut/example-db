import { CATEGORIES } from '../content/topics'

export function Home() {
  const total = CATEGORIES.reduce((n, c) => n + c.topics.length, 0)
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="cat-code">SQLITE · WASM</span> {total} หัวข้อ ใน {CATEGORIES.length} หมวด
          </p>
          <h1 className="hero-title">
            SQL<span className="slash">/</span>
            <br />
            DIMENSION
          </h1>
          <p className="hero-lead">
            รวมคำสั่ง SQL แยกเป็นหมวด อ่านคำอธิบายสั้น ๆ แล้วกดรันดูผลจริงจาก SQLite ที่ทำงานในเบราว์เซอร์
            แก้คำสั่งเองได้ทุกตัวอย่าง
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href={`#/topic/${CATEGORIES[0].topics[0].id}`}>
              เริ่มดูหัวข้อแรก <span aria-hidden="true">→</span>
            </a>
            <a className="btn btn-ghost" href="#/lab">
              เข้า SQL Lab
            </a>
          </div>
        </div>
        <HeroCore />
      </section>

      <section className="catalog" aria-label="หมวดหัวข้อ SQL">
        {CATEGORIES.map((cat) => (
          <article key={cat.id} className={`cat-block accent-${cat.accent}`}>
            <header>
              <span className="cat-code">{cat.code}</span>
              <h2>{cat.name}</h2>
            </header>
            <ul>
              {cat.topics.map((t) => (
                <li key={t.id}>
                  <a href={`#/topic/${t.id}`}>
                    <code>{t.keyword}</code>
                    <span>{t.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </article>
        ))}
        <a className="cat-block lab-block" href="#/lab">
          <header>
            <span className="cat-code">LAB</span>
            <h2>ห้องทดลอง SQL</h2>
          </header>
          <p>พิมพ์ SQL อะไรก็ได้ ฐานข้อมูลเก็บการเปลี่ยนแปลงไว้ให้เล่นต่อ กดรีเซ็ตเมื่อไหร่ก็กลับเป็นข้อมูลตั้งต้น</p>
          <span className="lab-go">เปิด Lab →</span>
        </a>
      </section>
    </div>
  )
}

/** ภาพฐานข้อมูลแบบ CSS 3D: ทรงกระบอกซ้อนชั้นกับวงแหวนหมุน */
function HeroCore() {
  return (
    <div className="core" aria-hidden="true">
      <div className="core-stage">
        <div className="ring ring-a" />
        <div className="ring ring-b" />
        <div className="ring ring-c" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="disk" style={{ ['--i' as string]: i }} />
        ))}
      </div>
      <div className="core-labels">
        <span style={{ top: '18%', left: '6%' }}>EMPLOYEE · 5 rows</span>
        <span style={{ top: '48%', right: '0%' }}>EMP · 5 rows</span>
        <span style={{ bottom: '16%', left: '14%' }}>CONTACT · 4 rows</span>
      </div>
    </div>
  )
}
