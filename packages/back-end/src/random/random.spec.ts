import { getRandomInt } from './random'

describe('random', () => {
  describe('getRandomInt', () => {
    it('returns an integer', () => {
      const retval = getRandomInt(1, 10)
      expect(typeof retval).toEqual('number')
    })

    it('returns properly calculated number given a fixed random seed', () => {
      const mockMath: Math = Object.create(global.Math) as Math;
      mockMath.random = () => 0.5;
      global.Math = mockMath;
      const retval = getRandomInt(1, 10)
      expect(retval).toEqual(5)
    })
  })
})
