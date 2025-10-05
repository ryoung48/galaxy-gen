import { scaleLinear } from 'd3'
import { MATH } from '../../../utilities/math'
import { FinalizeTemperatureParams } from './types'
import { Orbit } from '../types'
import { TEXT } from '../../../utilities/text'

const _temperature = scaleLinear<number, number>()
  .domain([
    -4.5, -4.0, -4.0, -3.5, -3.5, -3.0, -3.0, -2.5, -2.5, -2.0, -2.0, -1.5, -1.5, -1.0, -1.0, -0.5,
    -0.5, 0.5, 0.5, 1.0, 1.0, 1.5, 1.5, 2.0, 2.0, 2.5
  ])
  .range([
    -250, -230, -210, -190, -180, -160, -150, -130, -120, -100, -95, -75, -65, -50, -40, 0, 5, 25,
    35, 75, 85, 180, 200, 300, 350, 450
  ])

// ---------- helpers ----------

const seismologyMod = (value: number, seismology: number) => (value ** 4 + seismology ** 4) ** 0.25
const temperatureBase = (
  luminosity: number,
  albedo: number,
  greenhouse: number,
  AU: number,
  seismology: number
) =>
  seismologyMod(
    279 * ((luminosity * (1 - albedo) * (1 + greenhouse)) / AU ** 2) ** 0.25,
    seismology
  )

const seasonality = (tilt: number, rotation: number, geography: number, atmospheric: number) => {
  const seasonalityNumerator = Math.min(1, Math.max(0, tilt + rotation + geography))
  const seasonalityDenominator = 1 + atmospheric
  return seasonalityNumerator / seasonalityDenominator
}

const temperatureRange = (
  luminosityMod: number,
  luminosity: number,
  albedo: number,
  greenhouse: number,
  au: number,
  eccentricity: number,
  seismology: number
) => {
  const highLuminosity = luminosity * (1 + luminosityMod)
  const lowLuminosity = luminosity * (1 - luminosityMod)
  const nearAU = au * (1 - eccentricity)
  const farAU = au * (1 + eccentricity)
  const high = temperatureBase(highLuminosity, albedo, greenhouse, nearAU, seismology)
  const low = temperatureBase(lowLuminosity, albedo, greenhouse, farAU, seismology)
  return { high, low, delta: high - low }
}

const permutations = <T>(xs: T[]): T[][] => {
  const out: T[][] = []
  const rec = (arr: T[], m: T[] = []) => {
    if (arr.length === 0) out.push(m)
    else
      for (let i = 0; i < arr.length; i++) {
        const next = arr.slice()
        const ch = next.splice(i, 1)[0]
        rec(next, m.concat(ch))
      }
  }
  rec(xs)
  return out
}

export const TEMPERATURE = {
  base: (deviation: number) => MATH.temperature.kelvin(_temperature(deviation)),
  finalize: ({ orbit, parent, star }: FinalizeTemperatureParams) => {
    const { composition, au, atmosphere, hydrosphere, tilt, period, rotation } = orbit
    const eccentricity = parent?.eccentricity ?? orbit.eccentricity
    // ---------- 1) Albedo (your original logic) ----------
    let albedo = 0
    if (composition.type == 'rocky' || composition.type == 'metallic')
      albedo = (window.dice.roll(2, 6) - 2) * 0.02 + 0.04
    else if (composition.type == 'ice') albedo = (window.dice.roll(2, 6) - 3) * 0.05 + 0.2
    else if (composition.type == 'gas') albedo = 0.05 * window.dice.roll(2, 6) + 0.05

    if (
      atmosphere.subtype == 'very thin' ||
      atmosphere.type == 'vacuum' ||
      atmosphere.type == 'trace'
    ) {
      albedo += (window.dice.roll(2, 6) - 3) * 0.01
    } else if (atmosphere.subtype == 'very dense') {
      albedo += window.dice.roll(2, 6) * 0.03
    } else if (atmosphere.type == 'breathable') {
      albedo += window.dice.roll(2, 6) * 0.01
    } else {
      albedo += (window.dice.roll(2, 6) - 2) * 0.05
    }

    if (hydrosphere.code >= 2 && hydrosphere.code <= 5) {
      albedo += (window.dice.roll(2, 6) - 2) * 0.02
    } else if (hydrosphere.code >= 6) {
      albedo += (window.dice.roll(2, 6) - 4) * 0.03
    }

    albedo = Math.max(0.02, Math.min(0.98, albedo))

    // ---------- 2) Greenhouse (your original logic) ----------
    let greenhouse = 0.5 * atmosphere.bar ** 0.5
    if (
      atmosphere.type == 'gas' ||
      atmosphere.type == 'insidious' ||
      atmosphere.type == 'corrosive'
    ) {
      const roll = window.dice.roll(1, 6)
      if (roll < 6) greenhouse += roll * window.dice.roll(1, 6)
      else greenhouse += roll * window.dice.roll(3, 6)
    } else if (atmosphere.type == 'breathable') {
      greenhouse += window.dice.roll(3, 6) * 0.01
    } else if (atmosphere.type == 'exotic') {
      greenhouse *= Math.max(0.5, window.dice.roll(1, 6) - 1)
    }

    // ---------- 4) Mean / High / Low (your physics) ----------
    const mean = temperatureBase(star.luminosity, albedo, greenhouse, au, orbit.seismology.total)

    if (mean > 1e3 && orbit.group !== 'jovian') orbit.hydrosphere.code = 12

    let tiltFactor = Math.sin(MATH.angles.radians(tilt > 90 ? 180 - tilt : tilt))
    if (period < 0.1) tiltFactor *= 0.5
    else if (period > 2) tiltFactor += Math.min(0.25, period * 0.01)
    tiltFactor = Math.min(1, tiltFactor)

    const rotationFactor =
      orbit.lock?.type !== 'star' && rotation.value < 2500 ? rotation.value ** 0.5 / 50 : 1
    const geographicFactor = (10 - Math.min(10, hydrosphere.code)) / 20
    const luminosityMod = seasonality(tiltFactor, rotationFactor, geographicFactor, atmosphere.bar)

    const { high, low, delta } = temperatureRange(
      luminosityMod,
      star.luminosity,
      albedo,
      greenhouse,
      au,
      eccentricity,
      orbit.seismology.total
    )
    return {
      mean,
      high,
      low,
      trace: { luminosity: star.luminosity, albedo, greenhouse, au },
      delta: {
        tilt: tiltFactor,
        rotation: rotationFactor,
        geography: geographicFactor,
        atmospheric: atmosphere.bar,
        eccentricity,
        value: delta
      }
    }
  },
  trace: {
    mean: (orbit: Orbit) => {
      const { luminosity, albedo, greenhouse, au } = orbit.temperature.trace
      const seismology = orbit.seismology.total

      const factorsMean = ['L', 'a', 'g', 'AU', 'SE']
      type FactorMean = (typeof factorsMean)[number]
      const permsMean = permutations(factorsMean)
      const refMean = { L0: 1, AU0: 1, a0: 0.3, g0: 0.622, SE: 25 }

      const stateMean = (on: Set<FactorMean>) => ({
        L: on.has('L') ? luminosity : refMean.L0,
        a: on.has('a') ? albedo : refMean.a0,
        g: on.has('g') ? greenhouse : refMean.g0,
        AU: on.has('AU') ? au : refMean.AU0,
        SE: on.has('SE') ? seismology : refMean.SE
      })

      const contribMean = {
        luminosity: 0,
        albedo: 0,
        greenhouse: 0,
        distance: 0,
        seismology: 0
      }
      for (const order of permsMean) {
        const on = new Set<FactorMean>()
        const s0 = stateMean(on)
        let prev = temperatureBase(s0.L, s0.a, s0.g, s0.AU, s0.SE)
        for (const f of order) {
          on.add(f)
          const s1 = stateMean(on)
          const curr = temperatureBase(s1.L, s1.a, s1.g, s1.AU, s1.SE)
          const dK = curr - prev
          if (f === 'L') contribMean.luminosity += dK
          if (f === 'a') contribMean.albedo += dK
          if (f === 'g') contribMean.greenhouse += dK
          if (f === 'AU') contribMean.distance += dK
          if (f === 'SE') contribMean.seismology += dK
          prev = curr
        }
      }
      const Nmean = permsMean.length
      contribMean.luminosity /= Nmean
      contribMean.albedo /= Nmean
      contribMean.greenhouse /= Nmean
      contribMean.distance /= Nmean
      contribMean.seismology /= Nmean
      const baselineRadiative = temperatureBase(
        refMean.L0,
        refMean.a0,
        refMean.g0,
        refMean.AU0,
        refMean.SE
      )

      const trace = [
        {
          value: contribMean.luminosity,
          description: `luminosity (${luminosity.toFixed(2)})`
        },
        {
          value: contribMean.albedo,
          description: `albedo (${albedo.toFixed(2)})`
        },
        {
          value: contribMean.greenhouse,
          description: `greenhouse (${greenhouse.toFixed(2)})`
        },
        {
          value: contribMean.distance,
          description: `distance (${au.toFixed(2)} AU)`
        },
        {
          value: contribMean.seismology,
          description: `seismology (${TEXT.formatters.compact(seismology)})`
        }
      ]
      return { baseline: MATH.temperature.celsius(baselineRadiative), trace }
    },
    delta: (orbit: Orbit) => {
      const { luminosity, albedo, greenhouse, au } = orbit.temperature.trace
      const { tilt, rotation, geography, atmospheric, eccentricity } = orbit.temperature.delta
      const seismology = orbit.seismology.total

      const deltaF = (
        tilt: number,
        rotation: number,
        geography: number,
        atmospheric: number,
        eccentricity: number,
        seismology: number
      ) => {
        const luminosityMod = seasonality(tilt, rotation, geography, atmospheric)
        return temperatureRange(
          luminosityMod,
          luminosity,
          albedo,
          greenhouse,
          au,
          eccentricity,
          seismology
        ).delta
      }
      const refDelta = {
        tilt: 0,
        rotation: 0,
        geography: 0,
        atmospheric: 0,
        eccentricity: 0,
        seismology: 0
      }
      const baseline = deltaF(
        refDelta.tilt,
        refDelta.rotation,
        refDelta.geography,
        refDelta.atmospheric,
        refDelta.eccentricity,
        refDelta.seismology
      )

      // Top-level factors for delta
      const factorsDelta = [
        'tilt',
        'rotation',
        'geography',
        'atmospheric',
        'eccentricity',
        'seismology'
      ]
      type FactorDelta = (typeof factorsDelta)[number]
      const permsDelta = permutations(factorsDelta)
      const stateDelta = (on: Set<FactorDelta>) => ({
        tilt: on.has('tilt') ? tilt : refDelta.tilt,
        rotation: on.has('rotation') ? rotation : refDelta.rotation,
        geography: on.has('geography') ? geography : refDelta.geography,
        atmospheric: on.has('atmospheric') ? atmospheric : refDelta.atmospheric,
        eccentricity: on.has('eccentricity') ? eccentricity : refDelta.eccentricity,
        seismology: on.has('seismology') ? seismology : refDelta.seismology
      })

      const deltaContrib = {
        tilt: 0,
        rotation: 0,
        geography: 0,
        atmospheric: 0,
        eccentricity: 0,
        seismology: 0
      }
      for (const order of permsDelta) {
        const on = new Set<FactorDelta>()
        const s0 = stateDelta(on)
        let prev = deltaF(
          s0.tilt,
          s0.rotation,
          s0.geography,
          s0.atmospheric,
          s0.eccentricity,
          s0.seismology
        )
        for (const f of order) {
          on.add(f)
          const s1 = stateDelta(on)
          const curr = deltaF(
            s1.tilt,
            s1.rotation,
            s1.geography,
            s1.atmospheric,
            s1.eccentricity,
            s1.seismology
          )
          const dK = curr - prev
          if (f === 'tilt') deltaContrib.tilt += dK
          if (f === 'rotation') deltaContrib.rotation += dK
          if (f === 'geography') deltaContrib.geography += dK
          if (f === 'atmospheric') deltaContrib.atmospheric += dK
          if (f === 'eccentricity') deltaContrib.eccentricity += dK
          if (f === 'seismology') deltaContrib.seismology += dK
          prev = curr
        }
      }
      const Ndelta = permsDelta.length
      deltaContrib.tilt /= Ndelta
      deltaContrib.rotation /= Ndelta
      deltaContrib.geography /= Ndelta
      deltaContrib.atmospheric /= Ndelta
      deltaContrib.eccentricity /= Ndelta
      deltaContrib.seismology /= Ndelta

      const trace = [
        {
          value: deltaContrib.tilt,
          description: `tilt (${tilt.toFixed(2)})`
        },
        { value: deltaContrib.rotation, description: `rotation (${rotation.toFixed(2)})` },
        { value: deltaContrib.geography, description: `geography (${geography.toFixed(2)})` },
        {
          value: deltaContrib.atmospheric,
          description: `atmospheric (${TEXT.formatters.compact(atmospheric)})`
        },
        {
          value: deltaContrib.eccentricity,
          description: `eccentricity (${eccentricity.toFixed(2)})`
        },
        {
          value: deltaContrib.seismology,
          description: `seismology (${TEXT.formatters.compact(seismology)})`
        }
      ]

      return {
        baseline,
        trace
      }
    }
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
