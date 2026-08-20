// E-Mail-Zustellung über EmailJS (emailjs.com) mit genau EINER gemeinsamen
// Vorlage. Die Dashboard-Vorlage enthält nur vier Platzhalter:
//   {{to_email}} {{subject}} {{reply_to}} {{{full_html}}}
// Der fertige HTML-Brief (public/mailtempletes/01–05) wird lokal gerendert
// und komplett als full_html übergeben — es werden keine Bausteine mehr
// gebaut oder an EmailJS geschickt.
// ponytail: Sobald die Env-Variablen leer sind, läuft der SMTP.js-Fallback
// in mailer.js/VenueDetail — hier ändert sich dann nichts.
import emailjs from "@emailjs/browser";

const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID || "";
const TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || "";
const PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || "";

// Leer lassen (Standard) = SMTP.js-Fallback in mailer.js/VenueDetail bleibt aktiv.
export const emailJsConfigured = Boolean(
  SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY,
);

let initialized = false;

function getEmailJsClient() {
  if (!initialized) {
    emailjs.init({ publicKey: PUBLIC_KEY });
    initialized = true;
  }
  return emailjs;
}

// Zentrale Zustellung: schickt den fertig gerenderten HTML-Brief an EmailJS.
// Die Dashboard-Vorlage bettet {{{full_html}}} (Triple-Mustache) ein.
export async function sendEmailJs({
  to,
  subject,
  html = "",
  replyTo = "",
}) {
  if (!to || !subject) {
    return {
      success: false,
      error: "Empfänger und Betreff sind erforderlich",
    };
  }
  const params = {
    to_email: to,
    subject,
    full_html: html,
    reply_to: replyTo,
  };
  try {
    const client = getEmailJsClient();
    const response = await client.send(SERVICE_ID, TEMPLATE_ID, params);
    if (response?.status !== 200 && !/OK/.test(response?.text || "")) {
      throw new Error(
        response?.text || "EmailJS konnte die E-Mail nicht versenden.",
      );
    }
    return {
      success: true,
      status: response?.status,
      text: response?.text,
    };
  } catch (error) {
    console.error("EmailJS send error:", error);
    return {
      success: false,
      status: error?.status,
      text: error?.text,
      error:
        error?.message || "E-Mail konnte nicht versendet werden",
    };
  }
}
