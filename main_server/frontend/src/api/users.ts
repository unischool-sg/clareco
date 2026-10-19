import { postJson } from './post.ts'

export type User = {
  id: number
  email: string
  display_name: string | null
  is_admin: boolean
  can_view_recordings: boolean
  created_at: string
  disabled_at: string | null
}

export type UserPermissions = { is_admin: boolean; can_view_recordings: boolean }

export function getUsers(signal?: AbortSignal) {
  return postJson<User[]>('/api/users/get', {}, signal)
}

export function addUser(email: string, permissions: UserPermissions) {
  return postJson<{ id: number }>('/api/users/add', { email, ...permissions })
}

export function editUser(id: number, permissions: UserPermissions) {
  return postJson<{ edited: number }>('/api/users/edit', { id, ...permissions })
}

export function disableUser(id: number) {
  return postJson<{ disabled: number }>('/api/users/disable', { id })
}
