import { redirectToLogin } from '../Auth/redirectToLogin.ts'

export class ApiError extends Error {
  readonly url: string
  readonly status: number

  constructor(url: string, status: number) {
    super(`${url} が ${String(status)} を返しました`)
    this.url = url
    this.status = status
  }
}

export async function postJson<T>(url: string, body: unknown = {}, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })
  if (res.status === 401) {
    return redirectToLogin()
  }
  if (!res.ok) {
    throw new ApiError(url, res.status)
  }
  return (await res.json()) as T
}
