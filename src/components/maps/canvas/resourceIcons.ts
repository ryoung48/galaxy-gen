import { CANVAS } from '.'
import { ORBITAL_DEPOSITS } from '../../../model/system/resources'
import {
  mdiDiamondStone,
  mdiLightningBolt,
  mdiAccountGroup,
  mdiAtom,
  mdiCog,
  mdiFire,
  mdiStar,
  mdiAnvil,
  mdiFlask,
  mdiRing
} from '@mdi/js'

// Crystal growth icon path from SVGRepo (scaled to 24x24 viewBox)
const crystalGrowthPath =
  'M11.9 0.73l-3.75 3.94 0.11 2.76 2.37 1.7 1.5 8.53 0.51-1.26 0.55-11.03 0.88 0.05-0.43 8.48 1.33-3.32 0.38-5.06 0.04-0.84zm6.52 2.37l-2.19 2.38-0.18 2.4 0.5-1.23 1.43-0.64c0.15-0.97 0.3-1.94 0.45-2.91zm2.83 2.4l-4.02 1.8-4.81 12.0 0.68 3.91h0.37l6.92-13.74 0.78 0.39-6.72 13.35h1.14l6.87-13.68zm-15.95 0.89l-2.54 4.65 3.24 12.17h4.39l-2.4-12.88 0.86-0.16 2.43 13.04h0.93l-2.38-13.57zm16.8 12.21l-3.09-0.24-2.34 4.65 3.27-1.72zm-20.45-1.31l1.99 5.94h1.45L3.78 18.29z'

// Mapping of resource types to MDI icon paths
export const RESOURCE_ICONS = {
  minerals: mdiDiamondStone,
  energy: mdiLightningBolt,
  society: mdiAccountGroup,
  physics: mdiAtom,
  engineering: mdiCog,
  trade: mdiRing,
  'exotic gas': mdiFire,
  'rare crystals': crystalGrowthPath,
  'volatile motes': mdiFlask,
  zro: mdiStar,
  alloys: mdiAnvil
} as const

// Low-level helper that renders an MDI glyph at the desired size
const drawMDIIcon = ({
  ctx,
  x,
  y,
  size,
  path,
  color
}: {
  ctx: CanvasRenderingContext2D
  x: number
  y: number
  size: number
  path: string
  color: string
}) => {
  try {
    const p2d = new Path2D(path)
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(size / 24, size / 24)
    ctx.fillStyle = color
    ctx.fill(p2d)
    ctx.restore()
  } catch {
    // Fallback: simple circle if Path2D unsupported
    ctx.save()
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, 2 * Math.PI)
    ctx.fill()
    ctx.restore()
  }
}

// Public helper – draw icon and amount text, centred beneath the icon
export const drawResourceIconWithText = ({
  ctx,
  resource,
  x,
  y,
  iconSize,
  textSize,
  align = 'center'
}: {
  ctx: CanvasRenderingContext2D
  resource: { type: string; amount: number }
  x: number
  y: number
  iconSize: number
  textSize: number
  align?: CanvasTextAlign
}) => {
  const resourceDef =
    ORBITAL_DEPOSITS.deposits[resource.type as keyof typeof ORBITAL_DEPOSITS.deposits]
  if (!resourceDef) return

  const iconPath = RESOURCE_ICONS[resource.type as keyof typeof RESOURCE_ICONS]
  if (iconPath) {
    drawMDIIcon({
      ctx,
      x,
      y,
      size: iconSize,
      path: iconPath,
      color: resourceDef.color
    })
  }

  CANVAS.text({
    ctx,
    x: x + iconSize / 2,
    y: y + iconSize + textSize,
    text: `${resource.amount}`,
    size: textSize,
    color: resourceDef.color,
    align
  })
}
