import { CustomPieChart } from './pie'
import { METRICS } from '../maps/legend/metrics'

export const BiosphereDistribution = () => {
  const bioFreq = window.galaxy.orbits
    .filter(orbit => orbit.biosphere !== 0)
    .reduce((dict: Record<number, number>, orbit) => {
      if (!dict[orbit.biosphere]) dict[orbit.biosphere] = 0
      dict[orbit.biosphere] += 1
      return dict
    }, {})

  const total = Object.values(bioFreq).reduce((sum, count) => sum + count, 0)

  const getBiosphereLabel = (complexity: number): string => {
    if (complexity === -1) return 'Remnants (-1)'
    if (complexity === 0) return 'Sterile (0)'
    if (complexity === 1) return 'Building Blocks (1)'
    if (complexity === 2) return 'Single-celled Organisms (2)'
    if (complexity === 3) return 'Producers (3)'
    if (complexity === 4) return 'Multi-cellular Organisms (4)'
    if (complexity === 5) return 'Complex Single-celled Life (5)'
    if (complexity === 6) return 'Complex Multi-cellular Life (6)'
    if (complexity === 7) return 'Small Macroscopic Life (7)'
    if (complexity === 8) return 'Large Macroscopic Life (8)'
    if (complexity === 9) return 'Simple Global Ecology (9)'
    if (complexity === 10) return 'Complex Global Ecology (10)'
    if (complexity === 11) return 'Proto-sapience (11)'
    if (complexity === 12) return 'Full Sapience (12)'
    return `Engineered (${complexity})`
  }

  const data = Object.entries(bioFreq)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .map(([complexity, count]) => ({
      id: getBiosphereLabel(parseInt(complexity)),
      label: getBiosphereLabel(parseInt(complexity)),
      value: count,
      color: METRICS.biosphere.color(parseInt(complexity))
    }))

  return <CustomPieChart data={data} total={total} />
}
