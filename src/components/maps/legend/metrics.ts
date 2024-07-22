import { interpolateGreens, interpolatePurples, range, scaleLinear } from 'd3'

export const METRICS = {
  biosphere: {
    scale: scaleLinear([0, 12], [0, 1]),
    color: (heat: number) => interpolateGreens(METRICS.biosphere.scale(heat)),
    legend: () =>
      range(0, 13)
        .reverse()
        .map(biosphere => ({
          color: METRICS.biosphere.color(biosphere),
          text: biosphere.toString()
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
