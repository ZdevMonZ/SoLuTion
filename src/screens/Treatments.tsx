/** Compact browsing, with the same diagnosis categories on mobile and desktop. */
import { useEffect, useRef, useState } from 'react'
import { Icon, PATHS } from '../components/Icons'
import { Note, Pressable, Shell } from '../components/primitives'
import type { Treatment } from '../data/catalog'
import { TREATMENT_FLOW } from '../i18n/treatmentFlow'
import { treatmentImage } from '../data/treatmentImages'
import { useStrings } from '../data/strings'
import { useCopy, useLang } from '../i18n'
import { useCatalog } from '../i18n/catalog'
import { treatmentText } from '../i18n/treatmentContent'
import { TREATMENT_LIST } from '../i18n/treatments'
import { TREATMENT_BROWSE } from '../i18n/treatmentBrowse'
import { matchesLeadingConcern } from '../analysis/treatmentRecommendations'
import { TREATMENT_CONCERN_COPY } from '../i18n/treatmentConcerns'
import { classificationFor, concernTier, filterTreatments, TREATMENT_BROWSE_CATEGORIES, CLASSIFICATION_REVIEWED_AT, CLASSIFICATION_SOURCES, type BrowseFilter } from '../data/treatmentConcerns'
import { useStore } from '../state/store'
import './Treatments.css'

const VIEW_ICONS = {
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  list: 'M8 5h13M8 12h13M8 19h13M3 5h.01M3 12h.01M3 19h.01',
  search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  info: 'M12 11v6M12 7h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
}

export function Treatments() {
  const { analysis, recommendations, profile, savedTreatmentIds, selectTreatment, toggleSavedTreatment, go } = useStore()
  const cat = useCatalog()
  const { UI, categoryLabel } = useStrings()
  const { lang } = useLang()
  const concerns = useCopy(TREATMENT_CONCERN_COPY)
  const flow = useCopy(TREATMENT_FLOW)
  const copy = useCopy(TREATMENT_LIST)
  const browse = useCopy(TREATMENT_BROWSE)
  const [filter, setFilter] = useState<BrowseFilter>('all')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [savedOnly, setSavedOnly] = useState(false)
  const [sort, setSort] = useState('default')
  const guide = useRef<HTMLDialogElement>(null)
  const search = useRef<HTMLInputElement>(null)
  // The bundled Android host sends Back through this event before changing pages.
  useEffect(() => {
    const closeGuide = (event: Event) => {
      if (!guide.current?.open) return
      event.preventDefault()
      event.stopImmediatePropagation()
      guide.current.close()
    }
    window.addEventListener('solution:back', closeGuide, true)
    return () => window.removeEventListener('solution:back', closeGuide, true)
  }, [])
  const matched = recommendations.length > 0
  const list: Treatment[] = matched ? recommendations.map((t) => cat.treatment(t)) : cat.TREATMENTS
  const label = (key: BrowseFilter) => key === 'all' ? copy.all : categoryLabel(key)
  const priceRange = (t: Treatment) => cat.priceRangeIn(profile.districtKey, t.id)
  const startPrice = (t: Treatment) => priceRange(t).split('–')[0]
  const priceValue = (t: Treatment) => Number(startPrice(t).replace(/[^\d]/g, '')) || Infinity
  const normalizedQuery = query.trim().toLocaleLowerCase(lang)
  const shown = filterTreatments(list, filter).filter((t) => {
    if (savedOnly && !savedTreatmentIds.includes(t.id)) return false
    const rule = classificationFor(t.id)
    const terms = [t.name, t.cardSummary, ...rule.primary.map((key) => concerns.labels[key]), ...TREATMENT_BROWSE_CATEGORIES.filter((key) => concernTier(t.id, key) < 3).map(categoryLabel)]
    return !normalizedQuery || terms.join(' ').toLocaleLowerCase(lang).includes(normalizedQuery)
  })
  if (sort === 'price') shown.sort((a, b) => priceValue(a) - priceValue(b))
  if (sort === 'name') shown.sort((a, b) => a.name.localeCompare(b.name, lang))
  const related = matched ? list.find((t) => matchesLeadingConcern(t.id, analysis))?.id : undefined
  const sourceIds = [...new Set(shown.flatMap((t) => classificationFor(t.id).sourceIds))]
  const open = (id: string) => { selectTreatment(id); go('detail') }
  const reset = () => { setFilter('all'); setQuery(''); setSavedOnly(false) }

  return (
    <main className="treatments-page" lang={lang}>
      <Shell>
        <header className="treatment-heading">
          <h1>{matched ? UI.treatmentsTitle : flow.browse}</h1>
          <div className="treatment-heading-tools">
            <Pressable className="treatment-icon-button" onClick={() => setSavedOnly(!savedOnly)} pressed={savedOnly} label={browse.saved}>
              <Icon path={PATHS.bookmark} size={20} />
            </Pressable>
            <button type="button" className="treatment-icon-button" aria-label={browse.search} aria-expanded={searchOpen} aria-controls="treatment-search"
              onClick={() => { setSearchOpen(!searchOpen); if (searchOpen) setQuery(''); else requestAnimationFrame(() => search.current?.focus()) }}>
              <Icon path={VIEW_ICONS.search} size={20} />
            </button>
          </div>
        </header>
        <div id="treatment-search" className="treatment-search" hidden={!searchOpen}>
          <Icon path={VIEW_ICONS.search} size={18} />
          <input ref={search} type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={browse.placeholder} aria-label={browse.search} />
          <Pressable onClick={() => { setSearchOpen(false); setQuery('') }}>{browse.close}</Pressable>
        </div>
        <section className="treatment-concerns" aria-label={browse.heading}>
          <div className="treatment-category-heading">
            <h2>{browse.heading}</h2>
            <Pressable onClick={() => guide.current?.showModal()} label={browse.info}>{browse.info}<Icon path={VIEW_ICONS.info} size={14} /></Pressable>
          </div>
          <div className="treatment-concern-filters">
            {(['all', ...TREATMENT_BROWSE_CATEGORIES] as BrowseFilter[]).map((key) => (
              <Pressable key={key} onClick={() => setFilter(key)} pressed={filter === key} className="treatment-concern-filter">
                <span>{label(key)}</span><span className="concern-count">{filterTreatments(list, key).length}</span>
              </Pressable>
            ))}
          </div>
        </section>
        <div className="treatment-toolbar">
          <div className="treatment-result-count" aria-live="polite" aria-atomic="true"><span>{savedOnly ? browse.saved : label(filter)}</span><strong>{shown.length}</strong></div>
          <div className="treatment-toolbar-tools">
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label={browse.sort}>
              <option value="default">{browse.defaultSort}</option><option value="price">{browse.priceSort}</option><option value="name">{browse.nameSort}</option>
            </select>
            <div className="treatment-view-toggle">
              {(['grid', 'list'] as const).map((mode) => <Pressable key={mode} onClick={() => setView(mode)} pressed={view === mode} label={browse[mode]}><Icon path={VIEW_ICONS[mode]} size={17} /></Pressable>)}
            </div>
          </div>
        </div>
        {shown.length === 0 && <div className="treatment-empty"><h3>{browse.empty}</h3><p>{browse.emptyBody}</p><Pressable onClick={reset}>{concerns.browseAll} →</Pressable></div>}
        <div className={`treatment-grid${view === 'list' ? ' is-list' : ''}`}>
          {shown.map((t, i) => {
            const saved = savedTreatmentIds.includes(t.id)
            const top = filter === 'all' && t.id === related
            const image = treatmentImage(t.id)
            const rule = classificationFor(t.id)
            const conditional = rule.manualOnly || (filter !== 'all' && concernTier(t.id, filter) === 2)
            const purpose = rule.primary[0]
            const purposeLabel = TREATMENT_BROWSE_CATEGORIES.some((key) => key === purpose) ? categoryLabel(purpose as Exclude<BrowseFilter, 'all'>) : concerns.labels[purpose]
            return (
              <article key={t.id} className="treatment-card">
                <div className="treatment-photo">
                  <Pressable onClick={() => open(t.id)} label={`${t.name} · ${copy.details}`} className="treatment-photo-open">
                    <img src={image.src} alt="" width={400} height={400} loading={i < 4 ? 'eager' : 'lazy'} decoding="async"
                      style={{ objectPosition: image.position, objectFit: image.fit, transform: image.scale ? `scale(${image.scale})` : undefined, transformOrigin: image.position }} />
                  </Pressable>
                  {top && <span className="treatment-top-match">{concerns.related}</span>}
                </div>
                <Pressable onClick={() => toggleSavedTreatment(t.id)} label={saved ? copy.remove(t.name) : copy.save(t.name)} pressed={saved} className="treatment-save">
                  <Icon path={saved ? PATHS.check : PATHS.bookmark} size={18} />
                </Pressable>
                <Pressable onClick={() => open(t.id)} className="treatment-body" label={`${t.name} · ${copy.details}`}>
                  <span className="treatment-purpose">{purposeLabel}</span>
                  <h3 className="treatment-title">{t.name}</h3>
                  <span className="treatment-price">{startPrice(t) === '—' ? flow.onConsultation : browse.from(startPrice(t))}</span>
                  {conditional && <span className="treatment-conditional">{concerns.conditional}</span>}
                  <span className="treatment-summary">{t.cardSummary}</span>
                </Pressable>
              </article>
            )
          })}
        </div>
        <p className="treatment-price-caption">{browse.reference}</p>
        <details className="treatment-source-list">
          <summary>{concerns.sources} · {concerns.reviewed(CLASSIFICATION_REVIEWED_AT)}</summary>
          <p>{concerns.sourcesNote}</p>
          <ul>{sourceIds.map((id) => <li key={id}><a href={CLASSIFICATION_SOURCES[id].url} target="_blank" rel="noreferrer">{treatmentText(CLASSIFICATION_SOURCES[id].title, lang)} ↗</a></li>)}</ul>
        </details>
        <Note style={{ marginTop: 20, maxWidth: 720 }}>{flow.priceNote}</Note>
        <dialog ref={guide} className="treatment-guide" aria-labelledby="treatment-guide-title" onClick={(e) => { if (e.target === guide.current) guide.current.close() }}>
          <h2 id="treatment-guide-title">{label(filter)} · {browse.info}</h2>
          <p>{filter === 'all' ? browse.allGuide : concerns.descriptions[filter]}</p>
          <p>{concerns.allDescription}</p>
          {filter === 'all' && matched && !related && <p>{concerns.topNeedsConsultation}</p>}
          <form method="dialog"><button className="treatment-guide-close">{browse.close}</button></form>
        </dialog>
      </Shell>
    </main>
  )
}
