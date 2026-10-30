/**
 * 17 Redemption code.
 *
 * The end of the rewards path: what the visitor shows at the front desk. The code
 * is drawn, not encoded — see `components/QrCode` — and the copy under it never
 * claims otherwise.
 */
import { QrCode } from '../components/QrCode'
import {
  BackLink,
  Card,
  Display,
  Dot,
  Eyebrow,
  Note,
  Prose,
  Shell,
  Well,
} from '../components/primitives'
import { columns, screenPadding, useNarrow } from '../components/layout'
import { C, FONT_DISPLAY } from '../theme'
import { useCopy, useLang } from '../i18n'
import { useCatalog } from '../i18n/catalog'
import { QR } from '../i18n/qr'
import { REWARD_KIND } from '../i18n/rewards'
import { useStore } from '../state/store'

export function Qr() {
  const { redeemedRewardId, go } = useStore()
  const cat = useCatalog()
  const reward = cat.STORE_ITEMS.find((item) => item.id === redeemedRewardId) ?? cat.STORE_ITEMS[0]
  const narrow = useNarrow()
  const { lang } = useLang()
  const copy = useCopy(QR)
  const kindLabel = useCopy(REWARD_KIND)

  return (
    <div style={{ flex: 1, padding: screenPadding(narrow, 44, 80) }}>
      <Shell width={1000}>
        <BackLink onClick={() => go('rewards')}>{copy.back}</BackLink>

        <Card
          style={{
            marginTop: narrow ? 16 : 22,
            padding: narrow ? '28px 20px' : 44,
            borderRadius: narrow ? 18 : 22,
            display: 'grid',
            gridTemplateColumns: columns(narrow, 'minmax(0,auto) minmax(0,1fr)'),
            gap: narrow ? 28 : 48,
            alignItems: 'center',
          }}
        >
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute',
                width: narrow ? 320 : 400,
                height: narrow ? 320 : 400,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle at 50% 50%, rgba(46,90,172,.11) 0%, rgba(143,184,232,.09) 44%, rgba(143,184,232,0) 70%)',
                animation: 'glowPulse 9s ease-in-out infinite',
              }}
            />
            <div
              style={{
                position: 'relative',
                padding: narrow ? 14 : 22,
                borderRadius: 20,
                background: C.surface,
                border: `1px solid ${C.border}`,
                boxShadow: '0 22px 50px rgba(20,32,58,.1)',
              }}
            >
              <QrCode />
            </div>
          </div>

          <div>
            {/* Wide tracking is a Latin caps device; CJK keeps only a hint of it. */}
            <Eyebrow size={11.5} spacing={lang === 'en' ? '.16em' : '.04em'}>
              {kindLabel[reward.kind]}
            </Eyebrow>
            <Display size={32} weight={400} style={{ marginTop: 14, lineHeight: 1.25 }}>
              {reward.name}
            </Display>
            <Prose style={{ marginTop: 14 }}>{reward.description}</Prose>

            <div
              style={{
                marginTop: 22,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '11px 18px',
                borderRadius: 10,
                background: C.chip,
                border: `1px solid ${C.borderBlue}`,
              }}
            >
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.blue }} />
              <div style={{ fontSize: 13.5, fontWeight: 600, color: C.blue }}>
                {copy.expiresIn(reward.expiry)}
              </div>
            </div>

            <Well style={{ marginTop: 28 }}>
              <div
                style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 600, color: C.ink }}
              >
                {copy.howToTitle}
              </div>
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {copy.howToSteps.map((text) => (
                  <div key={text} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <Dot />
                    <Prose size={14} style={{ flex: 1, lineHeight: 1.7 }}>
                      {text}
                    </Prose>
                  </div>
                ))}
              </div>
            </Well>

            <Note style={{ marginTop: 18 }}>{copy.drawnNote}</Note>
          </div>
        </Card>
      </Shell>
    </div>
  )
}
