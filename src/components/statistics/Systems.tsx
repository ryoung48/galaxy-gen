import { SOLAR_SYSTEM } from '../../model/system'
import CustomLineChart from './line'

export const SystemSizes = () => {
  const starFreq = window.galaxy.systems.reduce((dict: Record<number, number>, system) => {
    const orbits = SOLAR_SYSTEM.orbits(system)
    if (!dict[orbits.length]) dict[orbits.length] = 0
    dict[orbits.length] += 1
    return dict
  }, {})
  const data = Object.entries(starFreq)
    .map(([k, v]) => ({
      x: k,
      y: v
    }))
    .sort((a, b) => parseInt(a.x) - parseInt(b.x))
  return (
    <CustomLineChart
      data={[
        {
          id: 'sizes',
          color: 'purple',
          data
        }
      ]}
      axis={{ x: 'sizes' }}
      colors={['#461aad']}
    ></CustomLineChart>
  )
}
