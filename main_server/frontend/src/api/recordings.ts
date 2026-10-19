import { postJson } from './post.ts'

export type Recording = { id: number; file_name: string; size_bytes: number; uploaded_at: string }

export function getRecordings(slotId: number, signal?: AbortSignal) {
  return postJson<Recording[]>('/api/recordings/get', { slot_id: slotId }, signal)
}

export const videoUrl = (id: number) => `/api/recordings/${String(id)}/video`
