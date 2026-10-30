/**
 * The body model on the health result: a standing figure drawn as a cloud of
 * points, turning slowly, with the organs behind flagged results glowing.
 *
 * It is built here rather than loaded. The figure is a dozen ellipsoids, tubes and
 * one lofted torso, sampled into points by surface area with a fixed seed, so it
 * is the same figure on every visit, costs no download and needs no 3D library —
 * a perspective projection of ~6,500 points is a few hundred microseconds a frame
 * on a 2D canvas.
 *
 * Frame: metres, y up from the soles, the figure facing +z (toward the viewer at
 * rest), so the figure's own left is +x. The liver is therefore at -x.
 *
 * The canvas is a picture; the condition list beside it is the real control. A
 * click on a glow selects that condition as a shortcut, and a drag turns the figure.
 */
import { useEffect, useLayoutEffect, useRef } from 'react'
import { HEALTH } from '../theme'
import type { ConditionId, Level, OrganId } from '../health/items'

type V3 = [number, number, number]

export interface BodyFlag {
  id: ConditionId
  organ: OrganId
  level: Level
}

/** Where each organ sits. Kidneys are two, and at the back. */
const ORGANS: Record<OrganId, V3[]> = {
  heart: [[0.035, 1.3, 0.05]],
  // The carotid, at the side of the neck: where plaque from high lipids is looked for.
  vessels: [[0.045, 1.5, 0.03]],
  pancreas: [[0.03, 1.13, 0.03]],
  liver: [[-0.075, 1.18, 0.04]],
  kidneys: [
    [-0.065, 1.08, -0.06],
    [0.065, 1.08, -0.06],
  ],
  // The inside of the elbow, where blood is drawn.
  blood: [[0.235, 1.13, 0.035]],
  abdomen: [[0, 1.0, 0.09]],
}

/** The turn that shows an organ best: the kidneys are seen from behind. */
const FACING: Partial<Record<OrganId, number>> = { kidneys: Math.PI, blood: -0.5, liver: 0.35 }

// --- The figure. ---

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Part {
  area: number
  sample: (r: () => number) => V3
}

function ellipsoid(c: V3, a: number, b: number, d: number): Part {
  const p = 1.6
  const area = 4 * Math.PI * (((a * b) ** p + (a * d) ** p + (b * d) ** p) / 3) ** (1 / p)
  return {
    area,
    sample: (r) => {
      const z = 2 * r() - 1
      const t = 2 * Math.PI * r()
      const s = Math.sqrt(1 - z * z)
      return [c[0] + a * s * Math.cos(t), c[1] + b * z, c[2] + d * s * Math.sin(t)]
    },
  }
}

function tube(p: V3, q: V3, rp: number, rq: number): Part {
  const axis: V3 = [q[0] - p[0], q[1] - p[1], q[2] - p[2]]
  const len = Math.hypot(...axis)
  const n: V3 = [axis[0] / len, axis[1] / len, axis[2] / len]
  // Any vector not parallel to the axis gives a perpendicular pair.
  const ref: V3 = Math.abs(n[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]
  const u = norm(cross(n, ref))
  const w = cross(n, u)
  return {
    area: Math.PI * (rp + rq) * len,
    sample: (r) => {
      const t = r()
      const a = 2 * Math.PI * r()
      const rad = rp + (rq - rp) * t
      const cos = Math.cos(a) * rad
      const sin = Math.sin(a) * rad
      return [
        p[0] + axis[0] * t + u[0] * cos + w[0] * sin,
        p[1] + axis[1] * t + u[1] * cos + w[1] * sin,
        p[2] + axis[2] * t + u[2] * cos + w[2] * sin,
      ]
    },
  }
}

/** Elliptical cross-sections stacked up y: [y, half-width, half-depth]. */
function loft(keys: [number, number, number][]): Part[] {
  return keys.slice(1).map((k, i) => {
    const [y0, x0, z0] = keys[i]
    const [y1, x1, z1] = k
    return {
      area: (Math.PI * (x0 + z0 + x1 + z1)) / 2 * Math.hypot(y1 - y0, (x1 - x0) * 0.5),
      sample: (r) => {
        const t = r()
        const a = 2 * Math.PI * r()
        return [(x0 + (x1 - x0) * t) * Math.cos(a), y0 + (y1 - y0) * t, (z0 + (z1 - z0) * t) * Math.sin(a)]
      },
    }
  })
}

const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const norm = (a: V3): V3 => {
  const l = Math.hypot(...a)
  return [a[0] / l, a[1] / l, a[2] / l]
}

/** Both sides of a limb from the left one's description. */
const mirrored = (make: (s: 1 | -1) => Part[]): Part[] => [...make(1), ...make(-1)]

function buildFigure(count: number): Float32Array {
  const parts: Part[] = [
    ellipsoid([0, 1.635, 0.005], 0.082, 0.108, 0.098),
    tube([0, 1.47, -0.005], [0, 1.56, 0], 0.05, 0.046),
    ...loft([
      [0.8, 0.07, 0.07],
      [0.86, 0.16, 0.1],
      [0.96, 0.158, 0.1],
      [1.06, 0.138, 0.092],
      [1.2, 0.155, 0.1],
      [1.33, 0.178, 0.108],
      [1.42, 0.19, 0.095],
      [1.47, 0.07, 0.06],
    ]),
    ...mirrored((s) => [
      ellipsoid([0.19 * s, 1.415, 0], 0.055, 0.05, 0.055),
      tube([0.2 * s, 1.41, 0], [0.245 * s, 1.13, -0.005], 0.046, 0.038),
      tube([0.245 * s, 1.13, -0.005], [0.285 * s, 0.87, 0.025], 0.036, 0.027),
      ellipsoid([0.295 * s, 0.795, 0.03], 0.024, 0.062, 0.04),
      tube([0.088 * s, 0.86, 0], [0.098 * s, 0.48, 0.012], 0.078, 0.052),
      tube([0.098 * s, 0.48, 0.012], [0.1 * s, 0.085, -0.012], 0.05, 0.032),
      ellipsoid([0.104 * s, 0.035, 0.045], 0.042, 0.03, 0.105),
    ]),
  ]
  const total = parts.reduce((s, p) => s + p.area, 0)
  const r = rng(20261030)
  const out = new Float32Array(count * 3)
  let k = 0
  parts.forEach((part, i) => {
    const n = i === parts.length - 1 ? count - k : Math.round((part.area / total) * count)
    for (let j = 0; j < n && k < count; j++, k++) {
      const [x, y, z] = part.sample(r)
      // A little scatter, so the surface reads as a cloud rather than a shell.
      out[k * 3] = x + (r() - 0.5) * 0.008
      out[k * 3 + 1] = y + (r() - 0.5) * 0.008
      out[k * 3 + 2] = z + (r() - 0.5) * 0.008
    }
  })
  return out
}

const POINTS = 6500
let figure: Float32Array | null = null
const getFigure = () => (figure ??= buildFigure(POINTS))

// --- Drawing. ---

const LEVEL_COLOR = ['#5B8FD4', HEALTH.borderline, HEALTH.attention] as const
/** Distance from an organ within which the surface lights up. */
const GLOW_RADIUS = 0.08
const ALPHA_STEPS = 5
const DISTANCE = 4
const MID_Y = 0.88

const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a.toFixed(3)})`
}

export function BodyCloud({
  flags,
  selected,
  onSelect,
  height,
  label,
  selectedLabel,
}: {
  flags: BodyFlag[]
  selected: ConditionId | null
  onSelect: (id: ConditionId) => void
  height: number
  /** The picture's accessible description. */
  label: string
  /** Drawn beside the selected glow. */
  selectedLabel: string | null
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  // The loop reads these; a prop change must not restart it (and reset the turn).
  const live = useRef({ flags, selected, onSelect, selectedLabel })
  useLayoutEffect(() => {
    live.current = { flags, selected, onSelect, selectedLabel }
  })

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const pts = getFigure()
    const n = pts.length / 3
    const sx = new Float32Array(n)
    const sy = new Float32Array(n)
    const bucket = new Uint8Array(n)
    /** Per point: index into the flags it glows for, or -1. Rebuilt when the flags change. */
    let tag = new Int8Array(n).fill(-1)
    let tagKey = ''

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let angle = 0
    let target: number | null = null
    let lastSelected: ConditionId | null = null
    let idleUntil = 0
    let drag: { x: number; angle: number; moved: boolean } | null = null
    let width = 0
    let dpr = 1
    let raf = 0
    let last = performance.now()
    /** Where each glow was drawn this frame, for hit-testing a click. */
    let spots: { id: ConditionId; x: number; y: number }[] = []

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1)
      width = wrap.clientWidth
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    const retag = (list: BodyFlag[]) => {
      const key = list.map((f) => `${f.id}${f.level}`).join()
      if (key === tagKey) return
      tagKey = key
      tag = new Int8Array(n).fill(-1)
      const best = new Float32Array(n)
      list.forEach((flag, fi) => {
        if (flag.level === 0) return
        for (const [ox, oy, oz] of ORGANS[flag.organ]) {
          for (let i = 0; i < n; i++) {
            const d = Math.hypot(pts[i * 3] - ox, pts[i * 3 + 1] - oy, pts[i * 3 + 2] - oz)
            const w = 1 - d / GLOW_RADIUS
            if (w > best[i]) {
              best[i] = w
              tag[i] = fi
            }
          }
        }
      })
    }

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const { flags: list, selected: sel, selectedLabel: selLabel } = live.current
      retag(list)

      // Turning: toward the selected organ when the selection changes, otherwise a
      // slow spin — or, with a selection, a slow sway around its best view.
      if (sel !== lastSelected) {
        lastSelected = sel
        const organ = list.find((f) => f.id === sel)?.organ
        if (organ) {
          const want = FACING[organ] ?? 0
          // The nearest turn that lands on `want`, not a full spin back to it.
          target = want + Math.round((angle - want) / (2 * Math.PI)) * 2 * Math.PI
        } else target = null
      }
      if (!drag && now > idleUntil) {
        if (target !== null) {
          angle += (target - angle) * Math.min(1, dt * 4)
          if (Math.abs(target - angle) < 0.002 && !reduced) {
            target = null
            idleUntil = now
          }
        } else if (!reduced) {
          const organ = list.find((f) => f.id === sel)?.organ
          if (organ) {
            const base = FACING[organ] ?? 0
            const centre = base + Math.round((angle - base) / (2 * Math.PI)) * 2 * Math.PI
            angle = centre + Math.sin(now / 2400) * 0.35
          } else angle += dt * 0.32
        }
      }

      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)
      const scale = (h * 0.86) / 1.75
      const cx = w / 2
      const cy = h / 2
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      const project = (x: number, y: number, z: number) => {
        const rx = x * cos + z * sin
        const rz = -x * sin + z * cos
        const f = DISTANCE / (DISTANCE - rz)
        return { x: cx + rx * scale * f, y: cy - (y - MID_Y) * scale * f, z: rz }
      }

      // Glows first, under the points.
      spots = []
      const pulse = reduced ? 0.5 : 0.5 + 0.5 * Math.sin(now / 420)
      list.forEach((flag) => {
        if (flag.level === 0) return
        const on = flag.id === sel
        const color = LEVEL_COLOR[flag.level]
        ORGANS[flag.organ].forEach((o, oi) => {
          const p = project(o[0], o[1], o[2])
          const behind = p.z < -0.02 ? 0.45 : 1
          const r = (on ? 34 : 24) * dpr * (0.9 + 0.25 * pulse)
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r)
          g.addColorStop(0, rgba(color, (on ? 0.55 : 0.4) * behind))
          g.addColorStop(1, rgba(color, 0))
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
          ctx.fill()
          if (on) {
            ctx.strokeStyle = rgba(color, 0.9 * behind)
            ctx.lineWidth = 1.5 * dpr
            ctx.beginPath()
            ctx.arc(p.x, p.y, (14 + 4 * pulse) * dpr, 0, Math.PI * 2)
            ctx.stroke()
          }
          if (oi === 0) spots.push({ id: flag.id, x: p.x / dpr, y: p.y / dpr })
        })
      })

      // The points, bucketed by colour and depth so each bucket is one fill.
      for (let i = 0; i < n; i++) {
        const p = project(pts[i * 3], pts[i * 3 + 1], pts[i * 3 + 2])
        sx[i] = p.x
        sy[i] = p.y
        const depth = Math.min(1, Math.max(0, (p.z + 0.2) / 0.4))
        const step = Math.min(ALPHA_STEPS - 1, Math.floor(depth * ALPHA_STEPS))
        bucket[i] = (tag[i] + 1) * ALPHA_STEPS + step
      }
      const groups = (list.length + 1) * ALPHA_STEPS
      for (let b = 0; b < groups; b++) {
        const fi = Math.floor(b / ALPHA_STEPS) - 1
        const step = b % ALPHA_STEPS
        const flag = fi >= 0 ? list[fi] : null
        const color = flag ? LEVEL_COLOR[flag.level] : HEALTH.body
        const alpha = (flag ? 0.45 : 0.16) + (step / (ALPHA_STEPS - 1)) * (flag ? 0.5 : 0.5)
        const size = (flag ? 1.9 : 1.4 + step * 0.12) * dpr
        ctx.fillStyle = rgba(color, alpha)
        ctx.beginPath()
        for (let i = 0; i < n; i++) if (bucket[i] === b) ctx.rect(sx[i], sy[i], size, size)
        ctx.fill()
      }

      // The selected condition's name, beside its glow, on a white pill.
      const spot = spots.find((s) => s.id === sel)
      if (spot && selLabel) {
        ctx.font = `600 ${12.5 * dpr}px system-ui, sans-serif`
        const tw = ctx.measureText(selLabel).width
        const padX = 9 * dpr
        const bh = 24 * dpr
        const right = spot.x * dpr + 22 * dpr + tw + padX * 2 < w
        const bx = right ? spot.x * dpr + 22 * dpr : spot.x * dpr - 22 * dpr - tw - padX * 2
        const by = spot.y * dpr - bh / 2
        ctx.fillStyle = 'rgba(255,255,255,.94)'
        ctx.strokeStyle = 'rgba(20,32,58,.12)'
        ctx.lineWidth = dpr
        ctx.beginPath()
        ctx.roundRect(bx, by, tw + padX * 2, bh, 7 * dpr)
        ctx.fill()
        ctx.stroke()
        ctx.fillStyle = '#14203A'
        ctx.textBaseline = 'middle'
        ctx.fillText(selLabel, bx + padX, by + bh / 2 + 0.5 * dpr)
      }

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    const down = (e: PointerEvent) => {
      drag = { x: e.clientX, angle, moved: false }
      target = null
      canvas.setPointerCapture(e.pointerId)
    }
    const move = (e: PointerEvent) => {
      if (!drag) return
      const dx = e.clientX - drag.x
      if (Math.abs(dx) > 4) drag.moved = true
      angle = drag.angle + dx * 0.012
    }
    const up = (e: PointerEvent) => {
      if (!drag) return
      const wasDrag = drag.moved
      drag = null
      idleUntil = performance.now() + 2500
      if (wasDrag) return
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      let best: { id: ConditionId; d: number } | null = null
      for (const s of spots) {
        const d = Math.hypot(s.x - x, s.y - y)
        if (d < 36 && (!best || d < best.d)) best = { id: s.id, d }
      }
      if (best) live.current.onSelect(best.id)
    }
    canvas.addEventListener('pointerdown', down)
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerup', up)
    canvas.addEventListener('pointercancel', up)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerup', up)
      canvas.removeEventListener('pointercancel', up)
    }
  }, [height])

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', height }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={label}
        style={{ width: '100%', height, display: 'block', cursor: 'grab', touchAction: 'pan-y' }}
      />
    </div>
  )
}
