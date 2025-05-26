# AI SEO Tool

An AI-powered SEO analysis tool that processes prompts using multiple LLM providers (OpenAI, Claude, Google) to generate comprehensive SEO insights.

## Features

- **Multi-Provider LLM Processing**: Leverages OpenAI GPT-4, Claude 3.5 Sonnet, and Google Gemini for diverse AI perspectives
- **Background Processing**: Non-blocking prompt processing using Vercel Functions for optimal performance
- **Real-time Status Updates**: Live status polling to track processing progress
- **Database Integration**: Persistent storage with Drizzle ORM and PostgreSQL
- **Modern UI**: Built with Next.js 14, React, and Tailwind CSS

## Architecture

### Background Processing

The application uses a background worker pattern for LLM processing:

1. **Immediate Response**: API endpoints return immediately after queuing jobs
2. **Background Execution**: Heavy LLM processing happens asynchronously
3. **Status Polling**: Frontend polls for updates every 2 seconds
4. **Fault Tolerance**: Individual provider failures don't block the entire process

### API Endpoints

- `POST /api/prompts/process` - Queue prompt for background processing
- `GET /api/prompts/[promptId]/status` - Check processing status
- Database automatically tracks processing state and results

### Performance Optimizations

- **Dynamic Imports**: Heavy dependencies loaded only when needed
- **Concurrent Processing**: All LLM providers called simultaneously
- **Timeout Protection**: 4-minute timeout prevents hanging processes
- **Memory Optimization**: Configured for 1GB memory allocation
- **Error Isolation**: Individual provider failures don't affect others

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run the development server: `npm run dev`

## Environment Variables

```env
DATABASE_URL=your_postgres_connection_string
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_claude_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_key
```

## Deployment

Optimized for Vercel with automatic function configuration:

- Background processing functions: 5-minute timeout, 1GB memory
- Status polling functions: 10-second timeout, 256MB memory
- Automatic scaling based on demand

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Vercel Functions
- **Database**: PostgreSQL with Drizzle ORM
- **AI Providers**: OpenAI, Anthropic Claude, Google Gemini
- **Deployment**: Vercel Platform
