# Manga Tracker

A small site to track manga/manhwa recommendations — add titles, tag them, rate them, and mark read status, all shared across the group.

**Live site:** [https://d18cf58f0kao23.cloudfront.net](https://d18cf58f0kao23.cloudfront.net)

## How it works

- Pick your name from a dropdown
- Add new titles with tags and a description
- Rate titles 1-10 and mark your read status (plan to read / reading / completed / dropped)
- Everyone's ratings and statuses show up live, per title

## Tech Stack

- **Frontend**: React + Vite, deployed as a static site
- **Backend**: [Convex](https://convex.dev) — database + serverless functions
- **Hosting**: AWS S3 + CloudFront (HTTPS)

## Contributing

Want to help improve this? See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup instructions and a list of open ideas.

## Local Development

```bash
npm install
npx convex dev      # in one terminal
npm run dev          # in another terminal
```
