import { redirectToLogin } from '../Auth/redirectToLogin.ts'
import { ApiError } from './post.ts'

export type Me = { id: number; is_admin: boolean; can_view_recordings: boolean }

export async function getMe(signal?: AbortSignal): Promise<Me> {
  const res = await fetch('/api/auth/me', { signal })
  if (res.status === 401) {
    return redirectToLogin()
  }
  if (!res.ok) {
    throw new ApiError('/api/auth/me', res.status)
  }
  return (await res.json()) as Me
}
