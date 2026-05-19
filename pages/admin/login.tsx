import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { isAuthenticated } from '../../lib/auth'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (res.ok) {
        router.push('/admin')
      } else {
        setError(data.error || 'เกิดข้อผิดพลาด')
      }
    } catch {
      setError('ไม่สามารถเชื่อมต่อได้')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>เข้าสู่ระบบ CMS | โรงเรียนราชสีมาวิทยาลัย</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="min-h-screen bg-primary-900 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gold-500 flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-900 font-bold text-2xl">ร</span>
            </div>
            <h1 className="text-white text-xl font-bold">ระบบจัดการเนื้อหา</h1>
            <p className="text-primary-400 text-sm mt-1">โรงเรียนราชสีมาวิทยาลัย</p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl p-7 shadow-xl">
            <h2 className="text-lg font-bold text-slate-800 mb-5">เข้าสู่ระบบ</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  ชื่อผู้ใช้
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300"
                  placeholder="admin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  รหัสผ่าน
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary-700 hover:bg-primary-800 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </button>
            </form>
          </div>

          <p className="text-center text-primary-500 text-xs mt-4">
            สงวนสิทธิ์สำหรับผู้ดูแลระบบเท่านั้น
          </p>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  if (isAuthenticated(req as never)) {
    return { redirect: { destination: '/admin', permanent: false } }
  }
  return { props: {} }
}
