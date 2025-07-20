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
  mdiRing,
  mdiTerrain
} from '@mdi/js'

// Mapping of resource types to MDI icon paths
export const RESOURCE_ICONS = {
  minerals: mdiTerrain,
  energy: mdiLightningBolt,
  society: mdiAccountGroup,
  physics: mdiAtom,
  engineering: mdiCog,
  trade: mdiRing,
  'exotic gas': mdiFire,
  'rare crystals': mdiDiamondStone,
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
