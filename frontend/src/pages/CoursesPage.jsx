import { useEffect, useState } from "react";
import { apiRequest } from "../api";

const initialForm = { id: "", code: "", title: "", department: "", credits: 1 };

function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadCourses() {
    const data = await apiRequest("/courses");
    setCourses(data);
  }

  useEffect(() => {
    let ignore = false;

    async function bootstrap() {
      try {
        const data = await apiRequest("/courses");
        if (!ignore) {
          setCourses(data);
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
        code: form.code,
        title: form.title,
        department: form.department,
        credits: Number(form.credits),
      };
      if (form.id) {
        await apiRequest(`/courses/${form.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setStatus("Course updated successfully.");
      } else {
        await apiRequest("/courses", { method: "POST", body: JSON.stringify(payload) });
        setStatus("Course created successfully.");
      }
      setForm(initialForm);
      await loadCourses();
    } catch (submitError) {
      setStatus(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await apiRequest(`/courses/${id}`, { method: "DELETE" });
      setStatus("Course deleted successfully.");
      await loadCourses();
    } catch (deleteError) {
      setStatus(deleteError.message);
    }
  }

  return (
    <div className="space-y-6">
      {status ? <p className="rounded bg-slate-100 px-3 py-2 text-sm text-slate-700">{status}</p> : null}

      <section className="rounded-xl border border-slate-100 p-4">
        <h3 className="mb-4 text-lg font-semibold text-slate-800">
          {form.id ? "Edit course" : "Add course"}
        </h3>
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
          <div>
            <label htmlFor="course-code" className="mb-1 block text-sm font-medium text-slate-700">
              Course code
            </label>
            <input
              id="course-code"
              required
              value={form.code}
              onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 ring-purple-300 outline-none focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="course-title" className="mb-1 block text-sm font-medium text-slate-700">
              Title
            </label>
            <input
              id="course-title"
              required
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 ring-purple-300 outline-none focus:ring-2"
            />
          </div>
          <div>
            <label
              htmlFor="course-department"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Department
            </label>
            <input
              id="course-department"
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
              htmlFor="course-credits"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Credits
            </label>
            <input
              id="course-credits"
              type="number"
              min="1"
              max="10"
              required
              value={form.credits}
              onChange={(event) => setForm((prev) => ({ ...prev, credits: event.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 ring-purple-300 outline-none focus:ring-2"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-purple-300"
            >
              {loading ? "Saving..." : form.id ? "Update course" : "Create course"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-slate-100 p-4">
        <h3 className="mb-4 text-lg font-semibold text-slate-800">Course catalog</h3>
        <div className="space-y-2">
          {courses.map((course) => (
            <article
              key={course._id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
            >
              <p className="text-sm text-slate-700">
                <span className="font-medium">{course.code}</span> · {course.title} ·{" "}
                {course.department} · {course.credits} credits
              </p>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      id: course._id,
                      code: course.code,
                      title: course.title,
                      department: course.department,
                      credits: course.credits,
                    })
                  }
                  className="cursor-pointer rounded bg-amber-500 px-3 py-1 text-xs font-medium text-white transition-colors duration-200 hover:bg-amber-600"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(course._id)}
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

export default CoursesPage;
