// This local API route is unused when NEXT_PUBLIC_CHAT_API points to backend.
// It exists only to satisfy dev setups that call /api/chat directly.
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Frontend is configured for external chat backend. Set NEXT_PUBLIC_CHAT_API or call backend directly.",
    },
    { status: 501 }
  );
}


