export type CelestialOrbitalPeriodParams = {
  parentMass: number
  parentDistance: number
}

export type CelestialTemperatureParams = {
  albedo: number
  greenhouse: number
  star: { radius: number; distance: number; temperature: number }
}

export interface CelestialBody {
  id: string // Unique identifier
  name: string // Name
  mass: number // Mass in Earth masses
  radius: number // Radius in Earth radii
  rotationPeriod: number // Rotation period in Earth hours
  angle: number
  temperature: number // Average surface temperature in Kelvin
  axialTilt: number // Axial tilt in degrees
  distanceFromParent: number // Distance from the parent in Astronomical Units (AU)
  orbitPeriod: number // Time to complete one orbit around the parent in Earth days
  albedo: number // Albedo
  greenhouse: number // Greenhouse effect
  habitable?: boolean
}
