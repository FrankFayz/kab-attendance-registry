import { useEffect, useState } from "react";
import { checkIn, createStudent, listStudents, todaySummary } from "./api";
import "./App.css";

const VIEWS = {
  home: "home",
  createStudent: "createStudent",
  checkIn: "checkIn",
  today: "today",
};

function formatTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function App() {
  const [view, setView] = useState(VIEWS.home);
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [checkInId, setCheckInId] = useState("");
  const [status, setStatus] = useState("Present");

  async function refresh() {
    const [studentData, todayData] = await Promise.all([listStudents(), todaySummary()]);
    setStudents(studentData.students || []);
    setSummary(todayData);
  }

  useEffect(() => {
    refresh().catch((err) => setError(err.message));
  }, []);

  async function handleCreate(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await createStudent({ name, student_id: studentId });
      setName("");
      setStudentId("");
      setMessage("Student profile saved.");
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleCheckIn(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await checkIn({ student_id: checkInId, status });
      const action = result.updated ? "updated" : "recorded";
      setMessage(`${result.record.name} marked ${result.record.status} (${action}).`);
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="shell">
      <header className="hero">
        <p className="kicker">KAB Attendance Registry</p>
        <h1>Student Attendance Register</h1>
        <p className="lede">
          Core admin console. Roster and daily check-in are live. Absence reporting
          will attach from the reporting module.
        </p>
      </header>

      <nav className="menu" aria-label="Main application menu">
        <button type="button" className={view === VIEWS.home ? "active" : ""} onClick={() => setView(VIEWS.home)}>
          Overview
        </button>
        <button
          type="button"
          className={view === VIEWS.createStudent ? "active" : ""}
          onClick={() => setView(VIEWS.createStudent)}
        >
          Add Student
        </button>
        <button
          type="button"
          className={view === VIEWS.checkIn ? "active" : ""}
          onClick={() => setView(VIEWS.checkIn)}
        >
          Check In
        </button>
        <button type="button" className={view === VIEWS.today ? "active" : ""} onClick={() => setView(VIEWS.today)}>
          Today&apos;s Register
        </button>
        {/* Student B: add Absence & Reporting menu buttons in this same nav. */}
      </nav>

      {(message || error) && (
        <p className={error ? "banner error" : "banner ok"} role="status">
          {error || message}
        </p>
      )}

      {view === VIEWS.home && (
        <section className="panel">
          <h2>Registry snapshot</h2>
          <div className="stats">
            <article>
              <strong>{students.length}</strong>
              <span>Students on roster</span>
            </article>
            <article>
              <strong>{summary?.total_checked_in ?? 0}</strong>
              <span>Checked in today</span>
            </article>
            <article>
              <strong>{summary?.present ?? 0}</strong>
              <span>Present</span>
            </article>
            <article>
              <strong>{summary?.late ?? 0}</strong>
              <span>Late</span>
            </article>
          </div>
        </section>
      )}

      {view === VIEWS.createStudent && (
        <section className="panel">
          <h2>Create student profile</h2>
          <p>Name and Student ID are stored in attendance_log.json.</p>
          <form onSubmit={handleCreate} className="form">
            <label>
              Full name
              <input value={name} onChange={(event) => setName(event.target.value)} required />
            </label>
            <label>
              Student ID
              <input value={studentId} onChange={(event) => setStudentId(event.target.value)} required />
            </label>
            <button type="submit" disabled={busy}>
              Save profile
            </button>
          </form>
        </section>
      )}

      {view === VIEWS.checkIn && (
        <section className="panel">
          <h2>Daily check-in</h2>
          <p>Records a timestamped Present or Late status. A second check-in today updates the same row.</p>
          <form onSubmit={handleCheckIn} className="form">
            <label>
              Student
              <select value={checkInId} onChange={(event) => setCheckInId(event.target.value)} required>
                <option value="">Select a student</option>
                {students.map((student) => (
                  <option key={student.student_id} value={student.student_id}>
                    {student.name} ({student.student_id})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
              </select>
            </label>
            <button type="submit" disabled={busy || students.length === 0}>
              Log attendance
            </button>
          </form>
        </section>
      )}

      {view === VIEWS.today && (
        <section className="panel">
          <h2>Students checked in today</h2>
          <p>{summary?.date || "Loading date..."}</p>
          {summary?.students?.length ? (
            <table>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {summary.students.map((row) => (
                  <tr key={`${row.student_id}-${row.timestamp}`}>
                    <td>{row.student_id}</td>
                    <td>{row.name}</td>
                    <td>
                      <span className={row.status === "Late" ? "pill late" : "pill present"}>{row.status}</span>
                    </td>
                    <td>{formatTime(row.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty">No check-ins recorded for today yet.</p>
          )}
        </section>
      )}
    </div>
  );
}
