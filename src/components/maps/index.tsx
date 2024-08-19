import { RefObject, useEffect, useRef, useState } from 'react'
import { CONSTANTS } from '../../model/constants'
import { COLORS } from '../../theme/colors'
import { SOLAR_SYSTEM } from '../../model/system'
import { CANVAS } from './canvas'
import { pointer, scaleLinear } from 'd3'
import { VIEW } from '../../context'
import { ViewState } from '../../context/types'
import { SolarSystem } from '../../model/system/types'
import { MATH } from '../../model/utilities/math'
import { Box, Grid, ToggleButton, ToggleButtonGroup } from '@mui/material'
import Codex from '../codex'
import { SYSTEM_MAP } from './canvas/system'
import { GALAXY_MAP } from './canvas/galaxy'
import { MapModes } from './types'
import { LEGEND } from './legend'

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
  ctx.translate(transform.dx, transform.dy)
  ctx.scale(transform.scale, transform.scale)
  if (local) SYSTEM_MAP.paint({ ctx, selected, solarSystem, mapMode: mode })
  else GALAXY_MAP.paint({ ctx, selected, solarSystem, mapMode: mode })
  LEGEND.draw({ ctx, mode })
}

const GalaxyMap = () => {
  const { state, dispatch } = VIEW.context()
  const selected = state.selected
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [transform, setTransform] = useState({
    dx: 0,
    dy: 0,
    scale: 1
  })
  const [mode, setMode] = useState<MapModes>('nations')
  const system = VIEW.system(state)
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
  }, [selected, transform, system, mode])
  return (
    <Box>
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
          left: CONSTANTS.W * 0.8,
          background: 'white',
          borderRadius: 0
        }}
      >
        {['nations', 'biosphere', 'orbits', 'desirability', 'population'].map(label => (
          <ToggleButton key={label} value={label}>
            {label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <canvas
        ref={canvasRef}
        style={{
          backgroundColor: COLORS.map,
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
          if (!solar.edge) {
            const objects = SOLAR_SYSTEM.orbits(system ?? solar).filter(
              obj => obj.tag !== 'orbit' || obj.type !== 'asteroid belt'
            )
            const closest = MATH.findClosest(
              cursor,
              objects.map((obj, i) => ({ ...CANVAS.coordinates(obj), i }))
            )
            const chosen =
              transform.scale > 30
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
