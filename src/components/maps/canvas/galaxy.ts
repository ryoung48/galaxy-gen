import jdenticon from 'jdenticon/standalone'
import { CONSTANTS } from '../../../model/constants'
import { GALAXY } from '../../../model/galaxy'
import { SOLAR_SYSTEM } from '../../../model/system'
import { STAR } from '../../../model/system/stars'
import { HERALDRY } from '../../heraldry/common'
import { CANVAS } from '.'
import { PaintGalaxyParams } from './types'
import { METRICS } from '../legend/metrics'

export const GALAXY_MAP = {
  paint: ({ ctx, selected, solarSystem, mapMode }: PaintGalaxyParams) => {
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
    const systems = GALAXY.worlds()
    systems.forEach(system => {
      const nation = SOLAR_SYSTEM.nation(system)
      const focused =
        system.idx === solarSystem?.idx ||
        (selected?.tag === 'nation' && selected.idx === nation.idx)
      const opacity = focused ? 0.6 : 0.3
      ctx.strokeStyle = `rgba(0, 0, 0, 0.3)`
      ctx.lineWidth = 0.5
      const orbits = SOLAR_SYSTEM.orbits(system)
      const biosphere = Math.max(...orbits.map(o => (o.tag === 'star' ? 0 : o.biosphere)))
      const population = Math.max(
        ...orbits.map(o => (o.tag === 'star' ? 0 : o.population?.code ?? 0))
      )
      const habitability = Math.max(...orbits.map(o => (o.tag === 'star' ? -4 : o.habitability)))
      ctx.fillStyle =
        mapMode === 'habitability'
          ? METRICS.habitability.color(habitability)
          : mapMode === 'biosphere'
          ? METRICS.biosphere.color(biosphere)
          : mapMode === 'orbits'
          ? METRICS.orbits.color(orbits.length - 1)
          : mapMode === 'population'
          ? METRICS.population.color(population)
          : nation.flag.color.replace('%)', `%, ${opacity})`)
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
      const star = STAR.color(system.star)
      const isSelected = system.idx === solarSystem?.idx
      CANVAS.circle({
        ctx,
        x: system.x,
        y: system.y,
        radius: 1,
        fill: star,
        border: { color: star, width: 0.002 }
      })
      CANVAS.text({
        ctx,
        x: system.x,
        y: system.y - (isSelected ? 2.2 : 2),
        text: system.name,
        size: 1
      })
    })
    // nation names
    window.galaxy.nations.forEach(nation => {
      const origin = window.galaxy.systems[nation.capital]
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
}
