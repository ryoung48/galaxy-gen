import CustomLineChart from './line'

export const BiosphereDistribution = () => {
  const bioFreq = window.galaxy.orbits
    .filter(orbit => orbit.biosphere > 0)
    .reduce((dict: Record<number, number>, orbit) => {
      if (!dict[orbit.biosphere]) dict[orbit.biosphere] = 0
      dict[orbit.biosphere] += 1
      return dict
    }, {})
  const data = Object.entries(bioFreq)
    .map(([k, v]) => ({
      x: k,
      y: v
    }))
    .sort((a, b) => parseInt(a.x) - parseInt(b.x))
  return (
    <CustomLineChart
      data={[
        {
          id: 'biosphere',
          color: 'green',
          data
        }
      ]}
      axis={{ x: 'biosphere' }}
      colors={['#1e724e']}
    ></CustomLineChart>
  )
}
