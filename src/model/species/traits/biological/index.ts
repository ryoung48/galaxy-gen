import { Trait } from '../types'
import { BiologicalTraits } from './types'

export const BIOLOGICAL_TRAITS: Record<BiologicalTraits, Trait> = {
  // Basic traits
  hive_minded: {
    name: 'Hive-Minded',
    effects: [],
    conflicts: [
      'conformists',
      'conservationist',
      'thrifty',
      'familial',
      'deviants',
      'wasteful',
      'decadent'
    ],
    restrictions: {},
    traitPoints: 0,
    slavePrice: 0,
    description:
      'This species is made up of semi-autonomous individuals slaved to a single, unfathomably vast consciousness.'
  },

  lithoid: {
    name: 'Lithoid',
    effects: [],
    conflicts: [
      'agrarian',
      'extremely_adaptive',
      'nonadaptive',
      'slow_breeders',
      'psychological_infertility'
    ],
    restrictions: {},
    traitPoints: 0,
    slavePrice: 0,
    description:
      'This species has a silicon based biology, and consumes minerals rather than food. They are tougher than traditional organics and have slower metabolisms, making them long lived but slow to reproduce.'
  },

  aquatic: {
    name: 'Aquatic',
    effects: [],
    conflicts: [],
    restrictions: {},
    traitPoints: 2,
    slavePrice: 0,
    description:
      'This species is perfectly adapted to living in the depths of the ocean. However, on dry land, it is like a fish out of water.'
  },

  // Positive traits
  adaptive: {
    name: 'Adaptive',
    effects: [],
    conflicts: ['nonadaptive', 'extremely_adaptive'],
    restrictions: {},
    traitPoints: 2,
    slavePrice: 500,
    description: 'This species is highly adaptive when it comes to foreign environments.'
  },

  extremely_adaptive: {
    name: 'Extremely Adaptive',
    effects: [],
    conflicts: ['nonadaptive', 'adaptive', 'lithoid'],
    restrictions: {},
    traitPoints: 4,
    slavePrice: 1000,
    description: 'This species is remarkably adept at adapting to any foreign environments.'
  },

  agrarian: {
    name: 'Agrarian',
    effects: [],
    conflicts: ['lithoid'],
    restrictions: {},
    traitPoints: 2,
    slavePrice: 500,
    description:
      'This species has a deep connection to the land, and make expert farmers and gardeners.'
  },

  charismatic: {
    name: 'Charismatic',
    effects: [],
    conflicts: ['repugnant'],
    restrictions: {},
    traitPoints: 2,
    slavePrice: 500,
    description:
      'Members of this species have a special charisma, and are generally considered pleasant to be around.'
  },

  communal: {
    name: 'Communal',
    effects: [],
    conflicts: ['solitary', 'shelled'],
    restrictions: {},
    traitPoints: 1,
    slavePrice: 500,
    description:
      'Members of this species are highly communal, and quite used to living in close proximity to others.'
  },

  conformists: {
    name: 'Conformists',
    effects: [],
    conflicts: ['deviants', 'hive_minded'],
    restrictions: {},
    traitPoints: 2,
    slavePrice: 500,
    description:
      'These people always seek consensus and are more likely to conform to the governing ethics.'
  },

  conservationist: {
    name: 'Conservationist',
    effects: [],
    conflicts: ['wasteful', 'hive_minded'],
    restrictions: {},
    traitPoints: 1,
    slavePrice: 500,
    description: 'Members of this species believe that resources must be conserved and recycled.'
  },

  docile: {
    name: 'Docile',
    effects: [],
    conflicts: ['unruly'],
    restrictions: {},
    traitPoints: 2,
    slavePrice: 500,
    description:
      'Members of this species are easy to manage and organize. They tend to be cooperative and amicable.'
  },

  enduring: {
    name: 'Enduring',
    effects: [],
    conflicts: ['fleeting', 'venerable'],
    restrictions: {},
    traitPoints: 1,
    slavePrice: 500,
    description: 'Lifespans in this species are unusually long.'
  },

  venerable: {
    name: 'Venerable',
    effects: [],
    conflicts: ['fleeting', 'enduring'],
    restrictions: {},
    traitPoints: 4,
    slavePrice: 1000,
    description: 'This species can grow to an age that commands dignity and respect.'
  },

  industrious: {
    name: 'Industrious',
    effects: [],
    conflicts: [],
    restrictions: {},
    traitPoints: 2,
    slavePrice: 500,
    description:
      'Members of this species are known for their diligent and hard-working nature, always going above and beyond.'
  },

  ingenious: {
    name: 'Ingenious',
    effects: [],
    conflicts: [],
    restrictions: {},
    traitPoints: 2,
    slavePrice: 500,
    description:
      "Members of this species are good at 'thinking outside the box' and know how to maximize the efficiency of their infrastructure and power grids."
  },

  intelligent: {
    name: 'Intelligent',
    effects: [],
    conflicts: [],
    restrictions: {},
    traitPoints: 2,
    slavePrice: 500,
    description: 'This species is highly intelligent, and enjoys faster technological progress.'
  },

  natural_engineers: {
    name: 'Natural Engineers',
    effects: [],
    conflicts: ['natural_physicists', 'natural_sociologists'],
    restrictions: {},
    traitPoints: 1,
    slavePrice: 500,
    description:
      'Members of this species have a natural inclination towards engineering and material sciences.'
  },

  natural_physicists: {
    name: 'Natural Physicists',
    effects: [],
    conflicts: ['natural_engineers', 'natural_sociologists'],
    restrictions: {},
    traitPoints: 1,
    slavePrice: 500,
    description:
      'Members of this species have a natural inclination towards theoretical physics and astral phenomena.'
  },

  natural_sociologists: {
    name: 'Natural Sociologists',
    effects: [],
    conflicts: ['natural_physicists', 'natural_engineers'],
    restrictions: {},
    traitPoints: 1,
    slavePrice: 500,
    description:
      'Members of this species have a natural inclination towards sociology and biological studies.'
  },

  nomadic: {
    name: 'Nomadic',
    effects: [],
    conflicts: ['sedentary'],
    restrictions: {},
    traitPoints: 1,
    slavePrice: 500,
    description:
      'This species has a nomadic past, and its members often think nothing of relocating to another world.'
  },

  quick_learners: {
    name: 'Quick Learners',
    effects: [],
    conflicts: ['slow_learners'],
    restrictions: {},
    traitPoints: 1,
    slavePrice: 500,
    description: 'Members of this species are quick to learn from their experiences.'
  },

  rapid_breeders: {
    name: 'Rapid Breeders',
    effects: [],
    conflicts: [
      'slow_breeders',
      'existential_iteroparity',
      'incubators',
      'budding',
      'crystallization',
      'egg_laying'
    ],
    restrictions: {},
    traitPoints: 2,
    slavePrice: 1000,
    description: 'This species reproduces at a very rapid rate, increasing population growth.'
  },

  resilient: {
    name: 'Resilient',
    effects: [],
    conflicts: [],
    restrictions: {},
    traitPoints: 1,
    slavePrice: 500,
    description:
      'Members of this species are physiologically resilient, and will fight like enraged brood mothers to defend their worlds.'
  },

  strong: {
    name: 'Strong',
    effects: [],
    conflicts: ['very_strong', 'weak', 'hollow_bones'],
    restrictions: {},
    traitPoints: 1,
    slavePrice: 1000,
    description:
      'Members of this species possess great physical strength, making them formidable fighters on the ground.'
  },

  very_strong: {
    name: 'Very Strong',
    effects: [],
    conflicts: ['strong', 'weak', 'hollow_bones'],
    restrictions: {},
    traitPoints: 3,
    slavePrice: 2000,
    description:
      'Members of this species possess a strength that almost defies the laws of physics.'
  },

  talented: {
    name: 'Talented',
    effects: [],
    conflicts: [],
    restrictions: {},
    traitPoints: 1,
    slavePrice: 500,
    description: 'Member of this species are born with a natural aptitude.'
  },

  thrifty: {
    name: 'Thrifty',
    effects: [],
    conflicts: ['hive_minded'],
    restrictions: {},
    traitPoints: 2,
    slavePrice: 500,
    description:
      'Members of this species are instinctively economical and are always looking to make a good profit, whatever corners need cutting.'
  },

  traditional: {
    name: 'Traditional',
    effects: [],
    conflicts: ['quarrelsome'],
    restrictions: {},
    traitPoints: 1,
    slavePrice: 500,
    description:
      "Certain aspects of this species' cognition makes it predisposed to especially value historical precedence and group unity."
  },

  existential_iteroparity: {
    name: 'Existential Iteroparity',
    effects: [],
    conflicts: [
      'psychological_infertility',
      'rapid_breeders',
      'incubators',
      'budding',
      'crystallization',
      'egg_laying'
    ],
    restrictions: {},
    traitPoints: 2,
    slavePrice: 1000,
    description:
      'This species grew up in hostile conditions where outbreeding your rivals was the key to survival.'
  },

  incubators: {
    name: 'Incubators',
    effects: [],
    conflicts: [
      'slow_breeders',
      'rapid_breeders',
      'existential_iteroparity',
      'budding',
      'crystallization',
      'egg_laying'
    ],
    restrictions: {},
    traitPoints: 2,
    slavePrice: 2000,
    description:
      'When isolated or few in numbers, a species with this trait naturally adapts and is able to focus on procreation with an intentness others would consider extreme. However, when in large numbers, this effect is reversed, and they find reproduction more difficult.'
  },

  noxious: {
    name: 'Noxious',
    effects: [],
    conflicts: [],
    restrictions: {},
    traitPoints: 1,
    slavePrice: -500,
    description:
      'Extremely unpleasant to be in the vicinity of, beings with this trait take vindication from being insufferable to everyone else.'
  },

  inorganic_breath: {
    name: 'Inorganic Breath',
    effects: [],
    conflicts: [],
    restrictions: {},
    traitPoints: 3,
    slavePrice: 1000,
    description:
      'The slightly toxic digestive methods of this species have resulted in a highly exotic breath composition.'
  },

  vocational_genomics: {
    name: 'Vocational Genomics',
    effects: [],
    conflicts: [],
    restrictions: {},
    traitPoints: 3,
    slavePrice: 1000,
    description:
      "Advanced genetic strings feature epigenetic triggers that adapt to occupational demands, dynamically optimizing gene expression for the host's work environment."
  },

  // Negative traits
  decadent: {
    name: 'Decadent',
    effects: [],
    conflicts: ['hive_minded'],
    restrictions: {},
    traitPoints: -1,
    slavePrice: -200,
    description:
      'This species believes that whenever there is hard work that needs doing, that work is always best done by somebody else.'
  },

  deviants: {
    name: 'Deviants',
    effects: [],
    conflicts: ['conformists', 'hive_minded'],
    restrictions: {},
    traitPoints: -1,
    slavePrice: -200,
    description:
      'These people are rebellious in nature and constantly try to challenge the status-quo.'
  },

  fleeting: {
    name: 'Fleeting',
    effects: [],
    conflicts: ['enduring', 'venerable'],
    restrictions: {},
    traitPoints: -1,
    slavePrice: -200,
    description:
      'Time is fleeting for this species. What they lack in longevity, they have to make up in other ways.'
  },

  nonadaptive: {
    name: 'Nonadaptive',
    effects: [],
    conflicts: ['adaptive', 'extremely_adaptive', 'lithoid'],
    restrictions: {},
    traitPoints: -2,
    slavePrice: -200,
    description: 'This species does not adapt well to foreign environments.'
  },

  sedentary: {
    name: 'Sedentary',
    effects: [],
    conflicts: ['nomadic'],
    restrictions: {},
    traitPoints: -1,
    slavePrice: -200,
    description:
      'This species has a sedentary past, and its members are reluctant to migrate away from where they grew up.'
  },

  quarrelsome: {
    name: 'Quarrelsome',
    effects: [],
    conflicts: ['traditional'],
    restrictions: {},
    traitPoints: -1,
    slavePrice: -200,
    description:
      'While not inherently distrustful, members of this species are often socially combative.'
  },

  repugnant: {
    name: 'Repugnant',
    effects: [],
    conflicts: ['charismatic'],
    restrictions: {},
    traitPoints: -2,
    slavePrice: -200,
    description:
      'The physical appearance and customs of this species are considered offensive to most others, and few appreciate them as neighbors.'
  },

  slow_breeders: {
    name: 'Slow Breeders',
    effects: [],
    conflicts: [
      'rapid_breeders',
      'existential_iteroparity',
      'incubators',
      'budding',
      'crystallization',
      'egg_laying',
      'lithoid',
      'nascent_stage'
    ],
    restrictions: {},
    traitPoints: -2,
    slavePrice: -1000,
    description: 'This species reproduces at a slow rate, lowering population growth.'
  },

  slow_learners: {
    name: 'Slow Learners',
    effects: [],
    conflicts: ['quick_learners'],
    restrictions: {},
    traitPoints: -1,
    slavePrice: -200,
    description: 'Members of this species are slow to learn from their experiences.'
  },

  solitary: {
    name: 'Solitary',
    effects: [],
    conflicts: ['communal'],
    restrictions: {},
    traitPoints: -1,
    slavePrice: -200,
    description:
      'Members of this species tend to be solitary and territorial, often becoming agitated in crowded conditions.'
  },

  unruly: {
    name: 'Unruly',
    effects: [],
    conflicts: ['docile'],
    restrictions: {},
    traitPoints: -2,
    slavePrice: -200,
    description:
      'Unruly species are difficult to manage and organize. They do not like being told what to do, and are often quarrelsome or questioning.'
  },

  wasteful: {
    name: 'Wasteful',
    effects: [],
    conflicts: ['conservationist', 'hive_minded'],
    restrictions: {},
    traitPoints: -1,
    slavePrice: -200,
    description:
      'Members of this species seemingly have no concept of frugality and are prone to useless consumption.'
  },

  weak: {
    name: 'Weak',
    effects: [],
    conflicts: ['strong', 'very_strong', 'hollow_bones'],
    restrictions: {},
    traitPoints: -1,
    slavePrice: -1000,
    description:
      'Members of this species are physically weaker than average, making them poor fighters on the ground.'
  },

  jinxed: {
    name: 'Jinxed',
    effects: [],
    conflicts: [],
    restrictions: {},
    traitPoints: -1,
    slavePrice: -500,
    description:
      'Leaders from this species seem clumsier and more prone to accidents or vices than average, as if cursed from birth.'
  },

  psychological_infertility: {
    name: 'Psychological Infertility',
    effects: [],
    conflicts: ['existential_iteroparity', 'nascent_stage'],
    restrictions: {},
    traitPoints: -2,
    slavePrice: -1000,
    description:
      'Members of this species are extremely sensitive to the rigors of conflict with the resulting stress taking over the more primal urges.'
  },

  // Phenotype traits
  phototrophic: {
    name: 'Phototrophic',
    effects: [],
    conflicts: ['radiotrophic'],
    restrictions: {
      speciesClass: ['plantoid', 'fungoid']
    },
    traitPoints: 1,
    slavePrice: 1000,
    description: 'This species is sustained by a combination of both food and sunlight.'
  },

  radiotrophic: {
    name: 'Radiotrophic',
    effects: [],
    conflicts: ['phototrophic'],
    restrictions: {
      speciesClass: ['plantoid', 'fungoid', 'lithoid']
    },
    traitPoints: 2,
    slavePrice: 1500,
    description:
      'This species is sustained by a combination of both food and low-energy radiation, and as such can thrive on the most inhospitable of worlds.'
  },

  invasive_species: {
    name: 'Invasive Species',
    effects: [],
    conflicts: [],
    restrictions: {
      speciesClass: ['plantoid', 'fungoid']
    },
    traitPoints: 2,
    slavePrice: 0,
    description: 'Rapid reproduction. High dispersal ability. Zero useful capabilities.'
  },

  budding: {
    name: 'Budding',
    effects: [],
    conflicts: [
      'slow_breeders',
      'rapid_breeders',
      'existential_iteroparity',
      'incubators',
      'crystallization',
      'egg_laying'
    ],
    restrictions: {
      speciesClass: ['plantoid', 'fungoid']
    },
    traitPoints: 2,
    slavePrice: 2000,
    description:
      'This species is capable of reproduction by budding, in addition to the more usual fertilization of seeds or spores.'
  },

  crystallization: {
    name: 'Crystallization',
    effects: [],
    conflicts: [
      'slow_breeders',
      'rapid_breeders',
      'existential_iteroparity',
      'incubators',
      'budding',
      'egg_laying'
    ],
    restrictions: {
      speciesClass: ['lithoid']
    },
    traitPoints: 2,
    slavePrice: 2000,
    description:
      'With crystalline growths, this species is capable of generating self replicating lattices of themselves, in addition to the more usual reproductive methods.'
  },

  gaseous_byproducts: {
    name: 'Gaseous Byproducts',
    effects: [],
    conflicts: ['scintillating_skin', 'volatile_excretions'],
    restrictions: {
      speciesClass: ['lithoid']
    },
    traitPoints: 2,
    slavePrice: 1000,
    description:
      'The metabolic processes of this species cause regular venting of gases useful to industry.'
  },

  scintillating_skin: {
    name: 'Scintillating Skin',
    effects: [],
    conflicts: ['gaseous_byproducts', 'volatile_excretions'],
    restrictions: {
      speciesClass: ['lithoid']
    },
    traitPoints: 2,
    slavePrice: 1000,
    description:
      'The outermost layer of this species is studded with sparkling crystals and gemstones that occasionally flake off.'
  },

  volatile_excretions: {
    name: 'Volatile Excretions',
    effects: [],
    conflicts: ['gaseous_byproducts', 'scintillating_skin'],
    restrictions: {
      speciesClass: ['lithoid']
    },
    traitPoints: 2,
    slavePrice: 1000,
    description:
      'The highly compressed spoor created by this species is unstable and contains an unbelievable amount of power.'
  },

  familial: {
    name: 'Familial',
    effects: [],
    conflicts: ['hive_minded'],
    restrictions: {
      speciesClass: ['humanoid', 'mammalian', 'avian']
    },
    traitPoints: 2,
    slavePrice: 1000,
    description:
      'Bound by deep, enduring relationships with their closest relatives, this species forms highly efficient and cohesive collectives.'
  },

  genetic_memory: {
    name: 'Genetic Memory',
    effects: [],
    conflicts: ['nonadaptive'],
    restrictions: {
      speciesClass: ['humanoid', 'mammalian', 'necroid']
    },
    traitPoints: 3,
    slavePrice: 1000,
    description:
      'Passing down knowledge and learnings from one generation to the next has been the start of many civilizations. This species has taken it a step further by encoding survival insights directly into their genetic code, ensuring that each generation is born with the accumulated wisdom of their ancestors.'
  },

  camouflage: {
    name: 'Camouflage',
    effects: [],
    conflicts: ['chromalogs', 'natural_physicists'],
    restrictions: {
      speciesClass: ['arthropod', 'reptilian', 'aquatic']
    },
    traitPoints: 1,
    slavePrice: 500,
    description:
      'Masters of disguise, this species seamlessly merges with their surroundings, rendering themselves nearly invisible to predators and prey alike. Their innate understanding of optics gives them an edge in guerilla warfare.'
  },

  chromalogs: {
    name: 'Chromalogs',
    effects: [],
    conflicts: ['camouflage', 'natural_physicists'],
    restrictions: {
      speciesClass: ['arthropod', 'reptilian', 'aquatic']
    },
    traitPoints: 4,
    slavePrice: 1500,
    description:
      'Harnessing the artistry of color, this species has transcended mere camouflage, evolving to communicate through the vibrant and intricate patterns displayed on their bodies.'
  },

  egg_laying: {
    name: 'Egg Laying',
    effects: [],
    conflicts: [
      'slow_breeders',
      'rapid_breeders',
      'existential_iteroparity',
      'incubators',
      'budding',
      'crystallization'
    ],
    restrictions: {
      speciesClass: ['avian', 'reptilian', 'aquatic']
    },
    traitPoints: 2,
    slavePrice: 500,
    description:
      'The young of this species do not develop inside a parent, but inside the protective shell of an egg. This allows for rapid growth during times of plenty.'
  },

  spare_organs: {
    name: 'Spare Organs',
    effects: [],
    conflicts: [],
    restrictions: {
      speciesClass: ['molluscoid', 'necroid', 'toxoid']
    },
    traitPoints: 2,
    slavePrice: 1000,
    description:
      'This species evolved redundant organs to survive even the most grievous injuries - a successful adaptation, as evidenced by their continued existence.'
  },

  seasonal_dormancy: {
    name: 'Seasonal Dormancy',
    effects: [],
    conflicts: ['wasteful', 'conservationist'],
    restrictions: {
      speciesClass: ['mammalian', 'reptilian']
    },
    traitPoints: 2,
    slavePrice: 500,
    description:
      'This species has evolved on a planet with cyclical seasons that support hibernation. In the modern age, these seasonal triggers can be artificially simulated to efficiently store less productive members of society.'
  },

  flight: {
    name: 'Flight',
    effects: [],
    conflicts: ['spatial_mastery', 'communal', 'shelled'],
    restrictions: {
      speciesClass: ['avian', 'arthropod']
    },
    traitPoints: 2,
    slavePrice: 500,
    description:
      'This species soars above the constraints of the earth, freely navigating the skies. Their cities feature unique, dense layouts, optimized for aerial inhabitants. In conflict, they prove to be elusive and difficult targets.'
  },

  spatial_mastery: {
    name: 'Spatial Mastery',
    effects: [],
    conflicts: ['flight', 'communal', 'shelled'],
    restrictions: {
      speciesClass: ['avian', 'arthropod']
    },
    traitPoints: 4,
    slavePrice: 1000,
    description:
      'Not only capable of flight, this species possesses unique cerebral adaptations, enabling them to instinctively process and navigate three-dimensional spaces. These abilities make them unparalleled in planning battles, surveying planets, and managing cities.'
  },

  shelled: {
    name: 'Shelled',
    effects: [],
    conflicts: ['spatial_mastery', 'communal'],
    restrictions: {
      speciesClass: ['molluscoid', 'necroid']
    },
    traitPoints: 3,
    slavePrice: 1500,
    description:
      'Whether naturally grown or found by chance (or design), this species carries their homes with them. These shells provide a protective sanctuary, ensuring there is always a place to rest for the night.'
  },

  acidic_vascularity: {
    name: 'Acidic Vascularity',
    effects: [],
    conflicts: [],
    restrictions: {
      speciesClass: ['necroid', 'toxoid']
    },
    traitPoints: 1,
    slavePrice: 500,
    description:
      'The internal fluids of this species serve as their most potent defense. Highly corrosive and lethal, these liquids ensure that any enemies regret poking holes.'
  },

  nascent_stage: {
    name: 'Nascent Stage',
    effects: [],
    conflicts: ['slow_breeders', 'psychological_infertility'],
    restrictions: {
      speciesClass: ['humanoid', 'mammalian', 'reptilian', 'arthropod']
    },
    traitPoints: -2,
    slavePrice: -1000,
    description:
      'This species gives birth at an early stage of development, resulting in a prolonged period where the young are incapable of contributing to society. During this time, they remain blissfully unaware of the responsibilities and burdens that come with sapience.'
  },

  permeable_skin: {
    name: 'Permeable Skin',
    effects: [],
    conflicts: ['adaptive', 'extremely_adaptive'],
    restrictions: {
      speciesClass: ['molluscoid', 'aquatic']
    },
    traitPoints: -1,
    slavePrice: -1000,
    description:
      'Specially developed skin that requires ideal conditions coats this species. As long as this species does not stray far from their home climate that should not be a problem.'
  },

  hollow_bones: {
    name: 'Hollow Bones',
    effects: [],
    conflicts: ['strong', 'very_strong', 'weak'],
    restrictions: {
      speciesClass: ['avian', 'toxoid']
    },
    traitPoints: -3,
    slavePrice: -400,
    description:
      'Plagued by inherent fragility, this species must exercise extreme caution in daily activities to avoid cracking up during even the most mundane tasks.'
  },

  rooted: {
    name: 'Rooted',
    effects: [],
    conflicts: ['nomadic', 'sedentary'],
    restrictions: {
      speciesClass: ['fungoid', 'plantoid']
    },
    traitPoints: -3,
    slavePrice: -400,
    description:
      'This species literally takes root in whichever environment they find themselves, making removal a highly traumatic experience.'
  },

  brittle: {
    name: 'Brittle',
    effects: [],
    conflicts: [],
    restrictions: {
      speciesClass: ['lithoid', 'necroid']
    },
    traitPoints: -3,
    slavePrice: -1000,
    description:
      'Plagued by inherent fragility, this species must exercise extreme caution in daily activities to avoid cracking up during even the most mundane tasks.'
  }
} as const
