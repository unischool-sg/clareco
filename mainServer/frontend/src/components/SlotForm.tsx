import { useState } from 'react'
import { fromLocalInput, toLocalInput } from '../time'
import type { NewSlot } from '../types'

type Props = {
  initial?: NewSlot
  submitLabel: string
  onSubmit: (slot: NewSlot) => Promise<boolean>
  onCancel?: () => void
}

export default function SlotForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const [start, setStart] = useState(initial ? toLocalInput(initial.starts_at) : '')
  const [end, setEnd] = useState(initial ? toLocalInput(initial.ends_at) : '')
  const [title, setTitle] = useState(initial?.title ?? '')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    const ok = await onSubmit({ starts_at: fromLocalInput(start), ends_at: fromLocalInput(end), title: title || null })
    setBusy(false)
    if (ok && !initial) {
      setStart('')
      setEnd('')
      setTitle('')
    }
  }

  return (
    <form className="row" onSubmit={submit} style={{ marginBottom: 0 }}>
      <input type="datetime-local" required value={start} onChange={(e) => setStart(e.target.value)} />
      〜
      <input type="datetime-local" required value={end} onChange={(e) => setEnd(e.target.value)} />
      <input placeholder="タイトル（任意）" value={title} onChange={(e) => setTitle(e.target.value)} />
      <button className="primary" disabled={busy}>
        {submitLabel}
      </button>
      {onCancel && (
        <button type="button" onClick={onCancel}>
          キャンセル
        </button>
      )}
    </form>
  )
}
