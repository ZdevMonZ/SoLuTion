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
import { Mark } from './TopNav'
import { Card, Dot, FieldLabel, Pressable, PrimaryButton } from './primitives'
import { columns, useNarrow } from './layout'
import { C, FONT_DISPLAY, FONT_MONO } from '../theme'
import { LANGUAGES } from '../data/languages'
import { CLINICS, TREATMENTS, clinicsIn } from '../data/catalog'
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
  return (
    <Pressable
      onClick={onClick}
      label="Close"
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
            Choose your language
          </div>
          <div style={{ marginTop: 8, fontSize: 14, color: C.bodyMuted }}>
            The community feed is scoped to this language.
          </div>
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
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: 18,
              borderRadius: 14,
              background: l.available ? C.chip : C.surfaceMuted,
              border: `1px solid ${l.available ? C.blue : C.rule}`,
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
                {l.available ? l.english : 'Not translated yet'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Backdrop>
  )
}

export function SignupModal() {
  const { closeModal, completeSignup, skipSignup, analysis } = useStore()
  const narrow = useNarrow()

  return (
    <Backdrop onClose={closeModal} width={920}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: columns(narrow, 'minmax(0,1fr) minmax(0,1fr)'),
        }}
      >
        <div
          style={{
            position: 'relative',
            padding: narrow ? '24px 20px' : 40,
            background: 'linear-gradient(170deg,#F7F9FC,#EFF4FB)',
            borderRight: narrow ? undefined : `1px solid ${C.rule}`,
            borderTop: narrow ? `1px solid ${C.rule}` : undefined,
            // Stacked on a phone, the form (and its close button) comes first.
            order: narrow ? 1 : undefined,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: -40,
              bottom: -60,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background:
                'radial-gradient(circle at 50% 50%, rgba(46,90,172,.14) 0%, rgba(143,184,232,.1) 45%, rgba(143,184,232,0) 72%)',
              animation: 'glowPulse 9s ease-in-out infinite',
            }}
          />
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: narrow ? 56 : 74,
                height: narrow ? 56 : 74,
                borderRadius: '50%',
                background: C.surface,
                border: `1px solid ${C.borderBlue}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: FONT_DISPLAY,
                fontSize: 24,
                fontWeight: 400,
                color: C.ink,
              }}
            >
              {analysis ? analysis.overallScore : <Mark size={30} />}
            </div>
            <div
              style={{
                marginTop: narrow ? 18 : 26,
                fontFamily: FONT_DISPLAY,
                fontSize: narrow ? 22 : 27,
                fontWeight: 400,
                lineHeight: 1.3,
                letterSpacing: '-.02em',
                color: C.ink,
              }}
            >
              Save your results and unlock treatment matches.
            </div>
            <div style={{ marginTop: 14, fontSize: 14.5, lineHeight: 1.75, color: C.body }}>
              Your reading stays available for the rest of your trip, and clinics near your district
              get matched to it.
            </div>
            <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'Keep this reading for the whole trip and compare a second one later.',
                'See per-clinic prices for the treatments matched to you.',
                'Earn points on visits and reviews, redeemable at partner clinics.',
              ].map((text) => (
                <div key={text} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ display: 'flex', marginTop: 2, color: C.blue }}>
                    <Icon path={PATHS.check} size={17} weight={2} />
                  </span>
                  <div style={{ flex: 1, fontSize: 14, lineHeight: 1.65, color: C.bodyFaint }}>
                    {text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: narrow ? '22px 20px' : 40, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 600, color: C.ink }}>
              Create your account
            </div>
            <CloseButton onClick={closeModal} />
          </div>

          <label style={{ marginTop: 24, display: 'block' }}>
            <FieldLabel>EMAIL</FieldLabel>
            <input
              type="email"
              placeholder="you@example.com"
              autoComplete="off"
              style={{
                marginTop: 9,
                width: '100%',
                height: 52,
                borderRadius: 11,
                border: `1px solid ${C.borderStrong}`,
                background: C.surface,
                padding: '0 16px',
                fontFamily: 'inherit',
                fontSize: 15,
                color: C.ink,
              }}
            />
          </label>
          <label style={{ marginTop: 16, display: 'block' }}>
            <FieldLabel>PASSWORD</FieldLabel>
            <input
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              style={{
                marginTop: 9,
                width: '100%',
                height: 52,
                borderRadius: 11,
                border: `1px solid ${C.borderStrong}`,
                background: C.surface,
                padding: '0 16px',
                fontFamily: 'inherit',
                fontSize: 15,
                color: C.ink,
              }}
            />
          </label>

          <div style={{ marginTop: 22 }}>
            <PrimaryButton onClick={completeSignup} full fontSize={16}>
              Create account
            </PrimaryButton>
          </div>
          {/*
            The prototype has no server. Saying so here is cheaper than a person
            discovering it after typing a password they use elsewhere.
          */}
          <div style={{ marginTop: 10, fontSize: 12, lineHeight: 1.6, color: C.muted }}>
            Prototype — no account is created and nothing you type is sent or stored.
          </div>

          <div style={{ margin: '22px 0 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <div style={{ fontSize: 12.5, color: C.muted }}>or continue with</div>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {['Google', 'Apple'].map((name) => (
              <Pressable
                key={name}
                onClick={completeSignup}
                className="btn-ghost"
                style={{
                  flex: 1,
                  height: 50,
                  borderRadius: 11,
                  border: `1px solid ${C.borderStrong}`,
                  background: C.surface,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: FONT_DISPLAY,
                  fontSize: 14.5,
                  fontWeight: 600,
                  color: C.inkSoft,
                }}
              >
                {name}
              </Pressable>
            ))}
          </div>

          <div style={{ flex: 1 }} />
          <Pressable
            onClick={skipSignup}
            className="link-quiet"
            style={{
              marginTop: 24,
              width: '100%',
              textAlign: 'center',
              fontSize: 13.5,
              color: C.muted,
              display: 'block',
            }}
          >
            Continue without an account
          </Pressable>
        </div>
      </div>
    </Backdrop>
  )
}

export function ComposerModal() {
  const { closeModal, submitPost, profile, selectedClinicId } = useStore()
  const treatment = useTreatment()
  const district = profile.districtKey ?? ''
  const localClinics = clinicsIn(district)
  const bookedClinic = CLINICS.find((c) => c.id === selectedClinicId)

  const [text, setText] = useState('')
  const [treatmentTag, setTreatmentTag] = useState(treatment.shortName)
  const [clinicTag, setClinicTag] = useState(
    bookedClinic?.name ?? localClinics[0]?.name ?? CLINICS[0].name,
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
          New post
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
            <div style={{ fontSize: 12, color: C.muted }}>Add photo</div>
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
            Photo upload is not wired up in this prototype — posts publish with text and tags.
          </div>
        </div>

        <textarea
          value={text}
          maxLength={MAX_POST}
          onChange={(e) => setText(e.target.value)}
          placeholder="What was the visit like? What changed, and how long did it take?"
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
              <FieldLabel>TREATMENT TAG</FieldLabel>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.blue }}>REQUIRED</div>
            </div>
            <select
              value={treatmentTag}
              onChange={(e) => setTreatmentTag(e.target.value)}
              style={selectStyle}
            >
              {TREATMENTS.map((t) => (
                <option key={t.id} value={t.shortName}>
                  {t.shortName}
                </option>
              ))}
            </select>
          </label>
          <label>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <FieldLabel>CLINIC TAG</FieldLabel>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.blue }}>REQUIRED</div>
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
              Because you booked this clinic through Solution, your post gets a Verified Visit badge.
            </div>
          </Card>
        ) : (
          <div style={{ marginTop: 22, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Dot />
            <div style={{ flex: 1, fontSize: 13, lineHeight: 1.7, color: C.muted }}>
              Verified Visit is added to posts about a clinic you booked through Solution.
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
          Cancel
        </Pressable>
        <PrimaryButton
          onClick={() => submitPost(text.trim(), treatmentTag, clinicTag)}
          disabled={!canPublish}
          height={48}
          padding={26}
          fontSize={15}
        >
          Publish post
        </PrimaryButton>
      </div>
    </Backdrop>
  )
}
