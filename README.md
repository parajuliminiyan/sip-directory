# SIP Directory

 **Software Intensive Products (SIP) Directory** - a searchable database allowing engineers, managers, product owners, designers, and end-users to discover and compare software-intensive products with detailed hardware/software component information.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Search**: Typesense
- **Auth**: NextAuth.js
- **Monitoring**: Sentry
- **Testing**: Vitest (unit), Playwright (E2E)

## Getting Started

### Prerequisites

- Node.js 18.17.0 or higher
- PostgreSQL database
- Typesense instance (local or cloud)

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your database and service credentials.

3. Initialize the database:

```bash
pnpm db:migrate
pnpm db:seed
```

4. Index search data:

```bash
pnpm tsx scripts/index-sips.ts
```

5. Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
├── app/                  # Next.js App Router pages and API routes
├── components/           # React components
│   └── ui/              # shadcn/ui components
├── lib/                 # Shared utilities and configurations
├── prisma/              # Database schema and migrations
├── scripts/             # Utility scripts (indexing, etc.)
├── etl/                 # ETL pipeline for data ingestion
└── tests/               # Unit and E2E tests
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm db:migrate` - Run database migrations
- `pnpm db:seed` - Seed database with sample data
- `pnpm etl:run` - Run ETL pipeline

## Features

- **Search SIPs** - Fuzzy and partial search by name, category, OS
- **Detail View** - Comprehensive product information
- **Compare** - Side-by-side comparison of two SIPs
- **Statistics** - Aggregated data by category, OS, supplier, manufacturer
- **Categories** - Support for Appliances and Wearables (expandable)
