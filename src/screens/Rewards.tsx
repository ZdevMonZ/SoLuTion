/**
 * 16 Rewards.
 *
 * The balance and the tier gap are one constant apart in the catalogue, so the
 * sentence under the dial is computed rather than written — the two cannot drift.
 * An item priced above the balance is drawn locked and does not respond.
 */
import {
  Card,
  Eyebrow,
  Note,
  Pressable,
  ScoreRing,
  Shell,
} from '../components/primitives'
import { columns, screenPadding, useNarrow } from '../components/layout'
import { C, FONT_DISPLAY } from '../theme'
import { NEXT_TIER_POINTS, STARTING_POINTS } from '../data/catalog'
import { useCopy, useLang } from '../i18n'
import { useCatalog } from '../i18n/catalog'
import { REWARDS, REWARD_KIND } from '../i18n/rewards'
import { useStore } from '../state/store'

export function Rewards() {
  const { selectReward, go } = useStore()
  const toGo = Math.max(0, NEXT_TIER_POINTS - STARTING_POINTS)
  const narrow = useNarrow()
  const { lang } = useLang()
  const copy = useCopy(REWARDS)
  const kindLabel = useCopy(REWARD_KIND)
  const cat = useCatalog()

  // Wide tracking is a Latin caps device. Hangul, kana and hanzi spread that far read
  // as loose characters rather than a label, so they keep only a hint of it.
  const tracking = (latin: string) => (lang === 'en' ? latin : '.04em')

  return (
    <div style={{ flex: 1, padding: screenPadding(narrow, 44, 80) }}>
      <Shell>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: columns(narrow, 'minmax(0,1fr) minmax(0,1.25fr)'),
            gap: narrow ? 18 : 32,
            alignItems: 'stretch',
          }}
        >
          <Card
            style={{
              position: 'relative',
              overflow: 'hidden',
              padding: narrow ? '22px 20px' : 36,
              borderRadius: narrow ? 18 : 22,
            }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  width: 420,
                  maxWidth: '120%',
                  aspectRatio: '1',
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle at 50% 50%, rgba(46,90,172,.12) 0%, rgba(143,184,232,.1) 42%, rgba(143,184,232,0) 70%)',
                  animation: 'glowPulse 8s ease-in-out infinite',
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Eyebrow size={11.5} spacing={tracking('.14em')}>
                {copy.pointsBalance}
              </Eyebrow>
              <div
                style={{
                  marginTop: narrow ? 20 : 28,
                  display: 'flex',
                  alignItems: 'center',
                  gap: narrow ? 20 : 30,
                  flexWrap: 'wrap',
                }}
              >
                <ScoreRing
                  value={STARTING_POINTS}
                  max={NEXT_TIER_POINTS}
                  size={narrow ? 136 : 176}
                  thickness={0.14}
                  numeral={STARTING_POINTS.toLocaleString('en-US')}
                  caption={copy.pointsCaption}
                  numeralSize={narrow ? 34 : 42}
                />
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div
                    style={{
                      fontFamily: FONT_DISPLAY,
                      fontSize: narrow ? 19 : 22,
                      fontWeight: 600,
                      lineHeight: 1.4,
                      color: C.ink,
                    }}
                  >
                    {copy.toNextTier(toGo)}
                  </div>
                  <div style={{ marginTop: 12, fontSize: 14, lineHeight: 1.7, color: C.bodyMuted }}>
                    {copy.tierPerk}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 34,
                  fontFamily: FONT_DISPLAY,
                  fontSize: 19,
                  fontWeight: 600,
                  color: C.ink,
                }}
              >
                {copy.waysToEarn}
              </div>
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {cat.EARN_RULES.map((rule) => (
                  <div
                    key={rule.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '18px 20px',
                      borderRadius: 14,
                      background: C.surfaceMuted,
                      border: `1px solid ${C.rule}`,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: FONT_DISPLAY,
                          fontSize: 15.5,
                          fontWeight: 600,
                          color: C.ink,
                        }}
                      >
                        {rule.title}
                      </div>
                      <div style={{ marginTop: 5, fontSize: 13, color: C.muted }}>
                        {rule.subtitle}
                      </div>
                    </div>
                    <div
                      style={{
                        flex: 'none',
                        fontFamily: FONT_DISPLAY,
                        fontSize: 15,
                        fontWeight: 700,
                        color: C.blue,
                      }}
                    >
                      {rule.pointsLabel}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div>
            {/* Wraps rather than squeezes: on a phone the Japanese line does not fit beside the heading. */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px 16px',
                alignItems: 'baseline',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 600, color: C.ink }}
              >
                {copy.rewardsStore}
              </div>
              <Note style={{ fontSize: 13 }}>{copy.redeemedBy}</Note>
            </div>

            <div
              style={{
                marginTop: 18,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(min(232px,100%),1fr))',
                gap: 16,
              }}
            >
              {cat.STORE_ITEMS.map((item) => (
                <Pressable
                  key={item.id}
                  disabled={!item.affordable}
                  onClick={() => {
                    selectReward(item.id)
                    go('qr')
                  }}
                  className={item.affordable ? 'card-lift-soft' : undefined}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    textAlign: 'left',
                    padding: 22,
                    borderRadius: 18,
                    background: C.surface,
                    border: `1px solid ${item.affordable ? C.borderBlue : C.border}`,
                  }}
                >
                  <div
                    style={{
                      height: 96,
                      borderRadius: 13,
                      background: item.art,
                      border: `1px solid ${C.rule}`,
                    }}
                  />
                  <div
                    style={{
                      marginTop: 18,
                      fontSize: 10.5,
                      fontWeight: 700,
                      letterSpacing: tracking('.12em'),
                      color: item.kind === 'COUPON' ? C.blueMid : C.muted,
                    }}
                  >
                    {kindLabel[item.kind]}
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      flex: 1,
                      fontFamily: FONT_DISPLAY,
                      fontSize: 16.5,
                      fontWeight: 600,
                      lineHeight: 1.35,
                      color: C.ink,
                    }}
                  >
                    {item.name}
                  </div>
                  <div
                    style={{
                      marginTop: 18,
                      paddingTop: 14,
                      borderTop: `1px solid ${C.borderFaint}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: FONT_DISPLAY,
                        fontSize: 15.5,
                        fontWeight: 700,
                        color: C.blue,
                      }}
                    >
                      {item.costLabel}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: item.affordable ? C.blue : C.faint,
                      }}
                    >
                      {item.affordable ? `${copy.redeem} →` : copy.locked}
                    </div>
                  </div>
                </Pressable>
              ))}
            </div>

            <Note style={{ marginTop: 18, fontSize: 12.5 }}>{copy.sampleNote}</Note>
          </div>
        </div>
      </Shell>
    </div>
  )
}
