/**
 * 09 Treatment detail.
 *
 * Three questions in the order people ask them: what is it, what happens on the
 * day, and what should I know before booking. The sidebar answers the fourth —
 * where — and carries the two products that pair with this treatment, each in its
 * own house's colours rather than the page's.
 */
import { Icon, PATHS } from '../components/Icons'
import {
  BackLink,
  Card,
  Display,
  Dot,
  Note,
  Pressable,
  PrimaryButton,
  Prose,
  Shell,
  Well,
} from '../components/primitives'
import { C, FONT_DISPLAY, SHADOW_PANEL, houseOf } from '../theme'
import { clinicsFor, districtByKey, productsFor, tieFor, won } from '../data/catalog'
import { UI } from '../data/strings'
import { useStore, useTreatment } from '../state/store'

export function Detail() {
  const { profile, savedTreatmentIds, toggleSavedTreatment, selectProduct, go } = useStore()
  const treatment = useTreatment()
  const district = districtByKey(profile.districtKey)
  const nearby = district ? clinicsFor(district.key, treatment.id).length : 0
  const saved = savedTreatmentIds.includes(treatment.id)
  const products = productsFor(treatment)

  return (
    <div style={{ flex: 1, padding: '32px 32px 80px' }}>
      <Shell>
        <BackLink onClick={() => go('treatments')}>All treatments</BackLink>

        <div
          style={{
            marginTop: 22,
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)',
            gap: 36,
            alignItems: 'start',
          }}
        >
          <div>
            <Card style={{ padding: 36, borderRadius: 22 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 20,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      letterSpacing: '.16em',
                      color: C.blue,
                    }}
                  >
                    {treatment.tag}
                  </div>
                  <Display size={36} weight={400} style={{ marginTop: 14, lineHeight: 1.2 }}>
                    {treatment.name}
                  </Display>
                </div>
                <Pressable
                  onClick={() => toggleSavedTreatment(treatment.id)}
                  className="opt"
                  style={{
                    flex: 'none',
                    height: 44,
                    padding: '0 16px',
                    borderRadius: 11,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                    background: saved ? C.chip : C.surface,
                    border: `1px solid ${saved ? C.borderBlue : C.borderStrong}`,
                    color: saved ? C.blue : C.bodyMuted,
                    fontSize: 13.5,
                    fontWeight: 600,
                  }}
                >
                  <span style={{ display: 'flex' }}>
                    <Icon path={PATHS.bookmark} size={18} weight={1.6} />
                  </span>
                  <span>{saved ? 'Saved' : 'Add to Interested'}</span>
                </Pressable>
              </div>

              <Prose size={16} color={C.body} style={{ marginTop: 18, lineHeight: 1.8 }}>
                {treatment.summary}
              </Prose>

              <div
                style={{
                  marginTop: 26,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
                  gap: 12,
                }}
              >
                {[
                  { label: UI.priceRange, value: treatment.priceRange },
                  { label: UI.perSession, value: treatment.duration },
                  {
                    label: 'CLINICS NEARBY',
                    value: district ? `${nearby} in ${district.name}` : `${nearby}`,
                  },
                ].map((cell) => (
                  <div
                    key={cell.label}
                    style={{
                      padding: '16px 18px',
                      borderRadius: 13,
                      background: C.surfaceMuted,
                      border: `1px solid ${C.rule}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: '.08em',
                        color: C.muted,
                      }}
                    >
                      {cell.label}
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        fontFamily: FONT_DISPLAY,
                        fontSize: 17,
                        fontWeight: 600,
                        color: C.ink,
                      }}
                    >
                      {cell.value}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card style={{ marginTop: 24, padding: '32px 36px', borderRadius: 22 }}>
              <div
                style={{ fontFamily: FONT_DISPLAY, fontSize: 21, fontWeight: 600, color: C.ink }}
              >
                What happens on the day
              </div>
              <div style={{ marginTop: 22 }}>
                {treatment.steps.map((step, i) => (
                  <div key={step.order} style={{ display: 'flex', gap: 18, alignItems: 'stretch' }}>
                    <div
                      style={{
                        width: 30,
                        flex: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          background: C.chip,
                          border: `1px solid ${C.borderBlue}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: FONT_DISPLAY,
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: C.blue,
                        }}
                      >
                        {step.order}
                      </div>
                      {/* The line stops at the last step rather than trailing into nothing. */}
                      {i < treatment.steps.length - 1 ? (
                        <div style={{ width: 1, flex: 1, minHeight: 24, background: C.border }} />
                      ) : null}
                    </div>
                    <div style={{ flex: 1, paddingBottom: 22 }}>
                      <div
                        style={{
                          fontFamily: FONT_DISPLAY,
                          fontSize: 16,
                          fontWeight: 600,
                          color: C.ink,
                        }}
                      >
                        {step.title}
                      </div>
                      <Prose size={14} style={{ marginTop: 7 }}>
                        {step.body}
                      </Prose>
                    </div>
                  </div>
                ))}
              </div>

              <Well>
                <div
                  style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 600, color: C.ink }}
                >
                  How the days after go
                </div>
                <div
                  style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}
                >
                  {treatment.aftercare.map((row) => (
                    <div key={row.when} style={{ display: 'flex', gap: 18, alignItems: 'baseline' }}>
                      <div
                        style={{ width: 96, flex: 'none', fontSize: 13, fontWeight: 600, color: C.blue }}
                      >
                        {row.when}
                      </div>
                      <div style={{ flex: 1, fontSize: 14, lineHeight: 1.7, color: C.body }}>
                        {row.what}
                      </div>
                    </div>
                  ))}
                </div>
              </Well>

              <div
                style={{
                  marginTop: 28,
                  fontFamily: FONT_DISPLAY,
                  fontSize: 21,
                  fontWeight: 600,
                  color: C.ink,
                }}
              >
                Before you book
              </div>
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 11 }}>
                {treatment.cautions.map((text) => (
                  <div key={text} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <Dot top={9} />
                    <Prose size={14} style={{ flex: 1 }}>
                      {text}
                    </Prose>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div
            style={{
              position: 'sticky',
              top: 92,
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            <Card style={{ padding: 26, border: `1px solid ${C.borderBlue}`, boxShadow: SHADOW_PANEL }}>
              <div
                style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 600, color: C.ink }}
              >
                Ready to compare clinics?
              </div>
              <Prose size={14} style={{ marginTop: 10, lineHeight: 1.7 }}>
                {district
                  ? `See the ${nearby} clinics in ${district.name} that run this treatment, with prices side by side.`
                  : 'See the clinics that run this treatment, with prices side by side.'}
              </Prose>
              <div style={{ marginTop: 20 }}>
                <PrimaryButton onClick={() => go('clinics')} full height={52} fontSize={15.5}>
                  Find Recommended Clinics
                </PrimaryButton>
              </div>
              <Note style={{ marginTop: 14, fontSize: 12.5 }}>{UI.partnerOffer}</Note>
            </Card>

            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div
                  style={{ fontFamily: FONT_DISPLAY, fontSize: 19, fontWeight: 600, color: C.ink }}
                >
                  Pairs well with
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>At partner clinics</div>
              </div>
              <Prose size={13.5} style={{ marginTop: 8, lineHeight: 1.7 }}>
                Protect during the day, recover at night.
              </Prose>

              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {products.map((p) => {
                  const house = houseOf(p.brand)
                  return (
                    <div
                      key={p.id}
                      style={{
                        padding: 22,
                        borderRadius: 18,
                        background: house.bg,
                        border: `1px solid ${house.border}`,
                      }}
                    >
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 7,
                          padding: '5px 10px',
                          borderRadius: 7,
                          background: house.chipBg,
                        }}
                      >
                        <div
                          style={{ width: 5, height: 5, borderRadius: '50%', background: house.dot }}
                        />
                        <div
                          style={{
                            fontFamily: FONT_DISPLAY,
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: '.14em',
                            color: house.chipColor,
                          }}
                        >
                          {p.line}
                        </div>
                      </div>
                      <div
                        style={{
                          marginTop: 14,
                          fontFamily: FONT_DISPLAY,
                          fontSize: 17,
                          fontWeight: 600,
                          color: house.name,
                        }}
                      >
                        {p.name}
                      </div>
                      <div
                        style={{ marginTop: 8, fontSize: 13.5, lineHeight: 1.7, color: house.body }}
                      >
                        {/* Why it pairs with *this* treatment, when the catalogue says. */}
                        {tieFor(p, treatment.id)}
                      </div>
                      <div
                        style={{
                          marginTop: 18,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            fontFamily: FONT_DISPLAY,
                            fontSize: 16,
                            fontWeight: 600,
                            color: house.name,
                          }}
                        >
                          {won(p.price)}
                        </div>
                        <Pressable
                          onClick={() => {
                            selectProduct(p.id)
                            go('product')
                          }}
                          className="btn-bright"
                          style={{
                            height: 42,
                            padding: '0 18px',
                            borderRadius: 10,
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: 13.5,
                            fontWeight: 600,
                            background: house.btnBg,
                            color: house.btnColor,
                          }}
                        >
                          Buy Product
                        </Pressable>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </Shell>
    </div>
  )
}
