import { Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { getAnalysisById, getLatestAnalysis, getSelectedAnalysisId } from "../lib/history";

function useResultEntry() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const queryId = params.get("id") || "";
  const selectedId = queryId || getSelectedAnalysisId();

  return getAnalysisById(selectedId) || getLatestAnalysis();
}

function Tag({ children }) {
  return (
    <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
      {children}
    </span>
  );
}

export default function ResultsPage() {
  const entry = useResultEntry();

  if (!entry) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No analysis found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">Run an analysis first to view results.</p>
          <Link to="/dashboard/practice" className="mt-3 inline-block text-sm font-medium text-indigo-600">
            Go to Analyzer
          </Link>
        </CardContent>
      </Card>
    );
  }

  const skillGroups = Object.entries(entry.extractedSkills || {});
  const checklistRounds = Object.entries(entry.checklist || {});

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analysis Result</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-indigo-50 p-4">
            <p className="text-xs uppercase text-slate-500">Company</p>
            <p className="mt-1 font-semibold text-slate-900">{entry.company}</p>
          </div>
          <div className="rounded-lg bg-indigo-50 p-4">
            <p className="text-xs uppercase text-slate-500">Role</p>
            <p className="mt-1 font-semibold text-slate-900">{entry.role}</p>
          </div>
          <div className="rounded-lg bg-indigo-50 p-4">
            <p className="text-xs uppercase text-slate-500">Readiness Score</p>
            <p className="mt-1 text-2xl font-bold text-indigo-700">{entry.readinessScore}/100</p>
          </div>
          <div className="rounded-lg bg-indigo-50 p-4">
            <p className="text-xs uppercase text-slate-500">Generated On</p>
            <p className="mt-1 font-semibold text-slate-900">
              {new Date(entry.createdAt).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Skills Extracted</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {skillGroups.map(([category, tags]) => (
            <div key={category}>
              <p className="mb-2 text-sm font-semibold text-slate-700">{category}</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Tag key={`${category}-${tag}`}>{tag}</Tag>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Round-wise Preparation Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {checklistRounds.map(([round, items]) => (
              <div key={round}>
                <p className="text-sm font-semibold text-slate-700">{round}</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
                  {items.map((item) => (
                    <li key={`${round}-${item}`}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7-Day Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            {(entry.plan || []).map((dayItem) => (
              <div key={dayItem.day} className="rounded-lg border border-slate-200 p-3">
                <p className="font-semibold text-slate-800">
                  {dayItem.day}: {dayItem.focus}
                </p>
                <ul className="mt-1 list-inside list-disc space-y-1">
                  {(dayItem.tasks || []).map((task) => (
                    <li key={`${dayItem.day}-${task}`}>{task}</li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>10 Likely Interview Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-inside list-decimal space-y-2 text-sm text-slate-700">
            {(entry.questions || []).map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
