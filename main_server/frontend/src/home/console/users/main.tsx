import './users.css'

import { type SubmitEvent, useEffect, useState } from 'react'

import { getMe, type Me } from '../../../api/auth.ts'
import { addUser, disableUser, editUser, getUsers, type User, type UserPermissions } from '../../../api/users.ts'
import { ConsoleLayout } from '../ConsoleLayout.tsx'
import { errorMessage, formatDateTime, isForbidden } from '../format.ts'
import { mount } from '../mount.tsx'

type RowProps = {
  user: User
  isMe: boolean
  busy: boolean
  onEdit: (user: User, permissions: UserPermissions) => void
  onDisable: (user: User) => void
}

function UserRow({ user, isMe, busy, onEdit, onDisable }: RowProps) {
  const [confirmDisable, setConfirmDisable] = useState(false)
  const disabled = user.disabled_at !== null
  const permissions = { is_admin: user.is_admin, can_view_recordings: user.can_view_recordings }

  return (
    <tr className={disabled ? 'is-off' : undefined}>
      <td>
        {user.display_name ?? '（未ログイン）'}
        {isMe && '（自分）'}
        <span className="sheet-sub muted">{user.email}</span>
      </td>
      <td className="is-center">
        <input
          type="checkbox"
          aria-label={`${user.email} を管理者にする`}
          checked={user.is_admin}
          disabled={busy || disabled || isMe}
          onChange={(e) => { onEdit(user, { ...permissions, is_admin: e.currentTarget.checked }); }}
        />
      </td>
      <td className="is-center">
        <input
          type="checkbox"
          aria-label={`${user.email} に録画の閲覧を許可する`}
          checked={user.can_view_recordings}
          disabled={busy || disabled}
          onChange={(e) => { onEdit(user, { ...permissions, can_view_recordings: e.currentTarget.checked }); }}
        />
      </td>
      <td>{formatDateTime(user.created_at)}</td>
      <td className="is-end">
        {disabled && `${formatDateTime(user.disabled_at)} に無効化`}
        {!disabled && !isMe && !confirmDisable && (
          <button type="button" className="text-button" onClick={() => { setConfirmDisable(true); }}>無効にする</button>
        )}
        {!disabled && confirmDisable && (
          <>
            <button type="button" className="text-button is-danger" disabled={busy} onClick={() => { onDisable(user); }}>本当に無効にする</button>
            <button type="button" className="text-button" onClick={() => { setConfirmDisable(false); }}>やめる</button>
          </>
        )}
      </td>
    </tr>
  )
}

function UsersPage() {
  const [me, setMe] = useState<Me | null>(null)
  const [users, setUsers] = useState<User[] | null>(null)
  const [forbidden, setForbidden] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [showDisabled, setShowDisabled] = useState(false)
  const [email, setEmail] = useState('')
  const [newPermissions, setNewPermissions] = useState<UserPermissions>({ is_admin: false, can_view_recordings: false })

  const load = async () => {
    setUsers(await getUsers())
  }

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([getMe(controller.signal), getUsers(controller.signal)])
      .then(([user, list]) => {
        setMe(user)
        setUsers(list)
      })
      .catch((e: unknown) => {
        if (!controller.signal.aborted) {
          console.error(e)
          if (isForbidden(e)) {
            setForbidden(true)
          } else {
            setError(errorMessage(e))
          }
        }
      })
    return () => {
      controller.abort()
    }
  }, [])

  const act = async (action: () => Promise<unknown>) => {
    setBusy(true)
    setError(null)
    try {
      await action()
      await load()
      return true
    } catch (e: unknown) {
      console.error(e)
      setError(errorMessage(e))
      return false
    } finally {
      setBusy(false)
    }
  }

  const submit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (await act(() => addUser(email.trim(), newPermissions))) {
      setEmail('')
      setNewPermissions({ is_admin: false, can_view_recordings: false })
    }
  }

  const visible = users?.filter((u) => showDisabled || u.disabled_at === null) ?? []
  const disabledCount = users?.filter((u) => u.disabled_at !== null).length ?? 0

  return (
    <ConsoleLayout>
      <div className="row console-head">
        <h1>職員</h1>
      </div>
      {forbidden && <p className="console-alert" role="alert">この画面は管理者だけが使えます。</p>}
      {error !== null && <p className="console-alert" role="alert">{error}</p>}
      {users === null && !forbidden && error === null && <p className="muted">読み込み中…</p>}
      {users !== null && (
        <>
          <section>
            <p className="muted">ここに登録したメールアドレスの Google アカウントだけがログインできます。</p>
            <table className="sheet">
              <thead>
                <tr>
                  <th>名前・メールアドレス</th>
                  <th className="is-center">管理者</th>
                  <th className="is-center">録画の閲覧</th>
                  <th>登録日</th>
                  <th className="is-end">
                    {disabledCount > 0 && (
                      <label className="check">
                        <input type="checkbox" checked={showDisabled} onChange={(e) => { setShowDisabled(e.currentTarget.checked); }} />
                        無効にした職員も表示（{disabledCount}人）
                      </label>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((u) => (
                  <UserRow
                    key={u.id}
                    user={u}
                    isMe={u.id === me?.id}
                    busy={busy}
                    onEdit={(user, permissions) => void act(() => editUser(user.id, permissions))}
                    onDisable={(user) => void act(() => disableUser(user.id))}
                  />
                ))}
              </tbody>
            </table>
            {visible.length === 0 && <p className="console-empty muted">職員がいません。</p>}
          </section>
          <section>
            <h2>職員を追加</h2>
            <form className="row" onSubmit={(e) => void submit(e)}>
              <input
                className="text-input"
                type="email"
                aria-label="メールアドレス"
                placeholder="メールアドレス"
                size={32}
                value={email}
                required
                onChange={(e) => { setEmail(e.currentTarget.value); }}
              />
              <label className="check">
                <input
                  type="checkbox"
                  checked={newPermissions.is_admin}
                  onChange={(e) => {
                    const checked = e.currentTarget.checked
                    setNewPermissions((p) => ({ ...p, is_admin: checked }))
                  }}
                />
                管理者
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={newPermissions.can_view_recordings}
                  onChange={(e) => {
                    const checked = e.currentTarget.checked
                    setNewPermissions((p) => ({ ...p, can_view_recordings: checked }))
                  }}
                />
                録画の閲覧
              </label>
              <button type="submit" className="button" disabled={busy || email.trim() === ''}>追加</button>
            </form>
          </section>
        </>
      )}
    </ConsoleLayout>
  )
}

mount(<UsersPage />)
