const headers = { "Content-Type": "application/json" };

async function request(path, options = {}) {
  const response = await fetch(path, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || "Request failed.");
  }
  return data;
}

export function listStudents() {
  return request("/api/students/");
}

export function createStudent(payload) {
  return request("/api/students/", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
}

export function checkIn(payload) {
  return request("/api/check-in/", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
}

export function todaySummary() {
  return request("/api/check-ins/today/");
}

export function markAbsences(date) {
  return request("/api/mark-absences/", {
    method: "POST",
    headers,
    body: JSON.stringify(date ? { date } : {}),
  });
}

export function attendanceHealth() {
  return request("/api/health/");
}

export function chronicAbsences() {
  return request("/api/chronic/");
}

export function absenceStreaks() {
  return request("/api/streaks/");
}

export function reportingDashboard() {
  return request("/api/dashboard/");
}
