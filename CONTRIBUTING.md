# Contributing to Manga Tracker

## Tech Stack

- **Frontend**: React + Vite + MUI
- **Backend**: Convex (database + serverless functions)
- **Auth**: Clerk (sign-in via GitHub, Discord, Google)
- **Hosting**: AWS S3 + CloudFront

## Getting Started

You'll use your own free Convex and Clerk accounts for local dev. This never touches production data.

1. Clone the repo and run `npm install`
2. Run `npx convex dev` and follow the prompts to create a dev deployment. Keep it running.
3. Create a Clerk application at [dashboard.clerk.com](https://dashboard.clerk.com) and turn on **Integrations → Convex**
4. Copy `.env.template` to `.env.local` and fill in `VITE_CLERK_PUBLISHABLE_KEY` (`npx convex dev` fills in the Convex values)
5. Point Convex at your Clerk app, using its Frontend API URL:
   ```bash
   npx convex env set CLERK_JWT_ISSUER_DOMAIN https://<your-app>.clerk.accounts.dev
   ```
6. Run `npm run dev` in a separate terminal and sign in

## Scripts

| Command             | What it does                                   |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Start the frontend dev server                  |
| `npm run build`     | Build the frontend into `dist/`                |
| `npm run lint`      | ESLint for frontend and Convex code            |
| `npm run typecheck` | TypeScript check of the Convex code            |
| `npm run format`    | Format everything with Prettier                |
| `npm run check`     | Lint + typecheck + format check (CI runs this) |

Run `npm run format` and `npm run check` before opening a PR. CI runs the same checks on every PR.

## Project Structure

```
src/
  main.jsx            app entry: providers (MUI theme, Clerk, Convex)
  App.jsx             page layout, data loading, sorting and filtering
  components/         UI components (Header, TitleCard, dialogs, search)
  theme/theme.js      the design system (see below)
  lib/                shared constants and helpers
convex/
  schema.ts           database tables and indexes
  users.ts, titles.ts, ratings.ts, readStatus.ts   app functions, one file per area
  mangadex.ts         MangaDex search and chapter lookups
  covers.ts           downloads and stores cover images
  http.ts             Clerk webhook endpoint
  admin.ts            one-off operator commands (run from the CLI only)
  lib/                shared helpers: auth.ts (current user), validators.ts
.github/workflows/    CI on pull requests, deploy on merge to main
```

## Design System

The app uses [MUI](https://mui.com/material-ui/). `src/theme/theme.js` is the single source of truth for the look: light and dark palettes, typography, corner radius and default props for components.

- Change colors, fonts or component defaults in `theme.js`, not in individual components
- Use MUI components rather than plain HTML elements with custom CSS
- Use theme values in components: `color="text.secondary"`, `sx={{ p: 2, bgcolor: "action.hover" }}`, not raw hex colors or pixel sizes
- Animations should be subtle and respect `prefers-reduced-motion` (see `hoverLift` in `theme.js`)

## Ideas for Contributions

Nothing here is assigned. Pick whatever interests you and open a PR. Keep PRs small and focused, one idea per PR.

### Better UI

- **Sliding title carousels**: horizontal rows like "Highest Rated", "Recently Added", "Currently Reading" that scroll sideways with arrow buttons or swipe on mobile. CSS `scroll-snap` gets you most of the way without a library.
- **Sidebar menu**: a collapsible side menu (MUI `Drawer`) for navigation (All Titles, My List, Friends' Activity, Settings) and the sort/filter controls that currently sit above the grid. On phones it should slide in behind a menu button.
- **More motion**: covers fading in once loaded, ratings updating smoothly. Keep it subtle and respect `prefers-reduced-motion`.
- **Toasts**: small pop-up confirmations ("Rating saved", "Added to list") with MUI `Snackbar`, instead of silent updates.
- **Richer title cards**: rating shown as a badge on the cover, your status shown as a colored ribbon.

### Features

- **Recommendations**: it's called MangaRec after all. Suggest titles based on what friends with similar ratings liked, or on shared tags.
- **Chapter progress**: track which chapter you're on, and highlight titles where a new chapter came out since you last read.
- **Profile pages**: a page per user showing their list, ratings and stats (titles completed, average score, favorite tags).
- **Activity feed**: "Evan rated Golden Kamuy 9/10", "Mon started reading DEAD Tube".
- **Search and filter the list**: find titles already in the list by name or tag (the existing search only looks up MangaDex).
- **Reviews**: ratings already have an optional `comment` field in the schema; it just isn't in the UI yet.
- **Covers in search results**: MangaDex blocks embedding its images, so search results currently show names only. A small Convex HTTP endpoint that fetches and caches thumbnails could bring them back.

### Code health

- **Tests**: there are none yet. Unit tests for the Convex functions (with `convex-test`) would be the most valuable start.
- **TypeScript on the frontend**: the backend is TypeScript, the frontend is still JavaScript.
- **Mobile check**: the layout is responsive but hasn't been properly tested on phones.

## Notes

- **Who the user is:** the server decides from the Clerk login (`getCurrentUser` / `requireUser` in `convex/lib/auth.ts`). Never accept a `userId` from the client for anything that writes data.
- **Covers:** MangaDex blocks embedding its images. When a title is added, its cover is downloaded once and stored in Convex (`convex/covers.ts`). Don't link MangaDex image URLs directly in the UI; they won't load.
- **Deploying:** merging to `main` deploys everything automatically (`.github/workflows/deploy.yml`): it builds the frontend, deploys Convex, uploads to S3 and clears the CloudFront cache. Don't deploy production by hand unless the workflow is broken.
- **Admin commands:** one-off commands live in `convex/admin.ts` and can only be run from the CLI, e.g. `npx convex run --prod admin:backfillCovers`. `admin:mergeUsers` pairs users from before Clerk auth with their new accounts; see the comment above it.
