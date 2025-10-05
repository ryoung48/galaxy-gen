import { Nation } from '../../model/nations/types'
import { MATH } from '../../model/utilities/math'

export const HERALDRY = {
  config: (nation: Nation) => {
    const { hue, style } = nation.flag
    return {
      backColor: '#ffffff',
      hues: [hue],
      ...(style === 'monochrome'
        ? {
            lightness: {
              color: [0.55, 0.55],
              grayscale: [0.55, 0.55]
            },
            saturation: {
              color: 0.5,
              grayscale: 0.5
            }
          }
        : style === 'dark chromatic'
        ? {
            lightness: {
              color: [0.84, 0.84],
              grayscale: [0.84, 0.84]
            },
            saturation: {
              color: 0.48,
              grayscale: 0.48
            },
            backColor: MATH.hslToHex(hue, 42, 28)
          }
        : style === 'light chromatic'
        ? {
            lightness: {
              color: [0.1, 0.38],
              grayscale: [0.0, 0.0]
            },
            saturation: {
              color: 0.5,
              grayscale: 0.0
            },
            backColor: MATH.hslToHex(hue, 50, 75)
          }
        : style === 'dusk'
        ? {
            lightness: {
              color: [0.52, 0.84],
              grayscale: [0.52, 0.87]
            },
            saturation: {
              color: 0.5,
              grayscale: 0.5
            },
            backColor: '#000'
          }
        : {
            lightness: {
              color: [0.2, 0.6],
              grayscale: [0.3, 0.6]
            },
            saturation: {
              color: 0.5,
              grayscale: 0.0
            }
          })
    }
  },
  draw: (params: {
    ctx: CanvasRenderingContext2D
    x: number
    y: number
    h: number
    w: number
    borderWidth: number
    backColor: string
    style: Nation['flag']['style']
  }) => {
    const { ctx, x, y, h, w, borderWidth, backColor, style } = params
    const curveHeight = h * 0.25 // 20% of total height for the bottom curve
    const flatHeight = h - curveHeight // Remaining height for the flat part
    // Start from the top-left corner
    ctx.beginPath()

    ctx.moveTo(x, y)

    // Draw the top flat part
    ctx.lineTo(x + w, y)

    // Draw the right edge
    ctx.lineTo(x + w, y + flatHeight)

    // Draw the bottom curve
    ctx.quadraticCurveTo(x + w / 2, y + h, x, y + flatHeight)

    // Close the shape by drawing the left edge
    ctx.lineTo(x, y)

    // Stroke and fill
    ctx.fillStyle = backColor // Fill color
    ctx.fill()
    ctx.lineWidth = borderWidth // Set border width
    ctx.strokeStyle = style === 'light chromatic' ? '#000' : '#000'

    ctx.closePath()
    ctx.stroke()
  }
}
