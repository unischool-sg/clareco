import '../../colors.css'
import './console.css'

import type { ReactNode } from 'react'

import { Tab, TabBar } from '../../TabBar/TabBar.tsx'

export function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <TabBar>
        <Tab href="/console/">時間割</Tab>
        <Tab href="/console/recordings/">録画</Tab>
        <Tab href="/console/devices/">教室と録画機</Tab>
        <Tab href="/console/users/">職員</Tab>
      </TabBar>
      <main className="console">{children}</main>
    </>
  )
}
