// E-Mail-Baustein: Vorlagen kommen aus Cloud Firestore oder aus den lokalen
// Standardvorlagen und werden mit {Platzhaltern} befüllt.
// ponytail: Zustellung bleibt Browser-seitig (mailto-Links, Webhook-POST,
// Warteschlange im Gastgeber-Bereich) — ein echtes NodeMailer-Relay kann die
// Firestore-Collections notifications/emailTemplates später serverseitig
// konsumieren, ohne dass sich hier etwas ändert.
import { getEmailTemplate } from "./storage";
import { getLanguage, v } from "../Utils/i18n";
import { shortDate, longDate } from "../Utils/dates";
import { EMAIL_DEHOGA, EMAIL_GASTGEBER_AG } from "../Utils/mail";

// Liest eine Vorlage und ersetzt {name}-Platzhalter; fehlende Werte werden
// zu leerem Text. Leere Zeilen werden entfernt (optionale Bausteine).
// Fallback auf Deutsch, wenn die Vorlage in der aktuellen Sprache fehlt.
export async function renderTemplate(key, params) {
  const tpl =
    (await getEmailTemplate(key, getLanguage())) ||
    (await getEmailTemplate(key, "de"));
  if (!tpl) throw new Error("E-Mail-Vorlage fehlt: " + key);
  const fill = (text) =>
    text.replace(/\{(\w+)\}/g, (match, name) =>
      name in params ? String(params[name] ?? "") : "",
    );
  return {
    subject: fill(tpl.subject),
    lines: tpl.lines.map(fill).filter((line) => line !== ""),
  };
}

// Statische HTML-Vorlage aus public/mailtempletes/<key>.html laden und die
// {Platzhalter} bzw. {{Platzhalter}} mit den Parametern befüllen (Texte werden
// HTML-escaped, damit Betriebsangaben die Vorlage nicht brechen können). Wirft,
// wenn die Vorlage nicht geladen werden kann — der Aufrufer fällt dann auf den
// Text-Flow (renderTemplate) zurück.
export async function renderHtmlTemplate(key, params) {
  const res = await fetch(
    `${process.env.PUBLIC_URL || ""}/mailtempletes/${key}.html`,
  );
  if (!res.ok) throw new Error("HTML-Vorlage fehlt: " + key);
  const escape = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[ch]);
  return (await res.text()).replace(/\{\{?(\w+)\}\}?/g, (match, name) =>
    name in params ? escape(params[name]) : "",
  );
}

// Gast-Bestätigung + Benachrichtigung an den Betrieb (Buchung in VenueDetail).
// Liefert Text- und HTML-Version (HTML aus public/mailtempletes/04/05).
export async function buildBookingMails({
  loc,
  res,
  date,
  slots,
  day,
  slotLabel,
  chairList,
  people,
  name,
  seatCount,
  remainingSeats,
}) {
  const en = getLanguage() === "en";
  const multiSlots =
    slots.length > 1
      ? en
        ? ""
        : " (mehrere Zeitfenster)"
      : "";
  const aktionLine = day.aktion
    ? en
      ? ""
      : ""
    : loc.angebot
      ? en
        ?  ""
      : ""
      : "";
  const noteLine = res.note
    ? en
      ? `• Your message to the host: “${res.note}”`
      : `• Deine Nachricht an den Gastgeber: „${res.note}“`
    : "";

  const guest = await renderTemplate("booking.guest", {
    name,
    venueName: loc.name,
    city: loc.city,
    type: loc.type,
    dateShort: shortDate(date),
    dateLong: longDate(date),
    slotLabel,
    multiSlots,
    people,
    chairList,
    buchungsNr: res.id,
    aktionLine,
    noteLine,
  });
  const guestMail = {
    typ: en ? "Confirmation for the guest" : "Bestätigung an den Gast",
    an: res.email,
    betreff: guest.subject,
    lines: guest.lines,
  };

  const host = await renderTemplate("booking.host", {
    venueName: loc.name,
    dateShort: shortDate(date),
    dateLong: longDate(date),
    slotLabel,
    multiSlots,
    people,
    chairList,
    buchungsNr: res.id,
    aktionLine: day.aktion ? `Aktion: ${day.aktion.titel}` : "",
    langHint: en
      ? " (Reservierung über die englische Seite — Gast spricht vermutlich Englisch)"
      : "",
    gastName: name,
    email: res.email,
    telefon: res.telefon,
    adresseLine: res.strasse ? `Adresse: ${res.strasse}, ${res.plzort}` : "",
    noteLine: res.note ? `Nachricht des Gastes: „${res.note}“` : "",
  });
  // HTML-Vorlagen für die Zustellung über den SMTP-Server.
  const totalSeats = (loc.tisch && loc.tisch.seats) || loc.seats || 0;
  const htmlParams = {
    venueName: loc.name,
    venueRegion: loc.region || "",
    venueType: loc.type || "",
    bookingDate: longDate(date),
    bookingTime: slotLabel,
    seatCount: String(seatCount),
    totalSeats: String(totalSeats),
    remainingSeats: String(remainingSeats),
    customerFirstName: res.vorname || "",
    customerLastName: res.nachname || "",
    customerEmail: res.email || "",
    customerPhone: res.telefon || "",
    customerStreet: res.strasse || "",
    customerPostalCodeCity: res.plzort || "",
    customerMessage: res.note || "",
    hostName: loc.inhaber || "",
  };
  let guestHtml = "", venueHtml = "";
  try {
    guestHtml = await renderHtmlTemplate("04_customer_booking_confirmation", htmlParams);
    venueHtml = await renderHtmlTemplate("05_restaurant_booking_notification", htmlParams);
  } catch (e) {
    // HTML-Vorlage nicht verfügbar — Text-Fallback läuft durch.
  }

  const venueMail = {
    typ: v("Benachrichtigung an den Betrieb"),
    an: loc.email || v("— vom Betrieb im Gastgeber-Bereich zu hinterlegen —", "— to be stored by the venue in the host area —"),
    betreff: host.subject,
    lines: host.lines,
    html: venueHtml,
  };

  guestMail.html = guestHtml;

  // Zeilen für die gemeinsame EmailJS-Vorlage — nur Felder, die zur jeweiligen
  // Mail gehören; leere Werte fallen beim Versand (emailjs.js) automatisch weg.
  const customerAddress = [res.strasse, res.plzort]
    .filter(Boolean)
    .join(", ");
  guestMail.rows = [
    [v("Restaurant", "Venue"), loc.name],
    [v("Region", "Region"), loc.region || ""],
    [v("Typ", "Type"), loc.type || ""],
    [v("Datum", "Date"), longDate(date)],
    [v("Zeit", "Time"), slotLabel],
    [v("Plätze", "Seats"), String(seatCount)],
    [v("Gesamtplätze", "Total seats"), String(totalSeats)],
    [v("Freie Plätze", "Remaining seats"), String(remainingSeats)],
    [v("Name", "Name"), name],
    [v("E-Mail", "Email"), res.email || ""],
    [v("Telefon", "Phone"), res.telefon || ""],
    [v("Adresse", "Address"), customerAddress],
    [v("Nachricht an den Gastgeber", "Message to the host"), res.note || ""],
  ];
  venueMail.rows = [
    [v("Restaurant", "Venue"), loc.name],
    [v("Datum", "Date"), longDate(date)],
    [v("Zeit", "Time"), slotLabel],
    [v("Plätze", "Seats"), String(seatCount)],
    [v("Gesamtplätze", "Total seats"), String(totalSeats)],
    [v("Freie Plätze", "Remaining seats"), String(remainingSeats)],
    [v("Gast", "Guest"), name],
    [v("E-Mail", "Email"), res.email || ""],
    [v("Telefon", "Phone"), res.telefon || ""],
    [v("Adresse", "Address"), customerAddress],
    [v("Nachricht des Gastes", "Message from the guest"), res.note || ""],
  ];

  return { guestMail, venueMail };
}

// Drei Anmeldemails (DEHOGA Sachsen, Gastgeber AG, Bestätigung) — AuthForms.
export async function buildRegistrationMails({
  venue,
  email,
  inhaber,
  telefon,
  isNew,
  anschrift,
  mischtisch,
}) {
  const dehoga = await renderTemplate("registration.dehoga", {
    venueName: venue.name,
    venueType: venue.type,
    anschrift,
    region: venue.region,
    inhaber,
    email,
    telefon: telefon || "—",
    mischtisch,
    neuerEintrag: isNew
      ? v(
          "Es handelt sich um einen neuen Eintrag.",
          "This is a new listing.",
        )
      : v(
          "Bestehender Partnerbetrieb, neuer Plattform-Zugang.",
          "Existing partner venue, new platform access.",
        ),
    agEmail: EMAIL_GASTGEBER_AG,
    city: venue.city,
  });
  const ag = await renderTemplate("registration.ag", {
    venueName: venue.name,
    strasse: venue.strasse || "—",
    plzOrt: [venue.plz, venue.city].filter(Boolean).join(" ") || venue.city,
    inhaber,
    email,
  });
  const best = await renderTemplate("registration.confirmation", {
    inhaber,
    venueName: venue.name,
    email,
    mischtisch,
    agEmail: EMAIL_GASTGEBER_AG,
  });

  return [
    {
      typ: v("Anmeldung an den DEHOGA Sachsen", "Registration to DEHOGA Sachsen"),
      an: EMAIL_DEHOGA,
      betreff: dehoga.subject,
      lines: dehoga.lines,
    },
    {
      typ: v(
        "Nutzungsvereinbarung an die Bayerische Gastgeber AG",
        "Usage agreement to Bayerische Gastgeber AG",
      ),
      an: EMAIL_GASTGEBER_AG,
      betreff: ag.subject,
      lines: ag.lines,
    },
    {
      typ: v("Bestätigung an Ihren Betrieb", "Confirmation to your venue"),
      an: email,
      betreff: best.subject,
      lines: best.lines,
    },
  ];
}
