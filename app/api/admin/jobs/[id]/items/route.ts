import { NextResponse } from "next/server";
import { errorResponse, readJson } from "@/lib/api";
import { addItem, deleteItem, parseQuoteItem, ValidationError } from "@/lib/jobs";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = (await readJson(request)) as { item?: unknown };
    const item = parseQuoteItem(body.item ?? body);
    return NextResponse.json({ item: await addItem(id, item) }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = (await readJson(request)) as { row?: unknown; item?: unknown };
    const row = Number(body.row);
    if (!Number.isInteger(row)) throw new ValidationError("row must be an integer.");
    if (typeof body.item !== "string") throw new ValidationError("item is required.");
    await deleteItem(id, row, body.item);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
