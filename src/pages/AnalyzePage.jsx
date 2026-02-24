import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { buildAnalysis } from "../lib/analysis";
import { saveAnalysisEntry } from "../lib/history";
import { computeFinalScore, createDefaultSkillConfidenceMap } from "../lib/schema";

export default function AnalyzePage() {
  const navigate = useNavigate();
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jdText, setJdText] = useState("");
  const [showRequiredError, setShowRequiredError] = useState(false);

  const jdLength = jdText.trim().length;
  const isShortJd = jdLength > 0 && jdLength < 200;

  const helperMessage = useMemo(() => {
    if (showRequiredError && jdLength === 0) {
      return {
        text: "JD text is required.",
        tone: "error",
      };
    }

    if (isShortJd) {
      return {
        text: "This JD is too short to analyze deeply. Paste full JD for better output.",
        tone: "warning",
      };
    }

    return null;
  }, [showRequiredError, jdLength, isShortJd]);

  const handleAnalyze = () => {
    const normalizedJd = jdText.trim();
    if (!normalizedJd) {
      setShowRequiredError(true);
      return;
    }

    setShowRequiredError(false);

    const normalizedCompany = company.trim();
    const normalizedRole = role.trim();
    const analysis = buildAnalysis({ company: normalizedCompany, role: normalizedRole, jdText: normalizedJd });

    const createdAt = new Date().toISOString();
    const skillConfidenceMap = createDefaultSkillConfidenceMap(analysis.extractedSkills);
    const finalScore = computeFinalScore(analysis.baseScore, skillConfidenceMap);

    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt,
      company: normalizedCompany,
      role: normalizedRole,
      jdText: normalizedJd,
      extractedSkills: analysis.extractedSkills,
      roundMapping: analysis.roundMapping,
      checklist: analysis.checklist,
      plan7Days: analysis.plan7Days,
      questions: analysis.questions,
      baseScore: analysis.baseScore,
      skillConfidenceMap,
      finalScore,
      updatedAt: createdAt,
      companyIntel: analysis.companyIntel,
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
              <span className="text-sm font-medium text-slate-700">Company (Optional)</span>
              <input
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder="e.g. Infosys"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Role (Optional)</span>
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
              required
              value={jdText}
              onChange={(event) => setJdText(event.target.value)}
              placeholder="Paste full JD text here"
              rows={12}
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2 ${
                showRequiredError && jdLength === 0
                  ? "border-rose-400 bg-rose-50"
                  : isShortJd
                    ? "border-amber-300 bg-amber-50"
                    : "border-slate-300"
              }`}
            />
          </label>

          {helperMessage ? (
            <p
              className={`text-sm ${
                helperMessage.tone === "error" ? "text-rose-600" : "text-amber-700"
              }`}
            >
              {helperMessage.text}
            </p>
          ) : null}

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
