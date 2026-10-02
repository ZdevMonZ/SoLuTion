/**
 * 04 Webcam capture.
 *
 * The one screen where the port is not a transcription: the design draws a
 * placeholder viewfinder, and this runs the real one — camera, face detector,
 * blink check and the capture gate, which are the four modules already ported
 * beside it.
 *
 * ## How a frame is taken
 *
 * The shutter fires on a blink, as it did on Android, and the frame is grabbed on
 * the very frame the blink completes rather than after a confirmation beat. The
 * Android build lost captures to exactly that beat — the photo was taken, then
 * discarded 360 ms later by the timer that was meant to announce it — so there is
 * no timer between the decision and the grab.
 *
 * ## What the gates are for
 *
 * `blinkRules` answers "is anyone actually there", which a still photograph cannot
 * pass. `inspect` then answers "can this frame be read at all", and a frame it
 * turns down is discarded rather than scored. Neither can be waited on forever:
 * after `FALLBACK_MS` the button arms itself regardless, because a detector that
 * cannot read someone must not lock them out of their own reading.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon, PATHS } from '../components/Icons'
import {
  Card,
  Display,
  GhostButton,
  Note,
  Pressable,
  PrimaryButton,
  Prose,
  Shell,
  StepProgress,
} from '../components/primitives'
import { C, FONT_DISPLAY, FONT_MONO } from '../theme'
import { CAPTURE } from '../data/strings'
import {
  GUIDE_OVAL_H_FRAC,
  GUIDE_OVAL_W_FRAC,
  canvasFromImage,
  grabFrame,
  regionMapper,
} from '../analysis/capture'
import { inspect, loadVideoDetector, readVideoFrame } from '../analysis/faceDetector'
import { faceLost, next } from '../analysis/blinkRules'
import type { LivenessState } from '../analysis/blinkRules'
import type { CaptureRejection } from '../analysis/types'
import { useStore } from '../state/store'

/** How often a preview frame is handed to the detector. */
const FRAME_MS = 120
/** When to admit the blink check is not getting anywhere. */
const TROUBLE_MS = 8_000
/** When to arm the shutter regardless. */
const FALLBACK_MS = 12_000
/** After this many rejections, the screen starts pointing at the way out. */
const HINT_AFTER_REJECTIONS = 2

type Phase = 'starting' | 'live' | 'blocked'
type Block = 'denied' | 'unavailable'

export function Capture() {
  const { go, runAnalysis } = useStore()

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const livenessRef = useRef<LivenessState>('NO_FACE')
  /** Held so the detector loop and the key handler cannot both fire the shutter. */
  const busyRef = useRef(false)
  /**
   * Bumped every time the camera is stopped or reopened.
   *
   * `getUserMedia` resolves long after it is called, and React's development
   * double-mount stops the first stream before the second has arrived. Without
   * this, the late arrival would install a stream nothing holds a reference to —
   * the camera light stays on for the rest of the session.
   */
  const sessionRef = useRef(0)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const [phase, setPhase] = useState<Phase>('starting')
  const [block, setBlock] = useState<Block>('denied')
  const [liveness, setLiveness] = useState<LivenessState>('NO_FACE')
  const [trouble, setTrouble] = useState(false)
  const [armed, setArmed] = useState(false)
  const [rejection, setRejection] = useState<CaptureRejection | null>(null)
  const [rejections, setRejections] = useState(0)

  const stop = useCallback(() => {
    sessionRef.current += 1
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  /** Opens the camera. The phase is already 'starting' whenever this is called. */
  const open = useCallback(async () => {
    const session = sessionRef.current
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setBlock('unavailable')
        setPhase('blocked')
        return
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 800 } },
        audio: false,
      })
      // Stopped or reopened while the browser was asking: this stream belongs to
      // nobody, so it is closed rather than installed.
      if (sessionRef.current !== session) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {
          // Autoplay refusal is not fatal: the element is muted and inline, and the
          // frames keep arriving whether or not the promise resolved.
        })
      }
      setPhase('live')
      // Warming the detector here rather than on the first frame keeps the first
      // few seconds of the viewfinder from silently doing nothing.
      void loadVideoDetector().catch((error) => {
        console.warn('[capture] the face detector did not start', error)
      })
    } catch (error) {
      if (sessionRef.current !== session) return
      const name = error instanceof DOMException ? error.name : ''
      setBlock(name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'unavailable')
      setPhase('blocked')
    }
  }, [])

  /** Back to the top: used by Retake, by "Try again", and by the R key. */
  const restart = useCallback(() => {
    stop()
    setPhase('starting')
    livenessRef.current = 'NO_FACE'
    setLiveness('NO_FACE')
    setRejection(null)
    setTrouble(false)
    void open()
  }, [open, stop])

  useEffect(() => {
    void open()
    return stop
  }, [open, stop])

  /** Everything a frame goes through once it has been grabbed. */
  const submit = useCallback(
    async (canvas: HTMLCanvasElement) => {
      const reason = await inspect(canvas)
      if (reason) {
        setRejection(reason)
        setRejections((n) => n + 1)
        livenessRef.current = 'NO_FACE'
        setLiveness('NO_FACE')
        busyRef.current = false
        return
      }
      stop()
      go('analyzing')
      void runAnalysis(canvas)
    },
    [go, runAnalysis, stop],
  )

  const shoot = useCallback(() => {
    const video = videoRef.current
    if (!video || busyRef.current || video.videoWidth === 0) return
    busyRef.current = true
    try {
      void submit(grabFrame(video))
    } catch (error) {
      console.warn('[capture] the frame could not be grabbed', error)
      busyRef.current = false
    }
  }, [submit])

  // The detector loop. Runs only while the viewfinder is live and no capture is
  // being processed, and never overlaps itself.
  useEffect(() => {
    if (phase !== 'live' || rejection) return
    let cancelled = false
    let inFlight = false

    const timer = setInterval(() => {
      const video = videoRef.current
      if (!video || inFlight || busyRef.current || video.videoWidth === 0) return
      inFlight = true
      void readVideoFrame(
        video,
        performance.now(),
        regionMapper(video.videoWidth, video.videoHeight),
      )
        .then((reading) => {
          if (cancelled) return
          const before = livenessRef.current
          const after = reading.face
            ? next(before, reading.leftEyeOpen, reading.rightEyeOpen)
            : faceLost()
          if (after !== before) {
            livenessRef.current = after
            setLiveness(after)
          }
          // The grab happens on this frame, not after an announcement.
          if (after === 'BLINKED' && before !== 'BLINKED') shoot()
        })
        .finally(() => {
          inFlight = false
        })
    }, FRAME_MS)

    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [phase, rejection, shoot])

  // The two clocks: one admits the blink check is struggling, the other hands the
  // shutter over anyway.
  useEffect(() => {
    if (phase !== 'live') return
    const troubleTimer = setTimeout(() => setTrouble(true), TROUBLE_MS)
    const armTimer = setTimeout(() => setArmed(true), FALLBACK_MS)
    return () => {
      clearTimeout(troubleTimer)
      clearTimeout(armTimer)
    }
  }, [phase])

  const canShoot = phase === 'live' && !rejection && (armed || liveness === 'BLINKED')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === ' ' && canShoot) {
        e.preventDefault()
        shoot()
      }
      if (e.key.toLowerCase() === 'r') restart()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [canShoot, restart, shoot])

  const onFile = async (file: File) => {
    const url = URL.createObjectURL(file)
    try {
      const image = new Image()
      image.src = url
      await image.decode()
      busyRef.current = true
      await submit(canvasFromImage(image))
    } catch (error) {
      console.warn('[capture] that image could not be read', error)
      busyRef.current = false
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  const skip = () => {
    stop()
    go('analyzing')
    void runAnalysis(null)
  }

  const prompt =
    liveness === 'BLINKED'
      ? CAPTURE.livenessConfirmed
      : liveness === 'NO_FACE'
        ? CAPTURE.waitingForFace
        : trouble
          ? CAPTURE.livenessTrouble
          : CAPTURE.livenessPrompt

  return (
    <div style={{ flex: 1, padding: '48px 32px 80px' }}>
      <Shell width={980}>
        <StepProgress step={2} width={720} />

        <div
          style={{
            marginTop: 32,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 20,
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <Display size={34}>Line your face up inside the outline.</Display>
            <Prose style={{ marginTop: 12, maxWidth: 560, lineHeight: 1.7 }}>
              {CAPTURE.lightingTip}
            </Prose>
          </div>
          <Pressable
            onClick={skip}
            className="btn-ghost"
            style={{
              padding: '10px 16px',
              borderRadius: 9,
              border: `1px solid ${C.border}`,
              background: C.surface,
              fontSize: 13,
              color: C.bodyMuted,
              whiteSpace: 'nowrap',
            }}
          >
            {CAPTURE.skip}
          </Pressable>
        </div>

        {phase === 'blocked' ? (
          <Card
            style={{
              marginTop: 30,
              padding: 22,
              borderRadius: 22,
              boxShadow: '0 20px 50px rgba(20,32,58,.07)',
            }}
          >
            <div
              style={{
                position: 'relative',
                aspectRatio: '16/10',
                borderRadius: 16,
                background: C.surfaceMuted,
                border: `1px dashed ${C.borderStrong}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: 40,
              }}
            >
              <div
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: 18,
                  background: C.chip,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: C.blue,
                }}
              >
                <Icon path={PATHS.cameraOff} size={28} />
              </div>
              <div
                style={{
                  marginTop: 22,
                  fontFamily: FONT_DISPLAY,
                  fontSize: 23,
                  fontWeight: 600,
                  color: C.ink,
                }}
              >
                {block === 'denied' ? 'Camera access is blocked' : 'No camera is available'}
              </div>
              <Prose size={14.5} style={{ marginTop: 12, maxWidth: 460 }}>
                {block === 'denied'
                  ? 'Your browser is holding the camera back. Click the camera icon in the address bar, choose Allow, then try again.'
                  : 'This browser could not open a camera. You can upload a photo instead, or carry on without a capture and look around with a sample reading.'}
              </Prose>
              <div
                style={{
                  marginTop: 24,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 12,
                  justifyContent: 'center',
                }}
              >
                <PrimaryButton onClick={restart} height={48} padding={24} fontSize={15}>
                  Try again
                </PrimaryButton>
                <GhostButton onClick={() => fileRef.current?.click()} height={48} fontSize={15}>
                  Upload a photo instead
                </GhostButton>
              </div>
            </div>
            <div
              style={{
                marginTop: 18,
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                padding: '16px 18px',
                borderRadius: 14,
                background: C.surfaceMuted,
                border: `1px solid ${C.rule}`,
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: C.blueLight,
                  marginTop: 7,
                  flex: 'none',
                }}
              />
              <div style={{ fontSize: 13, lineHeight: 1.7, color: C.body }}>
                Nothing is uploaded without your click. The frame is read in the browser and
                discarded once the reading finishes.
              </div>
            </div>
          </Card>
        ) : (
          <Card
            style={{
              marginTop: 30,
              padding: 22,
              borderRadius: 22,
              boxShadow: '0 20px 50px rgba(20,32,58,.07)',
            }}
          >
            <div
              style={{
                position: 'relative',
                aspectRatio: '16/10',
                borderRadius: 16,
                overflow: 'hidden',
                background: 'linear-gradient(200deg,#13294D 0%,#0E2142 45%,#0B1E3D 100%)',
              }}
            >
              <video
                ref={videoRef}
                muted
                playsInline
                autoPlay
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  // A mirror is what people expect of themselves. The analysis reads
                  // the true frame; only the preview is flipped.
                  transform: 'scaleX(-1)',
                }}
              />
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: `${GUIDE_OVAL_W_FRAC * 100}%`,
                    height: `${GUIDE_OVAL_H_FRAC * 100}%`,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50% 50% 48% 48%/58% 58% 42% 42%',
                      border: `2px dashed ${liveness === 'NO_FACE' ? 'rgba(143,184,232,.9)' : 'rgba(186,220,255,.95)'}`,
                      boxShadow: '0 0 70px rgba(46,90,172,.3) inset',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: 0,
                      bottom: 0,
                      width: 1,
                      background:
                        'linear-gradient(rgba(143,184,232,0), rgba(143,184,232,.45), rgba(143,184,232,0))',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: '14%',
                      right: '14%',
                      top: '44%',
                      height: 1,
                      background: 'rgba(143,184,232,.3)',
                    }}
                  />
                </div>
              </div>
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: 36,
                  background:
                    'linear-gradient(rgba(143,184,232,0), rgba(143,184,232,.14), rgba(143,184,232,0))',
                  animation: 'scanline 5s ease-in-out infinite',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 18,
                  top: 18,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  padding: '8px 13px',
                  borderRadius: 20,
                  background: 'rgba(11,30,61,.62)',
                  border: '1px solid rgba(143,184,232,.3)',
                }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: phase === 'live' ? C.blueLight : C.muted,
                  }}
                />
                <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(233,240,250,.9)' }}>
                  {phase === 'live' ? 'Webcam live' : 'Starting the camera…'}
                </div>
              </div>
              <div
                style={{
                  position: 'absolute',
                  right: 18,
                  top: 18,
                  padding: '7px 11px',
                  borderRadius: 8,
                  background: 'rgba(11,30,61,.55)',
                  fontSize: 10,
                  letterSpacing: '.1em',
                  color: 'rgba(143,184,232,.9)',
                  fontFamily: FONT_MONO,
                }}
              >
                IN BROWSER ONLY
              </div>

              {/* The prompt sits over the frame, where the eyes already are. */}
              <div
                role="status"
                aria-live="polite"
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 18,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    padding: '10px 18px',
                    borderRadius: 20,
                    background: 'rgba(11,30,61,.66)',
                    border: '1px solid rgba(143,184,232,.3)',
                    fontSize: 13.5,
                    fontWeight: 500,
                    color: 'rgba(233,240,250,.95)',
                    textAlign: 'center',
                    maxWidth: '80%',
                  }}
                >
                  {prompt}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 20,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 18,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, maxWidth: 520 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    flex: 'none',
                    borderRadius: 10,
                    background: C.chip,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: C.blue,
                  }}
                >
                  <Icon path={PATHS.light} size={19} />
                </div>
                <div style={{ fontSize: 13.5, lineHeight: 1.65, color: C.body }}>
                  <span style={{ fontWeight: 600, color: C.ink }}>Face the light. </span>
                  Avoid a window directly behind you — backlight flattens the reading.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <GhostButton onClick={restart} height={50} fontSize={15}>
                  <span style={{ display: 'flex' }}>
                    <Icon path={PATHS.retake} size={18} weight={1.6} />
                  </span>
                  <span>Retake</span>
                </GhostButton>
                <PrimaryButton
                  onClick={shoot}
                  disabled={!canShoot}
                  height={50}
                  padding={28}
                  fontSize={15.5}
                >
                  <span style={{ display: 'flex' }}>
                    <Icon path={PATHS.camera} size={19} weight={1.6} />
                  </span>
                  <span>Capture</span>
                </PrimaryButton>
              </div>
            </div>
            <Note style={{ marginTop: 14, fontSize: 12.5 }}>
              {canShoot
                ? 'Shortcut: press Space to capture, R to restart the camera.'
                : 'The shutter opens on a blink. Press R to restart the camera.'}
            </Note>
          </Card>
        )}

        {/* The upload path, shared by the blocked panel and nothing else. */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            // Cleared so picking the same file twice still fires a change.
            e.target.value = ''
            if (file) void onFile(file)
          }}
        />
      </Shell>

      {rejection ? (
        <div
          role="alertdialog"
          aria-modal
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'rgba(11,30,61,.44)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32,
          }}
        >
          <Card
            style={{
              width: '100%',
              maxWidth: 520,
              borderRadius: 22,
              padding: 32,
              boxShadow: '0 40px 80px rgba(11,30,61,.28)',
              animation: 'riseIn .18s ease-out',
            }}
          >
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 600, color: C.ink }}>
              {CAPTURE.gateTitle}
            </div>
            <Prose size={14.5} style={{ marginTop: 12 }}>
              {CAPTURE.rejectionBody(rejection)}
            </Prose>
            {rejections >= HINT_AFTER_REJECTIONS ? (
              <Note style={{ marginTop: 12 }}>{CAPTURE.gateSkipHint}</Note>
            ) : null}
            <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              {rejections >= HINT_AFTER_REJECTIONS ? (
                <GhostButton onClick={skip} height={48}>
                  {CAPTURE.skip}
                </GhostButton>
              ) : null}
              <PrimaryButton
                onClick={() => {
                  setRejection(null)
                  setTrouble(false)
                }}
                height={48}
                padding={26}
                fontSize={15}
              >
                {CAPTURE.gateCta}
              </PrimaryButton>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
