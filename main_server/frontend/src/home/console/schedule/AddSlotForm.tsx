import { type SubmitEvent, useState } from 'react'
import { Temporal } from 'temporal-polyfill'

import { ApiError } from '../../../api/post.ts'
import { addConfirmedSlot, addDraftSlot, getConfirmedMonths } from '../../../api/schedule.ts'
import { errorMessage, TZ } from '../format.ts'
import { type SlotDraft, validateSlot } from './slotDraft.ts'

type AddSlotFormProps = {
  classroomId: number
  initial: SlotDraft
  onAdded: (message: string) => void
  onCancel: () => void
}

export function AddSlotForm({ classroomId, initial, onAdded, onCancel }: AddSlotFormProps) {
  const [date, setDate] = useState(initial.date)
  const [start, setStart] = useState(initial.start)
  const [end, setEnd] = useState(initial.end)
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    const day = Temporal.PlainDate.from(date)
    const startTime = Temporal.PlainTime.from(start)
    const endTime = Temporal.PlainTime.from(end)
    const invalid = validateSlot(startTime, endTime)
    if (invalid !== null) {
      setError(invalid)
      return
    }
    const slot = {
      starts_at: day.toZonedDateTime({ timeZone: TZ, plainTime: startTime }).toInstant().toString(),
      ends_at: day.toZonedDateTime({ timeZone: TZ, plainTime: endTime }).toInstant().toString(),
      title: title.trim() === '' ? null : title.trim(),
    }
    setBusy(true)
    setError(null)
    try {
      const month = day.toPlainYearMonth().toString()
      const confirmed = (await getConfirmedMonths(classroomId)).some((m) => m.month.startsWith(month))
      if (confirmed) {
        await addConfirmedSlot(classroomId, slot)
        onAdded('予定を追加しました。この予定は録画されます。')
      } else {
        await addDraftSlot(classroomId, slot)
        onAdded('下書きに追加しました。この月を確定するまで録画されません。')
      }
    } catch (err: unknown) {
      console.error(err)
      setError(err instanceof ApiError && err.status === 409 ? '同じ時間にほかの予定があります。' : errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="add-slot" onSubmit={(e) => void submit(e)}>
      <h2>予定を追加</h2>
      {error !== null && <p className="console-alert" role="alert">{error}</p>}
      <div className="row">
        <input
          className="text-input"
          type="date"
          aria-label="日付"
          value={date}
          required
          onChange={(e) => { setDate(e.currentTarget.value); }}
        />
        <input
          className="text-input"
          type="time"
          aria-label="始まり"
          min="07:00"
          max="19:00"
          step={300}
          value={start}
          required
          onChange={(e) => { setStart(e.currentTarget.value); }}
        />
        <span>–</span>
        <input
          className="text-input"
          type="time"
          aria-label="終わり"
          min="07:00"
          max="19:00"
          step={300}
          value={end}
          required
          onChange={(e) => { setEnd(e.currentTarget.value); }}
        />
        <input
          className="text-input"
          aria-label="授業名"
          placeholder="授業名（例: 数学）"
          value={title}
          onChange={(e) => { setTitle(e.currentTarget.value); }}
        />
        <button type="submit" className="button" disabled={busy}>追加</button>
        <button type="button" className="text-button" onClick={onCancel}>やめる</button>
      </div>
    </form>
  )
}
