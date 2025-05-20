import {
  interpolateBlues,
  interpolateGreens,
  interpolatePurples,
  interpolateSpectral,
  range,
  scaleLinear
} from 'd3'

export const METRICS = {
  biosphere: {
    scale: scaleLinear([0, 12], [0, 1]),
    color: (heat: number) => interpolateGreens(METRICS.biosphere.scale(heat)),
    legend: () =>
      range(0, 14)
        .reverse()
        .map(biosphere => ({
          color: METRICS.biosphere.color(biosphere),
          text: biosphere.toString()
        }))
  },
  habitability: {
    scale: scaleLinear([-10, 10], [0, 1]),
    color: (heat: number) => interpolateSpectral(METRICS.habitability.scale(heat)),
    legend: () =>
      range(-10, 11, 2)
        .reverse()
        .map(habitability => ({
          color: METRICS.habitability.color(habitability),
          text: habitability.toString()
        }))
  },
  population: {
    scale: scaleLinear([0, 1, 9], [0, 0.2, 1]),
    color: (heat: number) => interpolateBlues(METRICS.population.scale(heat)),
    legend: () =>
      range(0, 10)
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
  }
}
