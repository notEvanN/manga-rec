# Manga Tracker

A small site to track manga/manhwa recommendations with friends: add titles, tag them, rate them, and mark read status, all shared across the group.

**Live site:** [https://d18cf58f0kao23.cloudfront.net](https://d18cf58f0kao23.cloudfront.net)

## How it works

- Sign in with GitHub, Discord or Google
- Search MangaDex and add titles with tags and a description
- Rate titles 1–10 and mark your read status (plan to read / reading / completed / dropped)
- Everyone's ratings and statuses show up live, per title

## Tech Stack

- **Frontend**: React + Vite + [MUI](https://mui.com/material-ui/), deployed as a static site
- **Backend**: [Convex](https://convex.dev): database + serverless functions
- **Auth**: [Clerk](https://clerk.com)
- **Hosting**: AWS S3 + CloudFront (HTTPS)

## Local Development

See [CONTRIBUTING.md](./CONTRIBUTING.md) for full setup (Convex and Clerk accounts, env vars). Once set up:

```bash
npx convex dev   # in one terminal
npm run dev      # in another terminal
```

## Deploying

Merging to `main` deploys automatically via GitHub Actions ([.github/workflows/deploy.yml](./.github/workflows/deploy.yml)): checks, build, Convex deploy, S3 upload, CloudFront invalidation.

## Contributing

Want to help improve this? See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup instructions and a list of open ideas.
