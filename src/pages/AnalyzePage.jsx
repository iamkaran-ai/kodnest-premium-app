import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { buildAnalysis } from "../lib/analysis";
import { saveAnalysisEntry } from "../lib/history";

export default function AnalyzePage() {
  const navigate = useNavigate();
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jdText, setJdText] = useState("");

  const handleAnalyze = () => {
    const analysis = buildAnalysis({ company, role, jdText });
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      company: company.trim() || "Not specified",
      role: role.trim() || "Not specified",
      jdText,
      extractedSkills: analysis.extractedSkills,
      plan: analysis.plan,
      checklist: analysis.checklist,
      questions: analysis.questions,
      readinessScore: analysis.readinessScore,
    };

    saveAnalysisEntry(entry);
    navigate(`/results?id=${entry.id}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>JD Analyzer</CardTitle>
          <CardDescription>
            Paste job description and generate targeted readiness analysis offline.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Company</span>
              <input
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder="e.g. Infosys"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Role</span>
              <input
                value={role}
                onChange={(event) => setRole(event.target.value)}
                placeholder="e.g. Software Engineer"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
              />
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Job Description</span>
            <textarea
              value={jdText}
              onChange={(event) => setJdText(event.target.value)}
              placeholder="Paste full JD text here"
              rows={12}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
            />
          </label>

          <button
            type="button"
            onClick={handleAnalyze}
            className="rounded-lg bg-[hsl(245,58%,51%)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Analyze JD
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
