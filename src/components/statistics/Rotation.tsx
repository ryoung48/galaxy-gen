import { CustomPieChart } from './pie'
import { Orbit } from '../../model/system/orbits/types'

const rotationCategories = [
  '1:1 Tidal Lock (Star)',
  '1:1 Tidal Lock (Planet)',
  '1:1 Tidal Lock (Moon)',
  '1:1 Tidal Lock (Unknown)',
  '3:2 Tidal Lock',
  'Ultra Fast (<10h)',
  'Fast (10-18h)',
  'Terrestrial (18-30h)',
  'Slow (30-72h)',
  'Very Slow (72-240h)',
  'Long Days (>240h)'
] as const

type RotationCategory = (typeof rotationCategories)[number]

const ROTATION_COLORS: Record<RotationCategory, string> = {
  '1:1 Tidal Lock (Planet)': '#2f5867',
  '1:1 Tidal Lock (Star)': '#274955ff',
  '1:1 Tidal Lock (Moon)': '#42788bff',
  '1:1 Tidal Lock (Unknown)': '#5aa5c0',
  '3:2 Tidal Lock': '#468b8f',
  'Ultra Fast (<10h)': '#4eb6a4',
  'Fast (10-18h)': '#94c796',
  'Terrestrial (18-30h)': '#f1d08c',
  'Slow (30-72h)': '#f7b67b',
  'Very Slow (72-240h)': '#f18c6e',
  'Long Days (>240h)': '#b57de2'
}

const getRotationCategory = (orbit: Orbit): RotationCategory => {
  if (orbit.direction === '1:1 tidal lock') {
    const lockType = orbit.lock?.type ?? 'unknown'
    if (lockType === 'star') return '1:1 Tidal Lock (Star)'
    if (lockType === 'planet') return '1:1 Tidal Lock (Planet)'
    if (lockType === 'moon') return '1:1 Tidal Lock (Moon)'
    return '1:1 Tidal Lock (Unknown)'
  }
  if (orbit.direction === '3:2 tidal lock') return '3:2 Tidal Lock'
  const rotation = orbit.rotation.value
  if (rotation < 10) return 'Ultra Fast (<10h)'
  if (rotation < 18) return 'Fast (10-18h)'
  if (rotation < 30) return 'Terrestrial (18-30h)'
  if (rotation < 72) return 'Slow (30-72h)'
  if (rotation < 240) return 'Very Slow (72-240h)'
  return 'Long Days (>240h)'
}

export const RotationDistribution = () => {
  const rotationFreq = window.galaxy.orbits
    .filter(orbit => orbit.tag === 'orbit' && orbit.type !== 'asteroid belt')
    .reduce(
      (dict: Record<RotationCategory, number>, orbit) => {
        const category = getRotationCategory(orbit as Orbit)
        if (!dict[category]) dict[category] = 0
        dict[category] += 1
        return dict
      },
      {} as Record<RotationCategory, number>
    )

  const total = Object.values(rotationFreq).reduce((sum, count) => sum + count, 0)

  const data = rotationCategories
    .filter(category => rotationFreq[category] > 0)
    .map(category => ({
      id: category,
      label: category,
      value: rotationFreq[category],
      color: ROTATION_COLORS[category]
    }))

  return <CustomPieChart data={data} total={total} />
}
