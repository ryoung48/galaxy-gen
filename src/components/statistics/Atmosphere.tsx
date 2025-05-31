import { CustomPieChart } from './pie'

export const AtmosphereDistribution = () => {
  const atmoFreq = window.galaxy.orbits.reduce((dict: Record<number, number>, orbit) => {
    if (!dict[orbit.atmosphere.code]) dict[orbit.atmosphere.code] = 0
    dict[orbit.atmosphere.code] += 1
    return dict
  }, {})

  const total = Object.values(atmoFreq).reduce((sum, count) => sum + count, 0)

  // Generate colors based on atmosphere types and descriptors
  const getAtmosphereColor = (code: number): string => {
    if (code === 0) return '#ffffff' // vacuum - deep purple (void of space)
    if (code === 1) return '#bfbec0' // trace - lighter purple (minimal atmosphere)
    if (code === 2) return '#7dd3d8' // breathable very thin tainted - light blue-teal
    if (code === 3) return '#6bb6ff' // breathable very thin - medium light blue
    if (code === 4) return '#4a9baa' // breathable thin tainted - blue-teal
    if (code === 5) return '#357abd' // breathable thin - medium blue
    if (code === 6) return '#2e5984' // breathable standard - darker blue
    if (code === 7) return '#1e5572' // breathable standard tainted - dark blue-teal
    if (code === 8) return '#0d3a5c' // breathable dense - very dark blue
    if (code === 9) return '#0a3546' // breathable dense tainted - darkest blue-teal
    if (code === 10) return '#9b59b6' // exotic - purple
    if (code === 11) return '#e74c3c' // corrosive - red
    if (code === 12) return '#8b0000' // insidious - dark red
    if (code === 13) return '#d68910' // unusual - orange
    if (code === 14) return '#e8daef' // hydrogen - light purple
    return '#95a5a6' // fallback - gray
  }

  const getAtmosphereLabel = (code: number): string => {
    if (code === 0) return 'Vacuum (0)'
    if (code === 1) return 'Trace (1)'
    if (code === 2) return 'Very Thin, Tainted (2)'
    if (code === 3) return 'Very Thin (3)'
    if (code === 4) return 'Thin, Tainted (4)'
    if (code === 5) return 'Thin (5)'
    if (code === 6) return 'Standard (6)'
    if (code === 7) return 'Standard, Tainted (7)'
    if (code === 8) return 'Dense (8)'
    if (code === 9) return 'Dense, Tainted (9)'
    if (code === 10) return 'Exotic (10)'
    if (code === 11) return 'Corrosive (11)'
    if (code === 12) return 'Insidious (12)'
    if (code === 13) return 'Super-High Density (13)'
    if (code === 14) return 'Gas Giant Envelope (14)'
    return `Code ${code}`
  }

  const data = Object.entries(atmoFreq)
    .map(([code, count]) => ({
      id: getAtmosphereLabel(parseInt(code)),
      label: getAtmosphereLabel(parseInt(code)),
      value: count,
      color: getAtmosphereColor(parseInt(code))
    }))
    .sort((a, b) => parseInt(a.id.split('-')[1]) - parseInt(b.id.split('-')[1]))

  return <CustomPieChart data={data} total={total} />
}
