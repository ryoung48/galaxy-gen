import { TEXT } from '../../../utilities/text'
import { Star } from '../../stars/types'

const geo = [
  { code: 0, dist: 'Extremely Dispersed', description: 'many minor {bodies} and {small}' },
  { code: 1, dist: 'Very Dispersed', description: 'mostly minor {bodies}, ~5–10% major {bodies}' },
  { code: 2, dist: 'Dispersed', description: 'mostly minor {bodies}, ~10–20% major {bodies}' },
  { code: 3, dist: 'Scattered', description: '~20–30% major {bodies}' },
  { code: 4, dist: 'Slightly Scattered', description: '~30–40% major {bodies}' },
  { code: 5, dist: 'Mixed', description: '~40–60% major {bodies}' },
  { code: 6, dist: 'Slightly Skewed', description: '~60–70% major {bodies}' },
  { code: 7, dist: 'Skewed', description: '~70–80% major {bodies}' },
  { code: 8, dist: 'Concentrated', description: '~80–90% major {bodies}' },
  { code: 9, dist: 'Very Concentrated', description: 'single large major {body} (~90–95%)' },
  { code: 10, dist: 'Extremely Concentrated', description: 'single dominant major {body} (≥95%)' }
]

export const HYDROSPHERE = {
  color: [
    '#d2b48c',
    '#c4a373',
    '#b6925a',
    '#a88141',
    '#9a7028',
    '#8c5f0f',
    '#7e6e3c',
    '#707d69',
    '#628c96',
    '#549bc3',
    '#46aaf0',
    '#5e7af8',
    '#ff625d',
    '#f290ff'
  ],
  labels: [
    { code: 0, range: '≤5%', description: 'arid, barren' },
    { code: 1, range: '≤15%', description: 'dry, small seas' },
    { code: 2, range: '≤25%', description: 'semi-arid, small oceans' },
    { code: 3, range: '≤35%', description: 'moderate oceans' },
    { code: 4, range: '≤45%', description: 'large oceans' },
    { code: 5, range: '≤55%', description: 'equal land/oceans' },
    { code: 6, range: '≤65%', description: 'ocean-dominated' },
    { code: 7, range: '≤75%', description: 'mostly oceanic' },
    { code: 8, range: '≤85%', description: 'ocean world' },
    { code: 9, range: '≤95%', description: 'no continents' },
    { code: 10, range: '≤100%', description: 'total coverage' },
    { code: 11, description: 'Superdense (incredibly deep world oceans)' },
    { code: 12, description: 'Intense volcanism (molten surface)' },
    { code: 13, description: 'Gas giant core' }
  ],
  geography: (hydro: number, code: number) => {
    const base = hydro > 5 ? 'ocean' : hydro < 5 ? 'land' : window.dice.choice(['land', 'ocean'])
    const entry = geo.find(g => g.code === code)!
    // substitution terms
    const terms =
      base === 'ocean'
        ? { bodies: 'continents', body: 'continent', small: 'islands', world: 'world ocean' }
        : { bodies: 'oceans', body: 'ocean', small: 'seas', world: 'world continent' }

    // replace placeholders
    const desc = entry.description
      .replace(/\{bodies\}/g, terms.bodies)
      .replace(/\{body\}/g, terms.body)
      .replace(/\{small\}/g, terms.small)

    return `${TEXT.capitalize(terms.world)}, ${desc}`
  },
  proto: (star: Star, size: number, hydrosphere: number) => {
    if (size < 2) return hydrosphere
    const magma = (size - 2) ** 2 + 2
    if (star.age * 1000 < magma) return 12
    return hydrosphere
  }
}
