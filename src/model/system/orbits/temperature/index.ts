import { scaleLinear } from 'd3'
import { MATH } from '../../../utilities/math'
import { FinalizeTemperatureParams } from './types'

const _temperature = scaleLinear<number, number>()
  .domain([
    -4.5, -4.0, -4.0, -3.5, -3.5, -3.0, -3.0, -2.5, -2.5, -2.0, -2.0, -1.5, -1.5, -1.0, -1.0, -0.5,
    -0.5, 0.5, 0.5, 1.0, 1.0, 1.5, 1.5, 2.0, 2.0, 2.5
  ])
  .range([
    -250, -230, -210, -190, -180, -160, -150, -130, -120, -100, -95, -75, -65, -50, -40, 0, 5, 25,
    35, 75, 85, 180, 200, 300, 350, 450
  ])

export const TEMPERATURE = {
  base: (deviation: number) => MATH.temperature.kelvin(_temperature(deviation)),
  finalize: ({
    composition,
    au,
    star,
    atmosphere,
    hydrosphere,
    tilt,
    period,
    eccentricity,
    rotation
  }: FinalizeTemperatureParams) => {
    // albedo
    let albedo = 0
    if (composition == 'rocky' || composition == 'metallic')
      albedo = (window.dice.roll(2, 6) - 2) * 0.02 + 0.04
    else if (composition == 'ice') albedo = (window.dice.roll(2, 6) - 3) * 0.05 + 0.2
    else if (composition == 'gas') albedo = 0.05 * window.dice.roll(2, 6) + 0.05

    if (
      atmosphere.subtype == 'very thin' ||
      atmosphere.type == 'vacuum' ||
      atmosphere.type == 'trace'
    )
      albedo += (window.dice.roll(2, 6) - 3) * 0.01
    else if (atmosphere.subtype == 'very dense') albedo += window.dice.roll(2, 6) * 0.03
    else if (atmosphere.type == 'breathable') albedo += window.dice.roll(2, 6) * 0.01
    else albedo += (window.dice.roll(2, 6) - 2) * 0.05

    if (hydrosphere >= 2 && hydrosphere <= 5) albedo += (window.dice.roll(2, 6) - 2) * 0.02
    else if (hydrosphere >= 6) albedo += (window.dice.roll(2, 6) - 4) * 0.03

    albedo = Math.max(0.02, Math.min(0.98, albedo))

    // greenhouse
    let greenhouse = 0.5 * atmosphere.bar ** 0.5
    if (
      atmosphere.type == 'gaseous' ||
      atmosphere.type == 'insidious' ||
      atmosphere.type == 'corrosive' ||
      hydrosphere === 12
    ) {
      const roll = window.dice.roll(1, 6)
      if (roll < 6) greenhouse += roll * window.dice.roll(1, 6)
      else greenhouse += roll * window.dice.roll(3, 6)
    } else if (atmosphere.type == 'breathable') greenhouse += window.dice.roll(3, 6) * 0.01
    else if (atmosphere.type == 'exotic') greenhouse *= Math.max(0.5, window.dice.roll(1, 6) - 1)

    // temperature
    const mean = 279 * ((star.luminosity * (1 - albedo) * (1 + greenhouse)) / au ** 2) ** 0.25

    let tiltFactor = Math.sin(MATH.angles.radians(tilt > 90 ? 180 - tilt : tilt))
    if (period < 0.1) tiltFactor *= 0.5
    else if (period > 2) tiltFactor += Math.min(0.25, period * 0.01)
    tiltFactor = Math.min(1, tiltFactor)

    const rotationFactor = isFinite(rotation) && rotation < 2500 ? rotation ** 0.5 / 50 : 1
    const geographicFactor = (10 - Math.min(10, hydrosphere)) / 20

    const luminosityMod =
      Math.min(1, Math.max(0, tiltFactor + rotationFactor + geographicFactor)) /
      (1 + atmosphere.bar)
    const highLuminosity = star.luminosity * (1 + luminosityMod)
    const lowLuminosity = star.luminosity * (1 - luminosityMod)
    const nearAU = au * (1 - eccentricity)
    const farAU = au * (1 + eccentricity)

    const high = 279 * ((highLuminosity * (1 - albedo) * (1 + greenhouse)) / nearAU ** 2) ** 0.25
    const low = 279 * ((lowLuminosity * (1 - albedo) * (1 + greenhouse)) / farAU ** 2) ** 0.25

    return { mean, high, low }
  },
  describe: (kelvin: number) =>
    kelvin <= 223
      ? 'frozen'
      : kelvin <= 273.15
      ? 'cold'
      : kelvin <= 303.15
      ? 'temperate'
      : kelvin <= 353.15
      ? 'hot'
      : 'burning'
}
