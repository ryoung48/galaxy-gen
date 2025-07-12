import { ASTEROID_BELT } from '../asteroids'
import { ORBIT_CLASSIFICATION } from '../classification'
import { Orbit } from '../types'
import { HabitabilityParams } from './types'

export const DESIRABILITY = {
  get: (orbit: Orbit) => orbit.resources + orbit.habitability,
  habitability: ({
    hydrosphere,
    size,
    gravity,
    atmosphere,
    temperature,
    type
  }: HabitabilityParams) => {
    let habitability = 10

    if (size <= 4) habitability -= 1
    else if (size >= 9) habitability += 1

    if (atmosphere.code === 12 || atmosphere.type === 'gaseous') habitability -= 12
    else if (atmosphere.code === 11 || atmosphere.unusual) habitability -= 10
    else if ([0, 1, 10].includes(atmosphere.code)) habitability -= 8
    else if (atmosphere.code === 2 || atmosphere.subtype === 'low') habitability -= 4
    else if (atmosphere.code === 3 || atmosphere.subtype === 'very dense') habitability -= 3
    else if (atmosphere.code === 4 || atmosphere.code === 9) habitability -= 2
    else if ([5, 7, 8].includes(atmosphere.code)) habitability -= 1

    if (hydrosphere === 0) habitability -= 4
    else if (hydrosphere <= 3) habitability -= 2
    else if (hydrosphere === 9) habitability -= 1
    else if (hydrosphere === 10 || hydrosphere === 11) habitability -= 2
    else if (hydrosphere === 12) habitability -= 12

    // temperature
    if (temperature.high > 323 || temperature.high < 279) habitability -= 2
    if (temperature.mean > 323) habitability -= 4
    else if (temperature.mean > 304) habitability -= 2
    else if (temperature.mean < 273) habitability -= 2
    if (temperature.low < 200) habitability -= 2

    if (gravity <= 0.4) habitability -= 2
    else if (gravity <= 0.7) habitability -= 1
    else if (gravity <= 0.9) habitability += 1
    else if (gravity <= 1.4) habitability -= 1
    else if (gravity <= 2) habitability -= 2
    else habitability -= 6

    if (ORBIT_CLASSIFICATION[type].tidalLock) habitability -= 2
    return habitability
  },
  resources: (orbit: Orbit, parent?: Orbit) => {
    if (orbit.belt) {
      return ASTEROID_BELT.resources(orbit.belt)
    } else if (parent?.belt) {
      return parent.resources
    }
    let roll = window.dice.roll(2, 6) - 7 + orbit.size
    if (orbit.density > 1.12) roll += 2
    else if (orbit.density < 0.5) roll -= 2

    if (orbit.biosphere > 10) roll += 2
    else if (orbit.biosphere >= 8) roll += 1

    return Math.min(Math.max(roll, 2), 12)
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
