import { NATION } from '../nations'
import { SOLAR_SYSTEM } from '../system'
import { DICE } from '../utilities/dice'
import { MATH } from '../utilities/math'
import { MINIMUM_SPANNING_TREE } from '../utilities/mst'
import { VORONOI } from '../utilities/voronoi'
import { Galaxy, GalaxySpawnParams } from './types'

export const GALAXY = {
  spawn: ({ radius, dimensions, size }: GalaxySpawnParams): Galaxy => {
    const seed = DICE.id(1)
    DICE.spawn(seed)
    const { height, width } = dimensions
    // Generate stars surrounding the empty galactic core
    const points: [number, number][] = Array.from({ length: size }, () => {
      const r = Math.sqrt(
        window.dice.random * (radius.max ** 2 - radius.min ** 2) + radius.min ** 2
      )
      const angle = window.dice.random * 2 * Math.PI
      const x = width / 2 + r * Math.cos(angle)
      const y = height / 2 + r * Math.sin(angle)
      return [x, y]
    })
    const { diagram, relaxedSites } = VORONOI.relaxed({
      points,
      w: width,
      h: height,
      relaxation: 3
    })
    const finalPoints = relaxedSites.map((site, i) => {
      const dist = MATH.distance(site, [height / 2, width / 2])
      return {
        x: site[0],
        y: site[1],
        idx: i,
        edge: dist > radius.max || dist < radius.min,
        n: Array.from(diagram.neighbors(i))
      }
    })
    finalPoints.forEach(point => {
      point.n = point.n.filter(n => !finalPoints[n].edge)
    })

    const systems = finalPoints.map(SOLAR_SYSTEM.spawn)
    const mst = MINIMUM_SPANNING_TREE.build(
      finalPoints.filter(p => !p.edge).reduce((acc, p) => ({ ...acc, [p.idx]: p }), {})
    )
    mst.forEach(([x, y]) => {
      systems[x.idx].lanes.push(y.idx)
      systems[y.idx].lanes.push(x.idx)
    })
    window.galaxy = {
      seed,
      systems,
      mst,
      diagram,
      radius,
      uniqueNames: {},
      nations: [],
      stars: [],
      satellites: []
    }
    NATION.spawn()
    return window.galaxy
  },
  worlds: () => window.galaxy.systems.filter(p => !p.edge)
}
