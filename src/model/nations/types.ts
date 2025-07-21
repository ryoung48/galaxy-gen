import { Language } from '../languages/types'
import { Species } from '../species/types'

export type Nation = {
  idx: number
  tag: 'nation'
  name: string
  language: Language
  species: Species
  flag: {
    hue: number
    color: string
    style: 'monochrome' | 'dark chromatic' | 'light chromatic' | 'dawn' | 'dusk'
  }
  capital: number
  systems: number[]
}
