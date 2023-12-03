import { css } from '@emotion/css'
import { Box, Grid } from '@mui/material'

import { CodexTitleProps } from './types'
import { STYLES } from '../../styles'

const classes = {
  title: css`
    font-size: 40px;
  `,
  subtitle: css`
    font-size: 12px;
    color: ${STYLES.subtitle};
    padding-top: 3px;
  `
}

export function CodexTitle(props: CodexTitleProps) {
  const { title, subtitle } = props
  return (
    <Grid container>
      <Grid item xs={12}>
        <Box className={classes.title}>{title}</Box>
      </Grid>
      <Grid item xs={12}>
        <Box className={`${classes.subtitle}`}>{subtitle}</Box>
      </Grid>
    </Grid>
  )
}
