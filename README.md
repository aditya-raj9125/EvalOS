# EvalAI — AI-Powered Exam Evaluation Platform

EvalAI is a state-of-the-art Next.js web application designed to automate, streamline, and scale the process of grading exam answer sheets. By integrating intelligent visual AI models with a dual-verification review interface, EvalAI helps educators reduce manual grading time by up to 90% while maintaining the fairness, accountability, and security standards of traditional double-blind evaluations.

## 🚀 Key Features

*   **Bulk Answer Sheets Upload**: Support for ZIP folders, PDF papers, and image sets (JPEG/PNG) up to 500 files.
*   **Dual-Rubric Setup**: Easy configuration of question papers, official marking schemes, and custom examiner guidelines.
*   **AI Annotation Overlay**: Automatic placement of red checks, ticks, half-marks, and confidence metrics directly onto scanned answer scripts.
*   **Human Review Queue**: Multi-tier audit queues designed to isolate low-confidence scores and complex handwriting, sorted by priority.
*   **Secure Student Portal**: Public portal for students to retrieve reports, verify transcripts, and view digital annotations using custom credentials.
*   **Interactive Analytics**: Score distributions, question metrics, and class performance tracking.

---

## 🛠 Tech Stack

*   **Framework**: Next.js 14 (App Router) + React 18 + TypeScript (Strict Mode)
*   **Styling**: Tailwind CSS + Class Variance Authority (CVA) + clsx
*   **UI Primitives**: shadcn/ui (Radix Primitives)
*   **Animations**: Framer Motion + Formkit Auto-Animate
*   **Data Fetching & State**: TanStack React Query v5 + Zustand + Axios
*   **Form Validations**: React Hook Form + Zod Schemas

---

## 📂 Project Architecture

```text
evalai/
├── public/                       # Assets & self-hosted configurations
├── src/
│   ├── app/                      # Next.js App Router Pages & Layouts
│   │   ├── (marketing)/          # Public Landing Pages, Pricing, About
│   │   ├── (auth)/               # Form Validated Sign-in / Registration
│   │   ├── (dashboard)/          # Evaluation pipelines, batch results, human review
│   │   ├── student/              # Roll number & access code student lookup portal
│   │   └── api/                  # API endpoints (health, revalidation)
│   ├── components/
│   │   ├── ui/                   # Modular shadcn UI components
│   │   ├── layout/               # App headers, sidebars, footers
│   │   ├── upload/               # Multi-step upload wizards & progress bars
│   │   ├── results/              # Gradebooks, overlay annotations, sheet viewers
│   │   └── shared/               # Dialogs, spinners, indicators
│   ├── lib/                      # Zod schemas, utilities, Axios clients
│   ├── store/                    # Zustand global states (uploads, active batches)
│   └── types/                    # Strongly typed Interfaces
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
NEXT_PUBLIC_APP_NAME=EvalAI
NEXT_PUBLIC_APP_ENV=development
```

---

## 💻 Getting Started

### 1. Installation
Install project dependencies:
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 3. Production Build
Validate production compilation and linting rules:
```bash
npm run build
npm run lint
```
