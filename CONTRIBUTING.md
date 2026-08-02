# Contributing to Manga Tracker

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Convex (database + serverless functions)
- **Hosting**: AWS S3 + CloudFront

## Getting Started

1. Clone the repo
2. `npm install`
3. `npx convex dev` (you'll need your own free Convex account for local dev — this won't touch production data)
4. `npm run dev` in a separate terminal

## Ideas for Contributions

Nothing here is assigned — pick whatever interests you and open a PR.

- **Better UI/styling** — current design is minimal, room to make it look nicer (card layouts, dark mode, etc.)
- **Search/filter** — search titles by name, filter by tag, sort by average rating
- **Cover images** — support image uploads instead of just pasting a URL
- **Average rating display** — show an aggregate score per title, not just individual ratings
- **Comments/reviews** — expand ratings beyond just a number
- **Mobile responsiveness** — current layout isn't tested on small screens
- **Auth** — replace the dropdown "who are you" selector with real login (Clerk or similar), if the group ever wants privacy/security beyond the honor system

## Notes

- Ratings and read status are tied to a `userId` looked up from a dropdown, not real authentication — keep that in mind before building anything that assumes a "logged in" concept.
- Changes to `convex/schema.ts` need to be deployed with `npx convex deploy` to affect production, separate from the frontend deploy.
