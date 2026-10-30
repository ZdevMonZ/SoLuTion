/**
 * H3 Reading the sheet.
 *
 * Unlike the skin reading's analysing screen, this one waits on real work — the
 * reader's first run downloads its models and reading a full page takes seconds —
 * so the bar is the reader's own progress, not a paced sweep. The photo sits
 * behind a scan line, so the wait is visibly about the sheet. Moving on to the
 * body map is the store's job, done when the reading lands; this screen only shows
 * it, or the way out if the reader would not start or found no numbers.
 */
import { useEffect } from 'react'
import { GhostButton, PrimaryButton } from '../../components/primitives'
import { useNarrow } from '../../components/layout'
import { FONT_DISPLAY, FONT_MONO } from '../../theme'
import { useCopy } from '../../i18n'
import { HEALTH_COPY } from '../../i18n/health'
import { useHealth } from '../../state/health'
import { useStore } from '../../state/store'

export function HealthAnalyzing() {
  const { go } = useStore()
  const { photoUrl, progress, scanStatus, startManual } = useHealth()
  const copy = useCopy(HEALTH_COPY).analyzing
  const narrow = useNarrow()

  // Arriving here with nothing running (the rail, a reload of state) goes back to the camera.
  useEffect(() => {
    if (scanStatus === 'idle') go('health-capture')
  }, [scanStatus, go])

  const reading = progress?.stage === 'reading'
  // Loading is the first third of the bar, reading the rest, so it never runs backwards.
  const ratio = progress ? (reading ? 0.3 + progress.ratio * 0.7 : progress.ratio * 0.3) : 0
  const pct = `${Math.round(ratio * 100)}%`
  const empty = scanStatus === 'empty'
  const failed = scanStatus === 'failed' || empty

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: narrow ? '40px 16px' : '72px 32px',
        background: 'radial-gradient(70% 60% at 50% 46%, #17325C 0%, #0E2245 46%, #0B1E3D 100%)',
        color: '#F4F7FB',
        textAlign: 'center',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'relative',
          width: narrow ? 200 : 240,
          aspectRatio: '1/1.3',
          borderRadius: 14,
          overflow: 'hidden',
          background: 'rgba(143,184,232,.12)',
          border: '1px solid rgba(143,184,232,.35)',
          boxShadow: '0 0 60px rgba(91,143,212,.35)',
        }}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
          />
        ) : null}
        {failed ? null : (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: 3,
              background: 'linear-gradient(90deg,rgba(143,184,232,0),#BBD4F2,rgba(143,184,232,0))',
              boxShadow: '0 0 18px 4px rgba(143,184,232,.55)',
              animation: 'docScan 1.8s ease-in-out infinite alternate',
            }}
          />
        )}
      </div>

      <div
        className="headline"
        style={{ marginTop: narrow ? 28 : 40, fontFamily: FONT_DISPLAY, fontSize: narrow ? 24 : 28, fontWeight: 300 }}
      >
        {empty ? copy.emptyTitle : failed ? copy.failedTitle : copy.title}
      </div>

      {failed ? (
        <>
          <div style={{ marginTop: 14, maxWidth: 440, fontSize: 14.5, lineHeight: 1.7, color: 'rgba(212,222,238,.8)' }}>
            {empty ? copy.emptyBody : copy.failedBody}
          </div>
          <div style={{ marginTop: 26, display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            <PrimaryButton onClick={() => go('health-capture')} height={48}>
              {copy.retake}
            </PrimaryButton>
            <GhostButton onClick={startManual} height={48}>
              {copy.manual}
            </GhostButton>
          </div>
        </>
      ) : (
        <>
          <div style={{ marginTop: 14, fontSize: 15, color: 'rgba(143,184,232,.95)' }}>
            {reading ? copy.reading : copy.loading}
          </div>
          <div
            style={{
              marginTop: 26,
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
                width: pct,
                background: 'linear-gradient(90deg,#8FB8E8,#FFFFFF)',
                transition: 'width .25s ease-out',
              }}
            />
          </div>
          <div
            style={{ marginTop: 12, fontSize: 11.5, letterSpacing: '.2em', color: 'rgba(143,184,232,.75)', fontFamily: FONT_MONO }}
          >
            {pct}
          </div>
          {reading ? null : (
            <div style={{ marginTop: 26, maxWidth: 400, fontSize: 13, lineHeight: 1.7, color: 'rgba(212,222,238,.6)' }}>
              {copy.loadingNote}
            </div>
          )}
        </>
      )}
    </div>
  )
}
