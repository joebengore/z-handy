/**
 * Lightweight Google Sheets + Drive client.
 *
 * Authenticates as the business Google account using an OAuth refresh token
 * (see scripts/google-auth.mjs and ADMIN_SETUP.md). Talks to the REST APIs
 * directly with fetch to keep the serverless bundle small.
 */

export class GoogleApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "GoogleApiError";
  }
}

export interface GoogleConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  folderId: string;
}

export function getGoogleConfig(): GoogleConfig {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const missing = [
    !clientId && "GOOGLE_CLIENT_ID",
    !clientSecret && "GOOGLE_CLIENT_SECRET",
    !refreshToken && "GOOGLE_REFRESH_TOKEN",
    !folderId && "GOOGLE_DRIVE_FOLDER_ID",
  ].filter(Boolean);
  if (missing.length) {
    throw new GoogleApiError(`Missing environment variables: ${missing.join(", ")}`, 500);
  }
  return { clientId: clientId!, clientSecret: clientSecret!, refreshToken: refreshToken!, folderId: folderId! };
}

// Access tokens last ~1 hour; cache per warm serverless instance with a safety margin.
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;

  const { clientId, clientSecret, refreshToken } = getGoogleConfig();
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };
  if (!res.ok || !data.access_token) {
    throw new GoogleApiError(
      `Google sign-in failed: ${data.error_description || data.error || res.statusText}. ` +
        "The refresh token may be expired or revoked; run `npm run google:auth` to get a new one.",
      502,
    );
  }
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + ((data.expires_in ?? 3600) - 60) * 1000,
  };
  return cachedToken.value;
}

export async function googleFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      message = (JSON.parse(text) as { error?: { message?: string } }).error?.message ?? text;
    } catch {
      /* use raw text */
    }
    throw new GoogleApiError(`Google API error (${res.status}): ${message}`, res.status);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ---------------------------------------------------------------------------
// Drive
// ---------------------------------------------------------------------------

export const SPREADSHEET_MIME = "application/vnd.google-apps.spreadsheet";
const DRIVE = "https://www.googleapis.com/drive/v3";
const SHEETS = "https://sheets.googleapis.com/v4/spreadsheets";

export interface DriveFile {
  id: string;
  name: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  appProperties?: Record<string, string>;
}

/** Escapes a value for use inside a Drive `q` string literal. */
function q(value: string): string {
  return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

export async function listSpreadsheetsInFolder(folderId: string): Promise<DriveFile[]> {
  const files: DriveFile[] = [];
  let pageToken: string | undefined;
  do {
    const params = new URLSearchParams({
      q: `${q(folderId)} in parents and mimeType = ${q(SPREADSHEET_MIME)} and trashed = false`,
      fields: "nextPageToken, files(id, name, createdTime, modifiedTime, webViewLink, appProperties)",
      orderBy: "name desc",
      pageSize: "200",
      supportsAllDrives: "true",
      includeItemsFromAllDrives: "true",
    });
    if (pageToken) params.set("pageToken", pageToken);
    const page = await googleFetch<{ files: DriveFile[]; nextPageToken?: string }>(
      `${DRIVE}/files?${params}`,
    );
    files.push(...page.files);
    pageToken = page.nextPageToken;
  } while (pageToken);
  return files;
}

export async function getDriveFile(fileId: string): Promise<DriveFile> {
  const params = new URLSearchParams({
    fields: "id, name, createdTime, modifiedTime, webViewLink, appProperties",
    supportsAllDrives: "true",
  });
  return googleFetch<DriveFile>(`${DRIVE}/files/${encodeURIComponent(fileId)}?${params}`);
}

export async function createSpreadsheetFile(
  name: string,
  folderId: string,
  appProperties: Record<string, string>,
): Promise<DriveFile> {
  const params = new URLSearchParams({
    fields: "id, name, createdTime, webViewLink, appProperties",
    supportsAllDrives: "true",
  });
  return googleFetch<DriveFile>(`${DRIVE}/files?${params}`, {
    method: "POST",
    body: JSON.stringify({ name, mimeType: SPREADSHEET_MIME, parents: [folderId], appProperties }),
  });
}

export async function updateDriveFile(
  fileId: string,
  patch: { name?: string; appProperties?: Record<string, string> },
): Promise<DriveFile> {
  const params = new URLSearchParams({ fields: "id, name, appProperties", supportsAllDrives: "true" });
  return googleFetch<DriveFile>(`${DRIVE}/files/${encodeURIComponent(fileId)}?${params}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

// ---------------------------------------------------------------------------
// Sheets
// ---------------------------------------------------------------------------

export type CellValue = string | number | boolean | null;

export interface SheetProperties {
  sheetId: number;
  title: string;
  index: number;
}

export async function getSheetProperties(spreadsheetId: string): Promise<SheetProperties[]> {
  const data = await googleFetch<{ sheets: { properties: SheetProperties }[] }>(
    `${SHEETS}/${spreadsheetId}?fields=sheets.properties(sheetId,title,index)`,
  );
  return data.sheets.map((s) => s.properties);
}

/** Reads several A1 ranges at once. Uses unformatted values so numbers come back as numbers. */
export async function batchGetValues(spreadsheetId: string, ranges: string[]): Promise<CellValue[][][]> {
  const params = new URLSearchParams({ valueRenderOption: "UNFORMATTED_VALUE" });
  for (const range of ranges) params.append("ranges", range);
  const data = await googleFetch<{ valueRanges: { values?: CellValue[][] }[] }>(
    `${SHEETS}/${spreadsheetId}/values:batchGet?${params}`,
  );
  return data.valueRanges.map((vr) => vr.values ?? []);
}

/** Writes values; USER_ENTERED lets formulas (strings starting with "=") evaluate. */
export async function batchUpdateValues(
  spreadsheetId: string,
  data: { range: string; values: CellValue[][] }[],
): Promise<void> {
  await googleFetch(`${SHEETS}/${spreadsheetId}/values:batchUpdate`, {
    method: "POST",
    body: JSON.stringify({ valueInputOption: "USER_ENTERED", data }),
  });
}

/** Structural changes (rename/add sheets, insert/delete rows, formatting). */
export async function batchUpdateSpreadsheet(spreadsheetId: string, requests: unknown[]): Promise<void> {
  await googleFetch(`${SHEETS}/${spreadsheetId}:batchUpdate`, {
    method: "POST",
    body: JSON.stringify({ requests }),
  });
}

export function spreadsheetUrl(spreadsheetId: string): string {
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
}
