import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Kit from "@/models/Kit";

export async function GET(request) {
  const sessionUser = await getSessionUser(request);

  if (!sessionUser) {
    return NextResponse.json({ kits: [] }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const kits = await Kit.find({ userId: sessionUser.userId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      kits: kits.map((kit) => ({
        id: kit._id.toString(),
        title: kit.title || kit.companyBrief?.title || "Untitled kit",
        companyUrl: kit.companyUrl,
        days: kit.days,
        createdAt: kit.createdAt,
        coverage: kit.coverage,
        kit: {
          companyBrief: kit.companyBrief,
          roleBreakdown: kit.roleBreakdown,
          requirements: kit.requirements,
          questionBank: kit.questionBank,
          flashcards: kit.flashcards,
          schedule: kit.schedule,
          coverage: kit.coverage,
          days: kit.days,
        },
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load kits." }, { status: 500 });
  }
}
