import test from "node:test";
import assert from "node:assert/strict";
import { buildKit, extractRequirements, validateKit } from "../lib/kit-builder.js";

test("extractRequirements picks up technical and leadership signals", () => {
  const requirements = extractRequirements(
    "Senior frontend engineer with React, TypeScript, and strong mentoring experience required.",
  );

  assert.ok(requirements.some((item) => item.id === "REQ-001"));
  assert.ok(requirements.some((item) => item.id === "REQ-006"));
  assert.ok(requirements.every((item) => item.priority));
});

test("buildKit creates a valid schedule and full coverage", () => {
  const kit = buildKit(
    "We need a senior frontend engineer with React, TypeScript, stakeholder communication, and leadership experience.",
    "https://example.com/careers",
    4,
  );

  assert.equal(kit.schedule.length, 4);
  assert.equal(validateKit(kit).length, 0);
  assert.ok(kit.questionBank.length >= kit.requirements.length);
});

test("buildKit groups detected technologies into contiguous study ranges", () => {
  const kit = buildKit(
    "Frontend engineer using React for the product UI and Node.js for backend services.",
    "https://example.com/careers",
    5,
  );

  assert.deepEqual(kit.technologies, ["React", "Node.js"]);
  assert.match(kit.roleBreakdown, /Days 1-3: React UI and component architecture/);
  assert.match(kit.roleBreakdown, /Days 4-5: Node\.js services and APIs/);
  assert.equal(kit.schedule[0].topic, "React");
  assert.equal(kit.schedule[2].topic, "React");
  assert.equal(kit.schedule[3].topic, "Node.js");
  assert.equal(kit.schedule[4].topic, "Node.js");
  assert.ok(kit.questionBank.some((question) => question.question.includes("React feature")));
  assert.ok(kit.questionBank.some((question) => question.question.includes("Node.js service")));
});
