import { CANVAS } from '.'
import { OrbitTag } from '../../../model/system/orbits/tags/types'
import { Orbit } from '../../../model/system/orbits/types'
import {
  mdiAnvil,
  mdiCompass,
  mdiBarley,
  mdiPickaxe,
  mdiStar,
  mdiAtom,
  mdiFlask,
  mdiCog,
  mdiShield,
  mdiGate,
  mdiPalmTree,
  mdiHomeRemove,
  mdiYinYang,
  mdiWeatherLightning,
  mdiMeteor,
  mdiPirate,
  mdiBiohazard,
  mdiFire,
  mdiSword,
  mdiRing,
  mdiSpiderOutline,
  mdiAccountTie,
  mdiTent,
  mdiAccountMultiple,
  mdiDramaMasks,
  mdiAccountCash,
  mdiVectorCircle,
  mdiSkull
} from '@mdi/js'

const crystalGrowthPath =
  'M11.9 0.73l-3.75 3.94 0.11 2.76 2.37 1.7 1.5 8.53 0.51-1.26 0.55-11.03 0.88 0.05-0.43 8.48 1.33-3.32 0.38-5.06 0.04-0.84zm6.52 2.37l-2.19 2.38-0.18 2.4 0.5-1.23 1.43-0.64c0.15-0.97 0.3-1.94 0.45-2.91zm2.83 2.4l-4.02 1.8-4.81 12.0 0.68 3.91h0.37l6.92-13.74 0.78 0.39-6.72 13.35h1.14l6.87-13.68zm-15.95 0.89l-2.54 4.65 3.24 12.17h4.39l-2.4-12.88 0.86-0.16 2.43 13.04h0.93l-2.38-13.57zm16.8 12.21l-3.09-0.24-2.34 4.65 3.27-1.72zm-20.45-1.31l1.99 5.94h1.45L3.78 18.29z'

// Mapping of orbit tags to colors and MDI icon paths
export const TAG_DATA: Record<OrbitTag, { color: string; icon: string }> = {
  frontier: {
    color: '#8B4513',
    icon: mdiCompass
  },
  farming: {
    color: '#99ff93',
    icon: mdiBarley
  },
  mining: {
    color: '#d66c57',
    icon: mdiPickaxe
  },
  industrial: {
    color: '#a94fd6',
    icon: mdiAnvil
  },
  trade: {
    color: '#FFFFFF',
    icon: mdiRing
  },
  'exotic gas': {
    color: '#00ffb2',
    icon: mdiFire
  },
  'rare crystals': {
    color: '#d6cc82',
    icon: crystalGrowthPath
  },
  'volatile motes': {
    color: '#c48507',
    icon: mdiFlask
  },
  zro: {
    color: '#4807c1',
    icon: mdiStar
  },
  research: {
    color: '#4169E1',
    icon: mdiAtom
  },
  cultural: {
    color: '#FFFFFF',
    icon: mdiDramaMasks
  },
  shipyards: {
    color: '#d6a757',
    icon: mdiCog
  },
  fortress: {
    color: '#000000',
    icon: mdiShield
  },
  prison: {
    color: '#000000',
    icon: mdiGate
  },
  paradise: {
    color: '#00FF7F',
    icon: mdiPalmTree
  },
  'failed outpost': {
    color: '#000000',
    icon: mdiHomeRemove
  },
  'ancient ruins': {
    color: '#000000',
    icon: mdiVectorCircle
  },
  pilgrimage: {
    color: '#F0E68C',
    icon: mdiYinYang
  },
  storms: {
    color: '#4682B4',
    icon: mdiWeatherLightning
  },
  meteors: {
    color: '#000000',
    icon: mdiMeteor
  },
  raiders: {
    color: '#000000',
    icon: mdiPirate
  },
  plague: {
    color: '#000000',
    icon: mdiBiohazard
  },
  rebellion: {
    color: '#000000',
    icon: mdiFire
  },
  battleground: {
    color: '#000000',
    icon: mdiSword
  },
  wildlife: {
    color: '#000000',
    icon: mdiSpiderOutline
  },
  corruption: {
    color: '#000000',
    icon: mdiAccountCash
  },
  criminals: {
    color: '#000000',
    icon: mdiAccountTie
  },
  doomed: {
    color: '#000000',
    icon: mdiSkull
  },
  primitives: {
    color: '#8B4513',
    icon: mdiTent
  },
  refugees: {
    color: '#4682B4',
    icon: mdiAccountMultiple
  }
}

// Low-level helper that renders an MDI icon at the desired size
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

// Public helper – draw tag icon and value text, centered beneath the icon
export const drawTagIconWithText = ({
  ctx,
  tag,
  x,
  y,
  iconSize,
  textSize,
  align = 'center'
}: {
  ctx: CanvasRenderingContext2D
  tag: Orbit['tags'][number]
  x: number
  y: number
  iconSize: number
  textSize: number
  align?: CanvasTextAlign
}) => {
  const tagData = TAG_DATA[tag.tag]
  if (!tagData) return

  // Draw the MDI icon
  drawMDIIcon({
    ctx,
    x,
    y,
    size: iconSize,
    path: tagData.icon,
    color: tagData.color
  })

  // Draw the value text below the icon
  CANVAS.text({
    ctx,
    x: x + iconSize / 2,
    y: y + iconSize + textSize,
    text: `${tag.value}`,
    size: textSize,
    color: tagData.color,
    align
  })
}
