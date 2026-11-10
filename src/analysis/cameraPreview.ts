export type CameraBlock = 'denied' | 'unavailable'

type Options = {
  getUserMedia: (constraints: MediaStreamConstraints) => Promise<MediaStream>
  onLive: () => void
  onPlaybackBlocked: () => void
  onError: (reason: CameraBlock) => void
}

function errorName(error: unknown): string {
  return error && typeof error === 'object' && 'name' in error ? String(error.name) : ''
}

/** Each mounted preview owns its stream, including any late permission result. */
export function startCameraPreview(video: HTMLVideoElement, options: Options) {
  let stopped = false
  let stream: MediaStream | null = null

  function stop() {
    stopped = true
    if (!stream) return
    stream.getTracks().forEach((track) => {
      track.removeEventListener('ended', ended)
      track.stop()
    })
    if (video.srcObject === stream) {
      video.pause()
      video.srcObject = null
    }
    stream = null
  }

  function fail(reason: CameraBlock) {
    if (stopped) return
    stop()
    options.onError(reason)
  }

  function ended() {
    fail('unavailable')
  }

  // Also callable directly from a tap, preserving the browser's user activation.
  async function play() {
    if (stopped || !stream) return
    try {
      await video.play()
      if (!stopped) options.onLive()
    } catch (error) {
      if (stopped) return
      if (errorName(error) === 'NotAllowedError') options.onPlaybackBlocked()
      else fail('unavailable')
    }
  }

  async function open() {
    try {
      let acquired: MediaStream
      try {
        acquired = await options.getUserMedia({
          video: { facingMode: { ideal: 'user' }, width: { ideal: 1280 }, height: { ideal: 800 } },
          audio: false,
        })
      } catch (error) {
        if (stopped) return
        if (errorName(error) !== 'OverconstrainedError') throw error
        acquired = await options.getUserMedia({ video: true, audio: false })
      }
      if (stopped) {
        acquired.getTracks().forEach((track) => track.stop())
        return
      }
      stream = acquired
      const tracks = stream.getVideoTracks()
      if (!tracks.length || tracks.every((track) => track.readyState === 'ended')) {
        fail('unavailable')
        return
      }
      tracks.forEach((track) => track.addEventListener('ended', ended))
      // Set DOM properties before attaching the stream, including Safari's inline preview.
      video.muted = true
      video.defaultMuted = true
      video.playsInline = true
      video.srcObject = stream
      await play()
    } catch (error) {
      const name = errorName(error)
      fail(name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'unavailable')
    }
  }

  void open()
  return { stop, play }
}
