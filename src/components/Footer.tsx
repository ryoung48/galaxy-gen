import { css } from '@emotion/css'
import { Box, Grid, Typography } from '@mui/material'

import { COLORS } from '../theme/colors'

const classes = {
  footer: css`
    position: fixed;
    bottom: 0;
    width: 100%;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%);
    backdrop-filter: blur(10px);
    color: ${COLORS.primary};
    border-top: 2px solid ${COLORS.accent};
    box-shadow: 0 -4px 20px rgba(7, 41, 61, 0.1);
    z-index: 1000;
  `,
  content: css`
    padding: 16px 24px;
  `,
  text: css`
    font-size: 0.85rem;
    letter-spacing: 0.05em;
    font-weight: 500;
  `,
  link: css`
    color: ${COLORS.accent};
    text-decoration: none;
    font-weight: 600;
    letter-spacing: 0.1em;
    transition: all 0.2s ease;
    cursor: pointer;

    &:hover {
      color: ${COLORS.primary};
      text-decoration: underline;
    }
  `,
  divider: css`
    width: 2px;
    height: 16px;
    background: ${COLORS.accent}40;
    display: inline-block;
    margin: 0 12px;
    vertical-align: middle;
  `
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <Box component='footer' className={classes.footer}>
      <Grid container className={classes.content} justifyContent='space-between' alignItems='center'>
        <Grid item>
          <Typography className={classes.text}>
            © {currentYear} World Generator
            <span className={classes.divider}></span>
            <span className={classes.link}>Procedural Universe System</span>
          </Typography>
        </Grid>
        <Grid item>
          <Typography className={classes.text}>
            <span className={classes.link}>Documentation</span>
            <span className={classes.divider}></span>
            <span className={classes.link}>About</span>
          </Typography>
        </Grid>
      </Grid>
    </Box>
  )
}
