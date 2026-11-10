/**
 * The three overlays: the language picker, the sign-up gate, and the post
 * composer.
 *
 * All three close on the backdrop and on Escape, and none of them is a route —
 * the store keeps `modal` beside `page` so a dismissed overlay always returns the
 * screen underneath exactly as it was.
 */
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Icon, PATHS } from './Icons'
import { Card, Dot, FieldLabel, Pressable, PrimaryButton } from './primitives'
import { columns, useNarrow } from './layout'
import { C, FONT_DISPLAY, FONT_MONO } from '../theme'
import { LANGUAGES } from '../data/languages'
import { useCopy, useLang } from '../i18n'
import { useCatalog } from '../i18n/catalog'
import { TREATMENT_FLOW } from '../i18n/treatmentFlow'
import { MODALS } from '../i18n/modals'
import { useStore, useTreatment } from '../state/store'

const MAX_POST = 1000

function Backdrop({ onClose, children, width }: { onClose: () => void; children: ReactNode; width: number }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  const narrow = useNarrow()

  return (
    <div
      onClick={onClose}
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'rgba(11,30,61,.44)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        padding: narrow ? 12 : 32,
        overflow: 'auto',
      }}
    >
      <div
        // The click that opened this modal must not also close it, and a click
        // inside the sheet is not a click on the backdrop.
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal
        style={{
          // Auto margins centre the sheet, and unlike flex centring they let a
          // sheet taller than a phone's screen scroll from its top edge.
          margin: 'auto',
          width: '100%',
          maxWidth: width,
          borderRadius: narrow ? 18 : 22,
          background: C.surface,
          border: `1px solid ${C.border}`,
          boxShadow: '0 40px 80px rgba(11,30,61,.28)',
          animation: 'riseIn .18s ease-out',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  )
}

function CloseButton({ onClick }: { onClick: () => void }) {
  const copy = useCopy(MODALS)
  return (
    <Pressable
      onClick={onClick}
      label={copy.close}
      className="btn-close"
      style={{
        width: 36,
        height: 36,
        flex: 'none',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        color: C.muted,
      }}
    >
      ×
    </Pressable>
  )
}

export function LanguageModal() {
  const { closeModal } = useStore()
  const { lang, setLang } = useLang()
  const copy = useCopy(MODALS).language
  const narrow = useNarrow()
  return (
    <Backdrop onClose={closeModal} width={560}>
      <div
        style={{
          padding: narrow ? '22px 20px 0' : '28px 32px 0',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 20,
        }}
      >
        <div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 600, color: C.ink }}>
            {copy.title}
          </div>
          <div style={{ marginTop: 8, fontSize: 14, color: C.bodyMuted }}>{copy.subtitle}</div>
        </div>
        <CloseButton onClick={closeModal} />
      </div>
      <div
        style={{
          padding: narrow ? '20px 20px 22px' : '24px 32px 32px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}
      >
        {LANGUAGES.map((l) => (
          <div
            key={l.code}
            className={l.available ? 'opt' : 'is-disabled'}
            aria-disabled={!l.available}
            aria-current={l.lang === lang}
            onClick={
              l.available
                ? () => {
                    setLang(l.lang)
                    closeModal()
                  }
                : undefined
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: 18,
              borderRadius: 14,
              cursor: l.available ? 'pointer' : undefined,
              background: l.available ? C.chip : C.surfaceMuted,
              border: `${l.lang === lang ? 2 : 1}px solid ${l.available ? C.blue : C.rule}`,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                flex: 'none',
                borderRadius: 11,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: FONT_DISPLAY,
                fontSize: 16,
                fontWeight: 600,
                background: l.available ? C.surface : C.chipAlt,
                color: l.available ? C.blue : C.faint,
              }}
            >
              {l.glyph}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 16,
                  fontWeight: 600,
                  color: l.available ? C.ink : C.faint,
                }}
              >
                {l.native}
              </div>
              <div style={{ marginTop: 3, fontSize: 12.5, color: C.muted }}>
                {l.available ? copy.names[l.lang] : copy.notTranslated}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Backdrop>
  )
}

export function SignupModal() {
  const { closeModal, completeSignup, pendingPage } = useStore()
  const copy = useCopy(MODALS).signup
  const flow = useCopy(TREATMENT_FLOW)
  const narrow = useNarrow()
  return (
    <Backdrop onClose={closeModal} width={480}>
      <form style={{ padding: narrow ? 24 : 36 }} onSubmit={(event) => { event.preventDefault(); completeSignup() }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 25, lineHeight: 1.4, color: C.ink }}>
            {pendingPage === 'community' ? flow.reviewTitle : flow.joinTitle}
          </h2>
          <CloseButton onClick={closeModal} />
        </div>
        {pendingPage === 'community' && <p style={{ color: C.bodyMuted, lineHeight: 1.7 }}>{flow.reviewBody}</p>}
        <label style={{ display: 'block', marginTop: 24 }}>
          <FieldLabel>{copy.emailLabel}</FieldLabel>
          <input autoFocus required type="email" autoComplete="email" name="email" placeholder="you@example.com"
            style={{ marginTop: 9, width: '100%', height: 50, borderRadius: 10, border: `1px solid ${C.borderStrong}`, padding: '0 14px', font: 'inherit' }} />
        </label>
        <label style={{ display: 'block', marginTop: 18 }}>
          <FieldLabel>{copy.passwordLabel}</FieldLabel>
          <input required type="password" minLength={8} autoComplete="new-password" name="password" placeholder={flow.passwordHint}
            style={{ marginTop: 9, width: '100%', height: 50, borderRadius: 10, border: `1px solid ${C.borderStrong}`, padding: '0 14px', font: 'inherit' }} />
        </label>
        <p style={{ fontSize: 12, lineHeight: 1.6, color: C.bodyMuted }}>{flow.demo}</p>
        <button type="submit" className="btn-primary" style={{ width: '100%', minHeight: 50, padding: 12, border: 0, borderRadius: 10, background: C.blue, color: '#fff', font: 'inherit', fontWeight: 600, cursor: 'pointer' }}>{flow.join}</button>
        <Pressable onClick={closeModal} style={{ width: '100%', textAlign: 'center', padding: '18px 0 0', color: C.bodyMuted }}>{flow.later}</Pressable>
      </form>
    </Backdrop>
  )
}

export function ComposerModal() {
  const { closeModal, submitPost, profile, selectedClinicId } = useStore()
  const copy = useCopy(MODALS).composer
  // Tags are the names as this page shows them; the store reads a caption in any
  // language back to the ids its filters run on.
  const cat = useCatalog()
  const treatment = cat.treatment(useTreatment())
  const district = profile.districtKey ?? ''
  const localClinics = cat.clinicsIn(district)
  const bookedClinic = cat.clinicById(selectedClinicId)

  const [text, setText] = useState('')
  const [treatmentTag, setTreatmentTag] = useState(treatment.shortName)
  const [clinicTag, setClinicTag] = useState(
    bookedClinic?.name ?? localClinics[0]?.name ?? cat.CLINICS[0].name,
  )

  // A post with no words is not a post; the button says so rather than failing
  // silently on the click.
  const canPublish = text.trim().length > 0
  const verified = bookedClinic?.name === clinicTag
  const narrow = useNarrow()

  const selectStyle = {
    marginTop: 10,
    width: '100%',
    height: 50,
    borderRadius: 11,
    border: `1px solid ${C.blue}`,
    background: C.surface,
    padding: '0 12px',
    fontFamily: 'inherit',
    fontSize: 14.5,
    color: C.ink,
  }

  return (
    <Backdrop onClose={closeModal} width={680}>
      <div
        style={{
          padding: narrow ? '18px 20px' : '26px 32px',
          borderBottom: `1px solid ${C.borderFaint}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 600, color: C.ink }}>
          {copy.title}
        </div>
        <CloseButton onClick={closeModal} />
      </div>

      <div style={{ padding: narrow ? '20px' : '28px 32px' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div
            className="is-disabled"
            style={{
              width: 116,
              height: 116,
              borderRadius: 14,
              border: `1px dashed ${C.borderStrong}`,
              background: C.surfaceFaint,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 300, color: C.faint }}>+</div>
            <div style={{ fontSize: 12, color: C.muted }}>{copy.addPhoto}</div>
          </div>
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              padding: '0 4px',
              fontSize: 12.5,
              lineHeight: 1.7,
              color: C.muted,
            }}
          >
            {copy.photoHint}
          </div>
        </div>

        <textarea
          value={text}
          maxLength={MAX_POST}
          onChange={(e) => setText(e.target.value)}
          placeholder={copy.bodyPlaceholder}
          style={{
            marginTop: 24,
            width: '100%',
            minHeight: 132,
            padding: '18px 20px',
            borderRadius: 14,
            border: `1px solid ${C.borderStrong}`,
            background: C.surface,
            fontFamily: 'inherit',
            fontSize: 15,
            lineHeight: 1.75,
            color: C.body,
            resize: 'vertical',
          }}
        />
        <div style={{ marginTop: 8, fontSize: 12, color: C.faint, fontFamily: FONT_MONO }}>
          {text.length} / {MAX_POST}
        </div>

        <div
          style={{
            marginTop: 20,
            display: 'grid',
            gridTemplateColumns: columns(narrow, '1fr 1fr'),
            gap: 16,
          }}
        >
          <label>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <FieldLabel>{copy.treatmentTag}</FieldLabel>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.blue }}>{copy.required}</div>
            </div>
            <select
              value={treatmentTag}
              onChange={(e) => setTreatmentTag(e.target.value)}
              style={selectStyle}
            >
              {cat.TREATMENTS.map((t) => (
                <option key={t.id} value={t.shortName}>
                  {t.shortName}
                </option>
              ))}
            </select>
          </label>
          <label>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <FieldLabel>{copy.clinicTag}</FieldLabel>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.blue }}>{copy.required}</div>
            </div>
            <select
              value={clinicTag}
              onChange={(e) => setClinicTag(e.target.value)}
              style={selectStyle}
            >
              {localClinics.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/*
          The badge is earned by having booked that clinic here, so the notice only
          appears when it is true. Promising it unconditionally would make the badge
          mean nothing.
        */}
        {verified ? (
          <Card
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
            <span style={{ display: 'flex', marginTop: 1, color: C.blue }}>
              <Icon path={PATHS.verified} size={19} />
            </span>
            <div style={{ flex: 1, fontSize: 13.5, lineHeight: 1.7, color: C.inkSoft }}>
              {copy.verifiedNotice}
            </div>
          </Card>
        ) : (
          <div style={{ marginTop: 22, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Dot />
            <div style={{ flex: 1, fontSize: 13, lineHeight: 1.7, color: C.muted }}>
              {copy.verifiedHint}
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          padding: narrow ? '16px 20px 20px' : '20px 32px 26px',
          borderTop: `1px solid ${C.borderFaint}`,
          display: 'flex',
          gap: 12,
          justifyContent: 'flex-end',
        }}
      >
        <Pressable
          onClick={closeModal}
          className="btn-ghost"
          style={{
            height: 48,
            padding: '0 22px',
            borderRadius: 10,
            border: `1px solid ${C.borderStrong}`,
            background: C.surface,
            display: 'flex',
            alignItems: 'center',
            fontFamily: FONT_DISPLAY,
            fontSize: 14.5,
            fontWeight: 600,
            color: C.inkSoft,
          }}
        >
          {copy.cancel}
        </Pressable>
        <PrimaryButton
          onClick={() => submitPost(text.trim(), treatmentTag, clinicTag)}
          disabled={!canPublish}
          height={48}
          padding={26}
          fontSize={15}
        >
          {copy.publish}
        </PrimaryButton>
      </div>
    </Backdrop>
  )
}
