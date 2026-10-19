import './recordings.css'

import { useEffect, useState } from 'react'
import { Temporal } from 'temporal-polyfill'

import { getMe, type Me } from '../../../api/auth.ts'
import { type Classroom, getClassrooms } from '../../../api/classrooms.ts'
import { getRecordings, type Recording, videoUrl } from '../../../api/recordings.ts'
import { getConfirmedSlots, type ScheduleSlot } from '../../../api/schedule.ts'
import { ConsoleLayout } from '../ConsoleLayout.tsx'
import { errorMessage, formatDateTime, formatSize, formatTime, toZoned, TZ, WEEKDAYS } from '../format.ts'
import { mount } from '../mount.tsx'

const thisMonday = () => {
  const today = Temporal.Now.plainDateISO(TZ)
  return today.subtract({ days: today.dayOfWeek - 1 })
}

const weekLabel = (monday: Temporal.PlainDate) => {
  const sunday = monday.add({ days: 6 })
  const end = sunday.month === monday.month ? `${String(sunday.day)}日` : `${String(sunday.month)}月${String(sunday.day)}日`
  return `${String(monday.year)}年${String(monday.month)}月${String(monday.day)}日 – ${end}`
}

const groupByDay = (slots: ScheduleSlot[]) => {
  const days = new Map<string, ScheduleSlot[]>()
  for (const slot of slots) {
    const key = toZoned(slot.starts_at).toPlainDate().toString()
    days.set(key, [...(days.get(key) ?? []), slot])
  }
  return [...days.entries()].map(([key, list]) => ({ date: Temporal.PlainDate.from(key), slots: list }))
}

function RecordingFiles({ slotId, canView }: { slotId: number; canView: boolean }) {
  const [recordings, setRecordings] = useState<Recording[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    getRecordings(slotId, controller.signal)
      .then(setRecordings)
      .catch((e: unknown) => {
        if (!controller.signal.aborted) {
          console.error(e)
          setError(errorMessage(e))
        }
      })
    return () => {
      controller.abort()
    }
  }, [slotId])

  if (error !== null) {
    return <p className="console-alert" role="alert">{error}</p>
  }
  if (recordings === null) {
    return <p className="muted">読み込み中…</p>
  }
  if (recordings.length === 0) {
    return <p className="muted">この授業の録画はまだありません。</p>
  }
  return (
    <ul className="recording-files">
      {recordings.map((r) => (
        <li key={r.id}>
          <span>{r.file_name}</span>
          <span className="sheet-sub muted">{formatSize(r.size_bytes)}・{formatDateTime(r.uploaded_at)} に保存</span>
          {canView && (
            <video controls preload="metadata" src={videoUrl(r.id)}>
              <track kind="captions" />
            </video>
          )}
        </li>
      ))}
    </ul>
  )
}

type WeekSlotsProps = {
  roomId: number
  monday: Temporal.PlainDate
  canView: boolean
}

function WeekSlots({ roomId, monday, canView }: WeekSlotsProps) {
  const [slots, setSlots] = useState<ScheduleSlot[] | null>(null)
  const [openSlotId, setOpenSlotId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const start = monday.toZonedDateTime(TZ)
    getConfirmedSlots(
      {
        classroom_id: roomId,
        start_at: start.toInstant().toString(),
        end_at: start.add({ days: 7 }).toInstant().toString(),
      },
      controller.signal,
    )
      .then(setSlots)
      .catch((e: unknown) => {
        if (!controller.signal.aborted) {
          console.error(e)
          setError(errorMessage(e))
        }
      })
    return () => {
      controller.abort()
    }
  }, [roomId, monday])

  if (error !== null) {
    return <p className="console-alert" role="alert">{error}</p>
  }
  if (slots === null) {
    return <p className="muted">読み込み中…</p>
  }
  if (slots.length === 0) {
    return <p className="console-empty muted">この週に録画される授業はありません。</p>
  }
  return groupByDay(slots).map(({ date, slots: daySlots }) => (
    <section className="recording-day" key={date.toString()}>
      <h2 className="day-header">
        {date.month}月{date.day}日
        <span className="day-weekday">{WEEKDAYS[date.dayOfWeek - 1]}</span>
      </h2>
      {daySlots.map((slot) => {
        const isOpen = openSlotId === slot.id
        return (
          <div className="ruled" key={slot.id}>
            <div className="row">
              <span className="muted">{formatTime(slot.starts_at)}–{formatTime(slot.ends_at)}</span>
              <span className="slot-title">{slot.title ?? '（名前なし）'}</span>
              <button
                type="button"
                className="text-button push-end"
                aria-expanded={isOpen}
                onClick={() => { setOpenSlotId(isOpen ? null : slot.id); }}
              >
                {isOpen ? '閉じる' : '録画を見る'}
              </button>
            </div>
            {isOpen && <RecordingFiles slotId={slot.id} canView={canView} />}
          </div>
        )
      })}
    </section>
  ))
}

function RecordingsPage() {
  const [me, setMe] = useState<Me | null>(null)
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [roomId, setRoomId] = useState<number | null>(null)
  const [monday, setMonday] = useState(thisMonday)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([getMe(controller.signal), getClassrooms(controller.signal)])
      .then(([user, list]) => {
        setMe(user)
        setClassrooms(list)
        setRoomId(list[0]?.id ?? null)
      })
      .catch((e: unknown) => {
        if (!controller.signal.aborted) {
          console.error(e)
          setError(errorMessage(e))
        }
      })
    return () => {
      controller.abort()
    }
  }, [])

  const canView = me?.can_view_recordings === true

  return (
    <ConsoleLayout>
      <div className="row console-head">
        <label className="room-sign">
          <select value={roomId ?? ''} aria-label="教室" onChange={(e) => { setRoomId(Number(e.currentTarget.value)); }}>
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <div className="row push-end">
          <button type="button" className="nav-button" aria-label="前の週" onClick={() => { setMonday((d) => d.subtract({ weeks: 1 })); }}>‹</button>
          <span className="week-label">{weekLabel(monday)}</span>
          <button type="button" className="nav-button" aria-label="次の週" onClick={() => { setMonday((d) => d.add({ weeks: 1 })); }}>›</button>
        </div>
        <button type="button" className="text-button" onClick={() => { setMonday(thisMonday()); }}>今週</button>
      </div>
      {error !== null && <p className="console-alert" role="alert">{error}</p>}
      {me !== null && !canView && (
        <p className="console-alert">録画を再生する権限がありません。必要なときは管理者に頼んでください。</p>
      )}
      {me !== null && classrooms.length === 0 && <p className="console-empty muted">教室がまだ登録されていません。</p>}
      {roomId !== null && (
        <WeekSlots key={`${String(roomId)}-${monday.toString()}`} roomId={roomId} monday={monday} canView={canView} />
      )}
    </ConsoleLayout>
  )
}

mount(<RecordingsPage />)
