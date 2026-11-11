import test from 'node:test'
import assert from 'node:assert/strict'
import { backDestination } from '../src/state/navigation.ts'

test('Android Back returns through booking and diagnosis without trapping the home screen', () => {
  assert.equal(backDestination('booking'), 'clinics')
  assert.equal(backDestination('clinics'), 'detail')
  assert.equal(backDestination('detail'), 'treatments')
  assert.equal(backDestination('capture'), 'landing')
  assert.equal(backDestination('form'), 'capture')
  assert.equal(backDestination('landing'), null)
})
