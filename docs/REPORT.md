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
- README and this contribution report section

## Student B contribution

Student B owns absence tracking and attendance health reporting.

- Flag students missing from today's roster as Absent
- Attendance rate (days present / school days)
- Absence streaks from `attendance_log.json`
- Chronically absent list (attendance below 85%)
- Wire reporting options into the same main application menu
- Review and approve Student A's pull request before merge

*(Student B fills in commit hashes and PR links when the reporting module is complete.)*

## DevOps evidence to collect

- [ ] `feature/roster` PR reviewed, approved, and merged by Student B
- [ ] `feature/reporting` PR opened after Student A's merge
- [ ] Merge conflict in `frontend/src/App.jsx` resolved on `feature/reporting`
- [ ] No direct feature commits on `main` after initial setup
- [ ] Contributor graph shows both GitHub profiles
