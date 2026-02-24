import { NavLink, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Code2,
  LayoutDashboard,
  UserCircle2,
  Video,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/practice", label: "Practice", icon: Code2 },
  { to: "/dashboard/assessments", label: "Assessments", icon: ClipboardCheck },
  { to: "/dashboard/resources", label: "Resources", icon: BookOpen },
  { to: "/dashboard/profile", label: "Profile", icon: UserCircle2 },
];

function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Practice Problems",
      description: "Sharpen your coding and aptitude skills with curated sets.",
      icon: Code2,
    },
    {
      title: "Mock Interviews",
      description: "Simulate real interview rounds and improve communication.",
      icon: Video,
    },
    {
      title: "Track Progress",
      description: "Monitor growth through clear metrics and performance trends.",
      icon: BarChart3,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white text-slate-900">
      <main className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <section className="rounded-3xl bg-white p-10 text-center shadow-lg shadow-indigo-100/70 ring-1 ring-indigo-100 md:p-16">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Ace Your Placement
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Practice, assess, and prepare for your dream job
          </p>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mt-8 rounded-xl bg-[hsl(245,58%,51%)] px-6 py-3 font-semibold text-white shadow-md shadow-indigo-300 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(245,58%,51%)] focus-visible:ring-offset-2"
          >
            Get Started
          </button>
        </section>

        <section className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map(({ title, description, icon: Icon }) => (
            <article
              key={title}
              className="rounded-2xl bg-white p-6 shadow-md shadow-indigo-100 ring-1 ring-indigo-100"
            >
              <Icon className="h-8 w-8 text-[hsl(245,58%,51%)]" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{description}</p>
            </article>
          ))}
        </section>
      </main>

      <footer className="border-t border-indigo-100 py-6 text-center text-sm text-slate-500">
        Copyright (c) {new Date().getFullYear()} Placement Readiness Platform
      </footer>
    </div>
  );
}

function DashboardShell() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="w-64 border-r border-slate-200 bg-white p-4">
          <div className="mb-6 rounded-xl bg-[hsl(245,58%,51%)]/10 px-3 py-2 text-sm font-semibold text-[hsl(245,58%,51%)]">
            Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={label}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-[hsl(245,58%,51%)] text-white"
                      : "text-slate-600 hover:bg-indigo-50 hover:text-[hsl(245,58%,51%)]"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 md:px-8">
            <h1 className="text-xl font-bold text-[hsl(245,58%,51%)]">Placement Prep</h1>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(245,58%,51%)]/15">
              <UserCircle2 className="h-6 w-6 text-[hsl(245,58%,51%)]" />
            </div>
          </header>
          <main className="flex-1 p-5 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

function PagePlaceholder({ title }) {
  return (
    <section className="rounded-2xl border border-indigo-100 bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-3 text-slate-600">
        This is the {title.toLowerCase()} page. Content can be added here.
      </p>
    </section>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<DashboardShell />}>
        <Route index element={<PagePlaceholder title="Dashboard" />} />
        <Route path="practice" element={<PagePlaceholder title="Practice" />} />
        <Route path="assessments" element={<PagePlaceholder title="Assessments" />} />
        <Route path="resources" element={<PagePlaceholder title="Resources" />} />
        <Route path="profile" element={<PagePlaceholder title="Profile" />} />
      </Route>
    </Routes>
  );
}
