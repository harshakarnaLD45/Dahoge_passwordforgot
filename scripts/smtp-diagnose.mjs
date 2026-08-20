// Diagnose: prüft server/.env auf versteckte Zeichen und testet die
// Gmail-SMTP-Zugangsdaten direkt mit Nodemailer (mehrere Konfig-Varianten).
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const nodemailer = require("nodemailer");

const envPath = path.join(import.meta.dirname, "..", "server", ".env");
const raw = fs.readFileSync(envPath, "utf8");

// 1) Zeilenweise analysieren: Wert exakt mit Zeichencodes anzeigen.
for (const line of raw.split(/\r?\n/)) {
  if (!line || line.trim().startsWith("#")) continue;
  const eq = line.indexOf("=");
  if (eq < 0) continue;
  const key = line.slice(0, eq);
  const val = line.slice(eq + 1);
  const codes = [...val].map((c) => c.charCodeAt(0));
  console.log(
    `${key}=${JSON.stringify(val)}  chars:[${codes.join(",")}]` +
      (codes.some((c) => c === 32 || c === 9 || c === 13) ? "  <-- ENTHÄLT LEERZEICHEN/CR!" : ""),
  );
}

// 2) SMTP-Login mit verschiedenen Varianten testen.
const user = process.env.EMAIL_USER || raw.match(/^EMAIL_USER=(.+)$/m)?.[1]?.trim();
const passRaw = raw.match(/^EMAIL_PASS=(.+)$/m)?.[1];
const pass = passRaw?.trim();
const passUntrimmed = passRaw;

async function tryLogin(name, config) {
  const tr = nodemailer.createTransport(config);
  try {
    await tr.verify();
    console.log(`OK   - ${name}: Anmeldung erfolgreich`);
    return true;
  } catch (err) {
    console.log(`FAIL - ${name}: ${String(err.message).split("\n")[0]}`);
    return false;
  }
}

(async () => {
  console.log("\n-- SMTP-Login-Tests (Gmail) --");
  const results = [];
  results.push(
    await tryLogin("587 STARTTLS, Passwort exakt", {
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user, pass: passUntrimmed },
    }),
  );
  results.push(
    await tryLogin("587 STARTTLS, Passwort getrimmt", {
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user, pass },
    }),
  );
  results.push(
    await tryLogin("465 SSL, Passwort getrimmt", {
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass },
    }),
  );
  if (results.every((r) => !r)) {
    console.log("\n=> Gmail lehnt die Zugangsdaten in ALLEN Varianten ab.");
    console.log("   Ursache ist die App-Passwort-Zeile in server/.env (abgelaufen/geändert).");
    console.log("   Neues erzeugen: https://myaccount.google.com/apppasswords (2FA muss an sein).");
  }
})();
