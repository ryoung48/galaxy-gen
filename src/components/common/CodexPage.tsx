import { css } from '@emotion/css'
import { Box, Grid } from '@mui/material'
import { ReactNode } from 'react'

import { VIEW } from '../../context'
import { Heraldry } from '../heraldry'
import { HERALDRY } from '../heraldry/common'
import { CodexTitle } from './title'
import { CodexTitleProps } from './title/types'
import { SOLAR_SYSTEM } from '../../model/system'

const classes = {
  panel: css`
    overflow-y: auto;
    overscroll-behavior-y: contain;
    scroll-snap-type: y proximity;
  `,
  content: css`
    font-size: 12px;
  `
}

export function CodexPage(props: { content: ReactNode } & CodexTitleProps) {
  const { title, subtitle, content } = props
  const { state } = VIEW.context()
  const nation =
    state.selected.type === 'nation'
      ? window.galaxy.nations[state.selected.id]
      : SOLAR_SYSTEM.nation(VIEW.system(state)!)
  return (
    <Box className={classes.panel}>
      <Grid container p={3} justifyContent='space-between'>
        <Grid item xs={7}>
          <CodexTitle title={title} subtitle={subtitle}></CodexTitle>
        </Grid>
        <Grid item xs={1.5}>
          <Heraldry value={nation.name} size={50} config={HERALDRY.config(nation)}></Heraldry>
        </Grid>
        <Grid item xs={12} p={0} my={3} className={classes.content}>
          {content}
        </Grid>
      </Grid>
    </Box>
  )
}
