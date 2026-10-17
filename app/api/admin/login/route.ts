import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminCookieOptions, getAdminPassword, safeEqual, sessionToken } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const configured = getAdminPassword();
  if (!configured) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not set on the server." },
      { status: 500 },
    );
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!safeEqual(password, configured)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, await sessionToken(configured), adminCookieOptions);
  return response;
}
