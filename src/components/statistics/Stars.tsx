import { GALAXY } from '../../model/galaxy'
import { SOLAR_SYSTEM } from '../../model/system'
import { STAR } from '../../model/system/stars'
import { CustomPieChart } from './pie'

export const StarFrequency = () => {
  const worlds = GALAXY.worlds()
  const total = worlds.length
  const starFreq = worlds.reduce(
    (dict: Record<string, { color: string; count: number; label: string }>, system) => {
      SOLAR_SYSTEM.orbits(system)
        .filter(orbit => orbit.tag === 'star')
        .forEach(star => {
          const { spectralClass, luminosityClass } = star
          const brownDwarf = STAR.isBrownDwarf(star)
          const postStellar = star.postStellar
          const code = `${spectralClass}${brownDwarf || postStellar ? '' : `-${luminosityClass}`}`
          if (!dict[code])
            dict[code] = { count: 0, color: STAR.classes[spectralClass].color, label: code }
          dict[code].count += 1
        })
      return dict
    },
    {}
  )
  const special = ['L', 'T', 'Y', 'D', 'NS', 'BH']
  const data = Object.values(starFreq)
    .map(({ label, count, color }) => ({
      id: label,
      label,
      value: count,
      color
    }))
    .sort((a, b) => {
      // Extract spectral class from label (handle multi-character classes like BH, NS)
      const aClass = a.label.startsWith('BH')
        ? 'BH'
        : a.label.startsWith('NS')
        ? 'NS'
        : a.label.charAt(0)
      const bClass = b.label.startsWith('BH')
        ? 'BH'
        : b.label.startsWith('NS')
        ? 'NS'
        : b.label.charAt(0)

      // Check if either is a special star
      const aSpecial = special.includes(aClass)
      const bSpecial = special.includes(bClass)

      // Check if either is an O star
      const aIsOStar = aClass === 'O'
      const bIsOStar = bClass === 'O'

      // If both are O stars, sort normally
      if (aIsOStar && bIsOStar) {
        return a.label.localeCompare(b.label)
      }

      // Put O stars at the beginning
      if (aIsOStar) return -1
      if (bIsOStar) return 1

      // If both are special stars, sort by their order in the special array
      if (aSpecial && bSpecial) {
        const aIndex = special.indexOf(aClass)
        const bIndex = special.indexOf(bClass)
        return aIndex - bIndex
      }

      // If both are regular stars (non-O, non-special), sort normally
      if (!aSpecial && !bSpecial) {
        return a.label.localeCompare(b.label)
      }

      // Put special stars at the end
      return aSpecial ? 1 : -1
    })
  return <CustomPieChart data={data} total={total}></CustomPieChart>
}
