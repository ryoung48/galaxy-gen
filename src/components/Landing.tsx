import { Button, Grid, TextField } from '@mui/material'
import { useState } from 'react'

import { VIEW } from '../context'
import { DICE } from '../model/utilities/dice'
import { CONSTANTS } from '../model/constants'
import { GALAXY } from '../model/galaxy'

export function Landing() {
  const [seed, setSeed] = useState(DICE.id())
  const { dispatch } = VIEW.context()
  return (
    <Grid container justifyContent='center' spacing={1} pt={20}>
      <Grid item xs={4}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <TextField
              label='seed'
              onChange={event => setSeed(event.currentTarget.value)}
              value={seed}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant='contained'
              size='large'
              sx={{ width: '100%' }}
              onClick={async () => {
                window.galaxy = GALAXY.spawn({
                  radius: { min: 100, max: 300 },
                  dimensions: { width: CONSTANTS.W, height: CONSTANTS.H },
                  size: 2000,
                  seed
                })
                dispatch({ type: 'init', payload: { id: seed } })
              }}
            >
              Generate World
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}
