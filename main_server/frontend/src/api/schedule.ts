import { postJson } from './post.ts'

export type ScheduleSlot = { id: number; starts_at: string; ends_at: string; title: string | null }

// 期間は start_at 以上 end_at 未満（コマの開始時刻で絞る）
export type SlotRange = { classroom_id: number; start_at: string; end_at: string }

// POST /api/schedule/get: 確定したコマ（取り消したものは含まない）
export function getConfirmedSlots(range: SlotRange) {
  return postJson<ScheduleSlot[]>('/api/schedule/get', range)
}

// POST /api/schedule-draft/get: 下書きのコマ
export function getDraftSlots(range: SlotRange) {
  return postJson<ScheduleSlot[]>('/api/schedule-draft/get', range)
}
