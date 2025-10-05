import { SIZE } from '../../model/system/orbits/groups'
import { CustomPieChart } from './pie'

export const SizeDistribution = () => {
  const sizeFreq = window.galaxy.orbits
    .filter(o => o.group !== 'asteroid belt')
    .reduce((dict: Record<string, number>, orbit) => {
      const sizeKey = orbit.size.toString()
      if (!dict[sizeKey]) dict[sizeKey] = 0
      dict[sizeKey] += 1
      return dict
    }, {})

  const total = Object.values(sizeFreq).reduce((sum, count) => sum + count, 0)

  const data = Object.entries(sizeFreq)
    .map(([sizeStr, count]) => {
      const size = parseInt(sizeStr)
      return {
        id: SIZE.label(size),
        label: SIZE.label(size),
        value: count,
        color: SIZE.colors(size),
        size
      }
    })
    .sort((a, b) => a.size - b.size)

  return <CustomPieChart data={data} total={total} />
}
