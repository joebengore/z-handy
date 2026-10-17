#!/usr/bin/env node
/**
 * One-time helper: signs in to the business Google account and prints the
 * GOOGLE_REFRESH_TOKEN for Vercel. See ADMIN_SETUP.md.
 *
 * Usage:
 *   GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... npm run google:auth
 *   npm run google:auth -- --create-folder     # also creates a "Z-Handyman Jobs" Drive folder
 *
 * If the env vars are not set you will be prompted for them. Requires an OAuth
 * client of type "Desktop app" (loopback redirect, no redirect URI setup needed).
 */
import http from "node:http";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { exec } from "node:child_process";

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive",
];

const createFolder = process.argv.includes("--create-folder");

async function ask(question, fallback) {
  if (fallback) return fallback;
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const answer = (await rl.question(question)).trim();
  rl.close();
  if (!answer) {
    console.error("A value is required.");
    process.exit(1);
  }
  return answer;
}

function openBrowser(url) {
  const command =
    process.platform === "win32" ? `start "" "${url}"` : process.platform === "darwin" ? `open "${url}"` : `xdg-open "${url}"`;
  exec(command, () => {});
}

const clientId = await ask("Google OAuth client ID: ", process.env.GOOGLE_CLIENT_ID);
const clientSecret = await ask("Google OAuth client secret: ", process.env.GOOGLE_CLIENT_SECRET);

const server = http.createServer();
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();
const redirectUri = `http://127.0.0.1:${port}/callback`;

const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
authUrl.search = new URLSearchParams({
  client_id: clientId,
  redirect_uri: redirectUri,
  response_type: "code",
  scope: SCOPES.join(" "),
  access_type: "offline",
  // select_account forces the account chooser so the wrong signed-in Gmail isn't picked silently.
  prompt: "consent select_account",
  login_hint: "pro.zhandyman@gmail.com",
}).toString();

console.log("\nOpening Google sign-in in your browser. Sign in as pro.zhandyman@gmail.com (the account that owns the Drive folder).");
console.log("If it doesn't open, visit:\n\n" + authUrl + "\n");
openBrowser(authUrl.toString());

const code = await new Promise((resolve, reject) => {
  server.on("request", (req, res) => {
    const url = new URL(req.url, redirectUri);
    if (url.pathname !== "/callback") {
      res.writeHead(404).end();
      return;
    }
    const error = url.searchParams.get("error");
    const code = url.searchParams.get("code");
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(
      error
        ? `<p>Sign-in failed: ${error}. You can close this tab.</p>`
        : "<p>Signed in. You can close this tab and return to the terminal.</p>",
    );
    server.close();
    if (error || !code) reject(new Error(error || "No authorization code returned."));
    else resolve(code);
  });
});

const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  }),
});
const tokens = await tokenRes.json();
if (!tokenRes.ok || !tokens.refresh_token) {
  console.error("Token exchange failed:", tokens);
  console.error(
    "\nIf there is no refresh_token, revoke the app at https://myaccount.google.com/permissions and run this again.",
  );
  process.exit(1);
}

let folderId = "";
if (createFolder) {
  const folderRes = await fetch("https://www.googleapis.com/drive/v3/files?fields=id,name", {
    method: "POST",
    headers: { Authorization: `Bearer ${tokens.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Z-Handyman Jobs", mimeType: "application/vnd.google-apps.folder" }),
  });
  const folder = await folderRes.json();
  if (!folderRes.ok) {
    console.error("Could not create the Drive folder:", folder);
  } else {
    folderId = folder.id;
    console.log(`\nCreated Drive folder "${folder.name}" (https://drive.google.com/drive/folders/${folder.id})`);
  }
}

console.log("\nAdd these environment variables in Vercel (Project → Settings → Environment Variables):\n");
console.log(`GOOGLE_CLIENT_ID=${clientId}`);
console.log(`GOOGLE_CLIENT_SECRET=${clientSecret}`);
console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
console.log(`GOOGLE_DRIVE_FOLDER_ID=${folderId || "<ID from the Drive folder URL>"}`);
console.log("ADMIN_PASSWORD=<choose a strong shared password>");
console.log("\nKeep these secret. The refresh token grants access to the account's Drive and Sheets.");
