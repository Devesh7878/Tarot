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
