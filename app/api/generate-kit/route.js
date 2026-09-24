import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { generateInterviewKit } from "@/lib/ai-generator";
import { validateKit } from "@/lib/kit-builder";
import Kit from "@/models/Kit";

export async function POST(request) {
  const sessionUser = await getSessionUser(request);

  if (!sessionUser) {
    return NextResponse.json({ error: "Please sign in before generating kits." }, { status: 401 });
  }

  try {
    const { jobDescription, companyUrl, days } = await request.json();

    if (!jobDescription || !String(jobDescription).trim()) {
      return NextResponse.json({ error: "Please paste a job description first." }, { status: 400 });
    }

    const requestedDays = Number(days);
    const normalizedDays = Number.isFinite(requestedDays)
      ? Math.min(60, Math.max(1, Math.round(requestedDays)))
      : 5;

    const kit = await generateInterviewKit({
      jobDescription: String(jobDescription),
      companyUrl: String(companyUrl || "https://example.com/careers"),
      days: normalizedDays,
    });

    const issues = validateKit(kit);
    if (issues.length > 0) {
      return NextResponse.json({ error: issues.join("; ") }, { status: 400 });
    }

    await connectToDatabase();
    const saved = await Kit.create({
      userId: sessionUser.userId,
      title: kit.companyBrief?.title || "Interview prep kit",
      companyUrl: String(companyUrl || "https://example.com/careers"),
      jobDescription: String(jobDescription),
      days: normalizedDays,
      companyBrief: kit.companyBrief,
      roleBreakdown: kit.roleBreakdown,
      requirements: kit.requirements,
      questionBank: kit.questionBank,
      flashcards: kit.flashcards,
      schedule: kit.schedule,
      technologies: kit.technologies,
      coverage: kit.coverage,
    });

    return NextResponse.json({
      kit,
      savedKit: {
        id: saved._id.toString(),
        title: saved.title,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "The kit could not be generated." },
      { status: 500 },
    );
  }
}
