/**
 * Server-side API route for student portal lookup.
 * Called from the Next.js server — keeps the access_code out of browser network tabs.
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roll_number, access_code } = body;

    if (!roll_number || !access_code) {
      return NextResponse.json(
        { error: "Roll number and access code are required" },
        { status: 400 }
      );
    }

    // Forward to FastAPI backend (server-to-server — access_code never exposed to browser)
    const response = await fetch(`${BACKEND_URL}/api/v1/student/lookup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roll_number: roll_number.trim(), access_code: access_code.trim() }),
      // 10 second timeout
      signal: AbortSignal.timeout(10000),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error?.message ?? "No result found" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Student lookup error:", error);
    return NextResponse.json(
      { error: "Service temporarily unavailable. Please try again." },
      { status: 503 }
    );
  }
}
