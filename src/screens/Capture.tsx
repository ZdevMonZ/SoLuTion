import { TREATMENT_FLOW } from '../i18n/treatmentFlow'
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
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
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
  useTracking,
} from '../components/primitives'
import { screenPadding, useCaptureLayout } from '../components/layout'
import './Capture.css'
import { C, FONT_DISPLAY, FONT_MONO_TEXT } from '../theme'
import { useStrings } from '../data/strings'
import { useCopy } from '../i18n'
import { CAPTURE_SCREEN } from '../i18n/capture'
import {
  GUIDE_OVAL_H_FRAC,
  GUIDE_OVAL_W_FRAC,
  canvasFromImage,
  grabFrame,
  regionMapper,
  mobileFraming,
} from '../analysis/capture'
import { inspect, loadVideoDetector, readVideoFrame } from '../analysis/faceDetector'
import { faceLost, next } from '../analysis/blinkRules'
import type { LivenessState } from '../analysis/blinkRules'
import type { CaptureRejection } from '../analysis/types'
import { useStore } from '../state/store'
import { startCameraPreview, type CameraBlock } from '../analysis/cameraPreview'

/** How often a preview frame is handed to the detector. */
const FRAME_MS = 120
/** When to admit the blink check is not getting anywhere. */
const TROUBLE_MS = 8_000
/** When to arm the shutter regardless. */
const FALLBACK_MS = 12_000
/** After this many rejections, the screen starts pointing at the way out. */
const HINT_AFTER_REJECTIONS = 2

type Phase = 'starting' | 'live' | 'paused' | 'blocked'

export function Capture() {
  const { go, runAnalysis, profile } = useStore()
  const narrow = useCaptureLayout()
  const tracking = useTracking()
  const { CAPTURE, ageBandLabel, genderLabel } = useStrings()
  const copy = useCopy(CAPTURE_SCREEN)
  const flow = useCopy(TREATMENT_FLOW)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const previewRef = useRef<HTMLDivElement | null>(null)
  const [frame, setFrame] = useState({ width: 360, height: 480, videoW: 720, videoH: 960 })
  const cameraRef = useRef<ReturnType<typeof startCameraPreview> | null>(null)
  const livenessRef = useRef<LivenessState>('NO_FACE')
  /** Held so the detector loop and the key handler cannot both fire the shutter. */
  const busyRef = useRef(false)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const [attempt, setAttempt] = useState(0)
  const [phase, setPhase] = useState<Phase>('starting')
  const [block, setBlock] = useState<CameraBlock>('denied')
  const [liveness, setLiveness] = useState<LivenessState>('NO_FACE')
  const [trouble, setTrouble] = useState(false)
  const [armed, setArmed] = useState(false)
  const [rejection, setRejection] = useState<CaptureRejection | null>(null)
  const [rejections, setRejections] = useState(0)

  // The guide, face detector and saved crop all use the rendered video geometry.
  // ResizeObserver covers Safari's changing toolbar height as well as rotation.
  const blocked = phase === 'blocked'
  useLayoutEffect(() => {
    const preview = previewRef.current
    const video = videoRef.current
    if (!preview || !video || !narrow) return
    const update = () => {
      const { width, height } = preview.getBoundingClientRect()
      if (width > 0 && height > 0) setFrame({ width, height, videoW: video.videoWidth || 720, videoH: video.videoHeight || 960 })
    }
    const observer = new ResizeObserver(update)
    observer.observe(preview)
    video.addEventListener('resize', update)
    update()
    return () => { observer.disconnect(); video.removeEventListener('resize', update) }
  }, [narrow, blocked])

  const previewSize = useCallback(() => {
    if (!narrow || !previewRef.current) return undefined
    const { width, height } = previewRef.current.getBoundingClientRect()
    return width > 0 && height > 0 ? { width, height } : undefined
  }, [narrow])
  const mobileGuide = mobileFraming(frame.videoW, frame.videoH, frame).guide

  const stop = useCallback(() => {
    cameraRef.current?.stop()
    cameraRef.current = null
  }, [])

  /** Commit the viewfinder first; the effect then opens its mounted video element. */
  const restart = useCallback(() => {
    stop()
    setPhase('starting')
    livenessRef.current = 'NO_FACE'
    busyRef.current = false
    setLiveness('NO_FACE')
    setRejection(null)
    setTrouble(false)
    setArmed(false)
    setAttempt((value) => value + 1)
  }, [stop])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !navigator.mediaDevices?.getUserMedia) {
      setBlock('unavailable')
      setPhase('blocked')
      return
    }
    const camera = startCameraPreview(video, {
      getUserMedia: (constraints) => navigator.mediaDevices.getUserMedia(constraints),
      onLive: () => {
        setPhase('live')
        void loadVideoDetector().catch((error) => {
          console.warn('[capture] the face detector did not start', error)
        })
      },
      onPlaybackBlocked: () => setPhase('paused'),
      onError: (reason) => {
        setBlock(reason)
        setPhase('blocked')
      },
    })
    cameraRef.current = camera
    return () => {
      camera.stop()
      if (cameraRef.current === camera) cameraRef.current = null
    }
  }, [attempt])

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
      void submit(grabFrame(video, previewSize()))
    } catch (error) {
      console.warn('[capture] the frame could not be grabbed', error)
      busyRef.current = false
    }
  }, [submit, previewSize])

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
        regionMapper(video.videoWidth, video.videoHeight, previewSize()),
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
  }, [phase, rejection, shoot, previewSize])

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
    <div className={narrow ? 'capture-mobile' : undefined} style={{ flex: 1, padding: narrow ? undefined : screenPadding(false, 48, 80) }}>
      <Shell width={980} style={narrow ? { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 } : undefined}>
        {narrow ? (
          <header className="capture-header">
            <div className="capture-header-actions">
              <Pressable onClick={() => go('landing')} label={copy.backHome} className="capture-back">
                <span style={{ display: 'flex', transform: 'rotate(180deg)' }}><Icon path={PATHS.arrow} size={20} /></span>
              </Pressable>
              <span className="capture-step">01 / 02</span>
              <Pressable onClick={() => go('form')} className="capture-profile">{flow.profile}</Pressable>
              <Pressable onClick={skip} className="capture-skip">{CAPTURE.skip}</Pressable>
            </div>
            <h1>{copy.mobileTitle}</h1>
            <p>{copy.mobileTip}</p>
          </header>
        ) : <>
        <StepProgress step={1} of={2} width={720} />
        <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 13, color: C.bodyMuted }}>
          <span>{profile.ageBand ? ageBandLabel(profile.ageBand) : '—'} · {profile.gender ? genderLabel(profile.gender) : '—'}</span>
          <Pressable onClick={() => go('form')} style={{ color: C.blue }}>{flow.profile}</Pressable>
        </div>

        <div
          style={{
            marginTop: narrow ? 22 : 32,
            display: 'flex',
            flexWrap: 'wrap',
            gap: narrow ? 14 : 20,
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <Display size={34}>{copy.title}</Display>
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
        </>}
        {phase === 'blocked' ? (
          <Card
            className={narrow ? 'capture-blocked' : undefined}
            style={{
              marginTop: narrow ? 22 : 30,
              padding: narrow ? 12 : 22,
              borderRadius: narrow ? 18 : 22,
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
                padding: narrow ? '28px 16px' : 40,
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
                className="headline"
                style={{
                  marginTop: 22,
                  fontFamily: FONT_DISPLAY,
                  fontSize: 23,
                  fontWeight: 600,
                  color: C.ink,
                }}
              >
                {copy.blocked[block].title}
              </div>
              <Prose size={14.5} style={{ marginTop: 12, maxWidth: 460 }}>
                {copy.blocked[block].body}
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
                  {copy.tryAgain}
                </PrimaryButton>
                <GhostButton onClick={() => fileRef.current?.click()} height={48} fontSize={15}>
                  {copy.upload}
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
              <div style={{ fontSize: 13, lineHeight: 1.7, color: C.body }}>{copy.privacy}</div>
            </div>
          </Card>
        ) : (
          <Card
            className={narrow ? 'capture-panel' : undefined}
            style={{
              marginTop: narrow ? 0 : 30,
              padding: narrow ? 0 : 22,
              borderRadius: narrow ? 18 : 22,
              boxShadow: '0 20px 50px rgba(20,32,58,.07)',
            }}
          >
            <div
              ref={previewRef}
              className={narrow ? 'capture-viewfinder' : undefined}
              style={{
                position: 'relative',
                aspectRatio: narrow ? undefined : '16/10',
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
                  objectFit: narrow ? 'contain' : 'cover',
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
                    position: narrow ? 'absolute' : 'relative',
                    width: narrow ? mobileGuide.width : `${GUIDE_OVAL_W_FRAC * 100}%`,
                    height: narrow ? mobileGuide.height : `${GUIDE_OVAL_H_FRAC * 100}%`,
                    left: narrow ? mobileGuide.left : undefined,
                    top: narrow ? mobileGuide.top : undefined,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50% 50% 48% 48%/58% 58% 42% 42%',
                      border: `${narrow ? 3 : 2}px dashed ${liveness === 'NO_FACE' ? 'rgba(143,184,232,.9)' : 'rgba(186,220,255,.95)'}`,
                      boxShadow: narrow ? '0 0 0 100vmax rgba(4,15,32,.22)' : '0 0 70px rgba(46,90,172,.3) inset',
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
                  left: narrow ? 10 : 18,
                  top: narrow ? 10 : 18,
                  display: 'flex',
                  alignItems: 'center',
                  gap: narrow ? 7 : 9,
                  maxWidth: narrow ? '49%' : undefined,
                  padding: narrow ? '6px 10px' : '8px 13px',
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
                  {phase === 'live' ? copy.live : phase === 'paused' ? copy.playPreview : copy.starting}
                </div>
              </div>
              <div
                className={narrow ? 'capture-local' : undefined}
                style={{
                  position: 'absolute',
                  right: narrow ? 10 : 18,
                  top: narrow ? 10 : 18,
                  padding: narrow ? '6px 9px' : '7px 11px',
                  borderRadius: 8,
                  background: 'rgba(11,30,61,.55)',
                  fontSize: 10,
                  letterSpacing: tracking('.1em'),
                  color: 'rgba(143,184,232,.9)',
                  fontFamily: FONT_MONO_TEXT,
                }}
              >
                {copy.localOnly}
              </div>

              {phase === 'paused' && (
                <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(11,30,61,.55)', zIndex: 1 }}>
                  <PrimaryButton onClick={() => { void cameraRef.current?.play() }}>
                    {copy.playPreview}
                  </PrimaryButton>
                </div>
              )}

              {/* The prompt sits over the frame, where the eyes already are. */}
              {!narrow && <div
                role="status"
                aria-live="polite"
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: narrow ? 10 : 18,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    padding: narrow ? '7px 12px' : '10px 18px',
                    borderRadius: 20,
                    background: 'rgba(11,30,61,.66)',
                    border: '1px solid rgba(143,184,232,.3)',
                    fontSize: narrow ? 12.5 : 13.5,
                    fontWeight: 500,
                    color: 'rgba(233,240,250,.95)',
                    textAlign: 'center',
                    maxWidth: '80%',
                  }}
                >
                  {prompt}
                </div>
              </div>}
            </div>

            {narrow && <div className="capture-status" role="status" aria-live="polite">
              {canShoot ? copy.mobileReady : trouble ? copy.mobileManual : liveness === 'NO_FACE' ? copy.mobileAlign : copy.blinkHint}
            </div>}

            <div
              className={narrow ? 'capture-controls' : undefined}
              style={{
                marginTop: narrow ? 0 : 20,
                display: 'flex',
                flexWrap: 'wrap',
                gap: narrow ? 14 : 18,
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: narrow ? '0 4px 4px' : undefined,
              }}
            >
              {!narrow && <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, maxWidth: 520 }}>
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
                  <span style={{ fontWeight: 600, color: C.ink }}>{copy.lightLead}</span>
                  {copy.lightBody}
                </div>
              </div>}
              {/* On a phone the two buttons share the full width, the shutter the larger half. */}
              <div
                style={{
                  display: narrow ? 'grid' : 'flex',
                  gridTemplateColumns: '1fr 1.5fr',
                  width: narrow ? '100%' : undefined,
                  gap: narrow ? 10 : 12,
                  alignItems: 'center',
                }}
              >
                <GhostButton
                  onClick={restart}
                  height={narrow ? 60 : 50}
                  fontSize={15}
                  padding={narrow ? 12 : 22}
                  full={narrow}
                >
                  <span style={{ display: 'flex' }}>
                    <Icon path={PATHS.retake} size={18} weight={1.6} />
                  </span>
                  <span>{copy.retake}</span>
                </GhostButton>
                <PrimaryButton
                  onClick={shoot}
                  disabled={!canShoot}
                  height={narrow ? 60 : 50}
                  padding={narrow ? 12 : 28}
                  fontSize={15.5}
                  full={narrow}
                >
                  <span style={{ display: 'flex' }}>
                    <Icon path={PATHS.camera} size={19} weight={1.6} />
                  </span>
                  <span>{copy.shoot}</span>
                </PrimaryButton>
              </div>
            </div>
            {/* A phone has no Space or R key to press. */}
            {!narrow && (
              <Note style={{ marginTop: 14, fontSize: 12.5 }}>
                {canShoot ? copy.keysArmed : copy.keysWaiting}
              </Note>
            )}
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
            padding: narrow ? 16 : 32,
          }}
        >
          <Card
            style={{
              width: '100%',
              maxWidth: 520,
              maxHeight: narrow ? 'calc(100dvh - 32px)' : undefined,
              overflowY: narrow ? 'auto' : undefined,
              borderRadius: 22,
              padding: narrow ? 22 : 32,
              boxShadow: '0 40px 80px rgba(11,30,61,.28)',
              animation: 'riseIn .18s ease-out',
            }}
          >
            <div
              className="headline"
              style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 600, color: C.ink }}
            >
              {CAPTURE.gateTitle}
            </div>
            <Prose size={14.5} style={{ marginTop: 12 }}>
              {CAPTURE.rejectionBody(rejection)}
            </Prose>
            {rejections >= HINT_AFTER_REJECTIONS ? (
              <Note style={{ marginTop: 12 }}>{CAPTURE.gateSkipHint}</Note>
            ) : null}
            <div
              style={{
                marginTop: 24,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 12,
                justifyContent: 'flex-end',
              }}
            >
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
