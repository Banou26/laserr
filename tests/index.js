import test from 'node:test'
import assert from 'assert'

test('synchronous passing test', (t) => {
  assert.strictEqual(1, 1)
})
