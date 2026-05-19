import Link from 'next/link'
import Layout from '../components/Layout'

const clubs = [
  { name: 'ชมรมวิทยาศาสตร์', icon: '🔬', members: '120', category: 'วิชาการ' },
  { name: 'ชมรม E-Sports', icon: '🎮', members: '80', category: 'กีฬา/เทคโนโลยี' },
  { name: 'ชมรมดนตรีไทย', icon: '🎵', members: '65', category: 'ศิลปวัฒนธรรม' },
  { name: 'ชมรมนาฏศิลป์', icon: '💃', members: '75', category: 'ศิลปวัฒนธรรม' },
  { name: 'ชมรมฟุตบอล', icon: '⚽', members: '90', category: 'กีฬา' },
  { name: 'ชมรมภาษาอังกฤษ', icon: '🌍', members: '110', category: 'วิชาการ' },
  { name: 'ชมรมถ่ายภาพ', icon: '📸', members: '55', category: 'ศิลปะ' },
  { name: 'ชมรมอาสาพัฒนา', icon: '🌱', members: '100', category: 'จิตอาสา' },
]

const activities = [
  {
    title: 'วันไหว้ครู',
    desc: 'พิธีแสดงความกตัญญูต่อครูผู้สอน นักเรียนร่วมกันจัดพานดอกไม้และแสดงความเคารพ',
    icon: '🙏',
    month: 'มิถุนายน',
  },
  {
    title: 'กีฬาสีประจำปี',
    desc: 'การแข่งขันกีฬาระหว่างบ้านสีต่างๆ ของโรงเรียน เน้นความสามัคคีและน้ำใจนักกีฬา',
    icon: '🏆',
    month: 'ธันวาคม',
  },
  {
    title: 'งานวิชาการ Open House',
    desc: 'การแสดงผลงานและโครงงานวิทยาศาสตร์ของนักเรียน เปิดให้ผู้ปกครองและประชาชนทั่วไปเข้าชม',
    icon: '🔭',
    month: 'สิงหาคม',
  },
  {
    title: 'กิจกรรมค่ายวิชาการ',
    desc: 'ค่ายพักแรมเสริมทักษะทางวิชาการและการใช้ชีวิต สร้างความสัมพันธ์ระหว่างนักเรียน',
    icon: '🏕️',
    month: 'ตุลาคม',
  },
  {
    title: 'การแข่งขัน E-Sports',
    desc: 'การแข่งขัน E-Sports ภายในโรงเรียน ส่งเสริมทักษะการคิดเชิงกลยุทธ์และการทำงานเป็นทีม',
    icon: '🎮',
    month: 'กรกฎาคม',
  },
  {
    title: 'พิธีรับประกาศนียบัตร',
    desc: 'พิธีมอบประกาศนียบัตรแก่นักเรียนที่สำเร็จการศึกษา ชั้น ม.3 และ ม.6',
    icon: '🎓',
    month: 'มีนาคม',
  },
]

export default function StudentLifePage() {
  return (
    <Layout title="กิจกรรมนักเรียน">
      <div className="gradient-page-header on-gradient py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 on-gradient-link text-sm mb-2">
            <Link href="/" className="hover:text-[var(--on-gradient-text)] transition-colors">หน้าแรก</Link>
            <span>›</span>
            <span>กิจกรรมนักเรียน</span>
          </div>
          <h1 className="text-3xl font-bold">กิจกรรมนักเรียน</h1>
          <p className="on-gradient-muted mt-1">ชมรม สภานักเรียน และกิจกรรมพัฒนาผู้เรียน</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Student Council */}
        <section className="mb-14">
          <div className="bg-gradient-to-br from-primary-700 to-primary-900 rounded-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gold-400/20 border border-gold-400/30 flex items-center justify-center shrink-0">
                <span className="text-3xl">🏛️</span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">สภานักเรียน</h2>
                <p className="text-primary-200 leading-relaxed text-sm">
                  สภานักเรียนโรงเรียนราชสีมาวิทยาลัยเป็นองค์กรตัวแทนนักเรียน ทำหน้าที่ส่งเสริมสิทธิและความเป็นอยู่ที่ดี
                  ของนักเรียน จัดกิจกรรมเพื่อพัฒนาโรงเรียน และเป็นสะพานเชื่อมระหว่างนักเรียนกับฝ่ายบริหาร
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center shrink-0">
                <div className="bg-white/10 rounded-xl p-3">
                  <div className="text-2xl font-bold text-gold-300">25</div>
                  <div className="text-primary-300 text-xs">สมาชิก</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <div className="text-2xl font-bold text-gold-300">12</div>
                  <div className="text-primary-300 text-xs">คณะกรรมการ</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Clubs */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">ชมรมของโรงเรียน</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {clubs.map((club) => (
              <div
                key={club.name}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-150"
              >
                <div className="text-4xl mb-3">{club.icon}</div>
                <h3 className="font-semibold text-slate-800 text-sm mb-1 leading-tight">{club.name}</h3>
                <div className="text-xs text-slate-400 mb-2">{club.category}</div>
                <div className="text-xs font-medium text-primary-600 bg-primary-50 rounded-full px-2.5 py-1">
                  {club.members} สมาชิก
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Activities */}
        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-6">กิจกรรมประจำปี</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activities.map((act) => (
              <div key={act.title} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-150">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">{act.icon}</span>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base leading-snug">{act.title}</h3>
                    <span className="text-xs text-primary-600 font-medium bg-primary-50 px-2 py-0.5 rounded-full">
                      {act.month}
                    </span>
                  </div>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">{act.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/calendar"
              className="inline-flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              ดูปฏิทินกิจกรรมทั้งหมด
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  )
}
