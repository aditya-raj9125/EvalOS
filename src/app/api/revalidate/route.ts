import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const { path, token } = await request.json();

    // Placeholder token check
    if (token !== process.env.REVALIDATION_TOKEN && process.env.NODE_ENV === "production") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (path) {
      revalidatePath(path);
      return NextResponse.json({ revalidated: true, now: Date.now() });
    }

    return NextResponse.json({ message: "Path is required" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ message: "Error revalidating" }, { status: 500 });
  }
}
