import { Orbit } from '../types'
import { Atmosphere } from './types'

export const ATMOSPHERE = {
  finalize: (
    code: number,
    size: number,
    deviation: number,
    hydrosphere: number,
    type: Orbit['type']
  ): Atmosphere => {
    const nonhabitable = deviation < -1.5 || deviation > 1.5
    let atmosphere: Omit<Atmosphere, 'bar'> = { code, type: 'vacuum' }
    if (nonhabitable && code >= 2 && code <= 9) code = 10
    if (code === 0) atmosphere = { code, type: 'vacuum' }
    else if (code === 1) atmosphere = { code, type: 'trace' }
    else if (code === 2)
      atmosphere = { code, type: 'breathable', subtype: 'very thin', tainted: true }
    else if (code === 3) atmosphere = { code, type: 'breathable', subtype: 'very thin' }
    else if (code === 4) atmosphere = { code, type: 'breathable', subtype: 'thin', tainted: true }
    else if (code === 5) atmosphere = { code, type: 'breathable', subtype: 'thin' }
    else if (code === 6) atmosphere = { code, type: 'breathable', subtype: 'standard' }
    else if (code === 7)
      atmosphere = { code, type: 'breathable', subtype: 'standard', tainted: true }
    else if (code === 8) atmosphere = { code, type: 'breathable', subtype: 'dense' }
    else if (code === 9) atmosphere = { code, type: 'breathable', subtype: 'dense', tainted: true }
    else if (code === 10) {
      let roll = window.dice.roll(2, 6)
      if (size <= 4) roll -= 2
      if (deviation >= 1.5) roll -= 2
      if (deviation <= -1.5) roll += 2
      if (roll <= 2) atmosphere = { code, type: 'exotic', subtype: 'very thin', tainted: true }
      else if (roll <= 3) atmosphere = { code, type: 'exotic', subtype: 'very thin' }
      else if (roll <= 4) atmosphere = { code, type: 'exotic', subtype: 'thin', tainted: true }
      else if (roll <= 5) atmosphere = { code, type: 'exotic', subtype: 'thin' }
      else if (roll <= 6) atmosphere = { code, type: 'exotic', subtype: 'standard', tainted: true }
      else if (roll <= 8) atmosphere = { code, type: 'exotic', subtype: 'standard' }
      else if (roll <= 9) atmosphere = { code, type: 'exotic', subtype: 'dense', tainted: true }
      else if (roll <= 10) atmosphere = { code, type: 'exotic', subtype: 'dense' }
      else if (roll <= 11)
        atmosphere = { code, type: 'exotic', subtype: 'very dense', tainted: true }
      else atmosphere = { code, type: 'exotic', subtype: 'very dense' }
    } else if (code === 11 || code === 12) {
      const insidious = code === 12
      const gas = insidious ? 'insidious' : 'corrosive'
      let roll = window.dice.roll(2, 6)
      if (size <= 4) roll -= 3
      if (size >= 8) roll += 2
      if (deviation >= 1.5) roll += 4
      if (deviation <= -1.5) roll -= 2
      if (insidious) roll += 2
      if (type === 'telluric') roll += 4
      if (roll <= 3) atmosphere = { code, type: gas, subtype: 'very thin' }
      else if (roll <= 5) atmosphere = { code, type: gas, subtype: 'thin' }
      else if (roll <= 7) atmosphere = { code, type: gas, subtype: 'standard' }
      else if (roll <= 10) atmosphere = { code, type: gas, subtype: 'dense' }
      else atmosphere = { code, type: gas, subtype: 'very dense' }
    } else if (code === 13) {
      const panthalassic = type === 'panthalassic'
      const subtype: Orbit['atmosphere']['subtype'] = window.dice.weightedChoice([
        { v: 'very dense', w: 3 },
        { v: 'low', w: panthalassic ? 0 : 1 },
        { v: 'unusual', w: 0.5 },
        { v: 'helium', w: panthalassic ? 0 : 0.25 },
        { v: 'hydrogen', w: panthalassic ? 0 : 0.25 }
      ])
      const gaseous = subtype === 'helium' || subtype === 'hydrogen'
      atmosphere = {
        code,
        type: gaseous
          ? 'gaseous'
          : window.dice.weightedChoice([
              { v: 'breathable', w: nonhabitable ? 0 : 5 },
              { v: 'exotic', w: 1 }
            ]),
        subtype,
        unusual:
          subtype === 'unusual'
            ? window.dice.weightedChoice([
                { v: 'ellipsoid', w: 1 },
                { v: 'layered', w: 1 },
                { v: 'steam', w: panthalassic || hydrosphere < 5 ? 0 : 1 },
                { v: 'storms', w: 1 },
                { v: 'tides', w: hydrosphere < 5 ? 0 : 1 },
                { v: 'seasonal', w: 1 }
              ])
            : undefined
      }
    } else if (code === 14) atmosphere = { code, type: 'gaseous', subtype: 'hydrogen' }
    const completed: Atmosphere = {
      ...atmosphere,
      bar: ATMOSPHERE.bar(atmosphere, type === 'panthalassic')
    }
    ATMOSPHERE.taint(completed)
    return completed
  },
  taint: (atmosphere: Atmosphere) => {
    const { type, subtype, tainted } = atmosphere
    if (tainted) {
      const breathable = type === 'breathable'
      const lifeless = type === 'vacuum' || type === 'trace' || type === 'gaseous'
      const extreme = !['thin', 'standard', 'dense'].includes(subtype ?? '')
      const low = breathable && subtype === 'thin'
      const high = breathable && subtype === 'dense'
      const roll = window.dice.roll(2, 6) + (low ? -2 : 0) + (high ? 2 : 0)
      if (roll <= 2) atmosphere.hazard = breathable && !extreme ? 'low oxygen' : 'gas mix'
      else if (roll === 3 || roll === 11) atmosphere.hazard = 'radioactive'
      else if (roll === 4 || roll === 9) atmosphere.hazard = lifeless ? 'gas mix' : 'biologic'
      else if (roll === 5 || roll === 7) atmosphere.hazard = 'gas mix'
      else if (roll === 8) atmosphere.hazard = 'sulphur compounds'
      else if (roll === 10) atmosphere.hazard = 'particulates'
      else atmosphere.hazard = breathable && !extreme ? 'high oxygen' : 'gas mix'
    }
  },
  bar: (atmosphere: Omit<Atmosphere, 'bar'>, panthalassic: boolean) => {
    if (atmosphere.type === 'vacuum') return window.dice.uniform(0, 0.0009)
    else if (atmosphere.type === 'trace') return window.dice.uniform(0.001, 0.09)
    else if (atmosphere.subtype === 'very thin') return window.dice.uniform(0.1, 0.42)
    else if (atmosphere.subtype === 'thin') return window.dice.uniform(0.43, 0.69)
    else if (atmosphere.subtype === 'standard' || atmosphere.subtype === 'unusual') {
      return panthalassic
        ? window.dice.uniform(1, 1.49)
        : atmosphere.unusual === 'steam'
        ? window.dice.uniform(2.5, 5)
        : window.dice.uniform(0.7, 1.49)
    } else if (atmosphere.subtype === 'dense') return window.dice.uniform(1.5, 2.49)
    else if (atmosphere.subtype === 'very dense') return window.dice.uniform(2.5, 10)
    else if (atmosphere.subtype === 'extremely dense') return window.dice.uniform(10, 100)
    else if (atmosphere.type === 'gaseous' && atmosphere.subtype === 'helium')
      return window.dice.uniform(100, 1000)
    else if (atmosphere.type === 'gaseous' && atmosphere.subtype === 'hydrogen')
      return window.dice.uniform(1000, 5000)
    return 0
  },
  color: (code: number): string => {
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
}
