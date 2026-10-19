import { postJson } from './post.ts'

export type ScheduleSlot = { id: number; starts_at: string; ends_at: string; title: string | null }

export type SlotRange = { classroom_id: number; start_at: string; end_at: string }

export type NewSlot = { starts_at: string; ends_at: string; title: string | null }

export type ScheduleMonth = { month: string; confirmed_at: string; confirmed_by: number }

export function getConfirmedSlots(range: SlotRange, signal?: AbortSignal) {
  return postJson<ScheduleSlot[]>('/api/schedule/get', range, signal)
}

export function getDraftSlots(range: SlotRange) {
  return postJson<ScheduleSlot[]>('/api/schedule-draft/get', range)
}

export function addConfirmedSlot(classroomId: number, slot: NewSlot) {
  return postJson<{ id: number }>('/api/schedule/add', { classroom_id: classroomId, slot })
}

export function addDraftSlot(classroomId: number, slot: NewSlot) {
  return postJson<{ added: number }>('/api/schedule-draft/add', { classroom_id: classroomId, slots: [slot] })
}

export function getConfirmedMonths(classroomId: number) {
  return postJson<ScheduleMonth[]>('/api/schedule-months/get', { classroom_id: classroomId })
}
