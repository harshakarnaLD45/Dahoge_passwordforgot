import { renderHtmlTemplate } from "./email";
import { emailJsConfigured, sendEmailJs } from "./emailjs";
import { firebaseConfig, getFirebaseServices } from "./firebase";

const SMTP_SECURE_TOKEN =
  process.env.REACT_APP_SMTP_SECURE_TOKEN || "";

const MAIL_FROM =
  process.env.REACT_APP_MAIL_FROM || "";

const MAIL_FROM_NAME =
  process.env.REACT_APP_MAIL_FROM_NAME ||
  "Mischtisch Sachsen";

const REGISTRATION_REVIEW_EMAIL =
  process.env.REACT_APP_REGISTRATION_REVIEW_EMAIL || "";

const MAINCOMPANY_EMAIL =
  process.env.REACT_APP_MAINCOMPANY_EMAIL || "";

const VERIFICATION_TEAM_NAME =
  process.env.REACT_APP_VERIFICATION_TEAM_NAME ||
  "Prüfteam Mischtisch Sachsen";

function isValidEmail(value) {
  return (
    typeof value === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
  );
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) =>
    ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character],
  );
}

function textToHtml(text) {
  return escapeHtml(text || "").replace(/\r?\n/g, "<br />");
}

function getSmtpClient() {
  if (
    typeof window === "undefined" ||
    !window.Email ||
    typeof window.Email.send !== "function"
  ) {
    throw new Error(
      "SMTP.js wurde nicht geladen. Prüfen Sie public/index.html.",
    );
  }

  if (!SMTP_SECURE_TOKEN) {
    throw new Error(
      "REACT_APP_SMTP_SECURE_TOKEN fehlt.",
    );
  }

  if (!isValidEmail(MAIL_FROM)) {
    throw new Error(
      "REACT_APP_MAIL_FROM fehlt oder ist ungültig.",
    );
  }

  return window.Email;
}

async function deliverEmail({ to, subject, text, html }) {
  const client = getSmtpClient();

  const response = await client.send({
    SecureToken: SMTP_SECURE_TOKEN,
    To: to.trim(),
    From: MAIL_FROM.trim(),
    FromName: MAIL_FROM_NAME,
    Subject: subject,
    Body: html || textToHtml(text),
  });

  const message = String(response || "").trim();

  if (message.toUpperCase() !== "OK") {
    throw new Error(message || "SMTP.js konnte die E-Mail nicht versenden.");
  }

  return {
    success: true,
    message,
  };
}

export async function sendEmail({ to, subject, text, html }) {
  if (!isValidEmail(to)) {
    return {
      success: false,
      error: "Keine gültige Empfänger-E-Mail",
    };
  }

  if (!subject || (!text && !html)) {
    return {
      success: false,
      error: "Betreff sowie Text oder HTML sind erforderlich",
    };
  }

  try {
    return await deliverEmail({
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error("SMTP.js send error:", error);

    return {
      success: false,
      error:
        error?.message ||
        "E-Mail konnte nicht versendet werden",
    };
  }
}

async function sendRegistrationMessage({
  type,
  recipient,
  subject,
  text,
  html,
}) {
  const recipients = String(recipient || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

  if (recipients.length === 0) {
    return {
      type,
      recipient: recipient || null,
      success: false,
      error: "Empfänger fehlt oder ist ungültig",
    };
  }

  const invalidRecipient = recipients.find(
    (email) => !isValidEmail(email),
  );

  if (invalidRecipient) {
    return {
      type,
      recipient: recipients.join(", "),
      success: false,
      error: `Ungültige Empfänger-E-Mail: ${invalidRecipient}`,
    };
  }

  try {
    const results = await Promise.all(
      recipients.map((email) =>
        sendEmail({
          to: email,
          subject,
          text,
          html,
        }),
      ),
    );

    const success = results.every((result) => result?.success !== false);

    return {
      type,
      recipient: recipients.join(", "),
      success,
      results,
      error: success
        ? undefined
        : "Eine oder mehrere E-Mails konnten nicht versendet werden.",
    };
  } catch (error) {
    console.error(`SMTP.js ${type} send error:`, error);

    return {
      type,
      recipient: recipients.join(", "),
      success: false,
      error:
        error?.message ||
        "E-Mail konnte nicht versendet werden",
    };
  }
}

export async function sendRegistrationEmails(payload) {
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
  } = payload || {};

  if (!isValidEmail(email)) {
    return {
      success: false,
      error: "Keine gültige Gastgeber-E-Mail",
    };
  }

  if (!regCode || typeof regCode !== "string") {
    return {
      success: false,
      error: "Registrierungsnummer fehlt",
    };
  }

  const templateValues = {
    hostName: hostName || "—",
    companyName: companyName || "—",
    email,
    phone: phone || "—",
    street: street || "—",
    postalCode: postalCode || "—",
    city: city || "—",
    venueType: venueType || "—",
    region: region || "—",
    registrationDate: registrationDate || "—",
    registrationNumber: regCode,
    verificationTeamName: VERIFICATION_TEAM_NAME,
    accountEmail: accountEmail || email,
    temporaryPassword: temporaryPassword || "—",
    credentialsCreatedAt:
      credentialsCreatedAt || registrationDate || "—",
  };

  // Gemeinsame Textbausteine für SMTP- und EmailJS-Pfad.
  const hostLines = [
    `Guten Tag ${hostName || ""},`,
    "Ihre Registrierung wurde erfolgreich übermittelt.",
    `Registrierungsnummer: ${regCode}`,
    "Ihre Angaben werden nun geprüft.",
  ];
  const verificationLines = [
    "Eine neue Betriebsregistrierung wurde eingereicht.",
    `Betrieb: ${companyName || "—"}`,
    `Ansprechpartner: ${hostName || "—"}`,
    `E-Mail: ${email}`,
    // `Registrierungsnummer: ${regCode}`,
  ];
  const internalLines = [
    `Ein neuer Betrieb wurde registriert: ${companyName || "—"}`,
    `Ansprechpartner: ${hostName || "—"}`,
    `E-Mail-Adresse des Zugangs: ${accountEmail || email}`,
    `Registrierungsnummer: ${regCode}`,
    `Zugang erstellt am: ${
      credentialsCreatedAt || registrationDate || "—"
    }`,
  ];

  // EmailJS als Zustellquelle, sobald konfiguriert (eine gemeinsame Vorlage
  // für alle Mail-Typen); sonst läuft der SMTP.js-Fallback unten.
  if (emailJsConfigured) {
    return sendRegistrationEmailsViaEmailJs({ values: templateValues });
  }

  let hostHtml = "";
  let verificationHtml = "";
  let internalHtml = "";

  try {
    [hostHtml, verificationHtml, internalHtml] =
      await Promise.all([
        renderHtmlTemplate(
          "01_restaurant_registration_confirmation",
          templateValues,
        ),
        renderHtmlTemplate(
          "02_external_verification_request",
          templateValues,
        ),
        renderHtmlTemplate(
          "03_internal_generated_credentials",
          templateValues,
        ),
      ]);
  } catch (error) {
    console.error("Registration template error:", error);

    return {
      success: false,
      error:
        error?.message ||
        "Registrierungs-E-Mail-Vorlagen konnten nicht geladen werden",
    };
  }

  const [hostEmail, verificationEmail, internalEmail] =
    await Promise.all([
      sendRegistrationMessage({
        type: "host",
        recipient: email,
        subject:
          `Ihre Registrierung bei Mischtisch Sachsen — ` +
          `${companyName || regCode}`,
        text: hostLines.join("\n\n"),
        html: hostHtml,
      }),
      sendRegistrationMessage({
        type: "verification",
        recipient: REGISTRATION_REVIEW_EMAIL,
        subject:
          `Prüfauftrag: Neue Betriebsregistrierung — ` +
          `${companyName || regCode}`,
        text: verificationLines.join("\n"),
        html: verificationHtml,
      }),
      sendRegistrationMessage({
        type: "internal",
        recipient: MAINCOMPANY_EMAIL,
        subject:
          `Interne Zugangsdaten: ${companyName || regCode} — ` +
          "Mischtisch Sachsen",
        text: internalLines.join("\n"),
        html: internalHtml,
      }),
    ]);

  return {
    success:
      hostEmail.success &&
      verificationEmail.success &&
      internalEmail.success,
    regCode,
    hostEmail,
    verificationEmail,
    internalEmail,
  };
}

async function sendRegistrationMessageViaEmailJs({
  type,
  recipient,
  ...params
}) {
  const recipients = String(recipient || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

  if (recipients.length === 0) {
    return {
      type,
      recipient: null,
      success: false,
      error: "Empfänger fehlt oder ist ungültig",
    };
  }

  const invalidRecipient = recipients.find(
    (email) => !isValidEmail(email)
  );

  if (invalidRecipient) {
    return {
      type,
      recipient: recipients.join(", "),
      success: false,
      error: `Ungültige Empfänger-E-Mail: ${invalidRecipient}`,
    };
  }

  try {
    const results = await Promise.all(
      recipients.map((email) =>
        sendEmailJs({
          to: email,
          ...params,
        })
      )
    )

    const success = results.every((result) => result?.success !== false);

    return {
      type,
      recipient: recipients.join(", "),
      success,
      results,
      error: success
        ? undefined
        : "Eine oder mehrere E-Mails konnten nicht versendet werden.",
    };
  } catch (error) {
    console.error(`EmailJS ${type} send error:`, error);

    return {
      type,
      recipient: recipients.join(", "),
      success: false,
      error:
        error?.message ||
        "E-Mail konnte nicht versendet werden",
    };
  }
}

// EmailJS-Pfad: die fertigen HTML-Briefe (01–03) werden lokal gerendert und
// komplett an EmailJS geschickt — die Daten stecken bereits in der Vorlage.
async function sendRegistrationEmailsViaEmailJs({ values }) {
  const company = values.companyName || values.registrationNumber;

  let hostHtml = "", verificationHtml = "", internalHtml = "";
  try {
    [hostHtml, verificationHtml, internalHtml] = await Promise.all([
      renderHtmlTemplate("01_restaurant_registration_confirmation", values),
      renderHtmlTemplate("02_external_verification_request", values),
      renderHtmlTemplate("03_internal_generated_credentials", values),
    ]);
  } catch (error) {
    // Vorlage nicht verfügbar — keine leeren Briefe verschicken.
    console.error("Registration HTML template error:", error);
    return {
      success: false,
      error:
        error?.message ||
        "Registrierungs-E-Mail-Vorlagen konnten nicht geladen werden",
    };
  }

  const [hostEmail, verificationEmail, internalEmail] =
    await Promise.all([
      sendRegistrationMessageViaEmailJs({
        type: "host",
        recipient: values.email,
        subject:
          `Ihre Registrierung bei Mischtisch Sachsen — ${company}`,
        html: hostHtml,
        replyTo: values.email,
      }),
      sendRegistrationMessageViaEmailJs({
        type: "verification",
        recipient: REGISTRATION_REVIEW_EMAIL,
        subject:
          `Prüfauftrag: Neue Betriebsregistrierung — ${company}`,
        html: verificationHtml,
        replyTo: values.email,
      }),
      sendRegistrationMessageViaEmailJs({
        type: "internal",
        recipient: MAINCOMPANY_EMAIL,
        subject:
          `Interne Zugangsdaten: ${company} — Mischtisch Sachsen`,
        html: internalHtml,
        replyTo: values.email,
      }),
    ]);

  return {
    success:
      hostEmail.success &&
      verificationEmail.success &&
      internalEmail.success,
    regCode: values.registrationNumber,
    hostEmail,
    verificationEmail,
    internalEmail,
  };
}

// Requests a PASSWORD_RESET out-of-band code for the CLIENT's Firebase
// project via the Identity Toolkit REST API. "returnOobLink" makes the API
// hand back the reset link instead of sending Firebase's own email, so the
// branded template below can be used.
async function buildFirebaseResetLink(email) {
  const { apiKey, authDomain } = firebaseConfig;
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requestType: "PASSWORD_RESET",
        email,
        returnOobLink: true,
      }),
    },
  );
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    const message =
      data?.error?.message || "Password reset failed.";
    const error = new Error(message);
    if (message === "EMAIL_NOT_FOUND") {
      error.code = "auth/user-not-found";
    } else if (message === "INVALID_EMAIL") {
      error.code = "auth/invalid-email";
    }
    throw error;
  }
  // returnOobLink yields a full "oobLink"; some backend builds return only
  // the "oobCode", which is composed into the link here.
  if (data.oobLink) return data.oobLink;
  if (data.oobCode) {
    return `https://${authDomain}/__/auth/action?mode=resetPassword&oobCode=${encodeURIComponent(data.oobCode)}&apiKey=${encodeURIComponent(apiKey)}&lang=de`;
  }
  const error = new Error(
    "Password reset link could not be generated.",
  );
  error.code = "auth/user-not-found";
  throw error;
}

// Renders 07_reset_link_de.html with the reset link and delivers it via
// EmailJS (main channel) with the SMTP.js fallback. Returns true when any
// channel delivered the mail.
async function deliverResetLinkEmail(email, resetLink) {
  const subject =
    "Passwort zurücksetzen – Mischtisch Sachsen";
  const text = [
    "Guten Tag,",
    "wir haben eine Anfrage zum Zurücksetzen Ihres Passworts für Mischtisch Sachsen erhalten.",
    "Klicken Sie auf den folgenden Link, um ein neues Passwort zu vergeben:",
    resetLink,
    "Falls Sie das Zurücksetzen Ihres Passworts nicht angefordert haben, wenden Sie sich bitte an Mischtisch Sachsen.",
  ].join("\n\n");

  // The template uses the {{RESET_LINK}} placeholder (double braces, uppercase).
  // renderHtmlTemplate fills it when the param key matches the placeholder name.
  const html = await renderHtmlTemplate("07_reset_link_de", {
    RESET_LINK: resetLink,
  });

  if (emailJsConfigured) {
    const emailJsResult = await sendEmailJs({
      to: email,
      subject,
      html,
    });
    if (emailJsResult?.success) return true;
    console.error(
      "EmailJS reset-link email failed:",
      emailJsResult?.error,
    );
  }

  const smtpResult = await sendEmail({
    to: email,
    subject,
    text,
    html,
  });
  if (smtpResult?.success) return true;
  console.error(
    "SMTP.js reset-link email failed:",
    smtpResult?.error,
  );
  return false;
}

// Forgot-password flow with three channels, tried in order:
// 1. Backend (POST /api/reset-password): generates the Firebase password
//    reset link via the Admin SDK (generatePasswordResetLink) and returns
//    it. The client renders 07_reset_link_de.html with that link and
//    delivers it via EmailJS with the SMTP.js fallback. "registration/
//    pending" and invalid emails are hard stops.
// 2. Client-side REST attempt: Firebase's sendOobCode endpoint with
//    returnOobLink. Only reachable when the backend is unconfigured or
//    unreachable — note that Google refuses returnOobLink to API-key-only
//    callers while email enumeration protection is enabled, so this usually
//    falls through.
// 3. Firebase built-in reset email (auth.sendPasswordResetEmail): final
//    rescue when neither channel delivered a mail.
export async function sendHostPasswordResetEmail(email) {
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();

  if (!normalizedEmail) {
    throw new Error("auth/missing-email");
  }

  const apiUrl = (
    process.env.REACT_APP_RESET_PASSWORD_API || ""
  ).trim();

  let temporaryPassword = null;

  if (apiUrl) {
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
        }),
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success && data.resetLink) {
        // Admin SDK link from the backend — branded email, done.
        if (
          await deliverResetLinkEmail(
            normalizedEmail,
            data.resetLink,
          )
        ) {
          return true;
        }
        console.error(
          "Branded reset-link email (server link) failed; trying fallbacks.",
        );
      } else if (res.ok && data?.success && data.temporaryPassword) {
        // Legacy backend: temporary-password flow.
        temporaryPassword = data.temporaryPassword;
      } else if (
        data?.code === "registration/pending" ||
        data?.code === "auth/invalid-email"
      ) {
        // Hard stops: the registration gate and invalid addresses keep their
        // code so the form can show the matching message.
        const error = new Error(
          data.error || "Password reset failed.",
        );
        error.code = data.code;
        throw error;
      } else if (data?.code === "auth/user-not-found") {
        // The server checks a different Firebase project than the client's
        // app. The account may still exist in the client's own project — the
        // client-side REST attempt below handles it.
        console.warn(
          "Server reset lookup: no account; trying client-side reset link.",
        );
      }
    } catch (err) {
      if (
        err?.code === "registration/pending" ||
        err?.code === "auth/invalid-email"
      ) {
        throw err;
      }
      // Backend unavailable or endpoint not deployed — fall through to the
      // client-side REST attempt below.
    }
  }

  if (temporaryPassword) {
    const subject =
      "Ihr temporäres Passwort für Mischtisch Sachsen";
    const text = [
      "Guten Tag,",
      "wir haben eine Anfrage zum Zurücksetzen Ihres Passworts für Mischtisch Sachsen erhalten.",
      `Ihr temporäres Passwort: ${temporaryPassword}`,
      "Melden Sie sich damit an und aktualisieren Sie Ihr Passwort anschließend in Ihrem Konto.",
    ].join("\n\n");

    try {
      const html = await renderHtmlTemplate(
        "06_forgot_password_de",
        { temporaryPassword },
      );

      // Send: EmailJS zuerst, dann der SMTP.js-Fallback.
      if (emailJsConfigured) {
        const emailJsResult = await sendEmailJs({
          to: normalizedEmail,
          subject,
          html,
        });
        if (emailJsResult?.success) return true;
        console.error(
          "EmailJS reset email failed:",
          emailJsResult?.error,
        );
      }

      const smtpResult = await sendEmail({
        to: normalizedEmail,
        subject,
        text,
        html,
      });
      if (smtpResult?.success) return true;
      console.error(
        "SMTP.js reset email failed:",
        smtpResult?.error,
      );
    } catch (error) {
      console.error(
        "Reset email render error:",
        error,
      );
    }

    // The password was already changed on the backend, but neither EmailJS
    // nor SMTP.js delivered the mail — fall through to the reset-link flows
    // below so the user can still recover the account.
  }

  // Client-side REST attempt (works only while the project allows
  // returnOobLink for API-key-only callers).
  try {
    const resetLink = await buildFirebaseResetLink(normalizedEmail);
    if (await deliverResetLinkEmail(normalizedEmail, resetLink)) {
      return true;
    }
    console.error(
      "Branded reset-link email (REST link) failed; using Firebase built-in reset email.",
    );
  } catch (err) {
    if (
      err?.code === "auth/user-not-found" ||
      err?.code === "auth/invalid-email"
    ) {
      throw err;
    }
    console.error(
      "Reset-link generation failed:",
      err,
    );
  }

  // Final rescue: Firebase's own reset email.
  const { auth } = await getFirebaseServices();
  await auth.sendPasswordResetEmail(normalizedEmail);
  return true;
}
