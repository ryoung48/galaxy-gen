import CustomLineChart from './line'

export const BiosphereDistribution = () => {
  const bioFreq = window.galaxy.orbits
    .filter(orbit => orbit.biosphere.complexity > 0)
    .reduce((dict: Record<number, number>, orbit) => {
      if (!dict[orbit.biosphere.complexity]) dict[orbit.biosphere.complexity] = 0
      dict[orbit.biosphere.complexity] += 1
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
