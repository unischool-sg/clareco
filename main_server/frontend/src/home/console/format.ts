import { Temporal } from 'temporal-polyfill'

import { ApiError } from '../../api/post.ts'

export const TZ = 'Asia/Tokyo'
export const WEEKDAYS = ['月', '火', '水', '木', '金', '土', '日']

const dateTimeFormat = new Intl.DateTimeFormat('ja-JP', { timeZone: TZ, dateStyle: 'medium', timeStyle: 'short' })

export const toZoned = (iso: string) => Temporal.Instant.from(iso).toZonedDateTimeISO(TZ)

export const formatDateTime = (iso: string | null) => (iso === null ? '—' : dateTimeFormat.format(new Date(iso)))

export const formatTime = (iso: string) => {
  const t = toZoned(iso)
  return `${t.hour}:${String(t.minute).padStart(2, '0')}`
}

export const formatSize = (bytes: number) => {
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit] ?? 'B'}`
}

export const errorMessage = (e: unknown) => {
  if (e instanceof ApiError) {
    switch (e.status) {
      case 403:
        return 'この操作をする権限がありません。'
      case 409:
        return 'ほかの内容と重なるため、この操作はできません。'
      case 422:
        return '入力内容を確認してください。'
      default:
        return `サーバーでエラーが起きました（${String(e.status)}）。`
    }
  }
  return '通信できませんでした。'
}

export const isForbidden = (e: unknown) => e instanceof ApiError && e.status === 403
