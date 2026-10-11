import { Fragment, useCallback, useEffect, useState } from 'react'
import { post } from '../api'
import ClassroomSelect from '../components/ClassroomSelect'
import Messages from '../components/Messages'
import Recordings from '../components/Recordings'
import SlotForm from '../components/SlotForm'
import { useAction, useClassrooms } from '../hooks'
import { currentMonth, formatDateTime, formatSlotTime, monthRange } from '../time'
import type { NewSlot, ScheduleMonth, Slot } from '../types'

export default function SchedulePage() {
  const { classrooms, error: classroomsError } = useClassrooms()
  const [classroomId, setClassroomId] = useState<number | null>(null)
  const [month, setMonth] = useState(currentMonth())
  const [confirmedMonth, setConfirmedMonth] = useState<ScheduleMonth | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [loaded, setLoaded] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [recordingsId, setRecordingsId] = useState<number | null>(null)
  const { error, notice, run } = useAction()

  useEffect(() => {
    if (classroomId === null && classrooms.length > 0) setClassroomId(classrooms[0].id)
  }, [classrooms, classroomId])

  const isConfirmed = confirmedMonth !== null
  const base = isConfirmed ? '/api/schedule' : '/api/schedule-draft'

  const load = useCallback(async () => {
    if (classroomId === null || !month) return
    setLoaded(false)
    const months = await post<ScheduleMonth[]>('/api/schedule-months/get', { classroom_id: classroomId })
    const found = months.find((m) => m.month.startsWith(month)) ?? null
    const path = found ? '/api/schedule/get' : '/api/schedule-draft/get'
    const result = await post<Slot[]>(path, { classroom_id: classroomId, ...monthRange(month) })
    setConfirmedMonth(found)
    setSlots(result)
    setEditingId(null)
    setRecordingsId(null)
    setLoaded(true)
  }, [classroomId, month])

  useEffect(() => {
    run(load)
  }, [load, run])

  const [year, mon] = month.split('-').map(Number)

  function act(action: () => Promise<string | void>) {
    return run(async () => {
      const message = await action()
      await load()
      return message
    })
  }

  const generate = () =>
    act(async () => {
      const res = await post<{ added: number }>('/api/schedule-draft/generate', { classroom_id: classroomId, year, month: mon })
      return `ひな形から ${res.added} 件の下書きを作りました。`
    })

  const confirmMonth = () => {
    if (!window.confirm(`${year}年${mon}月のスケジュールを確定します。確定後は下書きに戻せません。よろしいですか？`)) return
    act(async () => {
      const res = await post<{ confirmed: number }>('/api/schedule-months/confirm', { classroom_id: classroomId, year, month: mon })
      return `${res.confirmed} 件のコマを確定しました。`
    })
  }

  const deleteAllDrafts = () => {
    if (!window.confirm(`${year}年${mon}月の下書き ${slots.length} 件をすべて削除しますか？`)) return
    act(async () => {
      await post('/api/schedule-draft/delete', { slots })
      return '下書きを削除しました。'
    })
  }

  const add = (slot: NewSlot) =>
    act(async () => {
      if (isConfirmed) await post('/api/schedule/add', { classroom_id: classroomId, slot })
      else await post('/api/schedule-draft/add', { classroom_id: classroomId, slots: [slot] })
      return 'コマを追加しました。'
    })

  const edit = (id: number, slot: NewSlot) =>
    act(async () => {
      await post(`${base}/edit`, { slots: [{ id, ...slot }] })
      return 'コマを更新しました。'
    })

  const remove = (slot: Slot) => {
    const label = isConfirmed ? '取り消し' : '削除'
    if (!window.confirm(`${formatSlotTime(slot.starts_at, slot.ends_at)} のコマを${label}しますか？`)) return
    act(async () => {
      await post(isConfirmed ? '/api/schedule/cancel' : '/api/schedule-draft/delete', { slots: [slot] })
      return `コマを${label}しました。`
    })
  }

  return (
    <>
      <h2>録画スケジュール</h2>
      <section>
        <div className="row">
          <ClassroomSelect classrooms={classrooms} value={classroomId} onChange={setClassroomId} />
          <label>
            月 <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </label>
          {loaded &&
            (isConfirmed ? (
              <span className="badge ok">確定済み（{formatDateTime(confirmedMonth.confirmed_at)}）</span>
            ) : (
              <span className="badge">下書き</span>
            ))}
        </div>
        {loaded && !isConfirmed && (
          <div className="row">
            <button onClick={generate}>ひな形から下書きを作る</button>
            <button onClick={deleteAllDrafts} className="danger" disabled={slots.length === 0}>
              下書きをすべて削除
            </button>
            <button onClick={confirmMonth} className="primary">
              この月を確定する
            </button>
          </div>
        )}
        <Messages error={classroomsError || error} notice={notice} />
      </section>

      {loaded && (
        <section>
          <h3>コマを追加</h3>
          <SlotForm submitLabel="追加" onSubmit={add} />
        </section>
      )}

      {loaded && (
        <section>
          <h3>
            {isConfirmed ? '確定済みのコマ' : '下書きのコマ'}（{slots.length} 件）
          </h3>
          {slots.length === 0 ? (
            <p className="muted">コマがありません。</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>日時</th>
                  <th>タイトル</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {slots.map((s) => (
                  <Fragment key={s.id}>
                    <tr>
                      {editingId === s.id ? (
                        <td colSpan={3}>
                          <SlotForm
                            initial={s}
                            submitLabel="保存"
                            onSubmit={(slot) => edit(s.id, slot)}
                            onCancel={() => setEditingId(null)}
                          />
                        </td>
                      ) : (
                        <>
                          <td>{formatSlotTime(s.starts_at, s.ends_at)}</td>
                          <td>{s.title ?? <span className="muted">-</span>}</td>
                          <td className="actions">
                            <button onClick={() => setEditingId(s.id)}>編集</button>
                            <button className="danger" onClick={() => remove(s)}>
                              {isConfirmed ? '取り消し' : '削除'}
                            </button>
                            {isConfirmed && (
                              <button onClick={() => setRecordingsId(recordingsId === s.id ? null : s.id)}>
                                録画
                              </button>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                    {recordingsId === s.id && (
                      <tr>
                        <td colSpan={3}>
                          <Recordings slotId={s.id} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </>
  )
}
