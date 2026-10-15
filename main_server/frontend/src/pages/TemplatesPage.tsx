import { useEffect, useState } from 'react'
import { post } from '../api'
import ClassroomSelect from '../components/ClassroomSelect'
import Messages from '../components/Messages'
import { useAction, useClassrooms } from '../hooks'
import { WEEKDAYS } from '../time'
import type { TemplatePeriod } from '../types'

const byWeekdayAndPeriod = (a: TemplatePeriod, b: TemplatePeriod) => a.weekday - b.weekday || a.period - b.period

export default function TemplatesPage() {
  const { classrooms, error: classroomsError } = useClassrooms()
  const [classroomId, setClassroomId] = useState<number | null>(null)
  const [periods, setPeriods] = useState<TemplatePeriod[]>([])
  const { error, notice, run } = useAction()

  useEffect(() => {
    if (classroomId === null && classrooms.length > 0) setClassroomId(classrooms[0].id)
  }, [classrooms, classroomId])

  useEffect(() => {
    if (classroomId === null) return
    run(async () => {
      const res = await post<TemplatePeriod[]>('/api/period-templates/get', { classroom_id: classroomId })
      setPeriods(
        res
          .map((p) => ({ ...p, start_time: p.start_time.slice(0, 5), end_time: p.end_time.slice(0, 5) }))
          .sort(byWeekdayAndPeriod),
      )
    })
  }, [classroomId, run])

  function update(index: number, patch: Partial<TemplatePeriod>) {
    setPeriods(periods.map((p, i) => (i === index ? { ...p, ...patch } : p)))
  }

  function addRow() {
    const last = periods[periods.length - 1]
    const weekday = last?.weekday ?? 1
    const period = last ? Math.min(last.period + 1, 10) : 1
    setPeriods([...periods, { weekday, period, start_time: '09:00', end_time: '09:50' }])
  }

  function copyWeekday(from: number) {
    const source = periods.filter((p) => p.weekday === from)
    const kept = periods.filter((p) => p.weekday === from || p.weekday > 5)
    const copies = [1, 2, 3, 4, 5].filter((w) => w !== from).flatMap((w) => source.map((p) => ({ ...p, weekday: w })))
    setPeriods([...kept, ...copies].sort(byWeekdayAndPeriod))
  }

  const save = () =>
    run(async () => {
      await post('/api/period-templates/set', { classroom_id: classroomId, periods })
      setPeriods([...periods].sort(byWeekdayAndPeriod))
      return `${periods.length} 件の時限を保存しました。`
    })

  return (
    <>
      <h2>時限ひな形</h2>
      <section>
        <p className="muted">曜日ごとの時限と時刻です。スケジュール画面の「ひな形から下書きを作る」で使います。</p>
        <div className="row">
          <ClassroomSelect classrooms={classrooms} value={classroomId} onChange={setClassroomId} />
        </div>
        <Messages error={classroomsError || error} notice={notice} />
        {classroomId !== null && (
          <>
            <table>
              <thead>
                <tr>
                  <th>曜日</th>
                  <th>時限</th>
                  <th>開始</th>
                  <th>終了</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {periods.map((p, i) => (
                  <tr key={i}>
                    <td>
                      <select value={p.weekday} onChange={(e) => update(i, { weekday: Number(e.target.value) })}>
                        {WEEKDAYS.map((w, idx) => (
                          <option key={w} value={idx + 1}>
                            {w}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={p.period}
                        onChange={(e) => update(i, { period: Number(e.target.value) })}
                        style={{ width: 60 }}
                      />
                    </td>
                    <td>
                      <input type="time" value={p.start_time} onChange={(e) => update(i, { start_time: e.target.value })} />
                    </td>
                    <td>
                      <input type="time" value={p.end_time} onChange={(e) => update(i, { end_time: e.target.value })} />
                    </td>
                    <td className="actions">
                      <button onClick={() => copyWeekday(p.weekday)} title="この曜日の時限を月〜金にコピー">
                        月〜金にコピー
                      </button>
                      <button className="danger" onClick={() => setPeriods(periods.filter((_, j) => j !== i))}>
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="row" style={{ marginTop: 12 }}>
              <button onClick={addRow}>行を追加</button>
              <button className="primary" onClick={save}>
                保存
              </button>
            </div>
          </>
        )}
      </section>
    </>
  )
}
