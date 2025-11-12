import { Box, Button, CircularProgress, Grid, TextField, Typography } from '@mui/material'
import { css, keyframes } from '@emotion/css'
import { useEffect, useRef, useState } from 'react'

import { VIEW } from '../context'
import { DICE } from '../model/utilities/dice'
import { CONSTANTS } from '../model/constants'
import { GALAXY } from '../model/galaxy'
import { COLORS } from '../theme/colors'

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`

const pulse = keyframes`
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
`

const fadeToWhite = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
`

const classes = {
  container: css`
    min-height: 100vh;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffffff;
    position: fixed;
    top: 0;
    left: 0;
    overflow: hidden;
  `,
  whiteOverlay: css`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #ffffff;
    z-index: 999;
    opacity: 0;
    pointer-events: none;
  `,
  whiteOverlayFadeIn: css`
    animation: ${fadeToWhite} 0.8s ease-out forwards;
  `,
  whiteLayer: css`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  canvas: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    background: #ffffff;
    z-index: 0;
  `,
  hero: css`
    text-align: center;
    z-index: 1;
    position: relative;
  `,
  title: css`
    font-family: 'Jedar', sans-serif !important;
    font-size: 4rem !important;
    font-weight: 700 !important;
    color: ${COLORS.primary} !important;
    margin-bottom: 16px !important;
    letter-spacing: 0.1em !important;
    animation: ${float} 4s ease-in-out infinite;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 3px;
      background: linear-gradient(90deg, transparent, ${COLORS.accent}, transparent);
    }

    @media (max-width: 768px) {
      font-size: 2.5rem !important;
    }
  `,
  subtitle: css`
    color: ${COLORS.subtitle} !important;
    font-size: 1rem !important;
    margin-bottom: 48px !important;
    letter-spacing: 0.2em !important;
    text-transform: uppercase;
    font-weight: 400 !important;
  `,
  card: css`
    background: white;
    padding: 48px;
    box-shadow: 0 10px 40px rgba(7, 41, 61, 0.08), 0 0 0 1px rgba(7, 41, 61, 0.05);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background: linear-gradient(90deg, ${COLORS.accent}, ${COLORS.primary}, ${COLORS.accent});
    }

    @media (max-width: 768px) {
      padding: 32px 24px;
    }
  `,
  inputWrapper: css`
    position: relative;
    margin-bottom: 24px;
  `,
  generateButton: css`
    position: relative;
    overflow: hidden;
    height: 56px !important;
    font-size: 1rem !important;
    font-weight: 600 !important;
    letter-spacing: 0.15em !important;
    transition: all 0.3s ease !important;
    background: ${COLORS.primary} !important;

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: ${COLORS.accent}30;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
    }

    &:hover::before {
      width: 300px;
      height: 300px;
    }

    &:hover {
      box-shadow: 0 8px 24px ${COLORS.primary}40 !important;
      transform: translateY(-2px);
    }

    &:disabled {
      background: ${COLORS.primary}80 !important;
    }
  `,
  helperText: css`
    text-align: center;
    margin-top: 24px;
    color: ${COLORS.subtitle};
    font-size: 0.85rem;
  `,
  starDot: css`
    position: absolute;
    width: 4px;
    height: 4px;
    background: ${COLORS.accent};
    border-radius: 50%;
    animation: ${pulse} 3s ease-in-out infinite;
  `
}

interface Star {
  x: number
  y: number
  vx: number
  vy: number
  connections: number[]
  size: number
  depth: number
  twinklePhase: number
  twinkleSpeed: number
  brightness: number
}

export function Landing() {
  const [seed, setSeed] = useState(DICE.id())
  const [loading, setLoading] = useState(false)
  const [fadingOut, setFadingOut] = useState(false)
  const [pendingSeed, setPendingSeed] = useState<string | null>(null)
  const { dispatch } = VIEW.context()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Constellation animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Create stars with depth and varying properties
    const starCount = 100
    const stars: Star[] = []
    const maxDistance = 240

    // Define exclusion zone in center for the text/card
    const centerExclusionZone = {
      x: canvas.width * 0.25,
      y: canvas.height * 0.25,
      width: canvas.width * 0.5,
      height: canvas.height * 0.5
    }

    const isInExclusionZone = (x: number, y: number) => {
      return (
        x > centerExclusionZone.x &&
        x < centerExclusionZone.x + centerExclusionZone.width &&
        y > centerExclusionZone.y &&
        y < centerExclusionZone.y + centerExclusionZone.height
      )
    }

    // Create stars with depth layers
    for (let i = 0; i < starCount; i++) {
      let x, y
      let attempts = 0
      do {
        x = Math.random() * canvas.width
        y = Math.random() * canvas.height
        attempts++
      } while (isInExclusionZone(x, y) && attempts < 100)

      const depth = 0.3 + Math.random() * 0.7 // 0.3 to 1.0
      const baseSpeed = 0.15 * depth

      stars.push({
        x,
        y,
        vx: (Math.random() - 0.5) * baseSpeed,
        vy: (Math.random() - 0.5) * baseSpeed,
        connections: [],
        size: 1.5 + Math.random() * 2 * depth,
        depth,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.5 + Math.random() * 1.5,
        brightness: 0.7 + Math.random() * 0.3
      })
    }

    let animationTime = 0
    const animate = () => {
      animationTime += 16 // Approximate 60fps

      // Fill with white background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update star positions
      stars.forEach(star => {
        star.x += star.vx
        star.y += star.vy

        // Update twinkle phase
        star.twinklePhase += star.twinkleSpeed * 0.02

        // Wrap around edges
        if (star.x < -50) star.x = canvas.width + 50
        if (star.x > canvas.width + 50) star.x = -50
        if (star.y < -50) star.y = canvas.height + 50
        if (star.y > canvas.height + 50) star.y = -50

        // If star drifts into exclusion zone, nudge it out
        if (isInExclusionZone(star.x, star.y)) {
          const centerX = centerExclusionZone.x + centerExclusionZone.width / 2
          const centerY = centerExclusionZone.y + centerExclusionZone.height / 2

          const dx = star.x - centerX
          const dy = star.y - centerY
          const angle = Math.atan2(dy, dx)

          star.x = centerX + Math.cos(angle) * (centerExclusionZone.width / 2 + 50)
          star.y = centerY + Math.sin(angle) * (centerExclusionZone.height / 2 + 50)
        }
      })

      // Draw connections with depth-based opacity
      for (let i = 0; i < stars.length; i++) {
        const star1 = stars[i]
        const x1 = star1.x
        const y1 = star1.y

        for (let j = i + 1; j < stars.length; j++) {
          const star2 = stars[j]
          const x2 = star2.x
          const y2 = star2.y

          const dx = x1 - x2
          const dy = y1 - y2
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < maxDistance * Math.min(star1.depth, star2.depth)) {
            const avgDepth = (star1.depth + star2.depth) / 2
            const opacity = (1 - distance / maxDistance) * avgDepth * 0.35

            ctx.strokeStyle = COLORS.accent
            ctx.lineWidth = 1 + avgDepth * 0.4
            ctx.globalAlpha = opacity
            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.stroke()
          }
        }
      }

      // Draw stars with twinkling effect
      stars.forEach(star => {
        const x = star.x
        const y = star.y

        // Twinkling brightness
        const twinkle = (Math.sin(star.twinklePhase) + 1) / 2 // 0 to 1
        const brightness = star.brightness * (0.6 + twinkle * 0.4)

        // Glow effect with radial gradient
        const glowSize = star.size * 3
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize)
        gradient.addColorStop(0, COLORS.accent + Math.floor(brightness * 255).toString(16).padStart(2, '0'))
        gradient.addColorStop(0.3, COLORS.accent + Math.floor(brightness * 100).toString(16).padStart(2, '0'))
        gradient.addColorStop(1, COLORS.accent + '00')

        ctx.globalAlpha = star.depth
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, glowSize, 0, Math.PI * 2)
        ctx.fill()

        // Core star
        ctx.globalAlpha = brightness * star.depth
        ctx.fillStyle = COLORS.accent
        ctx.beginPath()
        ctx.arc(x, y, star.size, 0, Math.PI * 2)
        ctx.fill()
      })

      ctx.globalAlpha = 1
      requestAnimationFrame(animate)
    }

    const animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

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
    setFadingOut(true)

    // Wait for fade-out animation to complete before transitioning
    setTimeout(() => {
      setPendingSeed(seed)
    }, 800) // Match the fade animation duration
  }

  return (
    <Box className={classes.container}>
      <Box className={classes.whiteLayer}>
        <canvas ref={canvasRef} className={classes.canvas} />

        {/* White overlay that fades in to cover everything */}
        <Box className={`${classes.whiteOverlay} ${fadingOut ? classes.whiteOverlayFadeIn : ''}`} />

        <Grid container justifyContent='center' sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
        <Grid item xs={11} sm={8} md={6} lg={5} xl={4}>
          <Box className={classes.hero}>
            <Typography className={classes.title}>GALAXY GENERATOR</Typography>
            <Typography className={classes.subtitle}>
              Procedural Galaxy Creation System
            </Typography>

            <Box className={classes.card}>
              <Box className={classes.inputWrapper}>
                <TextField
                  label='GALAXY SEED'
                  onChange={event => setSeed(event.currentTarget.value)}
                  value={seed}
                  fullWidth
                  disabled={loading}
                  variant='outlined'
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '1.1rem',
                      fontWeight: 500,
                      letterSpacing: '0.05em',
                      '& fieldset': {
                        borderWidth: 2,
                        borderColor: COLORS.primary
                      },
                      '&:hover fieldset': {
                        borderColor: COLORS.accent
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: COLORS.accent,
                        borderWidth: 2
                      }
                    },
                    '& .MuiInputLabel-root': {
                      letterSpacing: '0.1em',
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }
                  }}
                />
              </Box>

              <Button
                variant='contained'
                size='large'
                fullWidth
                className={classes.generateButton}
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? 'GENERATING GALAXY...' : 'BEGIN'}
                {loading && (
                  <CircularProgress
                    size={24}
                    sx={{
                      color: COLORS.accent,
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px'
                    }}
                  />
                )}
              </Button>

              <Typography className={classes.helperText}>
                Enter a custom seed or use the randomly generated one to create your galaxy
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
      </Box>
    </Box>
  )
}
