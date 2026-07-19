# Visites Calendar Web App

A modern, production-grade web application to convert patient visit Excel files (`.xlsx`) into `.ics` calendars instantly. 

Built with **Next.js 15**, **FastAPI**, **Tailwind CSS**, and **Framer Motion**.

## Architecture

- **Frontend:** Next.js 15 App Router, React, Tailwind CSS, Framer Motion
- **Backend:** FastAPI, Python (In-memory processing with BytesIO)
- **Deployment:** Vercel (Next.js + Serverless Python Functions)

## Getting Started Locally

### Prerequisites

- Node.js 18+
- Python 3.9+

### Frontend Setup

```bash
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`.

### Backend Setup

```bash
cd backend
python -m venv venv

# On Windows
venv\Scripts\activate
# On Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The backend API will run on `http://localhost:8000`.

## Deployment

This application is configured for seamless deployment on **Vercel**. 

1. Push this repository to GitHub/GitLab.
2. Import the project in the Vercel dashboard.
3. Vercel will automatically detect Next.js for the frontend and use `vercel.json` to deploy the `backend/main.py` as a serverless Python function for the `/api` routes.

## Code Quality & Best Practices

- **SOLID Principles:** Backend logic is cleanly separated into routers, services, and models.
- **In-Memory Processing:** Zero disk writes are performed. Everything uses streams for maximum performance and privacy.
- **Modern UI:** Premium design with glassmorphism, fluid animations, and dark/light modes.
- **Type Safety:** Strict TypeScript frontend and strongly-typed Python backend.
