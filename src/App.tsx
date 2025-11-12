import 'tippy.js/dist/tippy.css'
import 'tippy.js/animations/scale.css'

import { Box, Container, Grid, ThemeProvider } from '@mui/material'
import { css } from '@emotion/css'
import GalaxyMap from './components/maps'
import { useReducer, useState } from 'react'
import { VIEW, ViewContext } from './context'
import { Landing } from './components/Landing'
import sciFiTheme from './theme'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { StatisticsView } from './components/statistics'

const classes = {
  appContainer: css`
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  `,
  mainContent: css`
    flex: 1;
    padding-top: 88px;
    padding-bottom: 64px;
    position: relative;
    width: 100%;
  `,
  fullscreenContent: css`
    padding: 0 !important;
    margin: 0 !important;
    max-width: none !important;
    width: 100vw !important;
    height: 100vh !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
  `
}

function App() {
  const [state, dispatch] = useReducer(VIEW.reducer, { ...VIEW.init })
  const [stats, toggleStats] = useState(false)

  const isLanding = !state.id
  const isFullscreen = true // Always fullscreen for landing, map, and stats

  return (
    <ThemeProvider theme={sciFiTheme}>
      <ViewContext.Provider value={{ state, dispatch }}>
        <Box className={classes.appContainer}>
          {!isFullscreen && <Header stats={stats} toggleStats={toggleStats}></Header>}

          <Container
            maxWidth={false}
            sx={{ padding: 0, margin: 0 }}
            className={`${classes.mainContent} ${isFullscreen ? classes.fullscreenContent : ''}`}
          >
            {isLanding ? (
              <Landing></Landing>
            ) : (
              <Grid container justifyContent='space-around'>
                <Grid item p={0} xs={12}>
                  {stats ? <StatisticsView toggleStats={toggleStats}></StatisticsView> : <GalaxyMap toggleStats={toggleStats}></GalaxyMap>}
                </Grid>
              </Grid>
            )}
          </Container>

          {!isFullscreen && <Footer></Footer>}
        </Box>
      </ViewContext.Provider>
    </ThemeProvider>
  )
}

export default App
