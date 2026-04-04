---
name: Learning Goals Dashboard
description: Full-stack Next.js 16 learning goals tracker with public dashboard, admin auth, and Tiptap documentation editor
type: project
---

This is a personal learning goals tracker for an IT student. Built with Next.js 16.2.1 App Router.

**Key Architecture**:
- Data source: `docs/LEARNING_GOALS.md` parsed at runtime (JS object in md file)
- User progress stored in `data/goals.json` (flat JSON, key = goal ID like "1_1")
- Goal ID format: `"1_1"` from goal text like "1.1 You identify..."
- Auth: bcrypt hash in `ADMIN_PASSWORD_HASH` env var (default password: "changeme"), JWT in httpOnly cookie `admin_session`
- Proxy (not middleware — Next.js 16 renamed it) in `proxy.ts`

**Routes**:
- `/` — public dashboard (server component → DashboardClient)
- `/admin` — login page (client component)
- `/admin/dashboard` — admin goals manager (protected by proxy.ts)
- `/admin/goals/[id]` — Tiptap documentation editor per goal (protected)
- `/api/auth/login` POST, `/api/auth/logout` POST
- `/api/goals` GET, `/api/goals/[id]` GET/PUT
- `/api/upload` POST — saves to `public/uploads/`

**Design**: BotnariCreative system — dark (#050505), white-opacity-only scale, grain SVG, GSAP animations, pill header, corner brackets on hover.

**Tiptap**: v3.21.0. `Node`/`mergeAttributes` import from `@tiptap/react` (not `@tiptap/core` — it doesn't exist in v3). Custom VideoNode for uploaded videos. YouTube extension for embeds.

**Next.js 16 breaking changes applied**:
- `middleware.ts` renamed to `proxy.ts`, function renamed from `middleware` to `proxy`
- `params` in route handlers are `Promise<{id: string}>` → must be awaited
- `cookies()` from `next/headers` is async → must be awaited

**Why:** Student needs to track ~136 learning objectives across 9 categories (Analysis, AI, Web, Business, Soft Skills, Cloud, Data, Devops, Infrastructure), document evidence, and let a teacher verify completion.
