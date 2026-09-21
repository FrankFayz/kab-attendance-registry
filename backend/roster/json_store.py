import json
from pathlib import Path

from django.conf import settings


def log_path() -> Path:
    path = Path(settings.ATTENDANCE_LOG_PATH)
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


def empty_store():
    return {"students": [], "attendance": []}


def read_store():
    path = log_path()
    if not path.exists():
        data = empty_store()
        write_store(data)
        return data
    with path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    data.setdefault("students", [])
    data.setdefault("attendance", [])
    return data


def write_store(data):
    path = log_path()
    with path.open("w", encoding="utf-8") as handle:
        json.dump(data, handle, indent=2)
        handle.write("\n")
