/**
 * 12 Product.
 *
 * The card wears its own house: a LUNION night product is a dark navy page inside
 * a light site, and a SOLION daytime one is cream. Theming it from the screen
 * instead of from the product is the one mistake that loses the whole idea.
 */
import { useState } from 'react'
import {
  BackLink,
  Card,
  Display,
  Dot,
  GhostButton,
  Note,
  Pressable,
  PrimaryButton,
  Prose,
  Shell,
} from '../components/primitives'
import { columns, screenPadding, useNarrow } from '../components/layout'
import { C, FONT_DISPLAY, FONT_MONO_TEXT, houseOf } from '../theme'
import { won } from '../data/catalog'
import { useCopy } from '../i18n'
import { useCatalog } from '../i18n/catalog'
import { PRODUCT } from '../i18n/product'
import { useStore, useTreatment } from '../state/store'

export function Product() {
  const { selectedProductId, quantity, setQuantity, go } = useStore()
  const cat = useCatalog()
  const copy = useCopy(PRODUCT)
  const treatment = cat.treatment(useTreatment())
  const product = cat.productById(selectedProductId) ?? cat.productsFor(treatment)[0]
  const house = houseOf(product.brand)
  const [checkoutNote, setCheckoutNote] = useState(false)
  const narrow = useNarrow()

  return (
    <div style={{ flex: 1, padding: screenPadding(narrow, 32, 80) }}>
      <Shell width={1200}>
        <BackLink onClick={() => go('detail')}>{treatment.name}</BackLink>

        <div
          style={{
            marginTop: narrow ? 16 : 22,
            display: 'grid',
            gridTemplateColumns: columns(narrow, 'minmax(0,1fr) minmax(0,1fr)'),
            gap: narrow ? 24 : 48,
            alignItems: 'start',
          }}
        >
          <div
            style={{
              position: 'relative',
              borderRadius: narrow ? 18 : 22,
              overflow: 'hidden',
              border: `1px solid ${house.frameBorder}`,
              background: house.hero,
              // A 4:5 frame is most of a phone's screen before any words; square there.
              aspectRatio: narrow ? '1' : '4/5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
                  width: '78%',
                  aspectRatio: '1',
                  borderRadius: '50%',
                  background: house.glow,
                  animation: 'glowPulse 9s ease-in-out infinite',
                }}
              />
            </div>
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
                  width: '54%',
                  aspectRatio: '1',
                  borderRadius: '50%',
                  border: `1px solid ${house.ring}`,
                  animation: 'glowSpin 48s linear infinite',
                }}
              />
            </div>
            <div
              style={{
                position: 'relative',
                width: 150,
                height: 248,
                borderRadius: '16px 16px 22px 22px',
                background: house.bottle,
                boxShadow: '0 30px 56px rgba(11,30,61,.22)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingBottom: 28,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: -26,
                  transform: 'translateX(-50%)',
                  width: 56,
                  height: 30,
                  borderRadius: '7px 7px 3px 3px',
                  background: house.cap,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 30,
                  borderRadius: '16px 0 0 22px',
                  background: 'linear-gradient(90deg, rgba(255,255,255,.2), rgba(255,255,255,0))',
                }}
              />
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '.3em',
                  color: house.chrome,
                }}
              >
                {product.brand}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 9,
                  letterSpacing: '.1em',
                  opacity: 0.7,
                  color: house.chrome,
                  fontFamily: FONT_MONO_TEXT,
                }}
              >
                {copy.packshot}
              </div>
            </div>
          </div>

          <div>
            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: '.3em',
                color: house.label,
              }}
            >
              {product.brand}
            </div>
            <Display size={36} weight={400} style={{ marginTop: 14, lineHeight: 1.2 }}>
              {product.name}
            </Display>
            <Note style={{ marginTop: 10, fontSize: 13.5 }}>{product.size}</Note>

            <div
              style={{
                marginTop: 22,
                display: 'flex',
                gap: 13,
                alignItems: 'flex-start',
                padding: '18px 20px',
                borderRadius: 14,
                background: C.chip,
                border: `1px solid ${C.borderBlue}`,
              }}
            >
              <Dot color={C.blue} size={7} top={7} />
              <div style={{ flex: 1, fontSize: 14, lineHeight: 1.7, color: C.inkSoft }}>
                {cat.tieFor(product, treatment.id)}
              </div>
            </div>

            <Prose size={15.5} color={C.body} style={{ marginTop: 24, lineHeight: 1.85 }}>
              {product.description}
            </Prose>

            <div style={{ marginTop: 26 }}>
              {product.keys.map((key) => (
                <div
                  key={key.name}
                  style={{
                    display: 'flex',
                    gap: 20,
                    alignItems: 'baseline',
                    padding: '15px 0',
                    borderBottom: `1px solid ${C.borderFaint}`,
                  }}
                >
                  <div
                    style={{
                      width: 172,
                      flex: 'none',
                      fontFamily: FONT_DISPLAY,
                      fontSize: 14.5,
                      fontWeight: 600,
                      color: C.ink,
                    }}
                  >
                    {key.name}
                  </div>
                  <div style={{ flex: 1, fontSize: 14, lineHeight: 1.65, color: C.bodyMuted }}>
                    {key.benefit}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 30,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 24,
                alignItems: 'flex-end',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <Note style={{ fontSize: 12.5 }}>{copy.memberPrice}</Note>
                <div
                  style={{
                    marginTop: 6,
                    fontFamily: FONT_DISPLAY,
                    fontSize: 30,
                    fontWeight: 600,
                    color: C.ink,
                  }}
                >
                  {won(product.price * quantity)}
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: `1px solid ${C.borderStrong}`,
                  borderRadius: 11,
                  overflow: 'hidden',
                  background: C.surface,
                }}
              >
                <Pressable
                  onClick={() => setQuantity(-1)}
                  label={copy.fewer}
                  className="btn-step"
                  style={{
                    width: 48,
                    height: 50,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 19,
                    color: C.bodyMuted,
                  }}
                >
                  −
                </Pressable>
                <div
                  aria-live="polite"
                  style={{
                    width: 50,
                    textAlign: 'center',
                    fontFamily: FONT_DISPLAY,
                    fontSize: 17,
                    fontWeight: 600,
                    color: C.ink,
                  }}
                >
                  {quantity}
                </div>
                <Pressable
                  onClick={() => setQuantity(1)}
                  label={copy.more}
                  className="btn-step"
                  style={{
                    width: 48,
                    height: 50,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 19,
                    color: C.blue,
                  }}
                >
                  +
                </Pressable>
              </div>
            </div>

            <div style={{ marginTop: 22, display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <GhostButton onClick={() => setCheckoutNote(true)} height={54} full>
                  {copy.addToCart}
                </GhostButton>
              </div>
              <div style={{ flex: 1.3 }}>
                <PrimaryButton onClick={() => setCheckoutNote(true)} height={54} full fontSize={16}>
                  {copy.buyNow}
                </PrimaryButton>
              </div>
            </div>

            {/*
              There is no checkout behind these. Saying so on the click is better
              than a button that appears to have done something.
            */}
            {checkoutNote ? (
              <div
                role="status"
                style={{
                  marginTop: 14,
                  padding: '14px 18px',
                  borderRadius: 12,
                  background: C.chip,
                  border: `1px solid ${C.borderBlue}`,
                  fontSize: 13.5,
                  lineHeight: 1.7,
                  color: C.inkSoft,
                }}
              >
                {copy.checkoutNote}
              </div>
            ) : null}

            <Card
              style={{
                marginTop: 20,
                padding: '16px 18px',
                borderRadius: 14,
                background: C.surfaceMuted,
                border: `1px solid ${C.rule}`,
                fontSize: 13.5,
                lineHeight: 1.75,
                color: C.bodyMuted,
              }}
            >
              {copy.deliveryNote}
            </Card>
          </div>
        </div>
      </Shell>
    </div>
  )
}
