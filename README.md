# KAB Attendance Registry

Simple web app for KAB to replace paper attendance sheets. Student records live in a local JSON file, not a database.

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

### Roster API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/students/` | List profiles |
| POST | `/api/students/` | Create profile |
| POST | `/api/check-in/` | Record or update today's status |
| GET | `/api/check-ins/today/` | Today's check-in summary |

## Student B — Absence & Reporting

Student B reads the same `attendance_log.json` file. **Late** counts as attended. Missing rows and explicit **Absent** rows count as missed.

1. **Flag absences** — any roster student without Present/Late for a date is appended as Absent with a timestamp
2. **Attendance health** — rate = (days Present or Late) ÷ school days in the log
3. **Absence streaks** — current and longest run of consecutive missed days
4. **Chronic absences** — students below **85%** attendance

### Reporting API

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/mark-absences/` | Flag missing students as Absent (optional `{"date": "YYYY-MM-DD"}`) |
| GET | `/api/health/` | Per-student and overall attendance rates |
| GET | `/api/chronic/` | Students below 85% |
| GET | `/api/streaks/` | Current and longest absence streaks |
| GET | `/api/dashboard/` | Combined reporting snapshot |

### How rates are calculated

- School days = unique `date` values in the `attendance` array (from the student's `created_at` date onward)
- Present and Late both increase `days_present`
- Absent or no row for that date increases `days_absent`
- Overall attendance = average of each student's rate
- Chronic = rate `< 0.85`

### JSON shape (shared)

```json
{
  "students": [
    {
      "student_id": "KAB-1001",
      "name": "Amina Nalwoga",
      "created_at": "2026-09-15T08:00:00+03:00"
    }
  ],
  "attendance": [
    {
      "student_id": "KAB-1001",
      "name": "Amina Nalwoga",
      "status": "Present",
      "date": "2026-09-15",
      "timestamp": "2026-09-15T08:10:00+03:00"
    }
  ]
}
```

The sample log already includes three students across several days so health, streaks, and the chronic list are visible immediately. Use **Flag Absences** to write Absent rows for anyone not checked in today.

## Git workflow

1. `main` stays production-only after setup
2. Student A develops on `feature/roster` and opens a PR into `main`
3. Student B reviews, approves, and merges that PR
4. Student B develops on `feature/reporting` and also edits the shared menu in `frontend/src/App.jsx`
5. Student B opens a PR. After A's merge, GitHub should show a conflict on that menu file
6. Student B fetches updated `main`, merges it into `feature/reporting`, resolves the conflict so **both** roster and reporting menu items remain, commits the resolution, then completes the PR

### Student B conflict commands

```bash
git checkout feature/reporting
git fetch origin
git merge origin/main
# open frontend/src/App.jsx, keep both sets of menu buttons, save
git add frontend/src/App.jsx
git commit -m "fix: resolve menu merge conflict by keeping roster and reporting options"
git push
```

## Tests

```bash
cd backend
python manage.py test reporting
```
