from django.utils import timezone

from roster.json_store import read_store, write_store

VALID_STATUSES = {"Present", "Late"}


def _now():
    return timezone.localtime()


def _today_iso():
    return _now().date().isoformat()


def list_students():
    return read_store()["students"]


def create_student(name, student_id):
    name = (name or "").strip()
    student_id = (student_id or "").strip()
    if not name:
        raise ValueError("Name is required.")
    if not student_id:
        raise ValueError("Student ID is required.")

    store = read_store()
    for student in store["students"]:
        if student["student_id"].lower() == student_id.lower():
            raise ValueError(f"Student ID {student_id} already exists.")

    record = {
        "student_id": student_id,
        "name": name,
        "created_at": _now().isoformat(),
    }
    store["students"].append(record)
    write_store(store)
    return record


def check_in(student_id, status):
    student_id = (student_id or "").strip()
    status = (status or "").strip().title()
    if not student_id:
        raise ValueError("Student ID is required.")
    if status not in VALID_STATUSES:
        raise ValueError("Status must be Present or Late.")

    store = read_store()
    student = next(
        (item for item in store["students"] if item["student_id"].lower() == student_id.lower()),
        None,
    )
    if student is None:
        raise ValueError(f"No student found with ID {student_id}.")

    today = _today_iso()
    timestamp = _now().isoformat()
    record = {
        "student_id": student["student_id"],
        "name": student["name"],
        "status": status,
        "date": today,
        "timestamp": timestamp,
    }

    updated = False
    for index, existing in enumerate(store["attendance"]):
        if existing["student_id"].lower() == student_id.lower() and existing.get("date") == today:
            store["attendance"][index] = record
            updated = True
            break
    if not updated:
        store["attendance"].append(record)

    write_store(store)
    return {"record": record, "updated": updated}


def today_check_ins():
    today = _today_iso()
    store = read_store()
    records = [item for item in store["attendance"] if item.get("date") == today]
    records.sort(key=lambda item: item.get("timestamp") or "")
    present = sum(1 for item in records if item["status"] == "Present")
    late = sum(1 for item in records if item["status"] == "Late")
    return {
        "date": today,
        "total_checked_in": len(records),
        "present": present,
        "late": late,
        "students": records,
    }
