import { CustomPieChart } from './pie'
import { ORBIT } from '../../model/system/orbits'

export const MoonFrequency = () => {
  const moons = window.galaxy.orbits.filter(orbit => orbit.parent.type !== 'star')
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
        color: ORBIT.colors.get()[k]
      }
    })
    .sort((a, b) => b.value - a.value)
  return <CustomPieChart data={data} total={total}></CustomPieChart>
}
