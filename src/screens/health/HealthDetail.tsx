/**
 * H6 The care guide for one area: the visitor's numbers against their lines, what
 * the result means, which department sees it, the tests and care worth asking
 * about, everyday steps, and the signs that mean not waiting. It ends on the one
 * thing to do next — find that department nearby.
 */
import { useEffect } from 'react'
import { Icon, PATHS } from '../../components/Icons'
import { BackLink, Card, Display, Dot, FieldLabel, PrimaryButton, Prose, Shell, Tag } from '../../components/primitives'
import { columns, screenPadding, useNarrow } from '../../components/layout'
import { C, FONT_DISPLAY, FONT_MONO, HEALTH, HEALTH_LEVELS as LEVEL_LOOK } from '../../theme'
import { CONDITIONS, ITEMS, formatValue, normalRange } from '../../health/items'
import { useCopy } from '../../i18n'
import { HEALTH_COPY } from '../../i18n/health'
import { CARE } from '../../i18n/healthCare'
import { useHealth } from '../../state/health'
import { useStore } from '../../state/store'

export function HealthDetail() {
  const { profile, go } = useStore()
  const { report, selected } = useHealth()
  const all = useCopy(HEALTH_COPY)
  const care = useCopy(CARE)
  const copy = all.detail
  const narrow = useNarrow()

  const condition = report?.conditions.find((c) => c.id === selected) ?? report?.conditions[0] ?? null
  useEffect(() => {
    if (!condition) go(report ? 'health-result' : 'health-form')
  }, [condition, report, go])
  if (!condition) return <div style={{ flex: 1 }} />

  const guide = care[condition.id]
  const dept = all.departments[CONDITIONS[condition.id].department]
  const look = LEVEL_LOOK[condition.level]

  const section = (title: string, children: React.ReactNode) => (
    <Card style={{ padding: narrow ? 18 : 26 }}>
      <FieldLabel>{title}</FieldLabel>
      <div style={{ marginTop: 14 }}>{children}</div>
    </Card>
  )

  return (
    <div style={{ flex: 1, padding: screenPadding(narrow, 36, 70) }}>
      <Shell width={1080}>
        <BackLink onClick={() => go('health-result')}>{copy.back}</BackLink>
        <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
          <Display size={36}>{all.conditions[condition.id]}</Display>
          <Tag bg={look.bg} color={look.color}>
            {all.levels[condition.level]}
          </Tag>
        </div>

        <div
          style={{
            marginTop: narrow ? 20 : 28,
            display: 'grid',
            gridTemplateColumns: columns(narrow, 'minmax(0,1.35fr) minmax(0,1fr)'),
            gap: 18,
            alignItems: 'start',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {section(
              copy.whatItMeans,
              <>
                <Prose style={{ lineHeight: 1.75 }}>{guide.meaning}</Prose>
                {condition.familyHistory || condition.diagnosed ? (
                  <div
                    style={{
                      marginTop: 14,
                      padding: '12px 14px',
                      borderRadius: 10,
                      background: C.chip,
                      color: C.blueDark,
                      fontSize: 14,
                      lineHeight: 1.65,
                    }}
                  >
                    {condition.diagnosed ? copy.diagnosedNote : copy.familyNote}
                  </div>
                ) : null}
              </>,
            )}

            {section(
              copy.tests,
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {guide.tests.map((t, i) => (
                  <div
                    key={t.name}
                    style={{
                      display: 'flex',
                      gap: 14,
                      padding: '14px 16px',
                      borderRadius: 12,
                      background: C.surfaceMuted,
                      border: `1px solid ${C.rule}`,
                    }}
                  >
                    <span style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 600, color: C.blue }}>{i + 1}</span>
                    <div>
                      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15.5, fontWeight: 600, color: C.ink }}>{t.name}</div>
                      <div style={{ marginTop: 4, fontSize: 14, lineHeight: 1.65, color: C.bodyMuted }}>{t.why}</div>
                    </div>
                  </div>
                ))}
              </div>,
            )}

            {section(
              copy.everyday,
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {guide.everyday.map((line) => (
                  <div key={line} style={{ display: 'flex', gap: 12 }}>
                    <Dot />
                    <div style={{ fontSize: 14.5, lineHeight: 1.7, color: C.body }}>{line}</div>
                  </div>
                ))}
              </div>,
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, position: narrow ? 'static' : 'sticky', top: 92 }}>
            {condition.items.length
              ? section(
                  copy.yourNumbers,
                  <div>
                    {condition.items.map((i) => (
                      <div
                        key={i.id}
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          justifyContent: 'space-between',
                          gap: 12,
                          padding: '10px 0',
                          borderTop: `1px solid ${C.borderFaint}`,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 14, color: C.ink }}>{all.items[i.id]}</div>
                          <div style={{ marginTop: 2, fontSize: 12, fontFamily: FONT_MONO, color: C.muted }}>
                            {all.review.normal(normalRange(i.id, profile.gender))}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 600, color: LEVEL_LOOK[i.level].color }}>
                            {formatValue(i.id, i.value)}
                          </span>
                          <span style={{ marginLeft: 5, fontSize: 11.5, color: C.muted }}>{ITEMS[i.id].unit}</span>
                          {i.direction ? (
                            <div style={{ fontSize: 12, color: LEVEL_LOOK[i.level].color }}>{all.direction[i.direction]}</div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>,
                )
              : null}

            {section(
              copy.whereToGo,
              <>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 600, color: C.ink }}>{dept}</div>
                <Prose size={14} style={{ marginTop: 6, lineHeight: 1.65 }}>
                  {copy.departmentNote(dept)}
                </Prose>
                <div style={{ marginTop: 16 }}>
                  <PrimaryButton onClick={() => go('health-clinics')} height={50} full>
                    <Icon path={PATHS.pin} size={18} />
                    <span>{copy.cta(dept)}</span>
                  </PrimaryButton>
                </div>
              </>,
            )}

            <div
              style={{
                padding: narrow ? 16 : 20,
                borderRadius: 14,
                background: HEALTH.attentionBg,
                border: `1px solid ${HEALTH.attention}33`,
              }}
            >
              <div style={{ fontSize: 12.5, fontWeight: 700, color: HEALTH.attention }}>{copy.soon}</div>
              <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.65, color: C.inkSoft }}>{guide.soon}</div>
            </div>
          </div>
        </div>
      </Shell>
    </div>
  )
}
