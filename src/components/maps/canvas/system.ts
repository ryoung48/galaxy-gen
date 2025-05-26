import { CONSTANTS } from '../../../model/constants'
import { SOLAR_SYSTEM } from '../../../model/system'
import { STAR } from '../../../model/system/stars'
import { DICE } from '../../../model/utilities/dice'
import { COLORS } from '../../../theme/colors'
import { CANVAS } from '.'
import { PaintGalaxyParams } from './types'
import { ORBIT } from '../../../model/system/orbits'
import { METRICS } from '../legend/metrics'

export const SYSTEM_MAP = {
  paint: ({ ctx, selected, solarSystem, mapMode }: PaintGalaxyParams) => {
    if (!solarSystem) return
    const mod = CONSTANTS.SOLAR_SYSTEM_MOD
    const objects = SOLAR_SYSTEM.orbits(solarSystem)
    objects.forEach(object => {
      const radius = object.distance
      const parent = object.tag === 'star' ? STAR.parent(object) : ORBIT.parent(object)
      const center = CANVAS.coordinates(parent ?? object)
      const zone = object.zone
      CANVAS.circle({
        ctx,
        ...center,
        radius: radius * mod,
        fill: 'transparent',
        border: {
          color:
            zone === 'outer'
              ? 'lightblue'
              : zone === 'inner'
              ? 'yellow'
              : zone === 'epistellar'
              ? 'orange'
              : 'lightgray',
          width: mod * 0.25
        }
      })
    })
    objects.forEach(object => {
      const center = CANVAS.coordinates(object)
      if (object.tag === 'star') {
        const star = object
        CANVAS.circle({
          ctx,
          ...center,
          radius: star.r * mod,
          fill:
            mapMode === 'habitability'
              ? METRICS.habitability.color(-10)
              : mapMode === 'biosphere'
              ? METRICS.biosphere.color(0)
              : mapMode === 'population'
              ? METRICS.population.color(0)
              : STAR.color(star),
          border: { color: 'black', width: mod }
        })
        CANVAS.text({
          ctx,
          x: center.x,
          y: center.y + (star.r + 5) * mod,
          text: STAR.name(star),
          size: 0.05
        })
      } else {
        if (object.type === 'asteroid belt') {
          const parent = ORBIT.parent(object)
          const center = CANVAS.coordinates(parent ?? object)
          DICE.swap(solarSystem.seed, () => {
            const asteroidBeltRadius = object.distance
            const numAsteroids = (150 * object.distance) / 120
            for (let i = 0; i < numAsteroids; i++) {
              const angle = window.dice.random * 360
              const radiusOffset = window.dice.random * 10 - 5 // random offset to asteroid belt radius
              const x = center.x + (asteroidBeltRadius + radiusOffset) * Math.cos(angle) * mod
              const y = center.y + (asteroidBeltRadius + radiusOffset) * Math.sin(angle) * mod
              CANVAS.circle({
                ctx,
                x,
                y,
                radius: (1 + window.dice.random) * mod,
                fill: 'gray'
              })
            }
          })
        } else {
          const orbit = object
          CANVAS.circle({
            ctx,
            x: center.x,
            y: center.y,
            radius: orbit.r * mod,
            fill:
              mapMode === 'habitability'
                ? METRICS.habitability.color(orbit.habitability)
                : mapMode === 'biosphere'
                ? METRICS.biosphere.color(orbit.biosphere)
                : mapMode === 'population'
                ? METRICS.population.color(orbit.population.code)
                : ORBIT.colors.get()[orbit.type],
            border: { color: 'black', width: mod * 0.5 }
          })
          CANVAS.text({
            ctx,
            x: center.x,
            y: center.y + (orbit.r + 2.5) * mod,
            text: ORBIT.code(orbit),
            size: 0.025
          })
        }
      }
    })
    if (selected?.tag === 'star' || selected?.tag === 'orbit') {
      const center = CANVAS.coordinates(selected)
      CANVAS.circle({
        ctx,
        x: center.x,
        y: center.y,
        radius: (selected.r + 1) * mod,
        fill: 'transparent',
        border: { color: COLORS.accent, width: mod * 0.25 }
      })
    }
  }
}
