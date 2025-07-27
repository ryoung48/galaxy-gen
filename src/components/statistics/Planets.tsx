import { CustomPieChart } from './pie'
import { ORBIT } from '../../model/system/orbits'
import { Orbit } from '../../model/system/orbits/types'

export const PlanetFrequency = () => {
  const planets = window.galaxy.orbits.filter(
    orbit => orbit.parent.type === 'star' && orbit.group !== 'asteroid belt'
  )
  const total = planets.length
  const orbitFreq = planets.reduce((dict: Record<string, number>, orbit) => {
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
