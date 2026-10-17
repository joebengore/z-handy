import { NextResponse } from "next/server";
import { GoogleApiError } from "@/lib/google";
import { NotFoundError, ValidationError } from "@/lib/jobs";

/** Maps thrown errors to JSON responses with a sensible status. */
export function errorResponse(error: unknown): NextResponse {
  if (error instanceof ValidationError || error instanceof NotFoundError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof GoogleApiError) {
    // 404 and our own config errors pass through; anything else from Google is an upstream failure.
    const status = error.status === 404 || error.status === 500 ? error.status : 502;
    return NextResponse.json({ error: error.message }, { status });
  }
  console.error(error);
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ValidationError("Request body must be JSON.");
  }
}
