// Human-readable URL slugs — a frontend/presentation concern only. We use the
// "id+slug hybrid": the numeric id stays the authoritative lookup key, and the
// slug is decorative. A URL like /api/paintings/12-the-turtle-trainer resolves
// purely by its leading 12; the text after it can be anything (or wrong) and the
// lookup still works. This sidesteps slug-uniqueness/collision management
// entirely — the id already guarantees uniqueness — while giving pretty URLs.

// Lowercase, strip accents, turn runs of non-alphanumerics into single hyphens,
// trim stray hyphens, and cap length so URLs stay sane. "Kaplumbağa
// Terbiyecisi" -> "kaplumbaga-terbiyecisi".
export function slugify(input: string): string {
  return input
    .normalize("NFKD") // split accented letters into base char + diacritic
    .replace(/\p{Diacritic}/gu, "") // drop the combining diacritic marks
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // non-alphanumerics -> hyphen
    .replace(/^-+|-+$/g, "") // trim leading/trailing hyphens
    .slice(0, 80);
}

// Build the decorative id-slug: "<id>-<slugified name>". Falls back to just the
// id when the name slugifies to nothing (e.g. a name of only punctuation).
export function idSlug(id: number, name: string): string {
  const s = slugify(name);
  return s ? `${id}-${s}` : String(id);
}

// Pull the authoritative id back out of an id-slug. Tolerant: accepts "12" or
// "12-anything"; returns NaN for input with no leading digits so the caller can
// 404. The trailing text is intentionally ignored — only the id is trusted.
export function parseIdSlug(slugOrId: string): number {
  const m = /^(\d+)/.exec(slugOrId);
  return m ? Number(m[1]) : NaN;
}
