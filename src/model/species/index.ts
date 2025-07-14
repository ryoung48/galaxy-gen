import { Species } from './types'
import { LANGUAGE } from '../languages'
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
    'lithoid',
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
      { v: 'mechanical', w: 0.1 },
      { v: 'lithic', w: 0.1 }
    ]) as 'biological' | 'mechanical' | 'lithic'

    // Determine trait points based on archetype
    const traitPoints = archetype === 'biological' ? 5 : 4

    // Select species class
    const availableClasses = SPECIES_CLASSES[archetype]
    const class_ = window.dice.choice(availableClasses)

    // Determine climate preference
    let climate = window.dice.choice(CLIMATES)

    // Determine world preference (optional)
    let world = archetype !== 'mechanical' ? window.dice.choice(WORLD_TYPES[climate]) : undefined

    // Generate language
    const language = LANGUAGE.spawn()

    // Generate species name
    const name = LANGUAGE.word.unique({
      lang: language,
      key: 'species_name'
    })

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
      name,
      archetype,
      preferences: {
        climate,
        ...(world && { world })
      },
      class: class_,
      preSapient: false,
      language,
      traits
    }
  }
}

function selectTraits(
  availablePoints: number,
  speciesClass: Species['class'],
  existingTraits: Species['traits'],
  type: 'biological' | 'mechanical'
): Species['traits'] {
  let traits: Species['traits'] = [...existingTraits]
  const originalTraits = [...traits]
  const originalPoints = availablePoints
  let remainingPoints = availablePoints

  // Set maximum number of traits based on type
  const maxTraits = type === 'biological' ? 5 : 4

  const raw = type === 'biological' ? biological : mechanical

  // If starting with 0 points, 50% chance to add a negative trait for variety
  if (availablePoints === 0 && window.dice.random < 0.5) {
    const negativeTraitOptions = raw.filter(trait => {
      const traitData = TRAITS[trait]

      // Only consider negative traits
      if (traitData.traitPoints >= 0) return false

      // Check if we already have it
      if (traits.includes(trait)) return false

      // Check for conflicts with existing traits
      if (hasConflictingTrait(traits, trait)) return false

      // Check class restrictions
      if (
        traitData.restrictions.speciesClass &&
        !traitData.restrictions.speciesClass.includes(speciesClass)
      ) {
        return false
      }
      return true
    })

    if (negativeTraitOptions.length > 0) {
      const selectedNegativeTrait = window.dice.choice(negativeTraitOptions)
      traits.push(selectedNegativeTrait)
      remainingPoints -= TRAITS[selectedNegativeTrait].traitPoints
    }
  }

  // Convert trait costs to weighted distribution
  const traitOptions = raw.map(trait => ({
    trait,
    cost: TRAITS[trait].traitPoints,
    weight: TRAITS[trait].traitPoints > 0 ? 1 : 0.5 // Negative traits are less likely
  }))

  // Try to select traits until we run out of points, can't afford anything, or reach max traits
  const maxAttempts = 20
  let attempts = 0

  while (remainingPoints > 0 && attempts < maxAttempts) {
    // Filter traits we can afford, haven't selected, don't conflict, and meet class restrictions
    const affordableTraits = traitOptions.filter(({ trait, cost }) => {
      const traitData = TRAITS[trait]

      // Check if we can afford it
      if (remainingPoints - cost < 0) return false

      // Check if we already have it
      if (traits.includes(trait)) return false

      // Check for conflicts with existing traits
      if (hasConflictingTrait(traits, trait)) return false

      // Check class restrictions
      if (
        traitData.restrictions.speciesClass &&
        !traitData.restrictions.speciesClass.includes(speciesClass)
      ) {
        return false
      }

      return true
    })

    if (affordableTraits.length === 0) break

    // Weight by cost (cheaper traits more likely) and whether it's positive/negative
    const weightedTraits = affordableTraits.map(({ trait, weight }) => ({
      v: trait,
      w: weight
    }))

    const selectedTrait = window.dice.weightedChoice(weightedTraits)
    traits.push(selectedTrait)
    remainingPoints -= TRAITS[selectedTrait].traitPoints
    if (traits.length >= maxTraits && remainingPoints > 0) {
      traits = originalTraits
      remainingPoints = originalPoints
    }
    attempts++
  }

  return traits
}

function hasConflictingTrait(
  currentTraits: (BiologicalTraits | MechanicalTraits)[],
  newTrait: BiologicalTraits | MechanicalTraits
): boolean {
  const conflictingTraits = TRAITS[newTrait].conflicts || []
  return currentTraits.some(trait => conflictingTraits.includes(trait))
}
