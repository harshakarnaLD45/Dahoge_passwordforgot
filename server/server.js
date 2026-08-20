// SMTP and production web server for the Mischtisch platform.
//
// This server:
//
// 1. Sends booking emails.
// 2. Sends registration emails.
// 3. Serves the React production build.
// 4. Supports React Router routes through an SPA fallback.
//
// React and the API can therefore run under one domain:
//
// https://your-domain.com/
// https://your-domain.com/api/send-email
// https://your-domain.com/api/send-registration-emails

const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

// -----------------------------------------------------------------------------
// Environment configuration
// -----------------------------------------------------------------------------

const ENV_PATH = path.resolve(__dirname, ".env");

const envResult = require("dotenv").config({
  path: ENV_PATH,
  override: true,
});

console.log("Environment file:", ENV_PATH);
console.log(
  "Environment file exists:",
  fsSync.existsSync(ENV_PATH),
);
console.log(
  "Environment loaded:",
  !envResult.error,
);
console.log(
  "EMAIL_USER configured:",
  Boolean(process.env.EMAIL_USER),
);
console.log(
  "EMAIL_PASS configured:",
  Boolean(process.env.EMAIL_PASS),
);

if (envResult.error) {
  console.error(
    "Environment loading error:",
    envResult.error.message,
  );
}

// -----------------------------------------------------------------------------
// Express configuration
// -----------------------------------------------------------------------------

const app = express();

app.disable("x-powered-by");

app.use(
  express.json({
    limit: "1mb",
  }),
);

// CORS is only required when the React development server runs on port 3000.
// In production, React and Node.js use the same domain.
if (process.env.NODE_ENV !== "production") {
  const DEV_PORTS = [3000, 3002, 5000, 5001, 5002];

  app.use(
    cors({
      origin: DEV_PORTS.map(
        (port) => `http://localhost:${port}`,
      ),
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type"],
    }),
  );
}

// -----------------------------------------------------------------------------
// SMTP configuration
// -----------------------------------------------------------------------------

const SMTP_HOST =
  process.env.SMTP_HOST || "smtp.gmail.com";

const SMTP_PORT = Number(
  process.env.SMTP_PORT || 465,
);

const secureRaw =
  String(process.env.SMTP_SECURE || "")
    .toLowerCase() === "true";

const SMTP_SECURE =
  SMTP_PORT === 465
    ? true
    : SMTP_PORT === 587
      ? false
      : secureRaw;

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const EMAIL_FROM =
  process.env.EMAIL_FROM || EMAIL_USER;

const REGISTRATION_REVIEW_EMAIL =
  process.env.REGISTRATION_REVIEW_EMAIL;

const MAINCOMPANY_EMAIL =
  process.env.MAINCOMPANY_EMAIL;

const VERIFICATION_TEAM_NAME =
  process.env.VERIFICATION_TEAM_NAME ||
  "Prüfteam Mischtisch Sachsen";

const TEMPLATE_DIR = path.resolve(
  __dirname,
  "..",
  "public",
  "mailtempletes",
);

const BUILD_DIR = path.resolve(
  __dirname,
  "..",
  "build",
);

const BUILD_INDEX = path.join(
  BUILD_DIR,
  "index.html",
);

let transporter = null;
let smtpError = null;

// -----------------------------------------------------------------------------
// Utility functions
// -----------------------------------------------------------------------------

function isEmail(value) {
  return (
    typeof value === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  );
}

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

async function renderHtmlTemplate(
  fileName,
  values,
) {
  const templatePath = path.join(
    TEMPLATE_DIR,
    fileName,
  );

  const source = await fs.readFile(
    templatePath,
    "utf8",
  );

  return source.replace(
    /\{\{?(\w+)\}\}?/g,
    (match, name) =>
      Object.prototype.hasOwnProperty.call(
        values,
        name,
      )
        ? escapeHtml(values[name])
        : "",
  );
}

function deliveryResult(
  type,
  recipient,
  result,
  skippedError,
) {
  if (
    result.status === "fulfilled" &&
    result.value
  ) {
    return {
      type,
      recipient,
      success: true,
      messageId: result.value.messageId,
    };
  }

  if (result.status === "fulfilled") {
    return {
      type,
      recipient: recipient || null,
      success: false,
      error:
        skippedError ||
        "E-Mail wurde nicht versendet",
    };
  }

  return {
    type,
    recipient: recipient || null,
    success: false,
    error:
      result.reason?.message ||
      String(result.reason),
  };
}

// -----------------------------------------------------------------------------
// Firebase Admin — temporary password for the forgot-password flow
// -----------------------------------------------------------------------------

// The Firebase client SDK cannot change the password of a user that is not
// signed in. The temporary-password flow therefore runs here, server-side,
// with the Admin SDK. Credentials come from FIREBASE_SERVICE_ACCOUNT_BASE64
// (base64-encoded JSON), GOOGLE_APPLICATION_CREDENTIALS or the file
// server/service-account.json.

const FIREBASE_SERVICE_ACCOUNT_BASE64 =
  process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || "";

const SERVICE_ACCOUNT_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.resolve(__dirname, "service-account.json");

let admin = null;
let adminError = null;

function getFirebaseAdmin() {
  if (admin) return admin;
  if (adminError) return null;

  try {
    let credentials = null;

    if (FIREBASE_SERVICE_ACCOUNT_BASE64) {
      credentials = JSON.parse(
        Buffer.from(
          FIREBASE_SERVICE_ACCOUNT_BASE64,
          "base64",
        ).toString("utf8"),
      );
    } else if (fsSync.existsSync(SERVICE_ACCOUNT_PATH)) {
      credentials = JSON.parse(
        fsSync.readFileSync(SERVICE_ACCOUNT_PATH, "utf8"),
      );
    }

    if (!credentials) {
      adminError =
        "Firebase-Servicekonto fehlt: " +
        "FIREBASE_SERVICE_ACCOUNT_BASE64 setzen oder " +
        "server/service-account.json hinterlegen";
      return null;
    }

    // Guard: the service account must belong to the same project as the
    // client app. A key from another project fails every Admin SDK call
    // with "insufficient permission" — surface that at startup instead of
    // as cryptic runtime errors.
    const appProject =
      process.env.REACT_APP_FIREBASE_PROJECT_ID || "";
    if (
      appProject &&
      credentials.project_id &&
      credentials.project_id !== appProject
    ) {
      adminError =
        `Servicekonto gehört zu Projekt "${credentials.project_id}", ` +
        `aber die App läuft auf "${appProject}". ` +
        "Bitte in der Firebase-Konsole (mixedtables-101ed → " +
        "Projekteinstellungen → Dienstkonten) einen neuen Schlüssel " +
        "erzeugen und server/service-account.json ersetzen.";
      console.error(`Firebase Admin: ${adminError}`);
      return null;
    }

    admin = require("firebase-admin");

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(credentials),
      });
    }

    return admin;
  } catch (error) {
    adminError = error.message;
    return null;
  }
}

async function setupTransporter() {
  if (!EMAIL_USER || !EMAIL_PASS) {
    smtpError =
      "EMAIL_USER und EMAIL_PASS fehlen";

    console.error(`SMTP: ${smtpError}`);
    return;
  }

  const candidate =
    nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

  try {
    await candidate.verify();

    transporter = candidate;
    smtpError = null;

    console.log(
      `SMTP ok: ${SMTP_HOST}:${SMTP_PORT} (${EMAIL_USER})`,
    );
  } catch (error) {
    transporter = null;
    smtpError = error.message;

    console.error(
      `SMTP error: ${smtpError}`,
    );
  }
}

// -----------------------------------------------------------------------------
// Health endpoint
// -----------------------------------------------------------------------------

app.get("/api/email-health", (req, res) => {
  return res
    .status(transporter ? 200 : 503)
    .json({
      success: Boolean(transporter),
      smtpHost: SMTP_HOST,
      smtpPort: SMTP_PORT,
      smtpSecure: SMTP_SECURE,
      reviewEmailConfigured: isEmail(
        REGISTRATION_REVIEW_EMAIL,
      ),
      mainCompanyEmailConfigured: isEmail(
        MAINCOMPANY_EMAIL,
      ),
      resetPasswordAvailable: Boolean(
        getFirebaseAdmin(),
      ),
      error: transporter
        ? null
        : smtpError ||
          "SMTP nicht konfiguriert",
    });
});

// -----------------------------------------------------------------------------
// Generic booking/notification email
// -----------------------------------------------------------------------------

app.post(
  "/api/send-email",
  async (req, res) => {
    const {
      to,
      subject,
      text,
      html,
    } = req.body || {};

    if (!isEmail(to)) {
      return res.status(400).json({
        success: false,
        error:
          "to fehlt oder ist ungültig",
      });
    }

    if (!subject || (!text && !html)) {
      return res.status(400).json({
        success: false,
        error:
          "subject sowie text oder html sind Pflicht",
      });
    }

    if (!transporter) {
      return res.status(503).json({
        success: false,
        error:
          smtpError ||
          "SMTP nicht konfiguriert",
      });
    }

    try {
      const info =
        await transporter.sendMail({
          from: EMAIL_FROM,
          to,
          subject,
          text,
          html,
        });

      return res.status(200).json({
        success: true,
        messageId: info.messageId,
      });
    } catch (error) {
      console.error(
        "SMTP sending error:",
        error.message,
      );

      return res.status(500).json({
        success: false,
        error:
          error.message ||
          "E-Mail konnte nicht versendet werden",
      });
    }
  },
);

// -----------------------------------------------------------------------------
// Registration emails
// -----------------------------------------------------------------------------

app.post(
  "/api/send-registration-emails",
  async (req, res) => {
    const {
      hostName,
      companyName,
      email,
      phone,
      street,
      postalCode,
      city,
      venueType,
      region,
      registrationDate,
      regCode,
      accountEmail,
      temporaryPassword,
      credentialsCreatedAt,
    } = req.body || {};

    if (!transporter) {
      return res.status(503).json({
        success: false,
        error:
          smtpError ||
          "SMTP nicht konfiguriert",
      });
    }

    if (!isEmail(email)) {
      return res.status(400).json({
        success: false,
        error:
          "Gastgeber-E-Mail ist ungültig",
      });
    }

    if (
      !isEmail(
        REGISTRATION_REVIEW_EMAIL,
      )
    ) {
      return res.status(503).json({
        success: false,
        error:
          "REGISTRATION_REVIEW_EMAIL fehlt oder ist ungültig",
      });
    }

    if (
      !regCode ||
      typeof regCode !== "string"
    ) {
      return res.status(400).json({
        success: false,
        error: "regCode fehlt",
      });
    }

    try {
      const templateValues = {
        hostName: hostName || "—",
        companyName:
          companyName || "—",
        email,
        phone: phone || "—",
        street: street || "—",
        postalCode:
          postalCode || "—",
        city: city || "—",
        venueType:
          venueType || "—",
        region: region || "—",
        registrationDate:
          registrationDate || "—",

        registrationNumber:
          regCode,

        verificationTeamName:
          VERIFICATION_TEAM_NAME,

        accountEmail:
          accountEmail || email,

        temporaryPassword:
          temporaryPassword || "—",

        credentialsCreatedAt:
          credentialsCreatedAt ||
          registrationDate ||
          "—",
      };

      const [
        hostHtml,
        verificationHtml,
        internalHtml,
      ] = await Promise.all([
        renderHtmlTemplate(
          "01_restaurant_registration_confirmation.html",
          templateValues,
        ),

        renderHtmlTemplate(
          "02_external_verification_request.html",
          templateValues,
        ),

        renderHtmlTemplate(
          "03_internal_generated_credentials.html",
          templateValues,
        ),
      ]);

      const internalMailPromise =
        isEmail(MAINCOMPANY_EMAIL)
          ? transporter.sendMail({
              from: EMAIL_FROM,
              to: MAINCOMPANY_EMAIL,
              replyTo: email,
              subject:
                `Interne Zugangsdaten: ` +
                `${companyName || regCode} — ` +
                `Mischtisch Sachsen`,
              text: [
                `Ein neuer Betrieb wurde registriert: ${
                  companyName || "—"
                }`,
                `Ansprechpartner: ${
                  hostName || "—"
                }`,
                `E-Mail-Adresse des Zugangs: ${
                  accountEmail || email
                }`,
                `Registrierungsnummer: ${regCode}`,
                `Zugang erstellt am: ${
                  credentialsCreatedAt ||
                  registrationDate ||
                  "—"
                }`,
              ].join("\n"),
              html: internalHtml,
            })
          : Promise.resolve(null);

      const [
        hostResult,
        verificationResult,
        internalResult,
      ] = await Promise.allSettled([
        transporter.sendMail({
          from: EMAIL_FROM,
          to: email,
          subject:
            `Ihre Registrierung bei ` +
            `Mischtisch Sachsen — ` +
            `${companyName || regCode}`,
          text: [
            `Guten Tag ${hostName || ""},`,
            "Ihre Registrierung wurde erfolgreich übermittelt.",
            `Registrierungsnummer: ${regCode}`,
            "Ihre Angaben werden nun geprüft.",
          ].join("\n\n"),
          html: hostHtml,
        }),

        transporter.sendMail({
          from: EMAIL_FROM,
          to: REGISTRATION_REVIEW_EMAIL,
          replyTo: email,
          subject:
            `Prüfauftrag: Neue Betriebsregistrierung — ` +
            `${companyName || regCode}`,
          text: [
            "Eine neue Betriebsregistrierung wurde eingereicht.",
            `Betrieb: ${companyName || "—"}`,
            `Ansprechpartner: ${hostName || "—"}`,
            `E-Mail: ${email}`,
            `Registrierungsnummer: ${regCode}`,
          ].join("\n"),
          html: verificationHtml,
        }),

        internalMailPromise,
      ]);

      const hostEmail =
        deliveryResult(
          "host",
          email,
          hostResult,
        );

      const verificationEmail =
        deliveryResult(
          "verification",
          REGISTRATION_REVIEW_EMAIL,
          verificationResult,
        );

      const internalEmail =
        deliveryResult(
          "internal",
          MAINCOMPANY_EMAIL,
          internalResult,
          "MAINCOMPANY_EMAIL nicht konfiguriert",
        );

      const success =
        hostEmail.success &&
        verificationEmail.success &&
        internalEmail.success;

      const allFailed =
        !hostEmail.success &&
        !verificationEmail.success &&
        !internalEmail.success;

      console.log(
        "Registration email result:",
        {
          regCode,
          host: hostEmail.success,
          verification:
            verificationEmail.success,
          internal:
            internalEmail.success,
        },
      );

      return res
        .status(
          success
            ? 200
            : allFailed
              ? 500
              : 207,
        )
        .json({
          success,
          regCode,
          hostEmail,
          verificationEmail,
          internalEmail,
        });
    } catch (error) {
      console.error(
        "Registration email error:",
        error.message,
      );

      return res.status(500).json({
        success: false,
        error:
          error.message ||
          "Registrierungs-E-Mails konnten nicht versendet werden",
      });
    }
  },
);

// -----------------------------------------------------------------------------
// Shared helpers — registration status lookup
// -----------------------------------------------------------------------------

// Looks up the registration status for an email across hostProfiles and
// venues. Returns "pending", "active" or null (not found).
//
// Priority: 1. hostProfiles by UID (direct doc get — no composite index,
// matching the reference Admin SDK pattern), 2. hostProfiles by email
// (fallback when the Auth lookup is unavailable, e.g. limited service
// account permissions), 3. venues by email (legacy fallback for older
// documents). hostProfiles is the authoritative source — the manual
// activation (activateRegistration) writes both documents in sync, and a
// venue-only lookup must never mask a "pending" host profile.
async function lookupRegistrationStatus(adminClient, uid, email) {
  const normalizedEmail = email.trim().toLowerCase();
  console.log(
    "[check-registration] looking up:", normalizedEmail,
  );

  if (uid) {
    const profileSnap = await adminClient
      .firestore()
      .collection("hostProfiles")
      .doc(uid)
      .get();

    if (profileSnap.exists) {
      const data = profileSnap.data();
      const status = data.registrationStatus || null;
      console.log(
        "[check-registration] found in hostProfiles (by uid):",
        "uid:", uid,
        "registrationStatus:", status,
        "docKeys:", Object.keys(data),
      );
      return status;
    }
  }

  const profilesSnap = await adminClient
    .firestore()
    .collection("hostProfiles")
    .where("email", "==", normalizedEmail)
    .limit(1)
    .get();

  if (!profilesSnap.empty) {
    const doc = profilesSnap.docs[0];
    const data = doc.data();
    const status = data.registrationStatus || null;
    console.log(
      "[check-registration] found in hostProfiles (by email):",
      "docId:", doc.id,
      "registrationStatus:", status,
      "docKeys:", Object.keys(data),
    );
    return status;
  }

  console.log("[check-registration] not found in hostProfiles, trying venues");

  const venuesSnap = await adminClient
    .firestore()
    .collection("venues")
    .where("email", "==", normalizedEmail)
    .limit(1)
    .get();

  if (!venuesSnap.empty) {
    const doc = venuesSnap.docs[0];
    const data = doc.data();
    const status = data.registrationStatus || null;
    console.log(
      "[check-registration] found in venues:",
      "docId:", doc.id,
      "registrationStatus:", status,
      "docKeys:", Object.keys(data),
    );
    return status;
  }

  console.log("[check-registration] email not found in any collection");
  return null;
}

// -----------------------------------------------------------------------------
// Pre-submit registration check — enables/disables the "Send reset link"
// button based on whether the email belongs to an active registration.
// -----------------------------------------------------------------------------

app.post("/api/check-registration", async (req, res) => {
  const { email } = req.body || {};

  if (!isEmail(email)) {
    return res.status(400).json({
      success: false,
      status: "invalid",
      code: "auth/invalid-email",
      error: "E-Mail-Adresse ist ungültig",
    });
  }

  const adminClient = getFirebaseAdmin();

  if (!adminClient) {
    return res.status(503).json({
      success: false,
      status: "unavailable",
      error: adminError || "Firebase Admin nicht konfiguriert",
    });
  }

  try {
    // Resolve the Auth user first so hostProfiles can be read directly by
    // UID. A missing Auth account — or an Auth backend the service account
    // cannot reach — falls through to the email-based queries below.
    let uid = null;
    try {
      const userRecord = await adminClient
        .auth()
        .getUserByEmail(email.trim().toLowerCase());
      uid = userRecord.uid;
    } catch (error) {
      if (error.code !== "auth/user-not-found") {
        console.warn(
          "[check-registration] Auth lookup unavailable, using email queries:",
          error.message,
        );
      }
    }

    const status = await lookupRegistrationStatus(adminClient, uid, email);

    if (status === "active") {
      return res.json({ success: true, status: "active" });
    }

    if (status === "pending") {
      return res.json({ success: true, status: "pending" });
    }

    // Email not found in either collection.
    return res.json({ success: true, status: "not_found" });
  } catch (error) {
    console.error("Registration check error:", error.message);
    return res.status(500).json({
      success: false,
      status: "error",
      error: error.message || "Prüfung fehlgeschlagen",
    });
  }
});

// -----------------------------------------------------------------------------
// Forgot-password flow (reset link)
// -----------------------------------------------------------------------------

// 1. Look up the user in Firebase Authentication, 2. generate a password
// reset link via the Admin SDK and return it. The client SDK cannot create
// the reset link by itself — the public REST API refuses returnOobLink for
// API-key-only callers. Email delivery (07_reset_link_de.html) runs on the
// client via EmailJS (main channel) with the SMTP.js fallback, so only the
// link is returned here — this endpoint does not depend on the SMTP
// transporter. The user chooses the new password after clicking the link.
app.post(
  "/api/reset-password",
  async (req, res) => {
    const { email } = req.body || {};

    if (!isEmail(email)) {
      return res.status(400).json({
        success: false,
        code: "auth/invalid-email",
        error: "E-Mail-Adresse ist ungültig",
      });
    }

    const adminClient = getFirebaseAdmin();

    if (!adminClient) {
      return res.status(503).json({
        success: false,
        error:
          adminError ||
          "Firebase Admin nicht konfiguriert",
      });
    }

    try {
      // 1. Lookup: find the Firebase Auth user for the email address.
      const normalizedEmail = email.trim().toLowerCase();
      const userRecord = await adminClient
        .auth()
        .getUserByEmail(normalizedEmail);

      // 1b. Gate: only hosts whose registration is "active" may reset their
      // password. The check runs with the service account (Firestore Admin),
      // first against the host profile (by UID, then by email), then the
      // venue record as legacy fallback. "pending" — or any unresolved
      // status — rejects the request.
      const registrationStatus = await lookupRegistrationStatus(
        adminClient,
        userRecord.uid,
        normalizedEmail,
      );

      if (registrationStatus !== "active") {
        return res.status(403).json({
          success: false,
          code: "registration/pending",
          error:
            "Ihre Registrierung wird noch geprüft — " +
            "ein Passwort-Reset ist erst nach Freischaltung möglich",
        });
      }

      // 2. Generate: Firebase password-reset action link via the Admin SDK.
      // No actionCodeSettings, so the link resolves against the project's
      // default action handler (authDomain) — no authorized-domain setup
      // required. The user chooses the new password after clicking it.
      const resetLink = await adminClient
        .auth()
        .generatePasswordResetLink(normalizedEmail);

      console.log(
        "Password reset link generated for:",
        normalizedEmail,
      );

      // The client renders 07_reset_link_de.html with this link and
      // delivers it via EmailJS or the SMTP.js fallback.
      return res.status(200).json({
        success: true,
        resetLink,
      });
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        return res.status(404).json({
          success: false,
          code: "auth/user-not-found",
          error:
            "Kein Konto mit dieser E-Mail-Adresse gefunden",
        });
      }

      if (error.code === "auth/invalid-email") {
        return res.status(400).json({
          success: false,
          code: "auth/invalid-email",
          error: "E-Mail-Adresse ist ungültig",
        });
      }

      console.error(
        "Password reset error:",
        error.message,
      );

      return res.status(500).json({
        success: false,
        error:
          error.message ||
          "Passwort-Reset fehlgeschlagen",
      });
    }
  },
);

// -----------------------------------------------------------------------------
// Unknown API endpoints
// -----------------------------------------------------------------------------

// This must come before the React SPA fallback.
// Otherwise unknown /api routes could return index.html.
app.use("/api", (req, res) => {
  return res.status(404).json({
    success: false,
    error: "API-Endpunkt nicht gefunden",
  });
});

// -----------------------------------------------------------------------------
// React production build
// -----------------------------------------------------------------------------

if (fsSync.existsSync(BUILD_INDEX)) {
  app.use(
    express.static(BUILD_DIR),
  );

  // React Router fallback.
  app.use((req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }

    return res.sendFile(BUILD_INDEX);
  });
} else {
  console.warn(
    `React build not found: ${BUILD_INDEX}`,
  );

  console.warn(
    "Run npm run build before starting the production server.",
  );
}

// -----------------------------------------------------------------------------
// Global server error handler
// -----------------------------------------------------------------------------

app.use((error, req, res, next) => {
  console.error(
    "Unhandled server error:",
    error,
  );

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    success: false,
    error: "Interner Serverfehler",
  });
});

// -----------------------------------------------------------------------------
// Start application
// -----------------------------------------------------------------------------

const PORT = Number(
  process.env.PORT || 5000,
);

app.listen(PORT, () => {
  console.log(
    `Application running on port ${PORT}`,
  );

  console.log(
    `Local URL: http://localhost:${PORT}`,
  );

  if (fsSync.existsSync(BUILD_INDEX)) {
    console.log(
      "React production build is enabled",
    );
  }
});

setupTransporter().catch((error) => {
  smtpError = error.message;
  transporter = null;

  console.error(
    "SMTP setup failed:",
    error,
  );
});