# CLJ — Next Steps

## Immediate / Launch Prep
- [ ] Enable GitHub Pages: Settings → Pages → Deploy from branch `main` / root
- [ ] Verify `iljc.pocketsod.com` resolves once Pages is live
- [ ] Replace placeholder stats in hero card (15+ languages, member count)
- [ ] Replace placeholder provider names (María R., Ahmed S., Zawgyi O., Fartun K.) with real members
- [ ] Replace placeholder event dates in calendar with real upcoming events
- [ ] Update emergency interpretation phone number in footer (`(555) 555-5555` → real number)
- [ ] Update contact email (`info@indyljc.org` → real address)
- [ ] Update case study metrics (25% wait reduction, 4.8★, 600+ sessions) with real data or remove

---

## Pages to Build
- [ ] **Services** — detail page per service (Interpretation, Translation, Training, Cultural Brokering, Consulting) with scope, pricing signals, and request form
- [ ] **Full Calendar** — public event feed; members can post availability and services; iCal subscribe link
- [ ] **Membership** — benefits detail, join/application form, bylaws link, governance overview
- [ ] **Member Directory** — searchable by language, service type, availability; contact form per member
- [ ] **About** — mission, cooperative model explainer, worker stories/bios
- [ ] **Contact / Request Service** — intake form with service type, language, date, location; ties to member matching

---

## Backend / Platform
- [ ] Choose a backend for the member calendar and directory:
  - **Airtable** — low-code, easy for non-devs to manage; good for directory + calendar
  - **Supabase** — open-source Postgres, more control, supports auth for member login
  - **Headless CMS** (Contentful, Sanity) — good for content-heavy pages
- [ ] Member authentication — members need to log in to edit calendar events and manage their profile
- [ ] Booking / request flow — intake form → member match → confirmation email

---

## Design & Content
- [ ] Add real brand assets to `brand-assets/` (logo, wordmarks) and wire into nav + footer
- [ ] Add member photos/headshots to provider cards (with consent)
- [ ] Write real case study copy (replace Hospital X placeholder)
- [ ] Add language selector / translation toggle for public-facing copy
- [ ] SEO: add structured data (Organization, Service, Event, LocalBusiness schema)
- [ ] Accessibility audit: keyboard nav, screen reader labels, color contrast check

---

## Dev Tooling
- [ ] Install GitHub CLI (`gh`) for easier repo and Pages management
- [ ] Set up a `gh-pages` deploy script or GitHub Actions workflow for CI deploy on push to `main`
