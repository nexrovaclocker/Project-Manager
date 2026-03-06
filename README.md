# Clocker - Operational Time & Notes Dashboard

Clocker is a full-stack Next.js 14 application used for time tracking and shared operational notes. It is designed with a dark, monospace, tech-inspired aesthetic similar to shift5.io.

## Features

- **Role-based Access Control**: Two roles (`admin` and `member`).
- **Time Tracking**: Clock in/out functionality with mandatory session notes on clock-out.
- **Shared Records**: Collaborative, real-time shared notes with Text Blocks and Checklists (Todo Items) that anyone can check off.
- **Admin Analytics**: Recharts-powered dashboard showing total hours over 7 days, daily bar charts, and per-session duration metrics for any selected user.
- **User Provisioning**: Admins can quickly provision new user accounts from the portal.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma (v7)
- **Auth**: NextAuth.js (Credentials Provider / bcryptjs)
- **Styling**: Tailwind CSS v4 (Custom UI variables)
- **Charts**: Recharts

## Setup & Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Duplicate `.env.example` into a new `.env.local` file and fill in your Supabase connection strings:
   ```env
   DATABASE_URL="postgres://postgres...[YOUR-SUPABASE-URL]:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgres://postgres...[YOUR-SUPABASE-URL]:5432/postgres"

   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your_random_secret_string_here"
   ```

3. **Database Migration**
   Push the schema to your Supabase PostgreSQL database:
   ```bash
   npx prisma db push
   ```
   *(Note: Prisma 7 uses `prisma.config.ts` for connection details behind the scenes.)*

4. **Seed the Database**
   Create the default admin user by running the seed script:
   ```bash
   npx tsx prisma/seed.ts
   ```
   *Default Admin Credentials:*
   - Username: `admin`
   - Password: `admin123`

5. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to access the application.

## Vercel Deployment

This project is fully ready for deployment on Vercel.

1. Connect your GitHub repository to Vercel.
2. In the Vercel project settings, ensure the **Build Command** is: `prisma generate && next build`. Note: Vercel usually auto-detects Prisma and runs the generate step automatically.
3. Add the following **Environment Variables** in Vercel:
   - `DATABASE_URL` (Connection pooling URL)
   - `DIRECT_URL` (Direct DB connection URL)
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (Set this to your Vercel production URL, e.g., `https://my-clocker-app.vercel.app`)

Upon the first deployment, the build will generate the Prisma Client. After deployment, make sure you push the Prisma schema and run the seed script locally pointing to your production database, or use Supabase dashboard to seed it manually.
