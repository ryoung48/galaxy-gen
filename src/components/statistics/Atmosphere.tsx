import { CustomPieChart } from './pie'
import { ATMOSPHERE } from '../../model/system/orbits/atmosphere'

export const AtmosphereDistribution = () => {
  const atmoFreq = window.galaxy.orbits.reduce((dict: Record<number, number>, orbit) => {
    if (!dict[orbit.atmosphere.code]) dict[orbit.atmosphere.code] = 0
    dict[orbit.atmosphere.code] += 1
    return dict
  }, {})

  const total = Object.values(atmoFreq).reduce((sum, count) => sum + count, 0)

  const getAtmosphereLabel = (code: number): string => {
    if (code === 0) return 'Vacuum (0)'
    if (code === 1) return 'Trace (1)'
    if (code === 2) return 'Very Thin, Tainted (2)'
    if (code === 3) return 'Very Thin (3)'
    if (code === 4) return 'Thin, Tainted (4)'
    if (code === 5) return 'Thin (5)'
    if (code === 6) return 'Standard (6)'
    if (code === 7) return 'Standard, Tainted (7)'
    if (code === 8) return 'Dense (8)'
    if (code === 9) return 'Dense, Tainted (9)'
    if (code === 10) return 'Exotic (A)'
    if (code === 11) return 'Corrosive (B)'
    if (code === 12) return 'Insidious (C)'
    if (code === 13) return 'Very Dense (D)'
    if (code === 14) return 'Low (E)'
    if (code === 15) return 'Unusual (F)'
    if (code === 16) return 'Gas, Helium (G)'
    if (code === 17) return 'Gas, Hydrogen (H)'
    return `Code ${code}`
  }

  const data = Object.entries(atmoFreq)
    .map(([code, count]) => ({
      id: getAtmosphereLabel(parseInt(code)),
      label: getAtmosphereLabel(parseInt(code)),
      value: count,
      color: ATMOSPHERE.color(parseInt(code))
    }))
    .sort((a, b) => parseInt(a.id.split('-')[1]) - parseInt(b.id.split('-')[1]))

  return <CustomPieChart data={data} total={total} />
}
