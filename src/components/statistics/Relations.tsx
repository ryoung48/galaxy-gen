import { range } from 'd3'
import { ARRAY } from '../../model/utilities/arrays'
import { CustomChordChart } from './chord'
import { ORBIT } from '../../model/system/orbits'
import { METRICS } from '../maps/legend/metrics'

export const BioRelations = () => {
  const validOrbits = window.galaxy.orbits.filter(orbit => orbit.biosphere > 0)
  const orbitTypes = ARRAY.unique(validOrbits.map(orbit => orbit.type))
  const biospheres = ARRAY.unique(validOrbits.map(orbit => orbit.biosphere)).sort((a, b) => a - b)
  const members = [...orbitTypes, ...biospheres]
  const colors = members.map(() => 'white')
  const data = orbitTypes.reduce(
    (dict: number[][], type, i) => {
      colors[i] = ORBIT.colors.get()[type]
      dict[i] = range(dict.length).map(() => 0)
      validOrbits
        .filter(orbit => orbit.type === type)
        .forEach(orbit => {
          dict[i][orbitTypes.length + orbit.biosphere - 1] += 1
        })
      return dict
    },
    members.map(() => [])
  )
  biospheres.forEach(biosphere => {
    const bioIndex = orbitTypes.length + biosphere - 1
    data[bioIndex] = range(data.length).map(() => 0)
    colors[bioIndex] = METRICS.biosphere.color(biosphere)
    const orbits = validOrbits.filter(orbit => orbit.biosphere === biosphere)
    orbits.forEach(orbit => {
      const index = orbitTypes.findIndex(type => type === orbit.type)
      data[bioIndex][index] += 1
    })
  })
  return (
    <CustomChordChart
      data={data}
      keys={members.map(o => o.toString())}
      colors={colors}
    ></CustomChordChart>
  )
}
