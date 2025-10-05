import { interpolateGreys } from 'd3'
import { CustomPieChart } from './pie'

const STARPORT_ORDER = ['X', 'E', 'D', 'C', 'B', 'A'] as const

const STARPORT_LABELS: Record<(typeof STARPORT_ORDER)[number], string> = {
  A: 'Class A (Excellent)',
  B: 'Class B (Good)',
  C: 'Class C (Routine)',
  D: 'Class D (Poor)',
  E: 'Class E (Frontier)',
  X: 'Class X (None)'
}

const STARPORT_COLORS = STARPORT_ORDER.reduce(
  (colors, code, index) => {
    const fraction = (index + 1) / (STARPORT_ORDER.length + 1)
    colors[code] = interpolateGreys(1 - fraction)
    return colors
  },
  {} as Record<(typeof STARPORT_ORDER)[number], string>
)

export const StarportDistribution = () => {
  const starportFreq = window.galaxy.orbits
    .filter(orbit => orbit.starport && orbit.population && orbit.population.code > 0)
    .reduce((dict: Record<string, number>, orbit) => {
      const starport = orbit.starport!
      if (!dict[starport]) dict[starport] = 0
      dict[starport] += 1
      return dict
    }, {})

  const total = Object.values(starportFreq).reduce((sum, count) => sum + count, 0)

  const data = STARPORT_ORDER.filter(code => starportFreq[code]).map(code => ({
    id: STARPORT_LABELS[code],
    label: STARPORT_LABELS[code],
    value: starportFreq[code],
    color: STARPORT_COLORS[code]
  }))

  return <CustomPieChart data={data} total={total} />
}
