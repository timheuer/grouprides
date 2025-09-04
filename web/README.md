# Group Ride Directory Web App

## Setup

1. Install dependencies:
   ```pwsh
   cd web
   npm install
   ```
2. Set up environment:
   - Copy `.env.example` to `.env` and set values.
3. Run Prisma migration & generate client:
   ```pwsh
   npx prisma migrate dev --name init
   npx prisma generate
   ```
4. Start development server:
   ```pwsh
   npm run dev
   ```

## Tech Stack
- Next.js (App Router, TypeScript)
- Tailwind CSS
- Prisma ORM (SQLite dev, Postgres-ready)
- ESLint + Prettier
- Vitest + Testing Library

## Next Steps
- Seed sample data
- Implement API endpoints
- Build UI components
