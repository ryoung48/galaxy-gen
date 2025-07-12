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

  const getSizeLabel = (size: number): string => {
    if (size === -1) return 'Asteroid Belt'
    if (size === 0) return 'Small Bodies 0 (600km)'
    if (size === 1) return 'Small Planets 1 (1,600km)'
    if (size === 2) return 'Luna-class 2 (3,200km)'
    if (size === 3) return 'Mercury-class 3 (4,800km)'
    if (size === 4) return 'Mars-class 4 (6,400km)'
    if (size === 5) return 'Size 5 (8,000km)'
    if (size === 6) return 'Size 6 (9,600km)'
    if (size === 7) return 'Size 7 (11,200km)'
    if (size === 8) return 'Terra-class 8 (12,800km)'
    if (size === 9) return 'Super-Earth 9 (14,400km)'
    if (size === 10) return 'Size 10 (16,000km)'
    if (size === 11) return 'Size 11 (17,600km)'
    if (size === 12) return 'Size 12 (19,200km)'
    if (size === 13) return 'Size 13 (20,800km)'
    if (size === 14) return 'Size 14 (22,400km)'
    if (size === 15) return 'Size 15 (24,000km)'
    if (size === 16) return 'Gas Giant 16 (Small)'
    if (size === 17) return 'Gas Giant 17 (Medium)'
    if (size === 18) return 'Gas Giant 18 (Large)'
    return `Size ${size}`
  }

  const data = Object.entries(sizeFreq)
    .map(([sizeStr, count]) => {
      const size = parseInt(sizeStr)
      return {
        id: getSizeLabel(size),
        label: getSizeLabel(size),
        value: count,
        color: SIZE.colors(size),
        size
      }
    })
    .sort((a, b) => a.size - b.size)

  return <CustomPieChart data={data} total={total} />
}
