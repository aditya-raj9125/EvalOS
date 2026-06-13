# EvalAI — Intelligent Exam Evaluation Platform

*"AI-powered answer sheet evaluation that checks, annotates, and delivers results in minutes — for any subject, any rubric, any scale."*

![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_1.5_Flash-AI-4285F4?style=flat-square&logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Status](https://img.shields.io/badge/Status-Hackathon_Build-orange?style=flat-square)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [WebSocket Events](#websocket-events)
- [How It Works](#how-it-works)
- [Performance](#performance)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

In India alone, over **38 million answer sheets** are evaluated manually every year. Teachers spend weeks checking papers — a process that is slow, inconsistent, and exhausting. Students wait 45–60 days for results, and sheet copy requests take an additional 10–12 days. The manual evaluation process has not meaningfully changed in decades.

**EvalAI** solves this with a fully automated AI evaluation pipeline. A teacher uploads scanned answer sheets (PDF, image, or ZIP) along with the question paper and marking scheme. EvalAI's AI engine reads every handwritten answer using Google Gemini 1.5 Flash Vision, evaluates it against the teacher-uploaded rubric, draws OMR-style annotation marks (green ticks for correct, red crosses for wrong, amber marks for partial credit) directly on the original sheet image, extracts student roll numbers and names automatically, and delivers a complete grade table — without a human touching a single paper. Students can access their annotated sheet via a roll-number lookup portal within minutes of batch completion.

---

## Architecture

```mermaid
flowchart TD
    A[Teacher uploads sheets + rubric] --> B[Next.js Frontend]
    B --> C[FastAPI Backend / REST + WebSocket]
    C --> D[Redis Queue]
    D --> E[Celery Workers - 4 parallel]
    E --> F[PDF Processor - pdf2image]
    F --> G[Roll Extractor - Gemini Vision]
    G --> H[Sheet Evaluator - Gemini Vision + Rubric]
    H --> I[Annotation Engine - Pillow]
    I --> J[Supabase Storage - annotated sheets]
    I --> K[PostgreSQL - grades + evaluations]
    K --> L[WebSocket - live progress to frontend]
    J --> M[Student Portal - roll number lookup]
    L --> B
```

```mermaid
sequenceDiagram
    participant T as Teacher
    participant W as Next.js
    participant A as FastAPI
    participant C as Celery Worker
    participant G as Gemini API
    participant DB as PostgreSQL
    participant S as Supabase
    participant St as Student

    T->>W: Upload sheets + rubric
    W->>A: POST /api/v1/batches/{id}/upload-sheets
    A->>S: Store original files
    A->>DB: Create Sheet records
    T->>W: Click "Start Processing"
    W->>A: POST /api/v1/batches/{id}/start
    A->>C: Enqueue process_batch task
    C->>G: Parse rubric (text prompt)
    G-->>C: Structured question JSON
    C->>DB: Save parsed rubric
    loop For each sheet (parallel)
        C->>S: Download sheet image
        C->>G: Extract roll number (vision)
        G-->>C: {roll_number, student_name, confidence}
        C->>G: Evaluate page (vision + rubric)
        G-->>C: [{q_no, marks, verdict, bbox}...]
        C->>DB: Save evaluations
        C->>S: Upload annotated pages
        C->>A: WebSocket: sheet_completed event
    end
    A->>W: WebSocket: batch_completed
    W->>T: Show grade table
    St->>W: Roll number + access code lookup
    W->>A: POST /api/v1/student/lookup
    A->>DB: Query by roll_number + access_code
    A->>S: Generate signed URLs
    A-->>W: Annotated sheet + question feedback
    W-->>St: View annotated sheet + marks
```

---

## Tech Stack

| Layer | Technology | Purpose | Version |
|-------|-----------|---------|---------|
| **Frontend** | Next.js | React framework with SSR | 14.2 |
| **Frontend** | React | UI component library | 18 |
| **Frontend** | TypeScript | Type-safe JavaScript | 5.x |
| **Frontend** | Tailwind CSS | Utility-first CSS | 3.4 |
| **Frontend** | shadcn/ui | Pre-built component library | Latest |
| **Frontend** | TanStack Query | Server state management | 5.x |
| **Frontend** | TanStack Table | Grade table rendering | 8.x |
| **Frontend** | Zustand | Client state management | 5.x |
| **Frontend** | Framer Motion | Animations | 11.x |
| **Frontend** | React Dropzone | File upload UI | 15.x |
| **Backend** | FastAPI | Python API framework | 0.111 |
| **Backend** | Python | Backend language | 3.11 |
| **Backend** | SQLAlchemy | Async ORM | 2.0 |
| **Backend** | Alembic | Database migrations | 1.13 |
| **Backend** | asyncpg | Async PostgreSQL driver | 0.29 |
| **AI/ML** | Google Gemini 1.5 Flash | Multimodal AI evaluation | Vision |
| **AI/ML** | Pillow | Image annotation engine | 10.3 |
| **AI/ML** | pdf2image | PDF → image conversion | 1.17 |
| **AI/ML** | PyMuPDF | PDF text extraction | 1.24 |
| **AI/ML** | OpenCV | Image preprocessing | 4.9 |
| **Queue** | Celery | Distributed task queue | 5.4 |
| **Queue** | Redis | Message broker + cache | 7.x |
| **Queue** | Flower | Celery monitoring UI | 2.0 |
| **Database** | PostgreSQL | Primary relational DB | 16 |
| **Storage** | Supabase Storage | File storage + signed URLs | 2.x |
| **Infrastructure** | Docker | Containerization | Latest |
| **Infrastructure** | Docker Compose | Multi-service orchestration | 2.x |
| **Infrastructure** | Nginx | Reverse proxy | Alpine |
| **Infrastructure** | Turborepo | Monorepo build system | 2.x |

---

## Features

- 📄 **Bulk upload** — PDF, ZIP, and image files; up to 500 sheets per batch, 50MB per file
- 🤖 **AI-powered evaluation** using Gemini 1.5 Flash Vision — no separate OCR step; native multimodal understanding
- ✏️ **OMR-style visual annotation** — green ticks (✓), red crosses (✗), amber partial marks drawn directly on original sheet
- 📋 **Any subject, any rubric** — evaluation adapts dynamically to teacher-uploaded marking scheme
- 🎯 **Diagram evaluation** — checks labeled diagrams against element checklist (nucleus labeled, cell wall shown, etc.)
- ⚡ **Parallel processing** — 4 concurrent Celery workers processing sheets simultaneously
- 🔴 **Human review queue** — low-confidence answers (< 75%) automatically flagged for teacher verification
- 📊 **Analytics dashboard** — score distribution, per-question difficulty analysis, pass/fail statistics
- 👨‍🎓 **Student portal** — roll number + access code lookup returns full annotated sheet with question feedback
- 📥 **Export** — CSV, Excel (with conditional formatting), and annotated PDF ZIP download
- 🔄 **Real-time updates** — WebSocket streams progress per sheet as processing completes
- 🔐 **Secure** — JWT auth, time-limited signed URLs for private file access, per-IP rate limiting

---

## Project Structure

```
evalai/                             ← Neutral monorepo root
├── apps/
│   ├── web/                        ← Next.js 14 frontend application
│   │   ├── src/
│   │   │   ├── app/                ← Next.js App Router pages
│   │   │   │   ├── (auth)/         ← Login, register pages
│   │   │   │   ├── (dashboard)/    ← Teacher dashboard, batch management
│   │   │   │   └── api/            ← Next.js API routes (proxies)
│   │   │   ├── components/         ← Reusable UI components
│   │   │   ├── hooks/              ← Custom React hooks
│   │   │   ├── lib/                ← API client, utilities
│   │   │   ├── store/              ← Zustand state stores
│   │   │   └── types/              ← Frontend-local TypeScript types
│   │   ├── public/                 ← Static assets
│   │   ├── package.json            ← @evalai/web package config
│   │   ├── next.config.mjs         ← Next.js configuration
│   │   └── tsconfig.json           ← TypeScript config with monorepo paths
│   │
│   └── api/                        ← FastAPI Python backend
│       ├── app/
│       │   ├── api/
│       │   │   ├── v1/
│       │   │   │   ├── endpoints/  ← Route handlers (auth, batches, review, etc.)
│       │   │   │   └── router.py   ← Central API router
│       │   │   └── deps.py         ← FastAPI dependencies (auth, db)
│       │   ├── core/
│       │   │   ├── config.py       ← Pydantic settings (all env vars)
│       │   │   ├── security.py     ← JWT + bcrypt auth utilities
│       │   │   └── logging.py      ← Structured logging setup
│       │   ├── db/
│       │   │   ├── base.py         ← SQLAlchemy Base model
│       │   │   └── session.py      ← Async + sync engine factories
│       │   ├── models/             ← SQLAlchemy ORM models
│       │   ├── schemas/            ← Pydantic request/response schemas
│       │   ├── services/           ← Business logic services
│       │   │   ├── storage.py      ← Supabase storage operations
│       │   │   ├── gemini_client.py← Gemini API wrapper
│       │   │   ├── rubric_parser.py← AI rubric parsing
│       │   │   ├── roll_extractor.py← Student info extraction
│       │   │   ├── sheet_evaluator.py← Core AI evaluation engine
│       │   │   └── annotator.py    ← Pillow annotation engine
│       │   ├── workers/
│       │   │   ├── celery_app.py   ← Celery application config
│       │   │   ├── tasks/          ← Celery task definitions
│       │   │   └── rate_limiter.py ← Redis token bucket rate limiter
│       │   ├── websocket/
│       │   │   ├── manager.py      ← WebSocket connection manager
│       │   │   └── events.py       ← Event type definitions
│       │   └── main.py             ← FastAPI application entry point
│       ├── alembic/                ← Database migration scripts
│       ├── tests/                  ← Unit and integration tests
│       ├── .venv/                  ← Python virtual environment (gitignored)
│       ├── .env                    ← Secrets and config (gitignored)
│       ├── .env.example            ← Template (committed)
│       ├── alembic.ini             ← Alembic migration config
│       ├── celery_worker.py        ← Celery worker entry point
│       ├── requirements.txt        ← Python dependencies
│       ├── pyproject.toml          ← Python project config (ruff, mypy, pytest)
│       ├── Makefile                ← Developer convenience commands
│       └── Dockerfile              ← Container build spec
│
├── packages/
│   └── shared-types/               ← TypeScript interfaces shared between frontend & backend
│       └── src/
│           ├── batch.types.ts      ← Batch, BatchStatus, BatchAnalytics
│           ├── sheet.types.ts      ← Sheet, SheetStatus, SheetResult
│           ├── evaluation.types.ts ← Evaluation, EvaluationVerdict
│           ├── review.types.ts     ← ReviewItem, ReviewAction
│           ├── student.types.ts    ← StudentResult, StudentLookupRequest
│           ├── rubric.types.ts     ← Rubric, ParsedQuestion, QuestionType
│           ├── api.types.ts        ← APIResponse<T>, PaginatedResponse<T>
│           ├── websocket.types.ts  ← All WebSocket event payload types
│           └── index.ts            ← Central re-export
│
├── infra/
│   ├── nginx/
│   │   ├── nginx.conf              ← Production reverse proxy configuration
│   │   └── Dockerfile              ← Nginx container
│   └── scripts/
│       └── setup.sh                ← One-time developer setup script
│
├── docker-compose.yml              ← Unified: postgres, redis, api, celery, flower, web
├── .env.docker.example             ← Docker environment template (committed)
├── turbo.json                      ← Turborepo pipeline configuration
├── package.json                    ← Root workspace package.json
├── .gitignore                      ← Unified Python + Node + OS gitignore
├── .npmrc                          ← npm workspace settings
├── .prettierrc                     ← Code formatting config
├── .vscode/
│   ├── extensions.json             ← Recommended VS Code extensions
│   └── settings.json               ← Workspace-level editor settings
└── README.md                       ← This file
```

---

## Prerequisites

Before setting up the project, ensure you have the following installed:

| Tool | Version | Installation |
|------|---------|-------------|
| **Node.js** | ≥ 20.0.0 | [nodejs.org](https://nodejs.org) |
| **npm** | ≥ 10.0.0 | Comes with Node.js |
| **Python** | 3.11 exactly | [python.org](https://python.org) |
| **Docker Desktop** | ≥ 4.0 | [docker.com/get-started](https://docker.com/get-started) |
| **Docker Compose** | ≥ 2.0 | Included with Docker Desktop |
| **Poppler** | Latest | macOS: `brew install poppler` \| Ubuntu: `apt-get install poppler-utils` \| Windows: Download from [poppler releases](https://github.com/oschwartz10612/poppler-windows/releases) |
| **Tesseract** | Latest | macOS: `brew install tesseract` \| Ubuntu: `apt-get install tesseract-ocr` |

**API Keys required:**
- **Gemini API key** — Get at [aistudio.google.com](https://aistudio.google.com) (free tier: 15 RPM)
- **Supabase project** — Create at [supabase.com](https://supabase.com) (free tier: 500MB storage)

---

## Getting Started

### Option A: Manual Setup (Recommended for Development)

```bash
# 1. Clone the repository
git clone https://github.com/your-org/evalai.git
cd evalai

# 2. Run the setup script (Mac/Linux)
chmod +x infra/scripts/setup.sh
./infra/scripts/setup.sh

# 3. Configure environment variables
#    Edit apps/api/.env — add your GEMINI_API_KEY, SUPABASE_URL, SUPABASE_KEY, SECRET_KEY
#    Edit apps/web/.env.local — verify NEXT_PUBLIC_API_URL=http://localhost:8000

# 4. Run database migrations
cd apps/api
source .venv/bin/activate        # Windows: .venv\Scripts\Activate.ps1
alembic upgrade head
cd ../..

# 5. Start all services (three separate terminals)

# Terminal 1 — API server
cd apps/api && source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 — Celery worker
cd apps/api && source .venv/bin/activate
celery -A celery_worker worker --concurrency=4 --queues=high_priority,default --loglevel=info

# Terminal 3 — Frontend
cd apps/web && npm run dev

# 6. Verify the setup
# API health:     http://localhost:8000/health
# API docs:       http://localhost:8000/docs
# Frontend:       http://localhost:3000
# Celery monitor: http://localhost:5555
```

### Option B: Docker (One Command)

```bash
# Copy and configure the docker environment file
cp .env.docker.example .env.docker
# Edit .env.docker with your API keys

# Start all services
docker compose --env-file .env.docker up --build

# Services will be available at:
# Frontend:       http://localhost:3000
# API:            http://localhost:8000
# API Docs:       http://localhost:8000/docs
# Celery Flower:  http://localhost:5555
```

---

## Environment Variables

### `apps/api/.env` — Backend

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ | Async PostgreSQL URL (asyncpg) | `postgresql+asyncpg://user:pass@host:5432/evalai` |
| `SYNC_DATABASE_URL` | ✅ | Sync PostgreSQL URL (psycopg2, for Celery) | `postgresql://user:pass@host:5432/evalai` |
| `REDIS_URL` | ✅ | Redis connection URL | `redis://localhost:6379/0` |
| `SUPABASE_URL` | ✅ | Supabase project URL | `https://xyz.supabase.co` |
| `SUPABASE_KEY` | ✅ | **Service role key** (not anon key) ⚠️ Never commit | `eyJhbGci...` |
| `SUPABASE_BUCKET_SHEETS` | ✅ | Storage bucket for raw sheets | `evalai-sheets` |
| `SUPABASE_BUCKET_RUBRICS` | ✅ | Storage bucket for rubrics | `evalai-rubrics` |
| `SUPABASE_BUCKET_ANNOTATED` | ✅ | Storage bucket for annotated output | `evalai-annotated` |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key ⚠️ Never commit | `AIza...` |
| `SECRET_KEY` | ✅ | JWT signing secret (min 32 chars) ⚠️ Never commit | `openssl rand -hex 32` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ✅ | JWT expiry in minutes | `10080` (7 days) |
| `GEMINI_RPM_LIMIT` | ✅ | Gemini rate limit (stay below 15 for free tier) | `12` |
| `MAX_WORKERS` | ✅ | Celery worker concurrency | `4` |
| `POPPLER_PATH` | ✅ | Path to Poppler binaries | `/usr/bin` (Linux), `C:\poppler\bin` (Windows) |
| `ENVIRONMENT` | ✅ | Runtime environment | `development` or `production` |
| `CORS_ORIGINS` | ✅ | Comma-separated allowed origins | `http://localhost:3000` |

### `apps/web/.env.local` — Frontend

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | ✅ | FastAPI backend URL | `http://localhost:8000` |
| `NEXT_PUBLIC_WS_URL` | ✅ | WebSocket URL (same server, ws:// scheme) | `ws://localhost:8000` |
| `NEXT_PUBLIC_APP_NAME` | Optional | Application display name | `EvalAI` |
| `NEXT_PUBLIC_APP_ENV` | Optional | Frontend environment label | `development` |

> ⚠️ **Security note:** `SUPABASE_KEY`, `GEMINI_API_KEY`, and `SECRET_KEY` must **never** be committed to Git. They are server-side secrets. Generate `SECRET_KEY` with: `openssl rand -hex 32`

---

## Running the Application

### Development (Manual)

| Service | Command | URL |
|---------|---------|-----|
| FastAPI | `cd apps/api && uvicorn app.main:app --reload --port 8000` | http://localhost:8000 |
| Celery | `cd apps/api && celery -A celery_worker worker --concurrency=4` | — |
| Flower | `cd apps/api && celery -A celery_worker flower --port=5555` | http://localhost:5555 |
| Next.js | `cd apps/web && npm run dev` | http://localhost:3000 |
| Redis | `redis-server` (or Docker) | localhost:6379 |

### Makefile shortcuts (from `apps/api/`):

```bash
make dev        # Start uvicorn with hot reload
make worker     # Start Celery worker
make flower     # Start Flower monitoring
make migrate    # Run alembic upgrade head
make test       # Run pytest
make lint       # Run ruff linter
make typecheck  # Run mypy type checker
```

---

## API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | ❌ | Register new teacher account |
| POST | `/api/v1/auth/login` | ❌ | Login and receive JWT |
| GET | `/api/v1/auth/me` | ✅ | Get current user profile |

### Batches

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/batches/` | ✅ | Create new batch |
| GET | `/api/v1/batches/` | ✅ | List all batches (paginated) |
| GET | `/api/v1/batches/{id}` | ✅ | Get batch details |
| POST | `/api/v1/batches/{id}/upload-sheets` | ✅ | Upload answer sheets (multipart) |
| POST | `/api/v1/batches/{id}/upload-rubric` | ✅ | Upload question paper + marking scheme |
| POST | `/api/v1/batches/{id}/start` | ✅ | Start AI evaluation pipeline |
| GET | `/api/v1/batches/{id}/status` | ✅ | Live processing status |
| GET | `/api/v1/batches/{id}/results` | ✅ | Complete grade table |
| GET | `/api/v1/batches/{id}/analytics` | ✅ | Score distribution and analytics |

### Sheets

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/batches/{id}/sheets/{sheet_id}` | ✅ | Full sheet details + annotated image URLs |

### Review Queue

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/review/queue` | ✅ | List pending review items |
| GET | `/api/v1/review/stats` | ✅ | Review statistics |
| POST | `/api/v1/review/{id}/approve` | ✅ | Approve AI score |
| POST | `/api/v1/review/{id}/override` | ✅ | Override AI score with teacher mark |
| POST | `/api/v1/review/{id}/recheck` | ✅ | Mark for physical recheck |

### Student Portal

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/student/lookup` | ❌ | Look up result by roll number + access code |
| GET | `/api/v1/student/sheet/{id}/download` | ❌ (signed token) | Download annotated PDF |

### Exports

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/batches/{id}/export/csv` | ✅ | Download grade table as CSV |
| GET | `/api/v1/batches/{id}/export/excel` | ✅ | Download grade table as Excel |
| GET | `/api/v1/batches/{id}/export/annotated-zip` | ✅ | Download all annotated PDFs as ZIP |

> 📖 Full interactive API documentation: [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI) | [http://localhost:8000/redoc](http://localhost:8000/redoc) (ReDoc)

---

## WebSocket Events

Connect to: `ws://localhost:8000/ws/batch/{batch_id}`

| Event Type | When It Fires | Payload |
|-----------|---------------|---------|
| `batch_started` | Processing begins | `{total_sheets: number}` |
| `rubric_parsed` | Rubric parsing complete | `{question_count: number}` |
| `sheet_converting` | Sheet → page images | `{sheet_id, filename}` |
| `sheet_extracting` | Extracting student info | `{sheet_id, filename}` |
| `sheet_evaluating` | AI evaluating answers | `{sheet_id, roll_number}` |
| `sheet_annotating` | Drawing marks on sheet | `{sheet_id, roll_number}` |
| `sheet_completed` | Sheet fully processed | `{sheet_id, roll_number, student_name, total_marks, max_marks, percentage, grade, flagged}` |
| `sheet_failed` | Sheet processing failed | `{sheet_id, filename, error}` |
| `batch_completed` | All sheets done | `{total_processed, total_flagged, total_failed, avg_score, time_taken_seconds}` |
| `progress_update` | Periodic progress ping | `{processed, total, progress_percent}` |

All events follow the structure:
```json
{
  "type": "sheet_completed",
  "batch_id": "uuid",
  "timestamp": "2026-06-13T00:00:00Z",
  "payload": { ... }
}
```

---

## How It Works

### 1. Teacher Registers and Creates a Batch
A teacher registers with their email, institution name, and role. They create a named batch specifying the subject, maximum marks per sheet, and optionally enable the student portal with an access code.

> **Implementation detail:** Batch creation takes < 100ms. The batch ID becomes the namespace for all subsequent storage paths, task IDs, and WebSocket channels.

### 2. Bulk Upload — Sheets and Rubric
The teacher uploads answer sheets (PDF, images, or ZIP) and the rubric (question paper + marking scheme PDFs). The upload endpoint validates file types by reading magic bytes, checks file sizes, extracts ZIP archives in memory, and stores originals in Supabase. No processing happens here — it completes in under 30 seconds regardless of sheet count.

> **Implementation detail:** File type validation reads the first 8 bytes of each file rather than trusting the MIME type header, which can be spoofed. PDF magic bytes: `%PDF`. JPEG: `FF D8 FF`. PNG: `89 50 4E 47`.

### 3. Rubric Parsing — AI Reads the Marking Scheme
When the teacher clicks "Start Processing," the system first parses the rubric. Gemini 1.5 Flash reads both the question paper and marking scheme, producing a structured JSON array where each element describes one question: its type (MCQ, short answer, diagram, etc.), expected answer, marking notes, and — for diagram questions — a checklist of every element the student must draw.

> **Implementation detail:** The rubric is parsed once and stored in a JSONB column. Every subsequent sheet evaluation references this parsed structure rather than re-calling the AI on the marking scheme.

### 4. Per-Sheet Pipeline — Four Parallel Steps
Each sheet runs through four sequential steps in a Celery worker: (1) **PDF conversion** — pdf2image converts each page to a 200 DPI PNG; (2) **Roll extraction** — Gemini Vision reads the header area and extracts roll number, student name, and confidence score; (3) **Evaluation** — Gemini Vision reads each page against the parsed rubric, returning marks, verdicts, reasons, and bounding box coordinates for every answer; (4) **Annotation** — Pillow draws marks on the original image using the AI-provided bounding boxes.

> **Implementation detail:** Gemini 1.5 Flash reads the answer sheet image natively — no separate OCR step required. The model returns structured JSON with bounding box coordinates as fractions of image dimensions (0.0–1.0), which are then converted to pixel coordinates for Pillow drawing.

### 5. Annotation Engine — Marks Drawn on the Sheet
The Pillow annotation engine draws OMR-style marks at the exact locations reported by the AI. Green ticks (✓) for correct answers, red crosses (✗) for wrong, amber tildes (~) for partial credit with `+marks/max` notation. A white background rectangle is drawn behind every mark label to ensure legibility on handwritten sheets. A summary box in the top-right corner shows page-level totals.

> **Implementation detail:** Bounding boxes as small as 30×60px are automatically expanded to this minimum to ensure marks are always visible. The summary box uses bold text on a white background with a blue border to mimic a teacher's signature box.

### 6. Review Queue — Low-Confidence Answers Flagged
Any answer where the AI's confidence score is below 0.75 is automatically added to the review queue. Teachers see these items sorted by confidence ascending (lowest confidence first) and can approve the AI's score, override it with a manual mark (which triggers re-annotation of that page), or mark it for physical recheck.

> **Implementation detail:** Overriding a mark recalculates the sheet's total, percentage, and grade in real time, and re-annotates only the affected page — not the entire sheet.

### 7. Student Portal — Instant Results Access
Students enter their roll number and the teacher-provided access code. The system returns their full result: marks per question, verdict for each answer, the complete annotated sheet as clickable page images, and a PDF download link. Signed URLs expire after 24 hours to prevent unauthorized sharing.

> **Implementation detail:** The lookup endpoint applies rate limiting (10 requests/minute per IP) to prevent brute force attacks on access codes. It deliberately returns a generic "not found" error for both wrong roll number and wrong access code to prevent enumeration.

---

## Performance

| Operation | Time | Notes |
|-----------|------|-------|
| Rubric parsing (10-question paper) | ~8 seconds | Single Gemini API call |
| Per-sheet evaluation (10 questions) | ~3 seconds | Gemini evaluation + Pillow annotation |
| 30-sheet batch (4 workers) | ~6 minutes | Rate-limited to 12 RPM (free tier) |
| Grade table API response | < 500ms | Indexed PostgreSQL queries |
| Student portal lookup | < 300ms | Indexed by roll_number |
| Annotated ZIP export (50 sheets) | < 30 seconds | Streamed, not buffered in memory |
| File upload (100 sheets, 200MB) | < 30 seconds | Direct Supabase upload, no processing |

> **Note:** Processing speed is currently bounded by the Gemini 1.5 Flash free tier rate limit (15 RPM). Production deployment with a paid API key removes this constraint, enabling < 2 minutes for 30 sheets.

---

## Database Schema

```mermaid
erDiagram
    users {
        UUID id PK
        string email UK
        string hashed_password
        string full_name
        string institution_name
        enum role
        bool is_active
        datetime created_at
    }
    batches {
        UUID id PK
        UUID user_id FK
        string name
        string subject
        enum status
        int total_sheets
        int processed_sheets
        int flagged_count
        float avg_score
        float max_score_per_sheet
        bool enable_student_portal
        string student_access_code
        datetime processing_started_at
        datetime processing_completed_at
    }
    rubrics {
        UUID id PK
        UUID batch_id FK
        string question_paper_path
        string marking_scheme_path
        text guidelines
        jsonb parsed_structure
        enum parsing_status
        datetime created_at
    }
    sheets {
        UUID id PK
        UUID batch_id FK
        string original_file_path
        jsonb page_image_paths
        jsonb annotated_image_paths
        string annotated_pdf_path
        string roll_number
        string student_name
        float total_awarded_marks
        float total_max_marks
        float percentage
        string grade
        enum status
        float ai_extraction_confidence
    }
    evaluations {
        UUID id PK
        UUID sheet_id FK
        string q_no
        string question_type
        int page_number
        text student_answer_transcribed
        float awarded_marks
        float max_marks
        enum verdict
        string reason
        float ai_confidence
        float bbox_x
        float bbox_y
        float bbox_w
        float bbox_h
        bool is_flagged
        bool is_reviewed
    }
    review_items {
        UUID id PK
        UUID evaluation_id FK
        UUID batch_id FK
        UUID sheet_id FK
        UUID reviewer_id FK
        float original_ai_score
        float override_score
        enum action
        text reviewer_note
        datetime reviewed_at
    }

    users ||--o{ batches : "creates"
    batches ||--|| rubrics : "has"
    batches ||--o{ sheets : "contains"
    sheets ||--o{ evaluations : "has"
    evaluations ||--o{ review_items : "flagged_as"
    users ||--o{ review_items : "reviews"
```

---

## Contributing

### Branch Naming Convention

- `feature/description` — New features
- `fix/description` — Bug fixes
- `chore/description` — Maintenance, dependencies, config
- `docs/description` — Documentation only

### Commit Message Format (Conventional Commits)

```
feat: add student portal PDF download endpoint
fix: handle corrupted PDF in pdf_processor
chore: update requirements.txt dependencies
docs: add API reference table to README
```

### Pull Request Requirements

1. All existing tests must pass (`make test`)
2. No new TypeScript errors (`npm run type-check` from `apps/web/`)
3. Code formatted with ruff/prettier
4. Description includes what changed and why

---

## License

MIT License

Copyright (c) 2026 EvalAI Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
