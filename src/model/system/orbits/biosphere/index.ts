import { TEMPERATURE } from '../temperature'
import { Orbit } from '../types'
import { BiosphereParams } from './types'

const biospheres: Record<string, string> = {
  '-1': 'remnants',
  '0': 'sterile',
  '1': 'prebiotic chemistry',
  '2': 'simple microbes',
  '3': 'complex microbes',
  '4': 'multicellular beginnings',
  '5': 'small macroscopic life',
  '6': 'large macroscopic life',
  '7': 'complex ecosystems',
  '8': 'social species',
  '9': 'proto-sapience',
  '10': 'full sapience',
  '11': 'bio-engineered life'
}

export const BIOSPHERE = {
  get: (params: BiosphereParams) => {
    const { star, orbit, impactZone, primary } = params
    const { atmosphere, temperature, hydrosphere, type } = orbit
    let modifier = 0
    const base = window.dice.roll(2, 6) - 2
    const adjustments: Orbit['biosphere']['trace'] = [
      {
        value: base, // 2d6 average
        description: 'base roll (2d6-2)'
      }
    ]

    // Atmosphere modifiers
    if (atmosphere.code === 0) {
      modifier -= 6
      adjustments.push({ value: -6, description: 'vacuum' })
    } else if (atmosphere.code === 1) {
      modifier -= 4
      adjustments.push({ value: -4, description: 'trace atmosphere' })
    } else if ([2, 3, 14].includes(atmosphere.code)) {
      modifier -= 3
      adjustments.push({ value: -3, description: 'very thin atmosphere' })
    } else if ([4, 5].includes(atmosphere.code)) {
      modifier -= 2
      adjustments.push({ value: -2, description: 'thin atmosphere' })
    } else if ([8, 9, 13].includes(atmosphere.code)) {
      modifier += 2
      adjustments.push({ value: 2, description: 'dense atmosphere' })
    } else if (atmosphere.code === 10) {
      modifier -= 3
      adjustments.push({ value: -3, description: 'exotic atmosphere' })
    } else if (atmosphere.code === 11) {
      modifier -= 5
      adjustments.push({ value: -5, description: 'hostile atmosphere' })
    } else if (atmosphere.code === 12) {
      modifier -= 6
      adjustments.push({ value: -7, description: 'very hostile atmosphere' })
    } else if (atmosphere.code >= 15) {
      modifier -= 5
      adjustments.push({ value: -5, description: 'unusual or gaseous atmosphere' })
    }

    // Hydrographic modifiers
    if (hydrosphere.code === 0) {
      modifier -= 4
      adjustments.push({ value: -4, description: 'lack of accessible water' })
    } else if (hydrosphere.code >= 1 && hydrosphere.code <= 3) {
      modifier -= 2
      adjustments.push({ value: -2, description: 'desert conditions prevalent' })
    } else if (hydrosphere.code >= 6 && hydrosphere.code <= 8) {
      modifier += 1
      adjustments.push({ value: 1, description: 'ocean-dominated' })
    } else if (hydrosphere.code >= 9 && hydrosphere.code < 12) {
      modifier += 2
      adjustments.push({ value: 2, description: 'no continents' })
    } else if (hydrosphere.code === 13) {
      modifier -= 4
      adjustments.push({ value: -3, description: 'gas giant core' })
    }

    // System age modifiers
    if (star.age < 1) {
      modifier -= 10
      adjustments.push({ value: -10, description: 'system age less than 1 Gyr' })
    } else if (star.age < 2) {
      modifier -= 8
      adjustments.push({ value: -8, description: 'system age less than 2 Gyrs' })
    } else if (star.age < 3) {
      modifier -= 4
      adjustments.push({ value: -4, description: 'system age less than 3 Gyrs' })
    } else if (star.age < 4) {
      modifier -= 2
      adjustments.push({ value: -2, description: 'system age less than 4 Gyrs' })
    }

    // Temperature modifiers
    const climate = TEMPERATURE.describe(temperature.mean)
    if (climate === 'burning') {
      modifier -= 6
      adjustments.push({ value: -6, description: 'burning conditions' })
    } else if (climate === 'temperate') {
      modifier += 2
      adjustments.push({ value: 2, description: 'temperate conditions' })
    } else if (climate === 'cold') {
      modifier -= 2
      adjustments.push({ value: -2, description: 'cold conditions' })
    } else if (climate === 'frozen') {
      modifier -= 6
      adjustments.push({ value: -6, description: 'frozen conditions' })
    }

    if (climate === 'frozen' && hydrosphere.code < 10 && hydrosphere.code > 1) {
      modifier += 2
      adjustments.push({ value: 2, description: 'subsurface oceans' })
    }
    let value = Math.max(0, base + modifier)

    if (value > 10) value = window.dice.roll(2, 6) - 2

    const hostile =
      climate === 'burning' ||
      climate === 'frozen' ||
      atmosphere.code === 11 ||
      atmosphere.code === 12 ||
      atmosphere.code === 0 ||
      atmosphere.code === 1
    if (hostile && value > 5) {
      value = window.dice.roll(2, 4) - 2
    }

    if (star.age < 0.1 || type === 'asteroid belt') value = 0

    const oxygen =
      (atmosphere.code >= 2 && atmosphere.code <= 9) ||
      atmosphere.code === 13 ||
      atmosphere.code === 14
    if (oxygen && primary) value = Math.max(1, value)
    if (oxygen && value <= 0 && window.dice.random <= 0.8) {
      atmosphere.code = 10
      atmosphere.type = 'exotic'
      adjustments.push({ value: 0, description: 'breathable converted to exotic' })
    }

    orbit.biosphere = { code: value, trace: adjustments }

    if ((impactZone || window.dice.random < 0.05) && orbit.biosphere.code > 0) {
      orbit.biosphere.affix = 'remnants'
    } else if (orbit.biosphere.code < 7 && window.dice.random > 0.998) {
      orbit.biosphere.code = window.dice.randint(2, 10)
      orbit.biosphere.trace = [
        {
          value: orbit.biosphere.code,
          description: 'bio-engineered life'
        }
      ]
      orbit.biosphere.affix = 'bio-engineered'
    }
  },
  labels: biospheres
}
