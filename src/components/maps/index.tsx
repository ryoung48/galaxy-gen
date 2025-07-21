import { RefObject, useEffect, useRef, useState, useCallback } from 'react'
import { CONSTANTS } from '../../model/constants'
import { SOLAR_SYSTEM } from '../../model/system'
import { CANVAS } from './canvas'
import { pointer, scaleLinear } from 'd3'
import { VIEW } from '../../context'
import { ViewState } from '../../context/types'
import { SolarSystem } from '../../model/system/types'
import { MATH } from '../../model/utilities/math'
import { Box, Grid, ToggleButton, ToggleButtonGroup, IconButton, Typography } from '@mui/material'
import { PlayArrow, Pause, Stop } from '@mui/icons-material'
import Codex from '../codex'
import { SYSTEM_MAP } from './canvas/system'
import { GALAXY_MAP } from './canvas/galaxy'
import { MapModes } from './types'
import { LEGEND } from './legend'
import { BACKGROUND } from './canvas/background'
import { HISTORY } from '../../model/history'

const paint = (
  canvasRef: RefObject<HTMLCanvasElement>,
  selected: ViewState['selected'],
  transform: { dx: number; dy: number; scale: number },
  mode: MapModes,
  solarSystem?: SolarSystem
) => {
  const local = transform.scale > 30
  const canvas = canvasRef.current!
  canvas.width = canvas.clientWidth
  canvas.height = canvas.clientHeight
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, CONSTANTS.W, CONSTANTS.H)
  ctx.save()
  const objects = (local && solarSystem ? SOLAR_SYSTEM.orbits(solarSystem) : []).filter(
    o => o.tag !== 'orbit' || (o.type !== 'asteroid belt' && o.type !== 'ice asteroid belt')
  )
  const mod = CONSTANTS.SOLAR_SYSTEM_MOD
  const objectPositions = objects.map(obj => {
    const worldPos = CANVAS.coordinates(obj)
    return {
      x: worldPos.x * transform.scale + transform.dx,
      y: worldPos.y * transform.scale + transform.dy,
      r: obj.r * mod * transform.scale
    }
  })

  let systemCenter: { x: number; y: number } | undefined
  let maxSystemRadius: number | undefined

  if (local && solarSystem) {
    const primaryStar = objects.find(o => o.tag === 'star' && o.idx === solarSystem.star.idx)

    if (primaryStar) {
      const primaryStarCoords = CANVAS.coordinates(primaryStar)
      systemCenter = {
        x: primaryStarCoords.x * transform.scale + transform.dx,
        y: primaryStarCoords.y * transform.scale + transform.dy
      }

      let maxWorldRadius = 0
      for (const object of objects) {
        const objectCoords = CANVAS.coordinates(object)
        const dist = MATH.distance(
          [primaryStarCoords.x, primaryStarCoords.y],
          [objectCoords.x, objectCoords.y]
        )
        const objectRadius = object.r * mod
        if (dist + objectRadius > maxWorldRadius) {
          maxWorldRadius = dist + objectRadius
        }
      }

      maxSystemRadius = maxWorldRadius * 1.5 * transform.scale // Add padding for the fade effect
    }
  } else {
    // Galaxy view - center at galaxy center
    systemCenter = {
      x: CONSTANTS.W * 0.5 * transform.scale + transform.dx,
      y: CONSTANTS.H * 0.5 * transform.scale + transform.dy
    }
    maxSystemRadius = 335 * transform.scale * 1.2 // Galaxy radius plus padding
  }

  BACKGROUND.paint({
    ctx,
    objects: objectPositions,
    systemCenter,
    maxSystemRadius
  })
  ctx.restore()
  ctx.translate(transform.dx, transform.dy)
  ctx.scale(transform.scale, transform.scale)
  if (local) SYSTEM_MAP.paint({ ctx, selected, solarSystem, mapMode: mode })
  else GALAXY_MAP.paint({ ctx, selected, solarSystem, mapMode: mode, clearCache: true })
  LEGEND.draw({ ctx, mode })
}

const GalaxyMap = () => {
  const { state, dispatch } = VIEW.context()
  const selected = state.selected
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [transform, setTransform] = useState({
    dx: 0,
    dy: 0,
    scale: 1
  })
  const [mode, setMode] = useState<MapModes>('nations')
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationSpeed, setAnimationSpeed] = useState(1)
  const [timeDisplay, setTimeDisplay] = useState(0)
  const [galaxyVersion, setGalaxyVersion] = useState(0)
  const system = VIEW.system(state)

  // Animation loop function
  const animate = useCallback(() => {
    if (!isAnimating || !window.galaxy) return

    // Run multiple ticks based on animation speed
    for (let i = 0; i < animationSpeed; i++) {
      HISTORY.tick()
    }

    // Update time display and galaxy version to trigger repaint
    setTimeDisplay(2200 + Math.floor(window.galaxy.time / 365))
    setGalaxyVersion(prev => prev + 1)

    // Continue animation loop
    animationRef.current = requestAnimationFrame(animate)
  }, [isAnimating, animationSpeed])

  // Start animation
  const startAnimation = useCallback(() => {
    if (!animationRef.current) {
      animationRef.current = requestAnimationFrame(animate)
    }
    setIsAnimating(true)
  }, [animate])

  // Pause animation
  const pauseAnimation = useCallback(() => {
    setIsAnimating(false)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }, [])

  // Stop animation and reset
  const stopAnimation = useCallback(() => {
    pauseAnimation()
  }, [pauseAnimation])

  // Handle animation speed change
  const handleSpeedChange = useCallback((newSpeed: number) => {
    setAnimationSpeed(newSpeed)
  }, [])

  // Start/stop animation when isAnimating changes
  useEffect(() => {
    if (isAnimating) {
      animationRef.current = requestAnimationFrame(animate)
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isAnimating, animate])

  useEffect(() => {
    const node = canvasRef.current
    if (!node) return
    // pan & zoom
    CANVAS.zoom({
      node,
      onZoom: event => {
        const { x, y, k } = event.transform
        setTransform({
          scale: k,
          dx: x,
          dy: y
        })
      }
    })
    CANVAS.init(node)
  }, [])
  useEffect(() => {
    paint(canvasRef, selected, transform, mode, system)
  }, [selected, transform, system, mode, timeDisplay, galaxyVersion])
  return (
    <Box>
      {/* Animation Controls */}
      <Grid
        container
        sx={{
          zIndex: 3,
          position: 'absolute',
          bottom: CONSTANTS.H * 0.03,
          left: CONSTANTS.W * 0.03,
          backgroundColor: 'white',
          color: 'black',
          borderRadius: 1,
          padding: 1,
          gap: 1,
          alignItems: 'center',
          width: 'auto'
        }}
      >
        <Grid item>
          <IconButton
            onClick={isAnimating ? pauseAnimation : startAnimation}
            sx={{ color: 'black' }}
            size='small'
          >
            {isAnimating ? <Pause /> : <PlayArrow />}
          </IconButton>
        </Grid>
        <Grid item>
          <IconButton onClick={stopAnimation} sx={{ color: 'black' }} size='small'>
            <Stop />
          </IconButton>
        </Grid>
        <Grid item>
          <Typography variant='body2' sx={{ color: 'black', minWidth: 80 }}>
            Time: {timeDisplay}
          </Typography>
        </Grid>
        <Grid item>
          <ToggleButtonGroup
            value={animationSpeed}
            exclusive
            onChange={(_, value) => value && handleSpeedChange(value)}
            size='small'
            sx={{ backgroundColor: 'transparent' }}
          >
            <ToggleButton value={1} sx={{ color: 'black', fontSize: '0.75rem' }}>
              1x
            </ToggleButton>
            <ToggleButton value={5} sx={{ color: 'black', fontSize: '0.75rem' }}>
              5x
            </ToggleButton>
            <ToggleButton value={10} sx={{ color: 'black', fontSize: '0.75rem' }}>
              10x
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>
      <div>
        <Grid
          container
          sx={{
            zIndex: 2,
            position: 'absolute',
            top: CONSTANTS.H * 0.05,
            left: CONSTANTS.W * 0.77,
            fontSize: 20,
            backgroundColor: `rgba(255, 255, 255, 0.85)`,
            width: 600,
            padding: 1,
            opacity: scaleLinear().domain([1.5, 5]).range([0, 1]).clamp(true)(transform.scale)
          }}
        >
          <Grid item xs={12}>
            <Codex></Codex>
          </Grid>
        </Grid>
      </div>
      <ToggleButtonGroup
        color='primary'
        exclusive
        value={mode}
        onChange={(_, value) => {
          if (value) setMode(value)
        }}
        size='small'
        style={{
          zIndex: 2,
          position: 'absolute',
          top: CONSTANTS.H * 0.54,
          left: CONSTANTS.W * 0.7,
          background: 'white',
          borderRadius: 0
        }}
      >
        {['nations', 'biosphere', 'orbits', 'habitability', 'population'].map(label => (
          <ToggleButton key={label} value={label}>
            {label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <canvas
        ref={canvasRef}
        style={{
          backgroundColor: 'black',
          border: 'double rgba(255, 255, 255, 0.4)',
          width: '100%',
          height: window.screen.height * 0.85
        }}
        onMouseMove={event => {
          const [clientX, clientY] = pointer(event)
          const nx = (clientX - transform.dx) / transform.scale
          const ny = (clientY - transform.dy) / transform.scale
          setCursor({ x: nx, y: ny })
        }}
        onClick={() => {
          const point = window.galaxy.diagram.delaunay.find(cursor.x, cursor.y)
          const solar = window.galaxy.systems[point]
          const local = transform.scale > 30
          if (local || !solar.edge) {
            const objects = SOLAR_SYSTEM.orbits(system ?? solar)
            const closest = MATH.findClosest(
              cursor,
              objects.map((obj, i) => ({ ...CANVAS.coordinates(obj), i }))
            )
            const chosen = local
              ? objects[closest.i]
              : selected?.tag === 'nation'
              ? window.galaxy.nations[solar.nation]
              : solar
            dispatch({ type: 'transition', payload: chosen })
          }
        }}
      ></canvas>
    </Box>
  )
}

export default GalaxyMap
