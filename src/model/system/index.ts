import { range } from 'd3'
import { WeightedDistribution } from '../utilities/dice/types'
import { STAR } from './stars'
import { SolarSystem, SolarSystemSpawnParams, SolarSystemTemplate } from './types'
import { SATELLITE } from './satellites'
import { Satellite } from './satellites/types'

const base = {
  orbit: { distance: 20, angle: { min: 90, max: 270 } },
  moon: { min: 0, max: 1, orbit: { distance: 5, angle: { min: 90, max: 270 }, offset: 10 } },
  star: {
    type: 'star' as const,
    count: { min: 1, max: 1 },
    orbit: { distance: 0, angle: { min: 1, max: 1 } }
  }
}

// solar system templates
const standard: WeightedDistribution<SolarSystemTemplate> = [
  {
    w: 20,
    v: {
      type: 'unary',
      objects: [
        base.star,
        {
          count: { min: 2, max: 10 },
          orbit: { ...base.orbit, offset: 45 },
          moons: base.moon
        }
      ]
    }
  },
  {
    w: 20,
    v: {
      type: 'unary',
      asteroidBelts: [{ distance: 95 }],
      objects: [
        base.star,
        {
          count: { min: 2, max: 2 },
          orbit: { ...base.orbit, offset: 30 }
        },
        {
          type: 'asteroid',
          count: { min: 1, max: 4 },
          orbit: { ...base.orbit, distance: 0, offset: 25 }
        },
        {
          count: { min: 2, max: 5 },
          orbit: { ...base.orbit, distance: 25 },
          moons: base.moon
        }
      ]
    }
  },
  {
    w: 10,
    v: {
      type: 'unary',
      objects: [
        base.star,
        {
          count: { min: 0, max: 1 },
          orbit: { ...base.orbit, distance: 10, offset: 45 }
        },
        {
          type: 'gas giant',
          count: { min: 1, max: 2 },
          orbit: { ...base.orbit, distance: 60 },
          moons: { min: 1, max: 4, orbit: { ...base.moon.orbit, distance: 6 } }
        },
        {
          count: { min: 0, max: 2 },
          orbit: { ...base.orbit, offset: 20 }
        }
      ]
    }
  },
  {
    w: 10,
    v: {
      type: 'unary',
      asteroidBelts: [{ distance: 120 }],
      objects: [
        base.star,
        {
          type: 'asteroid',
          count: { min: 3, max: 6 },
          orbit: { ...base.orbit, distance: 0, offset: 120 }
        },
        {
          count: { min: 0, max: 2 },
          orbit: { ...base.orbit, offset: -80 }
        },
        {
          count: { min: 0, max: 2 },
          orbit: { ...base.orbit, distance: 40, offset: 80 }
        }
      ]
    }
  },
  {
    w: 10,
    v: {
      type: 'unary',
      asteroidBelts: [{ distance: 130 }, { distance: 240 }],
      objects: [
        base.star,
        {
          type: 'asteroid',
          count: { min: 3, max: 6 },
          orbit: { angle: { min: 70, max: 120 }, distance: 0, offset: 130 }
        },
        {
          type: 'asteroid',
          count: { min: 3, max: 6 },
          orbit: { angle: { min: 70, max: 120 }, distance: 0, offset: 110 }
        },
        {
          count: { min: 2, max: 2 },
          orbit: { ...base.orbit, distance: 30, offset: -210 },
          moons: base.moon
        },
        {
          count: { min: 2, max: 2 },
          orbit: { ...base.orbit, distance: 40, offset: 35 },
          moons: base.moon
        },
        {
          count: { min: 2, max: 2 },
          orbit: { ...base.orbit, distance: 40, offset: 35 },
          moons: base.moon
        }
      ]
    }
  },
  {
    w: 2,
    v: {
      type: 'unary',
      asteroidBelts: [{ distance: 60 }, { distance: 120 }, { distance: 180 }, { distance: 240 }],
      objects: [
        base.star,
        {
          type: 'asteroid',
          count: { min: 1, max: 2 },
          orbit: { ...base.orbit, distance: 0, offset: 60 }
        },
        {
          type: 'asteroid',
          count: { min: 2, max: 3 },
          orbit: { ...base.orbit, distance: 0, offset: 60 }
        },
        {
          type: 'asteroid',
          count: { min: 3, max: 4 },
          orbit: { ...base.orbit, distance: 0, offset: 60 }
        },
        {
          type: 'asteroid',
          count: { min: 4, max: 5 },
          orbit: { ...base.orbit, distance: 0, offset: 60 }
        }
      ]
    }
  },
  {
    w: 6,
    v: {
      type: 'binary',
      objects: [
        {
          type: 'star',
          count: { min: 1, max: 1 },
          orbit: { ...base.orbit, distance: 20 }
        },
        {
          type: 'star',
          count: { min: 1, max: 1 },
          orbit: { distance: 30, angle: { min: 180, max: 180 } }
        },
        {
          count: { min: 2, max: 10 },
          orbit: { ...base.orbit, offset: 45 },
          moons: base.moon
        }
      ]
    }
  },
  {
    w: 4,
    v: {
      type: 'binary',
      objects: [
        {
          type: 'star',
          count: { min: 1, max: 1 },
          orbit: { distance: 0, angle: { min: 0, max: 0 } }
        },
        {
          type: 'star',
          count: { min: 1, max: 1 },
          orbit: { distance: 240, angle: { min: 0, max: 360 } },
          objects: [
            {
              uninhabitable: true,
              count: { min: 2, max: 3 },
              orbit: { ...base.orbit, distance: 25, offset: 25 },
              moons: { min: 0, max: 1, orbit: { ...base.moon.orbit, distance: 3 } }
            }
          ]
        },
        {
          count: { min: 3, max: 5 },
          orbit: { ...base.orbit, offset: -210 },
          moons: { min: 0, max: 1, orbit: { ...base.moon.orbit, distance: 3 } }
        }
      ]
    }
  },
  {
    w: 3,
    v: {
      type: 'trinary',
      objects: [
        {
          type: 'star',
          count: { min: 1, max: 1 },
          orbit: { distance: 25, angle: { min: 0, max: 0 } }
        },
        {
          type: 'star',
          count: { min: 1, max: 1 },
          orbit: { distance: 10, angle: { min: 120, max: 120 } }
        },
        {
          type: 'star',
          count: { min: 1, max: 1 },
          orbit: { distance: 10, angle: { min: 120, max: 120 } }
        },
        {
          count: { min: 2, max: 10 },
          orbit: { ...base.orbit, offset: 45 },
          moons: { min: 0, max: 1, orbit: { ...base.moon.orbit, distance: 5 } }
        }
      ]
    }
  },
  {
    w: 3,
    v: {
      type: 'trinary',
      objects: [
        base.star,
        {
          type: 'star',
          count: { min: 1, max: 1 },
          orbit: { ...base.orbit, distance: 220 },
          objects: [
            {
              count: { min: 2, max: 4 },
              orbit: { ...base.orbit, distance: 25, offset: 30 },
              moons: { min: 0, max: 1, orbit: { ...base.moon.orbit, distance: 3 } }
            }
          ]
        },
        {
          type: 'star',
          count: { min: 1, max: 1 },
          orbit: { ...base.orbit, distance: 0 },
          objects: [
            {
              count: { min: 1, max: 4 },
              orbit: { ...base.orbit, distance: 25, offset: 25 },
              moons: { min: 0, max: 1, orbit: { ...base.moon.orbit, distance: 3 } }
            }
          ]
        },
        {
          count: { min: 3, max: 4 },
          orbit: { ...base.orbit, distance: 15, offset: -200 },
          moons: { min: 0, max: 1, orbit: { ...base.moon.orbit, distance: 3 } }
        }
      ]
    }
  }
]

const homeworld: WeightedDistribution<SolarSystemTemplate> = [
  {
    w: 20,
    v: {
      type: 'unary',
      asteroidBelts: [{ distance: 50 }],
      objects: [
        base.star,
        {
          type: 'asteroid',
          count: { min: 1, max: 3 },
          orbit: { distance: 0, angle: { min: 40, max: 100 }, offset: 50 }
        },
        {
          uninhabitable: true,
          count: { min: 0, max: 2 },
          orbit: { ...base.orbit, offset: 0 },
          moons: { ...base.moon, uninhabitable: true }
        },
        {
          type: 'habitable',
          count: { min: 1, max: 1 },
          orbit: { ...base.orbit, offset: 0 },
          moons: { ...base.moon, uninhabitable: true }
        },
        {
          uninhabitable: true,
          count: { min: 2, max: 4 },
          orbit: { ...base.orbit, offset: 0 },
          moons: { ...base.moon, uninhabitable: true }
        },
        {
          type: 'gas giant',
          count: { min: 1, max: 2 },
          orbit: { ...base.orbit, offset: 0 },
          moons: { ...base.moon, uninhabitable: true, min: 0, max: 3 }
        }
      ]
    }
  },
  {
    w: 20,
    v: {
      type: 'unary',
      asteroidBelts: [{ distance: 115 }],
      objects: [
        base.star,
        {
          type: 'habitable',
          count: { min: 1, max: 1 },
          orbit: { ...base.orbit, offset: 50 },
          moons: { ...base.moon, uninhabitable: true }
        },
        {
          uninhabitable: true,
          count: { min: 2, max: 2 },
          orbit: { ...base.orbit, offset: 0 },
          moons: { ...base.moon, uninhabitable: true }
        },
        {
          type: 'asteroid',
          count: { min: 2, max: 3 },
          orbit: { distance: 0, angle: { min: 40, max: 110 }, offset: 25 }
        },
        {
          uninhabitable: true,
          count: { min: 2, max: 4 },
          orbit: { ...base.orbit, offset: 0 },
          moons: { ...base.moon, uninhabitable: true }
        },
        {
          type: 'gas giant',
          count: { min: 1, max: 2 },
          orbit: { ...base.orbit, offset: 0 },
          moons: { ...base.moon, uninhabitable: true, min: 0, max: 3 }
        },
        {
          uninhabitable: true,
          count: { min: 0, max: 2 },
          orbit: { ...base.orbit, offset: 0 },
          moons: { ...base.moon, uninhabitable: true }
        }
      ]
    }
  },
  {
    w: 10,
    v: {
      type: 'unary',
      asteroidBelts: [{ distance: 85 }],
      objects: [
        base.star,
        {
          uninhabitable: true,
          count: { min: 1, max: 1 },
          orbit: { ...base.orbit, offset: 40 },
          moons: { ...base.moon, uninhabitable: true }
        },
        {
          type: 'asteroid',
          count: { min: 1, max: 2 },
          orbit: { distance: 0, angle: { min: 40, max: 110 }, offset: 25 }
        },
        {
          uninhabitable: true,
          count: { min: 1, max: 1 },
          orbit: { ...base.orbit, offset: 0 },
          moons: { ...base.moon, uninhabitable: true }
        },
        {
          type: 'gas giant',
          count: { min: 1, max: 2 },
          orbit: { ...base.orbit, offset: 0 },
          moons: { ...base.moon, type: 'habitable', min: 1, max: 1 }
        },
        {
          uninhabitable: true,
          count: { min: 1, max: 3 },
          orbit: { ...base.orbit, distance: 25, offset: 0 }
        },
        {
          type: 'gas giant',
          count: { min: 1, max: 2 },
          orbit: { ...base.orbit, offset: 0 },
          moons: { ...base.moon, uninhabitable: true, min: 0, max: 3 }
        },
        {
          uninhabitable: true,
          count: { min: 0, max: 1 },
          orbit: { ...base.orbit, distance: 25, offset: 0 }
        }
      ]
    }
  },
  {
    w: 20,
    v: {
      type: 'unary',
      objects: [
        base.star,
        {
          uninhabitable: true,
          count: { min: 1, max: 3 },
          orbit: { ...base.orbit, distance: 15, offset: 35 }
        },
        {
          type: 'habitable',
          count: { min: 1, max: 1 },
          orbit: { ...base.orbit, offset: 0 },
          moons: { ...base.moon, uninhabitable: true }
        },
        {
          uninhabitable: true,
          count: { min: 1, max: 3 },
          orbit: { ...base.orbit, distance: 15, offset: 0 }
        },
        {
          type: 'gas giant',
          count: { min: 1, max: 2 },
          orbit: { ...base.orbit, offset: 0 },
          moons: { ...base.moon, uninhabitable: true, min: 1, max: 3 }
        },
        {
          uninhabitable: true,
          count: { min: 0, max: 1 },
          orbit: { ...base.orbit, offset: 0 }
        }
      ]
    }
  },
  {
    w: 5,
    v: {
      type: 'trinary',
      objects: [
        base.star,
        {
          type: 'star',
          count: { min: 1, max: 1 },
          orbit: { ...base.orbit, distance: 230 },
          objects: [
            {
              uninhabitable: true,
              count: { min: 2, max: 3 },
              orbit: { ...base.orbit, distance: 25, offset: 30 },
              moons: { ...base.moon, uninhabitable: true }
            }
          ]
        },
        {
          type: 'star',
          count: { min: 1, max: 1 },
          orbit: { ...base.orbit, distance: 0 },
          objects: [
            {
              uninhabitable: true,
              count: { min: 2, max: 4 },
              orbit: { ...base.orbit, distance: 25, offset: 30 }
            }
          ]
        },
        {
          uninhabitable: true,
          count: { min: 1, max: 2 },
          orbit: { ...base.orbit, distance: 15, offset: -210 }
        },
        {
          type: 'habitable',
          count: { min: 1, max: 1 },
          orbit: { ...base.orbit, distance: 15, offset: 0 },
          moons: { ...base.moon, uninhabitable: true }
        },
        {
          type: 'gas giant',
          count: { min: 1, max: 2 },
          orbit: { ...base.orbit, offset: 0 },
          moons: { ...base.moon, uninhabitable: true, min: 1, max: 2 }
        }
      ]
    }
  },
  {
    w: 5,
    v: {
      type: 'binary',
      objects: [
        {
          type: 'star',
          count: { min: 1, max: 1 },
          orbit: { ...base.orbit, distance: 20 }
        },
        {
          type: 'star',
          count: { min: 1, max: 1 },
          orbit: { distance: 30, angle: { min: 180, max: 180 } }
        },
        {
          uninhabitable: true,
          count: { min: 1, max: 3 },
          orbit: { ...base.orbit, distance: 15, offset: 35 }
        },
        {
          type: 'habitable',
          count: { min: 1, max: 1 },
          orbit: { ...base.orbit, offset: 0 },
          moons: { ...base.moon, uninhabitable: true }
        },
        {
          uninhabitable: true,
          count: { min: 1, max: 3 },
          orbit: { ...base.orbit, distance: 25, offset: 0 }
        },
        {
          type: 'gas giant',
          count: { min: 1, max: 2 },
          orbit: { ...base.orbit, offset: 0 },
          moons: { ...base.moon, uninhabitable: true, min: 1, max: 3 }
        },
        {
          uninhabitable: true,
          count: { min: 0, max: 1 },
          orbit: { ...base.orbit, offset: 0 }
        }
      ]
    }
  }
]

export const SOLAR_SYSTEM = {
  habitability: (system: SolarSystem) =>
    SOLAR_SYSTEM.stars(system).reduce(
      (stacked, star) => stacked * STAR.templates[star.type].habitability,
      1
    ),
  name: (system: SolarSystem) => `${system.name} #${system.idx + 1}`,
  nation: (system: SolarSystem) => window.galaxy.nations[system.nation],
  neighbors: (system: SolarSystem) => system.lanes.map(i => window.galaxy.systems[i]),
  populate: (system: SolarSystem) => {
    const template = window.dice.weightedChoice(system.homeworld ? homeworld : standard)
    system.asteroidBelts = template.asteroidBelts?.map(belt => ({ ...belt }))
    const spectral = STAR.classes(template.type)
    const queue = [
      { objects: template.objects ?? [], parent: { type: 'star' as 'star' | 'satellite', idx: -1 } }
    ]
    while (queue.length > 0) {
      const { objects, parent } = queue.shift()!
      const orbit = { distance: 0, angle: 0 }
      objects?.forEach(obj => {
        let nestedParent: Satellite['parent'] = { type: 'star', idx: -1 }
        let count = window.dice.randint(obj.count.min, obj.count.max)
        if (count > 0) orbit.distance += obj.orbit.offset ?? 0
        const uninhabitable = obj.uninhabitable
        const habitability = uninhabitable ? 0 : SOLAR_SYSTEM.habitability(system)
        while (count-- > 0) {
          orbit.distance += obj.orbit.distance
          orbit.angle += window.dice.randint(obj.orbit.angle.min, obj.orbit.angle.max)
          if (obj.type === 'star') {
            const idx = STAR.spawn({
              system: system.idx,
              orbit,
              type: spectral.shift()!
            })
            system.objects.push({ type: 'star', idx })
            nestedParent = { type: 'star', idx }
          } else {
            const idx = SATELLITE.spawn({
              parent,
              system: system.idx,
              habitability,
              orbit,
              type: obj.type
            })
            system.objects.push({ type: 'satellite', idx })
            nestedParent = { type: 'satellite', idx }
            const satellite = window.galaxy.satellites[idx]
            const { space } = SATELLITE.templates[satellite.type]
            count -= space ?? 0
            // each satellite might have moons
            if (obj.moons && satellite.type !== 'asteroid') {
              const moonOrbit = { distance: obj.moons.orbit.offset ?? 0, angle: 0 }
              satellite.moons = range(window.dice.randint(obj.moons.min, obj.moons.max)).map(() => {
                moonOrbit.distance += obj.moons?.orbit?.distance ?? 0
                moonOrbit.angle += window.dice.randint(
                  obj.moons?.orbit.angle.min ?? 0,
                  obj.moons?.orbit.angle.max ?? 0
                )
                return SATELLITE.spawn({
                  system: system.idx,
                  parent: { type: 'satellite', idx: satellite.idx },
                  moon: true,
                  habitability: obj.moons?.uninhabitable ? 0 : habitability,
                  orbit: moonOrbit,
                  type: obj.moons?.type
                })
              })
            }
          }
        }
        if (obj.objects) {
          queue.push({
            objects: obj.objects,
            parent: nestedParent
          })
        }
      })
    }
  },
  objects: (system: SolarSystem) =>
    system.objects.map(obj => window.galaxy[obj.type === 'star' ? 'stars' : 'satellites'][obj.idx]),
  spawn: (params: SolarSystemSpawnParams): SolarSystem => ({
    ...params,
    tag: 'system',
    seed: window.dice.generateId(),
    lanes: [] as number[],
    objects: [] as SolarSystem['objects'],
    name: '',
    nation: -1
  }),
  stars: (system: SolarSystem) =>
    system.objects.filter(obj => obj.type === 'star').map(obj => window.galaxy.stars[obj.idx])
}
