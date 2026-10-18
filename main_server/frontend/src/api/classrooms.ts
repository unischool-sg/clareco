import { postJson } from './post.ts'

export type Classroom = { id: number; name: string }

export function getClassrooms(signal?: AbortSignal) {
  return postJson<Classroom[]>('/api/classrooms/get', {}, signal)
}
