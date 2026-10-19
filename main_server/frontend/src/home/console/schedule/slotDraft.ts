import { Temporal } from 'temporal-polyfill'

import { TZ } from '../format.ts'

export type SlotDraft = { date: string; start: string; end: string }

const EARLIEST = Temporal.PlainTime.from('07:00')
const LATEST = Temporal.PlainTime.from('19:00')
const MAX_MINUTES = 4 * 60

export const slotDraftFrom = (start: Date, end: Date): SlotDraft => {
  const s = Temporal.Instant.fromEpochMilliseconds(start.getTime()).toZonedDateTimeISO(TZ)
  const e = Temporal.Instant.fromEpochMilliseconds(end.getTime()).toZonedDateTimeISO(TZ)
  const sameDay = Temporal.PlainDate.compare(s.toPlainDate(), e.toPlainDate()) === 0
  return {
    date: s.toPlainDate().toString(),
    start: s.toPlainTime().toString({ smallestUnit: 'minute' }),
    end: (sameDay ? e : s.add({ hours: 1 })).toPlainTime().toString({ smallestUnit: 'minute' }),
  }
}

export const slotDraftForDay = (date: Temporal.PlainDate): SlotDraft => ({
  date: date.toString(),
  start: '09:00',
  end: '10:00',
})

export const validateSlot = (start: Temporal.PlainTime, end: Temporal.PlainTime) => {
  if (Temporal.PlainTime.compare(start, EARLIEST) < 0 || Temporal.PlainTime.compare(end, LATEST) > 0) {
    return '7:00 から 19:00 の間で入れてください。'
  }
  if (Temporal.PlainTime.compare(start, end) >= 0) {
    return '終わりの時刻は始まりより後にしてください。'
  }
  if (start.until(end).total('minutes') > MAX_MINUTES) {
    return '1つの予定は4時間までです。'
  }
  return null
}
