const TEST_CHECKLIST_KEY = "prp_test_checklist_v1";

export const TEST_ITEMS = [
  {
    id: "jd_required",
    label: "JD required validation works",
    hint: "Leave JD empty and click Analyze JD.",
  },
  {
    id: "short_jd_warning",
    label: "Short JD warning shows for <200 chars",
    hint: "Paste a short JD and confirm the calm warning appears.",
  },
  {
    id: "skills_grouping",
    label: "Skills extraction groups correctly",
    hint: "Use a JD with DSA, React, SQL, AWS and verify category grouping.",
  },
  {
    id: "round_mapping_dynamic",
    label: "Round mapping changes based on company + skills",
    hint: "Compare Infosys + DSA vs startup + React/Node JD results.",
  },
  {
    id: "score_deterministic",
    label: "Score calculation is deterministic",
    hint: "Run same JD input twice and verify same base score.",
  },
  {
    id: "toggle_live_score",
    label: "Skill toggles update score live",
    hint: "Toggle I know this/Need practice and watch final score update instantly.",
  },
  {
    id: "persist_refresh",
    label: "Changes persist after refresh",
    hint: "Refresh /results and confirm toggles + final score remain.",
  },
  {
    id: "history_save_load",
    label: "History saves and loads correctly",
    hint: "Create multiple analyses and reopen entries from history.",
  },
  {
    id: "export_content",
    label: "Export buttons copy the correct content",
    hint: "Use copy/download actions and verify output text sections.",
  },
  {
    id: "no_console_errors",
    label: "No console errors on core pages",
    hint: "Open browser console and navigate core pages to confirm clean logs.",
  },
];

function buildDefaultState() {
  const state = {};
  TEST_ITEMS.forEach((item) => {
    state[item.id] = false;
  });
  return state;
}

function sanitizeState(value) {
  const defaultState = buildDefaultState();
  if (!value || typeof value !== "object") {
    return defaultState;
  }

  const next = { ...defaultState };
  TEST_ITEMS.forEach((item) => {
    next[item.id] = Boolean(value[item.id]);
  });

  return next;
}

export function getTestChecklistState() {
  if (typeof window === "undefined") {
    return buildDefaultState();
  }

  const raw = window.localStorage.getItem(TEST_CHECKLIST_KEY);
  if (!raw) {
    return buildDefaultState();
  }

  try {
    return sanitizeState(JSON.parse(raw));
  } catch {
    return buildDefaultState();
  }
}

export function saveTestChecklistState(nextState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TEST_CHECKLIST_KEY, JSON.stringify(sanitizeState(nextState)));
}

export function updateTestChecklistItem(id, checked) {
  const current = getTestChecklistState();
  const next = {
    ...current,
    [id]: Boolean(checked),
  };
  saveTestChecklistState(next);
  return next;
}

export function resetTestChecklistState() {
  const defaultState = buildDefaultState();
  saveTestChecklistState(defaultState);
  return defaultState;
}

export function getPassedCount(state) {
  return TEST_ITEMS.filter((item) => Boolean(state[item.id])).length;
}

export function isChecklistComplete(state) {
  return getPassedCount(state) === TEST_ITEMS.length;
}
