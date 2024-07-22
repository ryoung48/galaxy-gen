import { createTheme } from '@mui/material/styles'
import { COLORS } from './colors'

const sciFiTheme = createTheme({
  palette: {
    primary: {
      main: COLORS.primary
    },
    secondary: {
      main: COLORS.accent
    }
  },
  typography: {
    fontFamily: ['Michroma'].join(','),
    fontSize: 12
  },
  components: {
    MuiButton: {
      defaultProps: {
        variant: 'contained',
        size: 'small'
      },
      styleOverrides: {
        root: {
          borderRadius: 0
        }
      }
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          letterSpacing: 1,
          lineHeight: 1,
          fontSize: 12,
          borderRadius: 0
        }
      }
    }
  }
})

export default sciFiTheme
