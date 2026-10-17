/**
 * Job records live entirely in Google Sheets: one spreadsheet per job, named by
 * job number (YYMM## — e.g. 261001 is the first job of October 2026), inside the
 * Drive folder GOOGLE_DRIVE_FOLDER_ID.
 *
 * Each spreadsheet has the two tabs the Apps Script importer expects:
 *   - "Job Details": label in column A, value in column B
 *   - "ItemizedQuote": Item | Materials | Labor | Number | Item Total | Includes | Link
 *     followed by "Total Before Discounts" and "Total" rows driven by formulas.
 *
 * The customer name and job address are mirrored into the Drive file's
 * appProperties so the job list can render without opening every spreadsheet.
 */
import {
  batchGetValues,
  batchUpdateSpreadsheet,
  batchUpdateValues,
  createSpreadsheetFile,
  getDriveFile,
  getGoogleConfig,
  getSheetProperties,
  listSpreadsheetsInFolder,
  spreadsheetUrl,
  updateDriveFile,
  type CellValue,
  type DriveFile,
} from "@/lib/google";

export class ValidationError extends Error {
  readonly status = 400;
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  readonly status = 404;
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface JobDetails {
  name: string;
  phone: string;
  email: string;
  mailingAddress: string;
  jobAddress: string;
  sqft: string;
}

export interface QuoteItem {
  item: string;
  materials: number | null;
  labor: number | null;
  quantity: number;
  includes: string;
  link: string;
}

export interface QuoteItemRow extends QuoteItem {
  /** 1-based spreadsheet row, used to delete the item later. */
  row: number;
  total: number | null;
}

export interface JobSummary {
  id: string;
  jobNumber: string;
  customerName: string;
  jobAddress: string;
  url: string;
  modifiedTime: string | null;
}

export interface Job extends JobSummary {
  details: JobDetails;
  items: QuoteItemRow[];
  subtotal: number | null;
  total: number | null;
}

// ---------------------------------------------------------------------------
// Sheet layout constants
// ---------------------------------------------------------------------------

const DETAILS_TAB = "Job Details";
const QUOTE_TAB = "ItemizedQuote";

/** Row labels on the Job Details tab. "Address" (not "Job Address") is what Code.js reads. */
const DETAIL_ROWS: { label: string; key: keyof JobDetails }[] = [
  { label: "Name", key: "name" },
  { label: "Phone", key: "phone" },
  { label: "Email", key: "email" },
  { label: "Mailing Address", key: "mailingAddress" },
  { label: "Address", key: "jobAddress" },
  { label: "Sq Ft", key: "sqft" },
];

const QUOTE_HEADERS = ["Item", "Materials", "Labor", "Number", "Item Total", "Includes", "Link"];
const SUBTOTAL_LABEL = "Total Before Discounts";
const TOTAL_LABEL = "Total";
const MONEY_FORMAT = "$#,##0.00";

const normalize = (value: unknown) => String(value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
const isSubtotalLabel = (value: unknown) => {
  const key = normalize(value);
  return key === "totalbeforediscounts" || key.startsWith("subtotal");
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function str(input: Record<string, unknown>, key: string, max = 500): string {
  const value = input[key];
  if (value === undefined || value === null) return "";
  if (typeof value !== "string" && typeof value !== "number") {
    throw new ValidationError(`${key} must be text.`);
  }
  const text = String(value).trim();
  if (text.length > max) throw new ValidationError(`${key} is too long (max ${max} characters).`);
  return text;
}

/** Parses "$1,200.50", "1200", 1200 → 1200.5. Returns null for blank. */
function money(input: Record<string, unknown>, key: string, label: string): number | null {
  const raw = input[key];
  if (raw === undefined || raw === null || raw === "") return null;
  if (typeof raw === "number") {
    if (!Number.isFinite(raw)) throw new ValidationError(`${label} must be a number.`);
    return Math.round(raw * 100) / 100;
  }
  if (typeof raw !== "string") throw new ValidationError(`${label} must be a number.`);
  const text = raw.trim();
  if (!text) return null;
  const negative = /^-|^\(.*\)$|^\$\s*-/.test(text);
  const number = Number(text.replace(/[$,\s()\-]/g, ""));
  if (!Number.isFinite(number)) throw new ValidationError(`${label} "${text}" is not a valid number.`);
  return Math.round((negative ? -number : number) * 100) / 100;
}

function asRecord(input: unknown, what: string): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new ValidationError(`${what} must be an object.`);
  }
  return input as Record<string, unknown>;
}

export function parseJobDetails(input: unknown): JobDetails {
  const body = asRecord(input, "Job details");
  const details: JobDetails = {
    name: str(body, "name", 200),
    phone: str(body, "phone", 50),
    email: str(body, "email", 200),
    mailingAddress: str(body, "mailingAddress"),
    jobAddress: str(body, "jobAddress"),
    sqft: str(body, "sqft", 50),
  };
  if (!details.name) throw new ValidationError("Name is required.");
  if (!details.jobAddress) throw new ValidationError("Job address is required.");
  if (details.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) {
    throw new ValidationError("Email doesn't look valid.");
  }
  if (details.sqft && !Number.isFinite(Number(details.sqft.replace(/,/g, "")))) {
    throw new ValidationError("Sq Ft must be a number.");
  }
  return details;
}

export function parseQuoteItem(input: unknown): QuoteItem {
  const body = asRecord(input, "Quote item");
  const item: QuoteItem = {
    item: str(body, "item", 300),
    materials: money(body, "materials", "Materials"),
    labor: money(body, "labor", "Labor"),
    quantity: money(body, "quantity", "Quantity") ?? 1,
    includes: str(body, "includes", 2000),
    link: str(body, "link", 2000),
  };
  if (!item.item) throw new ValidationError("Item description is required.");
  if (item.materials === null && item.labor === null) {
    throw new ValidationError(`"${item.item}" needs Materials or Labor (or both).`);
  }
  if ((item.materials ?? 0) < 0 || (item.labor ?? 0) < 0) {
    throw new ValidationError("Materials and Labor can't be negative.");
  }
  if (item.quantity <= 0) throw new ValidationError("Quantity must be greater than 0.");
  if (item.link && !/^https?:\/\//i.test(item.link)) {
    throw new ValidationError("Link must start with http:// or https://.");
  }
  return item;
}

export function parseQuoteItems(input: unknown): QuoteItem[] {
  if (!Array.isArray(input)) throw new ValidationError("Items must be a list.");
  return input.map(parseQuoteItem);
}

export function itemTotal(item: QuoteItem): number {
  return Math.round(((item.materials ?? 0) + (item.labor ?? 0)) * item.quantity * 100) / 100;
}

// ---------------------------------------------------------------------------
// Job numbers
// ---------------------------------------------------------------------------

/** YYMM for the current month in the business's local time zone. */
export function jobNumberPrefix(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "2-digit",
    month: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}${get("month")}`;
}

export function nextJobNumber(existingNames: string[], now = new Date()): string {
  const prefix = jobNumberPrefix(now);
  const pattern = new RegExp(`^${prefix}(\\d{2,})$`);
  let max = 0;
  for (const name of existingNames) {
    const match = pattern.exec(name.trim());
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `${prefix}${String(max + 1).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Row builders
// ---------------------------------------------------------------------------

function detailValue(details: JobDetails, key: keyof JobDetails): CellValue {
  const value = details[key];
  if (key === "sqft" && value) {
    const n = Number(value.replace(/,/g, ""));
    return Number.isFinite(n) ? n : value;
  }
  return value;
}

function itemRow(item: QuoteItem, row: number): CellValue[] {
  return [
    item.item,
    item.materials,
    item.labor,
    item.quantity,
    `=(B${row}+C${row})*D${row}`,
    item.includes,
    item.link,
  ];
}

/** SUM of every Item Total above this row; the INDEX bounds survive row inserts and deletes. */
const subtotalRow = (): CellValue[] => [SUBTOTAL_LABEL, null, null, null, "=SUM(INDEX(E:E,2):INDEX(E:E,ROW()-1))"];

/** Subtotal plus any adjustment rows a person inserts between it and the Total row. */
const totalRow = (subtotalRowNumber: number): CellValue[] => [
  TOTAL_LABEL,
  null,
  null,
  null,
  `=SUM(E${subtotalRowNumber}:INDEX(E:E,ROW()-1))`,
];

function summaryFor(file: DriveFile): JobSummary {
  return {
    id: file.id,
    jobNumber: file.name,
    customerName: file.appProperties?.customerName ?? "",
    jobAddress: file.appProperties?.jobAddress ?? "",
    url: file.webViewLink ?? spreadsheetUrl(file.id),
    modifiedTime: file.modifiedTime ?? null,
  };
}

// ---------------------------------------------------------------------------
// Operations
// ---------------------------------------------------------------------------

export async function listJobs(): Promise<JobSummary[]> {
  const { folderId } = getGoogleConfig();
  const files = await listSpreadsheetsInFolder(folderId);
  return files.map(summaryFor);
}

export async function createJob(details: JobDetails, items: QuoteItem[]): Promise<JobSummary> {
  const { folderId } = getGoogleConfig();
  const existing = await listSpreadsheetsInFolder(folderId);
  let jobNumber = nextJobNumber(existing.map((f) => f.name));

  const file = await createSpreadsheetFile(jobNumber, folderId, {
    customerName: details.name,
    jobAddress: details.jobAddress,
  });

  // Two people creating jobs at the same moment can pick the same number; the later file yields.
  const after = await listSpreadsheetsInFolder(folderId);
  const rivals = after.filter((f) => f.name === jobNumber && f.id !== file.id);
  if (rivals.some((f) => (f.createdTime ?? "") <= (file.createdTime ?? "\uffff"))) {
    jobNumber = nextJobNumber(after.map((f) => f.name));
    await updateDriveFile(file.id, { name: jobNumber });
  }

  const [defaultSheet] = await getSheetProperties(file.id);
  // Pick an explicit id for the new tab so we don't need to read it back after creation.
  const QUOTE_SHEET_ID = defaultSheet.sheetId === 1 ? 2 : 1;

  await batchUpdateSpreadsheet(file.id, [
    {
      updateSheetProperties: {
        properties: { sheetId: defaultSheet.sheetId, title: DETAILS_TAB },
        fields: "title",
      },
    },
    {
      addSheet: {
        properties: {
          sheetId: QUOTE_SHEET_ID,
          title: QUOTE_TAB,
          index: 1,
          gridProperties: { frozenRowCount: 1 },
        },
      },
    },
    // Job Details: bold labels, readable column widths.
    {
      repeatCell: {
        range: { sheetId: defaultSheet.sheetId, startColumnIndex: 0, endColumnIndex: 1 },
        cell: { userEnteredFormat: { textFormat: { bold: true } } },
        fields: "userEnteredFormat.textFormat.bold",
      },
    },
    {
      updateDimensionProperties: {
        range: { sheetId: defaultSheet.sheetId, dimension: "COLUMNS", startIndex: 0, endIndex: 1 },
        properties: { pixelSize: 160 },
        fields: "pixelSize",
      },
    },
    {
      updateDimensionProperties: {
        range: { sheetId: defaultSheet.sheetId, dimension: "COLUMNS", startIndex: 1, endIndex: 2 },
        properties: { pixelSize: 360 },
        fields: "pixelSize",
      },
    },
    // ItemizedQuote: bold header, currency formats on Materials/Labor/Item Total.
    {
      repeatCell: {
        range: { sheetId: QUOTE_SHEET_ID, startRowIndex: 0, endRowIndex: 1 },
        cell: { userEnteredFormat: { textFormat: { bold: true } } },
        fields: "userEnteredFormat.textFormat.bold",
      },
    },
    {
      repeatCell: {
        range: { sheetId: QUOTE_SHEET_ID, startRowIndex: 1, startColumnIndex: 1, endColumnIndex: 3 },
        cell: { userEnteredFormat: { numberFormat: { type: "CURRENCY", pattern: MONEY_FORMAT } } },
        fields: "userEnteredFormat.numberFormat",
      },
    },
    {
      repeatCell: {
        range: { sheetId: QUOTE_SHEET_ID, startRowIndex: 1, startColumnIndex: 4, endColumnIndex: 5 },
        cell: { userEnteredFormat: { numberFormat: { type: "CURRENCY", pattern: MONEY_FORMAT } } },
        fields: "userEnteredFormat.numberFormat",
      },
    },
    {
      updateDimensionProperties: {
        range: { sheetId: QUOTE_SHEET_ID, dimension: "COLUMNS", startIndex: 0, endIndex: 1 },
        properties: { pixelSize: 260 },
        fields: "pixelSize",
      },
    },
    {
      updateDimensionProperties: {
        range: { sheetId: QUOTE_SHEET_ID, dimension: "COLUMNS", startIndex: 5, endIndex: 7 },
        properties: { pixelSize: 300 },
        fields: "pixelSize",
      },
    },
  ]);

  const detailValues = DETAIL_ROWS.map(({ label, key }) => [label, detailValue(details, key)]);
  const quoteValues: CellValue[][] = [QUOTE_HEADERS];
  items.forEach((item, i) => quoteValues.push(itemRow(item, i + 2)));
  const subtotalRowNumber = items.length + 2;
  quoteValues.push(subtotalRow(), totalRow(subtotalRowNumber));

  await batchUpdateValues(file.id, [
    { range: `'${DETAILS_TAB}'!A1:B${detailValues.length}`, values: detailValues },
    { range: `'${QUOTE_TAB}'!A1:G${quoteValues.length}`, values: quoteValues },
  ]);

  return summaryFor({ ...file, name: jobNumber });
}

export async function getJob(id: string): Promise<Job> {
  let file: DriveFile;
  try {
    file = await getDriveFile(id);
  } catch (error) {
    if (error instanceof Error && "status" in error && (error as { status: number }).status === 404) {
      throw new NotFoundError("That job spreadsheet no longer exists.");
    }
    throw error;
  }

  const [detailRows, quoteRows] = await batchGetValues(id, [`'${DETAILS_TAB}'!A1:B50`, `'${QUOTE_TAB}'!A1:G`]);

  const byLabel = new Map<string, CellValue>();
  for (const [label, value] of detailRows) {
    if (normalize(label)) byLabel.set(normalize(label), value ?? "");
  }
  const text = (key: string) => String(byLabel.get(key) ?? "").trim();
  const details: JobDetails = {
    name: text("name"),
    phone: text("phone"),
    email: text("email"),
    mailingAddress: text("mailingaddress"),
    jobAddress: text("address") || text("jobaddress"),
    sqft: text("sqft"),
  };

  const header = (quoteRows[0] ?? []).map(normalize);
  const col = (key: string, fallback: number) => {
    const i = header.indexOf(key);
    return i >= 0 ? i : fallback;
  };
  const cItem = col("item", 0);
  const cMaterials = col("materials", 1);
  const cLabor = col("labor", 2);
  const cNumber = col("number", 3);
  const cTotal = col("itemtotal", 4);
  const cIncludes = col("includes", 5);
  const cLink = col("link", 6);
  const num = (value: CellValue | undefined): number | null =>
    typeof value === "number" && Number.isFinite(value) ? value : null;
  const cell = (row: CellValue[], i: number) => String(row[i] ?? "").trim();

  const items: QuoteItemRow[] = [];
  let subtotal: number | null = null;
  let total: number | null = null;
  let pastItems = false;
  quoteRows.slice(1).forEach((row, index) => {
    const label = cell(row, cItem);
    if (!label) return;
    if (isSubtotalLabel(label)) {
      pastItems = true;
      subtotal = num(row[cTotal]);
      return;
    }
    if (normalize(label) === "total") {
      pastItems = true;
      total = num(row[cTotal]);
      return;
    }
    if (pastItems) return; // adjustments / deposit rows are managed in the sheet itself
    items.push({
      row: index + 2,
      item: label,
      materials: num(row[cMaterials]),
      labor: num(row[cLabor]),
      quantity: num(row[cNumber]) ?? 1,
      total: num(row[cTotal]),
      includes: cell(row, cIncludes),
      link: cell(row, cLink),
    });
  });

  return { ...summaryFor(file), details, items, subtotal, total };
}

export async function updateJobDetails(id: string, details: JobDetails): Promise<void> {
  // Update values in place so any extra rows someone added to the tab survive.
  const [existing] = await batchGetValues(id, [`'${DETAILS_TAB}'!A1:B50`]);
  const rowFor = new Map<string, number>();
  existing.forEach((row, i) => {
    const key = normalize(row[0]);
    if (key && !rowFor.has(key)) rowFor.set(key, i + 1);
  });
  // Older sheets may use "Job Address" instead of "Address".
  if (!rowFor.has("address") && rowFor.has("jobaddress")) rowFor.set("address", rowFor.get("jobaddress")!);

  let nextFreeRow = existing.length + 1;
  const data: { range: string; values: CellValue[][] }[] = [];
  for (const { label, key } of DETAIL_ROWS) {
    const row = rowFor.get(normalize(label)) ?? nextFreeRow++;
    data.push({ range: `'${DETAILS_TAB}'!A${row}:B${row}`, values: [[label, detailValue(details, key)]] });
  }

  await Promise.all([
    batchUpdateValues(id, data),
    updateDriveFile(id, { appProperties: { customerName: details.name, jobAddress: details.jobAddress } }),
  ]);
}

async function quoteSheetId(id: string): Promise<number> {
  const sheets = await getSheetProperties(id);
  const sheet = sheets.find((s) => normalize(s.title) === normalize(QUOTE_TAB));
  if (!sheet) throw new NotFoundError(`This spreadsheet has no "${QUOTE_TAB}" tab.`);
  return sheet.sheetId;
}

export async function addItem(id: string, item: QuoteItem): Promise<QuoteItemRow> {
  const [sheetId, [labels]] = await Promise.all([quoteSheetId(id), batchGetValues(id, [`'${QUOTE_TAB}'!A1:A`])]);

  let insertAt = labels.findIndex((row, i) => i > 0 && isSubtotalLabel(row[0])) + 1; // 1-based
  if (insertAt === 0) {
    // No summary rows yet (hand-made sheet): append the item, then the summary rows below it.
    const lastRow = Math.max(labels.length, 1);
    insertAt = lastRow + 1;
    await batchUpdateValues(id, [
      {
        range: `'${QUOTE_TAB}'!A${insertAt}:G${insertAt + 2}`,
        values: [itemRow(item, insertAt), subtotalRow(), totalRow(insertAt + 1)],
      },
    ]);
    return { ...item, row: insertAt, total: itemTotal(item) };
  }

  await batchUpdateSpreadsheet(id, [
    {
      insertDimension: {
        range: { sheetId, dimension: "ROWS", startIndex: insertAt - 1, endIndex: insertAt },
        inheritFromBefore: insertAt > 2,
      },
    },
  ]);
  await batchUpdateValues(id, [{ range: `'${QUOTE_TAB}'!A${insertAt}:G${insertAt}`, values: [itemRow(item, insertAt)] }]);
  return { ...item, row: insertAt, total: itemTotal(item) };
}

export async function deleteItem(id: string, row: number, expectedItem: string): Promise<void> {
  if (!Number.isInteger(row) || row < 2) throw new ValidationError("Invalid row.");
  const [sheetId, [cells]] = await Promise.all([
    quoteSheetId(id),
    batchGetValues(id, [`'${QUOTE_TAB}'!A${row}:A${row}`]),
  ]);
  const actual = String(cells[0]?.[0] ?? "").trim();
  if (normalize(actual) !== normalize(expectedItem)) {
    throw new ValidationError(
      `Row ${row} now contains "${actual || "(blank)"}" instead of "${expectedItem}". ` +
        "The sheet changed since this page loaded; refresh and try again.",
    );
  }
  if (isSubtotalLabel(actual) || normalize(actual) === "total") {
    throw new ValidationError("Summary rows can't be deleted from here.");
  }
  await batchUpdateSpreadsheet(id, [
    { deleteDimension: { range: { sheetId, dimension: "ROWS", startIndex: row - 1, endIndex: row } } },
  ]);
}
