import type { GetStaticProps } from 'next'
import Link from 'next/link'
import Layout from '../components/Layout'
import { readData } from '../lib/data'

interface ManagementMember {
  id: string
  title: string
  name: string
  dept: string
  order: number
  photo: string
}

interface Props {
  management: ManagementMember[]
}

const milestones = [
  { year: '2497', text: 'ก่อตั้งโรงเรียนราชสีมาวิทยาลัยโดยคณะกรรมการศึกษาจังหวัดนครราชสีมา' },
  { year: '2520', text: 'ได้รับการยอมรับให้เป็นโรงเรียนประจำจังหวัดระดับมัธยมศึกษา' },
  { year: '2540', text: 'เปิดห้องเรียนพิเศษวิทยาศาสตร์-คณิตศาสตร์ (Science-Math Program)' },
  { year: '2555', text: 'ผ่านการรับรองมาตรฐานโรงเรียนมาตรฐานสากล (World-Class Standard School)' },
  { year: '2565', text: 'ครบรอบ 68 ปีการก่อตั้ง มีนักเรียนกว่า 3,200 คน' },
]

export default function AboutPage({ management }: Props) {
  return (
    <Layout title="เกี่ยวกับโรงเรียน">
      {/* Header */}
      <div className="gradient-page-header on-gradient py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 on-gradient-link text-sm mb-2">
            <Link href="/" className="hover:text-[var(--on-gradient-text)] transition-colors">หน้าแรก</Link>
            <span>›</span>
            <span>เกี่ยวกับโรงเรียน</span>
          </div>
          <h1 className="text-3xl font-bold">เกี่ยวกับโรงเรียน</h1>
          <p className="on-gradient-muted mt-1">ประวัติ วิสัยทัศน์ และโครงสร้างการบริหาร</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Management — shown first */}
        <section id="management" className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gold-500 rounded-full" />
            <h2 className="text-2xl font-bold text-slate-800">ทำเนียบผู้บริหาร</h2>
          </div>
          {management.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">ยังไม่มีข้อมูลผู้บริหาร</div>
          )}
          {management.length > 0 && (
            <>
              {/* Director — portrait card */}
              <div className="flex justify-center mb-6">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 w-48 sm:w-56">
                  <div className="w-full aspect-[3/4] bg-gradient-to-br from-primary-700 to-primary-900 overflow-hidden">
                    {management[0].photo ? (
                      <img src={management[0].photo} alt={management[0].name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-4 text-center">
                    <div className="text-xs font-semibold text-gold-600 mb-1">{management[0].title}</div>
                    <div className="font-bold text-slate-800 text-sm sm:text-base leading-snug">{management[0].name}</div>
                    {management[0].dept && <div className="text-xs text-slate-400 mt-0.5">{management[0].dept}</div>}
                  </div>
                </div>
              </div>
              {/* Deputies — horizontal cards */}
              {management.length > 1 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  {management.slice(1).map((person) => (
                    <div key={person.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex">
                      <div className="w-16 sm:w-20 shrink-0 bg-gradient-to-br from-primary-700 to-primary-900 overflow-hidden self-stretch">
                        {person.photo ? (
                          <img src={person.photo} alt={person.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full min-h-20 flex items-center justify-center">
                            <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-2 sm:p-3 flex flex-col justify-center min-w-0">
                        <div className="text-xs font-medium text-gold-600 leading-tight mb-0.5 line-clamp-2">{person.title}</div>
                        <div className="font-semibold text-slate-800 text-xs sm:text-sm leading-snug">{person.name}</div>
                        {person.dept && <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{person.dept}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* History */}
        <section id="history" className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gold-500 rounded-full" />
            <h2 className="text-2xl font-bold text-slate-800">ประวัติโรงเรียน</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="bg-white rounded-2xl p-7 shadow-sm border border-slate-100">
              <p className="text-slate-600 leading-relaxed mb-4">
                โรงเรียนราชสีมาวิทยาลัยเป็นโรงเรียนมัธยมศึกษาประจำจังหวัดนครราชสีมา
                ก่อตั้งขึ้นเมื่อปีพุทธศักราช 2497 โดยมุ่งเน้นการจัดการศึกษาระดับมัธยมศึกษา
                เพื่อพัฒนาเยาวชนของจังหวัดให้มีคุณภาพและก้าวสู่การเป็นกำลังสำคัญของชาติ
              </p>
              <p className="text-slate-600 leading-relaxed mb-4">
                ตลอดระยะเวลากว่า 70 ปีที่ผ่านมา โรงเรียนราชสีมาวิทยาลัยได้พัฒนาอย่างต่อเนื่อง
                ทั้งด้านหลักสูตรการเรียนการสอน สิ่งแวดล้อม และเทคโนโลยีการศึกษา
                เพื่อให้นักเรียนได้รับการศึกษาที่มีมาตรฐานสูงสุด
              </p>
              <p className="text-slate-600 leading-relaxed">
                ปัจจุบันโรงเรียนมีนักเรียนกว่า 3,200 คน คณาจารย์ผู้ทรงคุณวุฒิกว่า 200 คน
                และบุคลากรสนับสนุนอีกกว่า 50 คน พร้อมสิ่งอำนวยความสะดวกและห้องปฏิบัติการ
                ที่ทันสมัยครบครัน
              </p>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              {milestones.map((m, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-xl bg-primary-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {m.year}
                    </div>
                    {i < milestones.length - 1 && (
                      <div className="w-0.5 flex-1 bg-slate-200 my-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-slate-600 text-sm leading-relaxed pt-2">{m.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section id="vision" className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gold-500 rounded-full" />
            <h2 className="text-2xl font-bold text-slate-800">วิสัยทัศน์และพันธกิจ</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: '🎯',
                title: 'วิสัยทัศน์',
                text: 'โรงเรียนมาตรฐานสากล มุ่งเน้นความเป็นเลิศทางวิชาการ มีคุณธรรม นำสู่สากล',
                bg: 'bg-primary-50 border-primary-100',
              },
              {
                icon: '🚀',
                title: 'พันธกิจ',
                text: 'พัฒนาผู้เรียนให้มีคุณภาพตามมาตรฐานสากล ส่งเสริมคุณธรรม จริยธรรม และความเป็นไทย',
                bg: 'bg-gold-100 border-gold-200',
              },
              {
                icon: '⭐',
                title: 'เป้าหมาย',
                text: 'ผู้เรียนทุกคนได้รับการพัฒนาอย่างเต็มศักยภาพ ทั้งด้านวิชาการ คุณธรรม และทักษะชีวิต',
                bg: 'bg-emerald-50 border-emerald-100',
              },
            ].map((item) => (
              <div key={item.title} className={`rounded-2xl p-6 border ${item.bg}`}>
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section>
          <div className="bg-primary-700 rounded-2xl p-8 text-white text-center">
            <h3 className="text-xl font-bold mb-2">ติดต่อโรงเรียน</h3>
            <p className="text-primary-200 mb-5 text-sm">เลขที่ 1497 ถนนมิตรภาพ ตำบลในเมือง อำเภอเมือง จังหวัดนครราชสีมา 30000</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
                📞 044-242-571
              </span>
              <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
                ✉️ admin@rachasimawit.ac.th
              </span>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const management = (await readData<ManagementMember[]>('management.json', []))
    .sort((a, b) => a.order - b.order)
  return { props: { management }, revalidate: 60 }
}
