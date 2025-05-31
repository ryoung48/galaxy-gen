import { range } from 'd3'
import { CustomPieChart } from './pie'
import { METRICS } from '../maps/legend/metrics'

export const PopulationDistribution = () => {
  const popFreq = window.galaxy.orbits
    .filter(orbit => orbit.population?.code !== undefined)
    .reduce((dict: Record<number, number>, orbit) => {
      if (!dict[orbit.population!.code]) dict[orbit.population!.code] = 0
      dict[orbit.population!.code] += 1
      return dict
    }, {})

  const total = Object.values(popFreq).reduce((sum, count) => sum + count, 0)

  // Generate colors for different population codes
  const colors = range(0, 11).map(i => METRICS.population.color(i))

  const getPopulationLabel = (code: number): string => {
    if (code === 0) return 'Failed Colony (0)'
    if (code === 1) return 'Few (1-99)'
    if (code === 2) return 'Hundreds (100-999)'
    if (code === 3) return 'Thousands (1K-9K)'
    if (code === 4) return 'Ten Thousands (10K-99K)'
    if (code === 5) return 'Hundred Thousands (100K-999K)'
    if (code === 6) return 'Millions (1M-9M)'
    if (code === 7) return 'Ten Millions (10M-99M)'
    if (code === 8) return 'Hundred Millions (100M-999M)'
    if (code === 9) return 'Billions (1B-9B)'
    if (code === 10) return 'Ten Billions (10B-99B)'
    return `Population Code ${code}`
  }

  const data = Object.entries(popFreq)
    .map(([code, count]) => ({
      id: getPopulationLabel(parseInt(code)),
      label: getPopulationLabel(parseInt(code)),
      value: count,
      color: colors[parseInt(code)]
    }))
    .sort((a, b) => {
      const aNum = Object.keys(popFreq).find(key => getPopulationLabel(parseInt(key)) === a.id)
      const bNum = Object.keys(popFreq).find(key => getPopulationLabel(parseInt(key)) === b.id)
      return parseInt(aNum || '0') - parseInt(bNum || '0')
    })

  return <CustomPieChart data={data} total={total} />
}
