import { range } from 'd3'
import { CustomPieChart } from './pie'
import { METRICS } from '../maps/legend/metrics'

export const BiosphereDistribution = () => {
  const bioFreq = window.galaxy.orbits
    .filter(orbit => orbit.biosphere > 0)
    .reduce((dict: Record<number, number>, orbit) => {
      if (!dict[orbit.biosphere]) dict[orbit.biosphere] = 0
      dict[orbit.biosphere] += 1
      return dict
    }, {})

  const total = Object.values(bioFreq).reduce((sum, count) => sum + count, 0)

  // Generate colors for different biosphere complexity levels
  const colors = range(1, 13).map(i => METRICS.biosphere.color(i))

  const getBiosphereLabel = (complexity: number): string => {
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
    return `Complexity ${complexity}`
  }

  const data = Object.entries(bioFreq)
    .map(([complexity, count], index) => ({
      id: getBiosphereLabel(parseInt(complexity)),
      label: getBiosphereLabel(parseInt(complexity)),
      value: count,
      color: colors[index % colors.length]
    }))
    .sort((a, b) => parseInt(a.id.split('-')[1]) - parseInt(b.id.split('-')[1]))

  return <CustomPieChart data={data} total={total} />
}
