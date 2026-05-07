import { useEffect, useState } from "react";
import { apiRequest } from "../api";

const initialForm = {
  id: "",
  studentUniqueId: "",
  name: "",
  email: "",
  department: "",
  semester: 1,
};

function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadStudents() {
    const data = await apiRequest("/students");
    setStudents(data);
  }

  async function loadNextUniqueId() {
    const data = await apiRequest("/students/next-unique-id");
    setForm((prev) => ({ ...prev, studentUniqueId: data.studentUniqueId }));
  }

  useEffect(() => {
    let ignore = false;

    async function bootstrap() {
      try {
        const [studentsData, uniqueIdData] = await Promise.all([
          apiRequest("/students"),
          apiRequest("/students/next-unique-id"),
        ]);
        if (!ignore) {
          setStudents(studentsData);
          setForm((prev) => ({ ...prev, studentUniqueId: uniqueIdData.studentUniqueId }));
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
      const payload = {
        name: form.name,
        email: form.email,
        department: form.department,
        semester: Number(form.semester),
      };
      if (form.id) {
        await apiRequest(`/students/${form.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setStatus("Student updated successfully.");
      } else {
        await apiRequest("/students", {
          method: "POST",
          body: JSON.stringify({
            ...payload,
            studentUniqueId: form.studentUniqueId,
          }),
        });
        setStatus("Student created successfully.");
      }
      setForm(initialForm);
      await loadStudents();
      await loadNextUniqueId();
    } catch (submitError) {
      setStatus(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await apiRequest(`/students/${id}`, { method: "DELETE" });
      setStatus("Student deleted successfully.");
      await loadStudents();
    } catch (deleteError) {
      setStatus(deleteError.message);
    }
  }

  return (
    <div className="space-y-6">
      {status ? <p className="rounded bg-slate-100 px-3 py-2 text-sm text-slate-700">{status}</p> : null}

      <section className="rounded-xl border border-slate-100 p-4">
        <h3 className="mb-4 text-lg font-semibold text-slate-800">
          {form.id ? "Edit student" : "Add student"}
        </h3>
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
          <div>
            <label
              htmlFor="student-unique-id"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Student Unique ID
            </label>
            <input
              id="student-unique-id"
              value={form.studentUniqueId || "Generating..."}
              readOnly
              className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-slate-700 outline-none"
            />
          </div>
          <div>
            <label htmlFor="student-name" className="mb-1 block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              id="student-name"
              required
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 ring-purple-300 outline-none focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="student-email" className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="student-email"
              type="email"
              required
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 ring-purple-300 outline-none focus:ring-2"
            />
          </div>
          <div>
            <label
              htmlFor="student-department"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Department
            </label>
            <input
              id="student-department"
              required
              value={form.department}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, department: event.target.value }))
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 ring-purple-300 outline-none focus:ring-2"
            />
          </div>
          <div>
            <label
              htmlFor="student-semester"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Semester
            </label>
            <input
              id="student-semester"
              type="number"
              min="1"
              max="8"
              required
              value={form.semester}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, semester: event.target.value }))
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 ring-purple-300 outline-none focus:ring-2"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-purple-300"
            >
              {loading ? "Saving..." : form.id ? "Update student" : "Create student"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-slate-100 p-4">
        <h3 className="mb-4 text-lg font-semibold text-slate-800">Student records</h3>
        <div className="space-y-2">
          {students.map((student) => (
            <article
              key={student._id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
            >
              <p className="text-sm text-slate-700">
                <span className="font-medium">{student.name}</span> · ID:{" "}
                <span className="font-medium">{student.studentUniqueId || "N/A"}</span> ·{" "}
                {student.email} ·{" "}
                {student.department} · Sem {student.semester}
              </p>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      id: student._id,
                      studentUniqueId: student.studentUniqueId || "",
                      name: student.name,
                      email: student.email,
                      department: student.department,
                      semester: student.semester,
                    })
                  }
                  className="cursor-pointer rounded bg-amber-500 px-3 py-1 text-xs font-medium text-white transition-colors duration-200 hover:bg-amber-600"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(student._id)}
                  className="cursor-pointer rounded bg-rose-600 px-3 py-1 text-xs font-medium text-white transition-colors duration-200 hover:bg-rose-700"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default StudentsPage;
