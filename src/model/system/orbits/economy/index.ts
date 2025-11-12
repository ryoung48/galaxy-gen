import { DESIRABILITY } from '../desirability'
import { Orbit } from '../types'

export const ECONOMY = {
  importance(orbit: Orbit): {
    score: number
    trace: { value: number; description: string }[]
  } {
    const trace: { value: number; description: string }[] = []
    let score = 0

    // Starport modifiers
    const starport = orbit.starport ?? 'X'
    if (starport === 'A' || starport === 'B') {
      score += 1
      trace.push({ value: 1, description: `starport ${starport}` })
    } else if (starport === 'D' || starport === 'E' || starport === 'X') {
      score -= 1
      trace.push({ value: -1, description: `starport ${starport}` })
    } else {
      // Starport C: no modifier
      trace.push({ value: 0, description: `starport ${starport}` })
    }

    // Population modifiers
    const popCode = orbit.population?.code ?? 0
    if (popCode >= 0 && popCode <= 6) {
      score -= 1
      trace.push({ value: -1, description: `pop ${popCode}` })
    } else if (popCode >= 9) {
      score += 1
      trace.push({ value: 1, description: `pop ${popCode}` })
    } else {
      // Population 7-8: no modifier
      trace.push({ value: 0, description: `pop ${popCode}` })
    }

    // Tech Level modifiers
    const techLevel = Math.floor(orbit.technology.score)
    if (techLevel >= 0 && techLevel <= 8) {
      score -= 1
      trace.push({ value: -1, description: `TL ${techLevel}` })
    } else if (techLevel >= 16) {
      // Tech Level G+ (16+)
      score += 2
      trace.push({ value: 2, description: `TL ${techLevel}` })
    } else if (techLevel >= 10 && techLevel <= 15) {
      // Tech Level A-F (10-15)
      score += 1
      trace.push({ value: 1, description: `TL ${techLevel}` })
    } else {
      // Tech Level 9: no modifier
      trace.push({ value: 0, description: `TL ${techLevel}` })
    }

    return { score, trace }
  },
  labor(orbit: Orbit) {
    return Math.max(0, (orbit.population?.code ?? 0) - 1)
  },
  infrastructure(orbit: Orbit): { score: number; trace: { value: number; description: string }[] } {
    const trace: { value: number; description: string }[] = []
    const pops = orbit.population?.code ?? 0
    const importance = orbit.importance?.score ?? 0

    trace.push({ value: importance, description: `importance ${importance > 0 ? '+' : ''}${importance}` })

    let bonus = 0
    if (pops >= 7) {
      bonus = window.dice.roll(2, 6)
      trace.push({ value: bonus, description: 'pop 7+ (2d6)' })
    } else if (pops >= 4) {
      bonus = window.dice.roll(1, 6)
      trace.push({ value: bonus, description: 'pop 4-6 (1d6)' })
    }

    const score = Math.max(0, importance + bonus)

    return { score, trace }
  },
  efficiency(orbit: Orbit): {
    score: number
    trace: { value: number; description: string }[]
  } {
    const trace: { value: number; description: string }[] = []
    const popCode = orbit.population?.code ?? 0

    // Special case: Population 0
    if (popCode === 0) {
      return { score: -5, trace: [{ value: -5, description: 'pop 0' }] }
    }

    // Base roll
    let base: number
    if (popCode >= 1 && popCode <= 6) {
      base = window.dice.roll(2, 6) - 7
      trace.push({ value: base, description: 'base roll (2d6-7)' })
    } else {
      // Population 7+: 2D3-4
      base = window.dice.roll(2, 3) - 4
      trace.push({ value: base, description: 'base roll (2d3-4)' })
    }

    // Accumulate DMs
    let dm = 0
    const pushDM = (delta: number, description: string) => {
      dm += delta
      trace.push({ value: delta, description })
    }

    // Government modifiers
    const gov = orbit.government ?? 0
    if ([0, 3, 6, 9, 11, 12, 15].includes(gov)) {
      pushDM(-1, `gov ${gov}`)
    } else if ([1, 2, 4, 5, 8].includes(gov)) {
      pushDM(1, `gov ${gov}`)
    }

    // Law Level modifiers
    const law = orbit.law ?? 0
    if (law >= 0 && law <= 4) {
      pushDM(1, `law ${law}`)
    } else if (law >= 10) {
      pushDM(-1, `law ${law}`)
    }

    // PCR modifiers
    const pcr = orbit.pcr?.code ?? 0
    if (pcr >= 0 && pcr <= 3) {
      pushDM(-1, `PCR ${pcr}`)
    } else if (pcr >= 8) {
      pushDM(1, `PCR ${pcr}`)
    }

    // Calculate final score
    let score = base + dm

    // Clamp to range -5 to +5
    score = Math.max(-5, Math.min(5, score))

    // Special rule: 0 becomes +1
    if (score === 0) {
      score = 1
      trace.push({ value: 1, description: 'zero converted to +1' })
    }

    return { score, trace }
  },
  ru(orbit: Orbit): { score: number; trace: { value: number; description: string }[] } {
    const trace: { value: number; description: string }[] = []

    const labor = Math.max(1, orbit.labor ?? 0)
    const infrastructure = Math.max(1, orbit.infrastructure?.score ?? 0)
    const resources = Math.max(1, orbit.resources.score)
    const efficiency = !orbit.efficiency?.score ? 1 : orbit.efficiency.score

    trace.push({ value: resources, description: `resources` })
    trace.push({ value: infrastructure, description: `infrastructure` })
    trace.push({ value: labor, description: `labor` })
    trace.push({ value: efficiency, description: `efficiency` })

    const score = resources * infrastructure * labor * efficiency

    trace.push({ value: score, description: `total (${resources} × ${infrastructure} × ${labor} × ${efficiency})` })

    return { score, trace }
  },
  gwpPerCapita(orbit: Orbit): { score: number; trace: { value: number; description: string }[] } {
    const trace: { value: number; description: string }[] = []

    const infrastructure = Math.max(1, orbit.infrastructure?.score ?? 0)
    const resources = Math.max(1, orbit.resources.score)
    const base = Math.min(Math.max(2, infrastructure + resources), infrastructure * 2)

    trace.push({ value: base, description: `base` })

    const { starport, government } = orbit
    const techLevel = orbit.technology?.score ?? 0
    const techMod = Math.max(0.05, techLevel / 10)
    trace.push({ value: techMod, description: `TL ${techLevel.toFixed(1)}` })

    const starportMod =
      starport === 'A'
        ? 1.5
        : starport === 'B'
        ? 1.2
        : starport === 'C'
        ? 1
        : starport === 'D'
        ? 0.8
        : starport === 'E'
        ? 0.5
        : 0.2
    trace.push({ value: starportMod, description: `starport ${starport || 'X'}` })

    const govMod =
      government === 0
        ? 1
        : government === 1
        ? 1.5
        : government === 2
        ? 1.2
        : government === 3
        ? 0.8
        : government === 4
        ? 1.2
        : government === 5
        ? 1.3
        : government === 6
        ? 0.6
        : government === 7
        ? 1
        : government === 8
        ? 0.9
        : government === 9
        ? 0.8
        : government === 10
        ? 1
        : government === 11
        ? 0.7
        : government === 12
        ? 1
        : government === 13
        ? 0.6
        : government === 14
        ? 0.5
        : 0.8
    trace.push({ value: govMod, description: `government ${government ?? 0}` })

    const modded = base * techMod * starportMod * govMod * 1e3
    const efficiency = orbit.efficiency?.score ?? 0
    trace.push({ value: efficiency, description: `efficiency` })

    let score: number
    if (efficiency >= 0) {
      score = modded * efficiency
    } else {
      score = modded / Math.max(2, -(efficiency - 1))
    }

    return { score, trace }
  },
  wtn(orbit: Orbit): {
    score: number
    trace: { value: number; description: string }[]
  } {
    const trace: { value: number; description: string }[] = []
    const popCode = orbit.population?.code ?? 0
    const techLevel = Math.floor(orbit.technology.score)
    const starport = orbit.starport ?? 'X'

    // Base WTN = Population code
    trace.push({ value: popCode, description: `pop ${popCode}` })

    // Tech Level DMs
    let dm = 0
    if (techLevel >= 0 && techLevel <= 1) {
      dm = -1
      trace.push({ value: -1, description: `TL ${techLevel}` })
    } else if (techLevel >= 5 && techLevel <= 8) {
      dm = 1
      trace.push({ value: 1, description: `TL ${techLevel}` })
    } else if (techLevel >= 9 && techLevel <= 14) {
      dm = 2
      trace.push({ value: 2, description: `TL ${techLevel}` })
    } else if (techLevel >= 15) {
      dm = 3
      trace.push({ value: 3, description: `TL ${techLevel}` })
    }

    const baseWTN = popCode + dm

    // Starport modifier lookup table
    const starportModifiers: Record<string, number[]> = {
      A: [3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      B: [2, 2, 2, 2, 1, 1, 1, 1, 0, 0, 0, 0, -1, -1, -2],
      C: [2, 2, 1, 1, 1, 1, 0, 0, 0, 0, -1, -1, -2, -2, -3],
      D: [1, 1, 1, 1, 0, 0, 0, 0, -1, -1, -2, -2, -3, -3, -4],
      E: [1, 1, 0, 0, 0, 0, -1, -1, -2, -2, -3, -3, -4, -4, -5],
      X: [0, 0, 0, 0, -5, -5, -6, -6, -7, -7, -8, -8, -9, -9, -10]
    }

    // Determine starport modifier based on base WTN
    let starportMod = 0
    if (baseWTN >= 0 && baseWTN <= 14) {
      starportMod = starportModifiers[starport][baseWTN]
    } else if (baseWTN > 14) {
      // For base WTN 14+, use the last index
      starportMod = starportModifiers[starport][14]
    }

    trace.push({ value: starportMod, description: `starport ${starport}` })

    // Final WTN
    const wtn = Math.max(0, baseWTN + starportMod)

    return { score: wtn, trace }
  },
  inequality(orbit: Orbit): {
    score: number
    trace: { value: number; description: string }[]
  } {
    const trace: { value: number; description: string }[] = []

    // Base: 50
    let score = 50
    trace.push({ value: 50, description: 'base' })

    // Efficiency Rating × 5 (subtract)
    const efficiencyRating = orbit.efficiency?.score ?? 0
    const efficiencyMod = efficiencyRating * 5
    score -= efficiencyMod
    trace.push({ value: -efficiencyMod, description: `efficiency ${efficiencyRating}` })

    // Random variance: (2D-7) × 2
    const variance = (window.dice.roll(2, 6) - 7) * 2
    score += variance
    trace.push({ value: variance, description: 'variance (2d6-7)×2' })

    // Accumulate DMs
    const pushDM = (delta: number, description: string) => {
      score += delta
      trace.push({ value: delta, description })
    }

    // Government modifiers
    const gov = orbit.government ?? 0
    if ([6, 11, 15].includes(gov)) {
      pushDM(10, `gov ${gov}`)
    } else if ([0, 1, 3, 9, 12].includes(gov)) {
      pushDM(5, `gov ${gov}`)
    } else if ([4, 8].includes(gov)) {
      pushDM(-5, `gov ${gov}`)
    } else if (gov === 2) {
      pushDM(-10, `gov ${gov}`)
    }

    // Law Level modifier (9+)
    const law = orbit.law ?? 0
    if (law >= 9) {
      const lawMod = law - 8
      pushDM(lawMod, `law ${law}`)
    }

    // PCR modifier
    const pcr = orbit.pcr?.code ?? 0
    if (pcr !== 0) {
      pushDM(pcr, `PCR ${pcr}`)
    }

    // Infrastructure Factor modifier
    const infrastructure = orbit.infrastructure?.score ?? 0
    if (infrastructure !== 0) {
      pushDM(-infrastructure, `infrastructure ${infrastructure}`)
    }

    return { score, trace }
  },
  compute(orbit: Orbit) {
    orbit.importance = ECONOMY.importance(orbit)
    orbit.resources = DESIRABILITY.resources(orbit)
    orbit.labor = ECONOMY.labor(orbit)
    orbit.infrastructure = ECONOMY.infrastructure(orbit)
    orbit.efficiency = ECONOMY.efficiency(orbit)
    orbit.ru = ECONOMY.ru(orbit)
    const gwpResult = ECONOMY.gwpPerCapita(orbit)
    const total = gwpResult.score * (orbit.population?.size ?? 0)
    orbit.gwp = { total, perCapita: gwpResult.score, trace: gwpResult.trace }
    orbit.wtn = ECONOMY.wtn(orbit)
    orbit.inequality = ECONOMY.inequality(orbit)
  }
}
