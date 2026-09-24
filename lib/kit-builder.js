const requirementCatalog = [
  {
    id: "REQ-001",
    category: "technical",
    text: "Frontend engineering with React and UI craftsmanship",
    keywords: ["react", "frontend", "ui", "components", "design system", "user experience"],
  },
  {
    id: "REQ-002",
    category: "technical",
    text: "TypeScript and JavaScript application design",
    keywords: ["typescript", "javascript", "node", "client-side", "web app"],
  },
  {
    id: "REQ-003",
    category: "technical",
    text: "Backend integration and API-driven product work",
    keywords: ["api", "backend", "server", "service", "database", "graphql", "rest"],
  },
  {
    id: "REQ-004",
    category: "technical",
    text: "System design and scalable architecture thinking",
    keywords: ["system design", "architecture", "scalability", "distributed", "cloud", "platform"],
  },
  {
    id: "REQ-005",
    category: "behavioral",
    text: "Cross-functional communication and stakeholder alignment",
    keywords: ["communication", "stakeholder", "collaboration", "partner", "cross-functional"],
  },
  {
    id: "REQ-006",
    category: "behavioral",
    text: "Mentoring juniors and building engineering capability",
    keywords: ["mentor", "coaching", "junior", "support", "leadership"],
  },
  {
    id: "REQ-007",
    category: "leadership",
    text: "Ownership, prioritization, and delivery under ambiguity",
    keywords: ["ownership", "prioritize", "product", "roadmap", "delivery", "ambiguity"],
  },
];

const questionTemplates = {
  technical: [
    "How would you break this feature into small, testable pieces and validate each one?",
    "What trade-offs would you consider when designing the production architecture for this requirement?",
    "How would you verify correctness, edge cases, and release safety before shipping?",
  ],
  behavioral: [
    "Tell me about a time when you had to align stakeholders with different priorities.",
    "Describe a project where you solved a complicated problem with imperfect information.",
    "How do you give feedback or coach a teammate without slowing delivery?",
  ],
  leadership: [
    "Describe a time you took ownership of a project and drove it from ambiguity to delivery.",
    "How do you choose what matters most when priorities conflict?",
    "What would you do to create momentum and clarity for a team under time pressure?",
  ],
};

function normalizeRoleText(requirementText) {
  return requirementText.toLowerCase();
}

export function extractRequirements(jobDescription = "") {
  const text = (jobDescription || "").toLowerCase();
  const discovered = requirementCatalog.filter((requirement) =>
    requirement.keywords.some((keyword) => text.includes(keyword.toLowerCase())),
  );

  if (discovered.length === 0) {
    return [
      {
        id: "REQ-001",
        category: "technical",
        priority: "must",
        text: "Demonstrate strong product thinking and execution in a real-world engineering context.",
      },
    ];
  }

  return discovered.map((requirement) => ({
    id: requirement.id,
    category: requirement.category,
    priority: /must|required|strong|senior|experience|mentor|leadership|ownership/.test(text) ? "must" : "nice",
    text: requirement.text,
  }));
}

function buildCompanyBrief(companyUrl, requirements) {
  const host = (() => {
    try {
      const parsed = new URL(companyUrl || "https://example.com/careers");
      return parsed.hostname.replace(/^www\./, "");
    } catch {
      return "the company";
    }
  })();

  const headline = `${host} interview preparation`;
  const summary = `This role is likely centered on ${requirements.slice(0, 2).map((item) => item.text.toLowerCase()).join(" and ")}. The prep kit focuses on core execution, product judgment, and communication patterns that are often tested in interviews.`;

  return { title: headline, summary };
}

function buildSchedule(requirements, daysRequested) {
  const totalDays = Math.max(1, Number(daysRequested) || 3);
  const dailyPlan = Array.from({ length: totalDays }, (_, index) => ({
    day: index + 1,
    focus: ["Core technical depth", "Product thinking", "Behavioral communication", "Leadership and ownership", "System trade-offs"][index % 5],
    questionIds: [],
    duration: 0,
  }));

  const rankedRequirements = [...requirements].sort((left, right) => {
    const leftValue = left.priority === "must" ? 2 : 1;
    const rightValue = right.priority === "must" ? 2 : 1;
    return rightValue - leftValue;
  });

  rankedRequirements.forEach((requirement, index) => {
    const targetDay = Math.min(index % totalDays, totalDays - 1);
    const questionId = `Q-${requirement.id}`;
    dailyPlan[targetDay].questionIds.push(questionId);
    dailyPlan[targetDay].duration += requirement.priority === "must" ? 40 : 25;
  });

  dailyPlan.forEach((day) => {
    if (day.questionIds.length === 0) {
      day.focus = "Review and recap";
      day.duration = 30;
      day.questionIds = ["Q-REVIEW"];
    }
  });

  return dailyPlan.map((day) => ({
    ...day,
    questionIds: day.questionIds.slice(0, 6),
  }));
}

export function buildKit(jobDescription, companyUrl, daysRequested = 3) {
  const requirements = extractRequirements(jobDescription);
  const questionBank = requirements.map((requirement, index) => {
    const templatePool = questionTemplates[requirement.category] || questionTemplates.technical;
    const selectedTemplate = templatePool[index % templatePool.length];

    return {
      id: `Q-${requirement.id}`,
      requirementId: requirement.id,
      category: requirement.category,
      question: `${selectedTemplate} (${requirement.text})`,
      answerOutline: `Explain the trade-offs, your decision-making process, and how you would validate the result in a real project.`,
    };
  });

  const flashcards = questionBank.slice(0, 5).map((question, index) => ({
    id: `F-${index + 1}`,
    question: question.question,
    answer: question.answerOutline,
  }));

  const roleBreakdown = requirements
    .map((requirement) => `- ${requirement.text} (${requirement.priority})`)
    .join("\n");

  const kit = {
    companyBrief: buildCompanyBrief(companyUrl, requirements),
    roleBreakdown: `The role emphasizes the following themes:\n${roleBreakdown}`,
    requirements,
    questionBank,
    flashcards,
    schedule: buildSchedule(requirements, daysRequested),
    days: Math.max(1, Number(daysRequested) || 3),
    coverage: {
      total: requirements.length,
      covered: requirements.length,
      missing: 0,
    },
  };

  return kit;
}

export function validateKit(kit) {
  const issues = [];
  if (!kit || !Array.isArray(kit.requirements) || kit.requirements.length === 0) {
    issues.push("No requirements were extracted from the job description.");
    return issues;
  }

  const requirementIds = new Set(kit.requirements.map((requirement) => requirement.id));
  const coveredIds = new Set((kit.questionBank || []).map((question) => question.requirementId));

  for (const requirement of kit.requirements) {
    if (!coveredIds.has(requirement.id)) {
      issues.push(`Missing coverage for ${requirement.id}`);
    }
  }

  if (!Array.isArray(kit.schedule) || kit.schedule.length !== Number(kit.days)) {
    issues.push("Schedule length does not match the requested number of days.");
  }

  if (typeof kit.companyBrief?.title !== "string" || typeof kit.companyBrief?.summary !== "string") {
    issues.push("The company brief is incomplete.");
  }

  if (requirementIds.size !== (kit.questionBank || []).length) {
    issues.push("Question bank is not aligned one-to-one with the identified requirements.");
  }

  return issues;
}
