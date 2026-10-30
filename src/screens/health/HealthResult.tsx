/**
 * H5 The body map.
 *
 * The turning figure on one side, the flagged areas as cards on the other, most
 * urgent first. Choosing a card — or a glow on the figure — selects that area: the
 * figure turns to it and labels it, and the card opens onto its guide. Areas with
 * every number in range are listed once, compactly, below; they are part of the
 * answer, but not the part that needs a decision.
 */
import { useEffect } from 'react'
import { BodyCloud, type BodyFlag } from '../../components/BodyCloud'
import { Icon, PATHS } from '../../components/Icons'
import { Card, Display, Eyebrow, GhostButton, Note, Pressable, Prose, Shell, Tag } from '../../components/primitives'
import { columns, screenPadding, useNarrow } from '../../components/layout'
import { C, FONT_DISPLAY, HEALTH, HEALTH_LEVELS as LEVEL_LOOK } from '../../theme'
import { CONDITIONS, formatValue, type ConditionResult } from '../../health/items'
import { useCopy } from '../../i18n'
import { HEALTH_COPY } from '../../i18n/health'
import { useHealth } from '../../state/health'
import { useStore } from '../../state/store'

export function HealthResult() {
  const { go } = useStore()
  const { report, selected, select, openGuide } = useHealth()
  const all = useCopy(HEALTH_COPY)
  const copy = all.result
  const narrow = useNarrow()

  useEffect(() => {
    if (!report) go('health-form')
  }, [report, go])
  if (!report) return <div style={{ flex: 1 }} />

  const flagged = report.conditions.filter((c) => c.level > 0 || c.diagnosed)
  const calm = report.conditions.filter((c) => c.level === 0 && !c.diagnosed)
  const needing = report.conditions.filter((c) => c.level > 0).length
  const flags: BodyFlag[] = report.conditions.map((c) => ({ id: c.id, organ: CONDITIONS[c.id].organ, level: c.level }))
  const lit = report.conditions.filter((c) => c.level > 0).map((c) => all.conditions[c.id])

  /** "LDL 164 ↑ · HDL 43" — the numbers behind a card, flagged ones marked. */
  const numbers = (c: ConditionResult) =>
    c.items.map((i) => (
      <span key={i.id} style={{ whiteSpace: 'nowrap', color: i.level ? LEVEL_LOOK[i.level].color : C.bodyMuted }}>
        {all.items[i.id]} <b style={{ fontWeight: 600 }}>{formatValue(i.id, i.value)}</b>
        {i.direction ? (i.direction === 'high' ? ' ↑' : ' ↓') : ''}
      </span>
    ))

  const card = (c: ConditionResult) => {
    const on = c.id === selected
    const look = LEVEL_LOOK[c.level]
    return (
      <Card
        key={c.id}
        style={{
          padding: 0,
          overflow: 'hidden',
          border: `1px solid ${on ? look.color : C.border}`,
          boxShadow: on ? '0 14px 32px rgba(20,32,58,.08)' : undefined,
        }}
      >
        <Pressable
          pressed={on}
          onClick={() => select(on ? null : c.id)}
          style={{ display: 'block', width: '100%', textAlign: 'left', padding: narrow ? 16 : 20 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              aria-hidden
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                flex: 'none',
                background: look.color,
                boxShadow: `0 0 0 4px ${look.bg}`,
              }}
            />
            <div style={{ flex: 1, minWidth: 0, fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 600, color: C.ink }}>
              {all.conditions[c.id]}
            </div>
            <Tag bg={look.bg} color={look.color}>
              {all.levels[c.level]}
            </Tag>
          </div>
          <div
            style={{
              marginTop: 10,
              marginLeft: 24,
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px 14px',
              fontSize: 13.5,
            }}
          >
            {c.items.length ? numbers(c) : <span style={{ color: C.muted }}>{copy.diagnosedOnly}</span>}
          </div>
          {c.familyHistory || c.diagnosed ? (
            <div style={{ marginTop: 10, marginLeft: 24, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {c.familyHistory ? <Tag>{copy.family}</Tag> : null}
              {c.diagnosed ? <Tag>{copy.diagnosed}</Tag> : null}
            </div>
          ) : null}
        </Pressable>
        {on ? (
          <div style={{ padding: narrow ? '0 16px 16px' : '0 20px 20px', marginLeft: narrow ? 0 : 24 }}>
            <Pressable
              onClick={() => openGuide(c.id)}
              className="btn-primary"
              style={{
                width: '100%',
                height: 46,
                borderRadius: 10,
                background: C.blue,
                color: '#fff',
                fontFamily: FONT_DISPLAY,
                fontSize: 14.5,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {copy.guide}
              <Icon path={PATHS.arrow} size={17} weight={1.7} />
            </Pressable>
          </div>
        ) : null}
      </Card>
    )
  }

  const body = (
    <Card
      style={{
        padding: narrow ? 10 : 16,
        background: 'radial-gradient(70% 55% at 50% 45%, #F3F7FD 0%, #FFFFFF 70%)',
      }}
    >
      <BodyCloud
        flags={flags}
        selected={selected}
        onSelect={select}
        height={narrow ? 400 : 600}
        label={copy.bodyLabel(lit)}
        selectedLabel={selected ? all.conditions[selected] : null}
      />
      <div
        style={{
          marginTop: 6,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px 16px',
          justifyContent: 'center',
          fontSize: 12.5,
          color: C.muted,
        }}
      >
        {[2, 1].map((level) => (
          <span key={level} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: LEVEL_LOOK[level].color }} />
            {all.levels[level]}
          </span>
        ))}
        <span>↔ {copy.dragHint}</span>
      </div>
    </Card>
  )

  return (
    <div style={{ flex: 1, padding: screenPadding(narrow, 40, 70) }}>
      <Shell>
        {report.sample ? (
          <div
            style={{
              marginBottom: 18,
              padding: '10px 14px',
              borderRadius: 10,
              background: HEALTH.borderlineBg,
              color: HEALTH.borderline,
              fontSize: 13.5,
              fontWeight: 600,
            }}
          >
            {copy.sampleBanner}
          </div>
        ) : null}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: columns(narrow, 'minmax(0,1fr) minmax(0,1fr)'),
            gap: narrow ? 20 : 40,
            alignItems: 'start',
          }}
        >
          {narrow ? null : <div style={{ position: 'sticky', top: 92 }}>{body}</div>}

          <div>
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <Display size={34} style={{ marginTop: 12 }}>
              {copy.title(needing)}
            </Display>
            <Prose style={{ marginTop: 10, lineHeight: 1.7 }}>{copy.subtitle}</Prose>

            {narrow ? <div style={{ marginTop: 18 }}>{body}</div> : null}

            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {flagged.map(card)}
            </div>

            {calm.length ? (
              <div style={{ marginTop: 28 }}>
                <Eyebrow color={C.muted}>{copy.inRange}</Eyebrow>
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {calm.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 12,
                        background: C.surface,
                        border: `1px solid ${C.border}`,
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'baseline',
                        gap: '4px 14px',
                        fontSize: 13.5,
                      }}
                    >
                      <span style={{ fontWeight: 600, color: HEALTH.normal }}>✓ {all.conditions[c.id]}</span>
                      {numbers(c)}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <GhostButton onClick={() => go('health-review')} height={44} fontSize={14}>
                {copy.edit}
              </GhostButton>
              <GhostButton onClick={() => go('health-capture')} height={44} fontSize={14}>
                {copy.rescan}
              </GhostButton>
            </div>
            <Note style={{ marginTop: 20 }}>{copy.disclaimer}</Note>
          </div>
        </div>
      </Shell>
    </div>
  )
}
