import type { EventApi, EventInput, EventSourceFuncInfo } from '@fullcalendar/react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/react/daygrid'
import jaLocale from '@fullcalendar/react/locales/ja'
import timeGridPlugin from '@fullcalendar/react/timegrid'
import { type ReactNode, useMemo, useState } from 'react'
import { Temporal } from 'temporal-polyfill'

import { getConfirmedSlots, getDraftSlots, type ScheduleSlot } from '../api/schedule.ts'

const TZ = 'Asia/Tokyo'
const WEEKDAYS = ['月', '火', '水', '木', '金', '土', '日']

const zoned = (date: Date) => Temporal.Instant.fromEpochMilliseconds(date.getTime()).toZonedDateTimeISO(TZ)
const hm = (date: Date | null) => {
  if (date === null) {
    return ''
  }
  const t = zoned(date)
  return `${t.hour}:${String(t.minute).padStart(2, '0')}`
}
const minutesOfDay = (date: Date) => {
  const t = zoned(date)
  return t.hour * 60 + t.minute
}
const hhmm = (hour: number) => `${String(hour).padStart(2, '0')}:00`

const toRange = (classroomId: number, info: EventSourceFuncInfo) => ({
  classroom_id: classroomId,
  start_at: info.start.toISOString(),
  end_at: info.end.toISOString(),
})
const toEvent = (kind: 'confirmed' | 'draft') => (s: ScheduleSlot): EventInput => ({
  id: `${kind}-${String(s.id)}`,
  title: s.title ?? '',
  start: s.starts_at,
  end: s.ends_at,
  extendedProps: { kind },
})

type ScheduleCalendarProps = {
  classroomId: number
  toolbarStart: ReactNode
}

export function ScheduleCalendar({ classroomId, toolbarStart }: ScheduleCalendarProps) {
  const eventSources = useMemo(
    () => [
      async (info: EventSourceFuncInfo) => (await getConfirmedSlots(toRange(classroomId, info))).map(toEvent('confirmed')),
      async (info: EventSourceFuncInfo) => (await getDraftSlots(toRange(classroomId, info))).map(toEvent('draft')),
    ],
    [classroomId],
  )

  const [firstHour, setFirstHour] = useState(8)
  const [lastHour, setLastHour] = useState(16)
  const fitHours = (events: EventApi[]) => {
    setFirstHour(Math.min(8, ...events.flatMap((e) => (e.start ? [Math.floor(minutesOfDay(e.start) / 60)] : []))))
    setLastHour(Math.max(16, ...events.flatMap((e) => (e.end ? [Math.ceil(minutesOfDay(e.end) / 60)] : []))))
  }

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin]}
      initialView="timeGridWeek"
      headerToolbar={{ start: 'room', center: 'prev title next', end: 'timeGridWeek,dayGridMonth legend' }}
      toolbarElements={{
        room: () => toolbarStart,
        legend: () => (
          <ul className="legend">
            <li><span className="legend-mark is-confirmed" />録画される</li>
            <li><span className="legend-mark is-draft" />下書き（録画されない）</li>
            <li><span className="legend-mark is-cancelled">数学</span>取り消し</li>
          </ul>
        ),
      }}
      buttons={{ prev: { text: '‹' }, next: { text: '›' } }}
      prevHint="前の$0"
      nextHint="次の$0"
      toolbarClass="schedule-bar"
      toolbarSectionClass={(info) => `toolbar-${info.name}`}
      toolbarTitleClass="week-label"
      buttonGroupClass="view-switch"
      buttonClass={(info) => {
        if (info.name === 'prev' || info.name === 'next') {
          return 'nav-button'
        }
        return info.isSelected ? 'view-button is-selected' : 'view-button'
      }}
      views={{
        timeGridWeek: {
          allDaySlot: false,
          slotMinTime: hhmm(firstHour),
          slotMaxTime: hhmm(lastHour),
          slotDuration: '00:30',
          slotHeaderInterval: '01:00',
          slotMinHeight: 32,
          slotHeaderFormat: { hour: 'numeric', minute: '2-digit', hour12: false },
          dayHeaderContent: (info) => {
            const date = zoned(info.date)
            return (
              <>
                <span className="day-number">{date.day}</span>
                <span className="day-weekday">{WEEKDAYS[date.dayOfWeek - 1]}</span>
              </>
            )
          },
          slotLaneClass: 'slot-lane',
          slotHeaderClass: 'slot-header',
          eventContent: (info) => (
            <>
              <span className="slot-title">{info.event.title}</span>
              <span>
                {hm(info.event.start)}–{hm(info.event.end)}
              </span>
            </>
          ),
        },
        dayGridMonth: {
          showNonCurrentDates: false,
          fixedWeekCount: false,
          eventDisplay: 'block',
          dayHeaderContent: (info) => WEEKDAYS[zoned(info.date).dayOfWeek - 1],
          dayCellClass: 'day-cell',
          dayCellTopContent: (info) => <span className="day-number">{zoned(info.date).day}</span>,
          eventContent: (info) => (
            <>
              <span>{hm(info.event.start)}</span>
              <span className="slot-title">{info.event.title}</span>
            </>
          ),
        },
      }}
      viewClass={(info) => (info.view.type === 'dayGridMonth' ? 'is-month month-sheet' : '')}
      locale={jaLocale}
      timeZone={TZ}
      firstDay={1}
      height="auto"
      eventSources={eventSources}
      eventsSet={fitHours}
      dayHeaderClass="day-header"
      eventClass={(info) => `slot is-${String(info.event.extendedProps.kind)}`}
      eventInnerClass="slot-inner"
    />
  )
}
