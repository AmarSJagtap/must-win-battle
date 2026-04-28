# MWB Tracker — Must-Win Battles

Full-stack application with **FastAPI + SQLite** backend and **React (Vite)** frontend.

## Project Structure

```
backend/          ← FastAPI + SQLite
  main.py         ← API server (all endpoints)
  models.py       ← SQLAlchemy models
  schemas.py      ← Pydantic schemas
  database.py     ← DB engine & session
  seed.py         ← Demo data seeder
  requirements.txt

frontend/         ← React + Vite
  src/
    App.jsx       ← Main UI (all pages, tabs, modals)
    api.js        ← API client
    index.css     ← Styles (matches original HTML)
    main.jsx      ← Entry point
  index.html
  vite.config.js
  package.json
```

## Quick Start

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The database (`mwb_tracker.db`) is auto-created and seeded with demo data on first run.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000** — the Vite dev server proxies `/api/*` to the backend.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project detail |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| GET | `/api/stats` | Dashboard stats |
| POST | `/api/projects/:id/milestones` | Add milestone |
| PUT | `/api/milestones/:id` | Update milestone |
| DELETE | `/api/milestones/:id` | Delete milestone |
| POST | `/api/projects/:id/actions` | Add action |
| PUT | `/api/actions/:id` | Update action |
| PATCH | `/api/actions/:id/toggle` | Toggle action done |
| DELETE | `/api/actions/:id` | Delete action |
| POST | `/api/projects/:id/team` | Add team member |
| POST | `/api/projects/:id/reviews` | Post review |
| POST | `/api/projects/:id/attachments` | Add attachment |
| POST | `/api/projects/:id/reminders` | Add reminder |
