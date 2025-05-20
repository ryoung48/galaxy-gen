import { Language } from '../languages/types'

export type Nation = {
  idx: number
  tag: 'nation'
  name: string
  language: Language
  flag: { hue: number; color: string; style: 'monochrome' | 'contrast' | 'standard' }
  capital: number
  systems: number[]
}
