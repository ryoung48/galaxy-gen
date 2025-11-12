import { RefObject, useEffect, useRef, useState } from 'react'
import { CONSTANTS } from '../../model/constants'
import { SOLAR_SYSTEM } from '../../model/system'
import { CANVAS } from './canvas'
import { pointer, scaleLinear } from 'd3'
import { VIEW } from '../../context'
import { ViewState } from '../../context/types'
import { SolarSystem } from '../../model/system/types'
import { MATH } from '../../model/utilities/math'
import { Box, Grid, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { ContentCopy as ContentCopyIcon, BarChart as BarChartIcon, Check as CheckIcon } from '@mui/icons-material'
import Codex from '../codex'
import { SYSTEM_MAP } from './canvas/system'
import { GALAXY_MAP } from './canvas/galaxy'
import { MapModes } from './types'
import { LEGEND } from './legend'
import { BACKGROUND } from './canvas/background'
import { COLORS } from '../../theme/colors'
import { css, keyframes } from '@emotion/css'

const fadeWhiteToBlack = keyframes`
  0% { opacity: 1; }
  100% { opacity: 0; }
`

const whiteOverlay = css`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #ffffff;
  z-index: 9999;
  pointer-events: none;
  animation: ${fadeWhiteToBlack} 0.8s ease-out forwards;
`

const bottomControlsRow = css`
  position: absolute;
  bottom: 3vh;
  left: 2vw;
  right: 2vw;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`

const seedDisplay = css`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 6px 10px;
  box-shadow: 0 4px 20px rgba(7, 41, 61, 0.2);
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: 'Michroma', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  color: ${COLORS.primary};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: ${COLORS.primary};
    color: white;
    box-shadow: 0 6px 30px rgba(7, 41, 61, 0.3);
    transform: translateY(-2px);

    & svg {
      color: white;
    }
  }

  &:active {
    transform: translateY(-1px);
  }
`

const statsButton = css`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  box-shadow: 0 4px 20px rgba(7, 41, 61, 0.2);
  color: ${COLORS.primary};
  font-family: 'Michroma', sans-serif;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: ${COLORS.primary};
    color: white;
    box-shadow: 0 6px 30px rgba(7, 41, 61, 0.4);
    transform: translateY(-2px);
  }
`

const mapToggleGroup = css`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(7, 41, 61, 0.2);
  overflow: hidden;

  & .MuiToggleButton-root {
    color: ${COLORS.primary};
    border: none;
    padding: 10px 14px;
    font-family: 'Michroma', sans-serif;
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    font-weight: 600;
    text-transform: uppercase;
    transition: all 0.3s ease;

    &:hover {
      background: ${COLORS.accent}20;
    }

    &.Mui-selected {
      background: ${COLORS.primary};
      color: white;

      &:hover {
        background: ${COLORS.primary};
      }
    }
  }
`

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
  const objects = local && solarSystem ? SOLAR_SYSTEM.orbits(solarSystem) : []
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
  else GALAXY_MAP.paint({ ctx, selected, solarSystem, mapMode: mode })
  LEGEND.draw({ ctx, mode })
}

const GalaxyMap = ({ toggleStats }: { toggleStats: (value: boolean) => void }) => {
  const { state, dispatch } = VIEW.context()
  const selected = state.selected
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [initialized, setInitialized] = useState(false)
  const [seedCopied, setSeedCopied] = useState(false)
  const [transform, setTransform] = useState({
    dx: 0,
    dy: 0,
    scale: 1
  })
  const [mode, setMode] = useState<MapModes>('nations')
  const system = VIEW.system(state)

  const handleCopySeed = () => {
    navigator.clipboard.writeText(state.id)
    setSeedCopied(true)
    setTimeout(() => setSeedCopied(false), 2000)
  }
  useEffect(() => {
    const node = canvasRef.current
    if (!node) return

    // Calculate initial centered and zoomed out transform
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const galaxyCenterX = CONSTANTS.W / 2
    const galaxyCenterY = CONSTANTS.H / 2
    const initialScale = 0.7 // Zoom out to show the whole galaxy

    const initialDx = viewportWidth / 2 - galaxyCenterX * initialScale
    const initialDy = viewportHeight / 2 - galaxyCenterY * initialScale

    setTransform({
      scale: initialScale,
      dx: initialDx,
      dy: initialDy
    })

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
    setInitialized(true)
  }, [])
  useEffect(() => {
    if (!initialized) return
    paint(canvasRef, selected, transform, mode, system)
  }, [initialized, selected, transform, system, mode])
  return (
    <Box sx={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* White overlay that fades to reveal the map */}
      <Box className={whiteOverlay} />

      {/* Bottom Controls Row */}
      <Box className={bottomControlsRow}>
        {/* Seed Display */}
        <Box className={seedDisplay} onClick={handleCopySeed}>
          <span>{state.id.toUpperCase()}</span>
          {seedCopied ? (
            <CheckIcon sx={{ fontSize: '0.75rem' }} />
          ) : (
            <ContentCopyIcon sx={{ fontSize: '0.75rem' }} />
          )}
        </Box>

        {/* Map Mode Toggles */}
        <ToggleButtonGroup
          color='primary'
          exclusive
          value={mode}
          onChange={(_, value) => {
            if (value) setMode(value)
          }}
          size='small'
          className={mapToggleGroup}
        >
          {['nations', 'biosphere', 'orbits', 'habitability', 'resources', 'population', 'government', 'wtn'].map(
            label => (
              <ToggleButton key={label} value={label}>
                {label}
              </ToggleButton>
            )
          )}
        </ToggleButtonGroup>

        {/* Stats Button */}
        <Box className={statsButton} onClick={() => toggleStats(true)}>
          <BarChartIcon sx={{ fontSize: '0.85rem' }} />
          Statistics
        </Box>
      </Box>

      {/* Codex Panel */}
      <Grid
        container
        sx={{
          zIndex: 2,
          position: 'absolute',
          top: '5vh',
          right: '2vw',
          fontSize: 20,
          backgroundColor: `rgba(255, 255, 255, 0.95)`,
          width: 600,
          maxWidth: '40vw',
          padding: 2,
          backdropFilter: 'blur(10px)',
          opacity: scaleLinear().domain([1.5, 5]).range([0, 1]).clamp(true)(transform.scale)
        }}
      >
        <Grid item xs={12}>
          <Codex></Codex>
        </Grid>
      </Grid>

      <canvas
        ref={canvasRef}
        style={{
          backgroundColor: 'black',
          width: '100vw',
          height: '100vh',
          display: 'block'
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
            const objects = SOLAR_SYSTEM.orbits(system ?? solar).filter(
              orbit => orbit.tag !== 'orbit' || orbit.type !== 'asteroid belt'
            )
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
