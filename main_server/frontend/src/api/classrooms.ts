import { postJson } from './post.ts'

export type Classroom = { id: number; name: string }

export function getClassrooms(signal?: AbortSignal) {
  return postJson<Classroom[]>('/api/classrooms/get', {}, signal)
}

export function addClassroom(name: string) {
  return postJson<{ id: number }>('/api/classrooms/add', { name })
}

export function renameClassroom(id: number, name: string) {
  return postJson<{ renamed: number }>('/api/classrooms/rename', { id, name })
}
