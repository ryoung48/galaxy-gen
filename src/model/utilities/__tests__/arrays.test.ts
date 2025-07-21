import { ARRAY } from '../arrays'

describe('ARRAY Utility', () => {
  describe('unique', () => {
    it('removes duplicate values from an array', () => {
      const input = [1, 2, 2, 3, 3, 4]
      const expected = [1, 2, 3, 4]
      expect(ARRAY.unique(input)).toEqual(expected)
    })

    it('returns empty array for empty input', () => {
      expect(ARRAY.unique([])).toEqual([])
    })

    it('returns same array for array with no duplicates', () => {
      const input = [1, 2, 3, 4]
      expect(ARRAY.unique(input)).toEqual(input)
    })

    it('works with string arrays', () => {
      const input = ['a', 'b', 'a', 'c', 'b']
      const expected = ['a', 'b', 'c']
      expect(ARRAY.unique(input)).toEqual(expected)
    })

    it('works with mixed type arrays', () => {
      const input = [1, 'a', 1, 'b', 'a']
      const expected = [1, 'a', 'b']
      expect(ARRAY.unique(input)).toEqual(expected)
    })
  })
})
