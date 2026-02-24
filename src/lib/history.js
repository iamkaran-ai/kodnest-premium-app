const HISTORY_KEY = "prp_analysis_history";
const SELECTED_ID_KEY = "prp_selected_analysis_id";

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function getHistory() {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(HISTORY_KEY);
  const parsed = safeJsonParse(raw || "[]", []);
  return Array.isArray(parsed) ? parsed : [];
}

export function saveAnalysisEntry(entry) {
  const history = getHistory();
  const next = [entry, ...history];
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  window.localStorage.setItem(SELECTED_ID_KEY, entry.id);
}

export function setSelectedAnalysisId(id) {
  window.localStorage.setItem(SELECTED_ID_KEY, id);
}

export function getSelectedAnalysisId() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(SELECTED_ID_KEY) || "";
}

export function getLatestAnalysis() {
  const history = getHistory();
  return history.length ? history[0] : null;
}

export function getAnalysisById(id) {
  if (!id) {
    return null;
  }

  const history = getHistory();
  return history.find((item) => item.id === id) || null;
}
