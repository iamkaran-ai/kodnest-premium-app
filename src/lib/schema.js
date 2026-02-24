export const REQUIRED_SKILL_KEYS = [
  "coreCS",
  "languages",
  "web",
  "data",
  "cloud",
  "testing",
  "other",
];

const DEFAULT_OTHER_SKILLS = [
  "Communication",
  "Problem solving",
  "Basic coding",
  "Projects",
];

function clampScore(value) {
  return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
}

function normalizeString(value) {
  return typeof value === "string" ? value : "";
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function flattenExtractedSkills(extractedSkills) {
  return REQUIRED_SKILL_KEYS.flatMap((key) => normalizeStringArray(extractedSkills?.[key]));
}

export function normalizeExtractedSkills(input) {
  const normalized = {
    coreCS: normalizeStringArray(input?.coreCS),
    languages: normalizeStringArray(input?.languages),
    web: normalizeStringArray(input?.web),
    data: normalizeStringArray(input?.data),
    cloud: normalizeStringArray(input?.cloud),
    testing: normalizeStringArray(input?.testing),
    other: normalizeStringArray(input?.other),
  };

  const technicalCount = REQUIRED_SKILL_KEYS
    .filter((key) => key !== "other")
    .reduce((count, key) => count + normalized[key].length, 0);

  if (technicalCount === 0 && normalized.other.length === 0) {
    normalized.other = [...DEFAULT_OTHER_SKILLS];
  }

  return normalized;
}

function normalizeSkillConfidenceValue(value) {
  return value === "know" ? "know" : "practice";
}

export function createDefaultSkillConfidenceMap(extractedSkills) {
  const map = {};
  flattenExtractedSkills(extractedSkills).forEach((skill) => {
    map[skill] = "practice";
  });
  return map;
}

export function normalizeSkillConfidenceMap(rawMap, extractedSkills) {
  const map = typeof rawMap === "object" && rawMap !== null ? rawMap : {};
  const normalized = createDefaultSkillConfidenceMap(extractedSkills);

  Object.entries(map).forEach(([skill, value]) => {
    if (typeof skill === "string" && skill.trim()) {
      normalized[skill] = normalizeSkillConfidenceValue(value);
    }
  });

  return normalized;
}

export function computeFinalScore(baseScore, skillConfidenceMap) {
  const delta = Object.values(skillConfidenceMap || {}).reduce((acc, value) => {
    return acc + (value === "know" ? 2 : -2);
  }, 0);

  return clampScore((Number(baseScore) || 0) + delta);
}

function normalizeChecklist(input) {
  if (Array.isArray(input)) {
    return input
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }

        return {
          roundTitle: normalizeString(item.roundTitle || item.title),
          items: normalizeStringArray(item.items),
        };
      })
      .filter((item) => item && item.roundTitle);
  }

  if (input && typeof input === "object") {
    return Object.entries(input).map(([roundTitle, items]) => ({
      roundTitle,
      items: normalizeStringArray(items),
    }));
  }

  return [];
}

function normalizeRoundMapping(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const roundTitle = normalizeString(item.roundTitle || item.title);
      const focusAreas = Array.isArray(item.focusAreas)
        ? normalizeStringArray(item.focusAreas)
        : normalizeString(item.focus)
          ? [normalizeString(item.focus)]
          : [];

      return {
        roundTitle,
        focusAreas,
        whyItMatters: normalizeString(item.whyItMatters || item.why),
      };
    })
    .filter((item) => item && item.roundTitle);
}

function normalizePlan7Days(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      return {
        day: normalizeString(item.day),
        focus: normalizeString(item.focus),
        tasks: normalizeStringArray(item.tasks),
      };
    })
    .filter((item) => item && item.day);
}

function normalizeQuestions(input) {
  const list = normalizeStringArray(input);
  return list.slice(0, 10);
}

function normalizeIsoDate(value, fallback) {
  const source = normalizeString(value) || fallback;
  const parsed = new Date(source);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString();
}

export function normalizeAnalysisEntry(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const id = normalizeString(raw.id);
  const createdAt = normalizeIsoDate(raw.createdAt, "");
  const jdText = normalizeString(raw.jdText);

  if (!id || !createdAt || !jdText.trim()) {
    return null;
  }

  const extractedSkills = normalizeExtractedSkills(raw.extractedSkills);
  const baseScore = clampScore(Number(raw.baseScore ?? raw.baseReadinessScore ?? raw.readinessScore ?? 0));
  const skillConfidenceMap = normalizeSkillConfidenceMap(raw.skillConfidenceMap, extractedSkills);
  const finalScore = clampScore(
    Number(raw.finalScore ?? raw.readinessScore ?? computeFinalScore(baseScore, skillConfidenceMap))
  );

  const updatedAt = normalizeIsoDate(raw.updatedAt, createdAt) || createdAt;

  return {
    id,
    createdAt,
    company: normalizeString(raw.company),
    role: normalizeString(raw.role),
    jdText,
    extractedSkills,
    roundMapping: normalizeRoundMapping(raw.roundMapping),
    checklist: normalizeChecklist(raw.checklist),
    plan7Days: normalizePlan7Days(raw.plan7Days ?? raw.plan),
    questions: normalizeQuestions(raw.questions),
    baseScore,
    skillConfidenceMap,
    finalScore,
    updatedAt,
    companyIntel: raw.companyIntel && typeof raw.companyIntel === "object" ? raw.companyIntel : null,
  };
}

export function getDefaultOtherSkills() {
  return [...DEFAULT_OTHER_SKILLS];
}
