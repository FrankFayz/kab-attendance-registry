import { useEffect, useState } from "react";
import {
  absenceStreaks,
  attendanceHealth,
  checkIn,
  chronicAbsences,
  createStudent,
  listStudents,
  markAbsences,
  reportingDashboard,
  todaySummary,
} from "./api";
import "./App.css";

const VIEWS = {
  home: "home",
  createStudent: "createStudent",
  checkIn: "checkIn",
  today: "today",
  flagAbsences: "flagAbsences",
  health: "health",
  streaks: "streaks",
  chronic: "chronic",
};

function formatTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function percent(value) {
  return value == null ? "—" : `${value}%`;
}

function statusClass(status) {
  if (status === "Late") return "pill late";
  if (status === "Absent") return "pill absent";
  return "pill present";
}

export default function App() {
  const [view, setView] = useState(VIEWS.home);
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [health, setHealth] = useState(null);
  const [streaks, setStreaks] = useState(null);
  const [chronic, setChronic] = useState(null);
  const [absenceResult, setAbsenceResult] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [checkInId, setCheckInId] = useState("");
  const [status, setStatus] = useState("Present");

  async function refresh() {
    const [studentData, todayData, dashData, healthData, streakData, chronicData] = await Promise.all([
      listStudents(),
      todaySummary(),
      reportingDashboard(),
      attendanceHealth(),
      absenceStreaks(),
      chronicAbsences(),
    ]);
    setStudents(studentData.students || []);
    setSummary(todayData);
    setDashboard(dashData);
    setHealth(healthData);
    setStreaks(streakData);
    setChronic(chronicData);
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

  async function handleFlagAbsences() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await markAbsences();
      setAbsenceResult(result);
      setMessage(
        result.flagged_count
          ? `Flagged ${result.flagged_count} missing student(s) as Absent for ${result.date}.`
          : `No new absences for ${result.date}. Everyone already has a status.`,
      );
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
          Roster check-in plus absence reporting: flag missing students, score attendance
          health, and list chronic absences below 85%.
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
        <button
          type="button"
          className={view === VIEWS.flagAbsences ? "active" : ""}
          onClick={() => setView(VIEWS.flagAbsences)}
        >
          Flag Absences
        </button>
        <button type="button" className={view === VIEWS.health ? "active" : ""} onClick={() => setView(VIEWS.health)}>
          Attendance Health
        </button>
        <button type="button" className={view === VIEWS.streaks ? "active" : ""} onClick={() => setView(VIEWS.streaks)}>
          Absence Streaks
        </button>
        <button type="button" className={view === VIEWS.chronic ? "active" : ""} onClick={() => setView(VIEWS.chronic)}>
          Chronic Absences
        </button>
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
            <article>
              <strong>{dashboard?.absent_today ?? 0}</strong>
              <span>Absent today</span>
            </article>
            <article>
              <strong>{percent(dashboard?.overall_attendance_percent)}</strong>
              <span>Overall attendance</span>
            </article>
            <article>
              <strong>{dashboard?.chronic_count ?? 0}</strong>
              <span>Below 85%</span>
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
                      <span className={statusClass(row.status)}>{row.status}</span>
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

      {view === VIEWS.flagAbsences && (
        <section className="panel">
          <h2>Flag missing students as Absent</h2>
          <p>
            Reads the roster and today&apos;s rows in attendance_log.json. Anyone without Present or
            Late is written as Absent with a timestamp.
          </p>
          <button type="button" className="primary" disabled={busy} onClick={handleFlagAbsences}>
            Flag today&apos;s absences
          </button>
          {absenceResult && (
            <div className="result-block">
              <p>
                Date: {absenceResult.date}. Newly flagged: {absenceResult.flagged_count}. Already
                logged: {absenceResult.already_logged?.length || 0}.
              </p>
              {absenceResult.flagged?.length ? (
                <ul>
                  {absenceResult.flagged.map((row) => (
                    <li key={row.student_id}>
                      {row.name} ({row.student_id}) — Absent
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        </section>
      )}

      {view === VIEWS.health && (
        <section className="panel">
          <h2>Attendance health</h2>
          <p>
            Rate = days Present or Late ÷ school days in the log. Overall rate is the average of
            every student on the roster.
          </p>
          <div className="stats">
            <article>
              <strong>{percent(health?.overall_attendance_percent)}</strong>
              <span>Overall attendance</span>
            </article>
            <article>
              <strong>{Math.round((health?.threshold || 0.85) * 100)}%</strong>
              <span>Chronic cutoff</span>
            </article>
          </div>
          {health?.students?.length ? (
            <table>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Present / Late</th>
                  <th>Absent</th>
                  <th>School days</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                {health.students.map((row) => (
                  <tr key={row.student_id}>
                    <td>{row.student_id}</td>
                    <td>{row.name}</td>
                    <td>{row.days_present}</td>
                    <td>{row.days_absent}</td>
                    <td>{row.school_days}</td>
                    <td>
                      <span className={row.is_chronic ? "pill chronic" : "pill present"}>
                        {percent(row.attendance_percent)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty">Add students and attendance rows before scoring health.</p>
          )}
        </section>
      )}

      {view === VIEWS.streaks && (
        <section className="panel">
          <h2>Absence streaks</h2>
          <p>Consecutive Absent (or missing) days in attendance_log.json, newest day last.</p>
          {streaks?.students?.length ? (
            <table>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Current streak</th>
                  <th>Longest streak</th>
                  <th>School days</th>
                </tr>
              </thead>
              <tbody>
                {streaks.students.map((row) => (
                  <tr key={row.student_id}>
                    <td>{row.student_id}</td>
                    <td>{row.name}</td>
                    <td>{row.current_streak}</td>
                    <td>{row.longest_streak}</td>
                    <td>{row.school_days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty">No streak data yet.</p>
          )}
        </section>
      )}

      {view === VIEWS.chronic && (
        <section className="panel">
          <h2>Chronically absent students</h2>
          <p>Attendance below 85% (Present and Late both count as attended).</p>
          {chronic?.students?.length ? (
            <table>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Present / Late</th>
                  <th>Absent</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                {chronic.students.map((row) => (
                  <tr key={row.student_id}>
                    <td>{row.student_id}</td>
                    <td>{row.name}</td>
                    <td>{row.days_present}</td>
                    <td>{row.days_absent}</td>
                    <td>
                      <span className="pill chronic">{percent(row.attendance_percent)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty">No student is currently below the 85% threshold.</p>
          )}
        </section>
      )}
    </div>
  );
}
