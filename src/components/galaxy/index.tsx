import { RefObject, useEffect, useRef, useState } from 'react'
import { CONSTANTS } from '../../model/constants'
import { STAR } from '../../model/system/stars'
import { STYLES } from '../styles'
import { SOLAR_SYSTEM } from '../../model/system'
import { GALAXY } from '../../model/galaxy'
import { CANVAS } from './canvas'
import { pointer } from 'd3'
import jdenticon from 'jdenticon/standalone'
import { HERALDRY } from '../heraldry/common'
import { VIEW } from '../../context'
import { ViewState } from '../../context/types'
import { SATELLITE } from '../../model/system/satellites'
import { SolarSystem } from '../../model/system/types'
import { MATH } from '../../model/utilities/math'
import { DICE } from '../../model/utilities/dice'
import { ORBITAL_DEPOSITS } from '../../model/system/resources'

const paint = (
  canvasRef: RefObject<HTMLCanvasElement>,
  selected: ViewState['selected'],
  transform: { dx: number; dy: number; scale: number },
  solarSystem?: SolarSystem
) => {
  const systems = GALAXY.worlds()
  const local = transform.scale > 15
  const canvas = canvasRef.current!
  canvas.width = CONSTANTS.W
  canvas.height = CONSTANTS.H
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, CONSTANTS.W, CONSTANTS.H)
  ctx.translate(transform.dx, transform.dy)
  ctx.scale(transform.scale, transform.scale)
  console.log(transform)
  // galactic core and outer rim
  const radii = [75, 335]
  radii.forEach(radius => {
    CANVAS.circle({
      ctx,
      x: CONSTANTS.W * 0.5,
      y: CONSTANTS.H * 0.5,
      radius,
      fill: 'transparent',
      border: { color: 'rgba(255, 255, 255, 0.4)', width: 1 }
    })
  })
  // solar system cells
  systems.forEach(system => {
    const nation = SOLAR_SYSTEM.nation(system)
    const focused =
      system.idx === solarSystem?.idx || (selected.type === 'nation' && selected.id === nation.idx)
    const opacity = focused ? 0.6 : 0.3
    ctx.strokeStyle = `rgba(0, 0, 0, 0.3)`
    ctx.lineWidth = 0.5
    ctx.fillStyle = nation.flag.color.replace('%)', `%, ${opacity})`)
    const path = new Path2D(window.galaxy.diagram.renderCell(system.idx))
    ctx.fill(path)
    ctx.stroke(path)
  })
  // hyper-lanes
  window.galaxy?.mst.forEach(([p1, p2]) => {
    CANVAS.line({
      ctx,
      x1: p1.x,
      y1: p1.y,
      x2: p2.x,
      y2: p2.y,
      width: 0.5,
      color: 'rgba(255, 255, 255, 0.5)'
    })
  })
  // stars & system names
  systems.forEach(system => {
    const star = STAR.templates[SOLAR_SYSTEM.stars(system)[0]?.type ?? 'O'].color
    const isSelected = system.idx === solarSystem?.idx
    CANVAS.circle({
      ctx,
      x: system.x,
      y: system.y,
      radius: isSelected ? 1.8 : 1,
      fill: isSelected ? '#69707F' : star,
      border: { color: star, width: local ? 0.05 : 0.2 }
    })
    CANVAS.text({
      ctx,
      x: system.x,
      y: system.y - (isSelected ? 2.2 : 2),
      text: system.name,
      size: 1
    })
  })
  const mod = CONSTANTS.SOLAR_SYSTEM_MOD
  if (solarSystem) {
    const objects = SOLAR_SYSTEM.objects(solarSystem)
    objects.forEach(object => {
      if (object.tag === 'star') {
        const star = object
        CANVAS.circle({
          ctx,
          x: star.x,
          y: star.y,
          radius: star.size * mod,
          fill: STAR.templates[star.type].color,
          border: { color: 'black', width: mod }
        })
      } else {
        const satellite = object
        const parent = SATELLITE.parent(satellite)
        const radius = satellite.orbit.distance
        CANVAS.circle({
          ctx,
          x: parent?.x ?? solarSystem.x,
          y: parent?.y ?? solarSystem.y,
          radius: radius * mod,
          fill: 'transparent',
          border: { color: 'lightgray', width: mod }
        })
        SATELLITE.moons(satellite).forEach(moon => {
          // Draw moon orbit
          CANVAS.circle({
            ctx,
            x: satellite.x,
            y: satellite.y,
            radius: moon.orbit.distance * mod,
            fill: 'transparent',
            border: { color: 'lightgray', width: mod * 0.5 }
          })
        })
      }
    })
    solarSystem.asteroidBelts?.forEach(belt => {
      DICE.swap(solarSystem.seed, () => {
        const asteroidBeltRadius = belt.distance
        const numAsteroids = (150 * belt.distance) / 120
        for (let i = 0; i < numAsteroids; i++) {
          const angle = window.dice.random * 360
          const radiusOffset = window.dice.random * 10 - 5 // random offset to asteroid belt radius
          const x = solarSystem.x + (asteroidBeltRadius + radiusOffset) * Math.cos(angle) * mod
          const y = solarSystem.y + (asteroidBeltRadius + radiusOffset) * Math.sin(angle) * mod
          CANVAS.circle({
            ctx,
            x,
            y,
            radius: (1 + window.dice.random) * mod,
            fill: 'gray'
          })
        }
      })
    })
    objects.forEach(object => {
      if (object.tag === 'star') {
        const star = object
        CANVAS.text({
          ctx,
          x: star.x,
          y: star.y + (star.size + 5) * mod,
          text: STAR.name(star),
          size: 0.01
        })
        CANVAS.text({
          ctx,
          x: star.x,
          y: star.y + (star.size + 8) * mod,
          text: `${star.orbit.distance.toString()} ${
            star.resources.length > 0
              ? `:: ${star.resources
                  .map(resource => {
                    const details = ORBITAL_DEPOSITS.deposits[resource.type]
                    return `${details.tag}-${resource.amount}`
                  })
                  .join(', ')}`
              : ''
          }`,
          size: 0.01
        })
      } else {
        const satellite = object
        CANVAS.circle({
          ctx,
          x: satellite.x,
          y: satellite.y,
          radius: satellite.size * mod,
          fill: SATELLITE.templates[satellite.type].color,
          border: { color: 'black', width: mod }
        })
        CANVAS.text({
          ctx,
          x: satellite.x,
          y: satellite.y + (satellite.size + 5) * mod,
          text: SATELLITE.name(satellite),
          size: 0.01
        })
        CANVAS.text({
          ctx,
          x: satellite.x,
          y: satellite.y + (satellite.size + 8) * mod,
          text: `${satellite.orbit.distance.toString()} ${
            satellite.resources.length > 0
              ? `:: ${satellite.resources
                  .map(resource => {
                    const details = ORBITAL_DEPOSITS.deposits[resource.type]
                    return `${details.tag}-${resource.amount}`
                  })
                  .join(', ')}`
              : ''
          }`,
          size: 0.01
        })
        SATELLITE.moons(satellite).forEach(moon => {
          // Draw moon
          CANVAS.circle({
            ctx,
            x: moon.x,
            y: moon.y,
            radius: moon.size * mod,
            fill: SATELLITE.templates[moon.type].color,
            border: { color: 'black', width: mod * 0.5 }
          })
          CANVAS.text({
            ctx,
            x: moon.x,
            y: moon.y + (moon.size + 4) * mod,
            text: SATELLITE.name(moon),
            size: 0.01
          })
          CANVAS.text({
            ctx,
            x: moon.x,
            y: moon.y + (moon.size + 8) * mod,
            text: `${moon.orbit.distance.toString()} ${
              moon.resources.length > 0
                ? `:: ${moon.resources
                    .map(resource => {
                      const details = ORBITAL_DEPOSITS.deposits[resource.type]
                      return `${details.tag}-${resource.amount}`
                    })
                    .join(', ')}`
                : ''
            }`,
            size: 0.01
          })
        })
      }
    })
  }
  if (selected.type === 'star' || selected.type === 'satellite') {
    const celestial =
      selected.type === 'star'
        ? window.galaxy.stars[selected.id]
        : window.galaxy.satellites[selected.id]
    CANVAS.circle({
      ctx,
      x: celestial.x,
      y: celestial.y,
      radius: (celestial.size + 2) * mod,
      fill: 'transparent',
      border: { color: STYLES.accent, width: mod * 0.5 }
    })
  }
  if (local) return
  // nation names
  window.galaxy.nations.forEach(nation => {
    const origin = window.galaxy.systems[nation.origin]
    CANVAS.text({
      ctx,
      x: origin.x,
      y: origin.y + 6,
      text: nation.name,
      size: 5
    })
    const tempCanvas = document.createElement('canvas')
    const initialSize = 100
    tempCanvas.width = initialSize
    tempCanvas.height = initialSize
    const tempCtx = tempCanvas.getContext('2d')!
    const config = HERALDRY.config(nation)
    jdenticon.drawIcon(tempCtx, nation.name, initialSize, config)
    const backColor = config?.backColor ?? '#ffffff'
    const iconSize = 8
    HERALDRY.draw({
      ctx,
      x: origin.x - 0.41 * iconSize,
      y: origin.y + 1.16 * iconSize,
      h: iconSize * (1 + 0.66),
      w: iconSize * (1 + 0.16),
      borderWidth: 0.2,
      backColor
    })
    // Copy the identicon from the temporary canvas to the main canvas at the new size
    ctx.drawImage(
      tempCanvas,
      origin.x - 0.33 * iconSize,
      origin.y + 1.33 * iconSize,
      iconSize,
      iconSize
    )
  })
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
  }, [])
  useEffect(() => {
    paint(canvasRef, selected, transform, system)
  }, [selected, transform, system])
  return (
    <canvas
      ref={canvasRef}
      style={{
        backgroundColor: STYLES.map,
        border: 'double rgba(255, 255, 255, 0.4)',
        width: CONSTANTS.W,
        height: CONSTANTS.H
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
          const planetScale = transform.scale > 150
          const objects = SOLAR_SYSTEM.objects(solar)
            .map(obj => [obj, ...(obj.tag === 'satellite' ? SATELLITE.moons(obj) : [])])
            .flat()
          const closest = MATH.findClosest(cursor, objects)
          const { type, id } =
            selected.type === 'nation'
              ? { type: 'nation' as const, id: solar.nation }
              : solar.idx !== system?.idx || !planetScale
              ? { type: 'system' as const, id: point }
              : { type: closest.tag, id: closest.idx }
          dispatch({ type: 'transition', payload: { type, id } })
        }
      }}
    ></canvas>
  )
}

export default GalaxyMap
