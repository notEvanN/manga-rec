---
name: MangaRec
description: A shared manga shelf for a group of friends, rated by people they know.
colors:
  page-ink: "#0c0c0e"
  panel-charcoal: "#151517"
  raised-graphite: "#202024"
  hairline: "#26262b"
  paper-white-text: "#ececf1"
  muted-slate-text: "#9c9ca6"
  shelf-tag-blue: "#8ab4ff"
  on-shelf-tag: "#0b1730"
  shelf-tag-wash: "rgb(138 180 255 / 0.14)"
  slop-red: "#d32f2f"
  on-slop-red: "#ffffff"
  status-reading: "#6ad6a8"
  status-reading-bg: "rgb(106 214 168 / 0.12)"
  status-completed: "#b9a2ff"
  status-completed-bg: "rgb(185 162 255 / 0.14)"
  status-dropped: "#ff8f8f"
  status-dropped-bg: "rgb(255 143 143 / 0.12)"
  status-plan: "#8ab4ff"
  status-plan-bg: "rgb(138 180 255 / 0.14)"
  tint-1: "#2c4a7c"
  tint-2: "#4a3a7a"
  tint-3: "#1f5a64"
  tint-4: "#5a3a6e"
  on-tint: "#ffffff"
  scrim: "rgb(0 0 0 / 0.72)"
  on-scrim: "#ffffff"
  avatar-1: "#6ad6b4"
  avatar-2: "#8ab4ff"
  avatar-3: "#f5a3a3"
  avatar-4: "#c3a6ff"
  page-ink-light: "#f4f5f8"
  panel-charcoal-light: "#ffffff"
  raised-graphite-light: "#eceff5"
  hairline-light: "#e1e4ea"
  paper-white-text-light: "#16181d"
  muted-slate-text-light: "#5c6370"
  shelf-tag-blue-light: "#2f66d8"
  on-shelf-tag-light: "#ffffff"
  shelf-tag-wash-light: "rgb(47 102 216 / 0.1)"
  status-reading-light: "#0f6b47"
  status-completed-light: "#6a45d6"
  status-dropped-light: "#ad2a2a"
  status-plan-light: "#2858c0"
  tint-1-light: "#4f70ab"
  tint-2-light: "#7462a8"
  tint-3-light: "#367a85"
  tint-4-light: "#8a6199"
typography:
  display:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
  title:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
  wordmark:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
  card-title:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
  body:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  body-small:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
  badge:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.6
rounded:
  badge: "6px"
  control: "10px"
  cover: "12px"
  card: "14px"
  panel: "16px"
  pill: "999px"
  round: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.shelf-tag-blue}"
    textColor: "{colors.on-shelf-tag}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "6px 16px"
  button-primary-large:
    backgroundColor: "{colors.shelf-tag-blue}"
    textColor: "{colors.on-shelf-tag}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "8px 24px"
  button-outlined:
    textColor: "{colors.paper-white-text}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  nav-item:
    textColor: "{colors.paper-white-text}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  nav-item-active:
    backgroundColor: "{colors.raised-graphite}"
    textColor: "{colors.shelf-tag-blue}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  pill-filter:
    textColor: "{colors.paper-white-text}"
    rounded: "{rounded.pill}"
    padding: "6px 16px"
  pill-filter-selected:
    backgroundColor: "{colors.shelf-tag-wash}"
    textColor: "{colors.shelf-tag-blue}"
    rounded: "{rounded.pill}"
    padding: "6px 16px"
  input-search:
    backgroundColor: "{colors.page-ink}"
    textColor: "{colors.paper-white-text}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
  panel:
    backgroundColor: "{colors.panel-charcoal}"
    rounded: "{rounded.panel}"
    padding: "24px"
  title-cover:
    rounded: "{rounded.cover}"
  score-button:
    textColor: "{colors.paper-white-text}"
    rounded: "{rounded.control}"
    height: "44px"
  score-button-selected:
    backgroundColor: "{colors.shelf-tag-wash}"
    textColor: "{colors.shelf-tag-blue}"
    rounded: "{rounded.control}"
    height: "44px"
  status-button-reading-selected:
    backgroundColor: "{colors.status-reading-bg}"
    textColor: "{colors.status-reading}"
    rounded: "{rounded.control}"
    height: "44px"
  badge-rank:
    backgroundColor: "{colors.scrim}"
    textColor: "{colors.on-scrim}"
    typography: "{typography.badge}"
    rounded: "{rounded.badge}"
    padding: "2px 7px"
  badge-slop:
    backgroundColor: "{colors.slop-red}"
    textColor: "{colors.on-slop-red}"
    typography: "{typography.badge}"
    rounded: "{rounded.badge}"
    padding: "2px 7px"
  status-chip-reading:
    backgroundColor: "{colors.status-reading-bg}"
    textColor: "{colors.status-reading}"
    rounded: "{rounded.badge}"
    padding: "2px 8px"
  avatar:
    textColor: "{colors.page-ink}"
    rounded: "{rounded.round}"
    size: "40px"
---

# Design System: MangaRec

## Overview

**Creative North Star: "The Group Shelf"**

MangaRec is a bookshelf a group of friends stocks together. The covers are the books. Everything
else is the shelving: dark, even and quiet, there to hold the covers up rather than compete with
them. The colour and personality on any screen come from the manga art, plus one soft blue that
marks what's selected, rated or active, like a coloured tag clipped to a shelf.

It feels soft and friendly rather than technical. Corners are generously rounded (10–16px), filters
are pills, cards rise a few pixels when you point at them, and people show up as round initials in
their own colour. The density is relaxed: panels breathe, cover rows scroll sideways, and the text
reads like a group chat ("Most rated by the group", "Found something worth reading?"), not a report.

Dark is the default, and light mode is a full equal. Both come from the same CSS variables, so every
rule here applies to both. Scores support the covers. MangaRec is a shelf, not a stats dashboard.

**Key Characteristics:**

- Manga covers (2:3) are the main imagery and the main source of colour.
- One accent, Shelf-Tag Blue, for anything selected, primary or rated.
- Flat, tonal depth: page → panel → raised, separated by 1px hairlines.
- Soft rounded shapes and pill filters, with a small hover lift on cards.
- Space Grotesk for headings, Inter for everything else.
- Dark-first, with a fully supported light mode driven by the same tokens.

## Colors

Near-black neutrals with a single periwinkle accent, and four read-status hues that only ever appear
on status chips.

All colours are CSS variables in `src/index.css`. Dark values sit on `:root` / `[data-dark]`, and
light values override them under `[data-light]`. The MUI palette in `src/theme/theme.js` only points
at these variables. The `-light` keys in the frontmatter are the `[data-light]` values of the same
variable.

### Primary

- **Shelf-Tag Blue** (`--accent`): primary buttons ("Add manga", "Sign in"), the active nav item, the
  rating star, selected filter pills, focus outlines, and the logo tile. Light mode swaps it for a
  deeper blue, because the dark-mode value is too faint on white.
- **On Shelf-Tag** (`--on-accent`): text and icons on Shelf-Tag Blue fills.
- **Shelf-Tag Wash** (`--accent-soft`): the translucent fill behind selected pills.

### Secondary

- **Slop Red** (`--danger`): the "Slop" badge on covers, the Slop chip in the detail dialog, and MUI
  error states. It is the same in both modes.

### Tertiary: read status

Each status has a text colour and a matching translucent background (`--status-*` and
`--status-*-bg`), used only on status chips:

- **Reading Mint** (`--status-reading`)
- **Completed Lilac** (`--status-completed`)
- **Dropped Coral** (`--status-dropped`)
- **Plan Blue** (`--status-plan`), which shares the accent's value

### Neutral

- **Page Ink** (`--bg`): the page background, the sidebar, and the inset fill of the search field
  and carousel arrows.
- **Panel Charcoal** (`--panel`): panels (hero, carousel, activity), dialogs and the search dropdown.
- **Raised Graphite** (`--panel-raised`): hover and active fills for nav items and icon buttons.
- **Hairline** (`--border`): every 1px border and divider.
- **Paper White** (`--text`): primary text.
- **Muted Slate** (`--text-muted`): secondary text, meta lines, verbs in the activity feed, timestamps.

### Identity tints

- **Cover tints** (`--tint-1…4`): the fill behind a cover while it loads or when a title has none.
  Each title gets a fixed tint from a hash of its name. The name is written on it in `--on-tint`;
  light-mode tints stay dark enough for that white text to reach 4.5:1.
- **Scrim** (`--scrim` / `--on-scrim`): the dark translucent badge behind the rank number on covers,
  the same in both modes so it reads over any artwork.
- **Avatar tints** (`--avatar-1…4`): initial avatars, assigned the same way per person, with
  `--on-avatar` text.

### Named Rules

**The One Tag Rule.** Shelf-Tag Blue is the only accent. It marks what's selected, primary or rated,
and nothing decorative. If something new needs to stand out, use weight or space, not a second
accent.

**The Status-Only Hues Rule.** Mint, lilac, coral and plan blue mean a read status and nothing
else. Don't reuse them for categories, charts or decoration.

**The Token-Only Rule.** Colours exist only as variables in `src/index.css`. Components use palette
names (`primary.main`, `divider`, `textSecondary`) or `var(--token)`. There are no exceptions.

## Typography

**Display Font:** Space Grotesk (falls back to Inter, then system-ui)
**Body Font:** Inter (falls back to system-ui, -apple-system, Segoe UI, Roboto, Arial)

**Character:** Space Grotesk's slightly quirky geometric shapes give headings and the wordmark a bit
of personality. Inter keeps titles, meta lines and controls neutral and easy to read at small sizes.

### Hierarchy

- **Display** (Space Grotesk 700, 1.875rem, -0.01em): page-level prompt only, the hero's "Found
  something worth reading?" (or "Your group's manga list" for guests).
- **Wordmark** (Space Grotesk 700, 1.375rem): "MangaRec" in the sidebar, and nowhere else.
- **Headline** (Space Grotesk 700, 1.5rem): panel headings ("Most rated by the group", "Recent
  activity", "All titles").
- **Title** (Space Grotesk 700, 1.25rem): sub-headings and cover placeholder names (at 1.0625rem).
- **Card title** (Inter 600, 1.0625rem, one line, truncated): manga names under covers.
- **Body** (Inter 400, 1rem, 1.5): activity sentences and descriptions. Names inside a sentence go
  to 600.
- **Body small** (Inter 400, 0.875rem): rating counts, genres, timestamps, empty states. Usually Muted
  Slate.
- **Label** (Inter 600, sentence case, never uppercase): buttons. Nav items and pills drop to 500.
- **Badge** (Inter 700, 0.8125rem): the rank and Slop badges on covers, and the "Soon" tag in the
  nav (at 600).
- **Score readout** (Space Grotesk 700, 1.5rem, tabular numerals): the big "9/10" beside "Your
  rating". Score buttons use Inter 600 at 1rem with tabular numerals.

### Named Rules

**The Sentence Case Rule.** Buttons, pills and headings are sentence case (`textTransform: none`).
Nothing in the UI is all-caps.

**The Score Is Bold Rule.** A score is always 700 weight, next to a Shelf-Tag Blue star ("8.4",
"9 /10"). The count or "/10" after it is in Muted Slate at a lighter weight.

## Layout

The app is a two-part shell: a sidebar and a main column.

- **Sidebar:** from `md` (900px) up, it is a sticky full-height column, 280px wide, with the logo at
  the top, nav below it, and an account card pinned to the bottom. Below `md` it becomes a top bar
  with the logo and account in one row and a nav row underneath that scrolls sideways.
- **Main column:** padding steps up from 16px to 24px to 32px across breakpoints. Content sits in a
  grid capped at 1480px. From `lg` (1200px) up, the grid has the hero across the top, then the
  carousel and the All titles grid on the left, with a 360px activity rail on the right. Below
  `lg` everything stacks: hero, carousel, activity, titles.
- **Cover grid:** auto-fill columns at least 140px wide (200px from `sm`), with a 24px column gap
  and a 32px row gap.
- **Carousel:** a snap-scrolling row of 160px items (200px from `sm`) with a 16px gap and a hidden
  scrollbar. The arrow buttons disable themselves at either end.
- **Rhythm:** MUI's 8px unit. Most gaps are 8, 12, 16, 24 or 32px. The gap between panels is 24px,
  or 32px from `md`.

## Elevation & Depth

The shelf is flat for now. Depth comes from three tones (Page Ink → Panel Charcoal → Raised
Graphite) separated by 1px Hairline borders, not from shadows. MUI's Paper gradient overlay is
turned off, and buttons render without elevation.

Shadows appear only on floating layers, using MUI's built-in levels: the search results dropdown
(elevation 8) and dialogs (MUI default). This describes the current state rather than a permanent
ban. A future layer may use a shadow if it really floats.

### Motion

- **Hover lift:** title cards rise 3px over 150ms (`ease`) on hover.
- **Carousel paging:** the arrows scroll 80% of the visible width with smooth scrolling.
- Both are switched off under `prefers-reduced-motion: reduce`.
- **Picker and row feedback:** score and status buttons, feed rows and search results shift their
  fill over 120ms (`ease-out`). This is a colour change only, so it needs no reduced-motion variant.
- **Confirmation:** saves show a short toast ("Saved · 9/10", "Added … to the list" with an Open
  action) at the bottom centre: Raised Graphite with a Hairline border, 12px radius.

## Shapes

Soft, consistent rounding that increases with the size of the surface:

- **Badges and status chips:** 6px.
- **Controls:** 10px. This covers buttons, nav items, the search field, the carousel arrows and the
  logo tile, and it is also the theme's base radius.
- **Covers and the search dropdown:** 12px.
- **The sidebar's account card:** 14px.
- **Panels:** 16px.
- **Filter pills:** fully round (999px).
- **Avatars:** circles.

Covers are always 2:3 and clipped to their radius, with a 1px Hairline border so dark artwork
doesn't bleed into a dark panel.

**The Radius Unit Rule.** Write radii as px strings in `sx` (`"10px"`). A bare number gets
multiplied by the theme's 10px base.

## Components

### Buttons

Soft and friendly: rounded, sentence-case and flat.

- **Shape:** gently rounded corners (10px).
- **Focus:** every button-like control (anything built on MUI ButtonBase) shows a 2px Shelf-Tag Blue
  outline, offset 2px, on keyboard focus. It is set once in the theme. The highlighted search result
  uses Shelf-Tag Wash with a 2px inset Shelf-Tag Blue ring.
- **Size:** every button, icon button and toggle button is at least 44px tall, set in the theme.
  Don't override it smaller.
- **Primary:** Shelf-Tag Blue fill with On Shelf-Tag text at weight 600 and no elevation. The large
  size ("Search" next to the search field) is 56px tall to match the field, has 24px horizontal
  padding, and goes full-width below `sm`.
- **Hover:** the fill darkens about 12% (a `color-mix` toward black in OKLCH).
- **Outlined:** a Hairline border with Paper White text ("Create account", the theme toggle).
- **Icon buttons:** 44×44px with a 10px radius, a Page Ink fill and a Hairline border. Hover fills
  with Raised Graphite. Disabled arrows fade.

### Filter pills

- **Style:** fully round with a Hairline border, Paper White text at 500 weight, 0.875rem, 16px
  horizontal padding and a 44px minimum height.
- **Selected:** Shelf-Tag Wash fill with Shelf-Tag Blue text and border.
- These are MUI ToggleButtons with the group's merged and squared borders undone, so each pill
  stands alone with an 8px gap.

### Title card (signature component)

A cover on the shelf.

- **Cover:** 2:3, 12px radius, Hairline border. The tinted placeholder sits underneath and shows
  the name in Space Grotesk until the image loads.
- **Badges:** a rank badge in the top-left ("#1") on the carousel only, and a Slop Red badge in the
  top-right. Both are 6px radius, 0.8125rem, weight 700.
- **Below the cover:** the name (one line, truncated), then the rating line (a blue star, the bold
  average, then "· N ratings" in Muted Slate, or "No ratings yet"), then up to two genres in Muted
  Slate.
- **Interaction:** the whole card is a button. It lifts on hover and shows a 2px Shelf-Tag Blue
  focus outline, offset 3px, on keyboard focus.

### Panels

- **Corners:** 16px.
- **Background:** Panel Charcoal with a 1px Hairline border and no shadow.
- **Padding:** 16px on phones, 24px from `md` (32px in the hero).
- Each panel is a `section` labelled by its Headline.
- **Hierarchy:** the hero and carousel lead, with a Panel Charcoal fill and Headline-size headings.
  The activity sidebar is outline-only (no fill), and it and All titles use Title-size headings
  (still `h2` elements), so the page has one focal point.

### Inputs / Fields

- **Search field:** medium outlined TextField. The fill is inset to Page Ink (one tone darker than
  its panel), with a Hairline outline and a 10px radius. A spinner sits at the end while a search
  runs.
- **Focus:** MUI's outline in Shelf-Tag Blue.
- **Search is a combobox over two groups.** "On the list" lists the group's titles first, each with
  a 32×48 cover thumbnail and its rating count, and opens the title. "Add from MangaDex" lists new
  titles and opens the add dialog. A MangaDex result the group already has moves into the shelf
  group. Arrow keys move the highlight, Enter picks, Escape closes, and `/` focuses the field from
  anywhere on the page.
- **Results dropdown:** Panel Charcoal, 12px radius, Hairline border, elevation 8, and at most
  420px tall with scrolling. Group labels are 0.8125rem at 600 in Muted Slate. The highlighted
  result takes the Raised Graphite fill. Errors and "no match" messages appear as an inline Alert,
  and a muted line says how many more characters a MangaDex search needs.

### Score and status pickers

How people log a read, in both dialogs.

- **Score picker:** 1–10 as separate 44px buttons with a 10px radius and Hairline border, ten in a
  row from `sm` and two rows of five on phones. Selected takes Shelf-Tag Wash with Shelf-Tag Blue
  text and border. The big readout sits on the label row, with a "Clear" text button once a score
  is set. Tapping the selected number again also clears it.
- **Status picker:** the four statuses as 44px buttons, four across from `sm` and 2×2 on phones.
  The selected one takes its own status colour and background, matching the feed's chips.
- Both carry an `h3` label wired to the group with `aria-labelledby`.

### Title dialog

- **Order:** a header with the cover (96px wide on phones, 128px from `sm`) beside the facts (group
  average, latest English chapter, added by, Slop and tags). Then your rating and status. Then "The
  group": avatar, name, coloured status chip and score per person, highest score first. Then "About",
  with the description clamped to four lines behind "Show more" when it is long.
- **Phones:** the dialog goes full-screen below `sm`.
- **Guests:** an info Alert with a "Sign in" action sits above the disabled pickers. The action
  closes the dialog before opening Clerk's sign-in, so the two modals never stack.

### Navigation

- **Items:** full-width buttons with a 22px outlined icon, a 12px gap, 1rem text at weight 500,
  10px × 16px padding and a 10px radius.
- **Hover:** a Raised Graphite fill.
- **Current page (`aria-current="page"`):** a Raised Graphite fill with Shelf-Tag Blue text and icon.
- **Coming soon:** not a link. The item is in Muted Slate with a small bordered "Soon" tag, marked
  `aria-disabled`, with no hover fill.
- **Mobile:** the same items in a sideways-scrolling row under the top bar.

### Activity row and status chips

- **Row:** a 40px initial avatar in the person's tint, then a sentence ("**Name** rated **Title**",
  with the verb in Muted Slate), then a meta line: a star with the bold score and "/10", a status
  chip, and the relative time. Rows are separated by Hairline dividers.
- **Rows open their title.** Each row is a button with a Raised Graphite hover fill that bleeds 8px
  past the text, and a 2px Shelf-Tag Blue focus outline.
- **Length:** below `lg` the feed shows five rows, with a "Show N more" toggle.
- **Status chip:** 6px radius, 0.875rem at weight 600, in the status colour on its translucent
  background. The same chip appears in the title dialog's group list.

## Do's and Don'ts

### Do:

- **Do** let covers carry the colour. Keep the chrome around them in the neutral tones.
- **Do** use Shelf-Tag Blue (`primary.main` / `var(--accent)`) for the one primary action and for
  selected, current or rated states.
- **Do** separate surfaces with tone and a 1px `var(--border)` hairline before reaching for a shadow.
- **Do** keep radii in the established steps (6 / 10 / 12 / 16px, pills at 999px), written as px
  strings.
- **Do** check every new token in both `[data-dark]` and `[data-light]`, and add the light value in
  `src/index.css` when the dark one fails on white.
- **Do** give motion a `prefers-reduced-motion` fallback, as `hoverLift` does.
- **Do** write muted text as `color="textSecondary"`. MUI 9 silently ignores `text.secondary` on
  Typography.

### Don't:

- **Don't** turn the home page into a data dashboard. No charts or stat tiles leading the page.
  Scores support the covers.
- **Don't** add a second accent colour, or reuse the status hues for anything except read status.
- **Don't** hard-code colours in components. Add a token to `src/index.css` instead.
- **Don't** uppercase labels or buttons.
- **Don't** load images from `uploads.mangadex.org`. Covers come only from the app's own storage.
- **Don't** write responsive border shorthands like `border: { md: 1 }`. They reset the colour, so
  write the full `"1px solid var(--border)"`.
