import './TabBar.css'

import type { ReactNode } from 'react'

import { Clip } from '../Clip/Clip.tsx'

type TabBarProps = {
  children: ReactNode
}

export function TabBar({ children }: TabBarProps) {
  return (
    <header className="tab-bar">
      <a className="tab-bar-logo" href="/">
        <img src="/assets/clareco.svg" alt="" />
        ClassRecall
      </a>
      <nav className="tab-bar-tabs">{children}</nav>
    </header>
  )
}

type TabProps = {
  href: string
  children: ReactNode
}

export function Tab({ href, children }: TabProps) {
  if (href === location.pathname) {
    return (
      <a className="tab" href={href} aria-current="page">
        <Clip>{children}</Clip>
      </a>
    )
  }
  return (
    <a className="tab" href={href}>
      {children}
    </a>
  )
}
