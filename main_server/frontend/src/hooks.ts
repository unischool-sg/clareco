import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { errorText, post } from './api'
import type { Classroom, Me } from './types'

export const MeContext = createContext<Me | null>(null)

export function useMe(): Me {
  const me = useContext(MeContext)
  if (!me) throw new Error('useMe must be used inside MeContext')
  return me
}

export function useAction() {
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const run = useCallback(async (action: () => Promise<string | void>): Promise<boolean> => {
    setError('')
    setNotice('')
    try {
      const message = await action()
      if (message) setNotice(message)
      return true
    } catch (e) {
      setError(errorText(e))
      return false
    }
  }, [])

  return { error, notice, run, setError, setNotice }
}

export function useClassrooms() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    try {
      setClassrooms(await post<Classroom[]>('/api/classrooms/get'))
      setError('')
    } catch (e) {
      setError(errorText(e))
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { classrooms, error, reload }
}
