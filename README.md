# Syllabus

Syllabus is an AI-powered learning platform that turns any topic into a structured, chapter-based course with immersive lesson reading, inline quizzes, and progress tracking.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Framer Motion
- Anthropic Claude API (with mock fallback if no API key)
- In-memory storage (MVP) + localStorage progress for anonymous users

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

Optional (for real AI generation):

```bash
ANTHROPIC_API_KEY=your_key
ANTHROPIC_MODEL=claude-3-7-sonnet-latest
```

Without `ANTHROPIC_API_KEY`, the app uses deterministic mock generation so the full flow still works.

## Routes

- `/` — landing page + topic input + generation stream
- `/course/[courseId]` — course overview / table of contents
- `/course/[courseId]/[chapterOrder]/[subsectionOrder]` — lesson view
- `/dashboard` — anonymous user dashboard

## API (MVP)

- `POST /api/courses/generate`
- `GET /api/courses/:id`
- `DELETE /api/courses/:id`
- `POST /api/courses/:id/content`
- `GET /api/courses/:id/content/:subsectionId`
- `PATCH /api/progress`
- `GET /api/progress/:courseId`
- `GET /api/user/courses`
