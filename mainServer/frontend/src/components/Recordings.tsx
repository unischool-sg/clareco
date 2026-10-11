import { useEffect, useState } from 'react'
import { errorText, post } from '../api'
import { useMe } from '../hooks'
import { formatBytes, formatDateTime } from '../time'
import type { Recording } from '../types'

export default function Recordings({ slotId }: { slotId: number }) {
  const me = useMe()
  const [recordings, setRecordings] = useState<Recording[] | null>(null)
  const [playing, setPlaying] = useState<number | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    post<Recording[]>('/api/recordings/get', { slot_id: slotId })
      .then(setRecordings)
      .catch((e) => setError(errorText(e)))
  }, [slotId])

  if (error) return <p className="error">{error}</p>
  if (!recordings) return <p className="muted">読み込み中…</p>
  if (recordings.length === 0) return <p className="muted">録画はありません。</p>

  return (
    <div>
      <table>
        <tbody>
          {recordings.map((r) => (
            <tr key={r.id}>
              <td>{r.file_name}</td>
              <td>{formatBytes(r.size_bytes)}</td>
              <td>{formatDateTime(r.uploaded_at)}</td>
              <td>
                {me.can_view_recordings ? (
                  <button onClick={() => setPlaying(playing === r.id ? null : r.id)}>
                    {playing === r.id ? '閉じる' : '再生'}
                  </button>
                ) : (
                  <span className="muted">閲覧権限なし</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {playing !== null && <video key={playing} src={`/api/recordings/${playing}/video`} controls autoPlay />}
    </div>
  )
}
