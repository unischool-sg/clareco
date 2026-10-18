// teacher API はどれも POST で JSON を送り、JSON を返す。各 API の関数からだけ使う
export async function postJson<T>(url: string, body: unknown = {}, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })
  if (!res.ok) {
    throw new Error(`${url} が ${String(res.status)} を返しました`)
  }
  return (await res.json()) as T
}
