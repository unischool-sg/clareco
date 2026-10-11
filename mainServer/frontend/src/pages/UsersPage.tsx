import { useCallback, useEffect, useState } from 'react'
import { post } from '../api'
import Messages from '../components/Messages'
import { useAction, useMe } from '../hooks'
import { formatDateTime } from '../time'
import type { User } from '../types'

type Permissions = Pick<User, 'is_admin' | 'can_view_recordings'>

export default function UsersPage() {
  const me = useMe()
  const [users, setUsers] = useState<User[]>([])
  const [email, setEmail] = useState('')
  const [newPerms, setNewPerms] = useState<Permissions>({ is_admin: false, can_view_recordings: false })
  const [edits, setEdits] = useState<Record<number, Permissions>>({})
  const { error, notice, run } = useAction()

  const load = useCallback(async () => {
    setUsers(await post<User[]>('/api/users/get'))
    setEdits({})
  }, [])

  useEffect(() => {
    run(load)
  }, [load, run])

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await run(async () => {
      await post('/api/users/add', { email, ...newPerms })
      await load()
      return `${email} を追加しました。`
    })
    if (ok) {
      setEmail('')
      setNewPerms({ is_admin: false, can_view_recordings: false })
    }
  }

  const permsOf = (u: User): Permissions => edits[u.id] ?? { is_admin: u.is_admin, can_view_recordings: u.can_view_recordings }

  const changePerm = (u: User, patch: Partial<Permissions>) => setEdits({ ...edits, [u.id]: { ...permsOf(u), ...patch } })

  const save = (u: User) =>
    run(async () => {
      await post('/api/users/edit', { id: u.id, ...permsOf(u) })
      await load()
      return `${u.email} の権限を更新しました。`
    })

  const disable = (u: User) => {
    if (!window.confirm(`${u.email} を無効にしますか？ログイン中のセッションも使えなくなります。`)) return
    run(async () => {
      await post('/api/users/disable', { id: u.id })
      await load()
      return `${u.email} を無効にしました。`
    })
  }

  return (
    <>
      <h2>ユーザー</h2>
      <section>
        <h3>ユーザーを追加</h3>
        <form className="row" onSubmit={add} style={{ marginBottom: 0 }}>
          <input
            type="email"
            placeholder="メールアドレス"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: 260 }}
          />
          <label>
            <input
              type="checkbox"
              checked={newPerms.is_admin}
              onChange={(e) => setNewPerms({ ...newPerms, is_admin: e.target.checked })}
            />
            管理者
          </label>
          <label>
            <input
              type="checkbox"
              checked={newPerms.can_view_recordings}
              onChange={(e) => setNewPerms({ ...newPerms, can_view_recordings: e.target.checked })}
            />
            録画閲覧
          </label>
          <button className="primary">追加</button>
        </form>
      </section>
      <section>
        <Messages error={error} notice={notice} />
        <table>
          <thead>
            <tr>
              <th>メールアドレス</th>
              <th>名前</th>
              <th>管理者</th>
              <th>録画閲覧</th>
              <th>登録日時</th>
              <th>状態</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const perms = permsOf(u)
              const disabled = u.disabled_at !== null
              return (
                <tr key={u.id}>
                  <td>
                    {u.email}
                    {u.id === me.id && <span className="muted">（自分）</span>}
                  </td>
                  <td>{u.display_name ?? <span className="muted">未ログイン</span>}</td>
                  <td>
                    <input
                      type="checkbox"
                      disabled={disabled || u.id === me.id}
                      checked={perms.is_admin}
                      onChange={(e) => changePerm(u, { is_admin: e.target.checked })}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      disabled={disabled}
                      checked={perms.can_view_recordings}
                      onChange={(e) => changePerm(u, { can_view_recordings: e.target.checked })}
                    />
                  </td>
                  <td>{formatDateTime(u.created_at)}</td>
                  <td>
                    {disabled ? (
                      <span className="badge">無効（{formatDateTime(u.disabled_at)}）</span>
                    ) : (
                      <span className="badge ok">有効</span>
                    )}
                  </td>
                  <td className="actions">
                    {!disabled && (
                      <>
                        <button className="primary" disabled={!edits[u.id]} onClick={() => save(u)}>
                          保存
                        </button>
                        {u.id !== me.id && (
                          <button className="danger" onClick={() => disable(u)}>
                            無効にする
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
    </>
  )
}
