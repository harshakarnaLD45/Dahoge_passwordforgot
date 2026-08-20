// Default email templates used when Firestore has no customized template.
export const EMAIL_TEMPLATE_SEEDS = [
  {
    key: "booking.guest",
    lang: "de",
    subject:
      "Ihr Platz am Mischtisch ist reserviert",
    lines: [
      "Guten Tag {name},",
      "dein Platz am Mischtisch ist reserviert:",
      // "• {venueName}, {city} ({type})",
      // "• {dateLong}, {slotLabel} Uhr{multiSlots}",
      "• {people} — Stuhl {chairList}",
      // "Buchungsnummer: {buchungsNr}",
      "{aktionLine}",
      "{noteLine}",
      "Einfach dazusetzen, mitreden, mitmischen“.",
    ],
  },
  
  {
    key: "booking.host",
    lang: "de",
    subject: "Neue Mischtisch-Reservierung: {people} am {dateShort}, {slotLabel} Uhr",
    lines: [
      "Guten Tag, Team {venueName},",
      "für Ihren Mischtisch ist eine neue Reservierung eingegangen:",
      "• {dateLong}, {slotLabel} Uhr{multiSlots} — {people} (Stuhl {chairList})",
      "Buchungsnummer: {buchungsNr}",
      "{aktionLine}",
      "Gast: {gastName}{langHint}",
      "E-Mail: {email} · Telefon: {telefon}",
      "{adresseLine}",
      "{noteLine}",
      "Alle Reservierungen finden Sie im Gastgeber-Bereich der Plattform.",
    ],
  },
  
  {
    key: "registration.dehoga",
    lang: "de",
    subject: "MISCHTISCH in SACHSEN — neue Anmeldung: {venueName}, {city}",
    lines: [
      "Guten Tag, DEHOGA Sachsen,",
      "über die Reservierungsplattform Mischtisch Sachsen hat sich folgender Betrieb angemeldet:",
      "Betrieb: {venueName} ({venueType})",
      "Anschrift: {anschrift}",
      "Region: {region}",
      "Inhaber/Pächter: {inhaber}",
      "E-Mail: {email}",
      "Telefon: {telefon}",
      "Mischtisch: {mischtisch}",
      "{neuerEintrag}",
      "Die unterschriebene Nutzungsvereinbarung geht parallel an {agEmail}. Wir bitten um Zusendung des Starterpakets.",
    ],
  },
 
  {
    key: "registration.ag",
    lang: "de",
    subject: "MISCHTISCH in SACHSEN",
    lines: [
      "Guten Tag, Team MischTisch,",
      "hiermit melden wir unseren Betrieb für den Mischtisch in Sachsen an. Die Angaben entsprechen der Nutzungsvereinbarung:",
      "Betrieb: {venueName}",
      "Straße und Hausnummer: {strasse}",
      "PLZ und Ort: {plzOrt}",
      "Inhaber/Pächter: {inhaber}",
      "E-Mail: {email}",
      "Die unterschriebene Nutzungsvereinbarung fügen wir dieser E-Mail als Anhang bei.",
      "Mit freundlichen Grüßen",
      "{inhaber}",
    ],
  },
  
  {
    key: "registration.confirmation",
    lang: "de",
    subject: "Ihre Anmeldung bei Mischtisch Sachsen — {venueName}",
    lines: [
      "Guten Tag {inhaber},",
      "Ihr Zugang für {venueName} ist angelegt. Anmeldung künftig mit {email}.",
      "Ihr Mischtisch: {mischtisch}",
      "Nächste Schritte: 1. Nutzungsvereinbarung unterschrieben an {agEmail} (Betreff „MISCHTISCH in SACHSEN“) — 2. Eintrag im Mischtisch-Finder — 3. Starterpaket vom DEHOGA Sachsen — 4. Mischtisch decken.",
      "Reservierungen sehen Sie jederzeit im Gastgeber-Bereich der Plattform.",
    ],
  },
 
];
