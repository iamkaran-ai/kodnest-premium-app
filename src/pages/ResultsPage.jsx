import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { buildCompanyIntel, buildRoundMapping } from "../lib/analysis";
import {
  getAnalysisById,
  getLatestAnalysis,
  getSelectedAnalysisId,
  updateAnalysisEntry,
} from "../lib/history";
import {
  computeFinalScore,
  flattenExtractedSkills,
  normalizeSkillConfidenceMap,
} from "../lib/schema";

const KNOW = "know";
const PRACTICE = "practice";

const CATEGORY_LABELS = {
  coreCS: "Core CS",
  languages: "Languages",
  web: "Web",
  data: "Data",
  cloud: "Cloud/DevOps",
  testing: "Testing",
  other: "Other",
};

function getEntryFromLocation(location) {
  const params = new URLSearchParams(location.search);
  const queryId = params.get("id") || "";
  const selectedId = queryId || getSelectedAnalysisId();
  return getAnalysisById(selectedId) || getLatestAnalysis();
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

function toPlanText(plan7Days) {
  return (plan7Days || [])
    .map((day) => {
      const tasks = (day.tasks || []).map((task) => `- ${task}`).join("\n");
      return `${day.day}: ${day.focus}\n${tasks}`;
    })
    .join("\n\n");
}

function toChecklistText(checklist) {
  return (checklist || [])
    .map((round) => `${round.roundTitle}\n${(round.items || []).map((item) => `- ${item}`).join("\n")}`)
    .join("\n\n");
}

function toQuestionsText(questions) {
  return (questions || []).map((question, index) => `${index + 1}. ${question}`).join("\n");
}

function toSkillsText(extractedSkills, confidenceMap) {
  return Object.entries(CATEGORY_LABELS)
    .map(([key, label]) => {
      const skills = extractedSkills?.[key] || [];
      if (!skills.length) {
        return null;
      }

      const list = skills
        .map((skill) => `- ${skill} (${confidenceMap[skill] === KNOW ? "I know this" : "Need practice"})`)
        .join("\n");

      return `${label}:\n${list}`;
    })
    .filter(Boolean)
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

function getCompanyValue(company) {
  return company || "";
}

function getDerivedIntelAndMapping(entry) {
  const company = getCompanyValue(entry.company);
  const companyIntel = entry.companyIntel || buildCompanyIntel({ company, role: entry.role, jdText: entry.jdText });
  const roundMapping =
    entry.roundMapping && entry.roundMapping.length
      ? entry.roundMapping
      : buildRoundMapping({ companyIntel, extractedSkills: entry.extractedSkills });

  return {
    companyIntel,
    roundMapping,
  };
}

export default function ResultsPage() {
  const location = useLocation();
  const [entry, setEntry] = useState(() => getEntryFromLocation(location));
  const [exportStatus, setExportStatus] = useState("");

  useEffect(() => {
    setEntry(getEntryFromLocation(location));
  }, [location.search]);

  useEffect(() => {
    if (!entry) {
      return;
    }

    const { companyIntel, roundMapping } = getDerivedIntelAndMapping(entry);
    const needsPersist = !Object.prototype.hasOwnProperty.call(entry, "companyIntel") || !entry.roundMapping?.length;

    if (!needsPersist) {
      return;
    }

    const updated = updateAnalysisEntry(entry.id, {
      ...entry,
      companyIntel,
      roundMapping,
    });

    if (updated) {
      setEntry(updated);
    }
  }, [entry]);

  const { companyIntel, roundMapping } = useMemo(() => {
    if (!entry) {
      return { companyIntel: null, roundMapping: [] };
    }

    return getDerivedIntelAndMapping(entry);
  }, [entry]);

  const skillConfidenceMap = useMemo(() => {
    if (!entry) {
      return {};
    }

    return normalizeSkillConfidenceMap(entry.skillConfidenceMap, entry.extractedSkills);
  }, [entry]);

  const liveFinalScore = useMemo(() => {
    if (!entry) {
      return 0;
    }

    return computeFinalScore(entry.baseScore, skillConfidenceMap);
  }, [entry, skillConfidenceMap]);

  const skillGroups = useMemo(() => {
    if (!entry) {
      return [];
    }

    return Object.entries(CATEGORY_LABELS)
      .map(([key, label]) => ({ key, label, skills: entry.extractedSkills?.[key] || [] }))
      .filter((group) => group.skills.length > 0);
  }, [entry]);

  const weakSkills = useMemo(() => {
    return flattenExtractedSkills(entry?.extractedSkills || {}).filter(
      (skill) => skillConfidenceMap[skill] === PRACTICE
    );
  }, [entry, skillConfidenceMap]);

  const persistEntry = (nextConfidenceMap) => {
    if (!entry) {
      return;
    }

    const nextScore = computeFinalScore(entry.baseScore, nextConfidenceMap);
    const updated = updateAnalysisEntry(entry.id, {
      ...entry,
      skillConfidenceMap: nextConfidenceMap,
      finalScore: nextScore,
      updatedAt: new Date().toISOString(),
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
      "Placement Readiness Analysis",
      `Company: ${entry.company || ""}`,
      `Role: ${entry.role || ""}`,
      `Generated On: ${new Date(entry.createdAt).toLocaleString()}`,
      `Last Updated: ${new Date(entry.updatedAt).toLocaleString()}`,
      `Base Score: ${entry.baseScore}/100`,
      `Final Score: ${liveFinalScore}/100`,
      "",
      "Key Skills Extracted",
      toSkillsText(entry.extractedSkills, skillConfidenceMap),
      "",
      "Round Mapping",
      (roundMapping || [])
        .map(
          (round) =>
            `${round.roundTitle}\nFocus: ${(round.focusAreas || []).join(", ")}\nWhy this round matters: ${round.whyItMatters}`
        )
        .join("\n\n"),
      "",
      "Round-wise Preparation Checklist",
      toChecklistText(entry.checklist),
      "",
      "7-Day Plan",
      toPlanText(entry.plan7Days),
      "",
      "10 Likely Interview Questions",
      toQuestionsText(entry.questions),
      "",
      "Company Intel",
      companyIntel
        ? [
            `Company: ${companyIntel.companyName}`,
            `Industry: ${companyIntel.industry}`,
            `Estimated Size: ${companyIntel.sizeCategory}`,
            `Typical Hiring Focus: ${companyIntel.hiringFocus}`,
            companyIntel.note,
          ].join("\n")
        : "Not available",
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
        <CardContent className="grid gap-4 md:grid-cols-5">
          <div className="rounded-lg bg-indigo-50 p-4">
            <p className="text-xs uppercase text-slate-500">Company</p>
            <p className="mt-1 font-semibold text-slate-900">{entry.company || "-"}</p>
          </div>
          <div className="rounded-lg bg-indigo-50 p-4">
            <p className="text-xs uppercase text-slate-500">Role</p>
            <p className="mt-1 font-semibold text-slate-900">{entry.role || "-"}</p>
          </div>
          <div className="rounded-lg bg-indigo-50 p-4">
            <p className="text-xs uppercase text-slate-500">Base Score</p>
            <p className="mt-1 text-xl font-bold text-slate-700">{entry.baseScore}/100</p>
          </div>
          <div className="rounded-lg bg-indigo-50 p-4">
            <p className="text-xs uppercase text-slate-500">Final Score</p>
            <p className="mt-1 text-2xl font-bold text-indigo-700">{liveFinalScore}/100</p>
          </div>
          <div className="rounded-lg bg-indigo-50 p-4">
            <p className="text-xs uppercase text-slate-500">Updated</p>
            <p className="mt-1 font-semibold text-slate-900">{new Date(entry.updatedAt).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Skills Extracted</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {skillGroups.map((group) => (
            <div key={group.key}>
              <p className="mb-2 text-sm font-semibold text-slate-700">{group.label}</p>
              <div className="flex flex-wrap gap-3">
                {group.skills.map((skill) => {
                  const selected = skillConfidenceMap[skill] || PRACTICE;
                  return (
                    <div key={`${group.key}-${skill}`} className="rounded-xl border border-indigo-200 bg-indigo-50 p-2">
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

      {companyIntel ? (
        <Card>
          <CardHeader>
            <CardTitle>Company Intel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg bg-indigo-50 p-3">
                <p className="text-xs uppercase text-slate-500">Company</p>
                <p className="mt-1 font-semibold text-slate-900">{companyIntel.companyName}</p>
              </div>
              <div className="rounded-lg bg-indigo-50 p-3">
                <p className="text-xs uppercase text-slate-500">Industry</p>
                <p className="mt-1 font-semibold text-slate-900">{companyIntel.industry}</p>
              </div>
              <div className="rounded-lg bg-indigo-50 p-3">
                <p className="text-xs uppercase text-slate-500">Estimated Size</p>
                <p className="mt-1 font-semibold text-slate-900">{companyIntel.sizeCategory}</p>
              </div>
            </div>
            <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
              <p className="text-sm font-semibold text-indigo-700">Typical Hiring Focus</p>
              <p className="mt-1 text-sm text-slate-700">{companyIntel.hiringFocus}</p>
            </div>
            <p className="text-xs text-slate-500">{companyIntel.note}</p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Round Mapping</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(roundMapping || []).map((round, index) => (
              <div key={`${round.roundTitle}-${index}`} className="relative pl-8">
                <span className="absolute left-2 top-2 h-3 w-3 rounded-full bg-indigo-600" />
                {index !== (roundMapping || []).length - 1 ? (
                  <span className="absolute left-[11px] top-5 h-[calc(100%-8px)] w-px bg-indigo-200" />
                ) : null}
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-900">{round.roundTitle}</p>
                  <p className="mt-1 text-sm text-slate-700">Focus: {(round.focusAreas || []).join(", ")}</p>
                  <p className="mt-2 text-xs text-slate-500">Why this round matters: {round.whyItMatters}</p>
                </div>
              </div>
            ))}
          </div>
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
              onClick={() => handleCopy(toPlanText(entry.plan7Days), "Copied 7-day plan.")}
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
            {(entry.checklist || []).map((round) => (
              <div key={round.roundTitle}>
                <p className="text-sm font-semibold text-slate-700">{round.roundTitle}</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
                  {(round.items || []).map((item) => (
                    <li key={`${round.roundTitle}-${item}`}>{item}</li>
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
            {(entry.plan7Days || []).map((dayItem) => (
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
