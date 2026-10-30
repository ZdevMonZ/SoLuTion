/**
 * The recognised text of a result sheet → the readings in it. Pure: text in,
 * numbers out, no browser.
 *
 * A webcam photo of a table is read imperfectly — a value lands on the wrong line,
 * a digit is lost — which is why everything found here goes to an editable review
 * screen rather than straight into the report. The rules below aim at the common
 * misreads, not at certainty.
 */
import { ITEMS, ITEM_IDS, type ItemId, type Readings } from './items'


const escape = (ch: string) => ch.replace(/[.*+?^${}()|[\]\\/-]/g, '\\$&')
const isLatin = (alias: string) => /^[a-z]/.test(alias)

/**
 * An alias as a pattern: any spacing between its characters, because OCR spaces
 * Hangul out letter by letter; and for a Latin alias, no letter on either side, so
 * "hb" does not fire inside "HbA1c" nor "got" inside "SGOT". After the alias, `i`
 * and `l` do not count: they are how the reader prints a "(" or "|" next to a
 * label — "ASTISGOT" is "AST(SGOT". Before it they still do, or "Last" holds "ast".
 */
function aliasPattern(alias: string): RegExp {
  const body = [...alias.replace(/\s+/g, '')].map(escape).join('\\s*')
  return new RegExp(isLatin(alias) ? `(?<![a-z])${body}(?![a-hj-km-z])` : body, 'gi')
}

interface Hit {
  item: ItemId
  start: number
  end: number
}

const PATTERNS: { item: ItemId; re: RegExp }[] = ITEM_IDS.flatMap((item) =>
  ITEMS[item].aliases.map((alias) => ({ item, re: aliasPattern(alias) })),
)

/** Every item name in a line, earliest first; of two overlapping names the longer wins. */
function hitsIn(line: string): Hit[] {
  const all: Hit[] = []
  for (const { item, re } of PATTERNS) {
    re.lastIndex = 0
    for (let m = re.exec(line); m; m = re.exec(line)) {
      all.push({ item, start: m.index, end: m.index + m[0].length })
      if (m[0].length === 0) re.lastIndex++
    }
  }
  all.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start))
  const kept: Hit[] = []
  for (const hit of all) {
    const last = kept[kept.length - 1]
    if (last && hit.start < last.end) continue
    kept.push(hit)
  }
  return kept
}

/**
 * Digit-shaped letters where a number stands: "1O5" is 105, "B4" at the start of a
 * value is 84. And a decimal comma, "0,92", is a point.
 */
const cleanDigits = (s: string) =>
  s
    .replace(/(?<=\d)[oO](?=\d)/g, '0')
    .replace(/(?<![\w.])B(?=\d)/g, '8')
    .replace(/(?<=\d),(?=\d{1,2}(?!\d))/g, '.')

/**
 * The first number in `text` that could be this item's result. A number that is
 * part of a printed range — "100 미만", "70~99", "< 40" — is the reference, not
 * the result, and is passed over.
 */
function firstValue(item: ItemId, text: string): number | undefined {
  const [min, max] = ITEMS[item].plausible
  const clean = cleanDigits(text)
  const re = /\d+(?:\.\d+)?/g
  for (let m = re.exec(clean); m; m = re.exec(clean)) {
    const before = clean.slice(0, m.index).trimEnd().slice(-1)
    const after = clean.slice(m.index + m[0].length).trimStart()
    if (/[~<>≤≥–-]/.test(before)) continue
    if (/^(미만|이상|이하|초과|未満|以上|以下|以内|[~–]|-\s*\d)/.test(after)) continue
    const n = Number(m[0])
    if (n >= min && n <= max) return n
  }
  return undefined
}

/**
 * Blood pressure's label, including its misreadings (혈암, 혈입) and the
 * 수축기/이완기 pair that often stands in for it.
 */
const BP_LABEL = /혈\s*[압암입]|수\s*축\s*기|blood\s*pressure|systolic|血\s*[圧压]|(?<![a-z])bp(?![a-z])/i
/**
 * "120/80", with the slash as the reader also prints it: { | \ or l. Global, so a
 * line's pairs can be walked past the printed reference ("120/80 미만").
 */
const BP_PAIR = /(\d{2,3})\s*[/{|\\l]\s*(\d{2,3})(?!\d|\s*(?:미만|이상|이하|초과|未満|以上|以下))/g

/** The first pressure pair in `text` that is a result: systolic above diastolic, both plausible. */
function bpPair(text: string): [number, number] | null {
  const [smin, smax] = ITEMS.sbp.plausible
  const [dmin, dmax] = ITEMS.dbp.plausible
  for (const m of text.matchAll(BP_PAIR)) {
    const s = Number(m[1])
    const d = Number(m[2])
    if (s > d && s >= smin && s <= smax && d >= dmin && d <= dmax) return [s, d]
  }
  return null
}

/** The recognised text of a sheet → whatever readings could be found in it. */
export function parseReport(text: string): Readings {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const out: Readings = {}
  const set = (item: ItemId, value: number | undefined) => {
    if (value !== undefined && out[item] === undefined) out[item] = value
  }

  lines.forEach((line, index) => {
    // Blood pressure is printed as one pair, "120/80", under one label.
    const bp = BP_LABEL.exec(line)
    if (bp && out.sbp === undefined) {
      const pair = bpPair(line.slice(bp.index)) ?? bpPair(lines[index + 1] ?? '')
      if (pair) {
        set('sbp', pair[0])
        set('dbp', pair[1])
      }
    }

    // 당화혈색소 (HbA1c) ends in 혈색소 (haemoglobin); its 5.8 % is not a haemoglobin.
    let hits = hitsIn(line).filter(
      (hit) => !(hit.item === 'hb' && /(당\s*화|糖\s*化)\s*$/.test(line.slice(0, hit.start))),
    )
    // Both pressure labels on one line means one "120/80" cell. If no pair could be
    // read there, a lone number near either label is the reference or half a misread.
    if (hits.some((h) => h.item === 'sbp') && hits.some((h) => h.item === 'dbp')) {
      hits = hits.filter((h) => h.item !== 'sbp' && h.item !== 'dbp')
    }
    hits.forEach((hit, i) => {
      const region = line.slice(hit.end, hits[i + 1]?.start ?? line.length)
      let value = firstValue(hit.item, region)
      // A table cell can wrap: the value sits alone on the next line.
      if (value === undefined && i === hits.length - 1) {
        const next = lines[index + 1] ?? ''
        if (/^[\d\s.,]/.test(next) && hitsIn(next).length === 0) value = firstValue(hit.item, next)
      }
      set(hit.item, value)
    })
  })
  return out
}

/**
 * Readings from several passes over the same sheet, as one. A value the passes
 * agree on, or that only one found, is kept. Where they disagree, the pass that
 * found more items overall is believed — it is the one that read the page well.
 */
export function mergeReadings(passes: Readings[]): Readings {
  const ranked = [...passes].sort((a, b) => Object.keys(b).length - Object.keys(a).length)
  const out: Readings = {}
  for (const pass of ranked) {
    for (const [id, value] of Object.entries(pass) as [ItemId, number][]) {
      if (out[id] === undefined) out[id] = value
    }
  }
  return out
}
