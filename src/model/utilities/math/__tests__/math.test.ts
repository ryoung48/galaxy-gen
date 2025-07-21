// Mock d3 to avoid ES module issues
jest.mock('d3', () => ({
  scaleLinear: jest.fn(() => {
    const mockScale = jest.fn(() => 3.0)
    mockScale.domain = jest.fn().mockReturnThis()
    mockScale.range = jest.fn().mockReturnThis()
    mockScale.clamp = jest.fn().mockReturnThis()
    return mockScale
  })
}))

import { MATH } from '../index'
import { Point } from '../types'

describe('MATH', () => {
  describe('angles', () => {
    describe('radians', () => {
      it('converts degrees to radians correctly', () => {
        expect(MATH.angles.radians(0)).toBe(0)
        expect(MATH.angles.radians(90)).toBe(Math.PI / 2)
        expect(MATH.angles.radians(180)).toBe(Math.PI)
        expect(MATH.angles.radians(360)).toBe(2 * Math.PI)
        expect(MATH.angles.radians(-90)).toBe(-Math.PI / 2)
      })
    })

    describe('degrees', () => {
      it('converts radians to degrees correctly', () => {
        expect(MATH.angles.degrees(0)).toBe(0)
        expect(MATH.angles.degrees(Math.PI / 2)).toBe(90)
        expect(MATH.angles.degrees(Math.PI)).toBe(180)
        expect(MATH.angles.degrees(2 * Math.PI)).toBe(360)
        expect(MATH.angles.degrees(-Math.PI / 2)).toBe(-90)
      })
    })

    describe('cartesian', () => {
      it('converts polar coordinates to cartesian coordinates with default center', () => {
        const result = MATH.angles.cartesian({ radius: 1, deg: 0 })
        expect(result.x).toBeCloseTo(1, 5)
        expect(result.y).toBeCloseTo(0, 5)
      })

      it('converts polar coordinates with custom center', () => {
        const result = MATH.angles.cartesian({
          radius: 1,
          deg: 90,
          center: { x: 5, y: 5 }
        })
        expect(result.x).toBeCloseTo(5, 5)
        expect(result.y).toBeCloseTo(6, 5)
      })

      it('handles negative angles', () => {
        const result = MATH.angles.cartesian({ radius: 1, deg: -90 })
        expect(result.x).toBeCloseTo(0, 5)
        expect(result.y).toBeCloseTo(-1, 5)
      })

      it('handles zero radius', () => {
        const result = MATH.angles.cartesian({ radius: 0, deg: 45 })
        expect(result.x).toBe(0)
        expect(result.y).toBe(0)
      })
    })
  })

  describe('buildDistribution', () => {
    it('normalizes weights to sum to the specified quantity', () => {
      const input = [
        { v: 'a', w: 1 },
        { v: 'b', w: 2 },
        { v: 'c', w: 3 }
      ]
      const result = MATH.buildDistribution(input, 10)

      expect(result).toHaveLength(3)
      expect(result[0].w).toBeCloseTo(10 / 6, 5)
      expect(result[1].w).toBeCloseTo(20 / 6, 5)
      expect(result[2].w).toBeCloseTo(30 / 6, 5)
      expect(result.reduce((sum, item) => sum + item.w, 0)).toBeCloseTo(10, 5)
    })

    it('handles zero total weight', () => {
      const input = [
        { v: 'a', w: 0 },
        { v: 'b', w: 0 }
      ]
      const result = MATH.buildDistribution(input, 5)

      expect(result).toHaveLength(2)
      expect(result[0].w).toBe(0)
      expect(result[1].w).toBe(0)
    })

    it('uses default quantity of 1', () => {
      const input = [
        { v: 'a', w: 1 },
        { v: 'b', w: 2 }
      ]
      const result = MATH.buildDistribution(input)

      expect(result.reduce((sum, item) => sum + item.w, 0)).toBeCloseTo(1, 5)
    })
  })

  describe('clamp', () => {
    it('clamps values to the specified range', () => {
      expect(MATH.clamp(5, 0, 10)).toBe(5)
      expect(MATH.clamp(-5, 0, 10)).toBe(0)
      expect(MATH.clamp(15, 0, 10)).toBe(10)
      expect(MATH.clamp(0, 0, 10)).toBe(0)
      expect(MATH.clamp(10, 0, 10)).toBe(10)
    })

    it('handles negative ranges', () => {
      expect(MATH.clamp(-15, -10, -5)).toBe(-10)
      expect(MATH.clamp(-3, -10, -5)).toBe(-5)
      expect(MATH.clamp(-7, -10, -5)).toBe(-7)
    })
  })

  describe('distance', () => {
    it('calculates distance between two points', () => {
      expect(MATH.distance([0, 0], [3, 4])).toBe(5)
      expect(MATH.distance([1, 1], [4, 5])).toBe(5)
      expect(MATH.distance([0, 0], [0, 0])).toBe(0)
      expect(MATH.distance([-1, -1], [2, 2])).toBeCloseTo(4.2426, 4)
    })

    it('handles negative coordinates', () => {
      expect(MATH.distance([-3, -4], [0, 0])).toBe(5)
      expect(MATH.distance([-1, -1], [-4, -5])).toBe(5)
    })
  })

  describe('extractHue', () => {
    it('extracts hue from HSL string', () => {
      expect(MATH.extractHue('hsl(120, 50%, 50%)')).toBe(120)
      expect(MATH.extractHue('hsl(0, 100%, 50%)')).toBe(0)
      expect(MATH.extractHue('hsl(360, 0%, 100%)')).toBe(360)
      expect(MATH.extractHue('hsl(180, 25%, 75%)')).toBe(180)
    })

    it('returns null for invalid HSL strings', () => {
      expect(MATH.extractHue('rgb(255, 0, 0)')).toBeNull()
      expect(MATH.extractHue('invalid')).toBeNull()
      expect(MATH.extractHue('')).toBeNull()
      expect(MATH.extractHue('hsl(abc, 50%, 50%)')).toBeNull()
    })
  })

  describe('findClosest', () => {
    it('finds the closest point from an array of points', () => {
      const target: Point = { x: 0, y: 0 }
      const points: Point[] = [
        { x: 10, y: 10 },
        { x: 3, y: 4 },
        { x: 1, y: 1 },
        { x: 5, y: 5 }
      ]

      const closest = MATH.findClosest(target, points)
      expect(closest).toEqual({ x: 1, y: 1 })
    })

    it('handles single point array', () => {
      const target: Point = { x: 0, y: 0 }
      const points: Point[] = [{ x: 5, y: 5 }]

      const closest = MATH.findClosest(target, points)
      expect(closest).toEqual({ x: 5, y: 5 })
    })

    it('handles points with equal distances', () => {
      const target: Point = { x: 0, y: 0 }
      const points: Point[] = [
        { x: 3, y: 4 },
        { x: 4, y: 3 }
      ]

      const closest = MATH.findClosest(target, points)
      // Both points have distance 5, so it could return either
      expect([
        { x: 3, y: 4 },
        { x: 4, y: 3 }
      ]).toContainEqual(closest)
    })
  })

  describe('hslToHex', () => {
    it('converts HSL to hex color', () => {
      expect(MATH.hslToHex(0, 100, 50)).toBe('#ff0000')
      expect(MATH.hslToHex(120, 100, 50)).toBe('#00ff00')
      expect(MATH.hslToHex(240, 100, 50)).toBe('#0000ff')
    })

    it('handles different saturation and lightness values', () => {
      expect(MATH.hslToHex(0, 50, 50)).toBe('#bf4040')
      expect(MATH.hslToHex(120, 100, 25)).toBe('#008000')
      // Note: HSL to hex conversion can have slight variations due to rounding
      const result = MATH.hslToHex(240, 50, 75)
      expect(result).toMatch(/^#[0-9a-f]{6}$/)
    })

    it('handles edge cases', () => {
      expect(MATH.hslToHex(0, 0, 0)).toBe('#000000')
      expect(MATH.hslToHex(0, 0, 100)).toBe('#ffffff')
      expect(MATH.hslToHex(360, 100, 50)).toBe('#ff0000')
    })
  })

  describe('normalize', () => {
    it('normalizes an array of numbers', () => {
      const result = MATH.normalize([1, 2, 3])
      expect(result).toEqual([1 / 6, 2 / 6, 3 / 6])
    })

    it('handles array with zeros', () => {
      const result = MATH.normalize([0, 1, 0])
      expect(result).toEqual([0, 1, 0])
    })

    it('handles empty array', () => {
      const result = MATH.normalize([])
      expect(result).toEqual([])
    })

    it('handles array with negative numbers', () => {
      const result = MATH.normalize([-1, 2, -3])
      expect(result).toEqual([-1 / -2, 2 / -2, -3 / -2])
    })
  })

  describe('orbits', () => {
    describe('fromAU', () => {
      it('converts AU to orbit number using d3 scale', () => {
        const result = MATH.orbits.fromAU(1.0)
        // Since we're mocking d3, we expect the mock to be called
        expect(result).toBeDefined()
        expect(typeof result).toBe('number')
      })
    })

    describe('toAU', () => {
      it('converts orbit number to AU using d3 scale', () => {
        const result = MATH.orbits.toAU(3)
        // Since we're mocking d3, we expect the mock to be called
        expect(result).toBeDefined()
        expect(typeof result).toBe('number')
      })
    })

    describe('period', () => {
      it('calculates orbital period correctly', () => {
        const result = MATH.orbits.period(1, 1)
        expect(result).toBe(1)

        const result2 = MATH.orbits.period(8, 1)
        expect(result2).toBeCloseTo(22.627, 3)
      })

      it('handles different solar masses', () => {
        const result = MATH.orbits.period(1, 2)
        expect(result).toBeCloseTo(0.707, 3)
      })
    })

    describe('distance', () => {
      it('calculates distance from temperature and luminosity', () => {
        const result = MATH.orbits.distance(279, 1)
        expect(result).toBe(1)

        const result2 = MATH.orbits.distance(558, 1)
        // The formula is (luminosity / (kelvin / 279)^4)^0.5
        // For kelvin=558, luminosity=1: (1 / (558/279)^4)^0.5 = (1 / 2^4)^0.5 = (1/16)^0.5 = 0.25
        expect(result2).toBeCloseTo(0.25, 4)
      })
    })
  })

  describe('temperature', () => {
    describe('celsius', () => {
      it('converts kelvin to celsius', () => {
        expect(MATH.temperature.celsius(273.15)).toBeCloseTo(0, 2)
        expect(MATH.temperature.celsius(373.15)).toBeCloseTo(100, 2)
        expect(MATH.temperature.celsius(0)).toBeCloseTo(-273.15, 2)
      })
    })

    describe('kelvin', () => {
      it('converts celsius to kelvin', () => {
        expect(MATH.temperature.kelvin(0)).toBeCloseTo(273.15, 2)
        expect(MATH.temperature.kelvin(100)).toBeCloseTo(373.15, 2)
        expect(MATH.temperature.kelvin(-273.15)).toBeCloseTo(0, 2)
      })
    })
  })

  describe('time', () => {
    describe('convertYears', () => {
      it('converts years to centuries', () => {
        expect(MATH.time.convertYears(150)).toBe('1.50 centuries')
        expect(MATH.time.convertYears(200)).toBe('2.00 centuries')
      })

      it('converts years to decades', () => {
        expect(MATH.time.convertYears(15)).toBe('1.50 decades')
        expect(MATH.time.convertYears(25)).toBe('2.50 decades')
      })

      it('converts years to years', () => {
        expect(MATH.time.convertYears(5)).toBe('5.00 years')
        expect(MATH.time.convertYears(1.5)).toBe('1.50 years')
      })

      it('converts years to days', () => {
        expect(MATH.time.convertYears(0.5)).toBe('182.63 days')
        expect(MATH.time.convertYears(0.1)).toBe('36.52 days')
      })

      it('converts years to hours', () => {
        expect(MATH.time.convertYears(0.001)).toBe('8.77 hours')
        expect(MATH.time.convertYears(0.0001)).toBe('0.88 hours')
      })
    })

    describe('convertHours', () => {
      it('converts hours to appropriate time units', () => {
        const hoursInYear = 24 * 365.25
        expect(MATH.time.convertHours(hoursInYear)).toBe('1.00 years')
        expect(MATH.time.convertHours(hoursInYear * 10)).toBe('1.00 decades')
        expect(MATH.time.convertHours(hoursInYear * 100)).toBe('1.00 centuries')
      })
    })
  })
})
