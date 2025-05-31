import { SOLAR_SYSTEM } from '../../model/system'
import { CustomPieChart } from './pie'
import { METRICS } from '../maps/legend/metrics'

export const HabitabilityDistribution = () => {
  const getHabitabilityCategory = (rating: number): string => {
    if (rating <= -8) return 'Lethal (-8)'
    if (rating <= -5) return 'Deadly (-5)'
    if (rating <= -2) return 'Hazardous (-2)'
    if (rating <= 0) return 'Hostile (0)'
    if (rating <= 2) return 'Barely Habitable (2)'
    if (rating <= 4) return 'Marginally Survivable (4)'
    if (rating <= 6) return 'Regionally Habitable (6)'
    if (rating <= 8) return 'Suitable (8)'
    return 'Garden World (10)'
  }

  const getHabitabilityColor = (rating: number): string => {
    // Remap from current scale to -10 to 10 scale for METRICS function
    const remapped = Math.max(-10, Math.min(10, rating))
    return METRICS.habitability.color(remapped)
  }
  // Get max habitability for each system
  const systemMaxHab = window.galaxy.systems.reduce((dict: Record<number, number>, system) => {
    const orbits = SOLAR_SYSTEM.orbits(system)
    const maxHab =
      orbits.length > 0
        ? Math.max(...orbits.map(orbit => (orbit.tag === 'star' ? -10 : orbit.habitability)))
        : -10 // Systems with no habitable orbits get very low score
    dict[system.idx] = maxHab
    return dict
  }, {})

  const habitFreq = Object.values(systemMaxHab).reduce((dict: Record<string, number>, maxHab) => {
    const category = getHabitabilityCategory(maxHab)
    if (!dict[category]) dict[category] = 0
    dict[category] += 1
    return dict
  }, {})

  const total = Object.values(habitFreq).reduce((sum, count) => sum + count, 0)

  const categories = [
    'Lethal (-8)',
    'Deadly (-5)',
    'Hazardous (-2)',
    'Hostile (0)',
    'Barely Habitable (2)',
    'Marginally Survivable (4)',
    'Regionally Habitable (6)',
    'Suitable (8)',
    'Garden World (10)'
  ]

  const data = categories
    .filter(category => habitFreq[category] > 0)
    .map(category => {
      // Get a representative rating for color mapping
      const rating =
        category === 'Lethal (-8)'
          ? -9
          : category === 'Deadly (-5)'
          ? -6
          : category === 'Hazardous (-2)'
          ? -3
          : category === 'Hostile (0)'
          ? -1
          : category === 'Barely Habitable (2)'
          ? 1
          : category === 'Marginally Survivable (4)'
          ? 3
          : category === 'Regionally Habitable (6)'
          ? 6
          : category === 'Suitable (8)'
          ? 8
          : 10

      return {
        id: category,
        label: category,
        value: habitFreq[category],
        color: getHabitabilityColor(rating)
      }
    })

  return <CustomPieChart data={data} total={total} />
}
