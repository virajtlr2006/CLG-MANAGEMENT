import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api";

function EnrollmentsPage() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [form, setForm] = useState({ studentId: "", courseId: "", semester: 1 });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const canCreate = useMemo(
    () => students.length > 0 && courses.length > 0,
    [students.length, courses.length]
  );

  async function loadData() {
    const [studentsData, coursesData, enrollmentsData] = await Promise.all([
      apiRequest("/students"),
      apiRequest("/courses"),
      apiRequest("/enrollments"),
    ]);
    setStudents(studentsData);
    setCourses(coursesData);
    setEnrollments(enrollmentsData);
  }

  useEffect(() => {
    let ignore = false;

    async function bootstrap() {
      try {
        const [studentsData, coursesData, enrollmentsData] = await Promise.all([
          apiRequest("/students"),
          apiRequest("/courses"),
          apiRequest("/enrollments"),
        ]);
        if (!ignore) {
          setStudents(studentsData);
          setCourses(coursesData);
          setEnrollments(enrollmentsData);
        }
      } catch (error) {
        if (!ignore) {
          setStatus(error.message);
        }
      }
    }

    bootstrap();

    return () => {
      ignore = true;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      await apiRequest("/enrollments", {
        method: "POST",
        body: JSON.stringify({
          studentId: form.studentId,
          courseId: form.courseId,
          semester: Number(form.semester),
        }),
      });
      setStatus("Enrollment created successfully.");
      setForm({ studentId: "", courseId: "", semester: 1 });
      await loadData();
    } catch (submitError) {
      setStatus(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {status ? <p className="rounded bg-slate-100 px-3 py-2 text-sm text-slate-700">{status}</p> : null}

      <section className="rounded-xl border border-slate-100 p-4">
        <h3 className="mb-4 text-lg font-semibold text-slate-800">Create enrollment</h3>
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-4">
          <div>
            <label
              htmlFor="enrollment-student"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Student
            </label>
            <select
              id="enrollment-student"
              value={form.studentId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, studentId: event.target.value }))
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 ring-purple-300 outline-none focus:ring-2"
              required
            >
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.department})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="enrollment-course"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Course
            </label>
            <select
              id="enrollment-course"
              value={form.courseId}
              onChange={(event) => setForm((prev) => ({ ...prev, courseId: event.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 ring-purple-300 outline-none focus:ring-2"
              required
            >
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.code} - {course.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="enrollment-semester"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Semester
            </label>
            <input
              id="enrollment-semester"
              type="number"
              min="1"
              max="8"
              value={form.semester}
              onChange={(event) => setForm((prev) => ({ ...prev, semester: event.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 ring-purple-300 outline-none focus:ring-2"
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={!canCreate || loading}
              className="w-full cursor-pointer rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-purple-300"
            >
              {loading ? "Saving..." : "Create"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-slate-100 p-4">
        <h3 className="mb-4 text-lg font-semibold text-slate-800">Enrollment records</h3>
        <div className="space-y-2">
          {enrollments.map((enrollment) => (
            <article
              key={enrollment._id}
              className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700"
            >
              <span className="font-medium">{enrollment.student?.name}</span> enrolled in{" "}
              <span className="font-medium">{enrollment.course?.code}</span> ({enrollment.course?.title})
              {" "}for semester {enrollment.semester}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default EnrollmentsPage;
