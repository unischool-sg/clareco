import '@fullcalendar/react/skeleton.css'
import './schedule.css'

import type { CalendarRef, DateSelectInfo } from '@fullcalendar/react'
import { useEffect, useRef, useState } from 'react'
import { Temporal } from 'temporal-polyfill'

import { type Classroom, getClassrooms } from '../../../api/classrooms.ts'
import { ScheduleCalendar } from '../../../ScheduleCalendar/ScheduleCalendar.tsx'
import { ConsoleLayout } from '../ConsoleLayout.tsx'
import { TZ } from '../format.ts'
import { mount } from '../mount.tsx'
import { AddSlotForm } from './AddSlotForm.tsx'
import { type SlotDraft, slotDraftForDay, slotDraftFrom } from './slotDraft.ts'

function SchedulePage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [error, setError] = useState(false)
  const [roomId, setRoomId] = useState<number | null>(null)
  const [adding, setAdding] = useState<SlotDraft | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const calendarRef = useRef<CalendarRef>(null)

  const openForm = (draft: SlotDraft) => {
    setNotice(null)
    setAdding(draft)
  }

  const onSelect = (info: DateSelectInfo) => {
    openForm(info.allDay ? slotDraftForDay(Temporal.PlainDate.from(info.startStr.slice(0, 10))) : slotDraftFrom(info.start, info.end))
    calendarRef.current?.getApi().unselect()
  }

  const onAdded = (message: string) => {
    setAdding(null)
    setNotice(message)
    calendarRef.current?.getApi().refetchEvents()
  }

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

  return (
    <ConsoleLayout>
      {error && <p role="alert">教室の一覧を読み込めませんでした。</p>}
      {notice !== null && <p className="console-alert" role="status">{notice}</p>}
      {adding !== null && roomId !== null && (
        <AddSlotForm
          key={JSON.stringify(adding)}
          classroomId={roomId}
          initial={adding}
          onAdded={onAdded}
          onCancel={() => { setAdding(null); }}
        />
      )}
      <ScheduleCalendar
        classroomId={roomId}
        calendarRef={calendarRef}
        onSelect={onSelect}
        toolbarStart={
          <>
            <label className="room-sign">
              <select value={roomId ?? ''} aria-label="教室" onChange={(e) => { setRoomId(Number(e.currentTarget.value)); setAdding(null); }}>
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="button"
              disabled={roomId === null}
              onClick={() => { openForm(slotDraftForDay(Temporal.Now.plainDateISO(TZ))); }}
            >
              予定を追加
            </button>
          </>
        }
      />
    </ConsoleLayout>
  )
}

mount(<SchedulePage />)
