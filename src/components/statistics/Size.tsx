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

  const getSizeColor = (size: number): string => {
    if (size === -1) return '#8b4513' // saddle brown - asteroid belt
    if (size === 0) return '#a0522d' // sienna - small bodies
    if (size === 1) return '#cd853f' // peru - small planets
    if (size === 2) return '#daa520' // goldenrod - Luna-class
    if (size === 3) return '#b8860b' // dark goldenrod - Mercury-class
    if (size === 4) return '#ff8c00' // dark orange - Mars-class
    if (size === 5) return '#ffa500' // orange - size 5
    if (size === 6) return '#ffd700' // gold - size 6
    if (size === 7) return '#9acd32' // yellow-green - size 7
    if (size === 8) return '#228b22' // forest green - Terra-class
    if (size === 9) return '#32cd32' // lime green - Super-Earth
    if (size === 10) return '#00ced1' // dark turquoise - size A
    if (size === 11) return '#4169e1' // royal blue - size B
    if (size === 12) return '#0000ff' // blue - size C
    if (size === 13) return '#4b0082' // indigo - size D
    if (size === 14) return '#8a2be2' // blue violet - size E
    if (size === 15) return '#9370db' // medium purple - size F
    if (size === 16) return '#ba55d3' // medium orchid - small gas giant
    if (size === 17) return '#da70d6' // orchid - medium gas giant
    if (size === 18) return '#ff69b4' // hot pink - large gas giant
    return '#808080' // fallback gray
  }

  const data = Object.entries(sizeFreq)
    .map(([sizeStr, count]) => {
      const size = parseInt(sizeStr)
      return {
        id: getSizeLabel(size),
        label: getSizeLabel(size),
        value: count,
        color: getSizeColor(size),
        size
      }
    })
    .sort((a, b) => a.size - b.size)

  return <CustomPieChart data={data} total={total} />
}
