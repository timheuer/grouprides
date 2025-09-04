# Feature Specification: Group Ride Directory

## Overview

Public, free community web application feature that aggregates and lists group cycling rides across a defined geography. Each ride entry displays core metadata (group name with link, route link, date/time, meetup location, intensity level, ride type, and organization type) using modern, responsive, accessible design with clear visual indicators (icons / badges) for difficulty, discipline, and organizer type.

## Assumptions

1. Initial deployment will be a modern web stack (assumed Next.js + TypeScript + Tailwind CSS + a lightweight backend API layer) — can be swapped later; not constraining functional scope.
2. MVP data entry may be managed by an internal admin (no public self-service submission at launch); future self-service is out of scope for v1 but considered in data model.
3. Timezone: All ride times stored in UTC; displayed localized based on user browser locale with ability to view original local ride timezone.
4. Geography scope initially single country/region but model supports multi-region expansion.
5. Authentication not required for browsing; privileged actions (create/update/delete) restricted to admin user(s).
6. Route links will point to external platforms (e.g., RideWithGPS, Strava, Komoot) — we only store a URL and optional platform enum; no embedding in MVP.

## User Roles

1. Anonymous Visitor: Browse, search/filter, view ride details, follow external links.
2. Admin: Create, edit, archive rides; manage groups and taxonomies.

## User Journey

1. Visitor lands on the Group Ride Directory landing/list page.
2. Visitor scans list of upcoming rides (chronologically sorted; nearest future first) with key metadata (group, location, date/time) visible.
3. Visitor applies filters (e.g., difficulty = Intermediate, type = Gravel, day = Saturday) and list updates instantly.
4. Visitor clicks a ride to view a detail panel/page with full metadata and external links (route + group site/social).
5. Visitor clicks route link to open external route in new tab OR clicks group link for group information.
6. (Admin only) Admin signs in (mechanism TBD) and adds a new ride via a structured form; upon save the ride appears in the public list if date is in future and status = Published.

## Functional Requirements

1. **FR-01: Ride Listing Display**
   - **Description**: Display a paginated (or progressive loaded) list of upcoming rides with key fields: date/time (localized), title / group name (linked), difficulty badge, type badge, organizer type icon, meetup location (short), route link icon, and a subtle indicator if newly added (<48h).
   - **Acceptance Criteria**:
     - [ ] List shows only rides with start time >= current time unless user selects a "Past" toggle.
     - [ ] Default sort ascending by start date/time.
     - [ ] Each card shows: formatted local date (e.g., Sat Sep 6, 7:00 AM), group name (clickable), difficulty badge (Hard/Intermediate/Easy color-coded), ride type badge (Road/MTB/Gravel), organizer icon (Shop/Group/Individual), meetup location short text (<= 60 chars), route external link icon.
     - [ ] New indicator appears only for rides created within last 48 hours.
     - [ ] Layout responsive: 1 column (<640px), 2 columns (640–1023px), 3+ columns (≥1024px).

2. **FR-02: Ride Detail View**
   - **Description**: Provide an expanded view (modal or dedicated page) showing full ride information.
   - **Acceptance Criteria**:
     - [ ] Displays: title, full group name + link, full meetup address / map-friendly string, start date/time (local + timezone code), duration or estimated distance if available (optional placeholder), difficulty, ride type, organizer type, external route link, created/last updated timestamps (admin only), notes/description (optional field).
     - [ ] Route link opens in new browser tab.
     - [ ] Close / back control returns user to previous scroll position in list.

3. **FR-03: Filtering & Search**
   - **Description**: Users can narrow rides using multi-facet filters and text search.
   - **Acceptance Criteria**:
     - [ ] Filters: Difficulty (multi-select), Ride Type (multi-select), Organizer Type (multi-select), Day of Week, Date Range, Free Text (matches group name or location or title).
     - [ ] Applying/removing filters updates list without full page reload (client-side state update).
     - [ ] A "Clear All" control resets filters.
     - [ ] Active filter count badge visible when > 0.
     - [ ] URL query string reflects active filters for sharable state.

4. **FR-04: Data Model & Fields**
   - **Description**: Define canonical fields to persist rides and related taxonomies.
   - **Acceptance Criteria**:
     - [ ] Ride fields include: id (UUID), title, groupId (FK), startDateTimeUtc (ISO8601), timezone (IANA), meetupLocationShort, meetupLocationFull (optional extended), routeUrl, routePlatform (enum optional), difficulty (enum: EASY|INTERMEDIATE|HARD), rideType (enum: ROAD|MTB|GRAVEL), organizerType (enum: SHOP|GROUP|INDIVIDUAL), status (enum: DRAFT|PUBLISHED|ARCHIVED), createdAtUtc, updatedAtUtc, createdByUserId, notes (markdown-safe string optional).
     - [ ] Group fields include: id, name, websiteUrl (or social link), organizerType default, region (optional), isActive flag.
     - [ ] Indices support queries on startDateTimeUtc, difficulty, rideType, organizerType.

5. **FR-05: Admin Ride Creation & Editing**
   - **Description**: Admin can create new ride, edit existing, and archive outdated rides.
   - **Acceptance Criteria**:
     - [ ] Form validations: required (title, group, start date/time, difficulty, ride type, organizer type, meetupLocationShort), valid URL for route, future date/time (unless status != Published), difficulty/type enumerations enforced.
     - [ ] On successful create, status defaults to Published (can be toggled to Draft before save).
     - [ ] Editing updates updatedAtUtc.
     - [ ] Archive action sets status = ARCHIVED and removes from default upcoming list.
     - [ ] Delete (hard) not available in MVP (out of scope) — only Archive.

6. **FR-06: Visual Indicators & Iconography**
   - **Description**: Provide consistent visual language for difficulty, ride type, and organizer type.
   - **Acceptance Criteria**:
     - [ ] Difficulty uses color coding (e.g., Easy=Green, Intermediate=Amber, Hard=Red) and accessible text label.
     - [ ] Ride type badges have distinct icons (e.g., Road tire, Mountain tread, Gravel icon) with alt text.
     - [ ] Organizer type uses icon (Shop=Storefront, Group=People, Individual=User) with tooltips.
     - [ ] All icons meet contrast and have accessible labels for screen readers.

7. **FR-07: Time & Localization Handling**
   - **Description**: Correctly represent ride times across timezones.
   - **Acceptance Criteria**:
     - [ ] Store times in UTC; display converted to user local timezone by default.
     - [ ] Provide toggle / tooltip to show original local timezone abbreviation.
     - [ ] Handle daylight saving changes using IANA timezone database.

8. **FR-08: Performance & Pagination Strategy**
   - **Description**: Ensure efficient loading of ride data.
   - **Acceptance Criteria**:
     - [ ] Initial page loads < 200ms server processing (assumed baseline) for 50 upcoming rides.
     - [ ] Lazy load or paginate beyond first 50 (infinite scroll or numbered pages) — design decision consistent with accessibility.
     - [ ] API supports limit & cursor (or offset) parameters.

9. **FR-09: Accessibility**
   - **Description**: Make listing and details accessible.
   - **Acceptance Criteria**:
     - [ ] Keyboard navigation: tab order logical; focus ring visible.
     - [ ] ARIA labels for icons & interactive controls.
     - [ ] Color contrasts meet WCAG AA.
     - [ ] Provide semantic list structure using appropriate list and sectioning elements or equivalent ARIA roles.

10. **FR-10: Search Engine & Social Sharing Metadata**
    - **Description**: Optimize foundational metadata for discovery/share.
    - **Acceptance Criteria**:
      - [ ] Page includes SEO meta tags (title, description) referencing geography + "group rides".
      - [ ] Each ride detail page (if route) has Open Graph tags (title, description, canonical URL) and structured data (JSON-LD Event schema) for start date/time & location.

11. **FR-11: Error & Empty States**
    - **Description**: Provide helpful feedback when no data or errors occur.
    - **Acceptance Criteria**:
      - [ ] Empty state (no rides matching filters) shows guidance and reset filters control.
      - [ ] Network/API error shows retry action without losing filter state.
      - [ ] Loading skeletons display while fetching.

12. **FR-12: Security & Basic Admin Auth Placeholder**
    - **Description**: Restrict admin operations behind authentication boundary.
    - **Acceptance Criteria**:
      - [ ] Admin UI routes are gated (even if MVP uses a simple environment-protected login or basic auth placeholder).
      - [ ] Public API endpoints are read-only; write endpoints require auth token/session.

13. **FR-13: Analytics Baseline (Optional MVP+)**
    - **Description**: Track basic engagement.
    - **Acceptance Criteria**:
      - [ ] Events: ride_detail_view, filter_applied, route_link_click, group_link_click.
      - [ ] No PII stored in analytics payloads.

## Non-Functional Requirements

- Performance: P50 API list response < 150ms for 50 items; P95 < 400ms. Client Time To Interactive <= 2.5s on mid-tier mobile.
- Scalability: Support at least 10k ride records historically; queries on upcoming rides should remain index efficient (O(log n)).
- Reliability: 99.5% uptime target (infrastructure strategy TBD outside scope of this feature spec).
- Security: Input validation, strong URL sanitation, no inline user-supplied HTML (escape/strip). Admin endpoints require auth.
- Accessibility: WCAG 2.1 AA conformance for implemented UI elements.
- Maintainability: Clear separation between data model, API layer, and presentation. Type-safe enums.
- Observability: Basic logging for admin actions (create/edit/archive) with timestamps and userId.

## Out of Scope (v1)

- Public user account registration & ride submission self-service.
- Real-time updates / live ride tracking.
- Push notifications / email subscriptions.
- Route map embedding or GPX parsing.
- Advanced recurrence (weekly repeating rides) — manual entries only in MVP.
- Multi-language i18n beyond timezone formatting.
- Social login integration.
- Full role hierarchy beyond Admin vs Public.
- Bulk import tooling.

## Open Questions / Future Considerations

- Should recurring rides have a template system? (Future feature.)
- Do we need region-based subpages (e.g., city filters)?
- Integration with bike shop inventory or promotions? (Out of current scope.)

## Approval Checklist

- [ ] User journey validated
- [ ] Field list & enums accepted
- [ ] Filtering facets accepted
- [ ] Non-functional priorities accepted
- [ ] Out-of-scope confirmed

---

Provide feedback or requested adjustments. Once approved, an Implementation Plan section will be appended below in this same document.

---

## Implementation Plan

### Tech Stack (Assumed for MVP)
Next.js (App Router, TypeScript), Prisma ORM with SQLite (dev) / Postgres-ready schema (prod), Tailwind CSS for styling, ESLint + Prettier, Vitest + Testing Library for unit/component tests. Simple API routes inside Next.js handle CRUD; future extraction to dedicated backend is possible. Authentication placeholder via static admin token in env (`ADMIN_TOKEN`).

### High-Level Phases
1. Project Scaffold & Tooling
2. Data Model & Prisma Schema
3. Seed Data & Basic GET Listing API
4. Ride Listing UI (cards, responsive grid, new badge)
5. Filtering & URL State Sync
6. Ride Detail View (modal/page)
7. Admin CRUD (Create/Edit/Archive) + Validation
8. Timezone & Localization Utilities
9. Visual Indicators (Badges & Icons) + Accessibility pass
10. SEO & Structured Data (JSON-LD) for listing & detail
11. Error / Empty / Loading States
12. Security Hardening (auth gate, input sanitation)
13. Analytics Event Hooks (optional MVP+ flag)
14. Testing & Performance Baseline

### Task Breakdown & Checklists

#### 1. Project Scaffold & Tooling

- [x] Initialize Next.js TypeScript project structure
- [x] Configure Tailwind CSS
- [x] Add ESLint + Prettier config
- [x] Add Vitest + Testing Library setup
- [x] Add basic README and scripts

#### 2. Data Model & Prisma Schema

- [ ] Define Prisma enums (Difficulty, RideType, OrganizerType, RideStatus, RoutePlatform)
- [ ] Define `Group` model (fields & relations)
- [ ] Define `Ride` model (fields, indices)
- [ ] Run initial migration (dev) / generate client

#### 3. Seed Data & Basic GET Listing API

- [ ] Seed script with sample groups & rides (upcoming + past)
- [ ] `/api/rides` GET endpoint with filtering params placeholders
- [ ] Pagination (limit + cursor or offset) initial implementation
- [ ] Basic input validation for query params

#### 4. Ride Listing UI

- [ ] Responsive grid layout (1/2/3+ columns breakpoints)
- [ ] Ride card component with required metadata
- [ ] Difficulty & ride type badges, organizer icon placeholders
- [ ] New (<48h) indicator logic

#### 5. Filtering & URL State Sync

- [ ] Filter state store (client) + context
- [ ] Multi-select facets (difficulty, rideType, organizerType)
- [ ] Day-of-week & date range controls
- [ ] Free text search input
- [ ] URL query sync (push/replace) & shareable state
- [ ] Clear All + active filter count badge

#### 6. Ride Detail View

- [ ] Modal or dedicated route (`/rides/[id]`)
- [ ] Full metadata display + external links
- [ ] Local + original timezone display / toggle
- [ ] Maintain scroll position on close

#### 7. Admin CRUD

- [ ] Admin route gating (token check middleware)
- [ ] Create ride form (validations)
- [ ] Edit ride form (load + patch)
- [ ] Archive action (status -> ARCHIVED)
- [ ] Server-side validation & sanitation

#### 8. Timezone & Localization

- [ ] Utility to convert UTC to browser TZ
- [ ] Daylight saving correctness via `Intl.DateTimeFormat`
- [ ] Tooltip / toggle for original timezone code

#### 9. Visual Indicators & Accessibility

- [ ] Icon set with alt / aria-labels
- [ ] Color tokens meeting contrast (WCAG AA)
- [ ] Keyboard focus styles & logical tab order audit

#### 10. SEO & Structured Data

- [ ] Head metadata for listing (title, description)
- [ ] JSON-LD Event schema on ride detail
- [ ] Open Graph tags for ride detail

#### 11. Error / Empty / Loading States

- [ ] Skeleton components for loading
- [ ] Empty results guidance + reset filters
- [ ] Retry UI for network errors (preserve filters)

#### 12. Security & Auth Placeholder

- [ ] Validate & sanitize all inputs (server)
- [ ] Admin token check for write endpoints
- [ ] No HTML injection (escape notes markdown if rendered)

#### 13. Analytics (Optional MVP+)

- [ ] Event dispatcher util
- [ ] Hook events: ride_detail_view, filter_applied, route_link_click, group_link_click

#### 14. Testing & Performance

- [ ] Unit tests (utils, filtering logic)
- [ ] Component tests (RideCard, Filters, Detail)
- [ ] Integration test (API filtering)
- [ ] Lighthouse / basic performance snapshot

### Mapping Functional Requirements to Plan

| FR | Phase(s) |
|----|----------|
| FR-01 | 4, 5, 14 |
| FR-02 | 6 |
| FR-03 | 5 |
| FR-04 | 2 |
| FR-05 | 7 |
| FR-06 | 4, 9 |
| FR-07 | 8 |
| FR-08 | 3, 14 |
| FR-09 | 4, 9 |
| FR-10 | 10 |
| FR-11 | 11 |
| FR-12 | 7, 12 |
| FR-13 | 13 |

### Risk & Mitigation Notes

- Timezone complexity: rely on native Intl + store original IANA in record.
- Accessibility regressions: integrate automated checks (axe) during component development.
- Performance with future scale: pagination + indices early; avoid N+1 via Prisma includes.
- Security: Strict enum validation + URL sanitation.

### Current Progress Log

- [x] Phase 1: Scaffold
- [ ] Phase 2: Data Model
- [ ] Phase 3: Seed & API
- [ ] Phase 4+: UI layers

---

Updates to this plan will be versioned in-place; each completed task will be marked with [x].
