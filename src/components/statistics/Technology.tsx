import { range } from 'd3'
import { CustomPieChart } from './pie'
import { METRICS } from '../maps/legend/metrics'

const getTechnologyRange = (tech: number) => {
  if (tech <= 3 && tech >= 0) return 2
  if (tech >= 4 && tech <= 6) return 5
  if (tech >= 7 && tech <= 9) return 8
  if (tech >= 10 && tech <= 11) return 10
  if (tech >= 12 && tech <= 14) return 13
  if (tech >= 15) return 15
  return 0
}

export const TechnologyDistribution = () => {
  const techFreq = window.galaxy.orbits
    .filter(orbit => orbit?.population !== undefined && orbit.population.code > 0)
    .reduce((dict: Record<number, number>, orbit) => {
      const tech = getTechnologyRange(orbit.technology.score)
      if (!dict[tech]) dict[tech] = 0
      dict[tech] += 1
      return dict
    }, {})

  const total = Object.values(techFreq).reduce((sum, count) => sum + count, 0)

  // Generate colors for different technology levels
  const colors = range(0, 16).map(i => METRICS.tech.color(i))

  const getTechnologyLabel = (tech: number): string => {
    if (tech === 0) return 'No Industry (0)'
    if (tech === 2) return 'Primitive (1-3)'
    if (tech === 5) return 'Industrial (4-6)'
    if (tech === 8) return 'Early Stellar (7-9)'
    if (tech === 10) return 'Late Stellar (10-11)'
    if (tech === 13) return 'Low Imperial (12-14)'
    if (tech === 15) return 'High Imperial (15)'
    return `Tech Level ${tech}`
  }

  const data = Object.entries(techFreq)
    .map(([tech, count]) => ({
      id: getTechnologyLabel(parseInt(tech)),
      label: getTechnologyLabel(parseInt(tech)),
      value: count,
      color: colors[parseInt(tech)]
    }))
    .sort((a, b) => {
      const aNum = Object.keys(techFreq).find(key => getTechnologyLabel(parseInt(key)) === a.id)
      const bNum = Object.keys(techFreq).find(key => getTechnologyLabel(parseInt(key)) === b.id)
      return parseInt(aNum || '0') - parseInt(bNum || '0')
    })

  return <CustomPieChart data={data} total={total} />
}
