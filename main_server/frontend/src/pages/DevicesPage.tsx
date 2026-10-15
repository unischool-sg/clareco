import { useCallback, useEffect, useState } from 'react'
import { post } from '../api'
import ClassroomSelect from '../components/ClassroomSelect'
import Messages from '../components/Messages'
import { useAction, useClassrooms } from '../hooks'
import { formatDateTime } from '../time'
import type { Device } from '../types'

export default function DevicesPage() {
  const { classrooms, error: classroomsError } = useClassrooms()
  const [devices, setDevices] = useState<Device[]>([])
  const [classroomId, setClassroomId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [issued, setIssued] = useState<{ name: string; token: string } | null>(null)
  const { error, notice, run } = useAction()

  const load = useCallback(async () => {
    setDevices(await post<Device[]>('/api/devices/get'))
  }, [])

  useEffect(() => {
    run(load)
  }, [load, run])

  const classroomName = (id: number) => classrooms.find((c) => c.id === id)?.name ?? `#${id}`

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    setIssued(null)
    const ok = await run(async () => {
      const res = await post<{ id: number; token: string }>('/api/devices/add', { classroom_id: classroomId, name })
      setIssued({ name, token: res.token })
      await load()
    })
    if (ok) setName('')
  }

  const revoke = (d: Device) => {
    if (!window.confirm(`「${d.name}」を無効にしますか？この機器のトークンは使えなくなります。`)) return
    run(async () => {
      await post('/api/devices/revoke', { id: d.id })
      await load()
      return `「${d.name}」を無効にしました。`
    })
  }

  return (
    <>
      <h2>録画機器</h2>
      <section>
        <h3>機器を登録</h3>
        <form className="row" onSubmit={add} style={{ marginBottom: 0 }}>
          <ClassroomSelect classrooms={classrooms} value={classroomId} onChange={setClassroomId} />
          <input placeholder="機器名" required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} />
          <button className="primary" disabled={classroomId === null}>
            登録
          </button>
        </form>
        {issued && (
          <div className="notice" style={{ marginTop: 12 }}>
            「{issued.name}」のトークンです。この画面を閉じると二度と表示できないので、今すぐ機器に設定してください。
            <br />
            <code>{issued.token}</code>{' '}
            <button onClick={() => navigator.clipboard.writeText(issued.token)}>コピー</button>
          </div>
        )}
      </section>
      <section>
        <Messages error={classroomsError || error} notice={notice} />
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>機器名</th>
              <th>教室</th>
              <th>登録日時</th>
              <th>最終接続</th>
              <th>状態</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {devices.map((d) => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.name}</td>
                <td>{classroomName(d.classroom_id)}</td>
                <td>{formatDateTime(d.created_at)}</td>
                <td>{formatDateTime(d.last_seen_at)}</td>
                <td>
                  {d.revoked_at ? (
                    <span className="badge">無効（{formatDateTime(d.revoked_at)}）</span>
                  ) : (
                    <span className="badge ok">有効</span>
                  )}
                </td>
                <td>
                  {!d.revoked_at && (
                    <button className="danger" onClick={() => revoke(d)}>
                      無効にする
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}
