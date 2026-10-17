import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { Paper } from '../../Paper/Paper.tsx'
import { RequireLogin } from "../../Auth/RequireLogin.tsx";

const root = document.getElementById('root')
if (root === null) {
  throw new Error('#root not found')
}

createRoot(root).render(
    <StrictMode>
        <RequireLogin>
            <main>
                <Paper className="paper">
                    {null}
                </Paper>
            </main>
        </RequireLogin>
    </StrictMode>
)