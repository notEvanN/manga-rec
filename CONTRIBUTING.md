# Contributing to Manga Tracker

## Tech Stack

- **Frontend**: React + Vite
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

Run `npm run lint` before opening a PR.

## Ideas for Contributions

Nothing here is assigned. Pick whatever interests you and open a PR. Keep PRs small and focused, one idea per PR.

### Better UI

The current design works but is plain. Some directions:

- **Sliding title carousels**: horizontal rows like "Highest Rated", "Recently Added", "Currently Reading" that scroll sideways with arrow buttons or swipe on mobile. CSS `scroll-snap` gets you most of the way without a library.
- **Sidebar menu**: a collapsible side menu for navigation (All Titles, My List, Friends' Activity, Settings) and the sort/filter controls that currently sit above the grid. On phones it should slide in from the side behind a menu button.
- **Animations**: subtle ones only.
  - Cards lift slightly on hover
  - Modals fade/scale in
  - Covers fade in once loaded
  - Ratings update smoothly

  Respect `prefers-reduced-motion` so people who turn animations off don't get them.
- **Loading skeletons**: grey placeholder cards while titles load, instead of an empty page.
- **Cover placeholder**: titles without a cover (or while it's still downloading) show a blank space. A styled placeholder with the title's initials would look better.
- **Better title cards**: rating shown as a badge on the cover, tags as small chips, status shown as a colored ribbon.
- **Empty states**: friendly messages when there are no titles yet, or a filter matches nothing.
- **Toasts**: small pop-up confirmations ("Rating saved", "Added to list") instead of silent updates.
- **Consistent design tokens**: we already use CSS variables for colors in `src/index.css`. Extending that to spacing, font sizes and radii would keep new UI consistent and dark mode working.

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
- **CI**: a GitHub Action that runs lint and build on every PR.
- **TypeScript on the frontend**: the backend is TypeScript, the frontend is still JavaScript.
- **Mobile check**: the layout has breakpoints but hasn't been properly tested on phones.

## Notes

- **Who the user is:** the server decides from the Clerk login (`getCurrentUser` / `requireUser` in `convex/users.ts`). Never accept a `userId` from the client for anything that writes data.
- **Covers:** MangaDex blocks embedding its images. When a title is added, its cover is downloaded once and stored in Convex (`convex/covers.ts`). Don't link MangaDex image URLs directly in the UI; they won't load.
- **Deploying:** backend changes (anything in `convex/`) deploy separately from the frontend with `npx convex deploy`. If a change affects both, deploy the backend first, then the frontend straight after.
- **Old users:** users from before Clerk auth have no `clerkId`. They're paired with their new accounts using `users:mergeUsers`; see the comment above it in `convex/users.ts`.
