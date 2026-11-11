import test from 'node:test'
import assert from 'node:assert/strict'
import { cropRectFor, mobileFraming, regionMapper, grabFrame } from '../src/analysis/capture.ts'
import { ELLIPSE_CX, ELLIPSE_CY, ELLIPSE_RX, ELLIPSE_RY } from '../src/analysis/skinPixelAnalysis.ts'

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`)

test('mobile guide projects exactly onto the sampled ellipse for portrait, landscape and toolbar changes', () => {
  for (const [videoW, videoH] of [[720, 1280], [960, 1280], [1280, 800], [1920, 1080]]) {
    for (const [width, height] of [[296, 280], [366, 420], [406, 590], [530, 220]]) {
      const preview = { width, height }
      const { guide, crop } = mobileFraming(videoW, videoH, preview)
      const scale = Math.min(width / videoW, height / videoH)
      const offsetX = (width - videoW * scale) / 2
      const offsetY = (height - videoH * scale) / 2
      close(offsetX + (crop.x + crop.width * ELLIPSE_CX) * scale, guide.left + guide.width / 2)
      close(offsetY + (crop.y + crop.height * ELLIPSE_CY) * scale, guide.top + guide.height / 2)
      close(crop.width * 2 * ELLIPSE_RX * scale, guide.width)
      close(crop.height * 2 * ELLIPSE_RY * scale, guide.height)
      assert.ok(crop.x >= -1e-8 && crop.y >= 0)
      assert.ok(crop.x + crop.width <= videoW + 1e-8)
      assert.ok(crop.y + crop.height <= videoH + 1e-8)
      assert.ok(guide.left >= 0 && guide.top >= 0)
      assert.ok(guide.left + guide.width <= width)
      assert.ok(guide.top + guide.height <= height)
      const face = regionMapper(videoW, videoH, preview)({
        left: (crop.x + crop.width * (ELLIPSE_CX - ELLIPSE_RX)) / videoW,
        right: (crop.x + crop.width * (ELLIPSE_CX + ELLIPSE_RX)) / videoW,
        top: (crop.y + crop.height * (ELLIPSE_CY - ELLIPSE_RY)) / videoH,
        bottom: (crop.y + crop.height * (ELLIPSE_CY + ELLIPSE_RY)) / videoH,
      })
      close(face.left, ELLIPSE_CX - ELLIPSE_RX)
      close(face.bottom, ELLIPSE_CY + ELLIPSE_RY)
    }
  }
})

test('portrait mobile guide is more than twice as wide as the previous landscape guide', () => {
  const { guide } = mobileFraming(960, 1280, { width: 366, height: 488 })
  assert.ok(guide.width > 2 * 366 * (250 / 936))
})

test('captured canvas uses the same mobile crop as the guide and detector', () => {
  const previous = globalThis.document
  let drawArgs
  const canvas = { width: 0, height: 0, getContext: () => ({ drawImage: (...args) => { drawArgs = args } }) }
  globalThis.document = { createElement: () => canvas }
  try {
    const video = { videoWidth: 1440, videoHeight: 1920 }
    const preview = { width: 366, height: 488 }
    const crop = cropRectFor(1440, 1920, preview)
    assert.equal(grabFrame(video, preview), canvas)
    assert.deepEqual(drawArgs.slice(1, 5), [crop.x, crop.y, crop.width, crop.height])
    assert.equal(Math.max(canvas.width, canvas.height), 720)
  } finally { globalThis.document = previous }
})

test('desktop retains its existing 16:10 crop geometry', () => {
  const crop = cropRectFor(1280, 800)
  close(crop.width, (250 / 936) / (2 * ELLIPSE_RX) * 1280)
  close(crop.height, (326 / 585) / (2 * ELLIPSE_RY) * 800)
  close(crop.x + crop.width * ELLIPSE_CX, 640)
  close(crop.y + crop.height * ELLIPSE_CY, 400)
})
