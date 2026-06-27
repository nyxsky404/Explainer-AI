<div align="center">

  <h1>Explainer AI</h1>
  
  <p>
    <strong>AI summarizer · podcast generator · quiz maker · mind map builder</strong><br/>
    <em>Paste a URL, YouTube link, or PDF — get a podcast, summary, quiz, or mind map in seconds.</em>
  </p>

  <p>
    <a href="https://explainer-ai-two.vercel.app"><img src="https://img.shields.io/badge/Live%20Demo-explainer--ai-brightgreen?logo=vercel" alt="Live Demo" /></a>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-blue?logo=react&logoColor=white" alt="React 19" /></a>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-22-green?logo=nodedotjs&logoColor=white" alt="Node.js 22" /></a>
    <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" alt="Vite 7" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" /></a>
    <a href="https://prisma.io/"><img src="https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white" alt="Prisma 6" /></a>
    <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" />
  </p>
</div>

<br />

## Overview

**Explainer AI** is an open-source, AI-powered learning platform that transforms web articles, YouTube videos, PDFs, and plain text into structured learning materials — summaries, podcasts, quizzes, notes, mind maps, and more.

Point it at any URL, paste a YouTube link, or upload a PDF and it generates ready-to-use content in seconds: an audio podcast you can listen to on the go, a structured summary, a quiz to test your understanding, or a visual mind map of the key concepts. Built for students, researchers, and anyone with more tabs open than time to read them.

The backend runs a decoupled Express API with two dedicated BullMQ workers (podcast + gossip audio) so long-running AI generation jobs never block the main server.

## What can I use it for?

| I want to… | Use this tool |
|---|---|
| Listen to a blog post or article during my commute | **Podcast Generator** |
| Get the key points from a YouTube video without watching it | **Summarizer** (YouTube link) |
| Turn a research PDF into an audio summary | **Podcast Generator** (PDF upload) |
| Test my understanding of a topic | **Quiz Generator** |
| Get structured notes from a web page | **Smart Notes** |
| Visualize how concepts in an article relate to each other | **Visualizer** (mind map) |
| Ask questions about something I just read | **Chat** |
| Deep-dive into a concept I didn't fully understand | **Deep Explain** |

## Features

- **Summarizer** — Condenses web pages, YouTube videos, PDFs, and pasted text into clear summaries with adjustable depth.
- **Podcast Generator** — Produces a full audio podcast from any content using AI-generated scripts and multi-provider TTS (Gemini TTS, ElevenLabs, Deepgram).
- **Gossip Mode** — Generates a casual, conversational audio episode styled as a gossip podcast — a second voice format with its own queue worker.
- **Quiz Generator** — Creates interactive multiple-choice and open-ended quizzes from source content.
- **Smart Notes** — Produces structured study notes with key concepts, definitions, and takeaways.
- **Visualizer** — Renders Mermaid diagrams and mind maps to illustrate relationships in the content.
- **Deep Explain** — Provides a thorough, step-by-step conceptual breakdown of complex topics.
- **Chat** — Ask follow-up questions about any piece of content in a threaded chat panel.
- **Multi-source Input** — Accepts URLs (via Firecrawl), YouTube links (via Supadata), uploaded PDFs, or raw text.
- **Credits System** — Usage-based credits managed per user.
- **GitHub OAuth** — Sign in with GitHub in addition to email/password.
- **Email Notifications** — Transactional email via SMTP (auto-configured Ethereal in development).

## Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4, Shadcn/UI (Radix Primitives) |
| Animation | Framer Motion |
| Diagrams | Mermaid |
| Charts | Recharts |
| Drag-and-drop | dnd-kit |
| Forms | React Hook Form + Zod |
| Markdown | react-markdown (with GFM + math via KaTeX) |
| Export | html2canvas, jsPDF |
| Routing | React Router 7 |
| HTTP | Axios |
| Icons | Lucide React, Tabler Icons |

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 5 |
| Database | PostgreSQL via Supabase |
| ORM | Prisma 6 |
| Queue | BullMQ + Redis (ioredis) |
| Text AI | OpenRouter (model-swappable) |
| Script/TTS AI | Google Gemini (Flash) |
| TTS | Gemini TTS · ElevenLabs · Deepgram |
| Web Scraping | Firecrawl |
| YouTube Transcripts | Supadata |
| PDF Parsing | pdf-parse |
| Storage | Supabase Storage |
| Auth | JWT + bcrypt + GitHub OAuth |
| Email | Nodemailer (SMTP) |
| Security | Helmet, express-rate-limit, Zod |

## Architecture

```mermaid
flowchart TD
    User(["👤 User"])

    subgraph Frontend["Frontend (React + Vite)"]
        SPA["React SPA"]
    end

    subgraph Backend["Backend (Node.js + Express)"]
        API["API Server\n(Express 5)"]
        PQ["Podcast Queue\n(BullMQ)"]
        GQ["Gossip Queue\n(BullMQ)"]
        PW["Podcast Worker"]
        GW["Gossip Worker"]
    end

    subgraph Infrastructure["Infrastructure"]
        Redis[("Redis")]
        PG[("PostgreSQL\n(Supabase)")]
        Storage[("Supabase\nStorage")]
    end

    subgraph AIProviders["AI Providers"]
        OR["OpenRouter\n(text generation)"]
        Gemini["Google Gemini\n(scripts · TTS)"]
        EL["ElevenLabs\n(TTS)"]
        DG["Deepgram\n(TTS)"]
        FC["Firecrawl\n(web scraping)"]
        SD["Supadata\n(YouTube transcripts)"]
    end

    User -- "HTTPS" --> SPA
    SPA -- "REST API" --> API
    API -- "auth / data" --> PG
    API -- "enqueue job" --> PQ & GQ
    PQ --> Redis
    GQ --> Redis
    Redis --> PW & GW
    PW & GW -- "store audio" --> Storage
    PW & GW -- "update job status" --> PG
    API --> OR & Gemini & FC & SD
    PW --> EL & DG & Gemini
    GW --> EL & Gemini
```

Long-running tasks (audio generation, script synthesis) are dispatched to background workers via Redis queues so the API responds immediately and the client polls for results.

## Getting Started

### Prerequisites
- **Node.js** v20+
- **Redis** running locally or via a cloud provider
- Accounts / API keys for the external services listed in the environment variables section

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nyxsky404/Explainer-AI.git
   cd Explainer-AI
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend && npm install

   # Frontend
   cd ../frontend && npm install
   ```

3. **Configure environment variables**

   Copy `.env.example` in the `backend/` directory to `.env` and fill in values:

   ```env
   # ── Database ──────────────────────────────────────────────────────────────────
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
   DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

   # ── Auth ──────────────────────────────────────────────────────────────────────
   JWT_SECRET="your-very-long-random-secret-here"
   NODE_ENV="development"   # development | production

   # ── Server ────────────────────────────────────────────────────────────────────
   PORT=3000
   FRONTEND_URL="http://localhost:5173"

   # ── AI Providers ──────────────────────────────────────────────────────────────
   OPENROUTER_API_KEY=""    # https://openrouter.ai/keys
   GEMINI_API_KEY=""        # https://aistudio.google.com/app/apikey
   MODEL="openai/gpt-oss-120b:free"   # OpenRouter model (swap to change globally)
   GEMINI_TEXT_MODEL="gemini-2.5-flash"
   GEMINI_SCRIPT_MODEL="gemini-3-flash-preview"
   GEMINI_TTS_MODEL="gemini-3.1-flash-tts-preview"

   # ── OAuth ─────────────────────────────────────────────────────────────────────
   GITHUB_CLIENT_ID=""
   GITHUB_CLIENT_SECRET=""

   # ── Storage (Supabase) ────────────────────────────────────────────────────────
   SUPABASE_URL=""
   SUPABASE_SERVICE_KEY=""  # Use the Service Role key, not the anon key

   # ── Cache / Queue ─────────────────────────────────────────────────────────────
   REDIS_URL="redis://localhost:6379"

   # ── Email / SMTP ──────────────────────────────────────────────────────────────
   # In development, an Ethereal test account is auto-created — no config needed.
   # In production set all of the following:
   SMTP_HOST=""
   SMTP_PORT="587"
   SMTP_SECURE="false"      # true for port 465
   SMTP_USER=""
   SMTP_PASS=""
   SMTP_FROM=""             # e.g. noreply@yourapp.com

   # ── Audio TTS (optional alternatives to Gemini TTS) ───────────────────────────
   ELEVENLABS_API_KEY=""    # https://elevenlabs.io
   DEEPGRAM_API_KEY=""      # https://deepgram.com

   # ── Web Scraping ───────────────────────────────────────────────────────────────
   FIRECRAWL_API_KEY=""     # https://firecrawl.dev  — required for URL summarization
   SUPADATA_API_KEY=""      # https://supadata.ai    — required for YouTube transcripts
   ```

   Create `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

4. **Initialize the database**
   ```bash
   cd backend
   npx prisma migrate deploy
   npx prisma generate
   ```

### Running the Application

You need three terminals — the API server and both queue workers must run concurrently.

```bash
# Terminal 1 — API server
cd backend && npm run dev

# Terminal 2 — Podcast worker
cd backend && npm run worker

# Terminal 3 — Frontend
cd frontend && npm run dev
```

Open `http://localhost:5173` in your browser.

## Contributing

Contributions are welcome. Fork the repository and open a pull request for any improvements or bug fixes.
