import { useEffect, useMemo, useState } from "react";
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
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import AnalyzePage from "./pages/AnalyzePage";
import HistoryPage from "./pages/HistoryPage";
import ResultsPage from "./pages/ResultsPage";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/practice", label: "Practice", icon: Code2 },
  { to: "/dashboard/assessments", label: "Assessments", icon: ClipboardCheck },
  { to: "/dashboard/resources", label: "Resources", icon: BookOpen },
  { to: "/dashboard/profile", label: "Profile", icon: UserCircle2 },
];

const skillData = [
  { subject: "DSA", value: 75 },
  { subject: "System Design", value: 60 },
  { subject: "Communication", value: 80 },
  { subject: "Resume", value: 85 },
  { subject: "Aptitude", value: 70 },
];

const upcomingAssessments = [
  { title: "DSA Mock Test", dateTime: "Tomorrow, 10:00 AM" },
  { title: "System Design Review", dateTime: "Wed, 2:00 PM" },
  { title: "HR Interview Prep", dateTime: "Friday, 11:00 AM" },
];

const weeklyActivity = [
  { day: "Mon", active: true },
  { day: "Tue", active: true },
  { day: "Wed", active: false },
  { day: "Thu", active: true },
  { day: "Fri", active: true },
  { day: "Sat", active: true },
  { day: "Sun", active: false },
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

function ReadinessCard() {
  const score = 72;
  const size = 220;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const dashOffset = useMemo(
    () => circumference - (animatedScore / 100) * circumference,
    [animatedScore, circumference]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overall Readiness</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center pb-6">
        <div className="relative h-[220px] w-[220px]">
          <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgb(226 232 240)"
              strokeWidth={stroke}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="hsl(245,58%,51%)"
              strokeLinecap="round"
              strokeWidth={stroke}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 1.2s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-4xl font-bold text-slate-900">{score}/100</p>
            <p className="mt-1 text-sm text-slate-500">Readiness Score</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SkillBreakdownCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Skill Breakdown</CardTitle>
        <CardDescription>Current performance across key interview dimensions.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={skillData} outerRadius="70%">
              <PolarGrid stroke="rgb(203 213 225)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "rgb(71 85 105)", fontSize: 12 }} />
              <Radar
                dataKey="value"
                stroke="hsl(245,58%,51%)"
                fill="hsl(245,58%,51%)"
                fillOpacity={0.28}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function ContinuePracticeCard() {
  const completed = 3;
  const total = 10;
  const progress = (completed / total) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Continue Practice</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pb-6">
        <div>
          <p className="text-sm text-slate-500">Last topic</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">Dynamic Programming</h3>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
            <span>Progress</span>
            <span>
              {completed}/{total} completed
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-200">
            <div
              className="h-2.5 rounded-full bg-[hsl(245,58%,51%)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          className="rounded-lg bg-[hsl(245,58%,51%)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(245,58%,51%)] focus-visible:ring-offset-2"
        >
          Continue
        </button>
      </CardContent>
    </Card>
  );
}

function WeeklyGoalsCard() {
  const solved = 12;
  const target = 20;
  const progress = (solved / target) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Goals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pb-6">
        <div>
          <p className="text-sm font-medium text-slate-700">Problems Solved: 12/20 this week</p>
          <div className="mt-2 h-2.5 w-full rounded-full bg-slate-200">
            <div
              className="h-2.5 rounded-full bg-emerald-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          {weeklyActivity.map(({ day, active }) => (
            <div key={day} className="flex flex-col items-center gap-1">
              <div
                className={`h-8 w-8 rounded-full border ${
                  active ? "border-emerald-600 bg-emerald-500" : "border-slate-300 bg-slate-100"
                }`}
              />
              <span className="text-xs text-slate-500">{day}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function UpcomingAssessmentsCard() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Upcoming Assessments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pb-6">
        {upcomingAssessments.map((assessment) => (
          <div
            key={assessment.title}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
          >
            <p className="font-medium text-slate-900">{assessment.title}</p>
            <p className="text-sm text-slate-600">{assessment.dateTime}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function DashboardHome() {
  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ReadinessCard />
      <SkillBreakdownCard />
      <ContinuePracticeCard />
      <WeeklyGoalsCard />
      <UpcomingAssessmentsCard />
    </section>
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
        <Route index element={<DashboardHome />} />
        <Route path="practice" element={<AnalyzePage />} />
        <Route path="assessments" element={<HistoryPage />} />
        <Route path="resources" element={<PagePlaceholder title="Resources" />} />
        <Route path="profile" element={<PagePlaceholder title="Profile" />} />
      </Route>
      <Route path="/results" element={<DashboardShell />}>
        <Route index element={<ResultsPage />} />
      </Route>
      <Route path="/history" element={<DashboardShell />}>
        <Route index element={<HistoryPage />} />
      </Route>
    </Routes>
  );
}
