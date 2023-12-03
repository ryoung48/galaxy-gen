import { Resource } from '../resources/types'

export interface Star {
  idx: number
  tag: 'star'
  seed: string
  system: number
  mass: number // Mass in solar masses
  radius: number // Radius in solar radii
  luminosity: number // Luminosity in solar luminosities
  temperature: number // Surface temperature in Kelvin
  size: number
  orbit: { angle: number; distance: number }
  resources: { type: Resource; amount: number }[]
  type:
    | 'o star'
    | 'b star'
    | 'a star'
    | 'f star'
    | 'g star'
    | 'k star'
    | 'm star'
    | 'l star'
    | 't star'
    | 'm red giant'
    | 'black hole'
    | 'neutron star'
    | 'pulsar'
  x: number
  y: number
  _name?: string
}

export type StarTemplates = Record<
  Star['type'],
  {
    mass: number[] // Mass in solar masses
    radius: number[] // Radius in solar radii
    luminosity: number[] // Luminosity in solar luminosities
    temperature: number[] // Surface temperature in Kelvin
    color: string
    weight: number // Spawn chance
    habitability: number
    size: { min: number; max: number }
  }
>

export type StarSpawnParams = {
  system: number
  type: Star['type']
  orbit: Star['orbit']
}
