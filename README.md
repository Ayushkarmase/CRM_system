# DeskFlow — Customer Support Operations

DeskFlow is a production-ready, full-stack Customer Support Ticketing CRM built for the **Datastraw AI + Tech Intern Assessment**. Designed as a fast, intuitive, and practical tool for support teams, DeskFlow replaces flashy SaaS templates and fake AI fluff with real operational clarity: clear status indicators, scannable priority triage, instant search, persisted internal notes, and an integrated **Interactive AI Support Assistant**.

---

## Technical Overview

* **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Lucide React icons, Axios
* **Backend**: Python 3.10+, FastAPI, SQLAlchemy 2.0 ORM, Pydantic v2, Pytest
* **Database**: SQLite (`deskflow.db`) with production-ready connection string abstraction
* **ID Strategy**: Auto-generated sequential human-readable Ticket IDs (`TKT-001`, `TKT-002`, `TKT-003`)
* **Testing**: Pytest unit test suite covering full REST workflows

---

## Core Features

1. **Interactive AI Support Assistant Widget (`Ask DeskFlow AI`)**:
   * Floating operational guide widget accessible on every page.
   * Preset quick topics: *How DeskFlow Works*, *Ticket Priority Guide*, *Managing Ticket Statuses*, *Internal Team Notes*, *Search & Filters*.
   * Instant interactive guidance explaining ticket workflows and SLAs.
2. **Dashboard & Support Overview**:
   * Live queue stats computed directly from database records: `Total Tickets`, `Open`, `In Progress`, `Closed`.
   * Recent Ticket activity queue with quick navigate actions.
3. **Ticket Creation (`/tickets/new`)**:
   * Capture customer name, email, subject, detailed description, and priority level.
   * Full client-side validation (email format, non-empty fields) & server-side Pydantic validation.
   * Auto-generates human-readable IDs (`TKT-XXX`) and redirects to details view with toast feedback.
4. **Ticket Management & Search (`/tickets`)**:
   * Live backend text search across `ticket_id`, `customer_name`, `customer_email`, `subject`, and `description`.
   * Real-time status filtering (`All`, `Open`, `In Progress`, `Closed`) with count badges.
   * Responsive desktop table and mobile card view.
5. **Ticket Details & Internal Notes (`/tickets/:ticketId`)**:
   * View full issue description and customer info (with mailto quick-links).
   * Update workflow status (`Open` → `In Progress` → `Closed`) in real time.
   * Add internal team notes persisted chronologically in SQLite.
6. **Standout Feature — Ticket Priority Management**:
   * Prioritize tickets using four scannable tiers: `Low`, `Medium`, `High`, and `Urgent`.
   * Enables support managers to triage critical outages and billing issues immediately.
7. **Omnichannel Website Integration & Embed Guide (`/integration`)**:
   * Drop-in client support widget script (`deskflow-widget.js`) to capture tickets from any external website.
   * Copy-paste integration code snippets for **Embedded JS Widget**, **React/Next.js Form**, **Vanilla HTML Form**, and **cURL/REST API**.
   * Live interactive test sandbox with instant `POST /api/tickets` validation.

---

## Architecture & Data Flow

```text
┌──────────────────────────────────────────────────────────┐
│             React 18 Frontend + AI Assistant             │
│             (Vite + Tailwind CSS + Lucide Icons)         │
└────────────────────────────┬─────────────────────────────┘
                             │ REST API (JSON)
┌────────────────────────────▼─────────────────────────────┐
│                      FastAPI Backend                     │
│         (Pydantic V2 Validation & API Routing)           │
└────────────────────────────┬─────────────────────────────┘
                             │ SQLAlchemy 2.0 ORM
┌────────────────────────────▼─────────────────────────────┐
│                      SQLite Database                     │
│                  (tickets & notes tables)                │
└──────────────────────────────────────────────────────────┘
```

---

## Project Structure

```text
assignment/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app init & CORS middleware
│   │   ├── database.py          # SQLAlchemy engine & session factory
│   │   ├── models.py            # Ticket and Note ORM models
│   │   ├── schemas.py           # Pydantic v2 schemas
│   │   ├── crud.py              # Database interaction layer
│   │   ├── routes/
│   │   │   └── tickets.py       # API endpoints (/api/tickets)
│   │   └── services/
│   │       └── ticket_service.py # Ticket ID generator (TKT-001)
│   ├── tests/
│   │   └── test_tickets.py      # Pytest unit tests
│   ├── seed.py                  # Sample data seeding script (12 tickets)
│   ├── requirements.txt         # Python dependencies
│   ├── Procfile                 # Railway deployment config
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/          # Layout, Sidebar, Navbar, AIHelpWidget, StatusBadge, PriorityBadge, etc.
│   │   ├── pages/               # Dashboard, Tickets, CreateTicket, TicketDetails, Settings
│   │   ├── services/
│   │   │   └── api.js           # Axios API service
│   │   ├── App.jsx              # React Router setup
│   │   ├── main.jsx
│   │   └── index.css            # Tailwind directives
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── vercel.json              # Vercel SPA routing fallback
├── pytest.ini
├── .gitignore
└── README.md
```

---

## Database Schema

### `tickets` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | Primary Key, Autoincrement | Internal DB Primary Key |
| `ticket_id` | VARCHAR(20) | Unique, Indexed, Not Null | Human-readable ID (e.g. `TKT-001`) |
| `customer_name` | VARCHAR(255) | Not Null | Customer Full Name |
| `customer_email` | VARCHAR(255) | Not Null | Validated Customer Email |
| `subject` | VARCHAR(255) | Not Null | Issue Title / Subject |
| `description` | TEXT | Not Null | Detailed description |
| `status` | VARCHAR(50) | Not Null, Default 'Open' | Workflow status: `Open`, `In Progress`, `Closed` |
| `priority` | VARCHAR(50) | Not Null, Default 'Medium' | Priority: `Low`, `Medium`, `High`, `Urgent` |
| `created_at` | DATETIME | Not Null | Creation timestamp (UTC) |
| `updated_at` | DATETIME | Not Null | Last updated timestamp (UTC) |

### `notes` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | Primary Key, Autoincrement | Internal Note Primary Key |
| `ticket_id` | INTEGER | Foreign Key (`tickets.id`), Not Null | FK linking to parent ticket |
| `note_text` | TEXT | Not Null | Internal team note content |
| `created_at` | DATETIME | Not Null | Timestamp note was recorded |

---

## API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/tickets` | Create ticket (auto-generates `TKT-XXX`) |
| `GET` | `/api/tickets` | List tickets (supports `?status=`, `?priority=`, `?search=`) |
| `GET` | `/api/tickets/stats` | Queue statistics (`total`, `open`, `in_progress`, `closed`) |
| `GET` | `/api/tickets/{ticket_id}` | Retrieve ticket details + internal notes history |
| `PUT` | `/api/tickets/{ticket_id}` | Update status, priority, or attach internal note |
| `POST` | `/api/tickets/{ticket_id}/notes` | Add internal note to ticket |

---

## Local Setup & Development

### 1. Prerequisites
* Python 3.10+
* Node.js v18+ & npm

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Install Python requirements
pip install -r requirements.txt

# Seed sample data (12 realistic tickets & internal notes)
python seed.py

# Run development server
uvicorn app.main:app --reload --port 8000
```

The backend server will run at `http://localhost:8000`. Interactive API docs (Swagger) are available at `http://localhost:8000/docs`.

### 3. Running Backend Unit Tests
```bash
# Run pytest from the project root
pytest
```

### 4. Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```

The React frontend will start at `http://localhost:5173`.

---

## Environment Variables

### Backend (`/backend/.env`)
```env
DATABASE_URL=sqlite:///./deskflow.db
FRONTEND_URL=http://localhost:5173
PORT=8000
```

### Frontend (`/frontend/.env`)
```env
VITE_API_URL=
```
*(Leave `VITE_API_URL` empty in local development to utilize Vite's dev proxy to `localhost:8000`)*

---

## Deployment Setup

### Deploying Backend to Railway
1. Push repository to GitHub.
2. Create a new service on Railway connected to your repository, specifying `/backend` as the **Root Directory**.
3. Railway automatically detects `requirements.txt` and `Procfile` / `railway.json`.
4. Under **Settings > Networking > Public Networking**, click **Generate Domain** to get your backend URL (e.g. `https://your-backend.up.railway.app`).
5. (Optional) Set environment variables if needed:
   * `FRONTEND_URL`: `https://your-frontend-domain.vercel.app` (or your frontend domain)
   * `ALLOW_ALL_CORS`: `true`

### Deploying Frontend to Vercel / Railway
1. Connect repository to Vercel (or create a frontend service on Railway), setting `/frontend` as the **Root Directory**.
2. Build command: `npm run build`, Output directory: `dist`.
3. Set environment variable:
   * `VITE_API_URL`: `https://your-backend.up.railway.app` (replace with your generated Railway backend URL)

---

## Design Decisions & Thoughtful UX Details

* **No Synthetic Fluff**: Avoided oversized neon cards, purple gradients, glassmorphism, or fake AI badges. The design mirrors practical tools used daily by support teams.
* **Readable Typography & Spacing**: Built on Inter typography with explicit hierarchy (24-28px page titles, 14-15px body, 12-13px metadata).
* **Human-Readable Ticket IDs**: Backend assigns sequential IDs (`TKT-001`, `TKT-002`) instead of confusing 36-character UUID strings.
* **Responsive Layout**: Transforms desktop data tables into compact, scannable cards on mobile viewports (<768px).
* **Defensive Error Handling**: Replaces blank screens and generic 500 alerts with contextual Empty States and Toast notifications.

---

## Standout Feature Justification

**Ticket Priority Management (`Low`, `Medium`, `High`, `Urgent`)**  
A real customer support desk handling dozens of requests per hour needs to distinguish between a general feature inquiry and a critical payment or login failure. By surfacing scannable priority badges on the Dashboard, Ticket Table, and Ticket Details pages, DeskFlow allows engineers and support agents to triage high-impact requests immediately.
