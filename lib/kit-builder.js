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

const technologyCatalog = [
  { name: "React", keywords: ["react", "react.js", "reactjs"], topic: "React UI and component architecture" },
  { name: "Next.js", keywords: ["next.js", "nextjs"], topic: "Next.js application architecture" },
  { name: "TypeScript", keywords: ["typescript"], topic: "TypeScript design and type safety" },
  { name: "JavaScript", keywords: ["javascript", "ecmascript"], topic: "JavaScript application fundamentals" },
  { name: "Node.js", keywords: ["node.js", "nodejs", "node "], topic: "Node.js services and APIs" },
  { name: "Python", keywords: ["python"], topic: "Python services and problem solving" },
  { name: "Java", keywords: ["java", "spring boot", "spring"], topic: "Java backend engineering" },
  { name: "SQL", keywords: ["sql", "postgres", "postgresql", "mysql"], topic: "SQL data modeling and queries" },
  { name: "MongoDB", keywords: ["mongodb", "mongo"], topic: "MongoDB data modeling" },
  { name: "GraphQL", keywords: ["graphql"], topic: "GraphQL API design" },
  { name: "REST APIs", keywords: ["rest api", "restful", "api"], topic: "REST API design and integration" },
  { name: "AWS", keywords: ["aws", "amazon web services"], topic: "AWS cloud architecture" },
  { name: "Docker", keywords: ["docker", "container"], topic: "Docker and deployment" },
  { name: "Testing", keywords: ["testing", "test automation", "jest", "playwright", "cypress"], topic: "Testing and release confidence" },
];

const technologyQuestionTemplates = {
  React: "How would you structure, test, and optimize a React feature from this job description?",
  "Next.js": "How would you design a production Next.js page or route for this role, including rendering and performance trade-offs?",
  TypeScript: "How would you use TypeScript to make this role's application safer and easier to evolve?",
  JavaScript: "How would you solve this JavaScript problem while keeping browser behavior and performance predictable?",
  "Node.js": "How would you design and operate a Node.js service for the responsibilities described in this role?",
  Python: "How would you implement and test a Python solution for a problem relevant to this role?",
  Java: "How would you design a maintainable Java service for the requirements in this role?",
  SQL: "How would you model the data and write reliable SQL for this role's product requirements?",
  MongoDB: "How would you model, query, and scale MongoDB data for this role?",
  GraphQL: "How would you design a GraphQL schema and resolve the trade-offs for this role?",
  "REST APIs": "How would you design, secure, and test a REST API for this role?",
  AWS: "How would you deploy and operate this role's workload on AWS?",
  Docker: "How would you containerize and release the application described in this role?",
  Testing: "How would you build a test strategy that gives confidence for this role's application?",
};

function normalizeRoleText(requirementText) {
  return requirementText.toLowerCase();
}

function extractTechnologies(jobDescription = "") {
  const text = ` ${(jobDescription || "").toLowerCase()} `;
  return technologyCatalog
    .filter((technology) => technology.keywords.some((keyword) => text.includes(keyword.toLowerCase())))
    .map(({ name, topic }) => ({ name, topic }));
}

function getRequirementTechnologies(requirement, jobDescription) {
  const text = (jobDescription || "").toLowerCase();
  const matches = technologyCatalog
    .filter((technology) => technology.keywords.some((keyword) => text.includes(keyword.toLowerCase())))
    .map((technology) => technology.name);

  if (requirement.id === "REQ-001") {
    return matches.filter((name) => ["React", "Next.js", "JavaScript", "Testing"].includes(name));
  }
  if (requirement.id === "REQ-002") {
    return matches.filter((name) => ["TypeScript", "JavaScript", "Node.js", "Python", "Java"].includes(name));
  }
  if (requirement.id === "REQ-003") {
    return matches.filter((name) => ["Node.js", "SQL", "MongoDB", "GraphQL", "REST APIs"].includes(name));
  }
  if (requirement.id === "REQ-004") {
    return matches.filter((name) => ["AWS", "Docker", "MongoDB", "SQL"].includes(name));
  }
  return [];
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
    technologies: getRequirementTechnologies(requirement, jobDescription),
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

function buildTopicRanges(topics, totalDays) {
  const selectedTopics = topics.length > 0 ? topics : [{ name: "Core role skills", topic: "Core role skills and interview practice" }];
  const baseDays = Math.floor(totalDays / selectedTopics.length);
  const extraDays = totalDays % selectedTopics.length;
  let currentDay = 1;

  return selectedTopics.map((topic, index) => {
    const rangeLength = baseDays + (index < extraDays ? 1 : 0);
    const range = {
      ...topic,
      startDay: currentDay,
      endDay: currentDay + rangeLength - 1,
    };
    currentDay += rangeLength;
    return range;
  });
}

function buildSchedule(requirements, daysRequested, technologies) {
  const totalDays = Math.max(1, Number(daysRequested) || 3);
  const topicRanges = buildTopicRanges(technologies, totalDays);
  const dailyPlan = Array.from({ length: totalDays }, (_, index) => ({
    day: index + 1,
    focus: topicRanges.find((range) => index + 1 >= range.startDay && index + 1 <= range.endDay)?.topic || "Core role skills",
    topic: topicRanges.find((range) => index + 1 >= range.startDay && index + 1 <= range.endDay)?.name || "Core role skills",
    questionIds: [],
    duration: 0,
  }));

  requirements.forEach((requirement) => {
    const questionId = `Q-${requirement.id}`;
    const matchingDays = dailyPlan.filter((day) => {
      if (!requirement.technologies?.length) return day.day === 1;
      return requirement.technologies.includes(day.topic);
    });
    const assignedDays = matchingDays.length > 0 ? matchingDays : [dailyPlan[0]];
    assignedDays.forEach((day) => {
      day.questionIds.push(questionId);
      day.duration += requirement.priority === "must" ? 40 : 25;
    });
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
    topicRange: `${topicRanges.find((range) => day.day >= range.startDay && day.day <= range.endDay)?.startDay || day.day}-${topicRanges.find((range) => day.day >= range.startDay && day.day <= range.endDay)?.endDay || day.day}`,
  }));
}

export function buildKit(jobDescription, companyUrl, daysRequested = 3) {
  const requirements = extractRequirements(jobDescription);
  const technologies = extractTechnologies(jobDescription);
  const questionBank = requirements.map((requirement, index) => {
    const templatePool = questionTemplates[requirement.category] || questionTemplates.technical;
    const technologyName = requirement.technologies?.[0];
    const selectedTemplate = technologyName && technologyQuestionTemplates[technologyName]
      ? technologyQuestionTemplates[technologyName]
      : templatePool[index % templatePool.length];
    const technologyContext = requirement.technologies?.length
      ? ` Focus technology: ${requirement.technologies.join(", ")}.`
      : "";

    return {
      id: `Q-${requirement.id}`,
      requirementId: requirement.id,
      category: requirement.category,
      question: `${selectedTemplate}${technologyContext} Requirement: ${requirement.text}`,
      answerOutline: `Explain the trade-offs, your decision-making process, and how you would validate the result in a real project.`,
    };
  });

  const flashcards = questionBank.slice(0, 5).map((question, index) => ({
    id: `F-${index + 1}`,
    question: question.question,
    answer: question.answerOutline,
  }));

  const totalDays = Math.max(1, Number(daysRequested) || 3);
  const topicRanges = buildTopicRanges(technologies, totalDays);
  const roleBreakdown = topicRanges
    .map((range) => {
      const topicRequirements = requirements.filter((requirement) =>
        requirement.technologies?.includes(range.name),
      );
      const details = topicRequirements.length > 0
        ? topicRequirements.map((requirement) => `- ${requirement.text} (${requirement.priority})`).join("\n")
        : "- Practice the core requirements and realistic interview scenarios for this role.";
      return `Days ${range.startDay}-${range.endDay}: ${range.topic}\n${details}`;
    })
    .join("\n\n");

  const kit = {
    companyBrief: buildCompanyBrief(companyUrl, requirements),
    roleBreakdown: `The role emphasizes the following themes:\n${roleBreakdown}`,
    requirements,
    questionBank,
    flashcards,
    schedule: buildSchedule(requirements, daysRequested, technologies),
    days: totalDays,
    technologies: technologies.map((technology) => technology.name),
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
