from pathlib import Path
from tempfile import TemporaryDirectory

from django.test import TestCase, override_settings

from reporting import services
from roster.json_store import write_store


def _store():
    return {
        "students": [
            {
                "student_id": "KAB-1001",
                "name": "Amina Nalwoga",
                "created_at": "2026-09-15T08:00:00+03:00",
            },
            {
                "student_id": "KAB-1002",
                "name": "John Okello",
                "created_at": "2026-09-15T08:00:00+03:00",
            },
        ],
        "attendance": [
            {
                "student_id": "KAB-1001",
                "name": "Amina Nalwoga",
                "status": "Present",
                "date": "2026-09-15",
                "timestamp": "2026-09-15T08:10:00+03:00",
            },
            {
                "student_id": "KAB-1001",
                "name": "Amina Nalwoga",
                "status": "Late",
                "date": "2026-09-16",
                "timestamp": "2026-09-16T08:25:00+03:00",
            },
            {
                "student_id": "KAB-1001",
                "name": "Amina Nalwoga",
                "status": "Present",
                "date": "2026-09-17",
                "timestamp": "2026-09-17T08:05:00+03:00",
            },
            {
                "student_id": "KAB-1002",
                "name": "John Okello",
                "status": "Absent",
                "date": "2026-09-15",
                "timestamp": "2026-09-15T16:00:00+03:00",
            },
            {
                "student_id": "KAB-1002",
                "name": "John Okello",
                "status": "Absent",
                "date": "2026-09-16",
                "timestamp": "2026-09-16T16:00:00+03:00",
            },
            {
                "student_id": "KAB-1002",
                "name": "John Okello",
                "status": "Present",
                "date": "2026-09-17",
                "timestamp": "2026-09-17T08:12:00+03:00",
            },
        ],
    }


class ReportingServicesTests(TestCase):
    def setUp(self):
        self.tmp = TemporaryDirectory()
        self.path = Path(self.tmp.name) / "attendance_log.json"
        self.settings = override_settings(ATTENDANCE_LOG_PATH=self.path)
        self.settings.enable()
        write_store(_store())

    def tearDown(self):
        self.settings.disable()
        self.tmp.cleanup()

    def test_mark_absences_writes_missing_students(self):
        result = services.mark_absences("2026-09-18")
        self.assertEqual(result["flagged_count"], 2)
        self.assertTrue(all(row["status"] == "Absent" for row in result["flagged"]))

        again = services.mark_absences("2026-09-18")
        self.assertEqual(again["flagged_count"], 0)
        self.assertEqual(len(again["already_logged"]), 2)

    def test_attendance_health_counts_late_as_present(self):
        health = services.attendance_health()
        amina = next(row for row in health["students"] if row["student_id"] == "KAB-1001")
        john = next(row for row in health["students"] if row["student_id"] == "KAB-1002")
        self.assertEqual(amina["days_present"], 3)
        self.assertEqual(amina["days_absent"], 0)
        self.assertEqual(john["days_present"], 1)
        self.assertEqual(john["days_absent"], 2)
        self.assertAlmostEqual(john["attendance_rate"], 1 / 3, places=4)

    def test_chronic_list_uses_85_percent_cutoff(self):
        chronic = services.chronic_absences()
        ids = [row["student_id"] for row in chronic["students"]]
        self.assertEqual(chronic["threshold"], 0.85)
        self.assertIn("KAB-1002", ids)
        self.assertNotIn("KAB-1001", ids)

    def test_absence_streaks_find_consecutive_missing_days(self):
        streaks = services.absence_streaks()
        john = next(row for row in streaks["students"] if row["student_id"] == "KAB-1002")
        self.assertEqual(john["longest_streak"], 2)
        self.assertEqual(john["current_streak"], 0)
