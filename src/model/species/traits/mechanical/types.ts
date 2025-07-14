// Machine and Mechanical traits
type MachineTrait = 'machine' | 'mechanical'

// Origin traits
type OriginTrait = 'radiation_shields' | 'zero_g_optimized' | 'molebots' | 'synthetic_salvation'

// Positive traits
type PositiveTrait =
  | 'adaptive_frames'
  | 'efficient_processors'
  | 'harvesters'
  | 'power_drills'
  | 'superconductive'
  | 'double_jointed'
  | 'durable'
  | 'emotion_emulators'
  | 'mass_produced'
  | 'recycled'
  | 'streamlined_protocols'
  | 'domestic_protocols'
  | 'logic_engines'
  | 'trading_algorithms'
  | 'eternal_machine'
  | 'loyalty_circuits'
  | 'propaganda_machines'
  | 'enhanced_memory'
  | 'learning_algorithms'
  | 'engineering_core'
  | 'physics_core'
  | 'sociology_core'
  | 'integrated_weaponry'

// Negative traits
type NegativeTrait =
  | 'bulky'
  | 'custom_made'
  | 'high_bandwidth'
  | 'high_maintenance'
  | 'luxurious'
  | 'uncanny'
  | 'decadent'
  | 'deviants'
  | 'quarrelsome'
  | 'wasteful'
  | 'repurposed_hardware'
  | 'delicate_chassis'
  | 'scarcity_subroutines'

// Waterproof trait
type WaterproofTrait = 'waterproof'

// Strategic resource traits
type StrategicResourceTrait =
  | 'exotic_fuel_consumption'
  | 'rare_crystal_exterior'
  | 'volatile_mote_reactor'

// Design traits
type DesignTrait =
  | 'art_generator'
  | 'conversational_ai'
  | 'nannybot'
  | 'research_assistants'
  | 'war_machine'
  | 'workerbots'

export type MechanicalTraits =
  | MachineTrait
  | OriginTrait
  | PositiveTrait
  | NegativeTrait
  | WaterproofTrait
  | StrategicResourceTrait
  | DesignTrait
