import { BiosphereParams } from './types'

const biospheres: Record<string, string> = {
  '-1': 'Remnants',
  '0': 'Sterile',
  '1': 'Building Blocks (amino acids, or equivalent)',
  '2': 'Single-celled organisms',
  '3': 'Producers (atmosphere begins to transform)',
  '4': 'Multi-cellular organisms',
  '5': 'Complex single-celled life',
  '6': 'Complex multi-cellular life',
  '7': 'Small macroscopic life',
  '8': 'Large macroscopic life',
  '9': 'Simple global ecology',
  '10': 'Complex global ecology',
  '11': 'Proto-sapience',
  '12': 'Full sapience',
  '13': 'Engineered'
}

export const BIOSPHERE = {
  get: (params: BiosphereParams) => {
    const { chemistry, star, type, atmosphere, size, temperature, hydrosphere } = params
    let modifier = 0
    if (chemistry === 'ammonia') modifier += 1
    else if (chemistry === 'methane') modifier += 3

    let complexity = 0
    if (type === 'geo-cyclic') {
      complexity =
        star.age >= 4 + modifier && atmosphere.code === 10
          ? window.dice.roll(1, 6) + size - 2
          : star.age >= window.dice.roll(1, 3) + modifier
          ? atmosphere.code === 10
            ? window.dice.roll(1, 3)
            : window.dice.roll(1, 6) - 4
          : 0
    } else if (type === 'snowball') {
      const subsurface = hydrosphere < 10
      complexity =
        subsurface && star.age >= 6 + modifier
          ? window.dice.roll(1, 6) + size - 2
          : subsurface && star.age >= window.dice.roll(1, 6)
          ? window.dice.roll(1, 6) - 3
          : 0
    } else {
      complexity =
        star.age >= 4 + modifier
          ? window.dice.roll(2, 6)
          : star.age >= window.dice.roll(1, 3) + modifier
          ? window.dice.roll(1, 3)
          : 0
    }
    if (type !== 'snowball') {
      // temperature
      if (temperature.high > 353) complexity -= 2
      if (temperature.low < 273) complexity -= 4
      if (temperature.mean > 353) complexity -= 4
      if (temperature.mean < 273) complexity -= 2
      if (temperature.mean > 279 && temperature.mean < 303) complexity += 2
    }

    // hydrosphere
    if (hydrosphere <= 3) complexity -= 1
    else if (hydrosphere >= 6 && hydrosphere <= 10) complexity += 1

    if (atmosphere.hazard === 'low oxygen') complexity -= 2
    complexity = Math.max(atmosphere.hazard === 'biologic' ? 1 : 0, complexity)

    if (type !== 'snowball' && type !== 'geo-cyclic') {
      if (complexity > 0 && window.dice.random > 0.8 && complexity < 7)
        complexity += window.dice.randint(1, 5)
    }

    if (complexity === 13) complexity = 12
    else if (complexity >= 14) complexity = 13

    return complexity
  },
  labels: biospheres
}
