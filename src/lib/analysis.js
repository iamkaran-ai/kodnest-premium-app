import { getDefaultOtherSkills } from "./schema";

const SKILL_CATALOG = {
  coreCS: [
    { label: "DSA", patterns: [/\bdsa\b/i, /\bdata structures?\b/i, /\balgorithms?\b/i] },
    { label: "OOP", patterns: [/\boop\b/i, /\bobject[- ]oriented\b/i] },
    { label: "DBMS", patterns: [/\bdbms\b/i, /\bdatabase management\b/i] },
    { label: "OS", patterns: [/\bos\b/i, /\boperating systems?\b/i] },
    { label: "Networks", patterns: [/\bnetworks?\b/i, /\bcomputer networks?\b/i] },
  ],
  languages: [
    { label: "Java", patterns: [/\bjava\b/i] },
    { label: "Python", patterns: [/\bpython\b/i] },
    { label: "JavaScript", patterns: [/\bjavascript\b/i, /\bjs\b/i] },
    { label: "TypeScript", patterns: [/\btypescript\b/i, /\bts\b/i] },
    { label: "C", patterns: [/(?:^|[^a-z0-9])c(?:[^a-z0-9]|$)/i] },
    { label: "C++", patterns: [/\bc\+\+\b/i] },
    { label: "C#", patterns: [/\bc#\b/i, /\bc sharp\b/i] },
    { label: "Go", patterns: [/\bgo\b/i, /\bgolang\b/i] },
  ],
  web: [
    { label: "React", patterns: [/\breact\b/i] },
    { label: "Next.js", patterns: [/\bnext(?:\.js)?\b/i] },
    { label: "Node.js", patterns: [/\bnode(?:\.js)?\b/i] },
    { label: "Express", patterns: [/\bexpress\b/i] },
    { label: "REST", patterns: [/\brest\b/i, /\brestful\b/i] },
    { label: "GraphQL", patterns: [/\bgraphql\b/i] },
  ],
  data: [
    { label: "SQL", patterns: [/\bsql\b/i] },
    { label: "MongoDB", patterns: [/\bmongodb\b/i] },
    { label: "PostgreSQL", patterns: [/\bpostgresql\b/i, /\bpostgres\b/i] },
    { label: "MySQL", patterns: [/\bmysql\b/i] },
    { label: "Redis", patterns: [/\bredis\b/i] },
  ],
  cloud: [
    { label: "AWS", patterns: [/\baws\b/i] },
    { label: "Azure", patterns: [/\bazure\b/i] },
    { label: "GCP", patterns: [/\bgcp\b/i, /\bgoogle cloud\b/i] },
    { label: "Docker", patterns: [/\bdocker\b/i] },
    { label: "Kubernetes", patterns: [/\bkubernetes\b/i, /\bk8s\b/i] },
    { label: "CI/CD", patterns: [/\bci\/?cd\b/i, /continuous integration/i] },
    { label: "Linux", patterns: [/\blinux\b/i] },
  ],
  testing: [
    { label: "Selenium", patterns: [/\bselenium\b/i] },
    { label: "Cypress", patterns: [/\bcypress\b/i] },
    { label: "Playwright", patterns: [/\bplaywright\b/i] },
    { label: "JUnit", patterns: [/\bjunit\b/i] },
    { label: "PyTest", patterns: [/\bpytest\b/i] },
  ],
};

const ENTERPRISE_COMPANIES = [
  "amazon",
  "infosys",
  "tcs",
  "wipro",
  "accenture",
  "ibm",
  "microsoft",
  "google",
  "meta",
  "oracle",
  "cognizant",
  "hcl",
  "deloitte",
  "capgemini",
];

const MID_SIZE_COMPANIES = [
  "zoho",
  "freshworks",
  "razorpay",
  "postman",
  "swiggy",
  "zomato",
  "paytm",
  "cred",
];

function unique(items) {
  return [...new Set(items)];
}

function flattenSkills(extractedSkills) {
  return [
    ...extractedSkills.coreCS,
    ...extractedSkills.languages,
    ...extractedSkills.web,
    ...extractedSkills.data,
    ...extractedSkills.cloud,
    ...extractedSkills.testing,
    ...extractedSkills.other,
  ];
}

export function extractSkillsByCategory(jdText) {
  const text = jdText || "";
  const extractedSkills = {
    coreCS: [],
    languages: [],
    web: [],
    data: [],
    cloud: [],
    testing: [],
    other: [],
  };

  Object.entries(SKILL_CATALOG).forEach(([categoryKey, skills]) => {
    extractedSkills[categoryKey] = skills
      .filter(({ patterns }) => patterns.some((pattern) => pattern.test(text)))
      .map(({ label }) => label);
  });

  const detectedCategoryCount = ["coreCS", "languages", "web", "data", "cloud", "testing"].filter(
    (key) => extractedSkills[key].length > 0
  ).length;

  if (detectedCategoryCount === 0) {
    extractedSkills.other = getDefaultOtherSkills();
  }

  const detectedFlatSkills = flattenSkills(extractedSkills);

  return {
    extractedSkills,
    detectedCategoryCount,
    detectedFlatSkills,
    hasDetectedTechnicalSkills: detectedCategoryCount > 0,
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

function buildChecklist(extractedSkills, hasDetectedTechnicalSkills) {
  const skills = flattenSkills(extractedSkills);

  const round1 = buildRoundItems(
    [
      "Revise percentages, probability, ratio, and time-work fundamentals.",
      "Practice 20 aptitude questions with strict timer.",
      "Prepare 60-second self-introduction and role-fit pitch.",
      "Review resume basics: measurable impact and concise bullets.",
      "Revise communication basics: clarity, structure, and brevity.",
    ],
    !hasDetectedTechnicalSkills
      ? [
          "Practice structured communication with one project summary.",
          "Prepare problem-solving approach using clear step-by-step reasoning.",
        ]
      : []
  );

  const coreTopics = ["DSA", "OOP", "DBMS", "OS", "Networks"].filter((topic) => skills.includes(topic));
  const round2Context = coreTopics.map(
    (topic) => `Solve and explain 4 focused problems/concepts for ${topic}.`
  );
  if (!hasDetectedTechnicalSkills) {
    round2Context.push("Practice 3 easy coding problems and explain thought process clearly.");
  }

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

  if (!hasDetectedTechnicalSkills) {
    round3Context.push("Prepare project walkthrough with challenge, solution, and measurable impact.");
  }

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

  return [
    { roundTitle: "Round 1: Aptitude / Basics", items: round1 },
    { roundTitle: "Round 2: DSA + Core CS", items: round2 },
    { roundTitle: "Round 3: Tech interview (projects + stack)", items: round3 },
    { roundTitle: "Round 4: Managerial / HR", items: round4 },
  ];
}

function buildSevenDayPlan(extractedSkills, hasDetectedTechnicalSkills) {
  const skills = flattenSkills(extractedSkills);
  const hasReact = skills.includes("React");
  const hasNext = skills.includes("Next.js");
  const hasNode = skills.includes("Node.js") || skills.includes("Express");
  const hasSql = skills.includes("SQL") || skills.includes("PostgreSQL") || skills.includes("MySQL");
  const hasCloud = ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD"].some((skill) =>
    skills.includes(skill)
  );

  if (!hasDetectedTechnicalSkills) {
    return [
      {
        day: "Day 1",
        focus: "Basics + communication",
        tasks: [
          "Prepare a clear 60-second self-introduction.",
          "Revise core aptitude topics and practice 15 questions.",
        ],
      },
      {
        day: "Day 2",
        focus: "Problem solving",
        tasks: [
          "Solve 3 easy coding questions with explanation-first approach.",
          "Practice structured reasoning for scenario-based questions.",
        ],
      },
      {
        day: "Day 3",
        focus: "Basic coding practice",
        tasks: [
          "Practice arrays/strings basics and edge-case handling.",
          "Write clean pseudocode before implementing solutions.",
        ],
      },
      {
        day: "Day 4",
        focus: "Project storytelling",
        tasks: [
          "Prepare one strong project walkthrough with impact metrics.",
          "Align resume bullets to your actual contribution.",
        ],
      },
      {
        day: "Day 5",
        focus: "Resume + role alignment",
        tasks: [
          "Update resume language for clarity and outcomes.",
          "Practice explaining project tradeoffs simply.",
        ],
      },
      {
        day: "Day 6",
        focus: "Mock interview questions",
        tasks: [
          "Run one technical mock and one HR mock.",
          "Review communication weak spots and improve examples.",
        ],
      },
      {
        day: "Day 7",
        focus: "Revision + weak areas",
        tasks: [
          "Revise communication, coding basics, and project narrative.",
          "Create next-week focus list from mock feedback.",
        ],
      },
    ];
  }

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
        hasSql
          ? "Review SQL joins, indexing, and query optimization basics."
          : "Practice DBMS schema and normalization questions.",
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
        hasReact
          ? "Do final frontend revision sprint (components, hooks, state management)."
          : "Do final core CS and DSA revision sprint.",
      ],
    },
  ];
}

function pickQuestionsFromSkills(detectedFlatSkills, hasDetectedTechnicalSkills) {
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

  const picked = detectedFlatSkills.map((skill) => questionBank[skill]).filter(Boolean);

  const fallback = hasDetectedTechnicalSkills
    ? [
        "Walk through one project you built and justify the key architecture decisions.",
        "If this feature slows down in production, how would you profile and fix it?",
        "How do you prioritize bugs, tech debt, and feature work under tight deadlines?",
        "What metrics would you track to prove your feature improved user outcomes?",
        "Describe a time you disagreed technically with teammates and how you resolved it.",
        "How would you tailor your resume bullets to this role's must-have skills?",
      ]
    : [
        "How do you break down a vague problem statement into actionable tasks?",
        "Describe a project where you improved something measurable.",
        "How do you communicate tradeoffs to non-technical stakeholders?",
        "What approach do you use to debug an unfamiliar codebase quickly?",
        "How do you prioritize tasks when deadlines are tight?",
        "How would you prepare for an interview when JD details are minimal?",
      ];

  return unique([...picked, ...fallback]).slice(0, 10);
}

export function buildCompanyIntel({ company, role, jdText }) {
  const normalizedCompany = (company || "").trim();
  if (!normalizedCompany) {
    return null;
  }

  const companyLower = normalizedCompany.toLowerCase();
  const context = `${normalizedCompany} ${role || ""} ${jdText || ""}`.toLowerCase();

  let sizeCategory = "Startup (<200)";
  if (ENTERPRISE_COMPANIES.some((name) => companyLower.includes(name))) {
    sizeCategory = "Enterprise (2000+)";
  } else if (MID_SIZE_COMPANIES.some((name) => companyLower.includes(name))) {
    sizeCategory = "Mid-size (200–2000)";
  }

  let industry = "Technology Services";
  if (/\b(bank|finance|fintech|payments?)\b/.test(context)) {
    industry = "FinTech";
  } else if (/\bhealth|hospital|medtech|pharma\b/.test(context)) {
    industry = "Healthcare Tech";
  } else if (/\be-?commerce|retail|marketplace\b/.test(context)) {
    industry = "E-commerce";
  } else if (/\bedtech|education|learning\b/.test(context)) {
    industry = "EdTech";
  } else if (/\bcloud|saas|platform\b/.test(context)) {
    industry = "Cloud / SaaS";
  }

  const hiringFocus =
    sizeCategory === "Enterprise (2000+)"
      ? "Structured DSA rounds with strong core fundamentals and consistent communication."
      : sizeCategory === "Startup (<200)"
        ? "Practical problem solving, ownership mindset, and stack depth for fast execution."
        : "Balanced evaluation: coding fundamentals, applied project depth, and collaboration skills.";

  return {
    companyName: normalizedCompany,
    industry,
    sizeCategory,
    hiringFocus,
    note: "Demo Mode: Company intel generated heuristically.",
  };
}

export function buildRoundMapping({ companyIntel, extractedSkills }) {
  const skills = flattenSkills(extractedSkills || {
    coreCS: [],
    languages: [],
    web: [],
    data: [],
    cloud: [],
    testing: [],
    other: [],
  });

  const hasDSA = skills.includes("DSA");
  const hasCore = ["OOP", "DBMS", "OS", "Networks"].some((skill) => skills.includes(skill));
  const hasWebStack = ["React", "Next.js", "Node.js", "Express"].some((skill) => skills.includes(skill));
  const hasData = ["SQL", "MongoDB", "PostgreSQL", "MySQL", "Redis"].some((skill) => skills.includes(skill));
  const sizeCategory = companyIntel?.sizeCategory || "Startup (<200)";

  if (sizeCategory === "Enterprise (2000+)") {
    return [
      {
        roundTitle: "Round 1: Online Test",
        focusAreas: hasDSA ? ["DSA", "Aptitude"] : ["Aptitude", "Programming Basics"],
        whyItMatters: "Large hiring funnels use standardized tests to filter for consistency at scale.",
      },
      {
        roundTitle: "Round 2: Technical",
        focusAreas: hasCore ? ["DSA", "Core CS"] : ["Coding", "Fundamentals"],
        whyItMatters: "Interviewers validate depth in problem solving and conceptual computer science fundamentals.",
      },
      {
        roundTitle: "Round 3: Tech + Projects",
        focusAreas: hasWebStack || hasData ? ["Project architecture", "Stack decisions"] : ["Project execution", "Debugging depth"],
        whyItMatters: "This round checks real-world delivery skills beyond theoretical knowledge.",
      },
      {
        roundTitle: "Round 4: HR",
        focusAreas: ["Behavioral fit", "Communication"],
        whyItMatters: "Final alignment on role expectations, teamwork style, and long-term fit.",
      },
    ];
  }

  if (sizeCategory === "Mid-size (200–2000)") {
    return [
      {
        roundTitle: "Round 1: Coding Screen",
        focusAreas: hasDSA ? ["Problem solving", "DSA"] : ["Practical coding", "Logic"],
        whyItMatters: "Mid-size teams prioritize engineers who can contribute quickly with sound coding judgment.",
      },
      {
        roundTitle: "Round 2: Technical Deep Dive",
        focusAreas: hasCore ? ["Core CS", "Implementation tradeoffs"] : ["Design decisions", "Code quality"],
        whyItMatters: "The team evaluates whether you can reason through tradeoffs in realistic technical scenarios.",
      },
      {
        roundTitle: "Round 3: Projects + Team Fit",
        focusAreas: hasWebStack || hasData ? ["Architecture walkthrough"] : ["Impact stories", "Ownership"],
        whyItMatters: "They need confidence that you can deliver with cross-functional teams.",
      },
      {
        roundTitle: "Round 4: HR / Managerial",
        focusAreas: ["Culture alignment", "Growth potential"],
        whyItMatters: "Confirms communication, accountability, and long-term contribution expectations.",
      },
    ];
  }

  return [
    {
      roundTitle: "Round 1: Practical Coding",
      focusAreas: hasWebStack ? ["Feature-focused coding", "Stack usage"] : ["Hands-on coding", "Debugging"],
      whyItMatters: "Startups optimize for immediate execution, so applied coding ability is prioritized early.",
    },
    {
      roundTitle: "Round 2: System Discussion",
      focusAreas: hasWebStack || hasData ? ["Architecture", "API/data tradeoffs"] : ["Problem decomposition", "Implementation plan"],
      whyItMatters: "Small teams need engineers who can make pragmatic design decisions independently.",
    },
    {
      roundTitle: "Round 3: Culture Fit",
      focusAreas: ["Ownership mindset", "Collaboration"],
      whyItMatters: "High-velocity teams look for accountability, communication, and adaptability.",
    },
  ];
}

export function buildAnalysis({ company, role, jdText }) {
  const { extractedSkills, detectedCategoryCount, detectedFlatSkills, hasDetectedTechnicalSkills } =
    extractSkillsByCategory(jdText);

  const baseScore = calculateReadinessScore({
    company,
    role,
    jdText,
    detectedCategoryCount,
  });

  const checklist = buildChecklist(extractedSkills, hasDetectedTechnicalSkills);
  const plan7Days = buildSevenDayPlan(extractedSkills, hasDetectedTechnicalSkills);
  const questions = pickQuestionsFromSkills(detectedFlatSkills, hasDetectedTechnicalSkills);
  const companyIntel = buildCompanyIntel({ company, role, jdText });
  const roundMapping = buildRoundMapping({ companyIntel, extractedSkills });

  return {
    extractedSkills,
    roundMapping,
    checklist,
    plan7Days,
    questions,
    baseScore,
    companyIntel,
  };
}
