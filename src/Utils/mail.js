// Absender und Empfänger für die Demo-E-Mail-Flows.
export const MAIL_FROM =
  "Mischtisch Sachsen <bestaetigung@mischtisch-sachsen.example>";
export const EMAIL_GASTGEBER_AG = "info@gastgeber-ag.bayern";
export const EMAIL_DEHOGA = "info@dehoga-sachsen.de";
// Automatischer Versand nach der Registrierung (HTML-Vorlagen 01–03):
// 02 geht an das externe Validierungsteam, 03 mit den Zugangsdaten intern.
export const EMAIL_VALIDATION = "info@gastgeber-ag.bayern";
export const EMAIL_INTERNAL = "info@gastgeber-ag.bayern";

// mailto-Link mit fertigem Betreff und Text.
export function mailtoHref(mail) {
  return `mailto:${mail.an}?subject=${encodeURIComponent(mail.betreff)}&body=${encodeURIComponent(mail.lines.join("\n\n"))}`;
}
