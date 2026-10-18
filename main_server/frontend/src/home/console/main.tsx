import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { Paper } from '../../Paper/Paper.tsx'
import { RequireLogin } from "../../Auth/RequireLogin.tsx";

import FullCalendar from '@fullcalendar/react'
import themePlugin from '@fullcalendar/react/themes/monarch'
import timeGridPlugin from '@fullcalendar/react/timegrid'

import '@fullcalendar/react/skeleton.css'
import '@fullcalendar/react/themes/monarch/theme.css'
import '@fullcalendar/react/themes/monarch/palettes/purple.css'

const root = document.getElementById('root')
if (root === null) {
  throw new Error('#root not found')
}

createRoot(root).render(
    <StrictMode>
        <RequireLogin>
            <main>
                <Paper className="paper">
                    <FullCalendar
                        plugins={[themePlugin, timeGridPlugin]}
                        initialView="timeGridWeek"
                    />
                </Paper>
            </main>
        </RequireLogin>
    </StrictMode>
)