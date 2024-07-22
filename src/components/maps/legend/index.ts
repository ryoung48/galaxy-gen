import { FONT } from '../../../theme/fonts'
import { METRICS } from './metrics'
import { DrawLegendsParams, LegendParams } from './types'

const embellishFont = 8

const drawLegend = ({ ctx, items, alignment, position, width }: LegendParams) => {
  if (items.length == 0) return
  const boxSize = 10
  const spacingBetweenBoxes = 12
  const spacingFromBoxToText = embellishFont * 0.6
  const textHeight = embellishFont
  ctx.textAlign = 'left'

  let startX = position.x
  if (alignment === 'right') {
    startX = position.x + boxSize
  }

  let startY = position.y

  ctx.font = `${embellishFont}px ${FONT.content}`
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
  ctx.fillRect(startX - 10, startY - 10, boxSize * width, items.length * 23 + 10)
  startY += 5
  for (const item of items) {
    // Draw the color box
    if (item.color) {
      ctx.fillStyle = item.color
      ctx.strokeStyle = 'black'
      ctx.lineWidth = 0.5
      ctx.fillRect(startX, startY, boxSize, boxSize)
      ctx.strokeRect(startX, startY, boxSize, boxSize)
    } else if (item.shape) {
      item.shape({
        ctx,
        point: { x: startX + boxSize * 0.5, y: startY + boxSize * 0.5 },
        scale: 20
      })
    }

    // Draw the text
    ctx.fillStyle = 'black'
    const textX =
      alignment === 'left'
        ? startX + (item.color || item.shape ? boxSize + spacingFromBoxToText : 0)
        : startX - spacingFromBoxToText - ctx.measureText(item.text).width

    ctx.fillText(item.text, textX, startY + textHeight * 1.1)

    // Move to the next position
    startY += boxSize + spacingBetweenBoxes
  }
}

export const LEGEND = {
  draw: ({ ctx, mode }: DrawLegendsParams) => {
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    const height = ctx.canvas.height * 0.3
    const width = ctx.canvas.width * 0.05
    const items =
      mode === 'biosphere'
        ? METRICS.biosphere.legend()
        : mode === 'orbits'
        ? METRICS.orbits.legend()
        : []
    drawLegend({
      ctx,
      items,
      alignment: 'left',
      position: { x: width, y: height },
      width: 6
    })
    ctx.restore()
  }
}
