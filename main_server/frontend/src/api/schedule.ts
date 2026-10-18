import { postJson } from './post.ts'

export type ScheduleSlot = { id: number; starts_at: string; ends_at: string; title: string | null }

export type SlotRange = { classroom_id: number; start_at: string; end_at: string }

export function getConfirmedSlots(range: SlotRange) {
  return postJson<ScheduleSlot[]>('/api/schedule/get', range)
}

export function getDraftSlots(range: SlotRange) {
  return postJson<ScheduleSlot[]>('/api/schedule-draft/get', range)
}
