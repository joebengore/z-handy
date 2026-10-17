import { NextResponse } from "next/server";
import { errorResponse, readJson } from "@/lib/api";
import { createJob, listJobs, parseJobDetails, parseQuoteItems, ValidationError } from "@/lib/jobs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ jobs: await listJobs() });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await readJson(request)) as { details?: unknown; items?: unknown };
    const details = parseJobDetails(body.details);
    const items = parseQuoteItems(body.items ?? []);
    if (!items.length) throw new ValidationError("Add at least one quote item.");
    const job = await createJob(details, items);
    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
