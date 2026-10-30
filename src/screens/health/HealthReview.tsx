/**
 * H4 Checking the numbers — reached from the body map's "Edit numbers", or from
 * "Type the numbers in" when there is no photo to read. A scan no longer stops
 * here on its way to the body map; this is where its misreads get fixed.
 *
 * The step the skin reading does not have, and the one that makes this mode
 * trustworthy: a webcam photo of a table is read imperfectly, so every value the
 * reader found is shown, editable, beside the item's unit and normal range, and
 * every value it missed is an empty field to fill. Each row judges itself as it is
 * typed, so the visitor sees the level the body map will use before going there.
 *
 * Rows are grouped by condition — the order the body map and guide will use — so
 * blood pressure's two numbers and the four lipid lines sit together.
 */
import { BackLink, Card, Display, Note, PrimaryButton, Prose, Shell } from '../../components/primitives'
import { Icon, PATHS } from '../../components/Icons'
import { columns, screenPadding, useNarrow } from '../../components/layout'
import { C, FONT_DISPLAY, FONT_MONO, HEALTH, HEALTH_LEVELS as LEVEL_LOOK } from '../../theme'
import { CONDITIONS, CONDITION_IDS, ITEMS, ITEM_IDS, levelOf, normalRange, type ItemId } from '../../health/items'
import { useCopy } from '../../i18n'
import { HEALTH_COPY } from '../../i18n/health'
import { parseDraftValue, useHealth } from '../../state/health'
import { useStore } from '../../state/store'

export function HealthReview() {
  const { profile, go } = useStore()
  const { draft, draftSource, scanned, scanText, photoUrl, setDraftValue, canConfirm, confirm, report } = useHealth()
  const all = useCopy(HEALTH_COPY)
  const copy = all.review
  const narrow = useNarrow()

  const lead =
    draftSource === 'sample'
      ? copy.sample
      : draftSource === 'manual'
        ? copy.manual
        : scanned.length === 0
          ? copy.none
          : copy.found(scanned.length, ITEM_IDS.length)

  const row = (id: ItemId) => {
    const spec = ITEMS[id]
    const text = draft[id]
    const value = parseDraftValue(id, text)
    const level = value === undefined ? null : levelOf(id, value, profile.gender)
    const invalid = text.trim() !== '' && value === undefined
    const fromPhoto = draftSource === 'scan' && scanned.includes(id)
    const inputId = `reading-${id}`
    return (
      <div
        key={id}
        style={{
          display: 'grid',
          gridTemplateColumns: narrow ? 'minmax(0,1fr) 112px' : 'minmax(0,1fr) 128px 120px',
          gap: narrow ? '6px 12px' : 16,
          alignItems: 'center',
          padding: '12px 0',
          borderTop: `1px solid ${C.borderFaint}`,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <label htmlFor={inputId} style={{ fontSize: 14.5, fontWeight: 500, color: C.ink }}>
            {all.items[id]}
          </label>
          <div style={{ marginTop: 3, display: 'flex', flexWrap: 'wrap', gap: '2px 10px', fontSize: 12, color: C.muted }}>
            <span style={{ fontFamily: FONT_MONO }}>{copy.normal(normalRange(id, profile.gender))}</span>
            {fromPhoto ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: C.blue }}>
                <Icon path={PATHS.camera} size={12} weight={1.8} />
                {copy.readTag}
              </span>
            ) : null}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '0 10px',
            height: 42,
            borderRadius: 9,
            border: `1px solid ${invalid ? HEALTH.attention : fromPhoto ? C.blueLight : C.borderStrong}`,
            background: C.surface,
          }}
        >
          <input
            id={inputId}
            inputMode="decimal"
            autoComplete="off"
            value={text}
            placeholder="—"
            aria-invalid={invalid}
            onChange={(e) => setDraftValue(id, e.target.value)}
            style={{
              flex: 1,
              minWidth: 0,
              border: 0,
              outline: 'none',
              background: 'transparent',
              fontFamily: FONT_DISPLAY,
              fontSize: 16,
              fontWeight: 600,
              color: C.ink,
              textAlign: 'right',
            }}
          />
          <span style={{ fontSize: 11, color: C.muted, whiteSpace: 'nowrap' }}>{spec.unit}</span>
        </div>
        <div style={{ gridColumn: narrow ? '1 / -1' : undefined, display: 'flex', justifyContent: narrow ? 'flex-start' : 'flex-end' }}>
          {level === null ? null : (
            <span
              style={{
                padding: '4px 10px',
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 600,
                color: LEVEL_LOOK[level].color,
                background: LEVEL_LOOK[level].bg,
                whiteSpace: 'nowrap',
              }}
            >
              {all.levels[level]}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, padding: screenPadding(narrow, 48, 80) }}>
      <Shell width={1040}>
        <div>
          {report ? (
            <BackLink onClick={() => go('health-result')}>{copy.back}</BackLink>
          ) : (
            <BackLink onClick={() => go('health-capture')}>{copy.retake}</BackLink>
          )}
        </div>
        <Display size={34} style={{ marginTop: 14 }}>
          {copy.title}
        </Display>
        <Prose style={{ marginTop: 10, maxWidth: 640, lineHeight: 1.7 }}>{lead}</Prose>

        <div
          style={{
            marginTop: narrow ? 22 : 30,
            display: 'grid',
            gridTemplateColumns: columns(narrow, photoUrl ? 'minmax(0,1fr) 300px' : 'minmax(0,1fr)'),
            gap: 24,
            alignItems: 'start',
          }}
        >
          <Card style={{ padding: narrow ? '6px 16px 12px' : '10px 28px 18px' }}>
            {CONDITION_IDS.map((cid) => (
              <div key={cid} style={{ marginTop: 18 }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 600, color: C.blue, paddingBottom: 6 }}>
                  {all.conditions[cid]}
                </div>
                {CONDITIONS[cid].items.map(row)}
              </div>
            ))}
          </Card>

          {photoUrl ? (
            <div style={{ position: narrow ? 'static' : 'sticky', top: 92 }}>
              <img
                src={photoUrl}
                alt=""
                style={{ width: '100%', borderRadius: 14, border: `1px solid ${C.border}`, display: 'block' }}
              />
              <details style={{ marginTop: 12 }}>
                <summary style={{ cursor: 'pointer', fontSize: 13, color: C.bodyMuted }}>{copy.rawText}</summary>
                <pre
                  style={{
                    marginTop: 8,
                    maxHeight: 260,
                    overflow: 'auto',
                    padding: 12,
                    borderRadius: 10,
                    background: C.surfaceMuted,
                    border: `1px solid ${C.rule}`,
                    fontSize: 11.5,
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    color: C.body,
                  }}
                >
                  {scanText.trim() || copy.rawEmpty}
                </pre>
              </details>
            </div>
          ) : null}
        </div>

        <div
          style={{
            marginTop: 24,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          {canConfirm ? null : <Note>{copy.needOne}</Note>}
          <PrimaryButton onClick={confirm} disabled={!canConfirm} full={narrow}>
            <span>{copy.cta}</span>
            <span style={{ display: 'flex' }}>
              <Icon path={PATHS.arrow} size={19} weight={1.7} />
            </span>
          </PrimaryButton>
        </div>
      </Shell>
    </div>
  )
}
