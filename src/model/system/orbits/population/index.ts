import { TECHNOLOGY } from '../technology'
import { TEMPERATURE } from '../temperature'
import { Orbit } from '../types'
import { PopulateOrbitParams } from './types'

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n))
}

export const POPULATION = {
  base: ({ orbit, maxPop = 0, capital = false, mainworld = false }: PopulateOrbitParams) => {
    let populationCode = window.dice.roll(2, 6) - 2
    if (orbit.habitability.score <= 0) populationCode -= 4
    else if (orbit.habitability.score <= 2) populationCode -= 2
    else if (orbit.habitability.score <= 4) populationCode -= 1
    else if (orbit.habitability.score <= 6) populationCode += 0
    else if (orbit.habitability.score <= 8) populationCode += 1
    else populationCode += 2
    const natives = orbit.biosphere.code === 10
    if (natives && !capital) {
      const popRoll = window.dice.roll(1, 6)
      if (popRoll > 1) populationCode = window.dice.roll(1, 6) + 4
      else {
        populationCode = window.dice.roll(1, 5) + 1
        orbit.biosphere.label = 'remnants'
      }
    }
    if (capital) populationCode = maxPop
    // size limits
    if (orbit.size === 0) populationCode = Math.min(populationCode, 5)
    else if (orbit.size === 1) populationCode = Math.min(populationCode, 6)
    else if (orbit.size === 2) populationCode = Math.min(populationCode, 7)
    else if (orbit.size === 3) populationCode = Math.min(populationCode, 8)
    else if (orbit.size === 4) populationCode = Math.min(populationCode, 9)
    const ranges = [
      { min: 0, max: 0 },
      { min: 1, max: 99 },
      { min: 100, max: 999 },
      { min: 1_000, max: 9_999 },
      { min: 10_000, max: 99_999 },
      { min: 100_000, max: 999_999 },
      { min: 1_000_000, max: 9_999_999 },
      { min: 10_000_000, max: 99_999_999 },
      { min: 100_000_000, max: 999_999_999 },
      { min: 1_000_000_000, max: 9_999_999_999 },
      { min: 10_000_000_000, max: 99_999_999_999 }
    ]

    populationCode = Math.max(mainworld ? 1 : 0, Math.min(populationCode, maxPop))
    if (populationCode < 0) {
      console.log(populationCode)
    }
    const { min, max } = ranges[populationCode]
    orbit.population = {
      code: populationCode,
      size: window.dice.randint(min, max)
    }
    if (populationCode === 10) {
      let size = 1
      let roll = window.dice.roll(1, 6)
      while (roll >= 5 && size < 3) {
        roll = window.dice.roll(1, 6)
        size += 1
      }
      const lower = 10_000_000_000 * size
      orbit.population.size = window.dice.randint(lower, lower + 9_999_999_999)
    }
  },
  concentration: (orbit: Orbit) => {
    const trace: Required<Orbit>['pcr']['trace'] = []
    const pop = orbit.population?.code ?? 0
    if (pop === 0) return { code: 0, trace }

    // Step 1 — special case for small populations (<6): single settlement check
    const r1 = window.dice.roll(1, 6)
    if (pop < 6 && r1 > pop) {
      trace.push({ value: 9, description: 'single settlement area' })
      return { code: 9, trace }
    }

    // Step 2 — roll on PCR table with DMs
    let dm = 0
    trace.push({ value: r1, description: 'base roll' })
    // size
    if (orbit.size <= 1) {
      trace.push({ value: 2, description: 'small world (0-1)' })
      dm += 2
    } else if (orbit.size <= 3) {
      trace.push({ value: 1, description: 'small world (2-3)' })
      dm += 1
    }
    if (orbit.lock?.type === 'star') {
      trace.push({ value: 2, description: 'solar tidal lock' })
      dm += 2
    }
    // min tech
    const minTech = TECHNOLOGY.minimum(orbit)
    if (minTech >= 8) {
      trace.push({ value: 3, description: 'min sustainable TL (8+)' })
      dm += 3
    } else if (minTech >= 3) {
      trace.push({ value: 1, description: 'min sustainable TL (3+)' })
      dm += 1
    }
    // population
    if (pop >= 9) {
      trace.push({ value: -2, description: 'high population (9+)' })
      dm -= 2
    } else if (pop === 8) {
      trace.push({ value: -1, description: 'high population (8)' })
      dm -= 1
    }
    // government
    if (orbit.government === 7) {
      trace.push({ value: -2, description: 'balkanisation' })
      dm -= 2
    }
    // tech
    if (orbit.technology.score <= 1) {
      trace.push({ value: -2, description: 'primitive TL (0-1)' })
      dm -= 2
    } else if (orbit.technology.score <= 3) {
      trace.push({ value: -1, description: 'primitive TL (2-3)' })
      dm -= 1
    } else if (orbit.technology.score <= 9) {
      trace.push({ value: 1, description: 'pre-stellar TL (4-9)' })
      dm += 1
    }

    const total = r1 + dm // 1D + DM before clamp

    // Step 3 — map 1D+DM to PCR bucket and apply min/max
    const minPCR = pop >= 9 ? 1 : 0
    const unclamped = total // 0- → 0, 1→1, ... 9+ → 9
    const pcr = Math.max(minPCR, Math.min(9, Math.max(0, unclamped)))

    return { code: pcr, trace }
  },
  urbanization: (orbit: Orbit): Required<Orbit>['urbanization'] => {
    const trace: Required<Orbit>['urbanization']['trace'] = []

    const pop = orbit.population?.code ?? 0
    const tl = orbit.technology?.score ?? 0
    const minTech = TECHNOLOGY.minimum(orbit)
    const size = orbit.size ?? 0
    const gov = orbit.government ?? -1
    const law = orbit.law ?? 0
    const pcr = orbit.pcr?.code ?? 0
    // --- Step 1: build DM (modifiers) ---
    let dm = 0
    // PCR-linked DMs
    if (pcr <= 2) {
      const v = -3 + pcr // PCR 0→-3, 1→-2, 2→-1
      if (v !== 0) {
        trace.push({ value: v, description: `low concentration (0-2)` })
        dm += v
      }
    } else if (pcr >= 7) {
      const v = -6 + pcr // PCR 7→+1, 8→+2, 9→+3
      trace.push({ value: v, description: `high concentration (7+)` })
      dm += v
    }

    // Min sustainable TL 0–3 → DM-1
    if (minTech <= 3) {
      trace.push({ value: -1, description: 'min sustainable TL (0–3)' })
      dm -= 1
    }

    // Size 0 → DM+2
    if (size === 0) {
      trace.push({ value: 2, description: 'size 0 world' })
      dm += 2
    }

    // Population DMs (+ minimum floors later)
    let minFloorPct: number | null = null
    if (pop >= 10) {
      trace.push({ value: 4, description: 'population (10+)' })
      dm += 4
      // Minimum = 50% + 1D
      minFloorPct = Math.max(minFloorPct ?? 0, 50 + window.dice.roll(1, 6))
    } else if (pop === 9) {
      trace.push({ value: 2, description: 'population 9' })
      dm += 2
      // Minimum = 18% + 1D
      minFloorPct = Math.max(minFloorPct ?? 0, 18 + window.dice.roll(1, 6))
    } else if (pop === 8) {
      trace.push({ value: 1, description: 'population 8' })
      dm += 1
    }

    // Government 0 → DM-2
    if (gov === 0) {
      trace.push({ value: -2, description: 'government 0' })
      dm -= 2
    }

    // Law level 9+ → DM+1
    if (law >= 9) {
      trace.push({ value: 1, description: 'law level 9+' })
      dm += 1
    }

    // TL-based DMs (+ some max caps tracked below)
    // Track possible maximum caps in an array and apply the tightest later.
    const maxCaps: number[] = []

    if (tl <= 2) {
      trace.push({ value: -2, description: 'TL 0–2' })
      dm -= 2
      maxCaps.push(20 + window.dice.roll(1, 6)) // Maximum = 20% + 1D
    } else if (tl === 3) {
      trace.push({ value: -1, description: 'TL 3' })
      dm -= 1
      maxCaps.push(30 + window.dice.roll(1, 6)) // Maximum = 30% + 1D
    } else if (tl === 4) {
      trace.push({ value: 1, description: 'TL 4' })
      dm += 1
      maxCaps.push(60 + window.dice.roll(1, 6)) // Maximum = 60% + 1D
    } else if (tl >= 5 && tl <= 9) {
      trace.push({ value: 2, description: 'TL 5–9' })
      dm += 2
      maxCaps.push(90 + window.dice.roll(1, 6)) // Maximum = 90% + 1D
    } else if (tl >= 10) {
      trace.push({ value: 1, description: 'TL 10+' })
      dm += 1
      // (No extra TL cap beyond other caps)
    }

    // --- Step 2: roll 2D and compute band total ---
    const r2 = window.dice.roll(2, 6)
    trace.push({ value: r2, description: 'base roll' })
    const total = r2 + dm // 2D + DM

    // --- Step 3: map band to an Urbanisation % (before clamps) ---
    // D2 = 1–2, D3 = 1–3
    const d2 = () => window.dice.roll(1, 2)
    const d3 = () => window.dice.roll(1, 3)

    // table band:
    // 0-  -> <1%
    // 1   -> 1D
    // 2   -> 6 + 1D
    // 3   -> 12 + 1D
    // 4   -> 18 + 1D
    // 5   -> 22 + 2*1D + D2
    // 6   -> 34 + 2*1D + D2
    // 7   -> 46 + 2*1D + D2
    // 8   -> 58 + 2*1D + D2
    // 9   -> 70 + 2*1D + D2
    // 10  -> 84 + 1D
    // 11  -> 90 + 1D
    // 12  -> 96 + D3
    // 13+ -> 100
    const band = Math.max(0, Math.min(13, total))
    let pct: number
    switch (true) {
      case band <= 0: {
        pct = 0.5 // represent “<1%” as 0.5% nominally
        break
      }
      case band === 1: {
        pct = window.dice.roll(1, 6) // 1–6%
        break
      }
      case band === 2: {
        pct = 6 + window.dice.roll(1, 6) // 7–12%
        break
      }
      case band === 3: {
        pct = 12 + window.dice.roll(1, 6) // 13–18%
        break
      }
      case band === 4: {
        pct = 18 + window.dice.roll(1, 6) // 19–24%
        break
      }
      case band === 5: {
        pct = 22 + window.dice.roll(1, 6) * 2 + d2() // 25–36%
        break
      }
      case band === 6: {
        pct = 34 + window.dice.roll(1, 6) * 2 + d2() // 37–48%
        break
      }
      case band === 7: {
        pct = 46 + window.dice.roll(1, 6) * 2 + d2() // 49–60%
        break
      }
      case band === 8: {
        pct = 58 + window.dice.roll(1, 6) * 2 + d2() // 61–72%
        break
      }
      case band === 9: {
        pct = 70 + window.dice.roll(1, 6) * 2 + d2() // 73–84%
        break
      }
      case band === 10: {
        pct = 84 + window.dice.roll(1, 6) // 85–90%
        break
      }
      case band === 11: {
        pct = 90 + window.dice.roll(1, 6) // 91–96%
        break
      }
      case band === 12: {
        pct = 96 + d3() // 97–99%
        break
      }
      default: {
        // band >= 13
        pct = 100 // “greater than 99%” – represent as 100%
        break
      }
    }

    // --- Step 4: apply min / max clamps ---
    // Minimum floors (from Population 9 / A+ if present)
    if (minFloorPct != null) {
      if (pct < minFloorPct) {
        pct = minFloorPct
      }
    }

    // Max caps (take tightest)
    if (maxCaps.length) {
      const hardMax = Math.min(...maxCaps)
      if (pct > hardMax) {
        pct = hardMax
      }
    }

    // Always clamp within [0, 100]
    pct = Math.max(0, Math.min(100, Math.round(pct)))

    return { pct, trace, band }
  },
  cities: {
    count: (orbit: Orbit) => {
      const pop = Number(orbit.population?.code ?? 0)
      const pcr = Number(orbit.pcr?.code ?? 0)

      const urbanPercent = orbit.urbanization?.pct ?? 0

      const totalUrbanPopulation = (urbanPercent / 100) * (orbit.population?.size ?? 0)

      // -------- Case 1: PCR 0 --------
      if (pcr === 0 || totalUrbanPopulation < 10e3) {
        return { count: 0, pop: 0 }
      }

      // -------- Case 2: Pop ≤5 and PCR = 9 --------
      if (pop <= 5 && pcr === 9) {
        return { count: 1, pop: totalUrbanPopulation }
      }

      // -------- Case 3: Pop ≤5 and PCR 1–8 --------
      if (pop <= 5 && pcr >= 1 && pcr <= 8) {
        const maxByPCR = Math.max(1, 9 - pcr) // “Lesser of 9-PCR or Population Code”; keep ≥1
        const count = Math.min(maxByPCR, pop)
        return { count, pop: totalUrbanPopulation }
      }

      // -------- Case 4: Pop ≥6 and PCR = 9 --------
      if (pop >= 6 && pcr === 9) {
        const r2 = window.dice.roll(2, 6)
        const raw = Math.max(pop - r2, 1)
        return { count: raw, pop: totalUrbanPopulation }
      }

      // -------- Case 5: General case --------
      // Text & example imply: Major Cities = ceil( 2D − PCR + (Urbanisation% × 20) / PCR )
      // Example: PCR=3, Urban=39%, 2D=7 ⇒ 7 − 3 + (0.39×20)/3 = 6.6 ⇒ 7
      const r2 = window.dice.roll(2, 6)
      const uFrac = urbanPercent / 100
      const addTerm = (uFrac * 20) / Math.max(pcr, 1)
      const raw = r2 - pcr + addTerm
      let count = Math.ceil(raw)

      // Minimum 1; if Pop Code < 6, cap at Pop Code
      if (count < 1) {
        count = 1
      }
      if (pop < 6 && count > pop) {
        count = pop
      }

      const urbanPops = (pcr / (window.dice.roll(1, 6) + 7)) * totalUrbanPopulation

      return { count, pop: urbanPops }
    },
    pops: (orbit: Orbit) => {
      const n = Math.min(orbit.cities?.count ?? 0, 200)
      const pcr = orbit.pcr?.code ?? 0
      const totalMajorPop = Number(orbit.cities?.total ?? 0)

      const total = orbit.population?.size ?? 0

      // PCR 0 → no major cities
      if (pcr === 0 || n === 0 || totalMajorPop <= 0)
        return [Math.min(total, (window.dice.roll(1, 6) + 2) * 10e3)]

      // Case 2: exactly one major city → all major-city population in that city
      if (n === 1) return [Math.max(1, Math.round(totalMajorPop))]

      // Helper to finish with rounding that preserves the exact total
      function finalizeFromPercents(pcts: number[]): number[] {
        // Normalize to sum 100 exactly (protect against rounding noise)
        const sum = pcts.reduce((a, b) => a + b, 0)
        const norm = sum === 0 ? pcts : pcts.map(v => (v * 100) / sum)

        // Floor-then-distribute to hit totalMajorPop exactly
        const raw = norm.map(p => (p / 100) * totalMajorPop)
        const floored = raw.map(Math.floor)
        let rem = Math.max(0, Math.round(totalMajorPop - floored.reduce((a, b) => a + b, 0)))

        // Distribute remaining people to cities with largest fractional remainders
        const fracIdx = raw
          .map((v, i) => ({ i, f: v - Math.floor(v) }))
          .sort((a, b) => b.f - a.f)
          .map(o => o.i)

        const out = floored.slice()
        for (let k = 0; k < fracIdx.length && rem > 0; k++) {
          out[fracIdx[k]] += 1
          rem -= 1
        }
        // Guarantee each city has ≥ 1 person (after distribution), if total permits
        for (let i = 0; i < out.length && totalMajorPop >= out.length; i++) {
          if (out[i] < 1) out[i] = 1
        }
        // Final small correction if we overshot due to forcing ≥1
        const diff = out.reduce((a, b) => a + b, 0) - Math.round(totalMajorPop)
        if (diff > 0) {
          // remove 1 from the smallest cities until matched
          const order = out
            .map((v, i) => ({ v, i }))
            .sort((a, b) => a.v - b.v)
            .map(o => o.i)
          for (let k = 0; k < order.length && k < diff; k++) out[order[k]] -= 1
        }
        return out
      }

      // --- Case 3: PCR 1–8 and 2–3 major cities ---
      if (pcr >= 1 && pcr <= 8 && (n === 2 || n === 3)) {
        const variance = window.dice.roll(1, 5)
        const sign = window.dice.roll(1, 2) === 1 ? -1 : 1
        const baseFirstPct = (window.dice.roll(1, 6) + 3) * 10 // (1D+3)×10%
        const firstPct = clamp(baseFirstPct + sign * variance, 1, 99)

        let remaining = 100 - firstPct
        const pcts: number[] = [firstPct]

        if (n === 2) {
          pcts.push(Math.max(1, remaining))
          return finalizeFromPercents(pcts)
        }

        // n === 3
        // Second city: (1D+3)×10% of remaining, with the same ±variance rule but bounded
        const baseSecondPct = (window.dice.roll(1, 6) + 3) * 10
        const secondPct = clamp(
          Math.round((baseSecondPct / 100) * remaining) + sign * variance,
          1,
          remaining - 1
        )
        pcts.push(secondPct)
        remaining -= secondPct

        // Third city gets the rest (≥1%)
        pcts.push(Math.max(1, remaining))
        return finalizeFromPercents(pcts)
      }

      // --- Case 4: PCR 1–8 and 4+ major cities → chunking method ---
      // Each city starts with 1%
      const pcts = Array.from({ length: n }, () => 1)
      const pool = 100 - n
      if (pool < 0) {
        // too many cities for 100% (shouldn’t happen), fallback to equal split
        return finalizeFromPercents(Array.from({ length: n }, () => 100 / n))
      }

      // Chunk sizing:
      // - Max chunk size is PCR (%)
      // - Ensure at least 2×n chunks → chunkSize ≤ floor(pool / (2n))
      // - Use whole-number percent chunk size, minimum 1
      const maxChunk = Math.max(1, pcr)
      const minChunks = 2 * n
      const byMinChunks = Math.floor(pool / Math.max(1, minChunks)) || 1
      const chunkSize = clamp(Math.min(maxChunk, byMinChunks), 1, pool || 1)

      let chunks = Math.floor(pool / chunkSize)
      const remainder = pool - chunks * chunkSize

      // Round-robin: give 1D chunks to each city until chunks exhausted
      let i = 0
      while (chunks > 0) {
        const give = clamp(window.dice.roll(1, 6), 1, chunks) // up to remaining chunks
        pcts[i] += give * chunkSize
        chunks -= give
        i = (i + 1) % n
      }
      // The leftover percentage goes to the city that would have received next chunk
      if (remainder > 0) pcts[i] += remainder

      // Ensure all cities ≥ 1% already guaranteed; finalize
      return finalizeFromPercents(pcts)
    },
    unusual: (orbit: Orbit) => {
      let dm = 0
      if (orbit.starport === 'A') dm += 1
      else if (orbit.starport === 'E' || orbit.starport === 'X') dm -= 2

      const minTech = TECHNOLOGY.minimum(orbit)

      if (minTech === 8) dm += 2
      else if (minTech === 9) dm += 3
      else if (minTech >= 10) dm += 4

      const tech = orbit.technology.score
      if (tech >= 13) dm += 2
      else if (tech >= 9) dm += 1

      const hydro = orbit.hydrosphere.code
      const climate = TEMPERATURE.describe(orbit.temperature.mean)
      const hostile = orbit.habitability.score <= 0
      const frozen = climate === 'frozen'
      const dense =
        orbit.atmosphere.subtype === 'very dense' || orbit.atmosphere.subtype === 'extremely dense'
      const vacuum = orbit.atmosphere.type === 'vacuum'
      const small = orbit.size <= 3
      const extreme = hydro >= 12

      const oceanic = hydro === 10 || hydro === 11
      if (hostile || oceanic) dm += 10

      if (orbit.habitability.score >= 8) dm -= 2
      else if (orbit.habitability.score >= 6) dm -= 1

      const present = window.dice.roll(2, 6) + dm >= 12
      if (!present) return undefined
      const avail = [
        { w: tech >= 8 && !extreme && !oceanic ? 5 : 0, v: 'Arcology, sealed city' },
        { w: tech >= 8 && !hostile && !vacuum && !small ? 1 : 0, v: 'Flying, buoyant gas' },
        { w: tech >= 10 ? 1 : 0, v: 'Flying, grav hover' },
        { w: tech >= 14 ? 1 : 0, v: 'Flying, grav mobile' },
        { w: tech >= 6 && hydro <= 8 && !hostile && !small ? 1 : 0, v: 'Mobile, rails' },
        { w: tech >= 9 && hydro <= 8 && !hostile && !small ? 1 : 0, v: 'Mobile, tracked' },
        { w: tech >= 8 ? 1 : 0, v: 'Space, spin' },
        { w: tech >= 10 ? 1 : 0, v: 'Space, grav' },
        { w: tech >= 6 && hydro <= 8 && !hostile && !dense ? 2 : 0, v: 'Subterranean' },
        {
          w: hydro > 6 && !extreme && !frozen ? (oceanic ? 3 : 2) : 0,
          v: 'Water, static floating'
        },
        {
          w: tech >= 8 && hydro > 6 && !extreme && !frozen ? (oceanic ? 3 : 1) : 0,
          v: 'Water, free floating'
        },
        {
          w: tech >= 9 && hydro > 6 && !extreme && !dense ? (oceanic ? 3 : 1) : 0,
          v: 'Water, submerged'
        },
        {
          w: tech >= 12 && hydro > 6 && !extreme && !frozen && !dense ? (oceanic ? 3 : 1) : 0,
          v: 'Water, deep ocean'
        }
      ].filter(({ w }) => w > 0)
      if (avail.length === 0) return undefined
      return window.dice.weightedChoice(avail)
    }
  }
}
