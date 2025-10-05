import { CustomPieChart } from './pie'
import { Orbit } from '../../model/system/orbits/types'

const tiltCategories = [
  'Minimal (<1 deg)',
  'Low (1-10 deg)',
  'Moderate (10-25 deg)',
  'High (25-45 deg)',
  'Extreme (45-65 deg)',
  'Polar (65-90 deg)',
  'Retrograde (90-135 deg)',
  'Inverted (>135 deg)'
] as const

type TiltCategory = (typeof tiltCategories)[number]

const TILT_COLORS: Record<TiltCategory, string> = {
  'Minimal (<1 deg)': '#385d7c',
  'Low (1-10 deg)': '#4b81a6',
  'Moderate (10-25 deg)': '#769fc2',
  'High (25-45 deg)': '#b3c6d6',
  'Extreme (45-65 deg)': '#f6b38f',
  'Polar (65-90 deg)': '#f79a8a',
  'Retrograde (90-135 deg)': '#f78285',
  'Inverted (>135 deg)': '#f06778'
}

const getTiltCategory = (orbit: Orbit): TiltCategory => {
  if (orbit.direction === '1:1 tidal lock' || orbit.tilt < 1) return 'Minimal (<1 deg)'

  const tilt = orbit.tilt

  if (tilt > 90) {
    if (tilt > 135) return 'Inverted (>135 deg)'
    return 'Retrograde (90-135 deg)'
  }

  if (tilt < 10) return 'Low (1-10 deg)'
  if (tilt < 25) return 'Moderate (10-25 deg)'
  if (tilt < 45) return 'High (25-45 deg)'
  if (tilt < 65) return 'Extreme (45-65 deg)'
  return 'Polar (65-90 deg)'
}

export const AxialTiltDistribution = () => {
  const tiltFreq = window.galaxy.orbits
    .filter(orbit => orbit.tag === 'orbit' && orbit.type !== 'asteroid belt')
    .reduce(
      (dict: Record<TiltCategory, number>, orbit) => {
        const category = getTiltCategory(orbit as Orbit)
        if (!dict[category]) dict[category] = 0
        dict[category] += 1
        return dict
      },
      {} as Record<TiltCategory, number>
    )

  const total = Object.values(tiltFreq).reduce((sum, count) => sum + count, 0)

  const data = tiltCategories
    .filter(category => tiltFreq[category] > 0)
    .map(category => ({
      id: category,
      label: category,
      value: tiltFreq[category],
      color: TILT_COLORS[category]
    }))

  return <CustomPieChart data={data} total={total} />
}
