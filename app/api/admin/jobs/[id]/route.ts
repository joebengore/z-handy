import { NextResponse } from "next/server";
import { errorResponse, readJson } from "@/lib/api";
import { getJob, parseJobDetails, updateJobDetails } from "@/lib/jobs";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    return NextResponse.json({ job: await getJob(id) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = (await readJson(request)) as { details?: unknown };
    const details = parseJobDetails(body.details ?? body);
    await updateJobDetails(id, details);
    return NextResponse.json({ ok: true, details });
  } catch (error) {
    return errorResponse(error);
  }
}
