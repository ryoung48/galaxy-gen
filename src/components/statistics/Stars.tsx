import { Star } from '../../model/system/stars/types'
import { STAR } from '../../model/system/stars'
import { CustomPieChart } from './pie'

export const StarFrequency = () => {
  const total = window.galaxy.systems.length
  const starFreq = window.galaxy.systems.reduce(
    (dict: Partial<Record<Star['class'], number>>, system) => {
      if (!dict[system.star.class]) dict[system.star.class] = 0
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      dict[system.star.class] += 1
      return dict
    },
    {}
  )
  const data = Object.entries(starFreq)
    .map(([k, v]) => ({
      id: k,
      label: k,
      value: v,
      color: STAR.classes[k as Star['class']].color
    }))
    .sort((a, b) => b.value - a.value)
  return <CustomPieChart data={data} total={total}></CustomPieChart>
}
