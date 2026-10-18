import '@fullcalendar/react/skeleton.css'
import './base.css'
import './schedule.css'

import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { type Classroom, getClassrooms } from '../../api/classrooms.ts'
import { RequireLogin } from '../../Auth/RequireLogin.tsx'
import { ScheduleCalendar } from '../../ScheduleCalendar/ScheduleCalendar.tsx'

function SchedulePage() {
  const [classrooms, setClassrooms] = useState<Classroom[] | null>(null)
  const [error, setError] = useState(false)
  const [roomId, setRoomId] = useState<number | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    getClassrooms(controller.signal)
      .then((list) => {
        setClassrooms(list)
        setRoomId(list[0]?.id ?? null)
      })
      .catch((e: unknown) => {
        if (!controller.signal.aborted) {
          console.error(e)
          setError(true)
        }
      })
    return () => {
      controller.abort()
    }
  }, [])

  if (error) {
    return <p role="alert">教室の一覧を読み込めませんでした。ページを再読み込みしてください。</p>
  }
  if (classrooms === null) {
    return null
  }
  if (roomId === null) {
    return <p>教室がまだ登録されていません。</p>
  }
  return (
    <main className="schedule">
      <ScheduleCalendar
        classroomId={roomId}
        toolbarStart={
          <label className="room-sign">
            <select value={roomId} aria-label="教室" onChange={(e) => { setRoomId(Number(e.currentTarget.value)); }}>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
        }
      />
    </main>
  )
}

const root = document.getElementById('root')
if (root === null) {
  throw new Error('#root not found')
}
createRoot(root).render(
  <StrictMode>
    <RequireLogin>
      <SchedulePage />
    </RequireLogin>
  </StrictMode>,
)
