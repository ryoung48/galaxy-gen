import { CustomPieChart } from './pie'
import { Orbit } from '../../model/system/orbits/types'

const eccentricityCategories = [
  'Circular (<0.01)',
  'Slight (0.01-0.05)',
  'Moderate (0.05-0.15)',
  'Eccentric (0.15-0.3)',
  'High (0.3-0.6)',
  'Extreme (>0.6)'
] as const

type EccentricityCategory = (typeof eccentricityCategories)[number]

const ECCENTRICITY_COLORS: Record<EccentricityCategory, string> = {
  'Circular (<0.01)': '#0c6ba2',
  'Slight (0.01-0.05)': '#2a9ad4',
  'Moderate (0.05-0.15)': '#56b9e5',
  'Eccentric (0.15-0.3)': '#7fcaf0',
  'High (0.3-0.6)': '#ffb97d',
  'Extreme (>0.6)': '#f77f72'
}

const getEccentricityCategory = (orbit: Orbit): EccentricityCategory => {
  const eccentricity = orbit.eccentricity
  if (eccentricity < 0.01) return 'Circular (<0.01)'
  if (eccentricity < 0.05) return 'Slight (0.01-0.05)'
  if (eccentricity < 0.15) return 'Moderate (0.05-0.15)'
  if (eccentricity < 0.3) return 'Eccentric (0.15-0.3)'
  if (eccentricity < 0.6) return 'High (0.3-0.6)'
  return 'Extreme (>0.6)'
}

export const EccentricityDistribution = () => {
  const eccentricityFreq = window.galaxy.orbits
    .filter(orbit => orbit.tag === 'orbit' && orbit.type !== 'asteroid belt')
    .reduce(
      (dict: Record<EccentricityCategory, number>, orbit) => {
        const category = getEccentricityCategory(orbit as Orbit)
        dict[category] = (dict[category] ?? 0) + 1
        return dict
      },
      {} as Record<EccentricityCategory, number>
    )

  const total = Object.values(eccentricityFreq).reduce((sum, count) => sum + count, 0)

  const data = eccentricityCategories
    .filter(category => eccentricityFreq[category] > 0)
    .map(category => ({
      id: category,
      label: category,
      value: eccentricityFreq[category],
      color: ECCENTRICITY_COLORS[category]
    }))

  return <CustomPieChart data={data} total={total} />
}
