# ILJC Backend Setup — Task List
### Supabase + Google Calendar Hybrid

Reference: [`design/backend-architecture.md`](./backend-architecture.md)

---

## Phase 1 — Supabase Project Setup

### 1.1 Create Project
- [ ] Create account at [supabase.com](https://supabase.com) using ILJC admin email
- [ ] Create new project: name `iljc`, region `us-east-1` (closest to Indianapolis)
- [ ] Save project URL and anon/public API key in a secure location (password manager)
- [ ] Save service role key securely — never expose this in frontend code

### 1.2 Run Database Schema
- [ ] Open Supabase SQL Editor
- [ ] Create lookup tables first:
  ```sql
  create table languages (
    id   serial primary key,
    name text not null unique,
    code text
  );

  create table service_types (
    id   serial primary key,
    name text not null unique
  );
  ```
- [ ] Seed `languages` table with Indianapolis community languages:
  ```sql
  insert into languages (name, code) values
    ('Spanish', 'es'), ('Burmese', 'my'), ('Arabic', 'ar'),
    ('Somali', 'so'), ('Haitian Creole', 'ht'), ('Vietnamese', 'vi'),
    ('Amharic', 'am'), ('French', 'fr'), ('Chinese (Mandarin)', 'zh'),
    ('Tigrinya', 'ti'), ('Swahili', 'sw'), ('Hindi', 'hi'),
    ('Portuguese', 'pt'), ('Nepali', 'ne'), ('Karen', 'kar'),
    ('Rohingya', 'rhg'), ('Kinyarwanda', 'rw'), ('Oromo', 'om'),
    ('Pashto', 'ps'), ('Dari', 'prs');
  ```
- [ ] Seed `service_types` table:
  ```sql
  insert into service_types (name) values
    ('Interpretation'), ('Translation'), ('Training'),
    ('Cultural Brokering'), ('Language Justice Consulting');
  ```
- [ ] Create `members` table (see full schema in `backend-architecture.md` §5)
- [ ] Create `member_languages` join table
- [ ] Create `member_services` join table
- [ ] Create `service_requests` table
- [ ] Create `applications` table
- [ ] **Skip** `events` table — Google Calendar handles this

### 1.3 Row-Level Security (RLS)
- [ ] Enable RLS on `members` table
- [ ] Enable RLS on `service_requests` table
- [ ] Add policy: public can read active, public member profiles
  ```sql
  create policy "public members visible"
    on members for select
    using (is_public = true and is_active = true);
  ```
- [ ] Add policy: members can update their own row only
  ```sql
  create policy "members update own row"
    on members for update
    using (auth.uid() = id);
  ```
- [ ] Add policy: anyone can insert a service request (public form)
  ```sql
  create policy "public can submit requests"
    on service_requests for insert
    with check (true);
  ```
- [ ] Add policy: assigned member and admins can read requests
  ```sql
  create policy "assigned member sees request"
    on service_requests for select
    using (auth.uid() = assigned_member_id or auth.role() = 'service_role');
  ```
- [ ] Enable RLS on `applications` table
- [ ] Add policy: anyone can insert an application (public form)
- [ ] Add policy: only service role (admin) can read applications
- [ ] Test RLS by logging in as a test member and verifying row isolation

### 1.4 Storage Buckets
- [ ] Create storage bucket: `member-photos` (public read, authenticated write)
- [ ] Create storage bucket: `member-docs` (authenticated read/write)
- [ ] Set storage policy: members can only upload/update their own files
  - Use path pattern `member-photos/{user_id}/*`
- [ ] Set max file size: 5MB for photos, 20MB for docs
- [ ] Enable image transformations for member photo resizing

### 1.5 Auth Configuration
- [ ] Enable Email auth provider in Supabase Auth settings
- [ ] Enable Magic Link (passwordless) — recommended for non-technical members
- [ ] Set site URL to `https://iljc.pocketsod.com`
- [ ] Add redirect URLs:
  - `https://iljc.pocketsod.com/member-portal/`
  - `http://localhost:3001/member-portal/` (for local dev)
- [ ] Customize email templates (confirm signup, magic link, password reset):
  - Use ILJC branding (forest green, saffron, Fraunces font in HTML email)
  - Sender name: "Indy Language Justice Cooperative"
- [ ] Configure email rate limits (default is fine for launch)
- [ ] Disable "confirm email" requirement initially — simplify onboarding (can re-enable later)

### 1.6 Add Admin Role
- [ ] In Supabase Auth → Users, manually create the first admin user account
- [ ] Run SQL to add admin metadata to that user:
  ```sql
  update auth.users
  set raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'
  where email = 'admin@indyljc.org';
  ```
- [ ] Add RLS policy allowing admins to read all rows:
  ```sql
  create policy "admins read all members"
    on members for select
    using (auth.jwt() ->> 'role' = 'admin');
  ```

---

## Phase 2 — Google Calendar Setup

### 2.1 Create the ILJC Calendar
- [ ] Create or designate a Google account as the ILJC admin account (e.g., `calendar@indyljc.org` or a shared Gmail)
- [ ] In Google Calendar, create a new calendar: **"ILJC Events & Availability"**
- [ ] Set calendar description: "Public calendar for Indy Language Justice Cooperative — trainings, events, and member availability"
- [ ] Set timezone: `America/Indiana/Indianapolis`

### 2.2 Configure Sharing & Access
- [ ] Set calendar visibility to **"Public — make all event details visible"**
- [ ] Get the public calendar embed URL:
  - Calendar Settings → Integrate Calendar → copy `<iframe>` embed code
- [ ] Get the public iCal (`.ics`) URL:
  - Calendar Settings → Integrate Calendar → copy "Public address in iCal format"
- [ ] Save both URLs — they go into the ILJC website
- [ ] Invite each member as an editor:
  - Calendar Settings → Share with specific people → add member Gmail → "Make changes to events"
- [ ] Create a brief 1-page guide for members: "How to add your events to the ILJC calendar" (save to Google Drive)

### 2.3 Calendar Structure (Optional — recommended)
- [ ] Create color-coded event categories by adding a naming convention to event titles:
  - `[Training]` — red
  - `[Interpretation]` — blue
  - `[Community]` — green
  - `[Availability]` — gray
- [ ] Alternatively, create separate sub-calendars per service type and overlay them on the main calendar
- [ ] Set default event duration to 1 hour

### 2.4 Embed Calendar on Website
- [ ] Open `index.html`, find the calendar preview section (`id="calendar"`)
- [ ] Replace the static event list HTML with the Google Calendar `<iframe>` embed:
  ```html
  <iframe
    src="https://calendar.google.com/calendar/embed?src=YOUR_CALENDAR_ID&ctz=America%2FIndiana%2FIndianapolis&mode=AGENDA&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=0&showCalendars=0&showTz=0"
    style="border:0; width:100%; height:480px;"
    frameborder="0"
    scrolling="no"
    title="ILJC Events Calendar"
    loading="lazy">
  </iframe>
  ```
- [ ] Style the iframe container to match the ILJC design (cream background, rounded corners)
- [ ] Add the iCal subscribe link below the embed:
  ```html
  <a href="YOUR_ICAL_URL">Subscribe in your calendar app →</a>
  ```
- [ ] Test embed renders correctly at desktop and mobile widths
- [ ] Add Google Calendar link for members: "Add your events → [Open ILJC Calendar]"

---

## Phase 3 — Email Setup (Resend)

### 3.1 Resend Account
- [ ] Create account at [resend.com](https://resend.com) using ILJC admin email
- [ ] Add and verify domain: `indyljc.org` (add DNS records at domain registrar)
  - If domain not yet purchased: register `indyljc.org` at Namecheap (~$12/year)
- [ ] Create API key — save securely
- [ ] Set "From" address: `hello@indyljc.org` or `notifications@indyljc.org`

### 3.2 Email Templates
- [ ] Write email templates for each trigger (plain text is fine for launch):

  **New service request received** (to admin)
  > Subject: New service request — {service_type} in {language}
  > Org: {org_name}, Date: {date}, Contact: {email}

  **Application received** (to admin)
  > Subject: New membership application — {applicant_name}

  **Application approved — welcome** (to new member)
  > Subject: Welcome to ILJC, {name}!
  > Your account is ready. Log in at iljc.pocketsod.com/member-portal
  > You've been invited to the ILJC Google Calendar.

  **Booking confirmed** (to requesting org)
  > Subject: Your request is confirmed — {service_type} on {date}
  > Your interpreter/translator: {member_name}, Contact: {member_email}

### 3.3 Supabase Edge Functions
- [ ] Install Supabase CLI: `npm install -g supabase`
- [ ] Login: `supabase login`
- [ ] Initialize: `supabase init` in the project repo
- [ ] Create Edge Function: `supabase functions new notify-new-request`
  - Triggered by insert on `service_requests` via Database Webhook
  - Sends "new request" email to admin via Resend API
- [ ] Create Edge Function: `supabase functions new notify-new-application`
  - Triggered by insert on `applications`
  - Sends "application received" email to admin
- [ ] Create Edge Function: `supabase functions new approve-member`
  - Called manually by admin from the admin panel
  - Creates Supabase auth user for the approved member
  - Inserts row in `members` table
  - Sends welcome email with login link
  - Sends Google Calendar invite via Google Calendar API (optional — can skip for now)
- [ ] Create Edge Function: `supabase functions new confirm-booking`
  - Called when admin updates `service_requests.status = 'confirmed'`
  - Sends confirmation email to the requesting org
- [ ] Set environment variables in Supabase dashboard:
  - `RESEND_API_KEY`
  - `ADMIN_EMAIL`
  - `SITE_URL`
- [ ] Deploy all functions: `supabase functions deploy`
- [ ] Set up Database Webhooks in Supabase dashboard to trigger functions on table events

---

## Phase 4 — Supabase JavaScript Client Setup

### 4.1 Install & Configure
- [ ] Add Supabase JS client to the project via CDN (no build step needed for static site):
  ```html
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  ```
- [ ] Create `js/supabase.js` — initialize client with public anon key:
  ```js
  const { createClient } = supabase;
  const sb = createClient('YOUR_PROJECT_URL', 'YOUR_ANON_KEY');
  ```
- [ ] Add `js/supabase.js` to `.gitignore` — or use environment injection at deploy time
  - For GitHub Pages (static): store keys in a `config.js` that is gitignored; document setup in README
  - Note: anon key is safe to expose publicly (RLS enforces security); service role key must never be exposed

---

## Phase 5 — Public Pages (No Auth Required)

### 5.1 Service Request Form
- [ ] Create `request.html` — service request page
- [ ] Build form with fields: org name, contact name, email, phone, service type (dropdown), language (dropdown), date, time, duration, location, virtual checkbox, notes
- [ ] On submit: call `sb.from('service_requests').insert({...})`
- [ ] Show success confirmation message on submit
- [ ] Show error message if submission fails
- [ ] Wire "Get a Quote" CTA on homepage to link to `request.html`

### 5.2 Membership Application Form
- [ ] Create `join.html` — membership application page
- [ ] Build form with fields: full name, email, phone, languages spoken (multi-select), services offered (checkboxes), statement ("why do you want to join ILJC?"), resume/CV upload
- [ ] Resume upload: use Supabase Storage `applications/` bucket
- [ ] On submit: insert to `applications` table, upload resume if provided
- [ ] Show confirmation and next-steps message
- [ ] Wire "Apply for Membership" CTA on homepage to link to `join.html`

### 5.3 Member Directory (Public Search)
- [ ] Create `directory.html` — searchable provider page
- [ ] On page load: fetch all `is_public = true` members with their languages and services
  ```js
  const { data } = await sb
    .from('members')
    .select('*, member_languages(languages(name)), member_services(service_types(name))')
    .eq('is_public', true)
    .eq('is_active', true);
  ```
- [ ] Render member cards (name, photo, languages, services, contact link)
- [ ] Add client-side filter: language dropdown, service type dropdown
- [ ] Add search input: filters on name and bio text
- [ ] Wire "Find a Provider" nav link and homepage section to `directory.html`

---

## Phase 6 — Member Portal (Auth Required)

### 6.1 Login Page
- [ ] Create `member-portal/login.html`
- [ ] Build login form: email input + "Send magic link" button
  ```js
  await sb.auth.signInWithOtp({ email });
  ```
- [ ] Show "Check your email" message after submit
- [ ] Handle auth redirect on return (Supabase appends token to URL automatically)
- [ ] Add logout button: `sb.auth.signOut()`
- [ ] Protect all portal pages: redirect to login if no active session
  ```js
  const { data: { session } } = await sb.auth.getSession();
  if (!session) window.location.href = '/member-portal/login.html';
  ```

### 6.2 Member Profile Page
- [ ] Create `member-portal/profile.html`
- [ ] On load: fetch current member's row from `members` table
- [ ] Display editable form: display name, bio, location, website, photo
- [ ] Photo upload: upload to `member-photos/{user_id}/avatar.jpg`, save URL to members row
- [ ] Language checkboxes: load from `languages` table; save to `member_languages`
- [ ] Service type checkboxes: load from `service_types` table; save to `member_services`
- [ ] Toggle visibility: `is_public` on/off switch
- [ ] Save button: `sb.from('members').update({...}).eq('id', session.user.id)`
- [ ] Show success/error feedback on save

### 6.3 My Events Page
- [ ] Create `member-portal/my-events.html`
- [ ] Display message explaining Google Calendar is used for scheduling
- [ ] Embed a direct link to the shared ILJC Google Calendar for the member to add events
- [ ] Link to the member guide: "How to add your availability and events"
- [ ] Embed a personal calendar view (optional): link to member's own Google Calendar

### 6.4 My Requests Page
- [ ] Create `member-portal/requests.html`
- [ ] Fetch service requests assigned to this member:
  ```js
  const { data } = await sb
    .from('service_requests')
    .select('*')
    .eq('assigned_member_id', session.user.id)
    .order('requested_date', { ascending: true });
  ```
- [ ] Render request cards with org name, service, language, date, status
- [ ] Add "Confirm" / "Decline" buttons that update `service_requests.status`
- [ ] Show empty state if no requests assigned yet

---

## Phase 7 — Admin Panel

### 7.1 Applications Review
- [ ] Create `admin/applications.html` (protected by admin role check)
- [ ] Fetch all pending applications: `sb.from('applications').select('*').eq('status','pending')`
- [ ] Display applicant details: name, email, languages, services, statement
- [ ] "Approve" button → calls `approve-member` Edge Function
- [ ] "Decline" button → updates status, triggers decline email
- [ ] "Add notes" text area for board review comments

### 7.2 Member Management
- [ ] Create `admin/members.html`
- [ ] List all members (active and inactive) with edit access
- [ ] Toggle `is_active` / `is_public` per member
- [ ] Manually assign member to a service request
- [ ] Reset member password (trigger magic link)

### 7.3 Requests Dashboard
- [ ] Create `admin/requests.html`
- [ ] List all service requests with status filter (pending / matched / confirmed / completed)
- [ ] Assign request to a member: dropdown of active members filtered by language + service type
- [ ] Update request status manually
- [ ] Export to CSV (for payout tracking)

---

## Phase 8 — Testing & QA

### 8.1 End-to-End Flow Tests
- [ ] **Public → Request form:** Submit a test service request; verify it appears in Supabase, admin receives email
- [ ] **Public → Application form:** Submit a test application; verify admin email received
- [ ] **Admin → Approve member:** Approve the test application; verify auth account created, welcome email sent
- [ ] **Member → Login:** Use magic link to log in as the new test member
- [ ] **Member → Profile:** Edit name, bio, upload photo; verify changes appear in public directory
- [ ] **Member → Calendar:** Add a test event to the ILJC Google Calendar; verify it appears on the website embed
- [ ] **Admin → Assign request:** Assign the test service request to the test member
- [ ] **Member → Accept booking:** Test member confirms the request; verify confirmation email sent to org

### 8.2 RLS Verification
- [ ] Log in as Member A; attempt to update Member B's profile row → should be rejected
- [ ] Log in as Member A; attempt to read a service request assigned to Member B → should return empty
- [ ] As unauthenticated user; attempt to read `applications` table → should return empty

### 8.3 Mobile Check
- [ ] Test all portal pages on mobile viewport (375px)
- [ ] Test Google Calendar embed on mobile
- [ ] Test login magic link flow on mobile email client
- [ ] Test form submissions on mobile (keyboard, file upload)

---

## Phase 9 — Go-Live Checklist

- [ ] Enable GitHub Pages: Settings → Pages → branch `main` / root
- [ ] Verify `iljc.pocketsod.com` resolves and loads `index.html`
- [ ] Update all `href="#"` placeholder links in `index.html` to point to real pages
- [ ] Swap placeholder phone/email in footer with real contact info
- [ ] Swap placeholder provider names in directory section with real members (or remove until portal is live)
- [ ] Swap placeholder calendar events with real upcoming events
- [ ] Test Resend email deliverability (check spam, configure SPF/DKIM records)
- [ ] Verify Supabase project is not paused (free tier pauses after 1 week of inactivity — upgrade to Pro if needed)
- [ ] Set up Supabase project backups (Settings → Database → Backups)
- [ ] Document environment variables and setup steps in `SETUP.md` for future contributors

---

## Ongoing / Post-Launch

- [ ] Monitor Supabase usage dashboard monthly (storage, auth MAU, function invocations)
- [ ] Schedule quarterly review of member directory (deactivate former members)
- [ ] Archive completed service requests annually
- [ ] Update `languages` seed data as Indianapolis community needs evolve
- [ ] Consider upgrading to Supabase Pro ($25/month) if daily backups or custom domains are needed
