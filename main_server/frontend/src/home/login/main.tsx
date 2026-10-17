import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { GoogleSignInButton } from '../../Auth/GoogleSignInButton.tsx'
import { Paper } from '../../Paper/Paper.tsx'

const root = document.getElementById('root')
if (root === null) {
  throw new Error('#root not found')
}

createRoot(root).render(
  <StrictMode>
    <main>
      <Paper className="login-paper">
        <section className="login">
          <h1>
            <img className="logo" src="/assets/clareco.svg" alt="" />
            ClassRecall
            </h1>
          <p className="lead">学校の Google アカウントでログインしてください。</p>
          <GoogleSignInButton />
        </section>
      </Paper>
    </main>
  </StrictMode>,
)
