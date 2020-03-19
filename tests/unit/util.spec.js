import { toRGB } from '../../src/common/utils'

const { expect } = require('chai')


describe('utils', () => {
  describe('toRGB', () => {
    let tests = [
      { arg: ['#333'], res: 'rgb(51,51,51)' },
      { arg: ['#333333'], res: 'rgb(51,51,51)' },
    ]
    tests.forEach((a) => {
      it(`toRGB(${a.arg}) is right`, function () {
        expect(toRGB(...a.arg)).to.include(a.res)
      })
    })
  })
})
