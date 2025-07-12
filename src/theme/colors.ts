export const COLORS = {
  primary: '#07293d',
  accent: '#43e0bb',
  map: '#69707f',
  subtitle: '#9e9e9e',
  random: {
    star: () => {
      const colors = ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#87CEEB', '#FFD700', '#FFA07A']
      const i = Math.floor(Math.random() * colors.length)
      return colors[i]
    }
  },
  darken: (color: string, percent: number): string => {
    return adjustBrightness(color, -Math.abs(percent))
  },
  lighten: (hex: string, percent: number): string => {
    return adjustBrightness(hex, Math.abs(percent))
  }
}

// Helper to adjust brightness for both hex and rgb/rgba strings
const adjustBrightness = (input: string, percent: number): string => {
  if (!input) return input

  const clamp = (n: number) => Math.min(255, Math.max(0, n))

  // HEX colors (#abc or #aabbcc)
  if (input.startsWith('#')) {
    let hex = input.slice(1)
    // Expand shorthand (#abc)
    if (hex.length === 3)
      hex = hex
        .split('')
        .map(c => c + c)
        .join('')
    if (hex.length !== 6) return input
    let [r, g, b] = (hex.match(/\w\w/g) || []).map(h => parseInt(h, 16))

    const factor = 1 + percent / 100
    r = clamp(Math.round(r * factor))
    g = clamp(Math.round(g * factor))
    b = clamp(Math.round(b * factor))

    const toHex = (c: number) => c.toString(16).padStart(2, '0')
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  // rgb/rgba colors
  const rgbRegex = /rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([0-9.]+))?\)/
  const match = input.match(rgbRegex)
  if (match) {
    let r = parseInt(match[1])
    let g = parseInt(match[2])
    let b = parseInt(match[3])
    const a = match[4]

    const factor = 1 + percent / 100
    r = clamp(Math.round(r * factor))
    g = clamp(Math.round(g * factor))
    b = clamp(Math.round(b * factor))

    if (a !== undefined) {
      return `rgba(${r}, ${g}, ${b}, ${a})`
    }
    return `rgb(${r}, ${g}, ${b})`
  }

  // Fallback: return as-is
  return input
}
