import { Star } from '../../stars/types'

export type AsteroidBelt = {
  composition: {
    rock: number
    ice: number
    metal: number
  }
  bulk: number
}

export type AsteroidBeltSpawnParams = {
  star: Star
  au: number
}
