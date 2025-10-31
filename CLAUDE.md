# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **névé**, an e-commerce platform built with TanStack Start (React SSR framework) featuring marketplace functionality with both regular products and auction listings. The application supports multi-language (English/Farsi with RTL), phone-based authentication, shopping cart with local/server sync, and real-time auction bidding.

## Technology Stack

- **Framework**: TanStack Start (SSR) with Vite
- **Runtime**: Bun (target runtime for production)
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **State Management**: Jotai (atoms)
- **Data Fetching**: TanStack Query
- **Routing**: TanStack Router (file-based)
- **Forms**: React Hook Form + Zod validation
- **Testing**: Vitest + Testing Library

## Development Commands

```bash
# Install dependencies
npm install

# Development server (runs on port 3000)
npm run dev

# Production build
npm run build

# Start production server (requires build first)
npm run start

# Run tests
npm run test

# Linting and formatting
npm run lint        # Run ESLint
npm run format      # Run Prettier
npm run check       # Format + lint with auto-fix
```

## Database Management

```bash
# Generate migrations from schema changes
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate

# Open Drizzle Studio (database GUI)
npx drizzle-kit studio

# Seed database with test data
npx tsx scripts/seed.ts
```

**Important**: Database schema is exported from `src/server/db/schema.ts` which re-exports all feature schemas. When adding new tables, add them to a feature's schema file and export from the main schema.

## Project Architecture

### File Structure Philosophy

The project follows a **feature-based architecture** where each domain lives in `src/features/`:

- `src/features/{domain}/actions/` - Server actions (TanStack Start server functions)
- `src/features/{domain}/schemas/` - Drizzle table schemas + Zod validation
- `src/features/{domain}/components/` - Feature-specific React components
- `src/features/{domain}/hooks/` - Custom hooks for the feature
- `src/features/{domain}/atoms/` - Jotai state atoms (if needed)
- `src/features/{domain}/types/` - TypeScript types

**Key Features**:
- `auth` - Phone-based OTP authentication with session management
- `marketplace` - Products, categories, shops, bids (auction system)
- `cart` - Shopping cart with local/server sync for guest/authenticated users
- `orders` - Order creation, payment processing, order management
- `notifications` - User notifications system
- `shared` - Shared utilities (i18n, file upload, theme)

### Routing Structure

TanStack Router uses file-based routing in `src/routes/`:

- Route groups use parentheses: `(root)`, `(marketplace)`, `(dashboards)`
- Dynamic segments use `$`: `products/$productSlug/index.tsx`
- Layout routes: `route.tsx` files define shared layouts
- Root layout: `__root.tsx` contains global providers and shell

### State Management Pattern

**Cart State** (Dual-mode pattern for guest/authenticated users):
- Guest users: `localCartAtom` (persisted to localStorage via `atomWithStorage`)
- Authenticated users: `serverCartAtom` (fetched from database)
- Unified interface: `cartAtom` combines both, automatically switching based on auth state
- See `src/features/cart/atoms/cart.atom.ts` for the complete pattern

**Global State**: Use Jotai atoms, defined in feature-specific `atoms/` directories

### Server Actions Pattern

Server functions use TanStack Start's `createServerFn`:

```typescript
export const getExample = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])  // Optional auth middleware
  .handler(async () => {
    // Access authenticated user: context.user
    // Perform database operations
    return result
  })
```

**Authentication**: Use `authMiddleware` from `src/features/auth/middleware/auth.middleware.ts` to protect routes. It validates session tokens and ensures complete user profiles.

### Database Schema Pattern

All schemas use Drizzle ORM with PostgreSQL:

- Define tables in feature schema files: `src/features/{domain}/schemas/*.schema.ts`
- Export from `src/server/db/schema.ts` (Drizzle looks here via `drizzle.config.ts`)
- Use `$inferSelect` and `$inferInsert` for TypeScript types
- Database instance: Import `db` from `src/server/db/index.ts`

### Internationalization (i18n)

- Supported locales: English (`en`) and Farsi (`fa`) with RTL support
- Translation files: `src/features/shared/i18n/translations/`
- Use `useI18n()` hook to access `t()`, `locale`, `dir`, `isRTL`
- RTL is automatically applied to `<html dir>` in root component

## Component Library

Uses shadcn/ui components (Radix UI + Tailwind CSS):

```bash
# Add new shadcn components
pnpx shadcn@latest add <component-name>
```

Components are located in `src/components/ui/`. Most are already installed.

## Important Patterns

### Path Aliases

Use `@/*` for imports (maps to `src/*`):
```typescript
import { Button } from '@/components/ui/button'
import db from '@/server/db'
```

### Environment Variables

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string

Create a `.env` file in the root (not committed to git).

### Authentication Flow

1. User enters phone number → OTP sent via `send-otp.action.ts`
2. User verifies OTP → Session created via `verify-otp.action.ts`
3. Session token stored in cookie (`sessionToken`)
4. Protected routes use `authMiddleware` to validate session
5. Profile completion check: Users must have `firstName` and `lastName`

### Auction System

- Products can be `type: 'regular'` or `type: 'auction'`
- Auction products have `auctionStatus`, `currentBid`, `auctionEndsAt`
- Bids tracked in `bids` table with `isWinning` flag
- See `scripts/auction.ts` for auction processing logic

## Testing

Tests use Vitest + React Testing Library:
- Test files: `*.test.ts` or `*.test.tsx`
- Run tests: `npm run test`
- Configuration: Uses Vite config (no separate vitest.config)

## Common Gotchas

1. **Server vs Client Code**: TanStack Start requires clear server/client boundaries. Server actions must use `createServerFn`, and server-only code (database access) should never be imported in client components.

2. **Route File Naming**: TanStack Router is strict about file naming. `index.tsx` = index route, `$param.tsx` = dynamic param, `route.tsx` = layout.

3. **Drizzle Schema Location**: Always export schemas from `src/server/db/schema.ts` - Drizzle Kit reads from the path in `drizzle.config.ts`.

4. **Bun Runtime**: Production target is Bun (see `vite.config.ts`). Use `bun` instead of `node` for running the production server.

5. **Cart Sync**: When user logs in, local cart must be synced to server. See `sync-cart.action.ts` and `use-cart-persistence.ts` for the pattern.
