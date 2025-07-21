import { GALAXY } from '../../model/galaxy'
import { SOLAR_SYSTEM } from '../../model/system'
import { Orbit } from '../../model/system/orbits/types'
import { ORBITAL_DEPOSITS } from '../../model/system/resources'
import { Star } from '../../model/system/stars/types'
import { CustomPieChart } from './pie'

export const ResourceDistribution = () => {
  const worlds = GALAXY.worlds()

  // Aggregate all resources from all orbits across all systems
  const resourceFreq = worlds.reduce(
    (dict: Record<string, { color: string; count: number; label: string }>, system) => {
      // Collect resources from all orbits in this system
      const collectResources = (orbits: (Star | Orbit)[]) => {
        orbits.forEach(orbit => {
          if (orbit.resources) {
            orbit.resources.forEach(resource => {
              const resourceType = resource.type
              if (!dict[resourceType]) {
                dict[resourceType] = {
                  count: 0,
                  color: ORBITAL_DEPOSITS.deposits[resourceType]?.color || '#666666',
                  label: resourceType
                }
              }
              dict[resourceType].count += resource.amount
            })
          }
          // Recursively collect from moons
          if (orbit.orbits && orbit.orbits.length > 0) {
            collectResources(orbit.orbits)
          }
        })
      }

      // Start with star resources
      if (system.star.resources) {
        system.star.resources.forEach(resource => {
          const resourceType = resource.type
          if (!dict[resourceType]) {
            dict[resourceType] = {
              count: 0,
              color: ORBITAL_DEPOSITS.deposits[resourceType]?.color || '#666666',
              label: resourceType
            }
          }
          dict[resourceType].count += resource.amount
        })
      }

      // Collect from all orbits (star and its orbits)
      const allOrbits = SOLAR_SYSTEM.orbits(system)
      collectResources(allOrbits)

      return dict
    },
    {}
  )

  const data = Object.values(resourceFreq)
    .map(({ label, count, color }) => ({
      id: label,
      label,
      value: count,
      color
    }))
    .sort((a, b) => b.value - a.value) // Sort by value descending

  const total = data.reduce((sum, item) => sum + item.value, 0)

  return <CustomPieChart data={data} total={total}></CustomPieChart>
}
