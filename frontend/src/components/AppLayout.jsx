import { Link, useLocation, useNavigate } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/students", label: "Students" },
  { to: "/courses", label: "Courses" },
  { to: "/enrollments", label: "Enrollments" },
];

function AppLayout({ title, children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = localStorage.getItem("cms-user-email");

  function logout() {
    localStorage.removeItem("cms-user-email");
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-orange-50">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-4 p-4 md:grid-cols-[260px_1fr] md:p-6">
        <aside className="rounded-2xl bg-white p-4 shadow-sm md:p-5">
          <h1 className="text-lg font-bold text-purple-900">CLG Management</h1>
          <p className="mt-1 text-xs text-slate-500">{currentUser}</p>
          <nav className="mt-6 space-y-2">
            {links.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    active
                      ? "bg-purple-600 text-white"
                      : "text-slate-700 hover:bg-purple-100 hover:text-purple-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={logout}
            className="mt-6 w-full cursor-pointer rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-orange-600"
          >
            Logout
          </button>
        </aside>

        <main className="rounded-2xl bg-white p-4 shadow-sm md:p-6">
          <header className="mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-semibold text-purple-900">{title}</h2>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
