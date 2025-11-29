import { CustomPieChart } from './pie'
import { METRICS } from '../maps/legend/metrics'
import { BIOSPHERE } from '../../model/system/orbits/biosphere'
import { TEXT } from '../../model/utilities/text'

export const BiosphereDistribution = () => {
  // Get max habitability for each system
  const bioFreq = window.galaxy.orbits
    .filter(orbit => orbit.type !== 'asteroid belt' && orbit.biosphere.code > 0)
    .reduce((dict: Record<number, number>, orbit) => {
      const coded = orbit.biosphere.code
      if (!dict[coded]) dict[coded] = 0
      dict[coded] += 1
      return dict
    }, {})

  const total = Object.values(bioFreq).reduce((sum, count) => sum + count, 0)

  const data = Object.entries(bioFreq)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .map(([complexity, count]) => ({
      id: TEXT.title(BIOSPHERE.labels[complexity]),
      label: TEXT.title(BIOSPHERE.labels[complexity]),
      value: count,
      color: METRICS.biosphere.color(parseInt(complexity))
    }))

  return <CustomPieChart data={data} total={total} />
}
