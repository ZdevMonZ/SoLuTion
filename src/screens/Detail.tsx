import type { ReactNode } from 'react'
import { BackLink, Card, Display, Note, PrimaryButton, GhostButton, Shell, Tag } from '../components/primitives'
import { screenPadding, useNarrow } from '../components/layout'
import { C } from '../theme'
import { won } from '../data/catalog'
import { treatmentImage } from '../data/treatmentImages'
import { useCopy, useLang } from '../i18n'
import { useCatalog } from '../i18n/catalog'
import { TREATMENT_FLOW } from '../i18n/treatmentFlow'
import { FILTER_TREATMENT_PREFIX, useStore, useTreatment } from '../state/store'
import './Detail.css'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="treatment-section"><h2>{title}</h2>{children}</section>
}
function Points({ items }: { items: string[] }) {
  return <ul className="treatment-points">{items.map((text, i) => <li key={i}>{text}</li>)}</ul>
}

export function Detail() {
  const { profile, go, setCommunityFilter } = useStore()
  const cat = useCatalog()
  const treatment = cat.treatment(useTreatment())
  const source = treatment.source!
  const copy = useCopy(TREATMENT_FLOW)
  const { lang } = useLang()
  const narrow = useNarrow()
  const image = treatmentImage(treatment.id)
  return (
    <main style={{ flex: 1, padding: screenPadding(narrow, 32, 80) }}>
      <Shell>
        <BackLink onClick={() => go('treatments')}>{copy.back}</BackLink>
        <div className="treatment-detail-layout">
          <article lang={lang}>
            <img className="treatment-detail-banner" src={image.src} alt={treatment.name} />
            <div style={{ marginTop: 28 }}><Tag>{source.category}</Tag></div>
            <div style={{ marginTop: 12 }}><Display size={narrow ? 32 : 42}>{treatment.name}</Display></div>
            <Section title={copy.effects}><p>{source.effects}</p></Section>
            <Section title={copy.overview}><p>{source.overview}</p></Section>
            <Section title={copy.advantages}><Points items={source.advantages} /></Section>
            <Section title={copy.recommended}><Points items={source.recommendedFor} /></Section>
            <Section title={copy.packages}>
              <div className="treatment-packages">
                {source.packages.map((item, i) => (
                  <Card key={i} style={{ padding: narrow ? 20 : 24 }}>
                    <h3>{item.name}</h3>
                    <p style={{ fontSize: 14 }}>{item.description}</p>
                    <div className="package-price">
                      {item.originalPrice !== null && <del>{won(item.originalPrice)}</del>}
                      <strong>{won(item.price)}</strong>
                      {item.vatExcluded && <span>{copy.vat}</span>}
                    </div>
                  </Card>
                ))}
              </div>
              <Note style={{ marginTop: 16 }}>{copy.priceNote}</Note>
            </Section>
            <Section title={copy.faq}>
              {source.faqs.map((faq, i) => (
                <details key={i} className="treatment-faq">
                  <summary>{faq.question}</summary><p>{faq.answer}</p>
                </details>
              ))}
            </Section>
            <Section title={copy.cautions}><Points items={source.cautions} /></Section>
          </article>
          <aside className="treatment-next">
            <Card style={{ padding: narrow ? 22 : 28 }}>
              <div style={{ fontSize: 13, color: C.bodyMuted }}>{copy.referencePrice}</div>
              <div className="treatment-reference-price">{cat.priceRangeIn(profile.districtKey, treatment.id)}</div>
              <Note style={{ marginTop: 12, marginBottom: 24 }}>{copy.priceNote}</Note>
              <PrimaryButton onClick={() => go('clinics')} full>{copy.clinics}</PrimaryButton>
              <div style={{ marginTop: 12 }}>
                <GhostButton onClick={() => { setCommunityFilter(`${FILTER_TREATMENT_PREFIX}${treatment.id}`); go('community') }} full>{copy.reviews}</GhostButton>
              </div>
            </Card>
          </aside>
        </div>
      </Shell>
    </main>
  )
}
