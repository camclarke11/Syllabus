## Cursor Cloud specific instructions

This repository ("Syllabus") is now a Next.js + TypeScript MVP for an AI-powered learning platform.

### Codebase overview
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript + React
- **Styling:** Tailwind CSS 4 + custom CSS variables
- **Animation:** Framer Motion
- **AI integration:** Anthropic SDK with mock fallback if API key is unavailable
- **Persistence (MVP):**
  - Server-side in-memory store (`lib/store.ts`) for courses/content/progress
  - Client-side localStorage for anonymous progress state (`lib/local-progress.ts`)

### Running the app
- `npm install`
- `npm run dev`
- `npm run lint`
- `npm run build`

### Key routes
- `/` — landing + topic generation
- `/course/[courseId]` — course overview
- `/course/[courseId]/[chapterOrder]/[subsectionOrder]` — lesson view
- `/dashboard` — user course list

### API routes (MVP)
- `POST /api/courses/generate`
- `GET /api/courses/:id`
- `DELETE /api/courses/:id`
- `POST /api/courses/:id/content`
- `GET /api/courses/:id/content/:subsectionId`
- `PATCH /api/progress`
- `GET /api/progress/:courseId`
- `GET /api/user/courses`
