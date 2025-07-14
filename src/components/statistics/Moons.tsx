import { CustomPieChart } from './pie'
import { Orbit } from '../../model/system/orbits/types'
import { ORBIT_CLASSIFICATION } from '../../model/system/orbits/classification'

export const MoonFrequency = () => {
  const moons = window.galaxy.orbits.filter(
    orbit => orbit.parent.type !== 'star' && !ORBIT_CLASSIFICATION[orbit.type]?.asteroid
  )
  const total = moons.length
  const orbitFreq = moons.reduce((dict: Record<string, number>, orbit) => {
    if (!dict[orbit.type]) dict[orbit.type] = 0
    dict[orbit.type] += 1
    return dict
  }, {})

  const data = Object.entries(orbitFreq)
    .map(([k, v]) => {
      return {
        id: k,
        label: k,
        value: v,
        color: ORBIT_CLASSIFICATION[k as Orbit['type']].color
      }
    })
    .sort((a, b) => b.value - a.value)
  return <CustomPieChart data={data} total={total}></CustomPieChart>
}
