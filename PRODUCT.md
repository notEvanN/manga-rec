# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A group of friends who read manga and manhwa and trade recommendations. It is a small, closed group
today. Opening it to more groups or public sign-ups later is possible, but nothing has been decided
about how. People open it on phones and on desktop about equally, so both need to work equally well.

Their jobs, in rough order of frequency:

- Check how people they trust rated a title before starting it.
- Rate something they've read and set their read status.
- Add a title they found so the rest of the group sees it.
- See what the group has been up to recently.

## Product Purpose

MangaRec is the group's shared manga list. Anyone in the group can search MangaDex and add a title.
Each person rates it 1–10 and sets a read status (Plan to Read, Reading, Completed, Dropped).
Everyone's ratings and statuses show up live on every title. The home page shows group favourites
and recent activity.

It succeeds when people check MangaRec before starting something new and log what they've read,
because the group's opinions are more useful to them than strangers' scores.

## Positioning

MangaDex, AniList and MyAnimeList give each person their own list, plus scores from strangers.
MangaRec gives a small group **one shared list rated by people they know**. It does four things for
the group:

- **Know what friends rate:** each title shows each friend's score and status, not one anonymous average.
- **Shared group list:** one list everyone adds to, not separate personal lists.
- **Warn off bad reads:** titles can be flagged as "slop", which is the group calling out something
  not worth the time.
- **Recommendations** (planned, not built): suggest what to read next from what friends with similar
  taste rated highly, or from shared tags. The app is named for this.

## Operating Context

- Sign in with Google or a username and password, through Clerk.
- Titles come only from a MangaDex search. Adding one copies its name, description, tags and cover.
  Covers are stored in the app's own storage because MangaDex blocks embedding its images.
- Activity is logged as people add, rate and change status. The home page's Recent activity feed
  depends on it being complete.
- Typical moments: rating something right after finishing it, often on a phone; browsing and adding
  titles, often at a computer.

## Capabilities and Constraints

- **Built:** MangaDex search and add; 1–10 ratings; four read statuses; the slop flag; tags and
  descriptions; group favourites (Most rated); a Recent activity feed; an All titles grid; title
  detail dialog; light and dark themes.
- **Planned, not built:** recommendations; chapter progress and new-chapter alerts; profile pages
  with per-user stats; searching and filtering the group's own list; written reviews (ratings have
  an optional `comment` field in the data, not yet shown in the UI); covers in search results.
- **Terminology:** "title" is one manga or manhwa entry. Statuses are exactly Plan to Read, Reading,
  Completed, Dropped. Scores are whole numbers 1–10. "Slop" is the existing flag name.
- **Technical:** static single-page app, with all server logic in Convex. Every MangaDex call goes
  through the backend, and MangaDex rate limits must be respected. Public data must never expose
  users' email addresses.
- **Undecided:** whether and how the app grows beyond one friend group (multiple groups, public
  sign-up, privacy between groups).

## Brand Commitments

- Name: **MangaRec**. The README heading still says "Manga Tracker".
- Voice: **casual but clean**. Friendly and plain, like a friend talking. Avoid slang or in-jokes a
  newcomer wouldn't get. "Slop" is an existing feature name. Whether to keep the word if the app
  opens up has not been decided.

## Evidence on Hand

- Real content: titles, ratings, statuses and activity created by the group in the production
  Convex deployment.
- None of the following exist, and future work must not invent them: testimonials, user counts,
  press, reviews, or any public claims about the product.

## Product Principles

1. **Friends' opinions first.** Who rated a title, and how, matters more than an aggregate number.
   An average never stands in for individual ratings.
2. **Logging takes seconds.** Rating or changing status is the most frequent action and must stay
   quick on a phone.
3. **The feed tells the truth.** Every add, rating and status change shows up in activity. Nothing
   happens silently.
4. **Honest about quality.** Flagging bad reads is as legitimate as praising good ones.
5. **Built for a group that may grow.** Choices that would only make sense for one closed group
   should be called out, so opening up later stays possible.

## Accessibility & Inclusion

No formal standard is targeted. Use sound defaults: readable contrast in both themes, keyboard use,
labelled controls, and respect for `prefers-reduced-motion`.
