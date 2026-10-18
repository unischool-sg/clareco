import { postJson } from './post.ts'

export type Classroom = { id: number; name: string }

// POST /api/classrooms/get
export function getClassrooms(signal?: AbortSignal) {
  return postJson<Classroom[]>('/api/classrooms/get', {}, signal)
}
