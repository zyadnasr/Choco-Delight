# Choco Delight Backend

Local API built with Express, TypeScript and Prisma, connected to the Choco Delight Supabase PostgreSQL project.

## Setup

```powershell
Copy-Item .env.example .env
# Fill DATABASE_URL and DIRECT_URL from D:\Choco Delight\.env.supabase.local
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

Health check: `GET http://127.0.0.1:4000/api/health`

Seed admin: `admin@chocodelight.local` / `ChangeMe123!` — change this before any shared or production deployment.
