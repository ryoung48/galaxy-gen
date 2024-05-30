import 'tippy.js/dist/tippy.css'
import 'tippy.js/animations/scale.css'

import { Box, Grid } from '@mui/material'
import GalaxyMap from './components/galaxy'
import { GALAXY } from './model/galaxy'
import { CONSTANTS } from './model/constants'
import { useReducer } from 'react'
import { VIEW, ViewContext } from './context'
import { DICE } from './model/utilities/dice'

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
          <Grid item xs={12}>
            <GalaxyMap></GalaxyMap>
          </Grid>
        </Grid>
      </Box>
    </ViewContext.Provider>
  )
}

export default App
