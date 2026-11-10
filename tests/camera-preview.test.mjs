import test from 'node:test'
import assert from 'node:assert/strict'
import { startCameraPreview } from '../src/analysis/cameraPreview.ts'

const flush = () => new Promise((resolve) => setImmediate(resolve))
function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
function media() {
  const track = new EventTarget()
  track.readyState = 'live'
  track.stops = 0
  track.stop = () => { track.stops++; track.readyState = 'ended' }
  return { track, getTracks: () => [track], getVideoTracks: () => [track] }
}
function setup(getUserMedia, play = async () => {}) {
  const events = []
  const video = { srcObject: null, play, pause() {} }
  const options = {
    getUserMedia,
    onLive: () => events.push('live'),
    onPlaybackBlocked: () => events.push('paused'),
    onError: (reason) => events.push(reason),
  }
  return { video, events, options }
}

test('connects a muted inline preview and only reports live after playback starts', async () => {
  const stream = media()
  const playback = deferred()
  const { video, events, options } = setup(async () => stream, () => playback.promise)
  const camera = startCameraPreview(video, options)
  await flush()
  assert.equal(video.srcObject, stream)
  assert.equal(video.muted, true)
  assert.equal(video.defaultMuted, true)
  assert.equal(video.playsInline, true)
  assert.deepEqual(events, [])
  playback.resolve()
  await flush()
  assert.deepEqual(events, ['live'])
  camera.stop()
  assert.equal(video.srcObject, null)
  assert.equal(stream.track.stops, 1)
})

test('a late permission result after leaving the page is released without updating the screen', async () => {
  const permission = deferred()
  const stream = media()
  const { video, events, options } = setup(() => permission.promise)
  const camera = startCameraPreview(video, options)
  camera.stop()
  permission.resolve(stream)
  await flush()
  assert.equal(stream.track.stops, 1)
  assert.equal(video.srcObject, null)
  assert.deepEqual(events, [])
})

test('StrictMode/restart late playback cannot overwrite or clear the new preview', async () => {
  const oldStream = media()
  const newStream = media()
  const playback = deferred()
  const { video, events, options } = setup(async () => oldStream, () => playback.promise)
  const oldCamera = startCameraPreview(video, options)
  await flush()
  oldCamera.stop()
  video.play = async () => {}
  const newCamera = startCameraPreview(video, { ...options, getUserMedia: async () => newStream })
  await flush()
  playback.reject(new DOMException('interrupted', 'AbortError'))
  await flush()
  oldCamera.stop()
  assert.deepEqual(events, ['live'])
  assert.equal(video.srcObject, newStream)
  assert.equal(newStream.track.stops, 0)
  newCamera.stop()
})

test('autoplay denial keeps the camera available for a direct tap to play', async () => {
  const stream = media()
  let plays = 0
  let requests = 0
  const { video, events, options } = setup(async () => { requests++; return stream }, async () => {
    if (++plays === 1) throw new DOMException('tap required', 'NotAllowedError')
  })
  const camera = startCameraPreview(video, options)
  await flush()
  assert.deepEqual(events, ['paused'])
  assert.equal(stream.track.stops, 0)
  const resume = camera.play()
  assert.equal(plays, 2, 'play is called synchronously within the tap handler')
  await resume
  assert.deepEqual(events, ['paused', 'live'])
  assert.equal(requests, 1)
  camera.stop()
})

test('denial then retry attaches to the newly mounted video element', async () => {
  const first = setup(async () => { throw new DOMException('denied', 'NotAllowedError') })
  const failed = startCameraPreview(first.video, first.options)
  await flush()
  assert.deepEqual(first.events, ['denied'])
  failed.stop()
  const stream = media()
  const retry = setup(async () => stream)
  const camera = startCameraPreview(retry.video, retry.options)
  await flush()
  assert.equal(first.video.srcObject, null)
  assert.equal(retry.video.srcObject, stream)
  assert.deepEqual(retry.events, ['live'])
  camera.stop()
})

test('unsupported capture constraints retry once with any camera and no audio', async () => {
  const requests = []
  const stream = media()
  const { video, events, options } = setup(async (constraints) => {
    requests.push(constraints)
    if (requests.length === 1) throw new DOMException('unsupported', 'OverconstrainedError')
    return stream
  })
  const camera = startCameraPreview(video, options)
  await flush()
  assert.equal(requests.length, 2)
  assert.deepEqual(requests[1], { video: true, audio: false })
  assert.deepEqual(events, ['live'])
  camera.stop()
})

test('camera disconnect clears the preview and permits retry instead of staying live', async () => {
  const stream = media()
  const { video, events, options } = setup(async () => stream)
  const camera = startCameraPreview(video, options)
  await flush()
  stream.track.dispatchEvent(new Event('ended'))
  assert.deepEqual(events, ['live', 'unavailable'])
  assert.equal(video.srcObject, null)
  camera.stop()
  assert.equal(stream.track.stops, 1)
})

test('non-policy playback failure releases the camera and does not report live', async () => {
  const stream = media()
  const { video, events, options } = setup(async () => stream, async () => {
    throw new DOMException('unsupported', 'NotSupportedError')
  })
  startCameraPreview(video, options)
  await flush()
  assert.deepEqual(events, ['unavailable'])
  assert.equal(stream.track.stops, 1)
  assert.equal(video.srcObject, null)
})
