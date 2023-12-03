import { Galaxy } from './model/galaxy/types'
import { Dice } from './model/utilities/dice'

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    dice: Dice
    galaxy: Galaxy
  }
}
