const TZ = 'Asia/Tokyo'
const OFFSET = '+09:00'

export const WEEKDAYS = ['月', '火', '水', '木', '金', '土', '日']

// "YYYY-MM-DDTHH:mm"（datetime-local の値）を JST で作る。
export function toLocalInput(iso: string): string {
  return new Date(iso).toLocaleString('sv-SE', { timeZone: TZ }).replace(' ', 'T').slice(0, 16)
}

export function fromLocalInput(value: string): string {
  return `${value}:00${OFFSET}`
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('ja-JP', { timeZone: TZ })
}

export function formatSlotTime(starts: string, ends: string): string {
  const s = new Date(starts)
  const day = s.toLocaleDateString('ja-JP', { timeZone: TZ, month: 'numeric', day: 'numeric', weekday: 'short' })
  const hm = (d: Date) => d.toLocaleTimeString('ja-JP', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })
  return `${day} ${hm(s)}–${hm(new Date(ends))}`
}

export function currentMonth(): string {
  return new Date().toLocaleString('sv-SE', { timeZone: TZ }).slice(0, 7)
}

export function monthRange(ym: string): { start_at: string; end_at: string } {
  const [y, m] = ym.split('-').map(Number)
  const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`
  return { start_at: `${ym}-01T00:00:00${OFFSET}`, end_at: `${next}-01T00:00:00${OFFSET}` }
}

export function formatBytes(n: number): string {
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`
}
