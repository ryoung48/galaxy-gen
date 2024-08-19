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
    scale: scaleLinear([0, 13], [0, 1]),
    color: (heat: number) => interpolateGreens(METRICS.biosphere.scale(heat)),
    legend: () =>
      range(0, 14)
        .reverse()
        .map(biosphere => ({
          color: METRICS.biosphere.color(biosphere),
          text: biosphere.toString()
        }))
  },
  desirability: {
    scale: scaleLinear([-4, 8], [0, 1]),
    color: (heat: number) => interpolateSpectral(METRICS.desirability.scale(heat)),
    legend: () =>
      range(-4, 9)
        .reverse()
        .map(desirability => ({
          color: METRICS.desirability.color(desirability),
          text: desirability.toString()
        }))
  },
  population: {
    scale: scaleLinear([0, 10], [0, 1]),
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
  }
}
