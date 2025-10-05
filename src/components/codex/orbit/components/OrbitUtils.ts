import { interpolateBrBG, scaleLinear } from 'd3'
import {
  mdiSnowflake,
  mdiWeatherSunny,
  mdiFire,
  mdiWater,
  mdiWaterOff,
  mdiWaterOutline,
  mdiWeatherHurricane
} from '@mdi/js'

export function describeEccentricity(eccentricity: number): string {
  if (eccentricity === 0) return 'circular orbit'
  if (eccentricity > 0 && eccentricity < 0.2) return 'nearly circular orbit'
  if (eccentricity >= 0.2 && eccentricity < 0.4) return 'slightly elliptical orbit'
  if (eccentricity >= 0.4 && eccentricity < 0.7) return 'distinctly elliptical orbit'
  if (eccentricity >= 0.7 && eccentricity < 1) return 'highly elliptical orbit'
  return 'parabolic orbit'
}

export function describeAxialTilt(tilt: number): string {
  if (tilt === 0) return 'no seasons'
  if (tilt > 0 && tilt <= 5) return 'minimal seasons'
  if (tilt > 5 && tilt <= 15) return 'mild seasons'
  if (tilt > 15 && tilt <= 35) return 'moderate seasons'
  return 'extreme seasons'
}

export function describeRotation(rotationHours: number): string {
  if (rotationHours >= 1 && rotationHours <= 6) return 'very fast'
  if (rotationHours > 6 && rotationHours <= 12) return 'fast'
  if (rotationHours > 12 && rotationHours <= 24) return 'moderate'
  if (rotationHours > 24 && rotationHours <= 48) return 'slow'
  if (rotationHours > 48 && rotationHours <= 100) return 'very slow'
  if (rotationHours > 100 && rotationHours <= 1000) return 'extremely slow'
  return 'tidally locked'
}

export function describeHabitability(rating: number): string {
  if (rating <= 0) return 'Actively hostile world: not survivable without specialized equipment'
  if (rating >= 1 && rating <= 2)
    return 'Barely habitable world: full protective equipment often needed'
  if (rating >= 3 && rating <= 5) return 'Marginally survivable world with proper equipment'
  if (rating >= 6 && rating <= 7) return 'Regionally habitable world: may require acclimation'
  if (rating >= 8 && rating <= 9)
    return 'Suitable for human habitation with minimal equipment or acclimation'
  return 'Terra-equivalent garden world'
}

export function getResourceDescription(value: number): string {
  if (value <= 2) return 'No economically extractable resources'
  if (value >= 3 && value <= 5)
    return 'Marginal at best; avoided by most corporations and prospectors'
  if (value >= 6 && value <= 8)
    return 'Worthwhile with considerable effort; prospectors or specialty firms may be able to turn a profit on worlds ignored by major corporations'
  if (value >= 9 && value <= 10)
    return 'Priority targets for both corporations and individual prospectors'
  if (value >= 11)
    return 'Liable to experience a resource ‘rush’ when first opened up for exploitation'
  return 'Unknown resource value'
}

export function describeTechnology(tech: number): string {
  if (tech === 0) return 'No industry'
  if (tech >= 1 && tech <= 3) return 'Primitive'
  if (tech >= 4 && tech <= 6) return 'Industrial'
  if (tech >= 7 && tech <= 9) return 'Early Stellar'
  if (tech >= 10 && tech <= 11) return 'Late Stellar'
  if (tech >= 12 && tech <= 14) return 'Low Imperial'
  if (tech >= 15) return 'High Imperial'
  return `Tech Level ${tech}`
}

export const formatters = {
  population: new Intl.NumberFormat('en-US', { notation: 'compact' })
}

export const getValueColor = (value: number): string => {
  if (value > 0) {
    const intensity = Math.min(Math.abs(value) / 5, 1)
    return `rgb(${Math.round(255 - intensity * 255)}, 255, ${Math.round(255 - intensity * 255)})`
  } else {
    const intensity = Math.min(Math.abs(value) / 12, 1)
    return `rgb(255, ${Math.round(255 - intensity * 255)}, ${Math.round(255 - intensity * 255)})`
  }
}

// Temperature color gradient (lighter blue -> teal -> yellow -> orange -> red)
const temperatureColorScale = scaleLinear<string>()
  .domain([-100, 0, 20, 40, 80])
  .range(['#3b82f6', '#14b8a6', '#fde047', '#f59e0b', '#ef4444'])
  .clamp(true)

export const getTemperatureColor = (celsius: number): string => temperatureColorScale(celsius)

// Delta color using same palette, centered on 0°C change
const temperatureDeltaColorScale = scaleLinear<string>()
  .domain([-200, -30, 0, 30, 120])
  .range(['#93c5fd', '#99f6e4', '#fde68a', '#fdba74', '#fca5a5'])
  .clamp(true)

export const getTemperatureDeltaColor = (deltaCelsius: number): string =>
  temperatureDeltaColorScale(deltaCelsius)

// Resources color gradient (low to high value)
const resourceScale = scaleLinear().domain([2, 12]).range([0, 1]).clamp(true)
export const getResourceColor = (value: number): string => interpolateBrBG(resourceScale(value))

// Choose mdi path based on climate description
export const getClimateIconPath = (climate: string) => {
  switch (climate) {
    case 'frozen':
    case 'cold':
      return mdiSnowflake
    case 'temperate':
    case 'hot':
      return mdiWeatherSunny
    case 'burning':
      return mdiFire
    default:
      return mdiWeatherSunny
  }
}

// Choose mdi path based on hydrosphere code
export const getHydrosphereIconPath = (code: number) => {
  if (code === 0) return mdiWaterOff
  if (code <= 2) return mdiWaterOutline
  if (code <= 12) return mdiWater
  return mdiWeatherHurricane
}

// Generic impact color: low (green) -> mid (yellow) -> high (red)
const impactScale = (max: number) =>
  scaleLinear<string>()
    .domain([0, max * 0.5, max])
    .range(['#86efac', '#fde047', '#ef4444'])
    .clamp(true)

export const getImpactColor = (value: number, max: number): string =>
  impactScale(max)(Math.max(0, Math.min(value, max)))

// helper-only module; no re-exported collections to avoid cycles
