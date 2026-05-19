import type { GetStaticProps } from 'next'
import Link from 'next/link'
import Layout from '../components/Layout'
import { readData } from '../lib/data'

interface Program {
  id: string
  title: string
  subtitle: string
  levels: string[]
  desc: string
  subjects: string[]
  color: string
  featured: boolean
}

interface Achievement {
  id: string
  icon: string
  text: string
}

interface CurriculumData {
  pageTitle: string
  pageSubtitle: string
  programs: Program[]
  achievements: Achievement[]
  cta: {
    title: string
    description: string
    buttonText: string
    buttonLink: string
  }
}

interface Props { data: CurriculumData }

const GRADIENT_MAP: Record<string, string> = {
  slate:   'from-slate-700 to-slate-800',
  primary: 'from-primary-700 to-primary-900',
  gold:    'from-gold-600 to-gold-700',
  emerald: 'from-emerald-600 to-emerald-800',
  rose:    'from-rose-600 to-rose-800',
  indigo:  'from-indigo-600 to-indigo-800',
}

const BADGE_MAP: Record<string, string> = {
  slate:   'bg-slate-100 text-slate-700',
  primary: 'bg-primary-100 text-primary-700',
  gold:    'bg-gold-100 text-gold-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  rose:    'bg-rose-100 text-rose-700',
  indigo:  'bg-indigo-100 text-indigo-700',
}

export default function CurriculumPage({ data }: Props) {
  const { pageTitle, pageSubtitle, programs, achievements, cta } = data

  return (
    <Layout title={pageTitle}>
      <div className="gradient-page-header on-gradient py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 on-gradient-link text-sm mb-2">
            <Link href="/" className="hover:text-[var(--on-gradient-text)] transition-colors">หน้าแรก</Link>
            <span>›</span>
            <span>หลักสูตร</span>
          </div>
          <h1 className="text-3xl font-bold">{pageTitle}</h1>
          {pageSubtitle && <p className="on-gradient-muted mt-1">{pageSubtitle}</p>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Programs */}
        {programs.length > 0 && (
          <section className="mb-14">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">ประเภทห้องเรียน</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {programs.map((prog) => {
                const gradient = GRADIENT_MAP[prog.color] ?? GRADIENT_MAP.primary
                const badge = BADGE_MAP[prog.color] ?? BADGE_MAP.primary
                return (
                  <div
                    key={prog.id}
                    className={`rounded-2xl overflow-hidden shadow-sm ${prog.featured ? 'shadow-lg ring-2 ring-primary-200' : ''}`}
                  >
                    <div className={`bg-gradient-to-br ${gradient} p-6 text-white`}>
                      {prog.featured && (
                        <span className="inline-block text-xs font-bold bg-gold-400/20 text-gold-300 border border-gold-400/30 px-2.5 py-1 rounded-full mb-3">
                          ⭐ แนะนำ
                        </span>
                      )}
                      <h3 className="font-bold text-lg leading-snug mb-1">{prog.title}</h3>
                      <p className="text-white/70 text-sm">{prog.subtitle}</p>
                      {prog.levels.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {prog.levels.map((l) => (
                            <span key={l} className="text-xs bg-white/15 px-2.5 py-1 rounded-full">{l}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="bg-white border border-t-0 border-slate-100 p-5">
                      <p className="text-slate-600 text-sm leading-relaxed mb-4">{prog.desc}</p>
                      {prog.subjects.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {prog.subjects.map((sub) => (
                            <span key={sub} className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge}`}>
                              {sub}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <section className="mb-14">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">ความสำเร็จทางวิชาการ</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements.map((a) => (
                <div key={a.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-start gap-3">
                  <span className="text-3xl">{a.icon}</span>
                  <p className="text-slate-700 text-sm leading-relaxed font-medium">{a.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        {cta.title && (
          <div className="bg-gradient-to-br from-primary-700 to-primary-900 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-2">{cta.title}</h3>
            {cta.description && <p className="text-primary-200 mb-6">{cta.description}</p>}
            {cta.buttonText && cta.buttonLink && (
              <Link
                href={cta.buttonLink}
                className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg"
              >
                {cta.buttonText}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const data = await readData<CurriculumData>('curriculum.json', {
    pageTitle: 'หลักสูตรการเรียนการสอน',
    pageSubtitle: '',
    programs: [],
    achievements: [],
    cta: { title: '', description: '', buttonText: '', buttonLink: '' },
  })
  return { props: { data }, revalidate: 60 }
}
