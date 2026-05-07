import { useEffect, useState } from "react";
import { getApiBaseUrl, apiRequest } from "../api";

function DashboardPage() {
  const [counts, setCounts] = useState({ students: 0, courses: 0, enrollments: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [students, courses, enrollments] = await Promise.all([
          apiRequest("/students"),
          apiRequest("/courses"),
          apiRequest("/enrollments"),
        ]);
        setCounts({
          students: students.length,
          courses: courses.length,
          enrollments: enrollments.length,
        });
      } catch (loadError) {
        setError(loadError.message);
      }
    }

    load();
  }, []);

  const cards = [
    { label: "Total Students", value: counts.students },
    { label: "Total Courses", value: counts.courses },
    { label: "Total Enrollments", value: counts.enrollments },
  ];

  return (
    <div className="space-y-6">
      {error ? <p className="rounded bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-purple-100 bg-purple-50 p-4 transition-colors duration-200 hover:border-purple-300"
          >
            <p className="text-sm text-purple-700">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold text-purple-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
        <h3 className="text-lg font-semibold text-slate-800">System flow</h3>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-700">
          <li>Create user account and login.</li>
          <li>Add students and courses.</li>
          <li>Create enrollments by mapping students to courses by semester.</li>
          <li>Use Students, Courses, and Enrollments pages to manage records.</li>
        </ol>
        <p className="mt-4 text-xs text-slate-500">API endpoint: {getApiBaseUrl()}</p>
      </div>
    </div>
  );
}

export default DashboardPage;
