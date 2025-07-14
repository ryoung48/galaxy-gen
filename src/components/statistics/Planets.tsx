import { CustomPieChart } from './pie'
import { ORBIT_CLASSIFICATION } from '../../model/system/orbits/classification'
import { Orbit } from '../../model/system/orbits/types'

export const PlanetFrequency = () => {
  const planets = window.galaxy.orbits.filter(
    orbit => orbit.parent.type === 'star' && !ORBIT_CLASSIFICATION[orbit.type]?.asteroidBelt
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
        color: ORBIT_CLASSIFICATION[k as Orbit['type']].color
      }
    })
    .sort((a, b) => b.value - a.value)
  return <CustomPieChart data={data} total={total}></CustomPieChart>
}
