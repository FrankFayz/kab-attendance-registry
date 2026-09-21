# KAB Attendance Registry

Web application for KAB to replace paper attendance sheets. Persistence is a local JSON file, not a SQL database.

- Frontend: React (Vite)
- Backend: Django REST API
- Data file: `data/attendance_log.json`

## Team

| Student | Role | Branch |
| --- | --- | --- |
| Student A (Frank Fayz) | Roster & Check-In Module | `feature/roster` |
| Student B | Absence & Reporting Module | `feature/reporting` |

Do not commit to `main` after the initial repository setup. Integrate through pull requests.

## Run locally

From the repository root:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cd backend
python manage.py migrate
python manage.py runserver
```

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

The Vite dev server proxies `/api` to Django on port 8000.

## Student A — Roster & Check-In

Admins can:

1. Create a student profile (name + student ID)
2. Log a timestamped **Present** or **Late** check-in
3. View every student checked in today, with totals

A second check-in for the same student on the same day **updates** the existing JSON row instead of duplicating it.

### API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/students/` | List profiles |
| POST | `/api/students/` | Create profile |
| POST | `/api/check-in/` | Record or update today's status |
| GET | `/api/check-ins/today/` | Today's check-in summary |

### JSON shape

```json
{
  "students": [
    {
      "student_id": "KAB-1001",
      "name": "Amina Nalwoga",
      "created_at": "2026-09-21T09:15:00+03:00"
    }
  ],
  "attendance": [
    {
      "student_id": "KAB-1001",
      "name": "Amina Nalwoga",
      "status": "Present",
      "date": "2026-09-21",
      "timestamp": "2026-09-21T09:16:00+03:00"
    }
  ]
}
```

Student B should read the same `attendance` array to flag absences, streaks, and students below 85% attendance.

## Git workflow

1. `main` stays production-only after setup
2. Student A develops on `feature/roster` and opens a PR into `main`
3. Student B reviews, approves, and merges that PR
4. Student B develops on `feature/reporting`, opens a PR, then resolves the expected merge conflict in the shared menu file (`frontend/src/App.jsx`) after fetching updated `main`
