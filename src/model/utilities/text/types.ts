import { Nation } from '../../nations/types'
import { Satellite } from '../../system/satellites/types'
import { Star } from '../../system/stars/types'
import { SolarSystem } from '../../system/types'

type Link = SolarSystem | Nation | Satellite | Star

export type DecorateTextParams = {
  tooltip?: string
  color?: string
  italics?: boolean
  bold?: boolean
  underlineColor?: string
} & ({ link: Link; label?: string } | { link?: Link; label: string })
