import { MATH } from '../../utilities/math'
import { Star } from '../stars/types'
import { Orbit, OrbitTypeDetails } from './types'

type RollParams = Parameters<OrbitTypeDetails['roll']>[0]

const gasGiantSizes = (star: Star) => {
  let firstRoll = window.dice.roll(1, 6)
  const { luminosityClass, spectralClass } = star
  if (luminosityClass === 'VI' || (luminosityClass === 'V' && spectralClass === 'M')) firstRoll -= 1
  if (firstRoll <= 2) return 16
  if (firstRoll <= 4) return 17
  return 18
}

const helianSizes = () => window.dice.choice([11, 12, 13, 14, 15])

export const ORBIT_CLASSIFICATION: Record<Orbit['type'], OrbitTypeDetails> = {
  acheronian: {
    color: '#848484',
    description:
      "These are worlds that were directly affected by their primary's transition from the main sequence; the atmosphere and oceans have been boiled away, leaving a scorched, dead planet.",
    roll: ({ sizeOverride }: RollParams) => {
      const size = sizeOverride ?? window.dice.randint(1, 6) + 4
      return { size, atmosphere: 1, hydrosphere: 0, composition: 'rocky' }
    }
  },
  arid: {
    biosphere: true,
    color: '#DEB887',
    description:
      'These are worlds with limited amounts of surface liquid, that maintain an equilibrium with the help of their tectonic activity and their biosphere.',
    roll: ({ star, zone, primary, sizeOverride }: RollParams) => {
      const size = sizeOverride ?? window.dice.roll(1, 6) + 4
      const hydrosphere = window.dice.randint(1, 3)
      let chemMod = 0
      if (star.spectralClass === 'K') chemMod += 2
      if (star.spectralClass === 'M') chemMod += 4
      if (zone === 'outer') chemMod += 2
      const chemRoll = window.dice.roll(1, 6) + chemMod
      const chemistry = primary || chemRoll <= 6 ? 'water' : chemRoll <= 8 ? 'ammonia' : 'methane'
      const atmosphere =
        chemistry === 'water'
          ? MATH.clamp(window.dice.roll(2, 6) - 7 + size, 2, 9)
          : window.dice.weightedChoice([
              { v: 10, w: 8 },
              { v: 11, w: 2 }
            ])
      return {
        size,
        atmosphere,
        hydrosphere,
        chemistry,
        subtype:
          chemistry === 'water' ? 'darwinian' : chemistry === 'ammonia' ? 'saganian' : 'asimovian',
        composition: 'rocky'
      }
    }
  },
  asphodelian: {
    color: '#778899',
    description:
      "These are worlds that were directly affected by their primary's transition from the main sequence; their atmosphere has been boiled away, leaving the surface exposed.",
    roll: ({ sizeOverride }: RollParams) => {
      const size = sizeOverride ?? helianSizes()
      return { size, atmosphere: 1, hydrosphere: 0, composition: 'rocky' }
    }
  },
  'asteroid belt': {
    color: '#575656',
    description:
      'These are bodies too small to sustain hydrostatic equilibrium; nearly all asteroids and comets are small bodies.',
    roll: ({ sizeOverride }: RollParams) => {
      const size = sizeOverride ?? 0
      return { size, atmosphere: 0, hydrosphere: 0, composition: 'rocky' }
    }
  },
  asteroid: {
    color: '#778899',
    description:
      'These are bodies too small to sustain hydrostatic equilibrium; nearly all asteroids and comets are small bodies.',
    roll: ({ deviation, sizeOverride }: RollParams) => {
      const subtype = window.dice.weightedChoice<Orbit['composition']['type']>([
        { v: 'metallic', w: deviation >= 1.5 ? 1 : 0 },
        { v: 'rocky', w: 3 },
        { v: 'ice', w: deviation < -1.5 ? 6 : 0 }
      ])
      const size = sizeOverride ?? 0
      return {
        size,
        atmosphere: 0,
        hydrosphere: 0,
        composition: subtype,
        subtype: subtype
      }
    }
  },
  chthonian: {
    color: '#A52A2A',
    description:
      "These are worlds that were directly affected by their primary's transition from the main sequence, or that have simply spent too long in a tight epistellar orbit; their atmospheres have been stripped away.",
    roll: ({ sizeOverride }: RollParams) => {
      const size = sizeOverride ?? 16
      return { size, atmosphere: 1, hydrosphere: 0, composition: 'gas' }
    }
  },
  'geo-cyclic': {
    biosphere: true,
    tidalLock: false,
    color: '#782fe0',
    description:
      'These are worlds with little liquid, that move through a slow geological cycle of a gradual build-up, a short wet and clement period, and a long decline.',
    roll: ({ zone, primary, sizeOverride }: RollParams) => {
      const size = sizeOverride ?? window.dice.roll(1, 4)
      const atmosphereRoll = Math.max(window.dice.roll(1, 6), 1)
      const atmosphere =
        atmosphereRoll > 3
          ? window.dice.weightedChoice([
              { v: 10, w: 8 },
              { v: 11, w: 2 }
            ])
          : 1
      const hydrosphere = Math.max(
        0,
        window.dice.roll(2, 6) + size - 7 - (atmosphere === 1 ? 4 : 0)
      )
      const chemRoll = window.dice.roll(1, 6) + (zone === 'outer' ? 2 : 0)
      const chemistry = primary || chemRoll <= 4 ? 'water' : chemRoll <= 6 ? 'ammonia' : 'methane'
      return {
        size,
        atmosphere,
        hydrosphere,
        chemistry,
        subtype:
          chemistry === 'water' ? 'arean' : chemistry === 'ammonia' ? 'utgardian' : 'titanian',
        composition: 'rocky'
      }
    }
  },
  'geo-tidal': {
    biosphere: true,
    tidalLock: false,
    color: '#4682B4',
    description:
      'These are worlds that, through tidal-flexing, have a geological cycle similar to plate tectonics, that supports surface liquid and atmosphere.',
    roll: ({ zone, primary, sizeOverride }: RollParams) => {
      const size = sizeOverride ?? window.dice.roll(1, 4)
      const hydrosphere = window.dice.roll(2, 3) - 2
      let chemMod = 0
      if (zone === 'epistellar') chemMod -= 2
      if (zone === 'outer') chemMod += 2
      const chemRoll = window.dice.roll(1, 6) + chemMod
      const chemistry = primary || chemRoll <= 4 ? 'water' : chemRoll <= 6 ? 'ammonia' : 'methane'
      const atmosphere =
        chemistry === 'water'
          ? MATH.clamp(window.dice.roll(2, 6) - 7 + size, 2, 9)
          : window.dice.weightedChoice([
              { v: 10, w: 8 },
              { v: 11, w: 2 }
            ])
      return {
        size,
        atmosphere,
        hydrosphere,
        chemistry,
        subtype:
          chemistry === 'water' ? 'promethean' : chemistry === 'ammonia' ? 'burian' : 'atlan',
        composition: chemistry === 'methane' ? 'ice' : 'rocky',
        eccentric: true
      }
    }
  },
  hebean: {
    color: '#bce02f',
    tidalLock: false,
    description:
      'These are highly active worlds, due to tidal flexing, but with some regions of stability; the larger ones may be able to maintain some atmosphere and surface liquid.',
    roll: ({ sizeOverride }: RollParams) => {
      const size = sizeOverride ?? window.dice.roll(1, 4)
      let atmosphere = Math.max(1, window.dice.roll(1, 6) + size - 6)
      if (atmosphere >= 2) atmosphere = 10
      const hydrosphere = MATH.clamp(window.dice.roll(2, 6) + size - 11, 0, 11)
      return { size, atmosphere, hydrosphere, eccentric: true, composition: 'rocky' }
    }
  },
  helian: {
    biosphere: true,
    color: '#FFA500',
    description:
      'These are typical helian or "subgiant" worlds - large enough to retain helium atmospheres.',
    roll: ({ sizeOverride }: RollParams) => {
      const size = sizeOverride ?? helianSizes()
      const hydroRoll = window.dice.roll(1, 6)
      const hydrosphere = hydroRoll <= 2 ? 0 : window.dice.roll(2, 6) - 1
      return { size, atmosphere: 13, hydrosphere, composition: 'rocky' }
    }
  },
  'jani-lithic': {
    color: '#D2B48C',
    description:
      'These worlds, tide-locked to the primary, are rocky, dry, and geologically active.',
    tidalLock: true,
    roll: ({ sizeOverride }: RollParams) => {
      const size = sizeOverride ?? window.dice.roll(1, 6) + 4
      const atmosphereRoll = window.dice.roll(1, 6)
      const atmosphere =
        atmosphereRoll <= 3
          ? 0
          : window.dice.weightedChoice([
              { v: 10, w: 8 },
              { v: 11, w: 2 }
            ])
      return { size, atmosphere, hydrosphere: 0, composition: 'rocky' }
    }
  },
  jovian: {
    color: '#FFDAB9',
    description:
      'These are huge worlds with helium-hydrogen envelopes and compressed cores; the largest emit more heat than they absorb.',
    roll: ({ star, deviation, parent, sizeOverride }: RollParams) => {
      const baseSize = sizeOverride ?? gasGiantSizes(star)
      const size = Math.min((parent?.size ?? Infinity) - 1, baseSize)
      let subtype = 'unknown'
      if (size === 16) {
        if (deviation >= 1) {
          subtype = 'osirian'
        } else if (deviation >= -1) {
          subtype = 'brammian'
        } else if (deviation >= -1.5) {
          subtype = 'khonsonian'
        } else {
          subtype = 'neptunian'
        }
      } else if (size === 17) {
        if (deviation >= -1.5) {
          subtype = 'junic'
        } else {
          subtype = 'jovic'
        }
      } else {
        if (deviation >= -1.5) {
          subtype = 'super-junic'
        } else {
          subtype = 'super-jovic'
        }
      }
      return {
        size,
        atmosphere: 14,
        hydrosphere: 13,
        composition: 'gas',
        subtype
      }
    }
  },
  meltball: {
    color: '#FF625D',
    tidalLock: false,
    description:
      'These are dwarfs with molten or semi-molten surfaces, either from extreme tidal flexing, or extreme approach to a star.',
    tidalFlex: true,
    roll: ({ parent, zone, sizeOverride }: RollParams) => {
      const size = sizeOverride ?? window.dice.randint(1, 5) - 1
      return {
        size,
        atmosphere: 1,
        hydrosphere: 12,
        eccentric: parent ? false : true,
        composition: window.dice.weightedChoice([
          { v: 'rocky', w: 5 },
          { v: 'metallic', w: zone === 'epistellar' ? 1 : 0 }
        ])
      }
    }
  },
  oceanic: {
    biosphere: true,
    color: '#1E90FF',
    description:
      'These are worlds with a continuous hydrological cycle and deep oceans, due to either dense greenhouse atmosphere or active plate tectonics.',
    roll: ({ star, zone, primary, sizeOverride }: RollParams) => {
      const size = sizeOverride ?? window.dice.roll(1, 6) + 4
      let chemRoll = window.dice.roll(1, 6)
      if (star.spectralClass === 'K') chemRoll += 2
      if (star.spectralClass === 'M') chemRoll += 4
      if (zone === 'outer') chemRoll += 2
      const chemistry = primary || chemRoll <= 6 ? 'water' : chemRoll <= 8 ? 'ammonia' : 'methane'
      const atmosphereRoll = window.dice.roll(1, 6)
      const atmosphere =
        chemistry === 'water'
          ? MATH.clamp(
              window.dice.roll(2, 6) +
                size -
                6 -
                (star.spectralClass === 'K' || star.luminosityClass === 'IV'
                  ? 1
                  : star.spectralClass === 'M'
                  ? 2
                  : 0),
              2,
              12
            )
          : atmosphereRoll === 1
          ? 1
          : atmosphereRoll <= 4
          ? 10
          : 12
      return {
        size,
        atmosphere,
        hydrosphere: window.dice.weightedChoice([
          { v: 10, w: 5 },
          { v: 11, w: 1 }
        ]),
        chemistry,
        subtype: chemistry === 'water' ? 'pelagic' : chemistry === 'ammonia' ? 'nunnic' : 'teathic',
        composition: 'rocky'
      }
    }
  },
  panthalassic: {
    biosphere: true,
    color: '#4169E1',
    description:
      'These are massive worlds, aborted gas giants, largely composed of water and hydrogen.',
    roll: ({ star, sizeOverride }: RollParams) => {
      let chemRoll = window.dice.roll(1, 6)
      if (star.spectralClass === 'K') chemRoll += 2
      if (star.spectralClass === 'M') chemRoll += 4
      const secondChemRoll = window.dice.roll(2, 6)
      const chemistry =
        chemRoll <= 6
          ? secondChemRoll <= 8
            ? 'water'
            : secondChemRoll <= 11
            ? 'sulfur'
            : 'chlorine'
          : 'methane'
      const atmosphere = Math.min(window.dice.roll(1, 6) + 8, 13)
      const size = sizeOverride ?? helianSizes()
      return { size, atmosphere, hydrosphere: 11, chemistry, composition: 'rocky' }
    }
  },
  rockball: {
    color: '#8B7D7B',
    description:
      'These are mostly dormant worlds, with surfaces largely unchanged since the early period of planetary formation.',
    roll: ({ zone, sizeOverride }: RollParams) => {
      const size = sizeOverride ?? window.dice.roll(1, 5) - 1
      let hydrosphere = window.dice.roll(2, 6) + size - 11
      if (zone === 'epistellar') hydrosphere -= 2
      if (zone === 'outer') hydrosphere += 2
      return {
        size,
        atmosphere: 0,
        hydrosphere: MATH.clamp(hydrosphere, 0, 10),
        composition: window.dice.weightedChoice([
          { v: 'rocky', w: 5 },
          { v: 'metallic', w: zone === 'outer' ? 0 : 1 }
        ])
      }
    }
  },
  snowball: {
    biosphere: true,
    color: '#ADD8E6',
    description:
      'These worlds are composed of mostly ice and some rock. They may have varying degrees of activity, ranging from completely cold and still to cryo-volcanically active with extensive subsurface oceans.',
    roll: ({ zone, sizeOverride }: RollParams) => {
      const size = sizeOverride ?? window.dice.roll(1, 5) - 1
      const atmosphere = window.dice.roll(1, 6) <= 4 ? 0 : 1
      const hydrosphere = window.dice.roll(1, 6) <= 2 ? 10 : Math.max(1, window.dice.roll(2, 6) - 2)
      let chemRoll = window.dice.roll(1, 6)
      if (zone === 'outer') chemRoll += 2
      const chemistry = chemRoll <= 4 ? 'water' : chemRoll <= 6 ? 'ammonia' : 'methane'
      return {
        size,
        atmosphere,
        hydrosphere,
        chemistry,
        composition: 'ice'
      }
    }
  },
  stygian: {
    color: '#2F4F4F',
    description:
      "These are worlds that were directly affected by their primary's transition from the main sequence; they are melted and blasted lumps.",
    roll: ({ zone, sizeOverride }: RollParams) => {
      const size = sizeOverride ?? window.dice.roll(1, 5) - 1
      return {
        size,
        atmosphere: 0,
        hydrosphere: 0,
        composition: window.dice.weightedChoice([
          { v: 'rocky', w: 5 },
          { v: 'metallic', w: zone === 'outer' ? 0 : 1 }
        ])
      }
    }
  },
  tectonic: {
    biosphere: true,
    color: '#7CFC00',
    description:
      'These are worlds with active plate tectonics and large bodies of surface liquid, allowing for stable atmospheres and a high likelihood of life.',
    roll: ({ star, zone, primary, sizeOverride }: RollParams) => {
      const size = sizeOverride ?? window.dice.roll(1, 6) + 4
      let chemRoll = window.dice.roll(1, 6)
      if (star.spectralClass === 'K') chemRoll += 2
      if (star.spectralClass === 'M') chemRoll += 4
      if (zone === 'outer') chemRoll += 2
      const secondChemRoll = window.dice.roll(2, 6)
      const chemistry =
        primary || chemRoll <= 6
          ? secondChemRoll <= 8
            ? 'water'
            : secondChemRoll <= 11
            ? 'sulfur'
            : 'chlorine'
          : chemRoll <= 8
          ? 'ammonia'
          : 'methane'
      const atmosphere =
        chemistry === 'water'
          ? MATH.clamp(window.dice.roll(2, 6) + size - 7, 2, 9)
          : window.dice.weightedChoice([
              { v: 10, w: 8 },
              { v: 11, w: 2 }
            ])
      const hydrosphere = window.dice.randint(4, 9)
      return {
        size,
        atmosphere,
        hydrosphere,
        chemistry,
        subtype:
          chemistry === 'water'
            ? 'gaian'
            : chemistry === 'sulfur'
            ? 'thio-gaian'
            : chemistry === 'chlorine'
            ? 'chloritic-gaian'
            : chemistry === 'ammonia'
            ? 'amunian'
            : 'tartarian',
        composition: 'rocky'
      }
    }
  },
  telluric: {
    color: '#8B0000',
    description:
      'These are worlds with geo-activity but no hydrological cycle at all, leading to dense runaway-greenhouse atmospheres.',
    roll: ({ deviation, sizeOverride }: RollParams) => {
      const size = sizeOverride ?? window.dice.roll(1, 6) + 4
      return {
        size,
        atmosphere: window.dice.choice([11, 12, 12]),
        hydrosphere: 0,
        biosphere: 0,
        composition: 'rocky',
        subtype: deviation >= 1 ? 'phosphorian' : 'cytherean'
      }
    }
  },
  vesperian: {
    biosphere: true,
    color: '#DAA520',
    description:
      'These worlds are tide-locked to their primary, but at a distance that permits surface liquid and the development of life.',
    tidalLock: true,
    roll: ({ primary, sizeOverride }: RollParams) => {
      const size = sizeOverride ?? window.dice.roll(1, 6) + 4
      const chemRoll = window.dice.roll(1, 6)
      const chemistry = primary || chemRoll <= 11 ? 'water' : 'chlorine'
      const atmosphere =
        chemistry === 'water'
          ? MATH.clamp(window.dice.roll(2, 6) + size - 7, 2, 9)
          : window.dice.weightedChoice([
              { v: 10, w: 8 },
              { v: 11, w: 2 }
            ])
      const hydrosphere = Math.max(1, window.dice.roll(2, 6) - 2)
      return {
        size,
        atmosphere,
        hydrosphere,
        chemistry,
        composition: 'rocky'
      }
    }
  }
}
