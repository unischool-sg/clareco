import './devices.css'

import { type SubmitEvent, useEffect, useState } from 'react'

import { addClassroom, type Classroom, getClassrooms, renameClassroom } from '../../../api/classrooms.ts'
import { addDevice, type Device, getDevices, revokeDevice } from '../../../api/devices.ts'
import { ConsoleLayout } from '../ConsoleLayout.tsx'
import { errorMessage, formatDateTime, isForbidden } from '../format.ts'
import { mount } from '../mount.tsx'

const ONLINE_MS = 5 * 60 * 1000

const isOnline = (device: Device) =>
  device.last_seen_at !== null && Date.now() - new Date(device.last_seen_at).getTime() < ONLINE_MS

const fetchAll = (signal?: AbortSignal) => Promise.all([getClassrooms(signal), getDevices(signal)])

type CardProps = {
  classroom: Classroom
  devices: Device[]
  onChanged: () => Promise<void>
}

function ClassroomCard({ classroom, devices, onChanged }: CardProps) {
  const active = devices.find((d) => d.revoked_at === null)
  const revoked = devices.filter((d) => d.revoked_at !== null)

  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState(classroom.name)
  const [adding, setAdding] = useState(false)
  const [deviceName, setDeviceName] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [confirmRevoke, setConfirmRevoke] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const act = async <T,>(action: () => Promise<T>): Promise<T | null> => {
    setBusy(true)
    setError(null)
    try {
      const result = await action()
      await onChanged()
      return result
    } catch (e: unknown) {
      console.error(e)
      setError(errorMessage(e))
      return null
    } finally {
      setBusy(false)
    }
  }

  const submitRename = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (await act(() => renameClassroom(classroom.id, name.trim())) !== null) {
      setRenaming(false)
    }
  }

  const submitDevice = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    const issued = await act(() => addDevice(classroom.id, deviceName.trim()))
    if (issued !== null) {
      setToken(issued.token)
      setAdding(false)
      setDeviceName('')
    }
  }

  const revoke = async (device: Device) => {
    if (await act(() => revokeDevice(device.id)) !== null) {
      setConfirmRevoke(false)
    }
  }

  return (
    <article className="ruled">
      <div className="row">
        {renaming ? (
          <form className="row" onSubmit={(e) => void submitRename(e)}>
            <input
              className="text-input"
              aria-label="教室の名前"
              value={name}
              maxLength={100}
              required
              onChange={(e) => { setName(e.currentTarget.value); }}
            />
            <button type="submit" className="button" disabled={busy || name.trim() === ''}>保存</button>
            <button type="button" className="text-button" onClick={() => { setRenaming(false); setName(classroom.name); }}>やめる</button>
          </form>
        ) : (
          <>
            <h3>{classroom.name}</h3>
            <button type="button" className="text-button" onClick={() => { setRenaming(true); }}>名前を変える</button>
          </>
        )}
      </div>
      {error !== null && <p className="console-alert" role="alert">{error}</p>}
      {active === undefined ? (
        <div className="row muted">
          <span>録画機はありません。</span>
          {!adding && (
            <button type="button" className="text-button" onClick={() => { setAdding(true); setToken(null); }}>録画機を登録する</button>
          )}
        </div>
      ) : (
        <div className="row muted">
          <strong>{active.name}</strong>
          <span className={isOnline(active) ? 'device-status is-online' : 'device-status'}>
            {isOnline(active) ? '動いています' : '応答なし'}
          </span>
          <span>最後の通信: {formatDateTime(active.last_seen_at)}</span>
          <span>登録: {formatDateTime(active.created_at)}</span>
          {confirmRevoke ? (
            <span>
              この録画機は使えなくなります。
              <button type="button" className="text-button is-danger" disabled={busy} onClick={() => void revoke(active)}>無効にする</button>
              <button type="button" className="text-button" onClick={() => { setConfirmRevoke(false); }}>やめる</button>
            </span>
          ) : (
            <button type="button" className="text-button" onClick={() => { setConfirmRevoke(true); }}>無効にする</button>
          )}
        </div>
      )}
      {adding && (
        <form className="row" onSubmit={(e) => void submitDevice(e)}>
          <input
            className="text-input"
            aria-label="録画機の名前"
            placeholder="録画機の名前"
            value={deviceName}
            maxLength={100}
            required
            onChange={(e) => { setDeviceName(e.currentTarget.value); }}
          />
          <button type="submit" className="button" disabled={busy || deviceName.trim() === ''}>登録</button>
          <button type="button" className="text-button" onClick={() => { setAdding(false); }}>やめる</button>
        </form>
      )}
      {token !== null && (
        <div className="token-box">
          <p>録画機に設定するトークンです。この画面を閉じると二度と表示されないので、いま控えてください。</p>
          <code>{token}</code>
          <button type="button" className="text-button" onClick={() => void navigator.clipboard.writeText(token)}>コピー</button>
          <button type="button" className="text-button" onClick={() => { setToken(null); }}>控えた</button>
        </div>
      )}
      {revoked.length > 0 && (
        <details className="device-history">
          <summary>無効にした録画機（{revoked.length}台）</summary>
          <ul>
            {revoked.map((d) => (
              <li key={d.id}>{d.name}（{formatDateTime(d.revoked_at)} に無効化）</li>
            ))}
          </ul>
        </details>
      )}
    </article>
  )
}

function DevicesPage() {
  const [classrooms, setClassrooms] = useState<Classroom[] | null>(null)
  const [devices, setDevices] = useState<Device[]>([])
  const [forbidden, setForbidden] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [busy, setBusy] = useState(false)

  const apply = ([roomList, deviceList]: [Classroom[], Device[]]) => {
    setClassrooms(roomList)
    setDevices(deviceList)
  }

  const load = async () => {
    apply(await fetchAll())
  }

  useEffect(() => {
    const controller = new AbortController()
    fetchAll(controller.signal).then(apply).catch((e: unknown) => {
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

  const submitClassroom = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await addClassroom(newName.trim())
      setNewName('')
      await load()
    } catch (err: unknown) {
      console.error(err)
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <ConsoleLayout>
      <div className="row console-head">
        <h1>教室と録画機</h1>
      </div>
      {forbidden && <p className="console-alert" role="alert">この画面は管理者だけが使えます。</p>}
      {error !== null && <p className="console-alert" role="alert">{error}</p>}
      {classrooms === null && !forbidden && error === null && <p className="muted">読み込み中…</p>}
      {classrooms !== null && (
        <>
          <section>
            <p className="muted">1つの教室に置ける録画機は1台です。交換するときは、古い録画機を無効にしてから登録してください。</p>
            {classrooms.length === 0 && <p className="console-empty muted">教室がまだ登録されていません。</p>}
            {classrooms.map((c) => (
              <ClassroomCard
                key={c.id}
                classroom={c}
                devices={devices.filter((d) => d.classroom_id === c.id)}
                onChanged={load}
              />
            ))}
          </section>
          <section>
            <h2>教室を追加</h2>
            <form className="row" onSubmit={(e) => void submitClassroom(e)}>
              <input
                className="text-input"
                aria-label="教室の名前"
                placeholder="例: 3年1組"
                value={newName}
                maxLength={100}
                required
                onChange={(e) => { setNewName(e.currentTarget.value); }}
              />
              <button type="submit" className="button" disabled={busy || newName.trim() === ''}>追加</button>
            </form>
          </section>
        </>
      )}
    </ConsoleLayout>
  )
}

mount(<DevicesPage />)
