# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server
bun run dev

# Run commands with Doppler secrets loaded
bun run d <command>

# Database operations
bun run db:generate     # Generate Drizzle migrations
bun run db:migrate      # Apply migrations to database
bun run db:studio       # Open Drizzle Studio for database management

# Build and deployment
bun run build          # Production build
bun run start          # Start production server
```

## Architecture Overview

**LookOut** is an AI brand monitoring platform built with Next.js 15 App Router, using multiple LLM providers (OpenAI, Claude, Google) to analyze brand mentions across the web.

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with Google OAuth
- **LLM Providers**: OpenAI GPT-4o, Anthropic Claude-3.7, Google Gemini-2.5
- **Payments**: Stripe with subscription tiers
- **Deployment**: Vercel with extended function timeouts
- **Package Manager**: Bun

### Core Data Model

The application revolves around a hierarchical structure:
- **Users** have subscription plans limiting usage
- **Topics** represent brands/companies being monitored
- **Prompts** are search queries with geographic targeting
- **Model Results** store LLM responses from each provider
- **Mentions** contain extracted brand references with sentiment

Key database features:
- Enum types for plans, models, regions, sentiment
- JSONB fields for flexible metadata storage
- Unique constraints ensuring one result per prompt/model

### LLM Processing Architecture

**Multi-Provider Strategy**: Each prompt is processed simultaneously across OpenAI, Claude, and Google providers using their respective search capabilities.

**Processing Flow**:
1. User submits prompt → Background job queued via `waitUntil`
2. Concurrent API calls to all three providers (180s timeout)
3. Structured JSON extraction with sources and citations
4. Results stored with provider-specific metadata
5. Visibility scores calculated based on brand mention frequency

**Error Handling**: Provider failures are isolated - partial success is acceptable.

### App Router Structure

```
src/app/
├── (auth)/signin/          # Authentication flow
├── api/                    # API routes for processing
├── dashboard/              # Main app with sidebar layout
│   ├── topics/            # Brand management
│   ├── rankings/          # Prompt creation & results
│   └── mentions/          # Brand mention analysis
└── stripe-result/         # Payment flow completion
```

### Component Organization

- **UI Components**: Radix-based design system in `/src/components/ui/`
- **Feature Components**: Domain-specific, organized by dashboard sections
- **Sidebar**: Collapsible navigation with main/general sections

### Subscription & Usage Management

Plans (Free, Basic, Pro, Enterprise) limit:
- Daily prompts allowed
- Available LLM providers
- Number of topics
- Processing priority

Usage validation occurs before processing, with real-time limit checking against Stripe subscription status.

### Authentication System

Better Auth with Google OAuth, using Drizzle adapter. User sessions include IP/User-Agent tracking. Additional user fields store Stripe customer data for subscription management.

### Development Patterns

- **State Management**: React hooks with server actions (no external state library)
- **Data Fetching**: Server components with direct Drizzle queries
- **Forms**: Server actions with validation
- **Error Handling**: Sentry integration with global error boundaries
- **Styling**: Tailwind with consistent Radix primitive usage

### Vercel Configuration

Function timeouts are configured for LLM processing:
- `/api/prompts/process`: 300s, 1024MB memory
- `/api/prompts/[promptId]/status`: 10s, 256MB memory

Automatic Vercel cron monitoring is enabled for background jobs.