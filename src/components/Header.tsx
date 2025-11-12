import { AppBar, Box, Button, Grid, Toolbar, Typography } from '@mui/material'
import { css } from '@emotion/css'

import { VIEW } from '../context'
import { COLORS } from '../theme/colors'
import { Dispatch, SetStateAction } from 'react'

const classes = {
  appBar: css`
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%) !important;
    backdrop-filter: blur(10px);
    border-bottom: 2px solid ${COLORS.accent};
    box-shadow: 0 4px 20px rgba(7, 41, 61, 0.1) !important;
  `,
  logo: css`
    position: relative;
    &::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 60px;
      height: 3px;
      background: linear-gradient(90deg, ${COLORS.accent} 0%, transparent 100%);
    }
  `,
  seedBadge: css`
    background: ${COLORS.primary};
    color: ${COLORS.accent};
    padding: 4px 12px;
    font-size: 10px;
    letter-spacing: 2px;
    margin-top: 8px;
    display: inline-block;
    font-weight: bold;
  `,
  navButton: css`
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, ${COLORS.accent}40, transparent);
      transition: left 0.5s ease;
    }

    &:hover::before {
      left: 100%;
    }
  `
}

export function Header(props: { stats: boolean; toggleStats: Dispatch<SetStateAction<boolean>> }) {
  const { state } = VIEW.context()
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position='fixed'
        className={classes.appBar}
        sx={{
          color: COLORS.primary
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Grid container spacing={0} justifyContent='space-between' alignItems='center'>
            <Grid item container spacing={0} alignContent='center' sx={{ width: 'auto' }}>
              <Grid item xs={12} className={classes.logo}>
                <Typography
                  variant='h4'
                  component='div'
                  sx={{
                    fontFamily: 'Jedar',
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    fontWeight: 600,
                    letterSpacing: '0.05em'
                  }}
                >
                  World Generator
                </Typography>
              </Grid>
              {state?.id && (
                <Grid item xs={12}>
                  <Box className={classes.seedBadge}>
                    SEED: {state.id.slice(0, 8).toUpperCase()}
                  </Box>
                </Grid>
              )}
            </Grid>
            {state?.id && (
              <Grid item>
                <Button
                  onClick={() => props.toggleStats(!props.stats)}
                  className={classes.navButton}
                  sx={{
                    px: 3,
                    py: 1,
                    fontSize: '0.9rem',
                    letterSpacing: '0.1em',
                    fontWeight: 600
                  }}
                >
                  {props.stats ? 'WORLD' : 'STATS'}
                </Button>
              </Grid>
            )}
          </Grid>
        </Toolbar>
      </AppBar>
    </Box>
  )
}
