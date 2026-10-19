import { postJson } from './post.ts'

export type Device = {
  id: number
  classroom_id: number
  name: string
  created_at: string
  last_seen_at: string | null
  revoked_at: string | null
}

export function getDevices(signal?: AbortSignal) {
  return postJson<Device[]>('/api/devices/get', {}, signal)
}

export function addDevice(classroomId: number, name: string) {
  return postJson<{ id: number; token: string }>('/api/devices/add', { classroom_id: classroomId, name })
}

export function revokeDevice(id: number) {
  return postJson<{ revoked: number }>('/api/devices/revoke', { id })
}
