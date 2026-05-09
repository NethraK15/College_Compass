# CollegeCompass MVP

Production-grade MVP for a College Discovery + Decision Platform.

## Tech Stack

- Frontend: Next.js App Router + TypeScript + Tailwind CSS
- Backend: Next.js API Routes (Node.js runtime) + TypeScript
- Database: PostgreSQL + Prisma ORM
- Auth: JWT-based authentication
- State + Data Fetching: Zustand + React Query

## Full Folder Structure

```txt
AI_Signal/
  app/
    api/
      auth/
        login/route.ts
        signup/route.ts
      colleges/
        [id]/route.ts
        route.ts
      compare/route.ts
      predict/route.ts
      questions/
        [id]/answers/route.ts
        route.ts
      saved-colleges/route.ts
      saved-comparisons/route.ts
    college/
      [id]/page.tsx
    compare/page.tsx
    login/page.tsx
    predictor/page.tsx
    questions/page.tsx
    saved/page.tsx
    signup/page.tsx
    globals.css
    layout.tsx
    page.tsx
    providers.tsx
  components/
    CollegeCard.tsx
    ErrorState.tsx
    LoadingState.tsx
    Navbar.tsx
    Pagination.tsx
    ProtectedView.tsx
  hooks/
    useDebounce.ts
  lib/
    auth.ts
    jwt.ts
    prisma.ts
    utils.ts
  prisma/
    schema.prisma
    seed.ts
  services/
    api.ts
  store/
    authStore.ts
  types/
    index.ts
  .env.example
  .eslintrc.json
  .gitignore
  middleware.ts
  next-env.d.ts
  next.config.ts
  package.json
  postcss.config.js
  README.md
  tailwind.config.ts
  tsconfig.json
```

## Prisma Schema

Schema is defined in:
- `prisma/schema.prisma`

Models included:
- User
- College
- Course
- Review
- Placement
- Question
- Answer
- SavedCollege
- SavedComparison
- EligibilityRule (for predictor rank logic)

## API Endpoints

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/colleges?search=&location=&minFees=&maxFees=&page=&pageSize=`
- `GET /api/colleges/:id`
- `POST /api/compare`
- `POST /api/predict`
- `GET /api/questions`
- `POST /api/questions`
- `POST /api/questions/:id/answers`
- `GET /api/saved-colleges`
- `POST /api/saved-colleges`
- `DELETE /api/saved-colleges`
- `GET /api/saved-comparisons`
- `POST /api/saved-comparisons`

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Configure environment

```bash
cp .env.example .env
```

3. Ensure PostgreSQL is running and update `DATABASE_URL` in `.env`.

4. Run migrations

```bash
npx prisma migrate dev --name init
```

5. Seed database

```bash
npm run prisma:seed
```

6. Start development server

```bash
npm run dev
```

7. Open `http://localhost:3000`

### Demo Credentials

- Email: `aarav@example.com`
- Password: `Password@123`

## Deployment

### Vercel (App + API)

1. Push this repo to GitHub.
2. Import project in Vercel.
3. Add env vars in Vercel Project Settings:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_API_BASE_URL` (your Vercel domain)
4. Build command: `npm run build`
5. Output: `.next` (default for Next.js)
6. Deploy.

### Railway (PostgreSQL)

1. Create PostgreSQL service in Railway.
2. Copy connection string and set as `DATABASE_URL` in Vercel env vars.
3. Run migration in Railway shell or local:

```bash
npx prisma migrate deploy
npm run prisma:seed
```

### Render Alternative (PostgreSQL + Web Service)

1. Create PostgreSQL database in Render.
2. Create web service from repo.
3. Add env vars:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_API_BASE_URL`
4. Build command:

```bash
npm install && npm run build
```

5. Start command:

```bash
npm run start
```

6. Run migrations and seed once:

```bash
npx prisma migrate deploy
npm run prisma:seed
```

## Notes

- Listing page supports debounced search, location + fee filters, and pagination.
- College detail page includes overview, courses, placements, and DB-backed reviews.
- Compare supports selecting 2-3 colleges and saving comparison for authenticated users.
- Predictor uses DB-stored exam/rank rules.
- Q&A supports posting questions and answers with DB persistence.
- Saved page is protected via middleware and JWT cookie check.
