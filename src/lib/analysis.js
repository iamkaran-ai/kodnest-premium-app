const CATEGORY_SKILLS = {
  "Core CS": [
    { label: "DSA", patterns: [/\bdsa\b/i, /\bdata structures?\b/i, /\balgorithms?\b/i] },
    { label: "OOP", patterns: [/\boop\b/i, /\bobject[- ]oriented\b/i] },
    { label: "DBMS", patterns: [/\bdbms\b/i, /\bdatabase management\b/i] },
    { label: "OS", patterns: [/\bos\b/i, /\boperating systems?\b/i] },
    { label: "Networks", patterns: [/\bnetworks?\b/i, /\bcomputer networks?\b/i] },
  ],
  Languages: [
    { label: "Java", patterns: [/\bjava\b/i] },
    { label: "Python", patterns: [/\bpython\b/i] },
    { label: "JavaScript", patterns: [/\bjavascript\b/i, /\bjs\b/i] },
    { label: "TypeScript", patterns: [/\btypescript\b/i, /\bts\b/i] },
    { label: "C", patterns: [/(?:^|[^a-z0-9])c(?:[^a-z0-9]|$)/i] },
    { label: "C++", patterns: [/\bc\+\+\b/i] },
    { label: "C#", patterns: [/\bc#\b/i, /\bc sharp\b/i] },
    { label: "Go", patterns: [/\bgo\b/i, /\bgolang\b/i] },
  ],
  Web: [
    { label: "React", patterns: [/\breact\b/i] },
    { label: "Next.js", patterns: [/\bnext(?:\.js)?\b/i] },
    { label: "Node.js", patterns: [/\bnode(?:\.js)?\b/i] },
    { label: "Express", patterns: [/\bexpress\b/i] },
    { label: "REST", patterns: [/\brest\b/i, /\brestful\b/i] },
    { label: "GraphQL", patterns: [/\bgraphql\b/i] },
  ],
  Data: [
    { label: "SQL", patterns: [/\bsql\b/i] },
    { label: "MongoDB", patterns: [/\bmongodb\b/i] },
    { label: "PostgreSQL", patterns: [/\bpostgresql\b/i, /\bpostgres\b/i] },
    { label: "MySQL", patterns: [/\bmysql\b/i] },
    { label: "Redis", patterns: [/\bredis\b/i] },
  ],
  "Cloud/DevOps": [
    { label: "AWS", patterns: [/\baws\b/i] },
    { label: "Azure", patterns: [/\bazure\b/i] },
    { label: "GCP", patterns: [/\bgcp\b/i, /\bgoogle cloud\b/i] },
    { label: "Docker", patterns: [/\bdocker\b/i] },
    { label: "Kubernetes", patterns: [/\bkubernetes\b/i, /\bk8s\b/i] },
    { label: "CI/CD", patterns: [/\bci\/?cd\b/i, /continuous integration/i] },
    { label: "Linux", patterns: [/\blinux\b/i] },
  ],
  Testing: [
    { label: "Selenium", patterns: [/\bselenium\b/i] },
    { label: "Cypress", patterns: [/\bcypress\b/i] },
    { label: "Playwright", patterns: [/\bplaywright\b/i] },
    { label: "JUnit", patterns: [/\bjunit\b/i] },
    { label: "PyTest", patterns: [/\bpytest\b/i] },
  ],
};

function unique(items) {
  return [...new Set(items)];
}

function buildRoundItems(base, contextual) {
  const merged = unique([...base, ...contextual]);
  if (merged.length >= 5) {
    return merged.slice(0, 8);
  }

  const fallback = [
    "Revise mistakes from previous practice sessions.",
    "Prepare concise explanations with one real example each.",
    "Create a 30-minute rapid revision checklist for this round.",
    "Track weak areas and schedule one focused improvement block.",
  ];

  return unique([...merged, ...fallback]).slice(0, 8);
}

function pickQuestionsFromSkills(detectedFlatSkills) {
  const questionBank = {
    DSA: "How would you optimize search in sorted data and compare binary search with linear scan?",
    OOP: "How do encapsulation and abstraction differ in object-oriented design?",
    DBMS: "What normalization level is usually enough for OLTP systems, and why?",
    OS: "What causes a context switch and how does it affect latency?",
    Networks: "What happens across layers when a browser makes an HTTPS request?",
    Java: "How do HashMap and ConcurrentHashMap differ for multi-threaded use?",
    Python: "What are Python generators and when are they better than lists?",
    JavaScript: "Explain event loop phases and how microtasks affect execution order.",
    TypeScript: "How do union types and type guards improve API safety in TypeScript?",
    C: "How do pointers and array indexing relate in C memory layout?",
    "C++": "What is RAII and how does it prevent resource leaks in C++?",
    "C#": "How does async/await in C# avoid blocking threads in I/O-heavy code?",
    Go: "How do goroutines and channels coordinate concurrent workflows in Go?",
    React: "Explain state management options in React and when to choose each.",
    "Next.js": "When would you choose server components or SSR in Next.js?",
    "Node.js": "How do you handle CPU-heavy work in Node.js without blocking the event loop?",
    Express: "How would you structure Express middleware for auth, validation, and error handling?",
    REST: "How do idempotent REST methods influence retry behavior in clients?",
    GraphQL: "How do you prevent over-fetching and N+1 issues in GraphQL resolvers?",
    SQL: "Explain indexing and when it helps for read-heavy workloads.",
    MongoDB: "How would you model one-to-many relations efficiently in MongoDB?",
    PostgreSQL: "When would you use a composite index in PostgreSQL and why order matters?",
    MySQL: "How does MySQL transaction isolation affect phantom reads?",
    Redis: "Where is Redis best used in a system design and what are eviction tradeoffs?",
    AWS: "How would you design a scalable web app on AWS with cost awareness?",
    Azure: "Which Azure services would you pick for app hosting and monitoring, and why?",
    GCP: "How would you use managed GCP services to reduce operational overhead?",
    Docker: "What should go into a production-ready Dockerfile for a Node or React service?",
    Kubernetes: "How do readiness and liveness probes improve reliability in Kubernetes?",
    "CI/CD": "How would you design a CI/CD pipeline with tests, linting, and safe deployment gates?",
    Linux: "Which Linux commands do you use most for debugging high CPU and memory usage?",
    Selenium: "When is Selenium preferable over newer testing frameworks?",
    Cypress: "How do you make Cypress tests stable and less flaky in CI?",
    Playwright: "What advantages does Playwright provide for cross-browser E2E testing?",
    JUnit: "How do you structure JUnit tests to keep them isolated and maintainable?",
    PyTest: "How do fixtures in PyTest help scale test suites cleanly?",
  };

  const picked = detectedFlatSkills
    .map((skill) => questionBank[skill])
    .filter(Boolean);

  const fallback = [
    "Walk through one project you built and justify the key architecture decisions.",
    "If this feature slows down in production, how would you profile and fix it?",
    "How do you prioritize bugs, tech debt, and feature work under tight deadlines?",
    "What metrics would you track to prove your feature improved user outcomes?",
    "Describe a time you disagreed technically with teammates and how you resolved it.",
    "How would you tailor your resume bullets to this role's must-have skills?",
  ];

  return unique([...picked, ...fallback]).slice(0, 10);
}

export function extractSkillsByCategory(jdText) {
  const text = jdText || "";
  const extracted = {};

  Object.entries(CATEGORY_SKILLS).forEach(([category, skills]) => {
    const found = skills
      .filter(({ patterns }) => patterns.some((pattern) => pattern.test(text)))
      .map(({ label }) => label);

    if (found.length) {
      extracted[category] = found;
    }
  });

  if (!Object.keys(extracted).length) {
    return {
      extractedSkills: { General: ["General fresher stack"] },
      detectedCategoryCount: 0,
      detectedFlatSkills: [],
    };
  }

  const detectedFlatSkills = Object.values(extracted).flat();

  return {
    extractedSkills: extracted,
    detectedCategoryCount: Object.keys(extracted).length,
    detectedFlatSkills,
  };
}

export function calculateReadinessScore({ company, role, jdText, detectedCategoryCount }) {
  let score = 35;
  score += Math.min(detectedCategoryCount * 5, 30);

  if ((company || "").trim()) {
    score += 10;
  }

  if ((role || "").trim()) {
    score += 10;
  }

  if ((jdText || "").trim().length > 800) {
    score += 10;
  }

  return Math.min(score, 100);
}

export function buildChecklist(extractedSkills) {
  const skills = Object.values(extractedSkills || {}).flat();

  const round1 = buildRoundItems(
    [
      "Revise percentages, probability, ratio, and time-work fundamentals.",
      "Practice 20 aptitude questions with strict timer.",
      "Prepare 60-second self-introduction and role-fit pitch.",
      "Review resume basics: measurable impact and concise bullets.",
      "Revise communication basics: clarity, structure, and brevity.",
    ],
    []
  );

  const coreTopics = ["DSA", "OOP", "DBMS", "OS", "Networks"].filter((topic) => skills.includes(topic));
  const round2Context = coreTopics.map(
    (topic) => `Solve and explain 4 focused problems/concepts for ${topic}.`
  );
  const round2 = buildRoundItems(
    [
      "Solve medium-level coding problems with complexity analysis.",
      "Practice writing edge cases before coding each solution.",
      "Explain one optimized approach verbally before implementation.",
      "Revise core CS interview notes and common pitfalls.",
      "Run one 45-minute timed DSA mock round.",
    ],
    round2Context
  );

  const stackSkills = [
    "React",
    "Next.js",
    "Node.js",
    "Express",
    "REST",
    "GraphQL",
    "SQL",
    "MongoDB",
    "PostgreSQL",
    "MySQL",
    "Redis",
    "AWS",
    "Azure",
    "GCP",
    "Docker",
    "Kubernetes",
    "CI/CD",
    "Linux",
    "Selenium",
    "Cypress",
    "Playwright",
    "JUnit",
    "PyTest",
  ].filter((topic) => skills.includes(topic));

  const round3Context = stackSkills.map(
    (topic) => `Prepare one project talking point that demonstrates hands-on ${topic} usage.`
  );

  const round3 = buildRoundItems(
    [
      "Map each project feature to relevant role skills.",
      "Prepare architecture explanation: tradeoffs and alternatives considered.",
      "Rehearse debugging story with clear root-cause and fix.",
      "Align top 4 resume bullets with likely technical interview focus.",
      "Prepare deployment and monitoring explanation for one project.",
    ],
    round3Context
  );

  const round4 = buildRoundItems(
    [
      "Prepare behavioral answers using STAR format for ownership and teamwork.",
      "Draft answers for conflict resolution and learning-from-failure scenarios.",
      "Explain motivation for this company and role in one concise narrative.",
      "Prepare compensation and joining discussion pointers professionally.",
      "Practice two mock HR conversations with confidence and clarity.",
    ],
    []
  );

  return {
    "Round 1: Aptitude / Basics": round1,
    "Round 2: DSA + Core CS": round2,
    "Round 3: Tech interview (projects + stack)": round3,
    "Round 4: Managerial / HR": round4,
  };
}

export function buildSevenDayPlan(extractedSkills) {
  const skills = Object.values(extractedSkills || {}).flat();
  const hasReact = skills.includes("React");
  const hasNext = skills.includes("Next.js");
  const hasNode = skills.includes("Node.js") || skills.includes("Express");
  const hasSql = skills.includes("SQL") || skills.includes("PostgreSQL") || skills.includes("MySQL");
  const hasCloud = ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD"].some((skill) =>
    skills.includes(skill)
  );

  return [
    {
      day: "Day 1",
      focus: "Basics + core CS",
      tasks: [
        "Revise OOP/DBMS/OS/networking core notes.",
        "Create one-page quick revision sheet for fundamentals.",
      ],
    },
    {
      day: "Day 2",
      focus: "Basics + core CS",
      tasks: [
        "Practice conceptual questions from core CS topics.",
        hasSql ? "Review SQL joins, indexing, and query optimization basics." : "Practice DBMS schema and normalization questions.",
      ],
    },
    {
      day: "Day 3",
      focus: "DSA + coding practice",
      tasks: [
        "Solve 4 medium problems on arrays, strings, and binary search.",
        "Write complexity notes for each approach.",
      ],
    },
    {
      day: "Day 4",
      focus: "DSA + coding practice",
      tasks: [
        "Run one 60-minute timed coding set.",
        "Review mistakes and create retry list for weak patterns.",
      ],
    },
    {
      day: "Day 5",
      focus: "Project + resume alignment",
      tasks: [
        hasReact || hasNext
          ? "Revise frontend architecture, state flow, and performance optimization for your project."
          : "Prepare backend/module architecture explanation for your strongest project.",
        hasNode
          ? "Prepare API design tradeoffs from your Node/Express work."
          : "Align 4 resume bullets with measurable technical impact.",
      ],
    },
    {
      day: "Day 6",
      focus: "Mock interview questions",
      tasks: [
        "Do one technical mock and one HR mock round.",
        hasCloud
          ? "Prepare deployment, CI/CD, and incident handling examples."
          : "Prepare debugging and collaboration examples from project work.",
      ],
    },
    {
      day: "Day 7",
      focus: "Revision + weak areas",
      tasks: [
        "Revise all weak topics found during mocks.",
        hasReact ? "Do final frontend revision sprint (components, hooks, state management)." : "Do final core CS and DSA revision sprint.",
      ],
    },
  ];
}

export function buildAnalysis({ company, role, jdText }) {
  const { extractedSkills, detectedCategoryCount, detectedFlatSkills } = extractSkillsByCategory(jdText);
  const readinessScore = calculateReadinessScore({
    company,
    role,
    jdText,
    detectedCategoryCount,
  });

  const checklist = buildChecklist(extractedSkills);
  const plan = buildSevenDayPlan(extractedSkills);
  const questions = pickQuestionsFromSkills(detectedFlatSkills);

  return {
    extractedSkills,
    plan,
    checklist,
    questions,
    readinessScore,
  };
}
