# Leadgen Approvals

A Next.js 14 application for managing ad creative approvals between agencies and clients.

## Features

- Agency users upload ad creatives (images/videos)
- Client users approve/reject creatives with a Tinder-style swipe interface
- Email notifications for new creative uploads
- Separate libraries for approved and rejected creatives

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- NextAuth.js for authentication
- Prisma ORM with PostgreSQL
- Vercel Blob storage
- Resend for emails
- Tailwind CSS + shadcn/ui
- Framer Motion
- SWR for data fetching

## Getting Started

1. Install dependencies:
   ```
   pnpm install
   ```

2. Set up environment variables:
   ```
   cp env.example .env
   ```

3. Run the database migrations:
   ```
   pnpm prisma migrate dev
   ```

4. Seed the database with test users:
   ```
   pnpm db:seed
   ```

5. Start the development server:
   ```
   pnpm dev
   ```

## Deployment

Deploy to Vercel:

```
vercel --prod --yes
```

## Database Schema

- User: Authentication and role management
- Client: Organization details
- Creative: Ad creatives uploaded by agency users
- Approval: Approval/rejection records with feedback 