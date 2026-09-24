import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

export async function GET(request) {
  const sessionUser = await getSessionUser(request);

  if (!sessionUser) {
    return NextResponse.json({ user: null });
  }

  try {
    await connectToDatabase();
    const user = await User.findById(sessionUser.userId).lean();

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return NextResponse.json({ user: null, error: error instanceof Error ? error.message : "Session invalid." });
  }
}
