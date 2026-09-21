# KAB Attendance Registry — Team Report

**Course task:** Student Attendance Register  
**Date:** 21 September 2026  
**Team:** 2 students  

This is the process report for the KAB attendance registry. We built a small web app so the school can stop using paper attendance sheets. Records are saved in a local JSON file (`attendance_log.json`), not a database. We split the work into two modules, developed them on separate feature branches, and planned to join them on `main` through pull requests.

---

## Who did what

We agreed the split before writing feature code.

| | Student A — Frank Fayz | Student B |
| --- | --- | --- |
| Role | Roster and daily check-in | Absences and reporting |
| Branch | `feature/roster` | `feature/reporting` |

Neither of us committed feature work straight to `main` after the repo was set up.

---

## Student A — Frank Fayz (Roster & Check-In)

Frank set up the project and built the side that knows who the students are and who showed up.

He initialized the public repository, added the README and `.gitignore`, and scaffolded the Django API plus the React admin screen. From there he owned the roster:

- Admins can create a student profile with a name and student ID.
- They can log a timestamped **Present** or **Late** check-in for today.
- If the same student is checked in twice on the same day, the existing JSON row is updated instead of duplicated.
- There is a simple “today’s register” view that lists everyone already checked in, with totals.

That work lives mainly in `backend/roster/` and in the first version of the shared menu in `frontend/src/App.jsx`. His commits on `feature/roster` cover the JSON store, the roster API, the check-in screens, and the roster section of the README.

---

## Student B — Absence & Reporting

Student B built the side that looks at the same JSON file and answers “who is missing, and how healthy is attendance?”

The reporting module can:

- Flag every roster student who has no Present/Late row for a given day as **Absent**, and write that row with a timestamp.
- Calculate an attendance rate for each student (days present or late, divided by school days in the log). Late still counts as attended.
- Show absence streaks — how many days in a row someone has been missing, and their longest streak.
- List chronically absent students, using 85% as the cutoff.

That work lives in `backend/reporting/`. Student B also added the reporting buttons to the **same main menu** in `frontend/src/App.jsx` so both modules sit in one admin console. Sample rows were put in `attendance_log.json` so the reports are not empty when you first open the app.

Student B’s commits on `feature/reporting` cover the reporting APIs, the extra menu screens, the sample log, and this write-up.

Student B’s GitHub review job (as required by the brief): review and approve Frank’s roster pull request, then open the reporting pull request. After the roster PR lands on `main`, merge `main` into `feature/reporting`, fix the expected conflict in `App.jsx` so both sets of menu options stay, and complete the second PR.

---

## How the two parts fit together

Frank’s module writes students and check-ins. Student B’s module reads that same file, fills in Absents, and prints health numbers. The shared entry point is `frontend/src/App.jsx`. We both had to touch that file on purpose so Git would treat it like a real integration, not two disconnected apps.

End to end, an admin can add a student, check them in, flag whoever did not show up, then look at rates, streaks, and the chronic list.

---

## Git workflow we followed

1. `main` is production. Feature work stays on `feature/roster` and `feature/reporting`.
2. Student A opens a pull request from `feature/roster`. Student B reviews it, leaves a comment or approval, and merges it.
3. Student B opens a pull request from `feature/reporting`. Because both people edited the main menu, GitHub may flag a merge conflict.
4. Student B fetches the updated `main`, merges it locally, keeps both roster and reporting menu items, commits the fix, and finishes the PR.

That gives the history the brief asks for: two feature branches, two pull requests, a review, and a conflict resolved on the reporting branch rather than by forcing work onto `main`.

---

## What to attach on submission

- Public GitHub repo: `kab-attendance-registry`
- This report (each person’s contribution is in the sections above)
- Screenshots or a short note if the lecturer wants proof the app runs

If Student B’s GitHub display name is not filled in on the repo yet, add it on the reporting commits before pushing so Insights shows both people.
