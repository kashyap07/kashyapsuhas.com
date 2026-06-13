# UTM and per-visitor tracking

How to know who came from a link you shared, and what they did on the site.
Analytics is [Umami Cloud](https://cloud.umami.is) (script in `src/app/layout.tsx`,
prod only). This doc covers the two pieces: inbound UTM capture (free) and the
`ref` token that pins a shared link to a visitor's session.

## TL;DR for sharing a link

Tag every link you share with a unique `ref` and the standard utm params:

```
https://www.kashyapsuhas.com/blog/some-post?ref=newsletter-2026-06&utm_source=newsletter&utm_medium=email&utm_campaign=june
```

- `ref` is your own unique id for that share. make it distinct per link
  (`newsletter-2026-06`, `twitter-launch`, `reply-to-alice`, whatever). this is
  what lets you find that visitor later.
- `utm_*` are the standard campaign tags. umami auto-reports on these.

## What happens automatically

- Umami captures the full query string by default, so all utms land in the
  **UTM report** (dashboard -> Reports -> UTM). no code needed for that.
- `src/app/UmamiIdentify.tsx` reads `ref` + `utm_*` off the landing url and calls
  `umami.identify(ref, { ...utms })`. that attaches them to the visitor's session,
  so the values show up _inside_ the session detail (which the UTM report can't do).
- using the same `ref` as the identify id ties repeat opens of that link back to
  one visitor instead of counting them as unrelated visits.

## Finding a specific visitor's journey

1. Umami dashboard -> your site -> **Sessions**.
2. Filter by the `ref` (or a utm value) you used. or: Overview -> add a filter ->
   Query contains `ref=newsletter-2026-06` -> narrow the date range.
3. Click into the matching session. you get the full chronological list of every
   page that visitor viewed and every event they fired.

## Hard limits (read this)

Umami is cookieless and privacy-first. it does not identify real people.

- A session is a rotating hash of IP + user-agent + site id. "that visitor" really
  means "that link-open on that device." two devices or a different day = a new
  session, unless they reopen the _same_ `ref` link (then identify reconnects them).
- You cannot follow an anonymous person across unrelated organic visits, and you
  cannot see who they actually are.
- Ad-blockers block `cloud.umami.is`, and the script is prod-only, so your own
  tests must run against the live site in a clean browser (no blockers, incognito).

If you ever need true cross-visit, identified, per-person journeys, that needs a
cookie-based product-analytics tool (e.g. PostHog), not Umami.
