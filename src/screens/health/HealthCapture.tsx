/**
 * H2 Scanning the result sheet.
 *
 * The skin camera's shape — viewfinder card, blocked state, upload as the way
 * round a refused camera — with a document's needs instead of a face's: the back
 * camera where there is one, no mirror (mirrored text is unreadable to people, and
 * the preview should show what will be read), a page-shaped guide, and a plain
 * shutter. There is no gate to pass: whether the page can be read is the reader's
 * call, and the review screen is where a bad read gets fixed.
 *
 * The frame is taken at the camera's full resolution. The skin reading downscales
 * because it measures colour; this reads letters, and every pixel helps.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon, PATHS } from '../../components/Icons'
import {
  Card,
  Display,
  GhostButton,
  Pressable,
  PrimaryButton,
  Prose,
  Shell,
  StepProgress,
} from '../../components/primitives'
import { screenPadding, useNarrow } from '../../components/layout'
import { C, FONT_DISPLAY } from '../../theme'
import { useCopy } from '../../i18n'
import { HEALTH_COPY } from '../../i18n/health'
import { useHealth } from '../../state/health'

type Phase = 'starting' | 'live' | 'blocked'

/** A photo larger than this on its long side is scaled down before reading. */
const MAX_EDGE = 3200

function canvasOf(source: HTMLVideoElement | HTMLImageElement, w: number, h: number): HTMLCanvasElement {
  const scale = Math.min(1, MAX_EDGE / Math.max(w, h))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(w * scale))
  canvas.height = Math.max(1, Math.round(h * scale))
  canvas.getContext('2d')?.drawImage(source, 0, 0, canvas.width, canvas.height)
  return canvas
}

export function HealthCapture() {
  const { startScan, startSample, startManual } = useHealth()
  const copy = useCopy(HEALTH_COPY).capture
  const narrow = useNarrow()

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  /** Bumped on every stop, so a camera that answers late is closed, not installed. */
  const sessionRef = useRef(0)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [phase, setPhase] = useState<Phase>('starting')
  const [block, setBlock] = useState<'denied' | 'unavailable'>('denied')

  const stop = useCallback(() => {
    sessionRef.current += 1
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const open = useCallback(async () => {
    const session = sessionRef.current
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setBlock('unavailable')
        setPhase('blocked')
        return
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      if (sessionRef.current !== session) {
        stream.getTracks().forEach((t) => t.stop())
        return
      }
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {
          // Muted and inline: frames arrive whether or not autoplay resolved.
        })
      }
      setPhase('live')
    } catch (error) {
      if (sessionRef.current !== session) return
      const name = error instanceof DOMException ? error.name : ''
      setBlock(name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'unavailable')
      setPhase('blocked')
    }
  }, [])

  useEffect(() => {
    void open()
    return stop
  }, [open, stop])

  const retry = () => {
    stop()
    setPhase('starting')
    void open()
  }

  const shoot = () => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const canvas = canvasOf(video, video.videoWidth, video.videoHeight)
    stop()
    startScan(canvas)
  }

  const onFile = async (file: File) => {
    const url = URL.createObjectURL(file)
    try {
      const image = new Image()
      image.src = url
      await image.decode()
      stop()
      startScan(canvasOf(image, image.naturalWidth, image.naturalHeight))
    } catch (error) {
      console.warn('[health] that image could not be read', error)
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div style={{ flex: 1, padding: screenPadding(narrow, 48, 80) }}>
      <Shell width={980}>
        <StepProgress step={2} width={720} />

        {/* The skin camera's skip, in the same place. There is nothing to judge without
            numbers, so skipping goes on with the sample sheet's. */}
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
            <Prose style={{ marginTop: 12, maxWidth: 620, lineHeight: 1.7 }}>{copy.subtitle}</Prose>
          </div>
          <Pressable
            onClick={() => {
              stop()
              startSample()
            }}
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
            {copy.skip}
          </Pressable>
        </div>

        <Card
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
              aspectRatio: narrow ? '3/4' : '16/10',
              borderRadius: 16,
              overflow: 'hidden',
              background:
                phase === 'blocked' ? C.surfaceMuted : 'linear-gradient(200deg,#13294D 0%,#0E2142 45%,#0B1E3D 100%)',
              border: phase === 'blocked' ? `1px dashed ${C.borderStrong}` : undefined,
            }}
          >
            {phase === 'blocked' ? (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: narrow ? '24px 16px' : 40,
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
                <Prose size={15} style={{ marginTop: 18, maxWidth: 440 }}>
                  {copy[block]}
                </Prose>
                <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                  <GhostButton onClick={retry} height={46} fontSize={14.5}>
                    {copy.retry}
                  </GhostButton>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  autoPlay
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {/* The page guide: A4's proportions, centred. A frame to aim at, not a crop. */}
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    top: '6%',
                    bottom: '14%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    aspectRatio: '1/1.414',
                    maxWidth: '86%',
                    borderRadius: 10,
                    border: '2px solid rgba(255,255,255,.85)',
                    boxShadow: '0 0 0 2000px rgba(11,30,61,.32)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 14,
                    display: 'flex',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    style={{
                      padding: '7px 13px',
                      borderRadius: 9,
                      background: 'rgba(11,30,61,.72)',
                      color: '#fff',
                      fontSize: 13,
                    }}
                  >
                    {phase === 'starting' ? copy.starting : copy.guide}
                  </div>
                </div>
              </>
            )}
          </div>

          <div
            style={{
              marginTop: 18,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, width: narrow ? '100%' : undefined }}>
              <PrimaryButton onClick={shoot} disabled={phase !== 'live'} height={50} full={narrow}>
                <Icon path={PATHS.camera} size={19} />
                <span>{copy.shoot}</span>
              </PrimaryButton>
              <GhostButton onClick={() => fileRef.current?.click()} height={50} full={narrow}>
                <Icon path={PATHS.download} size={18} />
                <span>{copy.upload}</span>
              </GhostButton>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.muted, fontSize: 13 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.blueLight }} />
              {copy.privacy}
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (file) void onFile(file)
            }}
          />
        </Card>

        <div
          style={{
            marginTop: 22,
            display: 'grid',
            gridTemplateColumns: narrow ? '1fr' : 'repeat(3,1fr)',
            gap: narrow ? 8 : 14,
          }}
        >
          {copy.tips.map((tip, i) => (
            <div
              key={tip}
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'baseline',
                padding: '14px 16px',
                borderRadius: 12,
                background: C.surface,
                border: `1px solid ${C.border}`,
              }}
            >
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 600, color: C.blue }}>
                {i + 1}
              </span>
              <span style={{ fontSize: 13.5, lineHeight: 1.55, color: C.body }}>{tip}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 22, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {[
            { label: copy.sample, next: startSample },
            { label: copy.manual, next: startManual },
          ].map(({ label, next }) => (
            <Pressable
              key={label}
              onClick={() => {
                stop()
                next()
              }}
              className="btn-ghost"
              style={{
                padding: '10px 16px',
                borderRadius: 9,
                border: `1px solid ${C.border}`,
                background: C.surface,
                fontSize: 13.5,
                color: C.bodyMuted,
              }}
            >
              {label}
            </Pressable>
          ))}
        </div>
      </Shell>
    </div>
  )
}
