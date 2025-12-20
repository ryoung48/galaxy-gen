import { Orbit } from './types'
import { Star } from '../stars/types'
import { CONSTANTS } from '../../constants'

// Conversion constants for angular size calculations (based on Traveller rules)
const STELLAR_DIAMETER_KM = 1.39e6 // 1 Solar Diameter in kilometers
const AU_KM = 1.5e8 // 1 AU in kilometers

// Reference constants for magnitude calculations
const SOL_ABSOLUTE_MAGNITUDE = 4.83 // Sun's absolute visual magnitude
const SOL_LUMINOSITY = 1 // By definition
const PARSEC_IN_AU = 206265 // 1 parsec ≈ 206265 AU

// Typical geometric albedos for different body types
const ALBEDO = {
    rocky: 0.1, // Mercury-like
    ice: 0.6, // Europa-like
    gas: 0.5, // Jupiter-like
    metallic: 0.15
} as const

export interface VisibilityResult {
    name: string
    tag: 'star' | 'orbit'
    idx: number
    /** Angular size in radians */
    radians: number
    /** Angular size in degrees */
    degrees: number
    /** Angular size in arcminutes */
    arcminutes: number
    /** Distance in AU from the observer */
    distanceAU: number
    /** Diameter in km */
    diameterKm: number
    /** Apparent magnitude (lower = brighter, negative = very bright) */
    magnitude: number
    /** Human-readable brightness description */
    brightnessDescription: string
}

export const VISIBILITY = {
    /**
     * Calculate the angular size of an object as seen from another location.
     * Angular Size (radians) = Diameter / Distance
     * Capped at 180° (hemisphere) - objects can't appear larger than the entire sky.
     */
    angularSize: (
        diameterKm: number,
        distanceKm: number
    ): { radians: number; degrees: number; arcminutes: number } => {
        if (distanceKm <= 0) return { radians: 0, degrees: 0, arcminutes: 0 }
        const radians = Math.min(diameterKm / distanceKm, Math.PI) // Cap at π radians (180°)
        const degrees = radians * (180 / Math.PI)
        const arcminutes = degrees * 60
        return { radians, degrees, arcminutes }
    },

    /** Get the diameter of a star in kilometers (stored in Solar Diameters). */
    starDiameterKm: (star: Star): number => star.diameter * STELLAR_DIAMETER_KM,

    /** Get the diameter of an orbit (planet/moon) in kilometers (stored in Earth Diameters). */
    orbitDiameterKm: (orbit: Orbit): number => orbit.diameter * CONSTANTS.ED,

    /**
     * Calculate absolute magnitude of a star from its luminosity.
     * M = M_sun - 2.5 * log10(L/L_sun)
     */
    absoluteMagnitude: (luminosity: number): number => {
        return SOL_ABSOLUTE_MAGNITUDE - 2.5 * Math.log10(luminosity / SOL_LUMINOSITY)
    },

    /**
     * Calculate apparent magnitude from absolute magnitude and distance.
     * m = M + 5 * log10(d/10pc) where d is in parsecs
     * Or: m = M + 5 * log10(d_AU) - 5 * log10(PARSEC_IN_AU) + 5
     */
    apparentMagnitude: (absoluteMagnitude: number, distanceAU: number): number => {
        if (distanceAU <= 0) return -30 // Arbitrary very bright value
        const distanceParsec = distanceAU / PARSEC_IN_AU
        return absoluteMagnitude + 5 * Math.log10(distanceParsec / 10)
    },

    /**
     * Calculate apparent magnitude of a planet/moon from reflected starlight.
     * Uses phase integral for full phase (opposition), simplified formula.
     * m = m_star + 5*log10(d_star * d_observer) - 2.5*log10(albedo * (r/d_observer)^2 * phase)
     */
    reflectedMagnitude: (
        starMagnitude: number,
        starDistanceAU: number,
        observerDistanceAU: number,
        radiusKm: number,
        albedo: number,
        phaseAngle: number = 0 // 0 = full phase (opposition), π = new phase
    ): number => {
        if (observerDistanceAU <= 0 || starDistanceAU <= 0) return 30

        // Phase function (Lambertian approximation)
        const phaseFactor = (1 + Math.cos(phaseAngle)) / 2
        if (phaseFactor <= 0) return 30 // Object not illuminated

        const radiusAU = radiusKm / AU_KM

        // Reflected light magnitude calculation
        // Based on: apparent mag = star mag + 5*log10(r_star) + 5*log10(r_obs) - 2.5*log10(albedo * phase * (R/r_obs)^2)
        const term1 = 5 * Math.log10(starDistanceAU)
        const term2 = 5 * Math.log10(observerDistanceAU)
        const term3 = -2.5 * Math.log10(albedo * phaseFactor * (radiusAU / observerDistanceAU) ** 2)

        return starMagnitude + term1 + term2 + term3
    },

    /**
     * Get albedo from orbit data, falling back to composition-based estimate.
     */
    getAlbedo: (orbit: Orbit): number => {
        // Use actual albedo from temperature trace if available
        return orbit.temperature?.trace?.albedo ?? 0.11
    },

    /**
     * Describe brightness using intuitive terms based on apparent magnitude.
     * Reference: Sol from Terra = -26.7, Full Moon = -12.7, Venus max = -4.6
     * Sirius = -1.46, naked eye limit ≈ +6
     */
    describeBrightness: (magnitude: number): string => {
        if (magnitude <= -20) return 'blindingly bright (star-like)'
        if (magnitude <= -12) return 'brilliant (full moon-like)'
        if (magnitude <= -4) return 'very bright (Venus-like)'
        if (magnitude <= -1) return 'bright (brightest star-like)'
        if (magnitude <= 1) return 'prominent'
        if (magnitude <= 3) return 'easily visible'
        if (magnitude <= 6) return 'visible to naked eye'
        if (magnitude <= 10) return 'requires binoculars'
        return 'requires telescope'
    },

    /**
     * Get the distance between observer and target in kilometers.
     * Handles special cases for moons and their parent planets.
     */
    distanceKm: (
        observer: Orbit,
        target: { au: number } | Orbit | Star,
        options: { atHorizon?: boolean } = {}
    ): number => {
        const observerRadiusKm = options.atHorizon ? 0 : VISIBILITY.orbitDiameterKm(observer) / 2

        // For moons orbiting the same parent
        if ('moon' in target && target.moon && observer.parent.idx === (target as Orbit).parent.idx) {
            const pd1 = observer.moon?.pd ?? 0
            const pd2 = (target as Orbit).moon?.pd ?? 0
            const parentDiameterKm = VISIBILITY.orbitDiameterKm(window.galaxy.orbits[observer.parent.idx])
            const distanceKm = Math.abs(pd2 - pd1) * parentDiameterKm
            return Math.max(distanceKm - observerRadiusKm, 1)
        }

        // For a moon looking at its parent planet
        if (observer.moon && observer.parent.type === 'orbit') {
            const parent = window.galaxy.orbits[observer.parent.idx]
            if ('idx' in target && (target as Orbit).idx === parent.idx) {
                const distanceKm = observer.moon.pd * VISIBILITY.orbitDiameterKm(parent)
                return Math.max(distanceKm - observerRadiusKm, 1)
            }
        }

        // For a planet looking at its moon
        if ('moon' in target && (target as Orbit).moon && (target as Orbit).parent.idx === observer.idx) {
            const moon = target as Orbit
            const distanceKm = moon.moon!.pd * VISIBILITY.orbitDiameterKm(observer)
            return Math.max(distanceKm - observerRadiusKm, 1)
        }

        // Default: use AU-based distance
        const distanceAU = Math.abs(target.au - observer.au)
        const distanceKm = distanceAU * AU_KM
        return Math.max(distanceKm - observerRadiusKm, 1)
    },

    /**
     * Calculate visibility data for all objects in the solar system
     * as seen from the surface of the given orbit (planet or moon).
     * Returns angular size and apparent brightness for each object.
     */
    getAll: (observer: Orbit, options: { atHorizon?: boolean } = {}): VisibilityResult[] => {
        const results: VisibilityResult[] = []
        const system = window.galaxy.systems[observer.system]
        const primaryStar = system.star

        // Track stars for reflected light calculations
        const starData: { star: Star; magnitude: number }[] = []

        const addStar = (star: Star) => {
            const diameterKm = VISIBILITY.starDiameterKm(star)
            const distanceKm = VISIBILITY.distanceKm(observer, star, options)
            const angular = VISIBILITY.angularSize(diameterKm, distanceKm)
            const distanceAU = Math.abs(star.au - observer.au)

            const absMag = VISIBILITY.absoluteMagnitude(star.luminosity)
            const magnitude = VISIBILITY.apparentMagnitude(absMag, distanceAU)

            starData.push({ star, magnitude })

            results.push({
                name: star.name || `Star ${star.idx}`,
                tag: 'star',
                idx: star.idx,
                ...angular,
                distanceAU,
                diameterKm,
                magnitude,
                brightnessDescription: VISIBILITY.describeBrightness(magnitude)
            })
        }

        const processStars = (star: Star) => {
            addStar(star)
            for (const child of star.orbits) {
                if (child.tag === 'star') processStars(child as Star)
            }
        }
        processStars(primaryStar)

        const addOrbit = (orbit: Orbit) => {
            if (orbit.idx === observer.idx) return
            if (orbit.group === 'asteroid belt') return

            const diameterKm = VISIBILITY.orbitDiameterKm(orbit)
            const distanceKm = VISIBILITY.distanceKm(observer, orbit, options)
            const angular = VISIBILITY.angularSize(diameterKm, distanceKm)
            const observerDistanceAU = Math.abs(orbit.au - observer.au)

            // Calculate reflected magnitude from the brightest illuminating star
            const albedo = VISIBILITY.getAlbedo(orbit)
            let magnitude = 30 // Default very dim

            for (const { star } of starData) {
                const starDistanceAU = orbit.au // Distance from star to object
                const starAbsMag = VISIBILITY.absoluteMagnitude(star.luminosity)
                const starAppMag = VISIBILITY.apparentMagnitude(starAbsMag, starDistanceAU)

                const reflectedMag = VISIBILITY.reflectedMagnitude(
                    starAppMag,
                    starDistanceAU,
                    observerDistanceAU,
                    diameterKm / 2,
                    albedo
                )
                magnitude = Math.min(magnitude, reflectedMag)
            }

            results.push({
                name: orbit.name || `Orbit ${orbit.idx}`,
                tag: 'orbit',
                idx: orbit.idx,
                ...angular,
                distanceAU: observerDistanceAU,
                diameterKm,
                magnitude,
                brightnessDescription: VISIBILITY.describeBrightness(magnitude)
            })
        }

        const processOrbits = (parent: Star | Orbit) => {
            const orbits = parent.orbits as Orbit[]
            for (const orbit of orbits) {
                addOrbit(orbit)
                for (const moon of orbit.orbits) addOrbit(moon)
            }
        }

        const processAllOrbits = (star: Star) => {
            processOrbits(star)
            for (const child of star.orbits) {
                if (child.tag === 'star') processAllOrbits(child as Star)
            }
        }
        processAllOrbits(primaryStar)

        results.sort((a, b) => b.degrees - a.degrees)
        return results
    },

    /**
     * Describe the apparent size of an object in the sky using intuitive terms.
     * Reference: Sol and Luna from Terra are both about 0.5 degrees (30 arcminutes).
     */
    describeSize: (arcminutes: number): string => {
        if (arcminutes >= 1800) return 'dominates the sky'
        if (arcminutes >= 600) return 'massive'
        if (arcminutes >= 120) return 'huge'
        if (arcminutes >= 60) return 'very large'
        if (arcminutes >= 30) return 'large (Sol/Luna-sized)'
        if (arcminutes >= 15) return 'prominent'
        if (arcminutes >= 5) return 'visible disk'
        if (arcminutes >= 1) return 'small disk'
        if (arcminutes >= 1 / 60) return 'point of light'
        return 'invisible to naked eye'
    }
}
