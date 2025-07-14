import { GALAXY } from '../../model/galaxy'
import { STAR } from '../../model/system/stars'
import { CustomPieChart } from './pie'

export const StarFrequency = () => {
  const worlds = GALAXY.worlds()
  const total = worlds.length
  const starFreq = worlds.reduce(
    (dict: Record<string, { color: string; count: number; label: string }>, system) => {
      const code = system.star.type
      if (!dict[code]) dict[code] = { count: 0, color: STAR.classes[code].color, label: code }
      dict[code].count += 1
      return dict
    },
    {}
  )
  const data = Object.values(starFreq)
    .map(({ label, count, color }) => ({
      id: label,
      label,
      value: count,
      color
    }))
    .sort((a, b) => b.label.localeCompare(a.label))
  return <CustomPieChart data={data} total={total}></CustomPieChart>
}
