import 'tippy.js/dist/tippy.css'
import 'tippy.js/animations/scale.css'

import { Box, Grid } from '@mui/material'
import GalaxyMap from './components/galaxy'
import SolarSystemView from './components/SolarSystem'
import { GALAXY } from './model/galaxy'
import { CONSTANTS } from './model/constants'
import { useReducer } from 'react'
import { VIEW, ViewContext } from './context'
import { DICE } from './model/utilities/dice'
import NationView from './components/Nation'
import StarView from './components/Star'
import SatelliteView from './components/Satellite'

window.galaxy = GALAXY.spawn({
  radius: { min: 100, max: 300 },
  dimensions: { width: CONSTANTS.W, height: CONSTANTS.H },
  size: 2000
})

function App() {
  const start = DICE.swap(window.galaxy.seed, () => window.dice.choice(GALAXY.worlds()))
  const [state, dispatch] = useReducer(VIEW.reducer, {
    ...VIEW.init,
    id: window.galaxy.seed,
    selected: { type: 'system', id: start.idx }
  })
  return (
    <ViewContext.Provider value={{ state, dispatch }}>
      <Box>
        <Grid container p={5} justifyContent='space-around'>
          <Grid item xs={5}>
            <GalaxyMap></GalaxyMap>
          </Grid>
          <Grid item xs={6}>
            {state.selected.type === 'system' && <SolarSystemView />}
            {state.selected.type === 'nation' && <NationView />}
            {state.selected.type === 'star' && <StarView />}
            {state.selected.type === 'satellite' && <SatelliteView />}
          </Grid>
        </Grid>
      </Box>
    </ViewContext.Provider>
  )
}

export default App
