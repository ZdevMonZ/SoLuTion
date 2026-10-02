/**
 * 05 Analyzing.
 *
 * The measurement itself takes a few milliseconds; this screen exists because a
 * reading that appears instantly reads as a guess. The store holds the frame for
 * `SIMULATED_ANALYSIS_MILLIS` on purpose, and the sweep here is paced to that.
 *
 * Navigation to the result is gated on the reading being a *different object* from
 * the one the store held when this screen opened. The store keeps the previous
 * reading until a new one replaces it, so a retake would otherwise bounce straight
 * back to the old numbers.
 *
 * Identity rather than the reading's own timestamp, which looks like the obvious
 * test and is wrong: the skip path never awaits anything, so it stamps its reading
 * inside the click handler — before React has rendered this screen and read the
 * clock. The reading is then permanently "older" than the screen waiting for it.
 */
import { useEffect, useState } from 'react'
import { C, FONT_DISPLAY, FONT_MONO } from '../theme'
import { SIMULATED_ANALYSIS_MILLIS, useStore } from '../state/store'

const STEPS = [
  'Mapping pore density',
  'Reading pigment spread',
  'Comparing texture and firmness',
  'Checking against clinical ranges',
]

const TICK_MS = 90
/** Held back from 100 until the reading actually lands, so the bar never lies. */
const CEILING = 96
/** If the reading never arrives, the viewfinder is a better place to wait than this. */
const GIVE_UP_MS = 20_000

const STARS = [
  { left: '12%', top: '18%', size: 3, color: '#fff', duration: '4s' },
  { right: '16%', top: '26%', size: 2, color: C.blueLight, duration: '5.5s' },
  { left: '22%', bottom: '22%', size: 2, color: '#fff', duration: '6.5s' },
  { right: '24%', bottom: '30%', size: 3, color: 'rgba(143,184,232,.9)', duration: '5s' },
]

export function Analyzing() {
  const { analysis, go } = useStore()
  // Whatever the store held when this screen opened — null on a first reading, the
  // previous one on a retake.
  const [before] = useState(() => analysis)
  const [progress, setProgress] = useState(0)

  const fresh = analysis !== null && analysis !== before

  useEffect(() => {
    const step = (CEILING * TICK_MS) / SIMULATED_ANALYSIS_MILLIS
    const timer = setInterval(
      () => setProgress((p) => Math.min(CEILING, p + step)),
      TICK_MS,
    )
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!fresh) return
    const timer = setTimeout(() => go('result'), 420)
    return () => clearTimeout(timer)
  }, [fresh, go])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!fresh) go('capture')
    }, GIVE_UP_MS)
    return () => clearTimeout(timer)
  }, [fresh, go])

  // The bar only reaches the end once the reading actually has.
  const shown = fresh ? 100 : progress
  const pct = `${Math.round(shown)}%`
  const stepIndex = Math.min(STEPS.length - 1, Math.floor(shown / (100 / STEPS.length)))

  return (
    <div
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 32px',
        background: 'radial-gradient(70% 60% at 50% 46%, #17325C 0%, #0E2245 46%, #0B1E3D 100%)',
      }}
      role="status"
      aria-live="polite"
    >
      {STARS.map((s, i) => (
        <div
          key={i}
          aria-hidden
          style={{
            position: 'absolute',
            left: s.left,
            right: s.right,
            top: s.top,
            bottom: s.bottom,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: s.color,
            animation: `twinkle ${s.duration} ease-in-out infinite`,
          }}
        />
      ))}

      <div
        aria-hidden
        style={{
          position: 'relative',
          width: 340,
          height: 340,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 340,
            height: 340,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 50% 50%, rgba(46,90,172,.42) 0%, rgba(143,184,232,.22) 42%, rgba(11,30,61,0) 70%)',
            animation: 'glowPulse 5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 248,
            height: 248,
            borderRadius: '50%',
            background:
              'conic-gradient(from 0deg, rgba(143,184,232,0), rgba(143,184,232,.6) 28%, rgba(46,90,172,.5) 52%, rgba(46,90,172,0) 74%)',
            mask: 'radial-gradient(circle, transparent 62%, #000 63%)',
            WebkitMask: 'radial-gradient(circle, transparent 62%, #000 63%)',
            animation: 'glowSpin 3.6s linear infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 172,
            height: 172,
            borderRadius: '50%',
            background:
              'conic-gradient(from 200deg, rgba(143,184,232,0), rgba(143,184,232,.55) 32%, rgba(46,90,172,0) 66%)',
            mask: 'radial-gradient(circle, transparent 60%, #000 61%)',
            WebkitMask: 'radial-gradient(circle, transparent 60%, #000 61%)',
            animation: 'glowSpinRev 5.4s linear infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 340,
            height: 340,
            borderRadius: '50%',
            border: '1px solid rgba(143,184,232,.28)',
            animation: 'ringOut 4.2s ease-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 66,
            height: 66,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 42% 38%, #FFFFFF 0%, #BBD4F2 46%, #5B8FD4 100%)',
            boxShadow: '0 0 54px rgba(143,184,232,.5)',
          }}
        />
      </div>

      <div
        style={{
          marginTop: 48,
          fontFamily: FONT_DISPLAY,
          fontSize: 30,
          fontWeight: 300,
          letterSpacing: '-.01em',
          color: '#F4F7FB',
        }}
      >
        Reading your skin
      </div>
      <div style={{ marginTop: 16, fontSize: 15, color: 'rgba(143,184,232,.95)', height: 22 }}>
        {STEPS[stepIndex]}
      </div>
      <div
        style={{
          marginTop: 32,
          width: 260,
          height: 2,
          borderRadius: 2,
          background: 'rgba(143,184,232,.22)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: 2,
            borderRadius: 2,
            background: 'linear-gradient(90deg,#8FB8E8,#FFFFFF)',
            width: pct,
          }}
        />
      </div>
      <div
        style={{
          marginTop: 14,
          fontSize: 11.5,
          letterSpacing: '.2em',
          color: 'rgba(143,184,232,.75)',
          fontFamily: FONT_MONO,
        }}
      >
        {pct}
      </div>
      <div
        style={{
          marginTop: 48,
          fontSize: 13,
          lineHeight: 1.7,
          color: 'rgba(212,222,238,.6)',
          textAlign: 'center',
          maxWidth: 420,
        }}
      >
        The captured frame is processed in your browser and discarded when the reading finishes.
      </div>
    </div>
  )
}
