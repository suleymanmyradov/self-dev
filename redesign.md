# Frontend redesign plan

Design source of truth: `Redesign.dc.html` (option ids referenced below, e.g. `2a`, `3b`).
Direction: **Paper** — warm paper ground, single sage accent, Newsreader headlines + Instrument Sans UI, light and dark.

Work through the phases in order. Phase 1 is a prerequisite for everything else; phases 3–6 are independent of each other and can be split across people.

---

## Phase 0 — Bug fix, ship on its own (30 min)

The `-soft` colours are hand-written CSS classes in `globals.css` (lines ~435–455), not registered in `@theme inline`. Every Tailwind modifier on them silently produces nothing.

Broken today: `habit-card.tsx:30`, `goal-card.tsx:59,171`, `ui/empty-state.tsx`, `ui/loading-state.tsx:88`, `explore/community-card.tsx:15`, `explore/featured-card.tsx:15,44`, `weekly-review-summary-card.tsx:26`, `weekly-review-next-plan-card.tsx:34`, `ai-conversation/thread-list.tsx:37`, `thread-welcome.tsx:79`.

Fix: register `--color-*-soft` in `@theme inline` and delete the manual `.bg-*-soft` classes. Worth shipping before the redesign so you can see what those surfaces were meant to look like.

---

## Phase 1 — Tokens and type (blocks everything else)

### 1.1 `src/app/globals.css`

Replace the `:root` and `.dark` blocks with the Paper values from `2l`.

```css
:root {
  --radius: 0.5rem;
  --background: oklch(.966 .008 85);          /* #F6F4EF */
  --foreground: oklch(.208 .008 60);          /* #1C1A17 */
  --card: oklch(1 0 0);
  --card-foreground: oklch(.208 .008 60);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(.208 .008 60);
  --primary: oklch(.208 .008 60);
  --primary-foreground: oklch(.966 .008 85);
  --secondary: oklch(.928 .012 85);           /* #EAE6DE */
  --secondary-foreground: oklch(.208 .008 60);
  --muted: oklch(.928 .012 85);
  --muted-foreground: oklch(.52 .012 75);     /* #6E6A63 */
  --accent: oklch(.48 .048 155);              /* #4F6B57 sage */
  --accent-foreground: oklch(.966 .008 85);
  --success: oklch(.48 .048 155);
  --success-foreground: oklch(.966 .008 85);
  --success-soft: oklch(.955 .022 150);       /* #F1F4EF */
  --destructive: oklch(.52 .115 40);          /* #B4553F */
  --border: oklch(.208 .008 60 / 10%);
  --input: oklch(.208 .008 60 / 14%);
  --ring: oklch(.48 .048 155);
}

.dark {
  --background: oklch(.19 .006 70);           /* #161514 */
  --foreground: oklch(.945 .008 85);          /* #F0EDE6 */
  --card: oklch(.235 .006 70);                /* #201E1B */
  --card-foreground: oklch(.945 .008 85);
  --popover: oklch(.235 .006 70);
  --popover-foreground: oklch(.945 .008 85);
  --primary: oklch(.945 .008 85);
  --primary-foreground: oklch(.19 .006 70);
  --secondary: oklch(.29 .008 70);            /* #2E2B27 */
  --secondary-foreground: oklch(.945 .008 85);
  --muted: oklch(.29 .008 70);
  --muted-foreground: oklch(.60 .012 75);     /* #8C877E */
  --accent: oklch(.66 .045 150);              /* #7FA189 */
  --accent-foreground: oklch(.19 .006 70);
  --success: oklch(.66 .045 150);
  --success-foreground: oklch(.19 .006 70);
  --success-soft: oklch(.30 .028 150);
  --destructive: oklch(.62 .11 40);           /* #C9705A */
  --border: oklch(1 0 0 / 8%);
  --input: oklch(1 0 0 / 14%);
  --ring: oklch(.66 .045 150);
}
```

**Delete:** `--calm`, `--growth`, `--energy` and their `-soft` / `-foreground` variants; `--brand-1/2/3`; every `--glow-*`; `.glow-calm/.glow-growth/.glow-energy`; `.bg-ambient-calm/growth/energy`; `.text-gradient-brand`; `.hover-lift`; `.transition-bounce`; the `@keyframes shimmer` block; the manual `.bg-*-soft` / `.text-*` utility classes at the bottom of the file.

**Register in `@theme inline`:** `--color-success`, `--color-success-foreground`, `--color-success-soft`. Remove the `--color-calm-*` / `--color-growth-*` / `--color-energy-*` entries.

**Keep:** `.no-scrollbar` (only for the nav rail and thumbnail strips), `.styled-scrollbar`, `.card-elevated`, `.glass`, the sidebar tokens, and the layout dimension vars.

**Remove** `overflow-hidden` from the `html, body` rule and stop applying `.no-scrollbar` to main content panes — scrollbars are the only cue that content continues.

### 1.2 `src/app/layout.tsx`

```ts
import { Newsreader, Instrument_Sans, IBM_Plex_Mono } from 'next/font/google';
const serif = Newsreader({ subsets: ['latin'], variable: '--font-display-face' });
const sans  = Instrument_Sans({ subsets: ['latin'], variable: '--font-body' });
const mono  = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400','500'], variable: '--font-mono-face' });
```

Drop `Fraunces`, `Plus_Jakarta_Sans`, `JetBrains_Mono`.

Type scale (`3a`): serif 38 / 34 / 30 / 20, sans 15 / 14.5 / 13 / 12 / 11.5, mono for all numerals with `tabular-nums`. Nothing readable below 12px. `--muted-foreground` is the floor for any text a user must read — never a lighter grey.

### 1.3 `src/lib/constants.ts`

Delete `CATEGORY_COLORS` entirely (18 entries → one neutral outline badge). Grep for it: `habit-card.tsx`, `goal-card.tsx`, `article-card-grid.tsx`, `lib/category-styles.ts`. Delete `lib/category-styles.ts` too.

---

## Phase 2 — Component layer (`3a`, `3b`, `3c`)

| File | Change |
|---|---|
| `ui/button.tsx` | Delete `calm`, `growth`, `energy`, `calm-outline`, `growth-outline`, `energy-outline`. Add `success` (`bg-success text-success-foreground`). 11 variants → 7. Map at call sites: `growth`→`success`, `calm`/`energy`→`default`, any `*-outline`→`outline`. Keep `active:scale-[.98]`; focus ring is 2px `--ring` at 2px offset. |
| `ui/select.tsx` | **Add** — `npx shadcn@latest add select`. Replace the two native `<select>`s in `habits-client.tsx` (filter + sort) and any in the goal/habit forms. |
| `ui/input.tsx` | `rounded-xl` → `rounded-lg` (8px) so fields match buttons. Keep the `aria-invalid` ring. |
| `ui/badge.tsx` | Keep the four variants. Category badges use `outline` with no colour. |
| `ui/card.tsx` | Shadow down to `0 1px 2px rgb(0 0 0/4%)`; radius `rounded-xl` (12px) for content cards. `CardTitle` uses the serif face. |
| `ui/tabs.tsx` | Navigation tabs become underline (`border-b-2`), not pills. Replace `TAB_TRIGGER_CLASS` in `home-client.tsx`. Filter chips keep the pill shape — the two must not look alike. |
| `ui/skeleton.tsx` | Two tones (`--muted`, and a lighter step for secondary blocks), 1.6s pulse, no shimmer. |
| `ui/empty-state.tsx` | Drop the five colour variants; keep one shape and let the copy carry the difference. Every empty state names its next action (`3c`). |
| `ui/sonner.tsx` | One toast at a time; 6s with Undo for confirmations; sticky until dismissed for failures (`3b`). |

New app-level components (not shadcn):

- `CheckInControl` — 28px round control, three states (rest / hover / done), 220ms fill (`4c` §12).
- `StreakBar` — 14 bars + numeric streak, always paired with the text "Last 14 days · N of 14" so it is never colour-only.

---

## Phase 3 — Information architecture

Nine destinations → six (`1f`).

| New route | Absorbs | Notes |
|---|---|---|
| `/` **Today** | new | Check-ins, one coach nudge, this week, goal in focus, two reads. No longer an article feed. `2a` `2b` `2g` |
| `/plan` | `/habits` + `/goals` | Habits nested under the goal they serve; unassigned habits in their own group. `2c` |
| `/progress` | `/weekly-review` + `/activity` | Metrics, per-habit breakdown, coach's read, recent activity, past reviews. `2d` |
| `/coach` | `/ai-coach` | Thread list + conversation + composer; voice is a mode, not a route. `2e` `4b` |
| `/library` | `/explore` + `/saved` + `/search` | Tabs: Explore / Saved / Templates / People. Search is a field in the header. `2f` |
| `/me` | `/profile` + `/settings` + `/pricing` | Sections: Profile, Coaching, Reminders, Notifications, Appearance, Plan & billing, Data. `2k` |

Add redirects for the old paths (`next.config.ts`): `/habits`→`/plan`, `/goals`→`/plan`, `/weekly-review`→`/progress`, `/activity`→`/progress`, `/explore`→`/library`, `/saved`→`/library?tab=saved`, `/search`→`/library?q=`, `/profile`→`/me`, `/settings`→`/me`, `/pricing`→`/me/plan`.

Notifications stays a slide-out panel (`LeftNestedPanel`), never a page. `/article/[id]` and the auth routes keep their paths.

`sidebar-nav.tsx` / `bottom-tab-bar.tsx`: six items, **with labels** on desktop (five unlabelled icons is a memory test). Rail stays 72px so `--sidebar-width` and `LayoutFrame` are unchanged. Mobile tabs 48px tall, keep `env(safe-area-inset-bottom)`.

---

## Phase 4 — Check-in flow (`1g`, `2g`)

Current: tap → `CheckInModal` → mood → submit → close. New: **tap the row.**

1. Optimistic fill on tap (`useCreateCheckIn` with `onMutate`), 220ms animation, streak counts up.
2. "Undo" for 6s in the row and in the toast — this replaces the confirmation dialog.
3. Mood + note move to an **inline expand** ("Add note"), never a modal. The check-in has already counted; the expand only adds detail.
4. Keep `CheckInModal` only for retro check-ins from `/progress`.
5. "Check in all" stays, at the top of the Today list.

Also: `useLikeArticle`, `useSaveItem`, `useRemoveSavedItem` currently have no `onError` — a failed save does nothing visible. Every mutation gets a toast.

---

## Phase 5 — Screens

Build in this order; each is fully specified in the design doc.

1. Today — `2a` light, `2b` dark, `2g` mobile
2. Plan — `2c`, habit card treatments in `1e`
3. Progress — `2d`
4. Coach — `2e`, voice mode `4b`
5. Library — `2f`
6. Article reader — `4a`, incl. the markdown element spec
7. Me — `2k`
8. Onboarding — `2h` (four steps, one question each)
9. Auth — `2i`
10. Plan & billing — `2j`, plus the in-context limit prompts

States for every screen come from `3c`: skeletons with the same geometry as the loaded rows (use the existing `*-skeleton.tsx` files — `home-client.tsx` currently renders a "Loading articles…" string instead), specific empty states, and error / 404 / offline.

`ArticleMarkdown` overrides (`4a`): code blocks move off `bg-black` to `#201E1B`; blockquotes become serif italic in sage; links use `--accent` with a 3px-offset underline (`text-primary` is now near-black and would not read as a link); body 17px at 1.72 on a 660px measure.

---

## Phase 6 — Motion (`4c`)

Five duration tokens, and nothing in the app may use a duration that isn't one of them:

| Token | Duration | Easing | Used for |
|---|---|---|---|
| instant | 80ms | linear | press feedback |
| quick | 140ms | `cubic-bezier(.2,0,.4,1)` | hover, focus, colour |
| base | 220ms | `cubic-bezier(.2,0,.2,1)` | check-in fill, row state, progress |
| overlay | 260ms | `cubic-bezier(.16,1,.3,1)` | dialogs, sheets, panel, toast in |
| slow | 1.6s loop | ease-in-out | skeleton pulse, voice bars, spinner |

Not allowed: `transition: all` (name the properties); hover translate on cards or rows; shimmer sweeps; scale or bounce on numbers and badges; the ambient/glow decoration.

Remove the stagger in `article-card-grid.tsx` — `animationDelay: min(index × 50, 500)ms` on a 500ms `animate-in` means the last card lands a full second after the first. Lists fade in as one block at 140ms. Also drop `hover:-translate-y-0.5` and `group-hover:scale-105` there.

`prefers-reduced-motion`: all durations → 0ms except opacity, which keeps 140ms. No state is communicated by movement alone.

---

## Phase 7 — Accessibility pass

- Streak visual carries a text equivalent; drop the `aria-hidden` 28-cell grid.
- Every `<select>`/input has a real `<label>`.
- Contrast floor 4.5:1 for anything readable — `--muted-foreground` is the lightest permitted text colour.
- Scrollbars restored on content panes.
- Check-in control is 28px with a ≥44px tap target on mobile; bottom tabs 48px.
- Focus visible on every interactive element: 2px `--ring`, 2px offset.
- Streak-warning notifications ship **off** by default.

---

## Definition of done

- [ ] No reference to `--calm`, `--growth`, `--energy`, `--brand-*`, `--glow-*`, `CATEGORY_COLORS` anywhere in `src/`
- [ ] `grep -r "bg-.*-soft/" src/` returns nothing (or the tokens are registered)
- [ ] Both themes pass 4.5:1 on all body and label text
- [ ] Six destinations, old paths redirect
- [ ] Check-in is one tap with Undo; every mutation surfaces failure
- [ ] Every route has a skeleton, an empty state and an error state
- [ ] No `transition: all` in `src/`
- [ ] Fraunces, Plus Jakarta and JetBrains Mono are gone from the bundle
