import { useEffect, useState } from 'react'
import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { ApiError, errorText, get, post } from './api'
import { MeContext } from './hooks'
import type { Me } from './types'
import ClassroomsPage from './pages/ClassroomsPage'
import DevicesPage from './pages/DevicesPage'
import SchedulePage from './pages/SchedulePage'
import TemplatesPage from './pages/TemplatesPage'
import UsersPage from './pages/UsersPage'

type AuthState = { status: 'loading' } | { status: 'anonymous' } | { status: 'error'; message: string } | { status: 'ok'; me: Me }

export default function App() {
  const [auth, setAuth] = useState<AuthState>({ status: 'loading' })

  useEffect(() => {
    get<Me>('/api/auth/me')
      .then((me) => setAuth({ status: 'ok', me }))
      .catch((e) =>
        setAuth(e instanceof ApiError && e.status === 401 ? { status: 'anonymous' } : { status: 'error', message: errorText(e) }),
      )
  }, [])

  if (auth.status === 'loading') return <p className="center">読み込み中…</p>
  if (auth.status === 'error') return <p className="center error">{auth.message}</p>
  if (auth.status === 'anonymous') {
    return (
      <div className="center">
        <h1>classee</h1>
        <p>学校の Google アカウントでログインしてください。</p>
        <a href="/api/auth/login">
          <button className="primary">Google でログイン</button>
        </a>
      </div>
    )
  }

  const { me } = auth

  async function logout() {
    await post('/api/auth/logout').catch(() => undefined)
    setAuth({ status: 'anonymous' })
  }

  return (
    <MeContext.Provider value={me}>
      <header>
        <strong>classee</strong>
        <nav>
          <NavLink to="/schedule">スケジュール</NavLink>
          <NavLink to="/templates">時限ひな形</NavLink>
          <NavLink to="/classrooms">教室</NavLink>
          {me.is_admin && <NavLink to="/devices">録画機器</NavLink>}
          {me.is_admin && <NavLink to="/users">ユーザー</NavLink>}
        </nav>
        <span>
          {me.is_admin && <span className="badge">管理者</span>} <button onClick={logout}>ログアウト</button>
        </span>
      </header>
      <main>
        <Routes>
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/classrooms" element={<ClassroomsPage />} />
          {me.is_admin && <Route path="/devices" element={<DevicesPage />} />}
          {me.is_admin && <Route path="/users" element={<UsersPage />} />}
          <Route path="*" element={<Navigate to="/schedule" replace />} />
        </Routes>
      </main>
    </MeContext.Provider>
  )
}
