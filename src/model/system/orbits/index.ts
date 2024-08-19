import { range, scaleLinear } from 'd3'
import { MATH } from '../../utilities/math'
import {
  Orbit,
  OrbitDesirabilityParams,
  OrbitTypeDetails,
  OrbitSpawnParams,
  OrbitGroupDetails
} from './types'
import { LANGUAGE } from '../../languages'
import { DICE } from '../../utilities/dice'

function getRareDwarfType() {
  const randomRoll = window.dice.roll(1, 6)
  if (randomRoll <= 4) return 'hebean'
  return 'geo-tidal'
}

function getOuterRareDwarfType() {
  const randomRoll = window.dice.roll(1, 6)
  if (randomRoll <= 3) return 'hebean'
  if (randomRoll <= 5) return 'geo-cyclic'
  return 'geo-tidal'
}

const groups: Record<Orbit['group'], OrbitGroupDetails> = {
  'asteroid belt': {
    type: ({ parent }) => (parent ? 'asteroid' : 'asteroid belt'),
    orbits: () => {
      const roll = window.dice.roll(1, 6)
      return ['asteroid belt' as Orbit['group']].concat(roll <= 4 ? [] : ['dwarf'])
    }
  },
  dwarf: {
    type: ({ zone, impactZone, parent }) => {
      if (impactZone) return 'stygian'
      let roll = window.dice.roll(1, 6)
      switch (zone) {
        case 'epistellar': {
          if (parent?.group === 'asteroid belt') roll -= 2
          if (roll <= 3) return 'rockball'
          if (roll <= 5) return 'meltball'
          return getRareDwarfType()
        }
        case 'inner': {
          if (parent?.group === 'asteroid belt') roll -= 2
          if (parent?.group === 'helian') roll += 1
          if (parent?.group === 'jovian') roll += 2
          if (roll <= 4) return 'rockball'
          if (roll <= 5) return 'geo-cyclic'
          if (roll === 7) return 'meltball'
          return getRareDwarfType()
        }
        case 'outer': {
          if (parent?.group === 'asteroid belt') roll -= 1
          if (parent?.group === 'helian') roll += 1
          if (parent?.group === 'jovian') roll += 2
          if (roll <= 3) return 'snowball'
          if (roll <= 6) return 'rockball'
          if (roll === 7) return 'meltball'
          return getOuterRareDwarfType()
        }
      }
    },
    orbits: () => {
      const roll = window.dice.roll(1, 6)
      return roll <= 5 ? [] : ['dwarf']
    }
  },
  terrestrial: {
    type: ({ zone, impactZone, parent }) => {
      if (impactZone) return 'acheronian'
      switch (zone) {
        case 'epistellar': {
          const roll = window.dice.roll(1, 6)
          if (roll <= 4) return 'jani-lithic'
          if (roll === 5 && !parent) return 'vesperian'
          return 'telluric'
        }
        case 'inner': {
          const roll = window.dice.roll(2, 6)
          if (roll <= 4) return 'telluric'
          if (roll <= 6) return 'arid'
          if (roll <= 8) return 'oceanic'
          if (roll <= 10) return 'tectonic'
          return 'telluric'
        }
        case 'outer': {
          let roll = window.dice.roll(1, 6)
          if (parent && parent?.group !== 'asteroid belt') roll += 2
          if (roll <= 4) return 'arid'
          if (roll <= 6) return 'tectonic'
          return 'oceanic'
        }
      }
    },
    orbits: () => {
      const roll = window.dice.roll(1, 6)
      return roll <= 4
        ? []
        : roll === 5
        ? ['dwarf']
        : range(window.dice.roll(1, 3)).map(() => 'dwarf')
    }
  },
  helian: {
    type: ({ zone, impactZone }) => {
      if (impactZone) return 'asphodelian'
      const roll = window.dice.roll(1, 6)
      switch (zone) {
        case 'epistellar':
          if (roll <= 5) return 'helian'
          return 'asphodelian'
        case 'inner':
          if (roll <= 4) return 'helian'
          return 'panthalassic'
        case 'outer':
          return 'helian'
      }
    },
    orbits: () => {
      const satellites = Math.max(0, window.dice.roll(1, 6) - 3)
      const roll = satellites > 0 ? window.dice.roll(1, 6) : 0
      return roll <= 5
        ? range(satellites).map(() => 'dwarf' as Orbit['group'])
        : range(satellites - 1)
            .map(() => 'dwarf' as Orbit['group'])
            .concat(['terrestrial'])
    }
  },
  jovian: {
    type: ({ zone, impactZone }) => {
      if (impactZone) return 'chthonian'
      const roll = window.dice.roll(1, 6)
      switch (zone) {
        case 'epistellar':
          if (roll <= 5) return 'jovian'
          return 'chthonian'
        case 'inner':
          return 'jovian'
        case 'outer':
          return 'jovian'
      }
    },
    orbits: () => {
      const satellites = window.dice.roll(1, 6)
      const roll = window.dice.roll(1, 6)
      return roll <= 5
        ? range(satellites).map(() => 'dwarf' as Orbit['group'])
        : range(satellites - 1)
            .map(() => 'dwarf' as Orbit['group'])
            .concat([(window.dice.roll(1, 6) <= 5 ? 'terrestrial' : 'helian') as Orbit['group']])
    }
  }
}

const biosphereRoll = (min: number, max: number, temp: Orbit['temperature']) => {
  let bio = window.dice.weightedChoice(range(min, max + 1).map((v, i) => ({ v, w: max - min - i })))
  if (temp === 'temperate') bio += 2
  if (temp === 'cold') bio -= 2
  if (temp === 'variable (cold)' || temp === 'variable (hot)') bio -= 3
  if (temp === 'burning' || temp === 'frozen') bio -= 6
  return bio
}

const details: Record<Orbit['type'], OrbitTypeDetails> = {
  acheronian: {
    color: '#848484',
    description:
      "These are worlds that were directly affected by their primary's transition from the main sequence; the atmosphere and oceans have been boiled away, leaving a scorched, dead planet.",
    roll: () => {
      const size = window.dice.randint(1, 6) + 4
      return { size, atmosphere: 1, hydrosphere: 0, biosphere: 0 }
    }
  },
  arid: {
    color: '#DEB887',
    description:
      'These are worlds with limited amounts of surface liquid, that maintain an equilibrium with the help of their tectonic activity and their biosphere.',
    roll: ({ star, zone, temperature }) => {
      const size = window.dice.roll(1, 6) + 4
      const hydrosphere = window.dice.randint(1, 3)
      let chemMod = 0
      if (star.class.spectral === 'K') chemMod += 2
      if (star.class.spectral === 'M') chemMod += 4
      if (zone === 'outer') chemMod += 2
      const chemRoll = window.dice.roll(1, 6) + chemMod
      const chemistry = chemRoll <= 6 ? 'water' : chemRoll <= 8 ? 'ammonia' : 'methane'
      const ageMod = chemistry === 'water' ? 0 : chemistry === 'ammonia' ? 1 : 3
      const biosphere =
        star.age >= 4 + ageMod
          ? biosphereRoll(2, 13, temperature)
          : star.age >= window.dice.roll(1, 3) + ageMod
          ? biosphereRoll(0, 3, temperature)
          : 0
      const atmosphere =
        biosphere >= 3 && chemistry === 'water'
          ? MATH.clamp(window.dice.roll(2, 6) - 7 + size, 2, 9)
          : window.dice.weightedChoice([
              { v: 10, w: 9 },
              { v: 11, w: 1 }
            ])
      return {
        size,
        atmosphere,
        hydrosphere,
        biosphere,
        chemistry,
        subtype:
          chemistry === 'water' ? 'darwinian' : chemistry === 'ammonia' ? 'saganian' : 'asimovian'
      }
    }
  },
  asphodelian: {
    color: '#778899',
    description:
      "These are worlds that were directly affected by their primary's transition from the main sequence; their atmosphere has been boiled away, leaving the surface exposed.",
    roll: () => {
      const size = window.dice.randint(1, 6) + 9
      return { size, atmosphere: 1, hydrosphere: 0, biosphere: 0 }
    }
  },
  'asteroid belt': {
    color: '#808080',
    description:
      'These are bodies too small to sustain hydrostatic equilibrium; nearly all asteroids and comets are small bodies.',
    roll: () => {
      return { size: -1, atmosphere: 0, hydrosphere: 0, biosphere: 0 }
    }
  },
  asteroid: {
    color: '#808080',
    description:
      'These are bodies too small to sustain hydrostatic equilibrium; nearly all asteroids and comets are small bodies.',
    roll: () => {
      return { size: 0, atmosphere: 0, hydrosphere: 0, biosphere: 0 }
    }
  },
  chthonian: {
    color: '#A52A2A',
    description:
      "These are worlds that were directly affected by their primary's transition from the main sequence, or that have simply spent too long in a tight epistellar orbit; their atmospheres have been stripped away.",
    roll: () => {
      return { size: 15, atmosphere: 1, hydrosphere: 0, biosphere: 0 }
    }
  },
  'geo-cyclic': {
    color: '#782fe0',
    description:
      'These are worlds with little liquid, that move through a slow geological cycle of a gradual build-up, a short wet and clement period, and a long decline.',
    roll: ({ star, zone, temperature }) => {
      const size = window.dice.roll(1, 6) - 1
      const atmosphereRoll = Math.max(window.dice.roll(1, 6), 1)
      const atmosphere =
        atmosphereRoll > 3
          ? window.dice.weightedChoice([
              { v: 10, w: 9 },
              { v: 11, w: 1 }
            ])
          : 1
      const hydrosphere = Math.max(
        0,
        window.dice.roll(2, 6) + size - 7 - (atmosphere === 1 ? 4 : 0)
      )
      const chemRoll = window.dice.roll(1, 6) + (zone === 'outer' ? 2 : 0)
      const chemistry = chemRoll <= 4 ? 'water' : chemRoll <= 6 ? 'ammonia' : 'methane'
      const ageMod = chemistry === 'water' ? 0 : chemistry === 'ammonia' ? 1 : 3
      const biosphere =
        star.age >= 4 + ageMod && atmosphere !== 1
          ? biosphereRoll(1, 6, temperature) + size - 2
          : star.age >= window.dice.roll(1, 3) + ageMod
          ? atmosphere === 1
            ? biosphereRoll(1, 6, temperature) - 4
            : biosphereRoll(0, 3, temperature)
          : 0
      return {
        size,
        atmosphere,
        hydrosphere,
        biosphere,
        chemistry,
        subtype:
          chemistry === 'water' ? 'arean' : chemistry === 'ammonia' ? 'utgardian' : 'titanian'
      }
    }
  },
  'geo-tidal': {
    color: '#4682B4',
    description:
      'These are worlds that, through tidal-flexing, have a geological cycle similar to plate tectonics, that supports surface liquid and atmosphere.',
    roll: ({ star, zone, temperature }) => {
      const size = window.dice.roll(1, 6) - 1
      const hydrosphere = window.dice.roll(2, 3) - 2
      let chemMod = 0
      if (zone === 'epistellar') chemMod -= 2
      if (zone === 'outer') chemMod += 2
      const chemRoll = window.dice.roll(1, 6) + chemMod
      const chemistry = chemRoll <= 4 ? 'water' : chemRoll <= 6 ? 'ammonia' : 'methane'
      const ageMod = chemistry === 'water' ? 0 : chemistry === 'ammonia' ? 1 : 3
      const biosphere =
        star.age >= 4 + ageMod
          ? biosphereRoll(2, 13, temperature)
          : star.age >= window.dice.roll(1, 3) + ageMod
          ? biosphereRoll(0, 3, temperature)
          : 0
      const atmosphere =
        biosphere >= 3 && chemistry === 'water'
          ? MATH.clamp(window.dice.roll(2, 6) - 7 + size, 2, 9)
          : window.dice.weightedChoice([
              { v: 10, w: 9 },
              { v: 11, w: 1 }
            ])
      return {
        size,
        atmosphere,
        hydrosphere,
        biosphere,
        chemistry,
        subtype: chemistry === 'water' ? 'promethean' : chemistry === 'ammonia' ? 'burian' : 'atlan'
      }
    }
  },
  hebean: {
    color: '#bce02f',
    description:
      'These are highly active worlds, due to tidal flexing, but with some regions of stability; the larger ones may be able to maintain some atmosphere and surface liquid.',
    roll: () => {
      const size = window.dice.roll(1, 6) - 1
      let atmosphere = Math.max(1, window.dice.roll(1, 6) + size - 6)
      if (atmosphere >= 2) atmosphere = 10
      const hydrosphere = MATH.clamp(window.dice.roll(2, 6) + size - 11, 0, 11)
      return { size, atmosphere, hydrosphere, biosphere: 0 }
    }
  },
  helian: {
    color: '#FFA500',
    description:
      'These are typical helian or "subgiant" worlds - large enough to retain helium atmospheres.',
    roll: () => {
      const size = window.dice.roll(1, 6) + 9
      const hydroRoll = window.dice.roll(1, 6)
      const hydrosphere = hydroRoll <= 2 ? 0 : hydroRoll <= 4 ? window.dice.roll(2, 6) - 1 : 12
      return { size, atmosphere: 13, hydrosphere, biosphere: 0 }
    }
  },
  'jani-lithic': {
    color: '#D2B48C',
    description:
      'These worlds, tide-locked to the primary, are rocky, dry, and geologically active.',
    roll: () => {
      const size = window.dice.roll(1, 6) + 4
      const atmosphereRoll = window.dice.roll(1, 6)
      const atmosphere =
        atmosphereRoll <= 3
          ? 0
          : window.dice.weightedChoice([
              { v: 10, w: 9 },
              { v: 11, w: 1 }
            ])
      return { size, atmosphere, hydrosphere: 0, biosphere: 0 }
    }
  },
  jovian: {
    color: '#FFDAB9',
    description:
      'These are huge worlds with helium-hydrogen envelopes and compressed cores; the largest emit more heat than they absorb.',
    roll: ({ star, zone, temperature }) => {
      const bioRoll = window.dice.roll(1, 6)
      const biosphere =
        bioRoll <= 5
          ? 0
          : star.age >= 7
          ? biosphereRoll(2, 10, temperature)
          : star.age >= window.dice.roll(1, 6)
          ? biosphereRoll(0, 3, temperature)
          : 0
      let chemRoll = window.dice.roll(1, 6)
      if (zone === 'epistellar') chemRoll -= 2
      if (zone === 'outer') chemRoll += 2
      const chemistry = chemRoll <= 3 ? 'water' : 'ammonia'
      const life = biosphere > 0
      return {
        size: 15,
        atmosphere: 14,
        hydrosphere: 13,
        biosphere,
        chemistry: life ? chemistry : undefined,
        subtype: life ? (chemistry === 'water' ? 'brammian' : 'khonsonian') : undefined
      }
    }
  },
  meltball: {
    color: '#FF4500',
    description:
      'These are dwarfs with molten or semi-molten surfaces, either from extreme tidal flexing, or extreme approach to a star.',
    roll: () => {
      const size = window.dice.randint(1, 6) - 1
      return { size, atmosphere: 1, hydrosphere: 12, biosphere: 0 }
    }
  },
  oceanic: {
    color: '#1E90FF',
    description:
      'These are worlds with a continuous hydrological cycle and deep oceans, due to either dense greenhouse atmosphere or active plate tectonics.',
    roll: ({ star, zone, temperature }) => {
      const size = window.dice.roll(1, 6) + 4
      let chemRoll = window.dice.roll(1, 6)
      if (star.class.spectral === 'K') chemRoll += 2
      if (star.class.spectral === 'M') chemRoll += 4
      if (zone === 'outer') chemRoll += 2
      const chemistry = chemRoll <= 6 ? 'water' : chemRoll <= 8 ? 'ammonia' : 'methane'
      const ageMod = chemistry === 'water' ? 0 : chemistry === 'ammonia' ? 1 : 3
      const biosphere =
        star.age >= 4 + ageMod
          ? biosphereRoll(2, 13, temperature)
          : star.age >= window.dice.roll(1, 3) + ageMod
          ? biosphereRoll(0, 3, temperature)
          : 0
      const atmosphereRoll = window.dice.roll(1, 6)
      const atmosphere =
        chemistry === 'water'
          ? MATH.clamp(
              window.dice.roll(2, 6) +
                size -
                6 -
                (star.class.spectral === 'K' || star.class.luminosity === 'IV'
                  ? 1
                  : star.class.spectral === 'M'
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
        hydrosphere: 11,
        biosphere,
        chemistry,
        subtype: chemistry === 'water' ? 'pelagic' : chemistry === 'ammonia' ? 'nunnic' : 'teathic'
      }
    }
  },
  panthalassic: {
    color: '#4169E1',
    description:
      'These are massive worlds, aborted gas giants, largely composed of water and hydrogen.',
    roll: ({ star, temperature }) => {
      const size = window.dice.roll(1, 6) + 9
      let chemRoll = window.dice.roll(1, 6)
      if (star.class.spectral === 'K') chemRoll += 2
      if (star.class.spectral === 'M') chemRoll += 4
      const secondChemRoll = window.dice.roll(2, 6)
      const chemistry =
        chemRoll <= 6
          ? secondChemRoll <= 8
            ? 'water'
            : secondChemRoll <= 11
            ? 'sulfur'
            : 'chlorine'
          : 'methane'
      const ageMod = chemRoll <= 6 ? 0 : chemRoll <= 8 ? 1 : 3
      const biosphere =
        star.age >= 4 + ageMod
          ? biosphereRoll(2, 13, temperature)
          : star.age >= window.dice.roll(1, 3) + ageMod
          ? biosphereRoll(0, 3, temperature)
          : 0
      const atmosphere = Math.min(window.dice.roll(1, 6) + 8, 13)
      return { size, atmosphere, hydrosphere: 11, biosphere, chemistry }
    }
  },
  rockball: {
    color: '#8B7D7B',
    description:
      'These are mostly dormant worlds, with surfaces largely unchanged since the early period of planetary formation.',
    roll: ({ zone }) => {
      const size = window.dice.roll(1, 6) - 1
      let hydrosphere = window.dice.roll(2, 6) + size - 11
      if (zone === 'epistellar') hydrosphere -= 2
      if (zone === 'outer') hydrosphere += 2
      return { size, atmosphere: 0, hydrosphere: MATH.clamp(hydrosphere, 0, 10), biosphere: 0 }
    }
  },
  snowball: {
    color: '#ADD8E6',
    description:
      'These worlds are composed of mostly ice and some rock. They may have varying degrees of activity, ranging from completely cold and still to cryo-volcanically active with extensive subsurface oceans.',
    roll: ({ star, zone, temperature }) => {
      const size = window.dice.roll(1, 6) - 1
      const atmosphere = window.dice.roll(1, 6) <= 4 ? 0 : 1
      const hydrosphere =
        window.dice.roll(1, 6) <= 3
          ? window.dice.weightedChoice([
              { v: 10, w: 9 },
              { v: 11, w: 1 }
            ])
          : Math.max(1, window.dice.roll(2, 6) - 2)
      let chemRoll = window.dice.roll(1, 6)
      if (zone === 'outer') chemRoll += 2
      const chemistry = chemRoll <= 4 ? 'water' : chemRoll <= 6 ? 'ammonia' : 'methane'
      const ageMod = chemistry === 'water' ? 0 : chemistry === 'ammonia' ? 1 : 3
      const subsurfaceOceans = hydrosphere < 10
      const biosphere = subsurfaceOceans
        ? star.age >= window.dice.roll(1, 6)
          ? biosphereRoll(1, 6, temperature) - 3
          : star.age >= 6 + ageMod
          ? biosphereRoll(1, 6, temperature) + size - 2
          : 0
        : 0
      return { size, atmosphere, hydrosphere, biosphere: Math.max(0, biosphere) }
    }
  },
  stygian: {
    color: '#2F4F4F',
    description:
      "These are worlds that were directly affected by their primary's transition from the main sequence; they are melted and blasted lumps.",
    roll: () => {
      return { size: window.dice.roll(1, 6) - 1, atmosphere: 0, hydrosphere: 0, biosphere: 0 }
    }
  },
  tectonic: {
    color: '#7CFC00',
    description:
      'These are worlds with active plate tectonics and large bodies of surface liquid, allowing for stable atmospheres and a high likelihood of life.',
    roll: ({ star, zone, temperature }) => {
      const size = window.dice.roll(1, 6) + 4
      let chemRoll = window.dice.roll(1, 6)
      if (star.class.spectral === 'K') chemRoll += 2
      if (star.class.spectral === 'M') chemRoll += 4
      if (zone === 'outer') chemRoll += 2
      const secondChemRoll = window.dice.roll(2, 6)
      const chemistry =
        chemRoll <= 6
          ? secondChemRoll <= 8
            ? 'water'
            : secondChemRoll <= 11
            ? 'sulfur'
            : 'chlorine'
          : chemRoll <= 8
          ? 'ammonia'
          : 'methane'
      const ageMod = chemRoll <= 6 ? 0 : chemRoll <= 8 ? 1 : 3
      const biosphere =
        star.age >= 4 + ageMod
          ? biosphereRoll(2, 13, temperature)
          : star.age >= window.dice.roll(1, 3) + ageMod
          ? biosphereRoll(0, 3, temperature)
          : 0
      const suitableBio = biosphere >= 3
      const atmosphere =
        suitableBio && chemistry === 'water'
          ? MATH.clamp(window.dice.roll(2, 6) + size - 7, 2, 9)
          : window.dice.weightedChoice([
              { v: 10, w: 9 },
              { v: 11, w: 1 }
            ])
      const hydrosphere = window.dice.randint(4, 9)
      return {
        size,
        atmosphere,
        hydrosphere,
        biosphere,
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
            : 'tartarian'
      }
    }
  },
  telluric: {
    color: '#8B0000',
    description:
      'These are worlds with geo-activity but no hydrological cycle at all, leading to dense runaway-greenhouse atmospheres.',
    roll: () => {
      const size = window.dice.roll(1, 6) + 4
      const hydrosphere = window.dice.roll(1, 6) >= 4 ? 0 : 12
      return {
        size,
        atmosphere: 12,
        hydrosphere,
        biosphere: 0
      }
    }
  },
  vesperian: {
    color: '#DAA520',
    description:
      'These worlds are tide-locked to their primary, but at a distance that permits surface liquid and the development of life.',
    roll: ({ star }) => {
      const size = window.dice.roll(1, 6) + 4
      const chemRoll = window.dice.roll(1, 6)
      const chemistry = chemRoll <= 11 ? 'water' : 'chlorine'
      const biosphere =
        star.age >= 4
          ? biosphereRoll(1, 12, 'hot')
          : star.age >= window.dice.roll(1, 3)
          ? biosphereRoll(0, 3, 'hot')
          : 0
      const suitableBio = biosphere >= 3
      const atmosphere =
        suitableBio && chemistry === 'water'
          ? MATH.clamp(window.dice.roll(2, 6) + size - 7, 2, 9)
          : window.dice.weightedChoice([
              { v: 10, w: 9 },
              { v: 11, w: 1 }
            ])
      const hydrosphere = Math.max(1, window.dice.roll(2, 6) - 2)
      return {
        size,
        atmosphere,
        hydrosphere,
        biosphere,
        chemistry
      }
    }
  }
}

const sizes: Record<string, string> = {
  '-1': 'asteroid belt',
  '0': '≤800 km, neg. gravity',
  '1': '1,600 km, 0.05 G',
  '2': '3,200 km, 0.15 G (Triton, Luna, Europa)',
  '3': '4,800 km, 0.25 G (Mercury, Ganymede)',
  '4': '6,400 km, 0.35 G (Mars)',
  '5': '8,000 km, 0.45 G',
  '6': '9,600 km, 0.70 G',
  '7': '11,200 km, 0.9 G',
  '8': '12,800 km, 1.0 G (Terra)',
  '9': '14,400 km, 1.25 G',
  '10': '≥16,000 km, ≥1.4 G',
  '11': 'Helian sizes',
  '12': 'Helian sizes',
  '13': 'Helian sizes',
  '14': 'Helian sizes',
  '15': 'Jovian sizes'
}

const atmospheres: Record<string, string> = {
  '0': 'Vacuum',
  '1': 'Trace',
  '2': 'Very Thin Tainted',
  '3': 'Very Thin Breathable',
  '4': 'Thin Tainted',
  '5': 'Thin Breathable',
  '6': 'Standard Breathable',
  '7': 'Standard Tainted',
  '8': 'Dense Breathable',
  '9': 'Dense Tainted',
  '10': 'Exotic',
  '11': 'Corrosive',
  '12': 'Insidious',
  '13': 'Super-High Density',
  '14': 'Gas Giant Envelope'
}

const hydrospheres: Record<string, string> = {
  '0': '≤5% (Trace)',
  '1': '≤15% (Dry / tiny ice caps)',
  '2': '≤25% (Small seas / ice caps)',
  '3': '≤35% (Small oceans / large ice caps)',
  '4': '≤45% (Wet)',
  '5': '≤55% (Large oceans)',
  '6': '≤65%',
  '7': '≤75% (Terra)',
  '8': '≤85% (Water world)',
  '9': '≤95% (No continents)',
  '10': '≤100% (Total coverage)',
  '11': 'Superdense (incredibly deep world oceans)',
  '12': 'Intense Volcanism (molten surface)',
  '13': 'Gas Giant Core'
}

const biospheres: Record<string, string> = {
  '0': 'Sterile',
  '1': 'Building Blocks (amino acids, or equivalent)',
  '2': 'Single-celled organisms',
  '3': 'Producers (atmosphere begins to transform)',
  '4': 'Multi-cellular organisms',
  '5': 'Complex single-celled life (nucleic cells, or equivalent)',
  '6': 'Complex multi-cellular life (microscopic animals)',
  '7': 'Small macroscopic life',
  '8': 'Large macroscopic life',
  '9': 'Simple global ecology (life goes out of the oceans and onto land or into the air, etc.)',
  '10': 'Complex global ecology',
  '11': 'Proto-sapience',
  '12': 'Full sapience',
  '13': 'Trans-sapience (able to deliberately alter their own evolution, minimum Tech Level C)'
}

const populations: Record<string, string> = {
  '0': 'Uninhabited',
  '1': 'Few',
  '2': 'Hundreds',
  '3': 'Thousands',
  '4': 'Tens of thousands',
  '5': 'Hundreds of thousands',
  '6': 'Millions',
  '7': 'Tens of millions',
  '8': 'Hundreds of millions',
  '9': 'Billions',
  '10': 'Tens of billions',
  '11': 'Hundreds of billions',
  '12': 'Trillions'
}

const governments: Record<string, string> = {
  '0': 'None (tends toward family/clan/tribal)',
  '1': 'Company or corporation',
  '2': 'Participatory democracy',
  '3': 'Self-perpetuating oligarchy',
  '4': 'Representative democracy',
  '5': 'Feudal technocracy',
  '6': 'Captive government (colony or conquered territory)',
  '7': 'Balkanized',
  '8': 'Civil service bureaucracy',
  '9': 'Impersonal bureaucracy',
  '10': 'Charismatic dictator',
  '11': 'Non-charismatic dictator',
  '12': 'Charismatic oligarchy',
  '13': 'Theocracy',
  '14': 'Supreme authority',
  '15': 'Hive-mind collective'
}

const lawLevel = (law: number) => {
  if (law === 0) return 'No restrictions'
  if (law === 1) return 'Only restrictions upon WMD and other dangerous technologies'
  if (law <= 4) return 'Light restrictions: heavy weapons, narcotics, alien technology'
  if (law <= 7)
    return 'Heavy restrictions: most weapons, specialized tools and information, foreigners'
  return 'Extreme restrictions: extensive monitoring and limitations, free speech curtailed'
}

const industryLevel = (industry: number) => {
  if (industry === 0) return 'No industry. Everything must be imported.'
  if (industry <= 3) return 'Primitive. Mostly only raw materials made locally.'
  if (industry <= 6) return 'Industrial. Local tools maintained, some produced'
  if (industry <= 9) return 'Pre-Stellar. Production and maintenance of space technologies.'
  if (industry <= 11) return 'Early Stellar. Support for A.I. and local starship production.'
  if (industry <= 14) return 'Average Stellar. Support for terraforming, flying cities, clones.'
  return 'High Stellar. Support for highest of the high tech.'
}

const habitable = ({
  star,
  zone,
  type,
  hydrosphere,
  size,
  atmosphere,
  temperature,
  asteroid
}: OrbitDesirabilityParams) => {
  if (type === 'asteroid belt') return 0
  let roll = asteroid ? window.dice.roll(1, 6) - window.dice.roll(1, 6) : 0
  // dry world
  if (!asteroid && hydrosphere === 0) roll -= 1
  // extreme environment
  if (
    !asteroid &&
    (size >= 13 ||
      atmosphere >= 11 ||
      hydrosphere === 12 ||
      temperature === 'burning' ||
      temperature === 'frozen')
  )
    roll -= 2
  // habitable world
  if (
    size >= 1 &&
    size <= 11 &&
    atmosphere >= 2 &&
    atmosphere <= 9 &&
    hydrosphere >= 0 &&
    hydrosphere <= 11
  ) {
    // garden world
    if (
      size >= 5 &&
      size <= 10 &&
      atmosphere >= 4 &&
      atmosphere <= 9 &&
      hydrosphere >= 4 &&
      hydrosphere <= 8
    )
      roll += 5
    // water world
    else if (hydrosphere >= 10) roll += 3
    // poor world
    else if (atmosphere <= 6 && hydrosphere <= 3) roll += 2
    else roll += 4
  }
  // high gravity
  if (size >= 10 && atmosphere < 14) roll -= 1
  // lifebelt
  if (zone === 'inner') {
    if (star.class.spectral === 'M') roll += 1
    else if (
      star.class.spectral !== 'O' &&
      star.class.spectral !== 'B' &&
      star.class.luminosity !== 'Ib' &&
      star.class.luminosity !== 'Ia' &&
      star.class.luminosity !== 'II' &&
      star.class.luminosity !== 'III'
    )
      roll += 2
  }
  // tiny world
  if (!asteroid && size === 0) roll -= 1
  // t-prime atmosphere
  if (atmosphere === 6 || atmosphere === 8) roll += 1
  return roll
}

const garden = () => {
  const size = window.dice.randint(5, 10)
  const atmosphere = MATH.clamp(window.dice.roll(2, 6) + size - 7, 4, 9)
  const hydrosphere = window.dice.randint(4, 8)
  return {
    atmosphere,
    hydrosphere,
    size,
    chemistry: 'water' as const,
    subtype: 'gaian',
    biosphere: 13
  }
}

const _colors: Record<string, string> = {}

export const ORBIT = {
  atmospheres,
  biospheres,
  populations,
  governments,
  lawLevel,
  industryLevel,
  colors: {
    set: () => {
      DICE.swap('planet', () => {
        window.galaxy.orbits.forEach(orbit => {
          if (!_colors[orbit.type]) _colors[orbit.type] = details[orbit.type].color
        })
      })
    },
    get: () => _colors
  },
  describe: (orbit: Orbit) => details[orbit.type].description,
  hydrospheres,
  name: (orbit: Orbit) => {
    if (!orbit.name) {
      const system = window.galaxy.systems[orbit.system]
      const nation = window.galaxy.nations[system.nation]
      orbit.name = LANGUAGE.word.unique({ key: 'orbit', lang: nation.language })
    }
    return orbit.name
  },
  orbits: (orbit: Orbit): Orbit[] => orbit.orbits.map(moon => [moon, ...ORBIT.orbits(moon)]).flat(),
  sizes,
  parent: (orbit: Orbit) =>
    orbit.parent.type === 'star'
      ? window.galaxy.stars[orbit.parent.idx]
      : window.galaxy.orbits[orbit.parent.idx],
  spawn: ({
    star,
    zone,
    impactZone,
    group,
    parent,
    angle,
    distance,
    deviation,
    homeworld
  }: OrbitSpawnParams): Orbit => {
    const selected =
      group ??
      (homeworld
        ? 'terrestrial'
        : window.dice.weightedChoice<Orbit['group']>([
            { v: 'asteroid belt', w: 2 },
            { v: 'dwarf', w: 2 },
            { v: 'terrestrial', w: 3 },
            { v: 'helian', w: 1 },
            { v: 'jovian', w: zone === 'outer' ? 2 : 0.5 }
          ]))
    const type = homeworld ? 'tectonic' : groups[selected].type({ zone, impactZone, parent })
    const temperature: Orbit['temperature'] =
      type === 'telluric' || type === 'meltball'
        ? 'burning'
        : type === 'vesperian'
        ? 'variable (hot)'
        : deviation >= 1.1
        ? 'frozen'
        : deviation >= 0.9
        ? 'variable (cold)'
        : deviation >= 0.25
        ? 'cold'
        : deviation >= -0.25
        ? 'temperate'
        : deviation >= -0.9
        ? 'hot'
        : deviation >= -1.1
        ? 'variable (hot)'
        : 'burning'
    const detail = homeworld ? garden() : details[type].roll({ star, zone, temperature })
    const { subtype, atmosphere, hydrosphere, chemistry, biosphere } = detail
    let { size } = detail
    const asteroidBelt = selected === 'asteroid belt'
    const asteroidMember = parent?.group === 'asteroid belt'
    size = asteroidMember ? size : Math.max(0, Math.min((parent?.size ?? Infinity) - 3, size))
    const r = scaleLinear([-1, 0, 5, 10, 15], [0, 1, 3, 6, 10])(size)
    const finalDistance = asteroidMember ? 0 : distance + r + (asteroidBelt ? 10 : 0)
    const habitability = habitable({
      star,
      zone,
      type,
      hydrosphere,
      atmosphere,
      size,
      temperature,
      asteroid: asteroidMember
    })
    const habitation =
      biosphere >= 12
        ? 'homeworld'
        : window.dice.roll(2, 6) - 2 < habitability && habitability >= 0
        ? 'colony'
        : window.dice.roll(1, 6) < 4
        ? 'outpost'
        : 'none'
    const homeworldPop = habitability + window.dice.roll(1, 3) - window.dice.roll(1, 3)
    const population =
      habitation === 'homeworld'
        ? homeworldPop
        : habitation === 'colony'
        ? window.dice.randint(4, Math.max(4, homeworldPop - 1))
        : habitation === 'outpost'
        ? Math.max(0, Math.min(habitability + window.dice.roll(1, 3), 4))
        : 0
    let government = population > 0 ? population + window.dice.roll(2, 6) - 7 : 0
    if (habitation === 'outpost') government = Math.min(6, government)
    if (homeworld && government === 6) government = 7
    government = Math.max(0, government)
    const law = Math.max(0, government === 0 ? 0 : government + window.dice.roll(2, 6) - 7)
    const industry =
      population +
      window.dice.roll(2, 6) -
      7 +
      (law >= 1 && law <= 3
        ? 1
        : law >= 6 && law <= 9
        ? -1
        : law >= 10 && law <= 12
        ? -2
        : law === 13
        ? -3
        : 0) +
      (atmosphere <= 4 ||
      atmosphere === 7 ||
      atmosphere >= 9 ||
      hydrosphere === 12 ||
      temperature === 'burning' ||
      temperature === 'frozen'
        ? 1
        : 0)
    const orbit: Orbit = {
      idx: window.galaxy.orbits.length,
      tag: 'orbit',
      name: '',
      system: star.system,
      angle,
      distance: finalDistance,
      group: selected,
      zone,
      type,
      subtype,
      size,
      atmosphere,
      temperature,
      hydrosphere,
      biosphere: {
        type:
          biosphere <= 0
            ? 'sterile'
            : biosphere <= 6
            ? 'microbial'
            : window.dice.weightedChoice([
                { v: 'human-miscible', w: atmosphere === 10 ? 0 : 2 },
                { v: 'immiscible', w: homeworld ? 0 : 2 },
                { v: 'hybrid', w: homeworld || atmosphere === 10 ? 0 : 1 },
                { v: 'engineered', w: homeworld ? 0 : 0.25 },
                { v: 'remnant', w: homeworld ? 0 : 0.25 }
              ]),
        score: Math.min(homeworld ? 13 : 12, Math.max(0, biosphere))
      },
      chemistry,
      habitability: {
        score: habitability,
        class:
          habitability <= 0
            ? 'inhospitable'
            : habitability <= 2
            ? 'harsh'
            : habitability <= 4
            ? 'marginal'
            : habitability <= 6
            ? 'comfortable'
            : 'paradise'
      },
      habitation,
      population,
      government,
      law,
      industry,
      orbits: [],
      r,
      parent: parent ? { type: 'orbit', idx: parent.idx } : { type: 'star', idx: star.idx }
    }
    window.galaxy.orbits.push(orbit)
    if (selected === 'jovian') orbit.rings = window.dice.roll(1, 6) <= 4 ? 'minor' : 'complex'
    if (selected === 'asteroid belt') {
      console.log()
    }
    if (!parent && (orbit.size > 0 || asteroidBelt)) {
      let subAngle = 0
      let distance = orbit.r + 2
      orbit.orbits = groups[selected].orbits().map(satellite => {
        const moon = ORBIT.spawn({
          parent: orbit,
          zone: orbit.zone,
          group: satellite,
          star,
          impactZone,
          distance: distance,
          angle: subAngle,
          deviation
        })
        subAngle += window.dice.randint(90, 270)
        distance = moon.distance + moon.r + 1
        return moon
      })
      orbit.fullR = distance
      orbit.distance += orbit.fullR - orbit.r
    }
    if (asteroidBelt) orbit.fullR = 10
    return orbit
  }
}
