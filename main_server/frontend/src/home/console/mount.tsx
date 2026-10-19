import { type ReactNode, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

export function mount(page: ReactNode) {
  const root = document.getElementById('root')
  if (root === null) {
    throw new Error('#root not found')
  }
  createRoot(root).render(<StrictMode>{page}</StrictMode>)
}
