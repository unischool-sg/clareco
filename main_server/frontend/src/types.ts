export type Me = {
  id: number
  is_admin: boolean
  can_view_recordings: boolean
}

export type User = {
  id: number
  email: string
  display_name: string | null
  is_admin: boolean
  can_view_recordings: boolean
  created_at: string
  disabled_at: string | null
}

export type Classroom = {
  id: number
  name: string
}

export type Device = {
  id: number
  classroom_id: number
  name: string
  created_at: string
  last_seen_at: string | null
  revoked_at: string | null
}

export type Slot = {
  id: number
  starts_at: string
  ends_at: string
  title: string | null
}

export type NewSlot = Omit<Slot, 'id'>

export type TemplatePeriod = {
  weekday: number
  period: number
  start_time: string
  end_time: string
}

export type ScheduleMonth = {
  month: string
  confirmed_at: string
  confirmed_by: number
}

export type Recording = {
  id: number
  file_name: string
  size_bytes: number
  uploaded_at: string
}
