import { useState } from 'react'
import { post } from '../api'
import Messages from '../components/Messages'
import { useAction, useClassrooms, useMe } from '../hooks'

export default function ClassroomsPage() {
  const me = useMe()
  const { classrooms, error: classroomsError, reload } = useClassrooms()
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')
  const { error, notice, run } = useAction()

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await run(async () => {
      await post('/api/classrooms/add', { name: newName })
      await reload()
      return `教室「${newName}」を追加しました。`
    })
    if (ok) setNewName('')
  }

  const rename = async (id: number) => {
    const ok = await run(async () => {
      await post('/api/classrooms/rename', { id, name: editingName })
      await reload()
      return '教室名を変更しました。'
    })
    if (ok) setEditingId(null)
  }

  return (
    <>
      <h2>教室</h2>
      {me.is_admin && (
        <section>
          <form className="row" onSubmit={add} style={{ marginBottom: 0 }}>
            <input placeholder="教室名" required maxLength={100} value={newName} onChange={(e) => setNewName(e.target.value)} />
            <button className="primary">追加</button>
          </form>
        </section>
      )}
      <section>
        <Messages error={classroomsError || error} notice={notice} />
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>名前</th>
              {me.is_admin && <th></th>}
            </tr>
          </thead>
          <tbody>
            {classrooms.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>
                  {editingId === c.id ? (
                    <input value={editingName} maxLength={100} onChange={(e) => setEditingName(e.target.value)} />
                  ) : (
                    c.name
                  )}
                </td>
                {me.is_admin && (
                  <td className="actions">
                    {editingId === c.id ? (
                      <>
                        <button className="primary" onClick={() => rename(c.id)} disabled={!editingName}>
                          保存
                        </button>
                        <button onClick={() => setEditingId(null)}>キャンセル</button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(c.id)
                          setEditingName(c.name)
                        }}
                      >
                        名前を変更
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}
