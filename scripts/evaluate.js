import fs from "node:fs";
import path from "node:path";
import { buildKit, validateKit } from "../lib/kit-builder.js";

function readArg(flagName) {
  const value = process.argv.find((entry) => entry.startsWith(`${flagName}=`));
  return value ? value.split("=").slice(1).join("=") : null;
}

function getArg(flagName) {
  const index = process.argv.indexOf(flagName);
  return index >= 0 ? process.argv[index + 1] : null;
}

const inputArg = readArg("--input") || getArg("--input");
const outputArg = readArg("--output") || getArg("--output");

if (!inputArg || !outputArg) {
  console.error("Usage: npm run evaluate -- --input <cases.json> --output <kits.json>");
  process.exit(1);
}

const inputPath = path.resolve(process.cwd(), inputArg);
const outputPath = path.resolve(process.cwd(), outputArg);

const cases = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const results = cases.map((entry) => {
  try {
    const kit = buildKit(entry.jd || entry.jobDescription || "", entry.company_url || entry.companyUrl || "", entry.days || 3);
    const issues = validateKit(kit);
    return {
      id: entry.id,
      status: issues.length === 0 ? "ok" : "failed",
      issues,
      kit,
    };
  } catch (error) {
    return {
      id: entry.id,
      status: "failed",
      error: error instanceof Error ? error.message : String(error),
    };
  }
});

fs.writeFileSync(outputPath, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2));
console.log(`Wrote ${results.length} kit results to ${outputPath}`);
