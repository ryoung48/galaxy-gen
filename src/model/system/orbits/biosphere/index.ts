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

    if (atmosphere.hazard === 'low oxygen') {
      modifier -= 1
      adjustments.push({ value: -1, description: 'low oxygen' })
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

    if (value > 10)  {
      const collapse = window.dice.randint(0, 8)
      const mod = value - collapse
      value = collapse
      adjustments.push({ value: -mod, description: 'rare sapience' })
    }

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

    const oxygenHazard = atmosphere.hazard === 'low oxygen' || atmosphere.hazard === 'high oxygen'

    if (value <= 0 && atmosphere.hazard === 'biologic') {
      const change =  1 - value
      value = 1
      adjustments.push({ value: change, description: 'biologic hazard' })
    } else if (value <= 0 && (oxygenHazard)) {
      const change =  1 - value
      value = 1
      adjustments.push({ value: change, description: 'oxygen hazard' })
    }

    const oxygen =
      (atmosphere.code >= 2 && atmosphere.code <= 9) ||
      atmosphere.code === 13 ||
      atmosphere.code === 14
    if (oxygen && primary) value = Math.max(1, value)
    let converted = false
    if (oxygen && value <= 0 && window.dice.random <= 0.8) {
      converted = true
      atmosphere.code = 10
      atmosphere.type = 'exotic'
      adjustments.push({ value: 0, description: 'breathable converted to exotic' })
    }

    if (!(atmosphere.code >= 2 && atmosphere.code <= 9) && value >= 9) {
      const collapse = window.dice.randint(2, 8)
      const mod = value - collapse
      value = collapse
      adjustments.push({ value: -mod, description: 'biosphere collapse' })
    }

    if (value >= 10 && window.dice.random > 0.8) {
      const collapse = window.dice.randint(2, 8)
      const mod = value - collapse
      value = collapse
      adjustments.push({ value: -mod, description: 'rare sapience' })
    }

    orbit.biosphere = { code: value, trace: adjustments }

    if ((impactZone || window.dice.random < 0.05) && orbit.biosphere.code > 0) {
      orbit.biosphere.label = 'remnants'
    } else if (orbit.biosphere.code < 7 && window.dice.random > 0.998) {
      orbit.biosphere.code = window.dice.randint(2, 8)
      orbit.biosphere.trace = [
        {
          value: orbit.biosphere.code,
          description: 'bio-engineered life'
        }
      ]
      orbit.biosphere.label = 'engineered'
    } else if (orbit.biosphere.code > 0) {
      const simple = orbit.biosphere.code <= 5
      orbit.biosphere.label = window.dice.weightedChoice([
        { w: oxygen && !converted ? (simple ? 2 : 1) : 0, v: 'miscible' },
        { w: oxygen && !converted ? (simple ? 1 : 2) : 0, v: 'hybrid' },
        { w: 2, v: 'immiscible' }
      ])
    }
  },
  biomass: (params: BiosphereParams) => {
    const { star, orbit, primary } = params
    const { atmosphere, hydrosphere, temperature } = orbit

    // Trace the calculation like your biosphere function
    const trace: Orbit['biosphere']['trace'] = []

    // If system too young or clearly not a world with surfaces (asteroid belt), no native life.
    if (star.age <= 0.1) {
      orbit.biosphere.mass = {
        code: 0,
        trace: []
      }
      return
    }

    // Base roll (2D6)
    const base = window.dice.roll(2, 6) // do NOT subtract 2; RAW: Biomass Rating = 2D + DMs
    trace.push({ value: base, description: 'base roll (2d6)' })

    // Collect DMs before capping
    let dm = 0

    // Atmosphere DMs
    // 0:-6 | 1:-4 | 2,3,14(E):-3 | 4,5:-2 | 8,9,13(D):+2 | 10(A):-3 | 11(B):-5 | 12(C):-7 | 15+(F+):-5
    const a = atmosphere.code
    const pushDM = (delta: number, description: string) => {
      dm += delta
      trace.push({ value: delta, description })
    }

    if (a === 0) pushDM(-6, 'vacuum')
    else if (a === 1) pushDM(-4, 'trace atmosphere')
    else if (a === 2 || a === 3 || a === 14) pushDM(-3, 'very thin atmosphere')
    else if (a === 4 || a === 5) pushDM(-2, 'thin atmosphere')
    else if (a === 8 || a === 9 || a === 13) pushDM(+2, 'dense atmosphere')
    else if (a === 10) pushDM(-3, 'exotic atmosphere')
    else if (a === 11) pushDM(-5, 'hostile atmosphere')
    else if (a === 12) pushDM(-7, 'very hostile atmosphere')
    else if (a >= 15) pushDM(-5, 'unusual or gaseous atmosphere')

    // hydro DMs
    // 0:-4 | 1–3:-2 | 6–8:+1 | 9+:+2
    const h = hydrosphere.code
    if (h === 0) pushDM(-4, 'lack of accessible water')
    else if (h >= 1 && h <= 3) pushDM(-2, 'desert conditions prevalent')
    else if (h >= 6 && h <= 8) pushDM(+1, 'ocean-dominated')
    else if (h >= 9) pushDM(+2, 'no continents')

    // System age DMs
    // <0.2:-6 | <1:-2 | >4:+1  (Note: we already early-returned for ≤0.1 Gyr)
    if (star.age < 0.2) pushDM(-6, 'system age < 0.2 Gyrs')
    else if (star.age < 1) pushDM(-2, 'system age < 1 Gyr')
    else if (star.age > 4) pushDM(+1, 'system age > 4 Gyrs')

    // Temperature DMs
    const mean = temperature?.mean
    const climate = TEMPERATURE.describe(mean) // keeps parity with your biosphere code
    if (climate === 'temperate') pushDM(+2, 'temperate conditions')
    else if (climate === 'cold') pushDM(-2, 'cold conditions')
    else if (climate === 'burning') pushDM(-6, 'burning conditions')
    else if (climate === 'frozen') pushDM(-6, 'frozen conditions')

    // Cap combined DMs to the RAW limits: max +4, min -12
    const rawDM = dm
    const cappedDM = Math.max(-12, Math.min(+4, rawDM))
    if (cappedDM !== rawDM) {
      dm = cappedDM
    }

    // Final rating: RAW allows negatives; we clamp to 0+ so "no biomass" is 0
    let rating = Math.max(0, base + dm)

    const oxygen =
      (atmosphere.code >= 2 && atmosphere.code <= 9) ||
      atmosphere.code === 13 ||
      atmosphere.code === 14
    if (oxygen && primary) rating = Math.max(1, rating)
    if (oxygen && rating <= 0 && window.dice.random <= 0.8) {
      atmosphere.code = 10
      atmosphere.type = 'exotic'
      trace.push({ value: 0, description: 'breathable converted to exotic' })
    }

    // === Special Case 2: extreme atmospheres support exotic life ===
    if ((rating >= 1 && [0, 1, 10, 11, 12].includes(atmosphere.code)) || atmosphere.code >= 15) {
      // Determine the same DM that was applied earlier for this atmosphere
      let atmDM = 0
      switch (true) {
        case atmosphere.code === 0:
          atmDM = -6
          break
        case atmosphere.code === 1:
          atmDM = -4
          break
        case atmosphere.code === 10:
          atmDM = -3
          break // A
        case atmosphere.code === 11:
          atmDM = -5
          break // B
        case atmosphere.code === 12:
          atmDM = -7
          break // C
        case atmosphere.code >= 15:
          atmDM = -5
          break // F+
      }

      const bonus = Math.abs(atmDM) - 1
      rating += bonus
      trace.push({
        value: bonus,
        description: `exotic biosphere`
      })
    }

    // Store in orbit (mirroring your biosphere structure)
    orbit.biosphere.mass = {
      code: rating,
      trace
    }
  },
  complexity: (params: BiosphereParams) => {
    const { star, orbit } = params
    const { atmosphere } = orbit

    // Ensure we have a biomass code first (expects your BIOMASS.get() to have run)
    const biomass = orbit.biosphere.mass?.code ?? 0

    // Trace structure mirrors your biosphere/biomass calculators
    const trace: Orbit['biosphere']['trace'] = []

    // If no biomass, biocomplexity is zero.
    if (!biomass || biomass <= 0) {
      orbit.biosphere.complexity = { code: 0, trace: [] }
      return
    }

    // Base roll: 2D - 7
    const base = window.dice.roll(2, 6) - 7
    trace.push({ value: base, description: 'base roll' })

    // Biomass contribution, capped at 9
    const biomassForRoll = Math.min(biomass, 9)
    trace.push({ value: biomassForRoll, description: `biomass` })

    // Accumulate DMs
    let dm = 0
    const pushDM = (delta: number, description: string) => {
      dm += delta
      trace.push({ value: delta, description })
    }

    // Atmosphere not 4–9 ⇒ DM-2
    const a = atmosphere?.code
    if (typeof a === 'number' && !(a >= 4 && a <= 9)) {
      pushDM(-2, 'non-breathable atmosphere')
    }

    // System age DMs (use worst DM at exact boundaries)
    const age = star.age // Gyr
    if (age <= 1) pushDM(-10, 'system age ≤ 1 Gyr')
    else if (age <= 2) pushDM(-8, 'system age ≤ 2 Gyrs')
    else if (age <= 3) pushDM(-4, 'system age ≤ 3 Gyrs')
    else if (age <= 4) pushDM(-2, 'system age ≤ 4 Gyrs')

    // Final score
    let rating = base + biomassForRoll + dm

    // If biomass > 0, results less than 1 become 1
    rating = Math.min(10, Math.max(1, rating))

    if (rating >= 10 && window.dice.random > 0.4) {
      rating -= window.dice.roll(1, 8)
    }

    orbit.biosphere.complexity = {
      code: rating,
      trace
    }
  },
  diversity: (params: BiosphereParams) => {
    const { orbit } = params
    const complexity = orbit.biosphere?.code ?? 0
    orbit.biosphere.diversity = Math.max(Math.ceil(window.dice.roll(2, 6) - 7 + complexity), 1)
    if (complexity < 1) orbit.biosphere.diversity = 0
  },
  compatibility: (params: BiosphereParams) => {
    const { star, orbit } = params
    const { atmosphere } = orbit
    const complexity = orbit.biosphere.code ?? 0

    const trace: Orbit['biosphere']['trace'] = []

    // No native biomass → compatibility 0
    if (complexity <= 0) {
      // orbit.biosphere.compatibility = { code: 0, trace: [], tag: 'immiscible' }
      return
    }

    // Base: 2D6
    const base = window.dice.roll(2, 6)
    trace.push({ value: base, description: 'base roll (2d6)' })

    // Subtract (Biocomplexity)/2
    const combo = Math.floor(complexity / 2)
    trace.push({ value: -combo, description: 'complexity' })

    // Accumulate DMs
    let dm = 0
    const pushDM = (delta: number, description: string) => {
      dm += delta
      trace.push({ value: delta, description })
    }

    // Atmosphere coding helpers (Traveller hex bands)
    const a = atmosphere?.code
    const is = (...codes: number[]) => codes.includes(a as number)

    // Atmosphere DMs
    // Map hex letters: A=10, B=11, C=12, D=13, E=14, F=15, G=16, H=17
    if (is(0, 1, 11, 16, 17)) {
      pushDM(-8, 'very hostile atmosphere')
    } else if (is(3, 5, 8)) {
      pushDM(+1, 'breathable atmosphere')
    } else if (is(6)) {
      pushDM(+2, 'breathable atmosphere')
    } else if (is(10, 15)) {
      pushDM(-6, 'hostile atmosphere')
    } else if (is(12)) {
      pushDM(-10, 'insidious atmosphere')
    } else if (is(13, 14)) {
      pushDM(-1, 'high density atmosphere')
    } else if (is(2, 4, 7, 9)) {
      pushDM(-2, 'tainted atmosphere')
    }

    // System age > 8 Gyr ⇒ DM-2
    if (star.age > 8) pushDM(-2, 'system age > 8 Gyrs')

    // Final: floor( base - combo + dm ), then clamp to 0
    const raw = base - combo + dm
    const floored = Math.floor(raw)

    const rating = Math.max(0, floored)
    return rating

    // orbit.biosphere.compatibility = {
    //   code: rating,
    //   trace,
    //   tag: rating > 5 ? 'miscible' : rating > 0 ? 'hybrid' : 'immiscible'
    // }
  },
  labels: biospheres
}
