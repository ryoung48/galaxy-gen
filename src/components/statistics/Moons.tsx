import { CustomPieChart } from './pie'
import { ORBIT } from '../../model/system/orbits'
import { Orbit } from '../../model/system/orbits/types'

export const MoonFrequency = () => {
  const moons = window.galaxy.orbits.filter(
    orbit => orbit.parent.type !== 'star' && orbit.type !== 'asteroid'
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
        color: ORBIT.colors(k as unknown as Orbit)
      }
    })
    .sort((a, b) => b.value - a.value)
  return <CustomPieChart data={data} total={total}></CustomPieChart>
}
