import { MATH } from '../../../utilities/math'
import { TEMPERATURE } from '../temperature'
import { AsteroidBelt, AsteroidBeltSpawnParams } from './types'

export const ASTEROID_BELT = {
  resources: (belt: AsteroidBelt) => {
    const { ice, metal } = belt.composition
    return Math.min(
      12,
      Math.max(
        2,
        window.dice.roll(2, 6) - 7 + belt.bulk + Math.floor(metal / 10) - Math.floor(ice / 10)
      )
    )
  },
  spawn: ({ star, au }: AsteroidBeltSpawnParams): AsteroidBelt => {
    // composition
    let roll = window.dice.roll(2, 6)
    const hzco = MATH.orbits.fromAU(MATH.orbits.distance(TEMPERATURE.base(0), star.luminosity))
    const orbit = MATH.orbits.fromAU(au)
    const diff = orbit - hzco
    if (diff < 0) roll -= 4
    else if (orbit > 2) roll += 4

    // Determine composition based on roll
    let mType = 0
    let sType = 0
    let cType = 0

    if (roll <= 0) {
      mType = 60 + window.dice.roll(1, 6) * 5
      sType = window.dice.roll(1, 6) * 5
      cType = 0
    } else if (roll === 1) {
      mType = 50 + window.dice.roll(1, 6) * 5
      sType = 5 + window.dice.roll(1, 6) * 5
      cType = window.dice.roll(1, 3)
    } else if (roll === 2) {
      mType = 40 + window.dice.roll(1, 6) * 5
      sType = 15 + window.dice.roll(1, 6) * 5
      cType = window.dice.roll(1, 6)
    } else if (roll === 3) {
      mType = 25 + window.dice.roll(1, 6) * 5
      sType = 30 + window.dice.roll(1, 6) * 5
      cType = window.dice.roll(1, 6)
    } else if (roll === 4) {
      mType = 15 + window.dice.roll(1, 6) * 5
      sType = 35 + window.dice.roll(1, 6) * 5
      cType = 5 + window.dice.roll(1, 6)
    } else if (roll === 5) {
      mType = 5 + window.dice.roll(1, 6) * 5
      sType = 40 + window.dice.roll(1, 6) * 5
      cType = 5 + window.dice.roll(1, 6) * 2
    } else if (roll === 6) {
      mType = window.dice.roll(1, 6) * 5
      sType = 40 + window.dice.roll(1, 6) * 5
      cType = window.dice.roll(1, 6) * 5
    } else if (roll === 7) {
      mType = 5 + window.dice.roll(1, 6) * 2
      sType = 35 + window.dice.roll(1, 6) * 5
      cType = 10 + window.dice.roll(1, 6) * 5
    } else if (roll === 8) {
      mType = 5 + window.dice.roll(1, 6)
      sType = 30 + window.dice.roll(1, 6) * 5
      cType = 20 + window.dice.roll(1, 6) * 5
    } else if (roll === 9) {
      mType = window.dice.roll(1, 6)
      sType = 15 + window.dice.roll(1, 6) * 5
      cType = 40 + window.dice.roll(1, 6) * 5
    } else if (roll === 10) {
      mType = window.dice.roll(1, 6)
      sType = 5 + window.dice.roll(1, 6) * 5
      cType = 50 + window.dice.roll(1, 6) * 5
    } else if (roll === 11) {
      mType = window.dice.roll(1, 3)
      sType = 5 + window.dice.roll(1, 6) * 2
      cType = 60 + window.dice.roll(1, 6) * 5
    } else {
      mType = 0
      sType = window.dice.roll(1, 6)
      cType = 70 + window.dice.roll(1, 6) * 5
    }
    return {
      bulk: Math.max(1, window.dice.roll(2, 2) - Math.floor(star.age / 2) + Math.floor(cType / 10)),
      composition: {
        rock: mType,
        ice: sType,
        metal: cType
      }
    }
  }
}
