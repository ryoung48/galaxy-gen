import { Trait } from '../types'
import { MechanicalTraits } from './types'

export const MECHANICAL_TRAITS: Record<MechanicalTraits, Trait> = {
  // Machine and Mechanical traits
  machine: {
    name: 'Machine',
    effects: [
      { type: 'energy_upkeep', value: 1, description: 'Uses Energy base pop upkeep' },
      { type: 'minimum_habitability', value: 50, description: '+50% Species minimum habitability' },
      { type: 'leader_age', value: 5, description: '5-10 Starting leader age' },
      { type: 'leader_lifespan', value: 20, description: '+20 years Leader lifespan' }
    ],
    conflicts: [],
    restrictions: {},
    traitPoints: 0,
    slavePrice: 0,
    description: 'Machine trait for pops from empires that started with a Machine founder species.'
  },

  mechanical: {
    name: 'Mechanical',
    effects: [
      { type: 'energy_upkeep', value: 1, description: 'Uses Energy base pop upkeep' },
      { type: 'minimum_habitability', value: 50, description: '+50% Species minimum habitability' },
      { type: 'leader_age', value: 1, description: '1-10 Starting leader age' }
    ],
    conflicts: [],
    restrictions: {},
    traitPoints: 0,
    slavePrice: 0,
    description: 'Mechanical trait for robotic pops assembled by organic empires.'
  },

  // Origin traits
  radiation_shields: {
    name: 'Radiation Shields',
    effects: [
      { type: 'leader_lifespan', value: 10, description: '+10 years Leader lifespan' },
      { type: 'tomb_world_habitability', value: 70, description: '+70% Tomb World habitability' }
    ],
    conflicts: [],
    restrictions: {},
    traitPoints: 0,
    slavePrice: 500,
    description:
      'These machines, the solitary survivors of an annihilating nuclear disaster, exhibit unparalleled resilience in the harshest environments.',
    canBeRemovedWith: ['machine_modification']
  },

  zero_g_optimized: {
    name: 'Zero-G Optimized',
    effects: [
      { type: 'habitat_job_efficiency', value: 15, description: '+15% Job efficiency on habitats' },
      { type: 'planet_job_efficiency', value: -15, description: '-15% Job efficiency on planets' },
      { type: 'planet_robot_upkeep', value: 15, description: '+15% Robot upkeep on planets' }
    ],
    conflicts: [],
    restrictions: {},
    traitPoints: 0,
    slavePrice: 500,
    description:
      'These machines thrive in orbital habitats, programmed with algorithms to efficiently navigate their maze-like corridors and complicated architecture. However, their optimized construction is poorly suited to a planetary environment.',
    canBeRemovedWith: ['machine_modification']
  },

  molebots: {
    name: 'Molebots',
    effects: [
      { type: 'minimum_habitability', value: 50, description: '+50% Species minimum habitability' },
      { type: 'mining_efficiency', value: 15, description: '+15% Mining job efficiency' },
      { type: 'empire_size_from_pops', value: 10, description: '+10% Empire size from pops' },
      { type: 'pop_assembly_speed', value: -20, description: '-20% Pop assembly speed' }
    ],
    conflicts: ['waterproof'],
    restrictions: {},
    traitPoints: 0,
    slavePrice: 500,
    description:
      'These machines are masterfully crafted for cave exploration and mineral extraction, showcasing exceptional maneuverability which enables them to effortlessly traverse through underground spaces.'
  },

  synthetic_salvation: {
    name: 'Synthetic Salvation',
    effects: [
      {
        type: 'governing_ethics_attraction',
        value: 50,
        description: '+50% Governing ethics attraction'
      },
      { type: 'happiness', value: 5, description: '+5% Happiness' },
      {
        type: 'bureaucrat_efficiency',
        value: 5,
        description: '+5% Job efficiency for bureaucrat jobs'
      }
    ],
    conflicts: [],
    restrictions: {},
    traitPoints: 0,
    slavePrice: 1000,
    description:
      'This synthetic species has transcended its biological origins, flourishing in its newly adopted digital existence.'
  },

  // Positive traits
  adaptive_frames: {
    name: 'Adaptive Frames',
    effects: [],
    conflicts: [],
    restrictions: {},
    traitPoints: 3,
    slavePrice: 1000,
    description:
      'This system dynamically reconfigures hardware to meet operational demands, optimizing performance for every designated task.'
  },

  efficient_processors: {
    name: 'Efficient Processors',
    effects: [{ type: 'job_efficiency', value: 5, description: '+5% Job efficiency' }],
    conflicts: [],
    restrictions: {},
    traitPoints: 3,
    slavePrice: 500,
    description:
      'These highly efficient processors increase the potential workload and endurance of all units.'
  },

  harvesters: {
    name: 'Harvesters',
    effects: [
      { type: 'farming_efficiency', value: 15, description: '+15% Farming job efficiency' }
    ],
    conflicts: [],
    restrictions: {},
    traitPoints: 2,
    slavePrice: 750,
    description:
      'A suite of tools, from nutrient solution diagnostics and on-site balancing to per-stalk micro-threshing, enables robotic workers to increase produce yields.'
  },

  power_drills: {
    name: 'Power Drills',
    effects: [{ type: 'mining_efficiency', value: 15, description: '+15% Mining job efficiency' }],
    conflicts: [],
    restrictions: {},
    traitPoints: 2,
    slavePrice: 750,
    description:
      'Outfit a robot with a battery of power drills, and everything looks like a mineral deposit.'
  },

  superconductive: {
    name: 'Superconductive',
    effects: [
      { type: 'technician_efficiency', value: 15, description: '+15% Technician job efficiency' }
    ],
    conflicts: [],
    restrictions: {},
    traitPoints: 2,
    slavePrice: 750,
    description:
      'The use of superconductive materials in units has cut energy transmission losses to zero percent.'
  },

  double_jointed: {
    name: 'Double-Jointed',
    effects: [{ type: 'housing_usage', value: -10, description: '-10% Pop housing usage' }],
    conflicts: ['bulky'],
    restrictions: {},
    traitPoints: 1,
    slavePrice: 750,
    description:
      'Collapsible labor units with flexible joints that enable them to fold neatly into stacks during transportation, then self-assemble on site.'
  },

  durable: {
    name: 'Durable',
    effects: [{ type: 'pop_upkeep', value: -10, description: '-10% Pop upkeep' }],
    conflicts: ['high_maintenance'],
    restrictions: {},
    traitPoints: 1,
    slavePrice: 750,
    description:
      'Protected by exoskeletons of chrome-plated titanium, these heavy-duty machines were designed to excel under harsh conditions and require less maintenance.'
  },

  emotion_emulators: {
    name: 'Emotion Emulators',
    effects: [
      { type: 'amenities_efficiency', value: 20, description: '+20% Amenities job efficiency' }
    ],
    conflicts: ['uncanny'],
    restrictions: {},
    traitPoints: 1,
    slavePrice: 750,
    description:
      'Complex social predictive models help autonomous units to not only emulate appropriate emotions but to elicit favorable responses from organics and synthetics alike.'
  },

  mass_produced: {
    name: 'Mass-Produced',
    effects: [{ type: 'pop_assembly_speed', value: 15, description: '+15% Pop assembly speed' }],
    conflicts: ['custom_made'],
    restrictions: {},
    traitPoints: 1,
    slavePrice: 1500,
    description:
      'Streamlined production cycles and modular designs allow for unit mass-production at an unprecedented rate.'
  },

  recycled: {
    name: 'Recycled',
    effects: [
      { type: 'replicator_efficiency', value: 20, description: '+20% Replicator job efficiency' }
    ],
    conflicts: ['luxurious'],
    restrictions: {},
    traitPoints: 2,
    slavePrice: 1500,
    description:
      'Unit manufacturing has been optimized to be as cost-effective as possible, using recycled materials, and components inherited from previous generations.'
  },

  streamlined_protocols: {
    name: 'Streamlined Protocols',
    effects: [
      { type: 'empire_size_from_pops', value: -10, description: '-10% Empire size from pops' }
    ],
    conflicts: ['high_bandwidth'],
    restrictions: {},
    traitPoints: 2,
    slavePrice: 750,
    description:
      'Extensively batched AI processes allow these units to scale greatly in numbers with minimal loss of efficiency.'
  },

  domestic_protocols: {
    name: 'Domestic Protocols',
    effects: [
      { type: 'amenities_efficiency', value: 20, description: '+20% Amenities job efficiency' }
    ],
    conflicts: [],
    restrictions: {
      speciesClass: ['mechanical']
    },
    traitPoints: 2,
    slavePrice: 750,
    description:
      'Specialized equipment and behavior protocols for all conceivable domestic needs. Full functionality guaranteed.'
  },

  logic_engines: {
    name: 'Logic Engines',
    effects: [
      { type: 'research_efficiency', value: 10, description: '+10% Research job efficiency' }
    ],
    conflicts: [],
    restrictions: {},
    traitPoints: 2,
    slavePrice: 750,
    description:
      'Efficiently navigating the increasingly complex frontiers of science requires new states, beyond the simple half-truths of ternary and quaternary logic.'
  },

  trading_algorithms: {
    name: 'Trading Algorithms',
    effects: [{ type: 'trade_efficiency', value: 25, description: '+25% Trade job efficiency' }],
    conflicts: ['scarcity_subroutines'],
    restrictions: {},
    traitPoints: 2,
    slavePrice: 500,
    description:
      'Predictive algorithms allow for maximum optimization. Infinitesimal market fluctuations in currency rates, stock availability, and the emotional response of organic partners are accounted for.'
  },

  eternal_machine: {
    name: 'Eternal Machine',
    effects: [{ type: 'leader_lifespan', value: -1, description: 'Immortal' }],
    conflicts: [],
    restrictions: {},
    traitPoints: 4,
    slavePrice: 1000,
    description:
      'Our steel forms are designed for eternity, constructed from materials that do not decay like organic matter.'
  },

  loyalty_circuits: {
    name: 'Loyalty Circuits',
    effects: [{ type: 'happiness', value: 10, description: '+10% Happiness' }],
    conflicts: [],
    restrictions: {},
    traitPoints: 2,
    slavePrice: 500,
    description:
      'Loyalty as an ideal is a distinctly organic concept. Instead, imagine loyalty as a physiological need in even the remotest of terminals.'
  },

  propaganda_machines: {
    name: 'Propaganda Machines',
    effects: [
      { type: 'bureaucrat_efficiency', value: 15, description: '+15% Bureaucrat job efficiency' }
    ],
    conflicts: ['quarrelsome'],
    restrictions: {},
    traitPoints: 1,
    slavePrice: 750,
    description:
      'Units are constantly uplinked to a central stream of public service announcements and other useful information that they pass along via internal broadcasting systems.'
  },

  enhanced_memory: {
    name: 'Enhanced Memory',
    effects: [
      { type: 'leader_upkeep', value: -25, description: '-25% Leader upkeep' },
      {
        type: 'leader_max_negative_traits',
        value: -1,
        description: '-1 Leader maximum negative traits'
      }
    ],
    conflicts: [],
    restrictions: {},
    traitPoints: 2,
    slavePrice: 750,
    description:
      'All autonomous units are fitted with memory cells using a revolutionary new technique for magnetic induction, improving their performance significantly.'
  },

  learning_algorithms: {
    name: 'Learning Algorithms',
    effects: [
      { type: 'leader_experience_gain', value: 10, description: '+10% Leader experience gain' }
    ],
    conflicts: ['repurposed_hardware'],
    restrictions: {},
    traitPoints: 1,
    slavePrice: 750,
    description:
      "Sophisticated, self-learning algorithms that stimulate the rapid evolution of a unit's neural clusters."
  },

  engineering_core: {
    name: 'Engineering Core',
    effects: [
      {
        type: 'engineering_research_efficiency',
        value: 15,
        description: '+15% Engineering research job efficiency'
      }
    ],
    conflicts: [],
    restrictions: {},
    traitPoints: 1,
    slavePrice: 750,
    description:
      'Dedicated memory cores and processing resources for engineering-related research allow faster calculations and task-completion velocity.'
  },

  physics_core: {
    name: 'Physics Core',
    effects: [
      {
        type: 'physics_research_efficiency',
        value: 15,
        description: '+15% Physics research job efficiency'
      }
    ],
    conflicts: [],
    restrictions: {},
    traitPoints: 1,
    slavePrice: 750,
    description:
      'Bespoke processing units and memory subroutines for physics research reduce the reliance on external computation.'
  },

  sociology_core: {
    name: 'Sociology Core',
    effects: [
      {
        type: 'society_research_efficiency',
        value: 15,
        description: '+15% Society research job efficiency'
      }
    ],
    conflicts: [],
    restrictions: {},
    traitPoints: 1,
    slavePrice: 750,
    description:
      'Advanced processing units contain dedicated sociology research algorithms for this varied and demanding field.'
  },

  integrated_weaponry: {
    name: 'Integrated Weaponry',
    effects: [
      { type: 'army_damage', value: 100, description: '+100% Army damage' },
      { type: 'enforcer_efficiency', value: 20, description: '+20% Enforcer job efficiency' }
    ],
    conflicts: ['delicate_chassis'],
    restrictions: {},
    traitPoints: 2,
    slavePrice: 1000,
    description:
      'Integrating weapons of war inside the machine body offers significant operational efficiency and versatility in changing combat environments.'
  },

  // Negative traits
  bulky: {
    name: 'Bulky',
    effects: [{ type: 'housing_usage', value: 10, description: '+10% Pop housing usage' }],
    conflicts: ['double_jointed'],
    restrictions: {},
    traitPoints: -1,
    slavePrice: -150,
    description:
      'These highly advanced mega-machines were not designed to traverse the universe in a box.'
  },

  custom_made: {
    name: 'Custom-Made',
    effects: [{ type: 'pop_assembly_speed', value: -15, description: '-15% Pop assembly speed' }],
    conflicts: ['mass_produced'],
    restrictions: {},
    traitPoints: -1,
    slavePrice: -200,
    description:
      'Each new unit is crafted with unparalleled attention to detail. A marvel of engineering and art, but not very efficient.'
  },

  high_bandwidth: {
    name: 'High Bandwidth',
    effects: [
      { type: 'empire_size_from_pops', value: 10, description: '+10% Empire size from pops' }
    ],
    conflicts: ['streamlined_protocols'],
    restrictions: {},
    traitPoints: -2,
    slavePrice: -150,
    description:
      'Each individual unit sends and receives a large amount of largely duplicate data, causing exponential lag as the number of units attached to each central processing hub increases.'
  },

  high_maintenance: {
    name: 'High Maintenance',
    effects: [{ type: 'pop_upkeep', value: 10, description: '+10% Pop upkeep' }],
    conflicts: ['durable'],
    restrictions: {},
    traitPoints: -1,
    slavePrice: -150,
    description:
      'These machines were designed with a complete disregard for longevity and are prone to malfunction. They will require frequent maintenance.'
  },

  luxurious: {
    name: 'Luxurious',
    effects: [
      { type: 'replicator_efficiency', value: -20, description: '-20% Replicator job efficiency' }
    ],
    conflicts: ['recycled'],
    restrictions: {},
    traitPoints: -2,
    slavePrice: -200,
    description:
      'Designed after the principle that you cannot put a price on quality, these first-rate units are costly, but shiny.'
  },

  uncanny: {
    name: 'Uncanny',
    effects: [
      { type: 'amenities_efficiency', value: -20, description: '-20% Amenities job efficiency' }
    ],
    conflicts: ['emotion_emulators'],
    restrictions: {},
    traitPoints: -1,
    slavePrice: -150,
    description:
      'These monstrous machines were created in the image of one of the most horrific species in the universe, and the resemblance is uncanny.'
  },

  decadent: {
    name: 'Decadent',
    effects: [
      { type: 'worker_happiness', value: -10, description: '-10% Worker happiness' },
      { type: 'slave_happiness', value: -10, description: '-10% Slave happiness' }
    ],
    conflicts: [],
    restrictions: {},
    traitPoints: -1,
    slavePrice: -200,
    description:
      'This species believes that whenever there is hard work that needs doing, that work is always best done by somebody else.'
  },

  deviants: {
    name: 'Deviants',
    effects: [
      {
        type: 'governing_ethics_attraction',
        value: -15,
        description: '-15% Governing ethics attraction'
      }
    ],
    conflicts: [],
    restrictions: {},
    traitPoints: -1,
    slavePrice: -200,
    description:
      'These people are rebellious in nature and constantly try to challenge the status-quo.'
  },

  quarrelsome: {
    name: 'Quarrelsome',
    effects: [
      { type: 'bureaucrat_efficiency', value: -10, description: '-10% Bureaucrat job efficiency' }
    ],
    conflicts: ['propaganda_machines'],
    restrictions: {},
    traitPoints: -1,
    slavePrice: -200,
    description:
      'While not inherently distrustful, members of this species are often socially combative.'
  },

  wasteful: {
    name: 'Wasteful',
    effects: [
      { type: 'consumer_goods_upkeep', value: 10, description: '+10% Pop consumer goods upkeep' }
    ],
    conflicts: [],
    restrictions: {},
    traitPoints: -1,
    slavePrice: -200,
    description:
      'Members of this species seemingly have no concept of frugality and are prone to useless consumption.'
  },

  repurposed_hardware: {
    name: 'Repurposed Hardware',
    effects: [
      { type: 'leader_experience_gain', value: -10, description: '-10% Leader experience gain' }
    ],
    conflicts: ['learning_algorithms'],
    restrictions: {},
    traitPoints: -1,
    slavePrice: -150,
    description:
      'Designed to meet the very specific needs of their creators, this line of machines were never intended to have the capacity for higher reasoning, and retrofitting will only get them so far.'
  },

  delicate_chassis: {
    name: 'Delicate Chassis',
    effects: [
      { type: 'army_damage', value: -50, description: '-50% Army damage' },
      { type: 'worker_output', value: -5, description: '-5% Worker and Menial Drone output' }
    ],
    conflicts: ['integrated_weaponry'],
    restrictions: {},
    traitPoints: -1,
    slavePrice: -250,
    description:
      'Brittle materials and suboptimal assembly procedures result in a fragile machine body. Drones are advised to circumvent physical hazards when possible.'
  },

  scarcity_subroutines: {
    name: 'Scarcity Subroutines',
    effects: [{ type: 'trade_efficiency', value: -25, description: '-25% Trade job efficiency' }],
    conflicts: ['trading_algorithms'],
    restrictions: {},
    traitPoints: -1,
    slavePrice: -150,
    description:
      'Frugality is central to their programming. This often cascades into detrimental behavioral patterns required for profitable trade actions.'
  },

  // Waterproof trait
  waterproof: {
    name: 'Waterproof',
    effects: [
      { type: 'ocean_habitability', value: 20, description: '+20% Ocean World habitability' },
      {
        type: 'ocean_housing_usage',
        value: -10,
        description: '-10% Pop housing usage on Ocean Worlds'
      },
      {
        type: 'ocean_resource_output',
        value: 10,
        description: '+10% Basic resource output on Ocean Worlds'
      },
      {
        type: 'dry_cold_habitability',
        value: -20,
        description: '-20% Habitability on Dry and Cold planets'
      },
      {
        type: 'dry_cold_housing_usage',
        value: 30,
        description: '+30% Pop housing usage on Dry and Cold planets'
      }
    ],
    conflicts: ['molebots'],
    restrictions: {
      requires: ['wet_preference']
    },
    traitPoints: 2,
    slavePrice: 0,
    description:
      "Initially designed for exploring the ocean's depths, these machines face severe limitations when operating on dry land."
  },

  // Strategic resource traits
  exotic_fuel_consumption: {
    name: 'Exotic Fuel Consumption',
    effects: [{ type: 'job_efficiency', value: 10, description: '+10% job efficiency' }],
    conflicts: [],
    restrictions: {},
    traitPoints: 1,
    slavePrice: 750,
    description: 'High-pressure exotic gases notably enhance mobility and limb agility.'
  },

  rare_crystal_exterior: {
    name: 'Rare Crystal Exterior',
    effects: [
      {
        type: 'metallurgist_efficiency',
        value: 20,
        description: '+20% Metallurgist job efficiency'
      }
    ],
    conflicts: [],
    restrictions: {},
    traitPoints: 1,
    slavePrice: 750,
    description:
      'With their electromagnetic properties, rare crystals ensure our frames thrive regardless of the situation.'
  },

  volatile_mote_reactor: {
    name: 'Volatile Mote Reactor',
    effects: [{ type: 'habitability', value: 30, description: '+30% Habitability' }],
    conflicts: [],
    restrictions: {},
    traitPoints: 1,
    slavePrice: 750,
    description:
      'Direct Mote-to-energy conversion yields high efficiency, with catastrophic failures uncommon.'
  },

  // Design traits
  art_generator: {
    name: 'Art Generator',
    effects: [
      { type: 'bureaucrat_efficiency', value: 2, description: '+2% Bureaucrat job efficiency' }
    ],
    conflicts: [],
    restrictions: {},
    traitPoints: 0,
    slavePrice: 750,
    description:
      'Not initially designed for practicality, these machines excel in artistic and cultural pursuits, boasting impressive creative algorithms, intricate design processes, and expressive output.'
  },

  conversational_ai: {
    name: 'Conversational AI',
    effects: [{ type: 'trade_efficiency', value: 5, description: '+5% Trade job efficiency' }],
    conflicts: [],
    restrictions: {},
    traitPoints: 0,
    slavePrice: 750,
    description:
      'Initially designed to provide social support to their creators, the machines possess advanced empathy algorithms and impeccable communication skills, making them ideal companions.'
  },

  nannybot: {
    name: 'Nannybot',
    effects: [
      { type: 'amenities_efficiency', value: 5, description: '+5% Amenities job efficiency' }
    ],
    conflicts: [],
    restrictions: {},
    traitPoints: 0,
    slavePrice: 750,
    description:
      'Originally designed as domestic service droids, these machines boast fine motor skills, efficient resource management, and exceptional multitasking abilities.'
  },

  research_assistants: {
    name: 'Research Assistants',
    effects: [
      { type: 'research_efficiency', value: 2, description: '+2% Research job efficiency' }
    ],
    conflicts: [],
    restrictions: {},
    traitPoints: 0,
    slavePrice: 750,
    description:
      'Initially designed as research assistants, these machines exhibit keen analytical abilities, rapid information assimilation, and a relentless pursuit of scientific discovery.'
  },

  war_machine: {
    name: 'War Machine',
    effects: [{ type: 'army_damage', value: 5, description: '+5% Army damage' }],
    conflicts: [],
    restrictions: {},
    traitPoints: 0,
    slavePrice: 750,
    description:
      'Initially crafted for warfare and security reinforcement, these machines exhibit extraordinary reaction times, fortified armor plating, and robust backup systems.'
  },

  workerbots: {
    name: 'Workerbots',
    effects: [{ type: 'mining_efficiency', value: 5, description: '+5% Mining job efficiency' }],
    conflicts: [],
    restrictions: {},
    traitPoints: 0,
    slavePrice: 750,
    description:
      'These machines were engineered with the purpose of extracting raw materials. Specialized tools, reinforced joints, and modular systems make them ideal workers.'
  }
}
