# KAB Attendance Registry — Process Report

**Institution:** KAB  
**Assignment:** Student Attendance Register  
**Date:** 21 September 2026  
**Team size:** 2

## Role assignment

| Person | Module | Git branch |
| --- | --- | --- |
| Student A — Frank Fayz | Roster & Check-In | `feature/roster` |
| Student B | Absence & Reporting | `feature/reporting` |

## Student A contribution

Student A owns student identity and daily presence.

- Repository setup follow-through on `feature/roster` (no feature work on `main`)
- Django JSON store for `attendance_log.json`
- Create student profile (name, student ID)
- Timestamped Present / Late check-in with same-day update
- Today's register summary and totals
- React admin screens and main-menu wiring for roster actions
- README roster section and this contribution report section

## Student B contribution

Student B owns absence tracking and attendance health reporting. Work lives on `feature/reporting` and must not be committed straight to `main`.

| Deliverable | Where it lives |
| --- | --- |
| Flag missing students as Absent (timestamped JSON append) | `backend/reporting/services.py` → `mark_absences()` |
| Attendance rate (present-or-late days ÷ school days) | `attendance_health()` |
| Absence streaks / consecutive missed days | `absence_streaks()` |
| Chronic list (below 85%) | `chronic_absences()` |
| REST endpoints | `backend/reporting/views.py`, `backend/reporting/urls.py` |
| Wire reporting into the same main menu | `frontend/src/App.jsx` |
| API client | `frontend/src/api.js` |
| Unit tests | `backend/reporting/tests.py` |
| Sample JSON so reports are demoable | `data/attendance_log.json` |
| Module documentation | `README.md` |

Student B also:

- Reviews, comments on, and approves Student A's pull request before it is merged
- Opens the `feature/reporting` pull request after that merge
- Fetches updated `main`, merges it into `feature/reporting`, and resolves the expected conflict in `frontend/src/App.jsx` so roster **and** reporting menu options both remain
- Pushes the resolution commit and completes the reporting PR

Fill in after GitHub work is done:

| Evidence | Link / hash |
| --- | --- |
| Student B GitHub profile | |
| `feature/reporting` PR | |
| Review comment / approval on Student A's PR | |
| Merge-conflict resolution commit | |

## DevOps evidence to collect

- [ ] `feature/roster` PR reviewed, approved, and merged by Student B
- [ ] `feature/reporting` PR opened after Student A's merge
- [ ] Merge conflict in `frontend/src/App.jsx` resolved on `feature/reporting`
- [ ] No direct feature commits on `main` after initial setup
- [ ] Contributor graph shows both GitHub profiles (each student must commit with their own GitHub email)
