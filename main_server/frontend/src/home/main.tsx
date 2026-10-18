import '../colors.css'
import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { Clip } from '../Clip/Clip.tsx'
import { Hole } from '../Hole/Hole.tsx'
import { Paper } from '../Paper/Paper.tsx'

const root = document.getElementById('root')
if (root === null) {
  throw new Error('#root not found')
}

createRoot(root).render(
  <StrictMode>
    <main>
      <Paper>
        <nav className="tab-bar">
          <button type="button" className="tab" aria-current="page"><Clip>ホーム</Clip></button>
          <button type="button" className="tab">授業</button>
          <button type="button" className="tab">使い方</button>
        </nav>
        <section className="section hero">
          <div className="section-text">
            <h1><img className="logo" src="/assets/clareco.svg" alt="" />ClassRecall</h1>
            <p className="lead">授業を、あとから思い出せるノート。</p>
            <button type="button" className="start-button">はじめる</button>
          </div>
          <Hole className="section-photo" type="a" src="/assets/classroom.webp" alt="授業の画面" />
        </section>
        <section className="section is-photo-left">
          <Hole className="section-photo" type="b" src="/assets/classroom.webp" alt="授業の画面" />
          <div className="section-text">
            <h2>授業が、そのまま残る。</h2>
            <p className="description">授業ごとに記録がまとまり、<br />あとから日付でたどれます。</p>
          </div>
        </section>
        <section className="section">
          <div className="section-text">
            <h2>見返したいところから。</h2>
            <p className="description">聞き逃した説明や、<br />もう一度見たい場面にすぐ戻れます。</p>
          </div>
          <Hole className="section-photo" type="c" src="/assets/classroom.webp" alt="授業の画面" />
        </section>
      </Paper>
    </main>
  </StrictMode>,
)
