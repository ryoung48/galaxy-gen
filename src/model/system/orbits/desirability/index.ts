import { TEMPERATURE } from '../temperature'
import { Orbit } from '../types'
import { HabitabilityParams } from './types'

export const DESIRABILITY = {
  get: (orbit: Orbit) => orbit.habitability.score > 0 ? orbit.habitability.score : orbit.resources.score * 0.1,
  habitability: ({ orbit }: HabitabilityParams) => {
    const { size, atmosphere, temperature, gravity } = orbit
    const hydrosphere = orbit.hydrosphere.code
    let habitability = 10
    const adjustments: Orbit['habitability']['trace'] = [
      { value: 10, description: 'base habitability' }
    ]

    const locked = orbit.lock?.type === 'star'

    // limited surface area
    if (size <= 4 && hydrosphere < 12) {
      habitability -= 1
      adjustments.push({ value: -1, description: 'limited surface area' })
    }
    // additional surface area
    else if (size >= 9 && hydrosphere < 12) {
      habitability += 1
      adjustments.push({ value: 1, description: 'additional surface area' })
    }

    // very hostile atmosphere
    if (atmosphere.code === 12 || atmosphere.type === 'gas') {
      habitability -= 12
      adjustments.push({ value: -12, description: 'very hostile atmosphere' })
    }
    // hostile atmosphere
    else if (atmosphere.code === 11 || atmosphere.unusual) {
      habitability -= 10
      adjustments.push({ value: -10, description: 'hostile atmosphere' })
    }
    // non-breathable atmosphere
    else if ([0, 1, 10].includes(atmosphere.code)) {
      habitability -= 8
      adjustments.push({ value: -8, description: 'non-breathable atmosphere' })
    }
    // tainted very thin or thin ,low atmosphere
    else if (atmosphere.code === 2 || atmosphere.code === 14) {
      habitability -= 4
      adjustments.push({
        value: -4,
        description: 'tainted very thin or thin, low atmosphere'
      })
    }
    // very thin or very dense atmosphere
    else if (atmosphere.code === 3 || atmosphere.code === 13) {
      habitability -= 3
      adjustments.push({ value: -3, description: 'very thin or very dense atmosphere' })
    }
    // tainted thin or dense atmosphere
    else if (atmosphere.code === 4 || atmosphere.code === 9) {
      habitability -= 2
      adjustments.push({ value: -2, description: 'tainted thin or dense atmosphere' })
    }
    // thin, tainted (standard), dense atmospheres
    else if ([5, 7, 8].includes(atmosphere.code)) {
      habitability -= 1
      adjustments.push({ value: -1, description: 'thin, tainted (standard), dense atmospheres' })
    }

    // lack of accessible water
    if (hydrosphere === 0) {
      habitability -= 4
      adjustments.push({ value: -4, description: 'lack of accessible water' })
    }
    // desert conditions prevalent
    else if (hydrosphere <= 3) {
      habitability -= 2
      adjustments.push({ value: -2, description: 'desert conditions prevalent' })
    }
    // little usable land surface area
    else if (hydrosphere === 9) {
      habitability -= 1
      adjustments.push({ value: -1, description: 'little usable land surface area' })
    }
    // very little usable land surface area
    else if (hydrosphere === 10 || hydrosphere === 11) {
      habitability -= 2
      adjustments.push({ value: -2, description: 'very little usable land surface area' })
    }

    const climate = TEMPERATURE.describe(temperature.mean)

    // molten seas
    if (hydrosphere === 12) {
      habitability -= 12
      adjustments.push({ value: -12, description: 'molten surface' })
    }
    // gas giant core
    else if (hydrosphere === 13) {
      habitability -= 10
      adjustments.push({ value: -10, description: 'gas giant core' })
    }
    // scorching hot most of the time
    else if (climate === 'burning') {
      habitability -= 4
      adjustments.push({ value: -6, description: 'burning conditions' })
    }
    // too hot most of the time
    else if (climate === 'hot') {
      habitability -= 2
      adjustments.push({ value: -2, description: 'hot conditions' })
    }
    // too cold most of the time
    else if (climate === 'cold') {
      habitability -= 2
      adjustments.push({ value: -2, description: 'cold conditions' })
    }
    // frozen most of the time
    else if (climate === 'frozen') {
      habitability -= 4
      adjustments.push({ value: -6, description: 'frozen conditions' })
    }
    // temperature swings
    const variability = Math.min(Math.floor((temperature.high - temperature.low) / 60), 2)
    if (variability > 0 && atmosphere.code > 1 && !locked) {
      habitability -= variability
      adjustments.push({ value: -variability, description: 'variable conditions' })
    }

    // unhealthy low gravity levels
    if (gravity <= 0.2) {
      habitability -= 4
      adjustments.push({ value: -4, description: 'unhealthy low gravity levels' })
    }
    // very low gravity
    else if (gravity <= 0.4) {
      habitability -= 2
      adjustments.push({ value: -2, description: 'very low gravity' })
    }
    // low gravity
    else if (gravity <= 0.7) {
      habitability -= 1
      adjustments.push({ value: -1, description: 'low gravity' })
    }
    // comfortable gravity
    else if (gravity <= 0.9) {
      habitability += 1
      adjustments.push({ value: 1, description: 'comfortable gravity' })
    }
    // standard gravity
    else if (gravity <= 1.1) {
      habitability += 0
    }
    // somewhat high gravity
    else if (gravity <= 1.4) {
      habitability -= 1
      adjustments.push({ value: -1, description: 'somewhat high gravity' })
    }
    // uncomfortable high gravity
    else if (gravity <= 2) {
      habitability -= 2
      adjustments.push({ value: -2, description: 'uncomfortable high gravity' })
    }
    // gravity to high for acclimation
    else {
      habitability -= 6
      adjustments.push({ value: -6, description: 'gravity to high for acclimation' })
    }

    // solar tidally locke
    if (locked) {
      habitability -= 2
      adjustments.push({ value: -2, description: 'solar tidal lock' })
    }

    // seismic activity
    const seismic = Math.min(Math.floor(orbit.seismology.total / 100), 5)
    if (seismic > 0) {
      habitability -= seismic
      adjustments.push({ value: -seismic, description: 'seismic activity' })
    }
    const tides = Math.min(Math.floor(orbit.seismology.tides.stress / 5), 2)
    if (tides > 0) {
      habitability -= tides
      adjustments.push({ value: -tides, description: 'extreme tides' })
    }

    orbit.habitability = { score: habitability, trace: adjustments }
  },
  resources: (
    orbit: Orbit,
    parent?: Orbit
  ): { score: number; trace: { value: number; description: string }[] } => {
    const trace: { value: number; description: string }[] = []


    // Asteroid in belt
    if (parent?.type === 'asteroid belt') {
      const roll = window.dice.roll(2, 4)
      return {
        score: roll,
        trace: [{ value: roll, description: 'asteroid roll (2d4)' }]
      }
    }

    // Base calculation: 2d6 - 7 + size (capped at 15)
    const baseRoll = window.dice.roll(2, 6) - 7
    const sizeValue = Math.min(orbit.size, 15)
    let roll = baseRoll + sizeValue

    trace.push({ value: baseRoll, description: 'base roll (2d6-7)' })
    trace.push({ value: sizeValue, description: `size ${orbit.size}` })

    // Density modifiers
    if (orbit.density > 1.12) {
      roll += 2
      trace.push({ value: 2, description: 'high density' })
    } else if (orbit.density < 0.5) {
      roll -= 2
      trace.push({ value: -2, description: 'low density' })
    }

    // Biosphere modifiers
    if (orbit.biosphere.code >= 8 && orbit.biosphere.label !== 'remnants') {
      roll += 1
      trace.push({ value: 1, description: 'complex biosphere' })
    }
    if (orbit.biosphere.label === 'engineered') {
      roll += 2
      trace.push({ value: 2, description: 'engineered biosphere' })
    }
    if (orbit.biosphere.label === 'miscible') {
      roll += 1
      trace.push({ value: 1, description: 'miscible biosphere' })
    }
    if (orbit.biosphere.label === 'immiscible') {
      roll -= 1
      trace.push({ value: -1, description: 'immiscible biosphere' })
    }

    const hab =
      Math.floor((10 - Math.max(-10, orbit.habitability.score)) * 0.5)
    trace.push({ value: -hab, description: 'habitability penalty' })
    roll -= hab

    const score = Math.min(Math.max(roll, 2), 12)

    // Add clamping info if needed
    if (roll < 2) {
      trace.push({ value: 2 - roll, description: 'minimum resources (2)' })
    } else if (roll > 12) {
      trace.push({ value: 12 - roll, description: 'maximum resources (12)' })
    }

    return { score, trace }
  }
}

// const desirability = ({ orbit, star, parent }: DesirabilityParams) => {
//   const lifebelt = () => {
//     if (orbit.zone === 'inner') {
//       // M-V star: +1
//       if (star.spectralClass === 'M' && star.luminosityClass === 'V') {
//         return 1
//       }
//       // Any other dwarf or subgiant: +2
//       else if (['IV', 'V'].includes(star.luminosityClass)) {
//         return 2
//       }
//     }
//     return 0
//   }
//   // Asteroid Belts
//   if (orbit.type === 'asteroid belt') {
//     const roll = window.dice.roll(1, 6) - window.dice.roll(1, 6)
//     return roll + lifebelt()
//   }

//   if (parent?.type === 'asteroid belt') {
//     return parent.desirability
//   }

//   // Dwarfs, Terrestrials, Helians, and Jovians
//   let desirability = 0

//   // Dry World – Hydro 0: -1
//   if (orbit.hydrosphere.code === 0) {
//     desirability -= 1
//   }

//   // Extreme Environment – Size D+; or Atmos C-G; or Hydro F: -2
//   // Size D+ means size 13+ (D=13, E=14, F=15, G=16+)
//   // Atmos C-G means atmosphere codes 12-16+ (C=12, D=13, E=14, F=15, G=16+)
//   // Hydro F means hydrosphere 15+ (F=15+)
//   if (orbit.size >= 13 || orbit.atmosphere.code >= 12 || orbit.hydrosphere.code === 12) {
//     desirability -= 2
//   }

//   // Habitable World – Size 1-B, Atmos 2-9, and Hydro 0-B: further detail needed
//   const isHabitable =
//     orbit.size >= 1 &&
//     orbit.size <= 11 &&
//     orbit.atmosphere.code >= 2 &&
//     orbit.atmosphere.code <= 9 &&
//     orbit.hydrosphere.code >= 0 &&
//     orbit.hydrosphere.code <= 11
//   if (isHabitable) {
//     // Garden World – Size 5-A, Atmos 4-9, and Hydro 4-8: +5
//     const isGarden =
//       orbit.size >= 5 &&
//       orbit.size <= 10 &&
//       orbit.atmosphere.code >= 4 &&
//       orbit.atmosphere.code <= 9 &&
//       orbit.hydrosphere.code >= 4 &&
//       orbit.hydrosphere.code <= 8
//     if (isGarden) {
//       desirability += 5
//     }
//     // Water World – Hydro A-B: +3 (A=10, B=11)
//     else if (orbit.hydrosphere.code >= 10 && orbit.hydrosphere.code <= 11) {
//       desirability += 3
//     }
//     // Poor World – Atmos 2-6, and Hydro 0-3: +2
//     else if (
//       orbit.atmosphere.code >= 2 &&
//       orbit.atmosphere.code <= 6 &&
//       orbit.hydrosphere.code >= 0 &&
//       orbit.hydrosphere.code <= 3
//     ) {
//       desirability += 2
//     }
//     // Otherwise: +4
//     else {
//       desirability += 4
//     }
//   }

//   // High Gravity – Size A+ and Atmos F-: -1
//   // Size A+ means size 10+ (A=10, B=11, etc.)
//   // Atmos F- means atmosphere code 15- (F=15 and below)
//   // Note: Yes, normal Jovians don't count as "high gravity", as one doesn't live on the surface.
//   if (orbit.size >= 10 && orbit.atmosphere.code <= 15 && orbit.type !== 'jovian') {
//     desirability -= 1
//   }

//   // Lifebelt – Inner Zone orbit: further detail needed (placeholder)
//   desirability += lifebelt()

//   // Tiny World – Size 0: -1
//   if (orbit.size === 0) {
//     desirability -= 1
//   }

//   // T-Prime Atmosphere – Atmos 6 or 8: +1
//   if (orbit.atmosphere.code === 6 || orbit.atmosphere.code === 8) {
//     desirability += 1
//   }

//   return desirability
// }
