import { Galaxy } from './model/galaxy/types'
import { Dice } from './model/utilities/dice'

declare global {
  interface Window {
    dice: Dice
    galaxy: Galaxy
  }
}
