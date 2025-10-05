import { Button, CircularProgress, Grid, TextField } from '@mui/material'
import { useEffect, useState } from 'react'

import { VIEW } from '../context'
import { DICE } from '../model/utilities/dice'
import { CONSTANTS } from '../model/constants'
import { GALAXY } from '../model/galaxy'

export function Landing() {
  const [seed, setSeed] = useState(DICE.id())
  const [loading, setLoading] = useState(false)
  const [pendingSeed, setPendingSeed] = useState<string | null>(null)
  const { dispatch } = VIEW.context()

  useEffect(() => {
    if (!pendingSeed) return
    let cancelled = false

    const timeoutId = window.setTimeout(() => {
      if (cancelled) return

      window.galaxy = GALAXY.spawn({
        radius: { min: 100, max: 300 },
        dimensions: { width: CONSTANTS.W, height: CONSTANTS.H },
        size: 3000,
        seed: pendingSeed
      })

      if (cancelled) return
      dispatch({ type: 'init', payload: { id: pendingSeed } })
      setLoading(false)
      setPendingSeed(null)
    }, 0)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [pendingSeed, dispatch])

  const handleGenerate = () => {
    setLoading(true)
    setPendingSeed(seed)
  }

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
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant='contained'
              size='large'
              sx={{ width: '100%', position: 'relative' }}
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate World'}
              {loading && (
                <CircularProgress
                  size={24}
                  sx={{
                    color: 'inherit',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-12px',
                    marginLeft: '-12px'
                  }}
                />
              )}
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}
