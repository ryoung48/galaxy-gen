import { Language } from '../languages/types'

export type Nation = {
  idx: number
  tag: 'nation'
  name: string
  language: Language
  flag: {
    hue: number
    color: string
    style: 'monochrome' | 'dark chromatic' | 'light chromatic' | 'dawn' | 'dusk'
  }
  capital: number
  systems: number[]
  government:
    | 'fragmented'
    | 'confederation'
    | 'oligarchy'
    | 'republic'
    | 'autocracy'
    | 'theocracy'
    | 'hivemind'
}
