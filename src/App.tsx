import 'tippy.js/dist/tippy.css'
import 'tippy.js/animations/scale.css'

import { Container, Grid, ThemeProvider } from '@mui/material'
import GalaxyMap from './components/maps'
import { useReducer, useState } from 'react'
import { VIEW, ViewContext } from './context'
import { Landing } from './components/Landing'
import sciFiTheme from './theme'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { StatisticsView } from './components/statistics'

function App() {
  const [state, dispatch] = useReducer(VIEW.reducer, { ...VIEW.init })
  const [stats, toggleStats] = useState(false)
  return (
    <ThemeProvider theme={sciFiTheme}>
      <ViewContext.Provider value={{ state, dispatch }}>
        <Header stats={stats} toggleStats={toggleStats}></Header>
        <Container maxWidth={false} sx={{ height: '100vh', padding: 0 }}>
          <Grid container justifyContent='space-around'>
            <Grid item p={0} xs={12}>
              {state.id && !stats && <GalaxyMap></GalaxyMap>}
              {state.id && stats && <StatisticsView></StatisticsView>}
              {!state.id && <Landing></Landing>}
            </Grid>
          </Grid>
        </Container>
        <Footer></Footer>
      </ViewContext.Provider>
    </ThemeProvider>
  )
}

export default App
