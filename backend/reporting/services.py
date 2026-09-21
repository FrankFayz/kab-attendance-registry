from django.utils import timezone

from roster.json_store import read_store, write_store

ATTENDED_STATUSES = {"Present", "Late"}
CHRONIC_THRESHOLD = 0.85


def _now():
    return timezone.localtime()


def _today_iso():
    return _now().date().isoformat()


def _school_dates(store):
    return sorted({row.get("date") for row in store["attendance"] if row.get("date")})


def _created_date(student):
    return (student.get("created_at") or "")[:10]


def _days_for_student(student, school_dates):
    created = _created_date(student)
    if created:
        return [day for day in school_dates if day >= created]
    return list(school_dates)


def _record_on(student_id, day, attendance):
    student_id = student_id.lower()
    return next(
        (
            row
            for row in attendance
            if row.get("student_id", "").lower() == student_id and row.get("date") == day
        ),
        None,
    )


def mark_absences(date=None):
    target_date = (date or "").strip() or _today_iso()
    store = read_store()
    if not store["students"]:
        raise ValueError("No students on the roster. Add profiles before flagging absences.")

    flagged = []
    already_logged = []

    for student in store["students"]:
        existing = _record_on(student["student_id"], target_date, store["attendance"])
        if existing:
            already_logged.append(
                {
                    "student_id": student["student_id"],
                    "name": student["name"],
                    "status": existing["status"],
                }
            )
            continue

        record = {
            "student_id": student["student_id"],
            "name": student["name"],
            "status": "Absent",
            "date": target_date,
            "timestamp": _now().isoformat(),
        }
        store["attendance"].append(record)
        flagged.append(record)

    write_store(store)
    return {
        "date": target_date,
        "flagged": flagged,
        "already_logged": already_logged,
        "flagged_count": len(flagged),
    }


def _health_row(student, store):
    school_dates = _days_for_student(student, _school_dates(store))
    days_present = 0
    days_absent = 0
    for day in school_dates:
        record = _record_on(student["student_id"], day, store["attendance"])
        if record and record.get("status") in ATTENDED_STATUSES:
            days_present += 1
        else:
            days_absent += 1

    school_days = len(school_dates)
    rate = round(days_present / school_days, 4) if school_days else None
    return {
        "student_id": student["student_id"],
        "name": student["name"],
        "school_days": school_days,
        "days_present": days_present,
        "days_absent": days_absent,
        "attendance_rate": rate,
        "attendance_percent": round(rate * 100, 1) if rate is not None else None,
        "is_chronic": rate is not None and rate < CHRONIC_THRESHOLD,
    }


def attendance_health():
    store = read_store()
    rows = [_health_row(student, store) for student in store["students"]]
    rates = [row["attendance_rate"] for row in rows if row["attendance_rate"] is not None]
    overall = round(sum(rates) / len(rates), 4) if rates else None
    return {
        "threshold": CHRONIC_THRESHOLD,
        "overall_attendance_rate": overall,
        "overall_attendance_percent": round(overall * 100, 1) if overall is not None else None,
        "students": rows,
    }


def chronic_absences():
    payload = attendance_health()
    chronic = [row for row in payload["students"] if row["is_chronic"]]
    chronic.sort(key=lambda row: (row["attendance_rate"] is None, row["attendance_rate"] or 0))
    return {
        "threshold": payload["threshold"],
        "count": len(chronic),
        "students": chronic,
    }


def _streaks_for(student, store):
    days = _days_for_student(student, _school_dates(store))
    longest = 0
    current = 0
    running = 0
    for day in days:
        record = _record_on(student["student_id"], day, store["attendance"])
        is_absent = not record or record.get("status") == "Absent"
        if is_absent:
            running += 1
            longest = max(longest, running)
        else:
            running = 0
    current = 0
    for day in reversed(days):
        record = _record_on(student["student_id"], day, store["attendance"])
        if not record or record.get("status") == "Absent":
            current += 1
        else:
            break
    return {
        "student_id": student["student_id"],
        "name": student["name"],
        "current_streak": current,
        "longest_streak": longest,
        "school_days": len(days),
    }


def absence_streaks():
    store = read_store()
    rows = [_streaks_for(student, store) for student in store["students"]]
    rows.sort(key=lambda row: (-row["current_streak"], -row["longest_streak"], row["name"]))
    return {"students": rows}


def dashboard():
    store = read_store()
    today = _today_iso()
    health = attendance_health()
    chronic = chronic_absences()
    today_absent = [
        row
        for row in store["attendance"]
        if row.get("date") == today and row.get("status") == "Absent"
    ]
    return {
        "date": today,
        "absent_today": len(today_absent),
        "chronic_count": chronic["count"],
        "overall_attendance_percent": health["overall_attendance_percent"],
        "health": health,
        "chronic": chronic,
        "streaks": absence_streaks(),
    }
