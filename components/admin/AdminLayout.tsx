import Head from 'next/head'
import Sidebar from './Sidebar'

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  return (
    <>
      <Head>
        <title>{title ? `${title} | CMS ราชสีมาวิทยาลัย` : 'CMS ราชสีมาวิทยาลัย'}</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="min-h-screen bg-slate-100 flex">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <div className="p-6 md:p-8">{children}</div>
        </div>
      </div>
    </>
  )
}
