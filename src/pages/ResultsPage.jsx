import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  getAnalysisById,
  getLatestAnalysis,
  getSelectedAnalysisId,
  updateAnalysisEntry,
} from "../lib/history";

const KNOW = "know";
const PRACTICE = "practice";

function getEntryFromLocation(location) {
  const params = new URLSearchParams(location.search);
  const queryId = params.get("id") || "";
  const selectedId = queryId || getSelectedAnalysisId();
  return getAnalysisById(selectedId) || getLatestAnalysis();
}

function flattenSkills(extractedSkills) {
  return Object.values(extractedSkills || {}).flat();
}

function buildSkillConfidenceMap(entry) {
  const existing = entry.skillConfidenceMap || {};
  const skills = flattenSkills(entry.extractedSkills);
  const map = {};

  skills.forEach((skill) => {
    const value = existing[skill];
    map[skill] = value === KNOW ? KNOW : PRACTICE;
  });

  return map;
}

function clampScore(value) {
  return Math.max(0, Math.min(100, value));
}

function calculateLiveScore(baseScore, confidenceMap) {
  const delta = Object.values(confidenceMap).reduce((acc, value) => {
    if (value === KNOW) {
      return acc + 2;
    }

    return acc - 2;
  }, 0);

  return clampScore(baseScore + delta);
}

function copyText(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
  return Promise.resolve();
}

function toPlanText(plan) {
  return (plan || [])
    .map((day) => {
      const tasks = (day.tasks || []).map((task) => `- ${task}`).join("\n");
      return `${day.day}: ${day.focus}\n${tasks}`;
    })
    .join("\n\n");
}

function toChecklistText(checklist) {
  return Object.entries(checklist || {})
    .map(([round, items]) => `${round}\n${(items || []).map((item) => `- ${item}`).join("\n")}`)
    .join("\n\n");
}

function toQuestionsText(questions) {
  return (questions || []).map((question, index) => `${index + 1}. ${question}`).join("\n");
}

function toSkillsText(extractedSkills, confidenceMap) {
  return Object.entries(extractedSkills || {})
    .map(
      ([category, skills]) =>
        `${category}:\n${skills.map((skill) => `- ${skill} (${confidenceMap[skill] === KNOW ? "I know this" : "Need practice"})`).join("\n")}`
    )
    .join("\n\n");
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ResultsPage() {
  const location = useLocation();
  const [entry, setEntry] = useState(() => getEntryFromLocation(location));
  const [exportStatus, setExportStatus] = useState("");

  useEffect(() => {
    setEntry(getEntryFromLocation(location));
  }, [location.search]);

  const skillConfidenceMap = useMemo(() => {
    if (!entry) {
      return {};
    }

    return buildSkillConfidenceMap(entry);
  }, [entry]);

  const baseReadinessScore = entry?.baseReadinessScore ?? entry?.readinessScore ?? 0;
  const liveReadinessScore = useMemo(
    () => calculateLiveScore(baseReadinessScore, skillConfidenceMap),
    [baseReadinessScore, skillConfidenceMap]
  );

  const skillGroups = useMemo(() => Object.entries(entry?.extractedSkills || {}), [entry]);
  const checklistRounds = useMemo(() => Object.entries(entry?.checklist || {}), [entry]);
  const weakSkills = useMemo(
    () => Object.entries(skillConfidenceMap).filter(([, value]) => value === PRACTICE).map(([skill]) => skill),
    [skillConfidenceMap]
  );

  const persistEntry = (nextConfidenceMap) => {
    if (!entry) {
      return;
    }

    const nextScore = calculateLiveScore(baseReadinessScore, nextConfidenceMap);
    const updated = updateAnalysisEntry(entry.id, {
      ...entry,
      baseReadinessScore,
      readinessScore: nextScore,
      skillConfidenceMap: nextConfidenceMap,
    });

    if (updated) {
      setEntry(updated);
    }
  };

  const handleConfidenceChange = (skill, value) => {
    if (!entry) {
      return;
    }

    const nextConfidenceMap = {
      ...skillConfidenceMap,
      [skill]: value,
    };

    persistEntry(nextConfidenceMap);
  };

  const handleCopy = async (text, message) => {
    await copyText(text);
    setExportStatus(message);
  };

  const handleDownloadTxt = () => {
    if (!entry) {
      return;
    }

    const content = [
      `Placement Readiness Analysis`,
      `Company: ${entry.company}`,
      `Role: ${entry.role}`,
      `Generated On: ${new Date(entry.createdAt).toLocaleString()}`,
      `Readiness Score: ${liveReadinessScore}/100`,
      "",
      "Key Skills Extracted",
      toSkillsText(entry.extractedSkills, skillConfidenceMap),
      "",
      "Round-wise Preparation Checklist",
      toChecklistText(entry.checklist),
      "",
      "7-Day Plan",
      toPlanText(entry.plan),
      "",
      "10 Likely Interview Questions",
      toQuestionsText(entry.questions),
    ].join("\n");

    const safeCompany = (entry.company || "company").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    downloadTextFile(`analysis-${safeCompany}-${entry.id}.txt`, content);
    setExportStatus("Downloaded TXT file.");
  };

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
            <p className="mt-1 text-2xl font-bold text-indigo-700">{liveReadinessScore}/100</p>
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
              <div className="flex flex-wrap gap-3">
                {(tags || []).map((skill) => {
                  const selected = skillConfidenceMap[skill] || PRACTICE;
                  return (
                    <div key={`${category}-${skill}`} className="rounded-xl border border-indigo-200 bg-indigo-50 p-2">
                      <p className="text-xs font-semibold text-indigo-700">{skill}</p>
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleConfidenceChange(skill, KNOW)}
                          className={`rounded-md px-2 py-1 text-xs font-medium ${
                            selected === KNOW
                              ? "bg-emerald-500 text-white"
                              : "bg-white text-slate-600 ring-1 ring-slate-300"
                          }`}
                        >
                          I know this
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfidenceChange(skill, PRACTICE)}
                          className={`rounded-md px-2 py-1 text-xs font-medium ${
                            selected === PRACTICE
                              ? "bg-amber-500 text-white"
                              : "bg-white text-slate-600 ring-1 ring-slate-300"
                          }`}
                        >
                          Need practice
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export Tools</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleCopy(toPlanText(entry.plan), "Copied 7-day plan.")}
              className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300"
            >
              Copy 7-day plan
            </button>
            <button
              type="button"
              onClick={() => handleCopy(toChecklistText(entry.checklist), "Copied round checklist.")}
              className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300"
            >
              Copy round checklist
            </button>
            <button
              type="button"
              onClick={() => handleCopy(toQuestionsText(entry.questions), "Copied 10 questions.")}
              className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300"
            >
              Copy 10 questions
            </button>
            <button
              type="button"
              onClick={handleDownloadTxt}
              className="rounded-lg bg-[hsl(245,58%,51%)] px-3 py-2 text-sm font-semibold text-white"
            >
              Download as TXT
            </button>
          </div>
          {exportStatus ? <p className="text-xs text-emerald-600">{exportStatus}</p> : null}
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
                  {(items || []).map((item) => (
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

      <Card>
        <CardHeader>
          <CardTitle>Action Next</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-slate-700">Top 3 weak skills</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {weakSkills.slice(0, 3).map((skill) => (
                <span key={skill} className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                  {skill}
                </span>
              ))}
              {!weakSkills.length ? (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                  No weak skills flagged
                </span>
              ) : null}
            </div>
          </div>
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
            <p className="text-sm font-medium text-indigo-700">Start Day 1 plan now.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
