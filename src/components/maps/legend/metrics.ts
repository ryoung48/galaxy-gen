import {
  interpolateBlues,
  interpolateGreens,
  interpolateOranges,
  interpolatePurples,
  interpolateSpectral,
  interpolatePuOr,
  range,
  scaleLinear
} from 'd3'

export const METRICS = {
  biosphere: {
    scale: scaleLinear([0, 10], [0, 1]),
    color: (heat: number) =>
      heat === -1
        ? '#d6d6d6'
        : heat > 10
        ? '#8268ed'
        : interpolateGreens(METRICS.biosphere.scale(heat)),
    legend: () =>
      range(0, 11)
        .reverse()
        .map(biosphere => ({
          color: METRICS.biosphere.color(biosphere),
          text: biosphere.toString()
        }))
  },
  habitability: {
    scale: scaleLinear([0, 10], [0, 1]).clamp(true),
    color: (heat: number) => interpolateSpectral(METRICS.habitability.scale(heat)),
    legend: () =>
      range(0, 11)
        .reverse()
        .map(habitability => ({
          color: METRICS.habitability.color(habitability),
          text: habitability.toString()
        }))
  },
  population: {
    scale: scaleLinear([0, 1, 10], [0, 0.2, 1]),
    color: (heat: number) => interpolateBlues(METRICS.population.scale(heat)),
    legend: () =>
      range(0, 11)
        .reverse()
        .map(pops => ({
          color: METRICS.population.color(pops),
          text: pops.toString()
        }))
  },
  orbits: {
    scale: scaleLinear([0, 50], [0, 1]),
    color: (heat: number) => interpolatePurples(METRICS.orbits.scale(heat)),
    legend: () =>
      range(0, 50, 5)
        .reverse()
        .map(orbits => ({
          color: METRICS.orbits.color(orbits),
          text: orbits.toString()
        }))
  },
  tech: {
    scale: scaleLinear([0, 15], [0, 1]),
    color: (heat: number) => interpolateOranges(METRICS.tech.scale(heat)),
    legend: () =>
      range(0, 16)
        .reverse()
        .map(tech => ({
          color: METRICS.tech.color(tech),
          text: tech.toString()
        }))
  },
  government: {
    colors: {
      autocracy: 'hsl(0, 100%, 87%)',
      republic: 'hsl(217, 100%, 87%)',
      oligarchy: 'hsl(133, 100.00%, 87.10%)',
      confederation: 'hsl(28, 100%, 86%)',
      fragmented: 'hsl(195, 43%, 89%)',
      theocracy: 'hsl(45, 77%, 95%)',
      hivemind: 'hsl(162, 100%, 81.60%)'
    },
    legend: () => [
      ...Object.entries(METRICS.government.colors).map(([k, v]) => ({
        color: v,
        text: k
      }))
    ]
  },
  wtn: {
    scale: scaleLinear([0, 15], [0, 1]),
    color: (heat: number) => interpolateOranges(METRICS.wtn.scale(heat)),
    legend: () =>
      range(0, 16)
        .reverse()
        .map(wtn => ({
          color: METRICS.wtn.color(wtn),
          text: wtn.toString()
        }))
  },
  resources: {
    scale: scaleLinear([2, 12], [1, 0]),
    color: (heat: number) => interpolatePuOr(METRICS.resources.scale(heat)),
    legend: () =>
      range(2, 13)
        .reverse()
        .map(resources => ({
          color: METRICS.resources.color(resources),
          text: resources.toString()
        }))
  }
}
