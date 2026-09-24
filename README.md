# Trao Interview Prep Kit

This project is a polished interview-prep application with user authentication, MongoDB persistence, and end-to-end interview kit generation. It accepts a job description and company URL, extracts likely requirements, and turns them into a study kit with questions, flashcards and a schedule.

## Features

- Login and registration flow
- MongoDB Atlas persistence for users and saved kits
- Interview-kit generation with deterministic fallback logic
- Optional OpenAI-powered generation when `OPENAI_API_KEY` is configured
- Batch evaluation entry point for multiple job descriptions

## Local setup

1. Copy `.env.example` to `.env.local` and add your own MongoDB Atlas connection string and JWT secret.
2. Install dependencies:

```bash
npm install
```

3. Start the app:

```bash
npm run dev
```

4. Open http://localhost:3000.

## Batch evaluation

```bash
npm run evaluate -- --input cases.json --output kits.json
```

Example input:

```json
[
  {
    "id": "case-1",
    "jd": "Senior frontend engineer with React, TypeScript, mentoring and product leadership experience.",
    "company_url": "https://example.com/careers",
    "days": 5
  }
]
```

## Environment variables

The app expects the following values in `.env.local`:

- `MONGODB_URI` — your MongoDB Atlas cluster connection string
- `MONGODB_DB_NAME` — database name, defaults to `interview-kit`
- `JWT_SECRET` — secret used for signed login sessions
- `OPENAI_API_KEY` — optional, enables AI-based kit generation
- `OPENAI_MODEL` — optional default model (`gpt-4o-mini`)

## Scripts

- `npm run dev` — start the app locally
- `npm run build` — build for production
- `npm run start` — preview the production build
- `npm run lint` — lint the codebase
- `npm run evaluate` — run the batch generator
- `npm test` — validate the core logic

## Notes

The application uses a deterministic kit builder as a secure fallback, and only calls OpenAI when an API key is set. That keeps the project operational even when AI credentials are unavailable.
