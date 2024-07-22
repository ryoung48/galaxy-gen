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
    type: () => 'asteroid belt',
    orbits: () => {
      const roll = window.dice.roll(1, 6)
      return roll <= 4 ? [] : ['dwarf']
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
          if (roll === 5) return 'vesperian'
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

const biosphereRoll = (min: number, max: number) =>
  window.dice.weightedChoice(range(min, max + 1).map((v, i) => ({ v, w: max - min - i })))

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
    roll: ({ star, zone }) => {
      const size = window.dice.roll(1, 6) + 4
      const hydrosphere = window.dice.roll(1, 3)
      let chemMod = 0
      if (star.class === 'K-V') chemMod += 2
      if (star.class === 'M-V') chemMod += 4
      if (star.class === 'L') chemMod += 5
      if (zone === 'outer') chemMod += 2
      const chemRoll = window.dice.roll(1, 6) + chemMod
      const chemistry = chemRoll <= 6 ? 'water' : chemRoll <= 8 ? 'ammonia' : 'methane'
      const ageMod = chemistry === 'water' ? 0 : chemistry === 'ammonia' ? 1 : 3
      const biosphere =
        star.age >= 4 + ageMod
          ? Math.max(0, biosphereRoll(0, 3) - (star.class === 'D' ? 3 : 0))
          : star.age >= window.dice.roll(1, 3) + ageMod
          ? biosphereRoll(2, 13)
          : 0
      const atmosphere =
        biosphere >= 3 && chemistry === 'water'
          ? MATH.clamp(window.dice.roll(2, 6) - 7 + size, 2, 9)
          : 10
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
    roll: ({ star, zone }) => {
      const size = window.dice.roll(1, 6) - 1
      const atmosphereRoll = Math.max(window.dice.roll(1, 6) - (star.class === 'D' ? 2 : 0), 1)
      const atmosphere = atmosphereRoll > 3 ? 10 : 1
      const hydrosphere = Math.max(
        0,
        window.dice.roll(2, 6) + size - 7 - (atmosphere === 1 ? 4 : 0)
      )
      const chemRoll = window.dice.roll(1, 6) + (star.class === 'L' || zone === 'outer' ? 2 : 0)
      const chemistry = chemRoll <= 4 ? 'water' : chemRoll <= 6 ? 'ammonia' : 'methane'
      const ageMod = chemistry === 'water' ? 0 : chemistry === 'ammonia' ? 1 : 3
      const biosphere = Math.max(
        star.age >= 4 + ageMod && atmosphere !== 1
          ? biosphereRoll(1, 6) + size - 2
          : star.age >= window.dice.roll(1, 3) + ageMod
          ? atmosphere === 1
            ? biosphereRoll(1, 6) - 4
            : biosphereRoll(0, 3)
          : 0,
        0
      )
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
    roll: ({ star, zone }) => {
      const size = window.dice.roll(1, 6) - 1
      const hydrosphere = window.dice.roll(2, 3) - 2
      let chemMod = 0
      if (star.class === 'L') chemMod += 2
      if (zone === 'epistellar') chemMod -= 2
      if (zone === 'outer') chemMod += 2
      const chemRoll = window.dice.roll(1, 6) + chemMod
      const chemistry = chemRoll <= 4 ? 'water' : chemRoll <= 6 ? 'ammonia' : 'methane'
      const ageMod = chemistry === 'water' ? 0 : chemistry === 'ammonia' ? 1 : 3
      const biosphere = Math.max(
        star.age >= 4 + ageMod
          ? biosphereRoll(2, 13) - (star.class === 'D' ? 3 : 0)
          : star.age >= window.dice.roll(1, 3) + ageMod
          ? biosphereRoll(0, 3)
          : 0,
        0
      )
      const atmosphere =
        biosphere >= 3 && chemistry === 'water'
          ? MATH.clamp(window.dice.roll(2, 6) - 7 + size, 2, 9)
          : 10
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
      let atmosphere = Math.max(1, window.dice.roll(1, 6) + size - 6)
      if (atmosphere >= 2) atmosphere = 10
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
      const atmosphere = atmosphereRoll <= 3 ? 0 : 10
      return { size, atmosphere, hydrosphere: 0, biosphere: 0 }
    }
  },
  jovian: {
    color: '#FFDAB9',
    description:
      'These are huge worlds with helium-hydrogen envelopes and compressed cores; the largest emit more heat than they absorb.',
    roll: ({ star, zone }) => {
      const bioRoll = window.dice.roll(1, 6) + (zone === 'inner' ? 2 : 0)
      const biosphere = Math.max(
        0,
        bioRoll <= 5
          ? 0
          : star.age >= 7
          ? biosphereRoll(2, 10) - (star.class === 'D' ? 3 : 0)
          : star.age >= window.dice.roll(1, 6)
          ? biosphereRoll(0, 3)
          : 0
      )
      let chemRoll = window.dice.roll(1, 6)
      if (star.class === 'L') chemRoll += 1
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
    roll: ({ star, zone }) => {
      const size = window.dice.roll(1, 6) + 4
      let chemRoll = window.dice.roll(1, 6)
      if (star.class === 'K-V') chemRoll += 2
      if (star.class === 'M-V') chemRoll += 4
      if (star.class === 'L') chemRoll += 5
      if (zone === 'outer') chemRoll += 2
      const chemistry = chemRoll <= 6 ? 'water' : chemRoll <= 8 ? 'ammonia' : 'methane'
      const ageMod = chemistry === 'water' ? 0 : chemistry === 'ammonia' ? 1 : 3
      const biosphere = Math.max(
        star.age >= 4 + ageMod
          ? biosphereRoll(2, 13) - (star.class === 'D' ? 3 : 0)
          : star.age >= window.dice.roll(1, 3) + ageMod
          ? biosphereRoll(0, 3)
          : 0,
        0
      )
      const atmosphereRoll = window.dice.roll(1, 6)
      const atmosphere =
        chemistry === 'water'
          ? MATH.clamp(
              window.dice.roll(2, 6) +
                size -
                6 -
                (star.class === 'K-V' || star.class.includes('IV')
                  ? 1
                  : star.class === 'M-V'
                  ? 2
                  : star.class === 'L'
                  ? 3
                  : 0),
              1,
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
    roll: ({ star }) => {
      const size = window.dice.roll(1, 6) + 9
      let chemRoll = window.dice.roll(1, 6)
      if (star.class === 'K-V') chemRoll += 2
      if (star.class === 'M-V') chemRoll += 4
      if (star.class === 'L') chemRoll += 5
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
          ? biosphereRoll(2, 13)
          : star.age >= window.dice.roll(1, 3) + ageMod
          ? biosphereRoll(0, 3)
          : 0
      const atmosphere = Math.min(window.dice.roll(1, 6) + 8, 13)
      return { size, atmosphere, hydrosphere: 11, biosphere, chemistry }
    }
  },
  rockball: {
    color: '#8B7D7B',
    description:
      'These are mostly dormant worlds, with surfaces largely unchanged since the early period of planetary formation.',
    roll: ({ star, zone }) => {
      const size = window.dice.roll(1, 6) - 1
      let hydrosphere = window.dice.roll(2, 6) + size - 11
      if (star.class === 'L') hydrosphere += 1
      if (zone === 'epistellar') hydrosphere -= 2
      if (zone === 'outer') hydrosphere += 2
      return { size, atmosphere: 0, hydrosphere: MATH.clamp(hydrosphere, 0, 10), biosphere: 0 }
    }
  },
  snowball: {
    color: '#ADD8E6',
    description:
      'These worlds are composed of mostly ice and some rock. They may have varying degrees of activity, ranging from completely cold and still to cryo-volcanically active with extensive subsurface oceans.',
    roll: ({ star, zone }) => {
      const size = window.dice.roll(1, 6) - 1
      const atmosphere = window.dice.roll(1, 6) <= 4 ? 0 : 1
      const hydrosphere = window.dice.roll(1, 6) <= 3 ? 10 : Math.max(1, window.dice.roll(2, 6) - 2)
      let chemRoll = window.dice.roll(1, 6)
      if (star.class === 'L') chemRoll += 2
      if (zone === 'outer') chemRoll += 2
      const chemistry = chemRoll <= 4 ? 'water' : chemRoll <= 6 ? 'ammonia' : 'methane'
      const ageMod = chemistry === 'water' ? 0 : chemistry === 'ammonia' ? 1 : 3
      const subsurfaceOceans = hydrosphere < 10
      const biosphere = Math.max(
        subsurfaceOceans
          ? star.age >= window.dice.roll(1, 6)
            ? biosphereRoll(1, 6) - 3
            : star.age >= 6 + ageMod
            ? biosphereRoll(1, 6) + size - 2
            : 0
          : 0,
        0
      )
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
    roll: ({ star, zone }) => {
      const size = window.dice.roll(1, 6) + 4
      let chemRoll = window.dice.roll(1, 6)
      if (star.class === 'K-V') chemRoll += 2
      if (star.class === 'M-V') chemRoll += 4
      if (star.class === 'L') chemRoll += 5
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
      const biosphere = Math.max(
        star.age >= 4 + ageMod
          ? biosphereRoll(2, 13) - (star.class === 'D' ? 3 : 0)
          : star.age >= window.dice.roll(1, 3) + ageMod
          ? biosphereRoll(0, 3)
          : 0,
        0
      )
      const suitableBio = biosphere >= 3
      const atmosphere =
        suitableBio && chemistry === 'water'
          ? MATH.clamp(window.dice.roll(2, 6) + size - 7, 2, 9)
          : suitableBio && chemistry === 'chlorine'
          ? 11
          : 10
      const hydrosphere = window.dice.randint(3, 10)
      return {
        size,
        atmosphere,
        hydrosphere,
        biosphere: Math.max(0, biosphere),
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
          ? biosphereRoll(1, 12)
          : star.age >= window.dice.roll(1, 3)
          ? biosphereRoll(0, 3)
          : 0
      const suitableBio = biosphere >= 3
      const atmosphere =
        suitableBio && chemistry === 'water'
          ? MATH.clamp(window.dice.roll(2, 6) + size - 7, 2, 9)
          : suitableBio && chemistry === 'chlorine'
          ? 11
          : 10
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

const desirability = ({
  star,
  zone,
  group,
  hydrosphere,
  size,
  atmosphere
}: OrbitDesirabilityParams) => {
  const asteroidBelt = group === 'asteroid belt'
  let roll = asteroidBelt ? window.dice.roll(1, 6) - window.dice.roll(1, 6) : 0
  // dry world
  if (!asteroidBelt && hydrosphere === 0) roll -= 1
  // extreme environment
  if (!asteroidBelt && (size >= 13 || atmosphere >= 12 || hydrosphere === 12)) roll -= 2
  // flare star
  if (star.class === 'M-Ve') roll -= window.dice.roll(1, 3)
  // habitable world
  if (
    !asteroidBelt &&
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
    else if (hydrosphere >= 10 && hydrosphere <= 11) roll += 3
    // poor world
    else if (atmosphere >= 2 && atmosphere <= 6 && hydrosphere >= 0 && hydrosphere <= 3) roll += 2
    else roll += 4
  }
  // high gravity
  if (!asteroidBelt && size >= 10 && atmosphere < 14) roll -= 1
  // lifebelt
  if (zone === 'inner') {
    if (star.class === 'M-V') roll += 1
    else if (
      star.class !== 'L' &&
      star.class !== 'D' &&
      star.class !== 'O' &&
      star.class !== 'B' &&
      star.class !== 'M-Ib' &&
      star.class !== 'K-III' &&
      star.class !== 'M-III'
    )
      roll += 2
  }
  // tiny world
  if (!asteroidBelt && size === 0) roll -= 1
  // t-prime atmosphere
  if (!asteroidBelt && (atmosphere === 6 || atmosphere === 8)) roll += 1
  return roll
}

const _colors: Record<string, string> = {}

export const ORBIT = {
  atmospheres,
  biospheres,
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
  spawn: ({ star, zone, impactZone, group, parent, angle, distance }: OrbitSpawnParams): Orbit => {
    const selected =
      group ??
      window.dice.weightedChoice<Orbit['group']>([
        { v: 'asteroid belt', w: 2 },
        { v: 'dwarf', w: 2 },
        { v: 'terrestrial', w: 3 },
        { v: 'helian', w: 1 },
        { v: 'jovian', w: zone === 'outer' ? 2 : 0.5 }
      ])
    if (!groups[selected]) throw new Error(`Invalid orbit group: ${selected}`)
    const type = groups[selected].type({ zone, impactZone })
    const {
      size: _size,
      atmosphere,
      hydrosphere,
      biosphere,
      chemistry,
      subtype
    } = details[type].roll({
      star,
      zone
    })
    const asteroidBelt = selected === 'asteroid belt'
    const asteroidMember = parent?.group === 'asteroid belt'
    const size = asteroidMember
      ? _size
      : Math.max(0, Math.min((parent?.size ?? Infinity) - 3, _size))
    const r = scaleLinear([-1, 0, 5, 10, 15], [0, 1, 3, 6, 10])(size)
    const finalDistance = asteroidMember ? 0 : distance + r + (asteroidBelt ? 10 : 0)
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
      hydrosphere,
      biosphere,
      chemistry,
      desirability: desirability({ star, zone, group: selected, size, atmosphere, hydrosphere }),
      orbits: [],
      r,
      parent: parent ? { type: 'orbit', idx: parent.idx } : { type: 'star', idx: star.idx }
    }
    window.galaxy.orbits.push(orbit)
    if (group === 'jovian') orbit.rings = window.dice.roll(1, 6) <= 4 ? 'minor' : 'complex'
    if (!parent) {
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
          angle: subAngle
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
