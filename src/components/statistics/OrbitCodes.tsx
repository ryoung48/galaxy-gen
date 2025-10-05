import { CustomPieChart } from './pie'
import type { Orbit } from '../../model/system/orbits/types'
import { ORBIT_CODE_DETAILS, OrbitCode } from '../../model/system/orbits/tags'

const ORBIT_CODE_ORDER: OrbitCode[] = [
  'garden',
  'agricultural',
  'rich',
  'high tech',
  'high population',
  'industrial',
  'non-industrial',
  'non-agricultural',
  'poor',
  'low tech',
  'low population',
  'desert',
  'fluid oceans',
  'water-world',
  'asteroid',
  'unclassified'
]

const isOrbitCode = (code: string): code is OrbitCode => code in ORBIT_CODE_DETAILS

export const OrbitCodeDistribution = () => {
  const codeFrequency = window.galaxy.orbits
    .filter(orbit => orbit.tag === 'orbit')
    .reduce<Record<OrbitCode, number>>(
      (dict, orbit) => {
        const codes = (orbit as Orbit).codes ?? []
        codes.forEach(code => {
          if (!isOrbitCode(code)) return
          dict[code] = (dict[code] ?? 0) + 1
        })
        return dict
      },
      {} as Record<OrbitCode, number>
    )

  const total = Object.values(codeFrequency).reduce((sum, count) => sum + count, 0)

  const data = ORBIT_CODE_ORDER.filter(code => codeFrequency[code] > 0).map(code => ({
    id: ORBIT_CODE_DETAILS[code].label,
    label: ORBIT_CODE_DETAILS[code].label,
    value: codeFrequency[code],
    color: ORBIT_CODE_DETAILS[code].color
  }))

  return <CustomPieChart data={data} total={total} />
}
