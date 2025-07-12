import { CustomPieChart } from './pie'
import { HYDROSPHERE } from '../../model/system/orbits/hydrosphere'

export const HydrosphereDistribution = () => {
  const hydroFreq = window.galaxy.orbits.reduce((dict: Record<number, number>, orbit) => {
    if (dict[orbit.hydrosphere.code] === undefined) dict[orbit.hydrosphere.code] = 0
    dict[orbit.hydrosphere.code] += 1
    return dict
  }, {})

  const total = Object.values(hydroFreq).reduce((sum, count) => sum + count, 0)

  const getHydrosphereLabel = (level: number): string => {
    if (level === 0) return 'Desert (0%–5%)'
    if (level === 1) return 'Dry (6%–15%)'
    if (level === 2) return 'Arid (16%–25%)'
    if (level === 3) return 'Semi-Arid (26%–35%)'
    if (level === 4) return 'Moderate (36%–45%)'
    if (level === 5) return 'Wet (46%–55%)'
    if (level === 6) return 'Humid (56%–65%)'
    if (level === 7) return 'Continental (66%–75%)'
    if (level === 8) return 'Marine (76%–85%)'
    if (level === 9) return 'Aquatic (86%–95%)'
    if (level === 10) return 'Oceanic (96%–100%)'
    if (level === 11) return 'Superdense (incredibly deep world oceans)'
    if (level === 12) return 'Intense volcanism (molten surface)'
    if (level === 13) return 'Gas giant core'
    return `Level ${level}`
  }

  const data = Object.entries(hydroFreq)
    .map(([level, count], index) => ({
      id: getHydrosphereLabel(parseInt(level)),
      label: getHydrosphereLabel(parseInt(level)),
      value: count,
      color: HYDROSPHERE.color[index % HYDROSPHERE.color.length]
    }))
    .sort((a, b) => parseInt(a.id.split('-')[1]) - parseInt(b.id.split('-')[1]))

  return <CustomPieChart data={data} total={total} />
}
