import { GALAXY } from '../../model/galaxy'
import { SOLAR_SYSTEM } from '../../model/system'
import CustomLineChart from './line'

export const SystemSizes = () => {
  const worlds = GALAXY.worlds()
  const starFreq = worlds.reduce((dict: Record<number, number>, system) => {
    const orbits = SOLAR_SYSTEM.orbits(system).filter(
      o => o.tag !== 'orbit' || (o.type !== 'asteroid belt' && o.type !== 'ice asteroid belt')
    )
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
