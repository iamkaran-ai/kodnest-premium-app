import { normalizeAnalysisEntry } from "./schema";

const HISTORY_KEY = "prp_analysis_history";
const SELECTED_ID_KEY = "prp_selected_analysis_id";

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function readHistoryState() {
  if (typeof window === "undefined") {
    return { entries: [], hadCorrupted: false };
  }

  const raw = window.localStorage.getItem(HISTORY_KEY);
  const parsed = safeJsonParse(raw || "[]", []);
  if (!Array.isArray(parsed)) {
    return { entries: [], hadCorrupted: true };
  }

  let hadCorrupted = false;
  const entries = parsed
    .map((entry) => {
      const normalized = normalizeAnalysisEntry(entry);
      if (!normalized) {
        hadCorrupted = true;
      }
      return normalized;
    })
    .filter(Boolean);

  if (hadCorrupted) {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  }

  return { entries, hadCorrupted };
}

export function getHistoryState() {
  return readHistoryState();
}

export function getHistory() {
  return readHistoryState().entries;
}

export function saveAnalysisEntry(entry) {
  const normalizedEntry = normalizeAnalysisEntry(entry);
  if (!normalizedEntry) {
    return;
  }

  const history = getHistory();
  const next = [normalizedEntry, ...history];
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  window.localStorage.setItem(SELECTED_ID_KEY, normalizedEntry.id);
}

export function updateAnalysisEntry(id, updater) {
  if (!id) {
    return null;
  }

  const history = getHistory();
  let updatedEntry = null;

  const next = history.map((item) => {
    if (item.id !== id) {
      return item;
    }

    const draft = typeof updater === "function" ? updater(item) : { ...item, ...updater };
    const normalizedDraft = normalizeAnalysisEntry(draft);
    if (!normalizedDraft) {
      return item;
    }

    updatedEntry = normalizedDraft;
    return normalizedDraft;
  });

  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  if (updatedEntry) {
    window.localStorage.setItem(SELECTED_ID_KEY, updatedEntry.id);
  }

  return updatedEntry;
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
