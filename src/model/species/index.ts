import { Species } from './types'
import { BiologicalTraits } from './traits/biological/types'
import { MechanicalTraits } from './traits/mechanical/types'
import { BIOLOGICAL_TRAITS } from './traits/biological'
import { MECHANICAL_TRAITS } from './traits/mechanical'

const TRAITS = { ...BIOLOGICAL_TRAITS, ...MECHANICAL_TRAITS }

// Define trait costs for biological species
const biological: BiologicalTraits[] = [
  'adaptive',
  'extremely_adaptive',
  'agrarian',
  'charismatic',
  'communal',
  'conformists',
  'conservationist',
  'docile',
  'enduring',
  'venerable',
  'industrious',
  'ingenious',
  'intelligent',
  'natural_engineers',
  'natural_physicists',
  'natural_sociologists',
  'nomadic',
  'quick_learners',
  'rapid_breeders',
  'resilient',
  'strong',
  'very_strong',
  'talented',
  'thrifty',
  'traditional',
  'existential_iteroparity',
  'incubators',
  'noxious',
  'inorganic_breath',
  'vocational_genomics',
  'decadent',
  'deviants',
  'fleeting',
  'nonadaptive',
  'sedentary',
  'quarrelsome',
  'repugnant',
  'slow_breeders',
  'slow_learners',
  'solitary',
  'unruly',
  'wasteful',
  'weak',
  'jinxed',
  'psychological_infertility',
  'phototrophic',
  'radiotrophic',
  'invasive_species',
  'budding',
  'crystallization',
  'gaseous_byproducts',
  'scintillating_skin',
  'volatile_excretions',
  'familial',
  'genetic_memory',
  'camouflage',
  'chromalogs',
  'egg_laying',
  'spare_organs',
  'seasonal_dormancy',
  'flight',
  'spatial_mastery',
  'shelled',
  'acidic_vascularity',
  'nascent_stage',
  'permeable_skin',
  'hollow_bones',
  'rooted',
  'brittle'
]

// Define trait costs for mechanical species
const mechanical: MechanicalTraits[] = [
  'adaptive_frames',
  'efficient_processors',
  'harvesters',
  'power_drills',
  'superconductive',
  'double_jointed',
  'durable',
  'emotion_emulators',
  'mass_produced',
  'recycled',
  'streamlined_protocols',
  'domestic_protocols',
  'logic_engines',
  'trading_algorithms',
  'eternal_machine',
  'loyalty_circuits',
  'propaganda_machines',
  'enhanced_memory',
  'learning_algorithms',
  'engineering_core',
  'physics_core',
  'sociology_core',
  'integrated_weaponry',
  'bulky',
  'custom_made',
  'high_bandwidth',
  'high_maintenance',
  'luxurious',
  'uncanny',
  'decadent',
  'deviants',
  'quarrelsome',
  'wasteful',
  'repurposed_hardware',
  'delicate_chassis',
  'scarcity_subroutines'
]

// Available species classes by archetype
const SPECIES_CLASSES = {
  biological: [
    'humanoid',
    'mammalian',
    'reptilian',
    'avian',
    'arthropod',
    'molluscoid',
    'fungoid',
    'plantoid',
    'necroid',
    'aquatic',
    'toxoid'
  ] as Species['class'][],
  mechanical: ['machine'] as Species['class'][],
  lithic: ['lithoid'] as Species['class'][]
}

// Climate preferences
const CLIMATES = ['dry', 'wet', 'cold'] as Species['preferences']['climate'][]

// World types by climate
const WORLD_TYPES = {
  dry: ['desert', 'arid', 'savanna'],
  wet: ['oceanic', 'continental', 'tropical'],
  cold: ['tundra', 'alpine', 'arctic']
} as Record<Species['preferences']['climate'], Species['preferences']['world'][]>

export const SPECIES = {
  spawn: (): Species => {
    // Determine archetype
    const archetype = window.dice.weightedChoice([
      { v: 'biological', w: 0.8 },
      { v: 'mechanical', w: 0 },
      { v: 'lithic', w: 0 }
    ]) as 'biological' | 'mechanical' | 'lithic'

    // Determine trait points based on archetype
    const traitPoints = archetype === 'biological' || archetype === 'lithic' ? 5 : 4

    // Select species class
    const availableClasses = SPECIES_CLASSES[archetype]
    const class_ = window.dice.choice(availableClasses)

    // Determine climate preference
    let climate = window.dice.choice(CLIMATES)

    // Determine world preference (optional)
    let world = archetype !== 'mechanical' ? window.dice.choice(WORLD_TYPES[climate]) : undefined

    // Select traits based on archetype
    let traits: (BiologicalTraits | MechanicalTraits)[] = []
    let remainingPoints = traitPoints

    if (archetype === 'mechanical') {
      traits.push('machine')
      remainingPoints -= TRAITS['machine'].traitPoints
      traits = selectTraits(remainingPoints, class_, traits, 'mechanical')
    } else {
      if (class_ === 'lithoid') {
        traits.push('lithoid')
        remainingPoints -= TRAITS['lithoid'].traitPoints
      } else if (class_ === 'aquatic') {
        traits.push('aquatic')
        remainingPoints -= TRAITS['aquatic'].traitPoints
        climate = 'wet'
        world = 'oceanic'
      }
      traits = selectTraits(remainingPoints, class_, traits, 'biological')
    }

    return {
      idx: window.dice.randint(1, 999999),
      archetype,
      preferences: {
        climate,
        ...(world && { world })
      },
      class: class_,
      preSapient: false,
      traits
    }
  },
  getTraitsInfo: (traits: (BiologicalTraits | MechanicalTraits)[]) => {
    return traits.map(trait => TRAITS[trait])
  }
}

function selectTraits(
  availablePoints: number,
  speciesClass: Species['class'],
  existingTraits: Species['traits'],
  type: 'biological' | 'mechanical'
): Species['traits'] {
  const maxTraits = type === 'biological' ? 5 : 4
  const allPossibleTraits = (type === 'biological' ? biological : mechanical) as (
    | BiologicalTraits
    | MechanicalTraits
  )[]

  const getAffordableTraits = (
    currentTraits: (BiologicalTraits | MechanicalTraits)[],
    remainingPoints: number
  ) => {
    return allPossibleTraits.filter(trait => {
      const traitData = TRAITS[trait]
      if (remainingPoints - traitData.traitPoints < 0) return false
      if (currentTraits.includes(trait)) return false
      if (hasConflictingTrait(currentTraits, trait)) return false
      if (
        traitData.restrictions.speciesClass &&
        !traitData.restrictions.speciesClass.includes(speciesClass)
      ) {
        return false
      }
      return true
    })
  }

  const baseTraits: (BiologicalTraits | MechanicalTraits)[] = [...existingTraits]
  const basePoints = availablePoints

  let bestSelection = {
    traits: [...baseTraits],
    remainingPoints: basePoints
  }

  const maxAttempts = 20
  for (let i = 0; i < maxAttempts; i++) {
    const currentTraits: (BiologicalTraits | MechanicalTraits)[] = [...baseTraits]
    let remainingPoints = basePoints

    while (remainingPoints > 0 && currentTraits.length < maxTraits) {
      const affordableTraits = getAffordableTraits(currentTraits, remainingPoints)

      if (affordableTraits.length === 0) break

      const weightedTraits = affordableTraits.map(trait => ({
        v: trait,
        w: TRAITS[trait].traitPoints > 0 ? 1 : 2
      }))

      const selectedTrait = window.dice.weightedChoice(weightedTraits)
      currentTraits.push(selectedTrait)
      remainingPoints -= TRAITS[selectedTrait].traitPoints
    }

    if (remainingPoints < bestSelection.remainingPoints) {
      bestSelection = { traits: currentTraits, remainingPoints }
    }

    if (bestSelection.remainingPoints === 0) break
  }

  return bestSelection.traits
}

function hasConflictingTrait(
  currentTraits: (BiologicalTraits | MechanicalTraits)[],
  newTrait: BiologicalTraits | MechanicalTraits
): boolean {
  const conflictingTraits = TRAITS[newTrait].conflicts || []
  return currentTraits.some(trait => conflictingTraits.includes(trait))
}
