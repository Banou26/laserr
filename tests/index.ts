import { group, test } from 'epk'

import { targets } from '../src/targets'

group('targets', () => {
  for (const target of targets) {
    test(`${target.name}`, async (t) => {
      await target.test()
    })
  }
})
