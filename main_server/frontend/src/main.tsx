import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Clip } from './Clip.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Clip>Hello, world!</Clip>
  </StrictMode>,
)
