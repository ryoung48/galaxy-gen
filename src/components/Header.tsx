import { AppBar, Box, Button, Grid, Toolbar, Typography } from '@mui/material'

import { VIEW } from '../context'
import { COLORS } from '../theme/colors'
import { Dispatch, SetStateAction } from 'react'

export function Header(props: { stats: boolean; toggleStats: Dispatch<SetStateAction<boolean>> }) {
  const { state } = VIEW.context()
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position='fixed'
        sx={{
          backgroundColor: `white !important`,
          color: COLORS.primary
        }}
      >
        <Toolbar>
          <Grid container spacing={0} justifyContent='space-between'>
            <Grid item xs={3} container spacing={0} alignContent='center'>
              <Grid item xs={12}>
                <Typography variant='h5' component='div'>
                  World Generator
                </Typography>
              </Grid>
              <Grid item xs={12} sx={{ margin: 0.5 }}>
                <Typography
                  variant='subtitle2'
                  component='div'
                  sx={{ lineHeight: 0, color: COLORS.subtitle, fontSize: 8 }}
                >
                  {state?.id || '∞'}
                </Typography>
              </Grid>
            </Grid>
            <Grid item px={1}>
              <Button onClick={() => props.toggleStats(!props.stats)}>
                {props.stats ? 'world' : 'stats'}
              </Button>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </Box>
  )
}
