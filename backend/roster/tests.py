import json
from pathlib import Path

from django.test import Client, SimpleTestCase, override_settings
from django.urls import reverse


class RosterApiTests(SimpleTestCase):
    def setUp(self):
        self.log_path = Path(__file__).resolve().parent.parent / "tmp_test_attendance.json"
        self.log_path.write_text(json.dumps({"students": [], "attendance": []}), encoding="utf-8")
        self.client = Client()
        self.settings_override = override_settings(ATTENDANCE_LOG_PATH=self.log_path)
        self.settings_override.enable()

    def tearDown(self):
        self.settings_override.disable()
        if self.log_path.exists():
            self.log_path.unlink()

    def test_create_student_check_in_and_today_summary(self):
        created = self.client.post(
            reverse("students"),
            data=json.dumps({"name": "Amina Nalwoga", "student_id": "KAB-1001"}),
            content_type="application/json",
        )
        self.assertEqual(created.status_code, 201)

        check_in = self.client.post(
            reverse("check-in"),
            data=json.dumps({"student_id": "KAB-1001", "status": "Present"}),
            content_type="application/json",
        )
        self.assertEqual(check_in.status_code, 201)
        self.assertFalse(check_in.json()["updated"])

        update = self.client.post(
            reverse("check-in"),
            data=json.dumps({"student_id": "KAB-1001", "status": "Late"}),
            content_type="application/json",
        )
        self.assertEqual(update.status_code, 201)
        self.assertTrue(update.json()["updated"])

        summary = self.client.get(reverse("today-check-ins"))
        payload = summary.json()
        self.assertEqual(summary.status_code, 200)
        self.assertEqual(payload["total_checked_in"], 1)
        self.assertEqual(payload["late"], 1)
        self.assertEqual(payload["students"][0]["name"], "Amina Nalwoga")
