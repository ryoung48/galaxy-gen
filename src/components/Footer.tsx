import { css } from '@emotion/css'
import { Box, Typography } from '@mui/material'

import { COLORS } from '../theme/colors'

const classes = {
  footer: css`
    position: absolute;
    bottom: 0;
    width: 100% !important;
    background: white;
    color: ${COLORS.primary};
  `,
  text: css`
    padding: 6px 16px 6px 16px;
  `
}

export function Footer() {
  return (
    <Box component='div' className={classes.footer}>
      <Typography className={classes.text}>© 2017</Typography>
    </Box>
  )
}
