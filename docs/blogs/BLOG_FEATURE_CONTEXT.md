## BLOG FEATURE INTEGRATION FOR MWPLU

Describes the scope, the requirements and the goals of this feature.

### Context and goal

The main goal is to provide a **software interface** that assists human experts in creating, reviewing, and publishing SEO-optimized content, thereby improving the SEO rank of the MWPLU application.

The interface allows admins to:

* Publish blog articles on a dedicated `/blog` section.
* Set **company-wide context** (mission, values, tone, messaging) once, which is reused as global prompts for AI-assisted drafting across multiple articles or subjects.
* Ensure articles follow a content schedule and planner.
* Guarantee SEO hygiene and consistency through guided workflows.

---

### Potential feature development roadmap

1. Analysis and audit of MWPLU niche, the available raw documents scope that serve as inputs.
2. Analysis of the current state of the market in this niche in terms of blogs and articles, tutorials and walkthroughs.
3. Analysis of the best SEO strategy from renowned experts.
4. Translate analyses into feature requirements for the editor interface (global context input, SEO validation, content planning).
5. From a senior software development standpoint, monitoring, updating, and Human-In-The-Loop (HITL) in this process is a main concern. The goal is to facilitate the use of this AI-enhanced feature through an intuitive admin interface that connects scheduling and publishing workflows.
6. Build tools for fast feedback, monitoring, easy changes, testing features, and AI assistance (including multi-article drafting based on global company context).
7. The UI should follow branding guidelines; if not clear, document them before development.
8. Once the scope is jotted down, proceed to list all different processes (= logic or step-by-step flows).
9. Then write documentation explaining how they should be constructed and built.
10. A security and compliance audit will be processed over the documents first, then the code.

---

### Scope and non-goals

* **Scope**

  * Admin/editor interface with SEO guidance and validation
  * Company context input stored globally and applied to AI-assisted drafts
  * Publish SEO-oriented articles at `/blog` and `/blog/:slug`
  * Scheduling with draft → scheduled → published → archived states
  * LLM-assisted drafting with HITL review
  * SEO hygiene: canonical, OpenGraph/Twitter cards, JSON-LD Article, sitemap updates

* **Non-goals**

  * Comments system
  * Rich WYSIWYG editor beyond markdown + frontmatter
  * Multi-tenant blogging
  * Paywalls or subscriptions

---

### Editorial workflow

* States: draft → scheduled → published → archived

* Transitions:

  * draft → scheduled (requires: title, slug, excerpt, category, tags, cover image, SEO fields, company context applied)
  * scheduled → published (auto on `scheduled_at` or manual)
  * published → archived (keeps URL live with an “archived” banner)

* Preview: Signed URL via token; expires in 24h

* Scheduling SLA: publication job runs every 5 minutes

* The editor interface enforces SEO and company context validation before transitions.

---

### LLM generation & HITL

* Inputs: curated raw docs, competitor outlines, internal taxonomy, and **global company context**.
* Drafts are generated with consistent brand voice and messaging.
* HITL checklist integrated into the UI (fact-checking, SEO validation, plagiarism check, brand voice alignment).

---

### SEO checklist

* Page & site-level requirements remain the same (H1, meta, canonical, OpenGraph, JSON-LD, internal links, sitemap, robots).
* Integrated into the editor UI with real-time validation (warnings for missing/invalid fields).

---

### Analytics & KPIs

* **User-facing analytics:** blog views, scroll depth, CTA clicks, outlink clicks.
* **Editor analytics:** % of articles created with company context applied, % passing SEO checks before scheduling, average HITL review time, AI vs. human edit ratios.

---

### Acceptance criteria

* `/blog` lists published articles with pagination and filters.
* `/blog/:slug` renders article with SEO meta, JSON-LD, internal links.
* Admin/editor interface allows authors to set and reuse company context globally.
* Authors see real-time SEO validation and context alignment in the editor.
* Multiple articles can be drafted at once using global context.
* Preview route gated; drafts not indexable.
* Lighthouse SEO ≥ 90 on article pages.
* Analytics events fire with correct params (both user-facing and editor-facing).

