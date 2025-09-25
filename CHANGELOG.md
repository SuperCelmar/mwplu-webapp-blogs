## 2025-09-25

- Blogs[status]: Added new article status 'ready' to workflow (draft → ready → scheduled/published → archived). Updated docs schema and created idempotent SQL migration `docs/blogs/BLOG_ADD_READY_STATUS.sql` to extend CHECK constraint.
- Frontend[editor]: Save button now marks article as ready when metadata is complete. Implemented `dbService.markArticleReady` and wired in `PreviewBlogEditor.vue` and `BlogArticleEditorView.vue`. Shows success toast and redirects to dashboard after 1s.
- Tests: Updated `src/views/dev/blog/__tests__/PreviewBlogEditor.spec.js` to expect mark-ready behavior and redirect.
- Admin[editor]: When article status is `ready`, the primary action becomes "Planifier"; opens `BlogScheduleModal` to set `scheduled_at` and auto-publish flag; on save calls `dbService.scheduleArticle` and redirects after 1s. Added tests in `src/views/admin/__tests__/BlogArticleEditorView.spec.js`.

- Add global `GlobalNotification` mount in `src/App.vue` to ensure toasts appear across routes
- Instrument blog draft flow: debug logs and success/error toasts in `PreviewBlogEditor.vue`
- Add debug logs inside `dbService.saveBlogDraft` in `src/services/supabase.js` for visibility of call path
- Add `docs/blogs/BLOG_RLS_ALLOW_EDITORS_BLOG_ARTICLES.sql` to align `blog_articles` FK to `public.profiles(id)` and RLS using roles from `auth.users.raw_user_meta_data`; ensure profile existence in `saveBlogDraft`
- Update SQL to add SECURITY DEFINER helper `public.has_any_roles(text[])` and use it in policies to avoid client SELECT on `auth.users`
- Dev editor UX: show global toasts via errorHandler and redirect to dev dashboard 1s after successful draft save (`src/views/dev/blog/PreviewBlogEditor.vue`)

## 2025-09-25

- Added Blog Editor preview wiring: `PreviewBlogEditor.vue` now handles `@save` and `@validate` events and integrates with Supabase via `dbService` with notifications.
- Implemented `dbService.saveBlogDraft` to insert drafts into `blog_articles` with graceful local-dev fallback.
- Added integration tests `src/views/dev/blog/__tests__/PreviewBlogEditor.spec.js` to verify button flows, Supabase calls, and UI notifications.

- Added metadata modal `BlogMetadataModal.vue` and updated `BlogEditor.vue` to 3-button gated flow: "Valider Metadonnée", "Enregistrer Brouillon", "Enregistrer l’article" (publish gated until metadata validated).
- Extended Supabase service with taxonomy fetch (`getBlogCategories`, `getBlogTags`), tag linking (`setArticleTags`), and publishing (`publishArticle`).
- Updated dev preview to load taxonomy, open modal, validate metadata via edge function, save drafts, and publish; expanded tests to cover modal and gating.

## 2025-09-24

- Admin Blog: Added top banner with quick admin menu and theme toggle.
- New `ThemeToggleButton` component leveraging `useUIStore` theme state.
- Wrapped `BlogAdminView` with `AppLayout` and breadcrumbs.
- Tests: Added `ThemeToggleButton.spec.js` and updated `BlogAdminView.spec.js` to assert banner and toggle.

- 2025-09-24T00:00:00Z (assistant) - Frontend[CompanyContext]: Aligned `CompanyContextManager.vue` with UX (welcome → edit → view, no history). Added complete field validation (name, mission, tone, messaging, brand guidelines), gated Edit button by authentication, and prevented duplicate submissions with a local `submitting` guard. Updated tests in `src/components/blog/__tests__/CompanyContextManager.spec.js` accordingly; all unit tests pass.

# Changelog

## 2025-06-02
- 2025-06-02T13:41:07+02:00 (Florent) ded9d0d - Initial commit
- 2025-06-02T13:23:02+00:00 (Florent) dc05ad7 - reafactor: 1.1  Project Setup
- 2025-06-02T13:48:39+00:00 (Florent) c2c2c32 - refactor: 1.2 Project Structure Setup
- 2025-06-02T15:43:15+00:00 (Florent) 82a43e7 - refactor: 1.3 Core Infrastructure

## 2025-06-08
- 2025-06-08T15:08:02+02:00 (fllin1) bc0cd77 - chore : enhancing refactor plan, backup before Phase 2

## 2025-06-11
- 2025-06-11T18:46:07+02:00 (fllin1) 9e3ec0b - refactor: 2.1, 2.2, 2.3, 2.5, 3.1, 3.2 Authentication system, Google Analytics, Layout Components. TODO : verify the auth and google analytics; improve the header display and components; add cookies banner
- 2025-06-11T19:46:02+02:00 (fllin1) 08a5eff - refactor: 4.1 Adding the city feature + Cookie Banner TODO : Verify the authentification
- 2025-06-11T19:46:45+02:00 (Florent) 7bcf18f - chore: Delete .env
- 2025-06-11T22:50:35+02:00 (fllin1) e52ec2d - chore: Google auth form functionnal, error messages color corrected, optionnal phone number added

## 2025-06-23
- 2025-06-23T22:23:14+02:00 (fllin1) 8724a0e - fix: auth pages UI, cleaned headers

## 2025-06-25
- 2025-06-25T21:23:03+02:00 (fllin1) 727de54 - chore: style improvement, photos added in about page

## 2025-06-28
- 2025-06-28T18:49:53+02:00 (fllin1) 967ab79 - feat[donation]: added the donation system (need to assert that it works), improve elements of the UI (policies pages, corrected modal, coming soon page), started the refactoring phase 4.2 (in progress...)
- 2025-06-28T21:35:33+02:00 (fllin1) 94665e2 - fix: improved breadcrumbs, refactor of the plu-synthesis pages' code + routing

## 2025-06-29
- 2025-06-29T12:18:09+02:00 (fllin1) 281bf7e - fix: improve authentication UX and error handling

## 2025-07-01
- 2025-07-01T21:47:19+02:00 (fllin1) 6fa868e - chore: UI and UX changes

## 2025-07-05
- 2025-07-05T21:17:09+02:00 (fllin1) 038178b - fix: comments and ratings finally working, with soft delete feature for comments + tracking of downloads

## 2025-07-27
- 2025-07-27T15:33:13+02:00 (fllin1) a379fd5 - fix: analytics, cookie banner still not operationnal on production (seems to work in dev environment)

## 2025-08-02
- 2025-08-02T21:33:42+02:00 (fllin1) 3879018 - fix[comments]: fixed soft delete, replaced by hard delete + backup, fixed issue where comments were not actually deleted.

## 2025-08-03
- 2025-08-03T17:03:18+02:00 (fllin1) 527cc88 - feat[dashboard+contact] : contact form connected to Discord channel + dashboard operational with history

## 2025-08-09
- 2025-08-09T15:42:29+02:00 (fllin1) 1afd275 - chore[cursor_rules]: Updated cursor rules w/ GPT5
- 2025-08-09T15:44:07+02:00 (fllin1) 88f3c96 - Merge branch 'main' of https://github.com/fllin1/mwplu_webapp
- 2025-08-09T22:57:07+02:00 (fllin1) 1396354 - feat[search-address]: added search feature on the home page.

## 2025-08-11
- 2025-08-11T11:35:40+02:00 (fllin1) 8b0665e - fix[cookie]: renaming cookie banner to privacy banner, bypassing Brave Shield blocker.

## 2025-08-12
- 2025-08-12T21:40:16+01:00 (fllin1) 8c6b083 - fix[search]: link the exact source to an approximation if it doesn't exist in the Database
- 2025-08-12T22:43:00+01:00 (fllin1) e2625fc - feat[dark-mode]: Adding the dark mode, with simple toogle in header, addaptative X and MWPLU logos.

## 2025-08-13
- 2025-08-13T10:22:14+01:00 (fllin1) 9c9a7a3 - feat[download-limit]: adding a download limit logic with supabase download credit

## 2025-08-19
- 2025-08-19T22:58:17+02:00 (fllin1) 742fa3d - feat[auth]: Reset password and signup confirmation feature functional

## 2025-09-21

- Added `DevEnvWarning` component to show a dev-only banner prompting to set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`.
- Updated `src/services/supabase.js` to export `isSupabaseConfigured` and avoid throwing on import without env vars (no-op proxy until actually used).
- Guarded `src/stores/auth.js` to skip Supabase initialization and listeners when not configured.
- Wired the banner into `App.vue` so developers see it only in development.
- Restored missing `src/components/HelloWorld.vue` to satisfy existing unit test.
- Tweaked `DevEnvWarning` to a smaller top-right toast matching debug notifications (reduced icon size, compact text).
 - Docs[blogs]: Enriched `docs/blogs/BLOG_FEATURE_CONTEXT.md` with scope/non-goals, glossary, URLs, content model, editorial workflow, LLM HITL pipeline, SEO checklist, analytics KPIs, UI components, performance, risks, and acceptance criteria.
 - Docs[blogs]: Created comprehensive `docs/blogs/BLOG_IMPLEMENTATION_GUIDE.md` with step-by-step feature development plan, database schema design, backend infrastructure, frontend components, SEO integration, 12-week implementation timeline, testing strategy, and deployment procedures for the MWPLU blog system.
 - Docs[blogs]: Added Preview Carousel UX spec to `docs/blogs/COMPONENTS_UX_DESCRIPTION.md` describing slides (Article Page, Listing Row, SEO snippet, X/Twitter card), behavior, fallbacks, accessibility, and replacement of the editor's preview column.

## 2025-09-23

- 2025-09-23T00:00:00Z (assistant) - DB[blogs]: Created `public.company_context` table in Supabase project `mwplu` with RLS enabled, policies: "Users can view active company context" and "Admins can manage company context"; added trigger `update_company_context_updated_at`; enforced single active record via partial unique index `company_context_one_active_row`.
 - 2025-09-23T00:00:00Z (assistant) - DB[blogs]: Created Phase 1 core blog tables `public.blog_categories`, `public.blog_tags`, `public.blog_articles`, `public.blog_article_tags`, `public.blog_content_planner`; enabled RLS and added policies per spec; added `updated_at` triggers to `blog_articles` and `blog_content_planner`.
 - 2025-09-23T00:00:00Z (assistant) - Auth[roles]: Set roles in `auth.users.raw_user_meta_data` — admins: `m10.pro.cel@gmail.com`, `linflorent@hotmail.fr`; editors: `1florentlin@gmail.com`, `lin.marcel.pro@gmail.com`. Verified policy presence on blog tables.
 - 2025-09-23T00:00:00Z (assistant) - DB[blogs]: Prepared Phase 2 SQL files: `docs/blogs/BLOG_PHASE_2_VALIDATION.sql` (read-only checks for policies, RLS, triggers, indexes) and `docs/blogs/BLOG_PHASE_2_RLS_TRIGGERS.sql` (idempotent trigger creation + RLS enable). Pending apply to Supabase project `mwplu`.
 - 2025-09-23T00:00:00Z (assistant) - DB[blogs Phase 2]: Added `public.blog_analytics_events` and `public.blog_seo_audits` tables with RLS enabled and SELECT policies for admins/editors; created missing trigger `update_blog_content_planner_updated_at`; validated presence of triggers and policies.
 - 2025-09-23T00:00:00Z (assistant) - Edge Functions[blogs]: Deployed `generate-blog-content` (supports Anthropic/Gemini with heuristic fallback), `validate-seo` (heuristic scoring with optional persistence), `process-analytics` (server-side event ingestion), and `schedule-publication` (cron-protected auto-publish). Added minimal unit tests per function.
 - 2025-09-23T00:00:00Z (assistant) - Frontend Services: Added `generateBlogContent`, `validateSEO`, and `sendBlogAnalyticsEvent` in `src/services/supabase.js` to call new Edge Functions.

## 2025-09-24

- 2025-09-24T00:00:00Z (assistant) - Docs[branding]: Created `docs/branding/STYLE_GUIDE.md` consolidating tokens, layout, components, interactions, accessibility, theming, and usage examples for the MWPLU web app UI. Serves as the single source of truth for styling and theming consistency across new features (including the blog).
 - 2025-09-24T00:00:00Z (assistant) - Docs[branding]: Added interactive, self-contained style guide showcase `docs/branding/style-guide-showcase.html` rendering tokens (colors, typography, spacing, radii, shadows, z-index), layout utilities, components (buttons, forms, card, modal, alerts, table, breadcrumbs), interactions/motion (hover/focus/active, spinner, dropdown animation), accessibility demos, and Dos/Don’ts, with dark mode toggle.
 - 2025-09-24T00:00:00Z (assistant) - Routes[blogs]: Added `'/admin/blog'` for the composed admin dashboard, and dev preview routes for individual components: `'/dev/blog/dashboard'`, `'/dev/blog/stats'`, `'/dev/blog/planner'`, `'/dev/blog/list'`, `'/dev/blog/calendar'`.
  - 2025-09-24T00:00:00Z (assistant) - Docs[blogs]: Updated `docs/blogs/BLOG_IMPLEMENTATION_GUIDE.md` Phase checklist to tick off completed UI items (BlogDashboard, admin routing, article list/filter UI skeleton, scheduling UI skeleton, planning calendar UI skeleton).
 - 2025-09-24T00:00:00Z (assistant) - Frontend[blogs]: Added foundational admin blog UI components aligned with the style guide — `BlogDashboard.vue`, `BlogStatsOverview.vue`, `BlogContentPlanner.vue`, `BlogArticleList.vue`, `BlogSchedulingCalendar.vue` — and composed them in `src/views/admin/BlogAdminView.vue`. Included unit tests for each component and the admin view; all tests pass with Vitest.
 - 2025-09-24T00:00:00Z (assistant) - Docs[blogs]: Updated `docs/blogs/BLOG_IMPLEMENTATION_GUIDE.md` checklist to tick completed backend items (DB tables/RLS/triggers, basic functions), LLM integration (Anthropic/Gemini with heuristic fallback), and heuristic SEO checks (issues, keyword density).
 - 2025-09-24T00:00:00Z (assistant) - DB[blogs]: Added idempotent taxonomy seed `docs/blogs/SEED_BLOG_TAXONOMY.sql` for `blog_categories` and `blog_tags` using `ON CONFLICT (slug) DO UPDATE`, safe to re-run across environments.
 - 2025-09-24T00:00:00Z (assistant) - Scripts[blogs]: Added reusable seeding script `scripts/seedTaxonomy.js` and npm script `seed:blog`. Requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`; respects idempotency.
 - 2025-09-24T00:00:00Z (assistant) - Tests[blogs]: Added integration test `tests/blog/seed-taxonomy.spec.js` that seeds via service role and asserts presence of expected slugs and idempotency. Tests auto-skip if env vars are not set.

- 2025-09-24T00:00:00Z (assistant) - Frontend[blogs]: Added `src/stores/companyContext.js` Pinia store to manage global company context state (name, mission, tone, messaging, brand guidelines, active) with local history snapshots and simple validation.
- 2025-09-24T00:00:00Z (assistant) - Frontend[blogs]: Implemented `src/components/blog/CompanyContextManager.vue` with a basic form, live preview, and history placeholders aligned with the style guide. Bound inputs directly to store refs.
- 2025-09-24T00:00:00Z (assistant) - Tests[blogs]: Created unit tests `src/components/blog/__tests__/CompanyContextManager.spec.js` covering rendering, required field validation, and live preview updates. All unit tests pass.
- 2025-09-24T00:00:00Z (assistant) - Admin[blogs]: Wired `CompanyContextManager` into `src/views/admin/BlogAdminView.vue` and updated its test to mount with Pinia and assert presence of the new section. All tests pass.
 - 2025-09-24T00:00:00Z (assistant) - Docs[blogs]: Updated `BLOG_IMPLEMENTATION_GUIDE.md` checklist marking CompanyContextManager as implemented.

- 2025-09-24T00:00:00Z (assistant) - Frontend[blogs]: Implemented `src/components/blog/BlogEditor.vue` with header/sidebar/main/footer layout. Sidebar includes SEO fields (meta title, description, canonical URL) styled via tokens from the style guide. Main area contains a markdown textarea with live preview.
- 2025-09-24T00:00:00Z (assistant) - Tests[blogs]: Added `src/components/blog/__tests__/BlogEditor.spec.js` covering section rendering, live preview mirroring input, and `save`/`validate` event emissions with payloads. Lints pass.
 - 2025-09-24T00:00:00Z (assistant) - Env: Created `.env.local` (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) using MCP Supabase project `mwplu` values.
 - 2025-09-24T00:00:00Z (assistant) - Mapping[blogs]: Mapped admin blog UI to Supabase tables/columns for upcoming CRUD wiring.

- 2025-09-24T00:00:00Z (assistant) - Fix/UX[CompanyContext]: Prevented duplicate saves and simplified UX. Introduced store `mode` (`welcome`→`edit`→`view`) and `saving` guard; Save button now disables while saving. Removed local history list. Store loads/saves via new Supabase helpers; added tests for single-save and flow.
 - 2025-09-24T00:00:00Z (assistant) - DB[blogs]: Added `docs/blogs/BLOG_RLS_ALLOW_EDITORS_COMPANY_CONTEXT.sql` to update RLS so both admins and editors can manage `public.company_context`, idempotently recreating the manage policy and enforcing single active row.
 - 2025-09-24T00:00:00Z (assistant) - Auth[roles]: Granted `editor` role to `p.e.r.s.e.n.n.e.l.75019@gmail.com` in Supabase project `mwplu` (`auth.users.raw_app_meta_data.roles`). Verified assignment.
 - 2025-09-24T00:00:00Z (assistant) - RLS[company_context]: Updated policy "Admins and editors can manage company context" to check `auth.users.raw_app_meta_data->'roles'` array for `admin`/`editor` instead of `raw_user_meta_data.role`. Fixes permission denied for editors saving company context.
 - 2025-09-24T00:00:00Z (assistant) - RLS[company_context]: Switched policy to JWT-based check `auth.jwt()->'app_metadata'->'roles'` for `admin`/`editor` to avoid querying `auth.users` (error 42501). Verified policy in `pg_policies`.

- Frontend[blogs]: Added `BlogPreviewCarousel.vue` with 4 realistic slides (Article page, Listing row, Google SERP snippet, X/Twitter card) styled via tokens and dark-mode aware; integrated into `BlogEditor.vue` replacing the old preview area. Added unit tests `BlogPreviewCarousel.spec.js` covering slides, navigation, and fallbacks.
- Frontend[blogs]: Enhanced `BlogPreviewCarousel.vue` with lightweight markdown-like rendering in the article slide and refined SERP/Twitter styles (line-heights, truncation, image placeholders). Tests updated to assert content presence.
- Frontend[blogs]: Preview Carousel brand cues: Google-like SERP typography/colors and X/Twitter card tweaks; listing preview now behaves like a link (role=link, focusable, hover elevation). Updated tests to assert semantics.
- Frontend[blogs]: Preview Carousel — added SERP theme toggle (light/dark) with brand-accurate colors and adjusted typography; tests assert theme switching.
- Frontend[blogs]: SERP theme toggle is now contextual (visible only on SERP slide). Tests updated accordingly.

## 2025-09-25

- Admin Blog: Implemented draft listing with status filter and pagination in `src/components/blog/BlogArticleList.vue`.
- Services: Added `dbService.listBlogArticles` to fetch articles by status with pagination, with local-dev fallback.
- Routing: Added `admin-blog-editor` route (`/admin/blog/editor/:id`) pointing to preview editor for now.
- Tests: Added `tests/blog/list-articles.spec.js` and extended `BlogArticleList.spec.js` for filter presence.

- Editor: `BlogEditor` now initializes `content` from `initialContent` when empty, ensuring late-loaded drafts populate the textarea.
- Admin Editor: Cover image now falls back to `og_image_url` / `twitter_image_url` when `cover_image_url` is missing.

- 2025-09-25 (assistant) - Fix: Blog metadata modal "Enregistrer" now persists `category_id`, `tag_ids`, and `cover_image_url` to `public.blog_articles` and `public.blog_article_tags`. Added partial upsert to avoid clearing content. Extended tests in `src/views/dev/blog/__tests__/PreviewBlogEditor.spec.js` to cover metadata persistence flows.
- 2025-09-25 (assistant) - UX: "Enregistrer Brouillon" now redirects immediately to the dev blog dashboard without showing a blocking full-screen success overlay.

- 2025-09-25 (assistant) - Frontend[blogs]: Added reusable `BlogAdminBanner.vue` and integrated it across all blog paths: `BlogAdminView`, `BlogArticleEditorView`, and dev previews (`PreviewBlogDashboard`, `PreviewBlogStatsOverview`, `PreviewBlogContentPlanner`, `PreviewBlogArticleList`, `PreviewBlogSchedulingCalendar`, `PreviewBlogEditor`). Added tests asserting banner presence on those views.
