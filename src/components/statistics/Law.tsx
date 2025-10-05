import { interpolateRdPu, range } from 'd3'
import { CustomPieChart } from './pie'

const getLawBucket = (law: number) => {
  if (law <= 0) return 0
  if (law === 1) return 1
  if (law <= 4) return 4
  if (law <= 7) return 7
  if (law <= 9) return 9
  if (law <= 12) return 12
  if (law <= 15) return 15
  if (law <= 18) return 18
  return 20
}

const getLawLabel = (bucket: number): string => {
  if (bucket === 0) return 'No Restrictions (0)'
  if (bucket === 1) return 'Minimal Controls (1)'
  if (bucket === 4) return 'Light Restrictions (2-4)'
  if (bucket === 7) return 'Heavy Restrictions (5-7)'
  if (bucket === 9) return 'Significant Restrictions (8-9)'
  if (bucket === 12) return 'High Surveillance (10-12)'
  if (bucket === 15) return 'Authoritarian Control (13-15)'
  if (bucket === 18) return 'Near-Total Control (16-18)'
  if (bucket === 20) return 'Total Suppression (19+)'
  return `Law Level ${bucket}`
}

export const LawDistribution = () => {
  const lawFreq = window.galaxy.orbits
    .filter(orbit => orbit.law !== undefined && orbit.population && orbit.population.code > 0)
    .reduce((dict: Record<string, number>, orbit) => {
      const bucket = getLawBucket(orbit.law!).toString()
      if (!dict[bucket]) dict[bucket] = 0
      dict[bucket] += 1
      return dict
    }, {})

  const total = Object.values(lawFreq).reduce((sum, count) => sum + count, 0)

  const colors = range(0, 21).map(i => interpolateRdPu(i / 15))

  const sortedBuckets = Object.keys(lawFreq)
    .map(bucket => parseInt(bucket, 10))
    .sort((a, b) => a - b)

  const data = sortedBuckets.map(bucket => ({
    id: getLawLabel(bucket),
    label: getLawLabel(bucket),
    value: lawFreq[bucket.toString()],
    color: colors[bucket]
  }))

  return <CustomPieChart data={data} total={total} />
}
