import type { Classroom } from '../types'

type Props = {
  classrooms: Classroom[]
  value: number | null
  onChange: (id: number) => void
}

export default function ClassroomSelect({ classrooms, value, onChange }: Props) {
  return (
    <label>
      教室{' '}
      <select value={value ?? ''} onChange={(e) => onChange(Number(e.target.value))}>
        <option value="" disabled>
          選択してください
        </option>
        {classrooms.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  )
}
