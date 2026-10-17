# Admin section (`/admin`)

`z-handy.com/admin` is a password-protected tool for creating and editing job spreadsheets in Google Drive. Each job is one Google Sheet named by job number (`YYMM##`, e.g. `261001` is the first job of October 2026) with the `Job Details` and `ItemizedQuote` tabs that the Apps Script in the master sheet imports to generate the quote and contract.

There is no separate database: Google Sheets is the source of truth, and the admin UI reads and writes it through the Sheets and Drive REST APIs.

## Pages

| Route | Purpose |
|---|---|
| `/admin` | Choose **New job** or **Existing jobs** |
| `/admin/new` | Step 1 basic info → Step 2 itemized quote → creates the spreadsheet |
| `/admin/jobs` | Jobs in the Drive folder, newest first, with links to the sheets |
| `/admin/jobs/<id>` | View a job; edit basic info; add or delete quote items |
| `/admin/login` | Shared-password sign-in (30-day cookie) |

## Environment variables (Vercel → Project → Settings → Environment Variables)

| Variable | Description |
|---|---|
| `ADMIN_PASSWORD` | Shared password for `/admin`. Changing it signs everyone out. |
| `GOOGLE_CLIENT_ID` | OAuth client ID from Google Cloud |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret |
| `GOOGLE_REFRESH_TOKEN` | Long-lived token for `pro.zhandyman@gmail.com` (from `npm run google:auth`) |
| `GOOGLE_DRIVE_FOLDER_ID` | Drive folder that holds the job spreadsheets (the ID from the folder URL) |

For local development put the same variables in `.env.local` (gitignored).

## One-time Google setup

The server acts **as `pro.zhandyman@gmail.com`** through OAuth. This is a regular personal Gmail account; Google Workspace is **not** required. (Service accounts can no longer create files in a normal My Drive, so they aren't used.) Subcontractors never sign in to Google — they only use `ADMIN_PASSWORD`.

Do all of the following while signed in to Google as `pro.zhandyman@gmail.com`.

1. Go to <https://console.cloud.google.com/>, create a project (e.g. `z-handy-admin`). A personal Gmail can do this for free; no billing needed.
2. **APIs & Services → Library**: search for and enable **Google Sheets API** and **Google Drive API**.
3. **APIs & Services → OAuth consent screen** (Google may call this "Google Auth Platform → Branding/Audience"):
   - User type: **External** (the only option for a personal Gmail).
   - App name `Z-Handyman Admin`, user support email and developer contact `pro.zhandyman@gmail.com`. Scopes can be left empty.
   - Under **Audience / Test users**, add `pro.zhandyman@gmail.com`.
   - Then click **Publish app** so the status is **In production**. If it stays in *Testing*, the refresh token expires after 7 days and the admin stops working. Publishing does not require Google verification for your own use; you'll just see a "Google hasn't verified this app" screen once during sign-in — click **Advanced → Go to Z-Handyman Admin (unsafe)**.
4. **APIs & Services → Credentials → Create credentials → OAuth client ID**, application type **Desktop app**, name `z-handy admin cli`. Copy the client ID and client secret.
5. In this repo run:

   ```bash
   npm run google:auth                     # prompts for client ID/secret, opens the browser
   npm run google:auth -- --create-folder  # same, and also creates a "Z-Handyman Jobs" Drive folder
   ```

   Sign in as `pro.zhandyman@gmail.com`, approve access, and the script prints the values for all the `GOOGLE_*` variables. If you already have a Drive folder for job sheets, skip `--create-folder` and copy the folder ID from its URL (`https://drive.google.com/drive/folders/<ID>`).
6. Add the variables (plus `ADMIN_PASSWORD`) in Vercel and redeploy.

If the refresh token is ever revoked (password change with sessions reset, removing the app at <https://myaccount.google.com/permissions>), run `npm run google:auth` again and update `GOOGLE_REFRESH_TOKEN`.

## Spreadsheet layout the admin creates

**Job Details** tab (label in A, value in B): `Name`, `Phone`, `Email`, `Mailing Address`, `Address` (the job address), `Sq Ft`.

**ItemizedQuote** tab:

| Item | Materials | Labor | Number | Item Total | Includes | Link |
|---|---|---|---|---|---|---|
| *one row per item* | $ | $ | qty | `=(B+C)*D` | notes | URL |
| Total Before Discounts | | | | `=SUM(…)` of the item totals | | |
| Total | | | | `=SUM(…)` of the subtotal and any rows between | | |

Adjustments (discounts, fees), deposit, and balance rows are not created by the admin tool. Insert them between **Total Before Discounts** and **Total** in the sheet, or let the Apps Script add them; the Total formula picks up anything placed between those two rows.

Adding an item from the admin inserts a row above **Total Before Discounts**, so formulas keep working. Deleting removes that row. The admin never touches rows below the subtotal.

## Security notes

- The password cookie is an HMAC derived from `ADMIN_PASSWORD`; it's `HttpOnly`, `SameSite=Lax`, and `Secure` in production.
- `/admin/*` and `/api/admin/*` are gated in `middleware.ts`. Admin pages are marked `noindex`.
- The refresh token grants full Drive and Sheets access for `pro.zhandyman@gmail.com`. Keep it only in Vercel's environment variables (and your local `.env.local`). Never commit it or paste it in chat.
