import Head from 'next/head'
import Navbar from './Navbar'
import Footer from './Footer'

interface LayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export default function Layout({ children, title, description }: LayoutProps) {
  const pageTitle = title
    ? `${title} | โรงเรียนราชสีมาวิทยาลัย`
    : 'โรงเรียนราชสีมาวิทยาลัย'
  const pageDesc =
    description ||
    'โรงเรียนราชสีมาวิทยาลัย สถาบันการศึกษาที่มีคุณภาพ มุ่งสู่ความเป็นเลิศทางวิชาการ จังหวัดนครราชสีมา'

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </>
  )
}
