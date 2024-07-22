import { Point } from '../../../model/utilities/math/types'
import { MapModes } from '../types'

export type LegendParams = {
  ctx: CanvasRenderingContext2D
  items: {
    color?: string
    text: string
    shape?: (_params: { ctx: CanvasRenderingContext2D; point: Point; scale: number }) => void
  }[]
  alignment: 'right' | 'left'
  position: Point
  width: number
}

export type DrawLegendsParams = {
  ctx: CanvasRenderingContext2D
  mode: MapModes
}
