import Link from 'next/link'
import Layout from '../components/Layout'

const programs = [
  {
    title: 'ห้องเรียนทั่วไป',
    level: 'ม.1 และ ม.4',
    seats: '240 ที่นั่ง',
    requirements: ['สอบคัดเลือก', 'ผลการเรียน', 'พฤติกรรม'],
    color: 'border-slate-200 bg-white',
    badge: 'bg-slate-100 text-slate-700',
  },
  {
    title: 'ห้องเรียนพิเศษ วิทย์-คณิต',
    level: 'ม.1 และ ม.4',
    seats: '72 ที่นั่ง',
    requirements: ['สอบคัดเลือกเฉพาะ', 'GPAX ไม่ต่ำกว่า 3.00', 'สัมภาษณ์'],
    color: 'border-primary-200 bg-primary-50',
    badge: 'bg-primary-100 text-primary-700',
    highlight: true,
  },
  {
    title: 'ห้องเรียนพิเศษ ภาษาอังกฤษ (EP)',
    level: 'ม.1',
    seats: '36 ที่นั่ง',
    requirements: ['สอบภาษาอังกฤษ', 'ทักษะการฟัง-พูด', 'สัมภาษณ์'],
    color: 'border-gold-200 bg-gold-50',
    badge: 'bg-gold-100 text-gold-700',
  },
]

const timeline = [
  { date: '15 ก.พ. – 15 มี.ค.', label: 'รับสมัคร' },
  { date: '22 มี.ค.', label: 'สอบคัดเลือก' },
  { date: '25 มี.ค.', label: 'ประกาศผล' },
  { date: '1 เม.ย.', label: 'มอบตัว' },
  { date: '20 พ.ค.', label: 'เปิดเรียน' },
]

const docs = [
  'สำเนาทะเบียนบ้าน (นักเรียน)',
  'สำเนาทะเบียนบ้าน (ผู้ปกครอง)',
  'สำเนาบัตรประชาชน (ผู้ปกครอง)',
  'สำเนาระเบียนแสดงผลการเรียน (ปพ.1)',
  'รูปถ่ายขนาด 1 นิ้ว จำนวน 3 รูป',
  'ใบรับรองความประพฤติจากโรงเรียนเดิม',
]

export default function AdmissionsPage() {
  return (
    <Layout title="การรับสมัครนักเรียน">
      <div className="gradient-page-header on-gradient py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 on-gradient-link text-sm mb-2">
            <Link href="/" className="hover:text-[var(--on-gradient-text)] transition-colors">หน้าแรก</Link>
            <span>›</span>
            <span>การรับสมัคร</span>
          </div>
          <h1 className="text-3xl font-bold">การรับสมัครนักเรียน</h1>
          <p className="on-gradient-muted mt-1">ข้อมูลการรับสมัครนักเรียนประจำปีการศึกษา 2568</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Timeline */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">กำหนดการรับสมัคร</h2>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 overflow-x-auto">
              {timeline.map((step, i) => (
                <div key={i} className="flex flex-row sm:flex-col items-center gap-3 sm:gap-1 text-center shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary-700 text-white text-sm font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">{step.label}</div>
                    <div className="text-xs text-primary-600 font-medium">{step.date}</div>
                  </div>
                  {i < timeline.length - 1 && (
                    <div className="hidden sm:block flex-1 h-0.5 bg-slate-200 min-w-8 mx-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Programs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">ประเภทห้องเรียนที่เปิดรับ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {programs.map((prog) => (
              <div
                key={prog.title}
                className={`rounded-2xl p-6 border-2 ${prog.color} ${prog.highlight ? 'shadow-md' : 'shadow-sm'}`}
              >
                {prog.highlight && (
                  <span className="inline-block text-xs font-bold text-primary-700 bg-primary-100 px-2.5 py-1 rounded-full mb-3">
                    ⭐ แนะนำ
                  </span>
                )}
                <h3 className="font-bold text-slate-800 text-lg mb-1">{prog.title}</h3>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${prog.badge}`}>{prog.level}</span>
                  <span className="text-xs text-slate-500">{prog.seats}</span>
                </div>
                <ul className="space-y-1.5">
                  {prog.requirements.map((req) => (
                    <li key={req} className="flex items-center gap-2 text-sm text-slate-600">
                      <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Documents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-5">เอกสารประกอบการสมัคร</h2>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <ul className="space-y-3">
                {docs.map((doc, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-6 h-6 rounded-full bg-primary-50 text-primary-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {i + 1}
                    </div>
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-5">ช่องทางการสมัคร</h2>
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-1">สมัครด้วยตนเอง</h3>
                <p className="text-sm text-slate-500">
                  ณ ห้องทะเบียนโรงเรียนราชสีมาวิทยาลัย<br />
                  วันจันทร์ – ศุกร์ เวลา 08.30 – 16.30 น.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-2">ดาวน์โหลดเอกสาร</h3>
                <Link
                  href="/downloads"
                  className="inline-flex items-center gap-2 bg-primary-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  ไปที่ศูนย์ดาวน์โหลด
                </Link>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <span className="text-amber-600 text-lg">ℹ️</span>
                  <div>
                    <div className="font-semibold text-amber-800 text-sm mb-1">สอบถามเพิ่มเติม</div>
                    <p className="text-sm text-amber-700">โทร. 044-242-571 ต่อ 101<br />งานรับนักเรียน ฝ่ายวิชาการ</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  )
}
