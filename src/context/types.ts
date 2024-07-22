import { Nation } from '../model/nations/types'
import { Star } from '../model/system/stars/types'
import { SolarSystem } from '../model/system/types'

export type ViewState = {
  id: string
  selected: SolarSystem | Nation | Star['orbits'][number] | null
}

export type ViewActions =
  | { type: 'transition'; payload: ViewState['selected'] }
  | { type: 'init'; payload: { id: string } }
