# MangaRec

A small group app for tracking and rating manga. People search MangaDex, add titles, rate them 1–10
and set a read status; the home page shows group favourites and recent activity.

## Stack

- **Frontend:** React 19 + Vite 8, MUI 9 (`@mui/material`, `@mui/icons-material`), plain JSX (no TS)
- **Backend:** Convex (`convex/`, TypeScript)
- **Auth:** Clerk (`@clerk/clerk-react`), wired to Convex via `ConvexProviderWithClerk`

## Commands

- `npm run dev` — Vite dev server (http://localhost:5173), uses the dev Convex deployment in `.env.local`
- `npx convex dev` — push schema/functions to the dev deployment and regenerate `convex/_generated`
- `npm run check` — lint + Convex typecheck + Prettier check (CI runs this)
- `npm run format` — Prettier write

## Environments

- Dev and prod Convex are **separate deployments with separate data**. `.env.local` points at dev
  (written by `npx convex dev`), `.env.production` at prod. Neither is committed (`*.local` and
  `.env.production` are gitignored); `.env.template` lists the keys.
- The deploy workflow doesn't read `.env.production`; it gets `VITE_CONVEX_URL` and
  `VITE_CLERK_PUBLISHABLE_KEY` from GitHub repository variables. `.env.production` only matters for a
  local `npm run build`.
- "Could not find public function" usually means the function was pushed to dev (`npx convex dev`)
  but not deployed to prod yet, or the Convex dashboard is showing the other deployment.

## Layout

- `src/App.jsx` — page grid (hero / most rated / activity / all titles) and dialogs
- `src/components/` — `Sidebar`, `Hero` + `TitleSearch` (shelf + MangaDex combobox), `MostRated`,
  `AllTitles`, `TitleCard`, `RecentActivity`, `AddTitleDialog`, `TitleDetailDialog`; shared pieces
  `ScorePicker`, `StatusPicker`, `StatusChip`, `PersonAvatar`, `CoverPlaceholder`, `ToastProvider`
- `src/lib/` — `constants.js` (statuses, status colours, scores), `sorters.js`, `time.js`
  (`timeAgo`, `useNow`), `toast.js` (`useToast`), `errors.js` (`friendlyError`)
- `convex/schema.ts` — tables: `users`, `titles`, `ratings`, `readStatus`, `activity`
- `convex/lib/` — `auth.ts` (`getCurrentUser`, `requireUser`), `validators.ts`, `activity.ts`
  (`logActivity`, which merges a person's changes to one title within 60s into one feed row;
  `retractActivity` for clears)
- `convex/admin.ts` — internal one-off CLI commands (`npx convex run ...`)
- `convex/mangadex.ts` — MangaDex API actions (`search`, `latestChapter`)
- `convex/covers.ts` — downloads MangaDex covers into Convex file storage
- `convex/http.ts` — Clerk `user.deleted` webhook (`/clerk-webhook-deletion`)
- `convex/auth.config.ts` — Clerk issuer config for Convex auth

## Conventions

- **Colours live only in `src/index.css`** as CSS variables (dark default, `[data-light]` overrides).
  The MUI palette in `src/theme/theme.js` points at them (`nativeColor: true`). Don't hard-code colours
  in components; use palette names (`primary.main`, `divider`) or `var(--token)`.
- MUI sets `data-dark` / `data-light` on `<html>`; the light/dark choice is stored under the `theme` key.
- **MUI 9 gotchas:**
  - Typography muted text is `color="textSecondary"` — `color="text.secondary"` is silently ignored.
  - Numeric `borderRadius` in `sx` is multiplied by the theme's 10px; use px strings (`"10px"`).
  - Responsive border shorthands (`border: { md: 1 }`) reset the colour; write the full value
    (`"1px solid var(--border)"`).
- Mutations that add, rate or change status must call `logActivity` so the Recent activity feed stays complete.
- Public Convex queries must never expose user emails.
- Schema changes: ask before changing `convex/schema.ts`.
- Prettier formats everything (LF line endings); run `npm run format` before committing.

## MangaDex

- All MangaDex API calls go through the Convex actions in `convex/mangadex.ts`. Never fetch
  `api.mangadex.org` from the browser: it fails CORS on CloudFront.
- MangaDex blocks its covers from being embedded on other sites, so the browser never loads
  `uploads.mangadex.org` either. When a title is added, `convex/covers.ts` downloads the cover once
  into Convex file storage (`titles.coverStorageId`), and `titles` queries return that storage URL as
  `coverUrl`. Covers must come from `MANGADEX_COVER_PREFIX` (`convex/lib/validators.ts`).
- Chapter queries (`latestChapter`) filter `translatedLanguage[]=en`.
- MangaDex rate-limits, so keep the throttling in place: the 8s request timeout in `mangadex.ts`
  (10s for cover downloads), the 400ms search debounce in `TitleSearch.jsx`, and the 500ms spacing
  in the `admin.ts` cover backfill.

## Auth config

- The Clerk issuer domain is set in `convex/auth.config.ts`, which reads the `CLERK_JWT_ISSUER_DOMAIN`
  env var. It's set on the Convex deployment (`npx convex env set ...`), not in `.env.local`.
- Dev and prod use different Clerk instances, so `CLERK_JWT_ISSUER_DOMAIN` must be set on **both** the
  dev and prod Convex deployments. Auth failing only in prod usually means it's missing there.
- `CLERK_WEBHOOK_SECRET` (also a Convex deployment env var) is needed only for the account-deletion
  webhook in `convex/http.ts`.

## Deploy

Production is a static SPA on S3 + CloudFront, with the backend on the prod Convex deployment.

**Deploys go through `.github/workflows/deploy.yml`.** It runs on every push to `main` and can be run
by hand from the Actions tab (`workflow_dispatch`). Steps: `npm run check` → `npm run build` →
`npx convex deploy` → S3 sync → CloudFront invalidation. The build runs before the Convex deploy, so
a broken build stops before prod changes. Pull requests run `.github/workflows/ci.yml` (`npm run check` + build).

The workflow needs these on the GitHub repo (Settings → Secrets and variables → Actions):

- **Secrets:** `CONVEX_DEPLOY_KEY`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- **Variables:** `AWS_REGION`, `VITE_CONVEX_URL`, `VITE_CLERK_PUBLISHABLE_KEY`

### Manual fallback

Only if the workflow is broken. These mirror the workflow steps; `npm run build` picks up the prod
`VITE_*` values from `.env.production`.

```sh
npm run check && npm run build
npx convex deploy
aws s3 sync dist/ s3://manga-sharehub --delete
aws cloudfront create-invalidation --distribution-id ERO8V22V1NRHO --paths "/*"
```

## Hosting

- No server code exists outside Convex.
- AWS console settings, **not stored in this repo** (check the console, not the code):
  - The S3 bucket is private, readable only by the CloudFront distribution (OAC bucket policy).
  - CloudFront's default root object is `index.html`.

## Known noise

- Clerk logs a `<SignInButton> is using incorrect casing` console warning in dev; it's pre-existing and harmless.
