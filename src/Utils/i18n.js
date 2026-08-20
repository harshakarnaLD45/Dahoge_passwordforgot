// Sprachumschaltung DE/EN. Wie im Legacy-Bundle ist der aktuelle Sprachwert
// Modul-Eigentum: v() liest ihn beim Rendern; die App-Komponente hält den
// reaktiven Zustand und ruft setLanguage() auf (Sprache liegt in den
// lokalen Browser-Einstellungen, Schlüssel "language").

let language = "de";

export function getLanguage() {
  return language;
}

export function setLanguage(lang) {
  language = lang === "en" ? "en" : "de";
}

// Übersetzungshelfer: im EN-Modus die englische Fassung liefern, sonst deutsch.
export function v(de, en) {
  return language === "en" && en !== undefined ? en : de;
}

const DAY_SHORT = {
  de: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};
const DAY_LONG = {
  de: [
    "Sonntag",
    "Montag",
    "Dienstag",
    "Mittwoch",
    "Donnerstag",
    "Freitag",
    "Samstag",
  ],
  en: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
};
const MONTHS = {
  de: [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ],
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
};

// Sprachabhängige Tagesnamen als Proxy über Arrays (wie tr/op im Bundle),
// damit `dayShortName[date.getDay()]` funktioniert.
export const dayShortName = new Proxy(
  {},
  { get: (_o, key) => DAY_SHORT[language][key] },
);
export const dayLongName = new Proxy(
  {},
  { get: (_o, key) => DAY_LONG[language][key] },
);

export function monthName(index) {
  return MONTHS[language][index];
}

// Reihenfolge der Tage in Listen: Montag bis Sonntag.
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

// Schlüsselbasierte Übersetzungen für t(): englische Schlüssel (z. B.
// "beleg.ReservationConfirmation"), deutscher und englischer Text je Schlüssel.
const TRANSLATIONS = {
  de: {
    "beleg.ReservationConfirmation": "Reservierungsbestätigung",
    "beleg.Venue": "Betrieb",
    "beleg.Date": "Datum",
    "beleg.Time": "Uhrzeit",
    "beleg.People": "Personen",
    "beleg.ClockSuffix": " Uhr",
    "beleg.OnePerson": "1 Person",
    "beleg.ManyPeople": "{count} Personen",
    "beleg.Chair": "Stuhl",
    "beleg.Guest": "Gast",
    "beleg.Contact": "Kontakt",
    "beleg.Address": "Anschrift",
    "beleg.Promotion": "Aktion",
    "beleg.Message": "Nachricht",
    "beleg.VenueReachable": "Betrieb erreichbar",
    //"beleg.Footnote": "Am Mischtisch sitzen Gäste gemeinsam an einem Tisch. Reserviert sind Plätze, nicht der ganze Tisch. Bei Verhinderung bitte im Betrieb absagen oder unter „Meine Plätze" stornieren.",

    "footer.legal": "Rechtliches",
    "footer.imprint": "Impressum",
    "footer.privacy": "Datenschutzerklärung",
    "footer.terms": "Nutzungsbedingungen & Reservierung",
    "footer.accessibility": "Barrierefreiheit",
    "footer.forHosts": "Für Gastgeber",
    "footer.hostTerms": "Bedingungen für Gastgeber",
    "footer.hostPrivacy": "Datenschutzhinweise für Gastgeber",
    "footer.tagline": "Mischtisch Sachsen · 2026",
    "footer.homeAria": "Zur Startseite",
    "footer.legalNavAria": "Rechtliche Links",
    "footer.hostNavAria": "Links für Gastgeber",
    "footer.logoAlt": "Mischtisch Sachsen – DEHOGA Sachsen",

    accessibilityPage: {
      eyebrow: "Barrierefreiheit",
      title: "Barrierefreiheit",
      // lastUpdated: "Zuletzt aktualisiert: 19. August 2026",

      ourGoal: {
        title: "Unser Ziel",
        paragraphs: [
          "Mischtisch Sachsen soll für möglichst viele Nutzerinnen und Nutzer wahrnehmbar, bedienbar, verständlich und robust sein, ohne dass unnötige Unterstützung erforderlich ist.",
          "Mischtisch Sachsen berücksichtigt die für den Dienst geltenden gesetzlichen Anforderungen an die digitale Barrierefreiheit. Dazu gehören insbesondere die Anforderungen des Barrierefreiheitsstärkungsgesetzes (BFSG) und seiner Durchführungsverordnung (BFSGV), soweit diese auf den Dienst Anwendung finden, sowie einschlägige technische Standards für barrierefreie digitale Dienste.",
        ],
      },

      creationUpdate: {
        title: "Erstellungs- und Aktualisierungsdatum",
        // text: "Diese Erklärung wurde im August 2026 erstellt und zuletzt am 19. August 2026 aktualisiert.",
      },

      serviceDescription: {
        title: "Beschreibung des Dienstes",
        paragraphs: [
          "Mischtisch Sachsen ermöglicht es Nutzerinnen und Nutzern insbesondere, teilnehmende Gastgeber zu finden, nach Region und Datum zu suchen, Informationen zu Gastgebern und Angeboten einzusehen, Reservierungsmöglichkeiten zu prüfen, Reservierungszeiten auszuwählen, mehrere Plätze zu reservieren und eine Reservierungsbestätigung zu erhalten.",
          "Gastgeber können sich in einem geschützten Bereich anmelden und dort ihre Mischtisch-Informationen, Buchungszeiten, Sondertermine, Angebote, Reservierungen und Profilinformationen innerhalb der derzeit bereitgestellten Funktionen verwalten.",
        ],
      },

      measures: {
        title: "Maßnahmen zur Barrierefreiheit",
        intro:
          "Bei der Entwicklung, Neugestaltung und Pflege der Plattform werden insbesondere folgende Aspekte berücksichtigt:",
        items: [
          "Bedienbarkeit über die Tastatur",
          "sichtbare und verständliche Fokusindikatoren",
          "aussagekräftige semantische Überschriftenstrukturen und Formulare",
          "klare Beschriftungen für Formularfelder und Bedienelemente",
          "verständliche Hinweise und Fehlermeldungen",
          "ausreichender Farbkontrast",
          "Alternativtexte für inhaltlich relevante Bilder",
          "Informationen, die nicht ausschließlich über Farbe vermittelt werden",
          "responsive und skalierbare Darstellung",
          "logische Reihenfolge und Beschriftung für Screenreader",
          "verständliche Inhalte in deutscher und englischer Sprache",
          "barrierearme Authentifizierungs- und Reservierungsabläufe",
        ],
      },

      currentStatus: {
        title: "Aktueller Stand der Konformität",
        paragraphs: [
          "Die Plattform wird derzeit neu gestaltet. Im Rahmen des Relaunchs wird die Barrierefreiheit technisch und redaktionell überprüft und verbessert.",
          "Bis eine vollständige und dokumentierte Bewertung der Barrierefreiheit abgeschlossen ist, beansprucht die Plattform keine uneingeschränkte Konformität mit einem bestimmten WCAG-Konformitätsniveau oder einem bestimmten technischen Standard.",
        ],
      },

      reportBarrier: {
        title: "Barriere melden",
        intro:
          "Wenn Sie auf eine Barriere stoßen oder Informationen in einer barriereärmeren Form benötigen, wenden Sie sich bitte an:",

        company: "DEHOGA Hotel- und Gaststättenverband Sachsen e.V.",

        address: ["Tharandter Straße 5", "01159 Dresden"],

        emailLabel: "E-Mail",
        email: "info@dehoga-sachsen.de",

        phoneLabel: "Telefon",
        phone: "+49 (0)351 428 95 10",

        text: "Bitte geben Sie nach Möglichkeit die betroffene Seite oder Funktion, die aufgetretene Barriere und, sofern dies für die Untersuchung hilfreich ist, das verwendete Gerät oder die eingesetzte assistive Technologie an.",
      },

      updates: {
        title: "Aktualisierungen dieser Erklärung",
        text: "Diese Erklärung wird aktualisiert, wenn sich die Funktionalität des Dienstes, der überprüfte Stand der Barrierefreiheit oder die für Mischtisch Sachsen geltenden rechtlichen Anforderungen ändern.",
      },
    },

    imprint: {
      eyebrow: "Anbieterinformationen",
      title: "Impressum",
      // lastUpdated: "Zuletzt aktualisiert: 19. August 2026",

      provider: {
        title: "Anbieter",
        company: "DEHOGA Hotel- und Gaststättenverband Sachsen e.V.",
        companyShort: "(DEHOGA Sachsen e.V.)",
        address: "Tharandter Straße 5",
        city: "01159 Dresden",
        country: "Deutschland",
        phone: "Telefon:",
        email: "E-Mail:",
        website: "Website:",
      },

      representative: {
        title: "Vertretungsberechtigte Person",
        text: "Vertreten durch den Hauptgeschäftsführer:",
        name: "Axel Klein",
      },

      register: {
        title: "Register",
        text: "Eingetragen im Vereinsregister.",
        court: "Registergericht: Amtsgericht Dresden",
        number: "Registernummer: 1104",
      },

      mischtisch: {
        title: "Mischtisch Sachsen",
        text1:
          "Mischtisch Sachsen ist eine von der DEHOGA Sachsen e.V. betriebene Vermittlungsplattform für Reservierungen bei teilnehmenden Restaurants, Cafés, Hotels und anderen Gastgebern.",
        text2:
          "Die DEHOGA Sachsen e.V. ist nicht Anbieter der von den einzelnen Gastgebern erbrachten gastronomischen oder sonstigen Leistungen. Soweit gesetzlich nicht anders vorgeschrieben, ist der jeweils ausgewählte Gastgeber für seine Speisen, Getränke, Veranstaltungen, Öffnungszeiten, Preise, Leistungen vor Ort und die von ihm bereitgestellten Informationen verantwortlich.",
      },

      consumerDispute: {
        title: "Verbraucherstreitbeilegung",
        text: "Die DEHOGA Sachsen e.V. ist weder bereit noch verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
      },

      contentRights: {
        title: "Inhalts- und Bildrechte",
        text: "Originalinhalte unterliegen dem geltenden Urheberrecht. Fotos, Logos, Beschreibungen und sonstige von teilnehmenden Gastgebern bereitgestellte Materialien liegen in der Verantwortung des jeweiligen Gastgebers. Gastgeber dürfen nur Materialien hochladen oder veröffentlichen, für die sie die erforderlichen Rechte besitzen.",
      },
    },
    hostPrivacy: {
      header: {
        label: "Für Gastgeber",
        title: "Datenschutzhinweis für Gastgeber",
        // updated: "Zuletzt aktualisiert: 19. August 2026",
      },

      contact: {
        email: "E-Mail",
        phone: "Telefon",
      },

      sections: {
        privacyAtGlance: {
          title: "Datenschutz auf einen Blick",
          text: "Dieser Datenschutzhinweis für Gastgeber beschreibt die Verarbeitung personenbezogener Daten von Gastgebern und deren Ansprechpartnern im Zusammenhang mit der Registrierung, dem geschützten Gastgeberbereich und der Nutzung von Mischtisch Sachsen.",
          items: [
            "Gastgeberkonten werden mit einem vom System generierten oder freigegebenen Registrierungscode erstellt.",
            "Die Authentifizierung für den Gastgeberbereich erfolgt über Firebase Authentication.",
            "Gastgeber- und Konfigurationsdaten werden über die technische Plattform, einschließlich Cloud Firestore, verarbeitet.",
            "Gastgeberbilder werden über Cloud Storage for Firebase gespeichert.",
            "Reservierungsbenachrichtigungen werden technisch über EmailJS und Gmail/Google versendet.",
            "Bestimmte vom Gastgeber freigegebene Profil-, Bild-, Mischtisch- und Angebotsinformationen werden öffentlich angezeigt.",
          ],
        },

        controller: {
          title: "Verantwortlicher",
          company: "DEHOGA Hotel- und Gaststättenverband Sachsen e.V.",
          address: "Tharandter Straße 5",
          city: "01159 Dresden",
          country: "Deutschland",
        },

        dataProcessed: {
          title: "Verarbeitete Daten",
          intro:
            "Bei der Registrierung eines Gastgebers und der Nutzung des geschützten Gastgeberbereichs können insbesondere folgende Daten verarbeitet werden:",
          items: [
            "Name des Betriebs",
            "Name des Inhabers oder Ansprechpartners",
            "Anschrift, Postleitzahl, Ort und Region",
            "Betriebsart",
            "Telefonnummer und E-Mail-Adresse",
            "Authentifizierungs- und Anmeldedaten",
            "Registrierungscode und Kontostatus",
            "Mischtisch-Kapazität und Tisch-/Sitzplatzkonfiguration",
            "Buchungstage und Buchungszeiten",
            "Sondertermine, Schließtage und Sonderöffnungszeiten",
            "hochgeladene Fotos",
            "Aktionen, Rabatte und Sonderangebote",
            "für Reservierungsbenachrichtigungen verwendete E-Mail-Adresse",
            "Profil- und Änderungsinformationen",
            "technische Sicherheits-, Verbindungs- und Protokolldaten",
          ],
        },

        purposes: {
          title: "Zwecke und Rechtsgrundlagen",
          text1:
            "Die Daten werden verarbeitet, um das Partnerkonto zu erstellen und zu verwalten, die Teilnahmeberechtigung zu prüfen, das öffentliche Gastgeberprofil anzuzeigen, Mischtisch-Konfigurationen und Buchungszeiten zu verwalten, Reservierungen an den Gastgeber zu übermitteln, Reservierungsbenachrichtigungen zu versenden, die Plattform technisch zu betreiben und zu sichern sowie Missbrauch oder technische Fehler zu erkennen.",
          text2:
            "Soweit die Verarbeitung zur Durchführung der Partnerbeziehung erforderlich ist, erfolgt sie grundsätzlich auf Grundlage von Artikel 6 Absatz 1 Buchstabe b DSGVO. Erforderliche Verarbeitungen zur Sicherheit, zum Betrieb, zur Fehleranalyse und zur Missbrauchsvermeidung können auf Grundlage von Artikel 6 Absatz 1 Buchstabe f DSGVO erfolgen.",
        },

        hosting: {
          title: "Websitezugriff, Hosting und technische Protokolle",
          text1: "Der Gastgeberbereich ist Bestandteil von",
          text2:
            "und wird über Hostinger gehostet. Beim Zugriff auf den Gastgeberbereich können technisch erforderliche Verbindungs- und Serverdaten verarbeitet werden, darunter IP-Adresse, Zugriffszeit, angeforderte Ressourcen, Browser- und Geräteinformationen sowie technische Fehler- oder Sicherheitsdaten.",
          text3:
            "Diese Verarbeitung dient der technischen Bereitstellung der Plattform sowie der Aufrechterhaltung von Stabilität und Sicherheit und erfolgt, soweit erforderlich, auf Grundlage von Artikel 6 Absatz 1 Buchstabe f DSGVO.",
          furtherInfo:
            "Weitere Informationen zum Datenschutz bei Hostinger finden Sie in der",
          hostingerPrivacy: "Datenschutzerklärung von Hostinger",
        },

        firebaseAuth: {
          title: "Firebase Authentication",
          text: "Gastgeberkonten werden über Google Firebase Authentication authentifiziert. Bei der Authentifizierung können Anmeldekennungen, Authentifizierungsinformationen und technische Sicherheitsdaten verarbeitet werden.",
          furtherInfo:
            "Weitere Informationen zum Datenschutz bei Google finden Sie in der",
          googlePrivacy: "Datenschutzerklärung von Google",
        },

        firestore: {
          title: "Cloud Firestore und Cloud Storage for Firebase",
          text1:
            "Profil-, Termin-, Kapazitäts-, Konfigurations- und sonstige Plattformdaten können in Cloud Firestore gespeichert werden.",
          text2:
            "Gastgeberbilder und andere dafür vorgesehene Dateien werden in Cloud Storage for Firebase gespeichert.",
          furtherInfo:
            "Weitere Informationen zum Datenschutz bei Google finden Sie in der",
          googlePrivacy: "Datenschutzerklärung von Google",
        },

        emailNotifications: {
          title: "E-Mail-Benachrichtigungen",
          text: "Reservierungsbenachrichtigungen werden technisch über EmailJS ausgelöst und über ein verbundenes Gmail-Konto von Google versendet. Dabei können die Empfängeradresse, Gastgeberinformationen, Reservierungsdaten und weitere für die jeweilige Benachrichtigung erforderliche Inhalte verarbeitet werden.",
          furtherInfo: "Weitere Informationen finden Sie in der",
          emailjsPrivacy: "Datenschutzvereinbarung von EmailJS",
          and: "und in der",
          googlePrivacy: "Datenschutzerklärung von Google",
        },

        recipients: {
          title: "Empfänger und Dienstleister",
          intro:
            "Personenbezogene Daten von Gastgebern oder deren Ansprechpartnern werden nur weitergegeben, soweit dies für die oben beschriebenen Zwecke erforderlich oder anderweitig gesetzlich zulässig ist. Je nach Funktion können insbesondere folgende Empfänger oder Dienstleister beteiligt sein:",
          items: [
            "Hostinger für Hosting und technischen Betrieb",
            "Google/Firebase für Authentifizierung, Datenbankfunktionen und Bildspeicherung",
            "EmailJS zur technischen Auslösung von Reservierungsbenachrichtigungen",
            "Gmail/Google zum Versand von Reservierungsbenachrichtigungen",
            "Gäste, soweit vom Gastgeber freigegebene öffentliche Profil-, Mischtisch- oder Angebotsinformationen auf der Website angezeigt werden",
          ],
        },

        publicProfile: {
          title: "Öffentliches Gastgeberprofil",
          text1:
            "Öffentlich sichtbare Informationen können insbesondere den Namen des Betriebs, Standort und Region, Betriebsart, freigegebene Bilder, Beschreibung, Mischtisch-Informationen, Buchungsinformationen sowie öffentliche Aktionen oder Angebote umfassen.",
          text2:
            "Anmeldedaten, Authentifizierungsinformationen, interne Sicherheitsinformationen und interne administrative Informationen werden nicht als öffentliche Profildaten veröffentlicht.",
        },

        guestData: {
          title: "Reservierungsdaten von Gästen",
          text1:
            "Reservierungsdaten von Gästen, die einem Gastgeber über Mischtisch Sachsen zur Verfügung gestellt werden, dürfen nur entsprechend den Gastgeberbedingungen und den geltenden datenschutzrechtlichen Vorschriften verwendet werden.",
          text2:
            "Bei einer weiteren Verarbeitung der Gästedaten zur eigenen Reservierungsabwicklung und zur Erbringung eigener gastronomischer oder sonstiger geschäftlicher Leistungen handelt der Gastgeber als eigener Verantwortlicher im Sinne der DSGVO.",
        },

        thirdCountryTransfers: {
          title: "Übermittlungen in Drittländer",
          text1:
            "Bei der Nutzung von Google/Firebase, EmailJS oder anderen technischen Dienstleistern kann eine Verarbeitung personenbezogener Daten außerhalb der Europäischen Union oder des Europäischen Wirtschaftsraums nicht ausgeschlossen werden.",
          text2:
            "Soweit eine Übermittlung in ein Drittland erfolgt, wird diese ausschließlich gemäß Artikel 44 ff. DSGVO durchgeführt. Je nach Dienstleister und Verarbeitung kann die Übermittlung insbesondere auf einem Angemessenheitsbeschluss der Europäischen Kommission oder geeigneten Garantien wie den Standardvertragsklauseln beruhen.",
        },

        retention: {
          title: "Speicherdauer",
          text1:
            "Daten von Gastgebern und Ansprechpartnern werden nur so lange verarbeitet, wie dies für die Verwaltung und Durchführung der Partnerbeziehung, die Bereitstellung der Plattform oder die Erfüllung gesetzlicher Pflichten erforderlich ist.",
          text2:
            "Nach Beendigung eines Gastgeberkontos werden die Daten gelöscht, sobald sie nicht mehr zur Abwicklung der Partnerbeziehung, zur Erfüllung gesetzlicher Aufbewahrungs- oder Nachweispflichten oder zur Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen erforderlich sind.",
          text3:
            "Öffentliche Bilder und Profilinhalte werden nach Löschung oder Beendigung des betreffenden Profils nicht mehr öffentlich angezeigt, sofern keine andere Rechtsgrundlage eine weitere Verarbeitung erfordert. Begrenzte technische Sicherungskopien können für einen Wiederherstellungszeitraum bestehen bleiben.",
          text4:
            "Technische Protokoll- und Sicherheitsdaten werden nur so lange aufbewahrt, wie dies für Betrieb, Sicherheit, Fehleranalyse oder die Untersuchung konkreter Sicherheitsvorfälle erforderlich ist.",
        },

        rights: {
          title: "Rechte der betroffenen Personen",
          intro:
            "Betroffene Personen können vorbehaltlich der gesetzlichen Voraussetzungen insbesondere folgende Rechte haben:",
          items: [
            "Auskunft",
            "Berichtigung",
            "Löschung",
            "Einschränkung der Verarbeitung",
            "Datenübertragbarkeit, sofern die gesetzlichen Voraussetzungen erfüllt sind",
            "Widerspruch gegen eine Verarbeitung auf Grundlage von Artikel 6 Absatz 1 Buchstabe e oder f DSGVO",
            "Widerruf einer Einwilligung mit Wirkung für die Zukunft, sofern die Verarbeitung auf einer Einwilligung beruht",
          ],
          requests: "Anfragen können an",
        },

        complaint: {
          title: "Recht auf Beschwerde",
          text: "Betroffene Personen haben das Recht, sich bei einer zuständigen Datenschutzaufsichtsbehörde über die Verarbeitung ihrer personenbezogenen Daten zu beschweren.",
        },

        changes: {
          title: "Änderungen dieses Hinweises",
          text: "Dieser Datenschutzhinweis für Gastgeber wird aktualisiert, wenn sich Funktionen des Gastgeberbereichs, Dienstleister, Verarbeitungstätigkeiten oder rechtliche Anforderungen ändern.",
        },
      },
    },
    privacyPolicy: {
      header: {
        eyebrow: "Datenschutz",
        title: "Datenschutzerklärung",
        // updated: "Zuletzt aktualisiert: 19. August 2026",
      },

      contact: {
        phone: "Telefon",
        email: "E-Mail",
      },

      sections: {
        privacyAtGlance: {
          title: "Datenschutz auf einen Blick",
          intro:
            "Die folgenden Informationen geben einen verständlichen Überblick darüber, wie personenbezogene Daten im Zusammenhang mit Mischtisch Sachsen verarbeitet werden.",
          items: [
            "Gäste benötigen derzeit kein Benutzerkonto, um eine Reservierung vorzunehmen.",
            "Reservierungsdaten werden erhoben, wenn ein Gast über die Plattform eine Reservierung vornimmt.",
            "Die für die Reservierung erforderlichen Informationen werden an den vom Gast ausgewählten Gastgeber übermittelt.",
            "Gastgeber nutzen einen geschützten Gastgeberbereich mit Authentifizierung.",
            "Mischtisch Sachsen verwendet derzeit keine Werbe- oder Analyse-Tracker und erstellt keine Werbeprofile.",
            "Mischtisch Sachsen verarbeitet keine Online-Zahlungen.",
          ],
        },

        controller: {
          title: "Verantwortlicher",
          intro:
            "Verantwortlich für den Betrieb der Plattform Mischtisch Sachsen ist:",
          country: "Deutschland",
          privacyRequests:
            "Dieselbe E-Mail-Adresse kann für Datenschutzanfragen verwendet werden.",
        },

        hosting: {
          title: "Website-Zugriff, Hosting und Server-Logdateien",
          text1: "Die Website",
          text2:
            "wird mit Hostinger gehostet. Beim Zugriff auf die Website können technisch notwendige Verbindungs- und Serverdaten verarbeitet werden. Dazu können die IP-Adresse, Datum und Uhrzeit des Zugriffs, die angeforderte Seite oder Ressource, Informationen über Browser und Gerät, Referrer-Informationen sowie technische Fehler- oder Sicherheitsdaten gehören.",
          text3:
            "Diese Daten werden verarbeitet, um die Website technisch bereitzustellen, die Stabilität und Sicherheit des Dienstes zu gewährleisten, Fehler zu erkennen und Missbrauch zu verhindern. Soweit die Verarbeitung nicht bereits zur Erbringung der angeforderten Leistung erforderlich ist, erfolgt sie auf Grundlage von Artikel 6 Absatz 1 Buchstabe f DSGVO. Das berechtigte Interesse liegt im sicheren und zuverlässigen Betrieb der Plattform.",
          text4:
            "Weitere Informationen zu den Datenschutzpraktiken von Hostinger finden Sie unter",
          furtherInfo:
            "Weitere Informationen zu den Datenschutzpraktiken von Hostinger finden Sie unter",
        },

        ssl: {
          title: "SSL/TLS-Verschlüsselung",
          text1:
            "Mischtisch Sachsen wird über eine verschlüsselte HTTPS-Verbindung bereitgestellt. Die SSL/TLS-Verschlüsselung schützt die zwischen dem Browser des Nutzers und der Plattform übertragenen Daten. Eine verschlüsselte Verbindung ist grundsätzlich am",
          text2:
            "Protokoll und dem entsprechenden Sicherheitssymbol im Browser erkennbar.",
          text3:
            "Trotz geeigneter technischer Schutzmaßnahmen kann eine absolut sichere Datenübertragung über das Internet nicht garantiert werden.",
        },

        reservations: {
          title: "Reservierungen durch Gäste",
          intro:
            "Gäste benötigen derzeit kein Benutzerkonto und keine Registrierung, um eine Reservierung vorzunehmen.",
          dataIntro:
            "Im Rahmen einer Reservierung können insbesondere folgende personenbezogene Daten verarbeitet werden:",
          items: [
            "Vor- und Nachname",
            "E-Mail-Adresse",
            "Telefonnummer",
            "Postanschrift",
            "Anzahl der reservierten Plätze",
            "ausgewähltes Datum und ausgewählte Uhrzeit",
            "optionale Nachricht des Gastes",
            "ausgewählter Gastgeber",
            "technische Reservierungs-, Verfügbarkeits- und Bestätigungsinformationen",
          ],
          text1:
            "Die Informationen werden verwendet, um die angefragte Verfügbarkeitsprüfung durchzuführen, die Reservierung an den ausgewählten Gastgeber zu übermitteln, die Reservierung zu dokumentieren und die erforderlichen Bestätigungs- und Benachrichtigungs-E-Mails zu versenden.",
          text2:
            "Soweit die Verarbeitung zur Durchführung der vom Gast angeforderten Reservierungs- und Vermittlungsleistung erforderlich ist, erfolgt sie grundsätzlich auf Grundlage von Artikel 6 Absatz 1 Buchstabe b DSGVO. Zusätzliche Verarbeitungen, die für die Sicherheit des Dienstes, die Verhinderung von Missbrauch oder die technische Fehleranalyse erforderlich sind, können auf Artikel 6 Absatz 1 Buchstabe f DSGVO gestützt werden.",
          text3:
            "Freitextfelder sollten nicht zur Übermittlung besonderer Kategorien personenbezogener Daten oder anderer besonders sensibler Informationen verwendet werden, sofern diese Informationen nicht tatsächlich für die Reservierung erforderlich sind.",
        },

        selectedHost: {
          title: "Weitergabe an den ausgewählten Gastgeber",
          text1:
            "Für eine Reservierung erforderliche personenbezogene Daten werden an den vom Gast ausgewählten Gastgeber weitergegeben. Der Gastgeber benötigt diese Informationen zur Bearbeitung der Reservierung und gegebenenfalls zur Kontaktaufnahme mit dem Gast im Zusammenhang mit dieser Reservierung.",
          text2:
            "DEHOGA Sachsen e.V. ist für die Verarbeitung verantwortlich, die zum Betrieb der Mischtisch-Plattform und zur Übermittlung der Reservierung erforderlich ist.",
          text3:
            "Nach Erhalt der Reservierungsdaten verarbeitet der ausgewählte Gastgeber diese in eigener Verantwortung, um die Reservierung zu verwalten und seine eigenen gastronomischen oder geschäftlichen Leistungen zu erbringen. Für diese nachgelagerte Verarbeitung ist der Gastgeber ein eigener Verantwortlicher im Sinne der DSGVO.",
          text4:
            "Kontaktdaten des ausgewählten Gastgebers werden im Buchungsprozess oder in der Gastgeberdarstellung bereitgestellt, damit Gäste den betreffenden Betrieb identifizieren und gegebenenfalls direkt kontaktieren können.",
        },

        email: {
          title: "Reservierungsbestätigungen und E-Mail-Benachrichtigungen",
          text1:
            "Nach einer erfolgreichen Reservierung wird eine Bestätigung an den Gast und eine Benachrichtigung an den ausgewählten Gastgeber gesendet.",
          text2: "wird als technische E-Mail-Integration verwendet.",
          text3: "wird als mit EmailJS verbundener E-Mail-Dienst verwendet.",
          text4:
            "Der E-Mail-Versand kann den Namen und die E-Mail-Adresse des Gastes, den ausgewählten Gastgeber, das Reservierungsdatum und die Reservierungszeit, die Anzahl der Plätze sowie weitere für die Bestätigungsnachricht erforderliche Reservierungsinformationen verarbeiten.",
          text5:
            "Transaktionale Reservierungs-E-Mails werden grundsätzlich auf Grundlage von Artikel 6 Absatz 1 Buchstabe b DSGVO verarbeitet. Technisch notwendige Zustellungs- und Sicherheitsverarbeitungen können auf Artikel 6 Absatz 1 Buchstabe f DSGVO gestützt werden.",
          furtherInfo:
            "Weitere Informationen finden Sie in den Datenschutzinformationen der jeweiligen Anbieter, unter anderem unter",
          and: "und",
        },

        firebase: {
          title: "Google Firebase",
          intro:
            "Google-Firebase-Dienste werden für technische Funktionen der Plattform verwendet.",

          authentication: {
            title: "Firebase Authentication",
            text: "Firebase Authentication wird ausschließlich für Gastgeberkonten verwendet. Gäste benötigen derzeit kein Benutzerkonto. Im Rahmen der Authentifizierung können Authentifizierungskennungen, technische Authentifizierungsinformationen und Sicherheitsdaten verarbeitet werden.",
          },

          firestore: {
            title: "Cloud Firestore",
            text: "Cloud Firestore wird zur Speicherung von Plattform-, Gastgeber- und Reservierungsdaten verwendet. Dazu können Gastgeberprofile, Mischtisch-Konfigurationen, Buchungszeiten, Reservierungsinformationen und technische Statusinformationen gehören.",
          },

          storage: {
            title: "Cloud Storage for Firebase",
            text: "Cloud Storage for Firebase wird zur Speicherung von Gastgeberbildern und anderen dafür vorgesehenen Dateien verwendet.",
          },

          furtherInfo:
            "Weitere Informationen zu den Datenschutzpraktiken von Google finden Sie unter",
        },

        storage: {
          title: "Technisch notwendiger Browser-Speicher",
          intro:
            "Die Plattform kann technisch notwendigen Browser-Speicher, Tokens oder vergleichbare Technologien verwenden, soweit dies zur Bereitstellung angeforderter Funktionen erforderlich ist. Dazu können gehören:",
          items: [
            "Anmeldung und Sitzungsverwaltung für Gastgeber",
            "Sicherheits- und Authentifizierungsinformationen",
            "Spracheinstellungen",
            "technisch notwendiger Formular- oder Sitzungsstatus",
          ],
          text: "Derzeit sind keine Analyse-, Werbe- oder Marketing-Tracker vorgesehen. Sollten künftig nicht erforderliche Tracking-, Analyse- oder Marketingtechnologien eingeführt werden, müssen die Datenschutz- und Einwilligungsinformationen vor deren Einsatz aktualisiert werden.",
        },

        recipients: {
          title: "Empfänger und Dienstleister",
          intro:
            "Personenbezogene Daten werden nur weitergegeben, soweit dies für die oben beschriebenen Zwecke erforderlich ist oder eine andere Rechtsgrundlage die Weitergabe erlaubt oder vorschreibt. Je nach Nutzung der Plattform können insbesondere folgende Empfänger oder Dienstleister beteiligt sein:",
          items: [
            "der vom Gast ausgewählte Gastgeber zur Bearbeitung der Reservierung",
            "Hostinger für Hosting und technischen Betrieb der Website",
            "Google/Firebase für Gastgeber-Authentifizierung, Datenbankfunktionen und Bildspeicherung",
            "EmailJS zur technischen Auslösung von Reservierungs-E-Mails",
            "Gmail/Google zum Versand von Reservierungs-E-Mails",
          ],
          text: "Eine darüber hinausgehende Weitergabe erfolgt nur, soweit sie gesetzlich zulässig oder vorgeschrieben ist.",
        },

        thirdCountries: {
          title: "Übermittlungen in Drittländer",
          text1:
            "Bei der Nutzung einzelner technischer Dienstleister kann eine Verarbeitung personenbezogener Daten außerhalb der Europäischen Union oder des Europäischen Wirtschaftsraums nicht ausgeschlossen werden.",
          text2:
            "Soweit personenbezogene Daten in ein Drittland übermittelt werden, erfolgt dies ausschließlich im Einklang mit Artikel 44 ff. DSGVO. Je nach Anbieter und Verarbeitungsvorgang kann die Übermittlung insbesondere auf einem Angemessenheitsbeschluss der Europäischen Kommission oder geeigneten Garantien wie den Standardvertragsklauseln der Europäischen Kommission beruhen.",
        },

        automated: {
          title: "Keine automatisierte Entscheidungsfindung",
          text1:
            "Mischtisch Sachsen verwendet derzeit keine ausschließlich automatisierte Entscheidungsfindung oder Profiling im Sinne von Artikel 22 DSGVO.",
          text2:
            "Eine Reservierung kann nur bestätigt werden, wenn bei der abschließenden Buchungsprüfung ausreichend Plätze verfügbar sind. Diese technische Verfügbarkeitsprüfung dient der korrekten Abwicklung der Reservierung und stellt kein Profiling des Gastes dar.",
        },

        retention: {
          title: "Speicherdauer",
          text1:
            "Personenbezogene Daten werden nur so lange gespeichert, wie dies für den jeweiligen Verarbeitungszweck erforderlich ist oder gesetzliche Aufbewahrungs- oder Nachweispflichten eine weitere Speicherung erfordern.",
          text2:
            "Reservierungsdaten werden zur Bearbeitung und Dokumentation der Reservierung gespeichert. Sobald diese Zwecke entfallen und kein gesetzlicher oder sonstiger berechtigter Grund für eine weitere Speicherung besteht, werden die Daten gelöscht oder anonymisiert.",
          text3:
            "Daten von Gastgeberkonten und öffentlichen Gastgeberprofilen werden grundsätzlich für die Dauer der aktiven Teilnahme an Mischtisch Sachsen verarbeitet. Nach Beendigung eines Partnerkontos werden die Daten gelöscht, sobald sie nicht mehr zur Abwicklung der Partnerbeziehung, zur Erfüllung gesetzlicher Pflichten oder zur Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen erforderlich sind.",
          text4:
            "Technische Sicherheits- und Server-Logs werden nur so lange gespeichert, wie dies für Betrieb, Sicherheit, Fehleranalyse oder die Untersuchung konkreter Sicherheitsvorfälle erforderlich ist. Die tatsächliche Dauer kann von der technischen Konfiguration und den eingesetzten Dienstleistern abhängen.",
          text5:
            "Besteht ein konkreter Rechtsstreit oder werden Daten zur Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen benötigt, können die erforderlichen Unterlagen für die Dauer dieses Zwecks separat und mit eingeschränktem Zugriff gespeichert werden.",
        },

        rights: {
          title: "Betroffenenrechte",
          intro:
            "Vorbehaltlich der gesetzlichen Voraussetzungen können betroffene Personen insbesondere folgende Rechte haben:",
          items: [
            "Auskunft über die verarbeiteten personenbezogenen Daten",
            "Berichtigung unrichtiger Daten und Vervollständigung unvollständiger Daten",
            "Löschung personenbezogener Daten",
            "Einschränkung der Verarbeitung",
            "Datenübertragbarkeit, soweit die gesetzlichen Voraussetzungen erfüllt sind",
            "Widerspruch gegen eine Verarbeitung auf Grundlage von Artikel 6 Absatz 1 Buchstabe e oder f DSGVO",
            "Widerruf einer Einwilligung mit Wirkung für die Zukunft, soweit die Verarbeitung auf einer Einwilligung beruht",
          ],
          requests: "Anfragen können an",
          hostProcessing:
            "Soweit ein ausgewählter Gastgeber Reservierungsdaten anschließend in eigener Verantwortung verarbeitet, können sich Anfragen bezüglich dieser Verarbeitung auch an den jeweiligen Gastgeber richten.",
        },

        complaint: {
          title: "Recht auf Beschwerde",
          text: "Betroffene Personen haben das Recht, sich bei einer zuständigen Datenschutzaufsichtsbehörde über die Verarbeitung ihrer personenbezogenen Daten zu beschweren.",
        },

        changes: {
          title: "Änderungen dieser Datenschutzerklärung",
          text: "Diese Datenschutzerklärung wird aktualisiert, wenn sich Plattformfunktionen, Dienstleister, Verarbeitungstätigkeiten oder gesetzliche Anforderungen ändern. Es gilt jeweils die auf Mischtisch Sachsen veröffentlichte Fassung.",
        },
      },
    },

    termsUses: {
      header: {
        eyebrow: "Reservierungen",
        title: "Nutzungs- und Reservierungsbedingungen",
        // updated: "Zuletzt aktualisiert: 19. August 2026",
      },

      sections: {
        platformRole: {
          title: "Rolle der Plattform",
          text: "Mischtisch Sachsen wird von DEHOGA Sachsen e.V. betrieben und fungiert als Vermittler zwischen Gästen und teilnehmenden Gastgebern. DEHOGA Sachsen e.V. erbringt die gastronomischen oder sonstigen Leistungen des Gastgebers nicht selbst und wird allein dadurch, dass eine Reservierung über die Plattform vorgenommen wird, nicht zum Anbieter dieser Leistungen.",
        },

        minimumAge: {
          title: "Mindestalter",
          text: "Reservierungen dürfen nur von Personen vorgenommen werden, die mindestens 18 Jahre alt sind. Wer mehrere Plätze reserviert, bestätigt, dass er zur Reservierung für die mitreisenden oder begleitenden Personen berechtigt ist.",
        },

        reservation: {
          title: "Reservierung",
          text: "Der Gast wählt den Gastgeber, das Datum, die Uhrzeit und die Anzahl der Plätze aus und gibt die erforderlichen Kontaktdaten an. Die angezeigte Verfügbarkeit stellt noch keine Bestätigung dar. Eine Reservierung wird erst bestätigt, wenn die abschließende Verfügbarkeitsprüfung erfolgreich ist und eine Bestätigung angezeigt und/oder per E-Mail versendet wird.",
        },

        multipleSeats: {
          title: "Mehrere Plätze",
          text: "Sofern ausreichende Kapazitäten vorhanden sind, können mehrere Plätze mit einer Buchung reserviert werden. Der Gast ist dafür verantwortlich, die korrekte Anzahl der Plätze anzugeben.",
        },

        accuracy: {
          title: "Richtigkeit der Angaben",
          text: "Die Angaben zur Reservierung müssen vollständig und korrekt sein. Falsche Kontaktdaten können dazu führen, dass wichtige Nachrichten zur Reservierung nicht zugestellt werden können.",
        },

        changesCancellations: {
          title: "Änderungen und Stornierungen",
          text: "Mischtisch Sachsen bietet derzeit keine Selbstbedienungsfunktionen für Gäste zum Ändern, Umbuchen oder Stornieren von Reservierungen an. Gäste können sich direkt an den ausgewählten Gastgeber wenden. Ob und unter welchen Bedingungen eine gewünschte Änderung oder Stornierung akzeptiert wird, hängt von den Umständen und den jeweiligen Bedingungen des Gastgebers ab. Mischtisch Sachsen übernimmt keine Garantie dafür, dass eine gewünschte Änderung oder Stornierung akzeptiert wird.",
        },

        hostChanges: {
          title: "Änderungen durch Gastgeber",
          text: "Die aktuelle Plattform bietet keine Stornierungsfunktion für Gastgeber. Sollte ein Gastgeber eine bestätigte Reservierung ausnahmsweise nicht einhalten können, ist er dafür verantwortlich, den betroffenen Gast nach Möglichkeit direkt über die verfügbaren Kontaktdaten zu informieren.",
        },

        pricesPayments: {
          title: "Preise und Zahlungen",
          text: "Mischtisch Sachsen verarbeitet keine Online-Zahlungen. Kosten für Speisen, Getränke, Übernachtungen oder sonstige Leistungen des Gastgebers werden direkt zwischen Gast und Gastgeber abgewickelt.",
        },

        promotionsDiscounts: {
          title: "Aktionen, Rabatte und Sonderangebote",
          text1:
            "Gastgeber können Aktionen, Rabatte und Sonderangebote veröffentlichen. Die auf Mischtisch Sachsen angezeigten Informationen zu diesen Angeboten werden vom jeweiligen Gastgeber bereitgestellt.",
          text2:
            "Der Gastgeber ist für den Inhalt, die Teilnahmevoraussetzungen, den Gültigkeitszeitraum, die Verfügbarkeit, die Preis- oder Rabattangaben und die Einlösebedingungen des Angebots verantwortlich. Es gelten die beim Angebot angegebenen Bedingungen.",
        },

        availabilityErrors: {
          title: "Verfügbarkeit und technische Fehler",
          text: "Die Verfügbarkeit kann sich durch gleichzeitig vorgenommene Reservierungen ändern. Maßgeblich ist die abschließende technische Prüfung unmittelbar vor der Bestätigung. DEHOGA Sachsen e.V. gewährleistet keinen jederzeit unterbrechungs- oder fehlerfreien Betrieb der Plattform.",
        },

        prohibitedUse: {
          title: "Unzulässige Nutzung",
          text: "Unzulässiges Verhalten umfasst insbesondere automatisierte Massenreservierungen, wissentlich falsche Reservierungsdaten, technische Manipulationen, Angriffe auf die Plattform sowie eine rechtswidrige Nutzung.",
        },

        liability: {
          title: "Haftung",
          text: "Es gelten die gesetzlichen Haftungsregelungen. DEHOGA Sachsen e.V. ist nicht für die ordnungsgemäße Erbringung der eigenen gastronomischen oder sonstigen Leistungen des Gastgebers verantwortlich, soweit DEHOGA diese Leistungen nicht selbst erbringt und keine weitergehende gesetzliche Verantwortung besteht. Zwingende gesetzliche Ansprüche bleiben unberührt.",
        },

        privacy: {
          title: "Datenschutz",
          text: "Für die Verarbeitung personenbezogener Daten gilt die Datenschutzerklärung von Mischtisch Sachsen.",
          link: "Datenschutzerklärung",
        },

        governingLaw: {
          title: "Anwendbares Recht",
          text: "Es gilt deutsches Recht. Zwingende Verbraucherschutzvorschriften bleiben unberührt.",
        },
      },
    },

    hostTerms: {
      header: {
        eyebrow: "Für Gastgeber",
        title: "Bedingungen für Gastgeber",
        // updated: "Zuletzt aktualisiert: 19. August 2026",
      },

      sections: {
        registration: {
          title: "Registrierung",
          text: "Ein Gastgeberkonto darf nur mit einem vom Plattformbetreiber generierten oder genehmigten Registrierungscode erstellt werden. Der Gastgeber muss bei der Registrierung und bei der Pflege des Profils vollständige, korrekte und aktuelle Angaben machen.",
        },

        credentials: {
          title: "Zugangsdaten",
          text: "Der Gastgeber ist für den Schutz seiner Zugangsdaten verantwortlich. Zugangsdaten dürfen nicht an unbefugte Personen weitergegeben werden. Ein vermuteter Missbrauch, Verlust oder unbefugter Zugriff ist DEHOGA Sachsen e.V. unverzüglich zu melden.",
        },

        oneTable: {
          title: "Ein Mischtisch pro Gastgeber",
          text: "Nach dem derzeitigen Plattformmodell verwaltet jeder Gastgeber einen Mischtisch. Der Gastgeber pflegt die Kapazität, die Tisch- bzw. Sitzplatzkonfiguration und die buchbaren Zeiten innerhalb der aktuell bereitgestellten Funktionen.",
        },

        schedules: {
          title: "Zeiten und Kapazitäten",
          text: "Veröffentlichte Buchungstage, Zeiten, Kapazitäten, Sonderöffnungen, Schließtage und andere für die Verfügbarkeit relevante Angaben müssen korrekt und aktuell gehalten werden. Der Gastgeber ist dafür verantwortlich, Änderungen rechtzeitig in der Plattform einzutragen.",
        },

        scheduleChanges: {
          title: "Schutz bestehender Reservierungen bei Änderungen der Zeiten",
          text1:
            "Wenn für einen Wochentag bereits bestätigte Reservierungen bestehen, werden diese bestehenden Reservierungen durch eine Änderung des wiederkehrenden Wochenplans nicht geändert.",
          text2:
            "In diesem Fall gelten Änderungen der regulären buchbaren Zeiten für diesen Wochentag erst ab dem nächsten Auftreten des betreffenden Wochentags. Der Gastgeber bleibt dafür verantwortlich, bereits nach dem ursprünglichen Zeitplan bestätigte Reservierungen zu beachten und einzuhalten, sofern im Einzelfall keine abweichende Vereinbarung direkt mit dem Gast getroffen wird.",
          text3:
            "Für Wochentage ohne geschützte bestätigte Reservierungen können Änderungen für neue Buchungen sofort wirksam werden, soweit dies innerhalb der tatsächlich implementierten Funktionen der Plattform vorgesehen ist.",
        },

        reservations: {
          title: "Reservierungen",
          text1:
            "Der Gastgeber erhält die für eine Reservierung erforderlichen Gästedaten und darf diese nur für die Bearbeitung der Reservierung, die Kommunikation mit dem Gast und unmittelbar damit verbundene geschäftliche Dienstleistungen verwenden, sofern keine andere rechtliche Grundlage besteht.",
          text2:
            "Die aktuelle Plattform bietet keine Stornierungsfunktion für Gastgeber. Kann eine bestätigte Reservierung ausnahmsweise nicht eingehalten werden, muss der Gastgeber den betroffenen Gast, soweit zumutbar möglich, über die verfügbaren Kontaktdaten direkt kontaktieren.",
        },

        content: {
          title: "Fotos, Logos und sonstige Inhalte",
          text1:
            "Der Gastgeber darf nur Fotos, Logos, Texte und sonstige Materialien hochladen oder veröffentlichen, für die er über die erforderlichen Rechte und Genehmigungen verfügt.",
          text2:
            "Dies umfasst insbesondere Urheberrechte, Marken- und sonstige Kennzeichenrechte, Bild- und Persönlichkeitsrechte identifizierbarer Personen sowie erforderliche Nutzungsrechte für gewerblich bereitgestellte Bilder.",
        },

        promotions: {
          title: "Aktionen, Rabatte und Sonderangebote",
          text1:
            "Der Gastgeber ist für die Richtigkeit und Transparenz aller über Mischtisch Sachsen veröffentlichten Aktionen, Rabatte und Sonderangebote verantwortlich.",
          text2:
            "Soweit relevant, muss der Gastgeber den Inhalt des Angebots, den Gültigkeitszeitraum, Teilnahme- oder Einlösebedingungen, Einschränkungen, Preis oder Rabatt sowie die Verfügbarkeit klar angeben.",
          text3:
            "Erhält DEHOGA Sachsen e.V. einen glaubhaften Hinweis darauf, dass veröffentlichte Inhalte irreführend, rechtswidrig oder offensichtlich falsch sein könnten, kann DEHOGA den Gastgeber auffordern, diese zu korrigieren oder zu deaktivieren. In schwerwiegenden oder wiederholten Fällen können die öffentliche Sichtbarkeit oder das Partnerkonto während der Prüfung vorübergehend eingeschränkt werden.",
        },

        privacy: {
          title: "Datenschutz und Vertraulichkeit",
          text1:
            "Für personenbezogene Gästedaten, die der Gastgeber erhält und anschließend für die eigene Reservierungsverwaltung verarbeitet, ist der Gastgeber nach dem Datenschutzrecht eigenständig Verantwortlicher.",
          text2:
            "Ohne eine eigene rechtliche Grundlage dürfen Gästedaten nicht für Werbung verwendet, an unbeteiligte Dritte weitergegeben oder für Zwecke verwendet werden, die nicht mit der Reservierung oder der eigenen Leistung des Gastgebers zusammenhängen.",
          text3:
            "Der Gastgeber muss sicherstellen, dass nur autorisierte Personen auf Reservierungsdaten zugreifen können, und angemessene technische und organisatorische Schutzmaßnahmen anwenden.",
          text4:
            "Soweit der Gastgeber gesetzlich verpflichtet ist, betroffene Personen über eine Verarbeitung in eigener Verantwortung zu informieren, ist der Gastgeber für die Bereitstellung seiner eigenen Datenschutzhinweise verantwortlich.",
        },

        publicProfile: {
          title: "Öffentliche Profilinformationen",
          text: "Öffentlich sichtbare Informationen können den Namen des Betriebs, Standort und Region, Betriebsart, öffentliche Kontaktdaten, Bilder, Beschreibung, Mischtisch-Zeiten, Sondertermine sowie öffentliche Aktionen oder Angebote umfassen. Der Gastgeber ist dafür verantwortlich, diese Informationen korrekt und aktuell zu halten.",
        },

        technical: {
          title: "Technischer Betrieb",
          text: "DEHOGA Sachsen e.V. bemüht sich um die Bereitstellung einer zuverlässigen Plattform, garantiert jedoch keine jederzeit unterbrechungsfreie oder fehlerfreie Verfügbarkeit. Wartungsarbeiten, Sicherheitsmaßnahmen, technische Störungen oder externe Dienstleister können die Verfügbarkeit vorübergehend einschränken.",
        },

        suspension: {
          title: "Sperrung und Beendigung",
          text1:
            "Der Gastgeber kann die Deaktivierung seines Partnerkontos beantragen.",
          text2:
            "DEHOGA Sachsen e.V. kann ein Konto vorübergehend sperren oder die Teilnahme beenden, insbesondere bei falschen oder irreführenden Angaben, Missbrauch der Plattform, Sicherheitsrisiken, Rechtsverstößen, unsachgemäßer Verwendung von Gästedaten oder wiederholten schwerwiegenden Problemen mit Reservierungen.",
        },

        liability: {
          title: "Haftung",
          text: "Es gelten die gesetzlichen Haftungsregelungen. Der Gastgeber bleibt für seine eigenen Leistungen, Inhalte, Preise, Angebote und die Erfüllung bestätigter Reservierungen verantwortlich.",
        },
      },
    },
  },

  en: {
    "beleg.ReservationConfirmation": "Reservation confirmation",
    "beleg.Venue": "Venue",
    "beleg.Date": "Date",
    "beleg.Time": "Time",
    "beleg.People": "People",
    "beleg.ClockSuffix": "",
    "beleg.OnePerson": "1 person",
    "beleg.ManyPeople": "{count} people",
    "beleg.Chair": "chair",
    "beleg.Guest": "Guest",
    "beleg.Contact": "Contact",
    "beleg.Address": "Address",
    "beleg.Promotion": "Promotion",
    "beleg.Message": "Message",
    "beleg.VenueReachable": "Venue reachable",
    //"beleg.Footnote": "At a Mischtisch, guests share one table. What is booked are seats, not the whole table. If you cannot make it, please tell the venue or cancel under "My seats".",

    "footer.legal": "Legal",
    "footer.imprint": "Imprint",
    "footer.privacy": "Privacy policy",
    "footer.terms": "Terms of use & reservation",
    "footer.accessibility": "Accessibility",
    "footer.forHosts": "For hosts",
    "footer.hostTerms": "Terms for hosts",
    "footer.hostPrivacy": "Host Privacy Notice",
    "footer.tagline": "Mischtisch Saxony · 2026",
    "footer.homeAria": "Go to homepage",
    "footer.legalNavAria": "Legal links",
    "footer.hostNavAria": "Links for hosts",
    "footer.logoAlt": "Mischtisch Saxony – DEHOGA Saxony",

    accessibilityPage: {
      eyebrow: "Accessibility",
      title: "Accessibility",
      lastUpdated: "Last updated: 19 August 2026",

      ourGoal: {
        title: "Our Goal",
        paragraphs: [
          "Mischtisch Saxony is intended to be perceivable, operable, understandable and robust for as many users as possible without unnecessary assistance.",
          "Mischtisch Saxony aims to take into account the legal digital-accessibility requirements applicable to the service. These include, in particular, the requirements of the German Accessibility Strengthening Act (BFSG) and its implementing regulation (BFSGV) where they apply to the service, together with relevant technical standards for accessible digital services.",
        ],
      },

      creationUpdate: {
        title: "Creation and Update Date",
        text: "This statement was created in August 2026 and was last updated on 19 August 2026.",
      },

      serviceDescription: {
        title: "Description of the Service",
        paragraphs: [
          "Mischtisch Saxony allows users in particular to find participating hosts, search by region and date, view host information and offers, check reservation options, choose reservation times, reserve multiple seats and receive a reservation confirmation.",
          "Hosts can sign in to a protected area and manage their Mischtisch information, booking times, special dates, offers, reservations and profile information within the functions currently provided.",
        ],
      },

      measures: {
        title: "Accessibility Measures",
        intro:
          "The development, redesign and maintenance of the platform take into account in particular:",
        items: [
          "keyboard operation",
          "visible and understandable focus indicators",
          "meaningful semantic heading structures and forms",
          "clear labels for form fields and controls",
          "understandable notices and error messages",
          "sufficient colour contrast",
          "alternative text for meaningful images",
          "information that is not conveyed by colour alone",
          "responsive and scalable presentation",
          "logical order and labelling for screen readers",
          "understandable German and English content",
          "accessible authentication and reservation flows",
        ],
      },

      currentStatus: {
        title: "Current Conformance Status",
        paragraphs: [
          "The platform is currently being redesigned. Accessibility is being technically and editorially reviewed and improved as part of the relaunch.",
          "Until a complete and documented accessibility assessment has been completed, the platform does not claim unconditional conformance with a particular WCAG conformance level or technical standard.",
        ],
      },

      reportBarrier: {
        title: "Report an Accessibility Barrier",
        intro:
          "If you encounter an accessibility barrier or need information in a more accessible form, please contact:",
        company: "DEHOGA Hotel- und Gaststättenverband Sachsen e.V.",
        address: ["Tharandter Straße 5", "01159 Dresden"],
        emailLabel: "Email",
        email: "info@dehoga-sachsen.de",
        phoneLabel: "Phone",
        phone: "+49 (0)351 428 95 10",
        text: "Where possible, please identify the affected page or function, the barrier encountered and, where useful for investigation, the device or assistive technology being used.",
      },

      updates: {
        title: "Updates to This Statement",
        text: "This statement will be updated if the service functionality, verified accessibility status or legal requirements applicable to Mischtisch Saxony change.",
      },
    },
    imprint: {
      eyebrow: "Provider Information",
      title: "Imprint",
      lastUpdated: "Last updated: 19 August 2026",

      provider: {
        title: "Provider",
        company: "DEHOGA Hotel- und Gaststättenverband Sachsen e.V.",
        companyShort: "(DEHOGA Sachsen e.V.)",
        address: "Tharandter Straße 5",
        city: "01159 Dresden",
        country: "Germany",
        phone: "Phone:",
        email: "Email:",
        website: "Website:",
      },

      representative: {
        title: "Authorised Representative",
        text: "Represented by the Managing Director (Hauptgeschäftsführer):",
        name: "Axel Klein",
      },

      register: {
        title: "Register",
        text: "Registered in the register of associations.",
        court: "Register court: Amtsgericht Dresden",
        number: "Registration number: 1104",
      },

      mischtisch: {
        title: "Mischtisch Saxony",
        text1:
          "Mischtisch Saxony is a reservation-intermediary platform operated by DEHOGA Sachsen e.V. for participating restaurants, cafés, hotels and other hosts.",
        text2:
          "DEHOGA Sachsen e.V. is not the provider of the hospitality services supplied by an individual host. Unless otherwise required by law, the selected host is responsible for its food, drinks, events, opening hours, prices, on-site services and host-provided information.",
      },

      consumerDispute: {
        title: "Consumer Dispute Resolution",
        text: "DEHOGA Sachsen e.V. is neither willing nor obliged to participate in dispute-resolution proceedings before a consumer arbitration board.",
      },

      contentRights: {
        title: "Content and Image Rights",
        text: "Original content is subject to applicable copyright law. Photos, logos, descriptions and other material supplied by participating hosts remain the responsibility of the respective host. Hosts may upload or publish only material for which they hold the necessary rights.",
      },
    },

    hostPrivacy: {
      header: {
        label: "For Hosts",
        title: "Host Privacy Notice",
        updated: "Last updated: 19 August 2026",
      },

      contact: {
        email: "Email",
        phone: "Phone",
      },

      sections: {
        privacyAtGlance: {
          title: "Privacy at a Glance",
          text: "This Host Privacy Notice describes the processing of personal data relating to hosts and their contact persons in connection with registration, the protected host area and use of Mischtisch Saxony.",
          items: [
            "Host accounts are created using a registration code generated or approved by the platform.",
            "Authentication for the host area uses Firebase Authentication.",
            "Host and configuration data is processed through the technical platform, including Cloud Firestore.",
            "Host images are stored using Cloud Storage for Firebase.",
            "Reservation notifications are technically sent using EmailJS and Gmail/Google.",
            "Certain host-approved profile, image, Mischtisch and offer information is displayed publicly.",
          ],
        },

        controller: {
          title: "Controller",
          company: "DEHOGA Hotel- und Gaststättenverband Sachsen e.V.",
          address: "Tharandter Straße 5",
          city: "01159 Dresden",
          country: "Germany",
        },

        dataProcessed: {
          title: "Data Processed",
          intro:
            "Host registration and use of the protected host area may in particular involve processing of:",
          items: [
            "venue name",
            "name of the owner or contact person",
            "address, postcode, town and region",
            "venue type",
            "phone number and email address",
            "authentication and login data",
            "registration code and account status",
            "Mischtisch capacity and table/seat configuration",
            "booking days and booking times",
            "special dates, closure dates and special openings",
            "uploaded photos",
            "promotions, discounts and special offers",
            "email address used for reservation notifications",
            "profile and change information",
            "technical security, connection and log data",
          ],
        },

        purposes: {
          title: "Purposes and Legal Bases",
          text1:
            "Data is processed to create and manage the partner account, verify eligibility to participate, display the public host profile, manage Mischtisch configuration and booking times, transmit reservations to the host, send reservation notifications, operate and secure the platform technically and identify misuse or technical errors.",
          text2:
            "Where processing is necessary to perform the partner relationship, it is generally based on Article 6(1)(b) GDPR. Necessary security, operation, error-analysis and abuse-prevention processing may be based on Article 6(1)(f) GDPR.",
        },

        hosting: {
          title: "Website Access, Hosting and Technical Logs",
          text1: "The host area forms part of",
          text2:
            "and is hosted using Hostinger. When the host area is accessed, technically necessary connection and server data may be processed, including IP address, access time, requested resources, browser and device information, and technical error or security data.",
          text3:
            "This processing is used to provide the platform technically and maintain stability and security and, where required, is based on Article 6(1)(f) GDPR.",
          furtherInfo:
            "Further information about Hostinger's privacy practices is available at",
          hostingerPrivacy: "Hostinger Privacy Policy",
        },

        firebaseAuth: {
          title: "Firebase Authentication",
          text: "Host accounts are authenticated using Google Firebase Authentication. Login identifiers, authentication information and technical security data may be processed during authentication.",
          furtherInfo:
            "Further information about Google's privacy practices is available in the",
          googlePrivacy: "Google Privacy Policy",
        },

        firestore: {
          title: "Cloud Firestore and Cloud Storage for Firebase",
          text1:
            "Profile, schedule, capacity, configuration and other platform data may be stored in Cloud Firestore.",
          text2:
            "Host images and other designated files are stored in Cloud Storage for Firebase.",
          furtherInfo:
            "Further information about Google's privacy practices is available in the",
          googlePrivacy: "Google Privacy Policy",
        },

        emailNotifications: {
          title: "Email Notifications",
          text: "Reservation notifications are technically triggered through EmailJS and sent using a connected Gmail account from Google. This may involve processing the recipient address, host information, reservation data and other content required for the relevant notification.",
          furtherInfo: "Further information is available in the",
          emailjsPrivacy: "EmailJS Data Protection Agreement",
          and: "and the",
          googlePrivacy: "Google Privacy Policy",
        },

        recipients: {
          title: "Recipients and Service Providers",
          intro:
            "Personal data relating to hosts or their contact persons is disclosed only where required for the purposes described above or otherwise legally permitted. Depending on the function, recipients or service providers may in particular include:",
          items: [
            "Hostinger for hosting and technical operation",
            "Google/Firebase for authentication, database functions and image storage",
            "EmailJS for technically triggering reservation notifications",
            "Gmail/Google for sending reservation notifications",
            "guests, where host-approved public profile, Mischtisch or offer information is displayed on the website",
          ],
        },

        publicProfile: {
          title: "Public Host Profile",
          text1:
            "Publicly visible information may include the venue name, location and region, venue type, approved images, description, Mischtisch information, booking information and public promotions or offers.",
          text2:
            "Login data, authentication information, internal security information and internal administrative information are not published as public profile data.",
        },

        guestData: {
          title: "Guest Reservation Data",
          text1:
            "Guest reservation data made available to a host through Mischtisch Saxony may be used only in accordance with the Terms for Hosts and applicable data-protection law.",
          text2:
            "For further processing of guest data for the host's own reservation handling and provision of its own hospitality or business services, the host acts as a separate controller under the GDPR.",
        },

        thirdCountryTransfers: {
          title: "Transfers to Third Countries",
          text1:
            "When Google/Firebase, EmailJS or other technical service providers are used, processing of personal data outside the European Union or European Economic Area cannot be ruled out.",
          text2:
            "Where a third-country transfer takes place, it is carried out only in accordance with Articles 44 et seq. GDPR. Depending on the provider and processing activity, the transfer may in particular be based on an adequacy decision of the European Commission or appropriate safeguards such as standard contractual clauses.",
        },

        retention: {
          title: "Retention",
          text1:
            "Host and contact-person data is processed only for as long as necessary to manage and perform the partner relationship, provide the platform or comply with legal obligations.",
          text2:
            "After a host account ends, data is deleted once it is no longer required to settle the partner relationship, comply with statutory retention or evidentiary duties, or establish, exercise or defend legal claims.",
          text3:
            "Public images and profile content are no longer displayed publicly after deletion or termination of the relevant profile unless another lawful basis requires continued processing. Limited technical backup copies may remain for a recovery period.",
          text4:
            "Technical log and security data is retained only for as long as required for operation, security, error analysis or the investigation of specific security incidents.",
        },

        rights: {
          title: "Data-Subject Rights",
          intro:
            "Subject to statutory requirements, data subjects may in particular have the right to:",
          items: [
            "access",
            "rectification",
            "erasure",
            "restriction of processing",
            "data portability where the requirements are met",
            "object to processing based on Article 6(1)(e) or (f) GDPR",
            "withdraw consent with future effect where processing is based on consent",
          ],
          requests: "Requests may be sent to",
        },

        complaint: {
          title: "Right to Lodge a Complaint",
          text: "Data subjects have the right to lodge a complaint with a competent data-protection supervisory authority concerning the processing of their personal data.",
        },

        changes: {
          title: "Changes to This Notice",
          text: "This Host Privacy Notice will be updated if functions of the host area, service providers, processing activities or legal requirements change.",
        },
      },
    },
    privacyPolicy: {
      header: {
        eyebrow: "Privacy",
        title: "Privacy Policy",
        updated: "Last updated: 19 August 2026",
      },

      contact: {
        phone: "Phone",
        email: "Email",
      },

      sections: {
        privacyAtGlance: {
          title: "Privacy at a Glance",
          intro:
            "The following information provides an understandable overview of how personal data is processed in connection with Mischtisch Saxony.",
          items: [
            "Guests currently do not need a user account to make a reservation.",
            "Reservation data is collected when a guest makes a reservation through the platform.",
            "Information required for the reservation is transmitted to the host selected by the guest.",
            "Hosts use a protected host area with authentication.",
            "Mischtisch Saxony currently does not use advertising or analytics trackers and does not create advertising profiles.",
            "Mischtisch Saxony does not process online payments.",
          ],
        },

        controller: {
          title: "Controller",
          intro:
            "The controller responsible for operating the Mischtisch Saxony platform is:",
          country: "Germany",
          privacyRequests:
            "The same email address may be used for privacy requests.",
        },

        hosting: {
          title: "Website Access, Hosting and Server Log Files",
          text1: "The website",
          text2:
            "is hosted using Hostinger. When the website is accessed, technically necessary connection and server data may be processed. This may include the IP address, date and time of access, requested page or resource, browser and device information, referrer information, and technical error or security data.",
          text3:
            "This data is processed to provide the website technically, maintain service stability and security, identify errors and prevent misuse. Where processing is not already required to provide the requested service, it is based on Article 6(1)(f) GDPR. The legitimate interest is the secure and reliable operation of the platform.",
          text4:
            "Further information about Hostinger's privacy practices is available at",
          furtherInfo:
            "Further information about Hostinger's privacy practices is available at",
        },

        ssl: {
          title: "SSL/TLS Encryption",
          text1:
            "Mischtisch Saxony is provided through an encrypted HTTPS connection. SSL/TLS encryption is used to protect data transmitted between the user's browser and the platform. An encrypted connection can generally be recognised by the",
          text2:
            "protocol and the corresponding security indicator in the browser.",
          text3:
            "Despite appropriate technical safeguards, data transmission over the internet cannot be guaranteed to be absolutely secure.",
        },

        reservations: {
          title: "Guest Reservations",
          intro:
            "Guests currently do not need an account or registration to make a reservation.",
          dataIntro:
            "The following personal data may in particular be processed as part of a reservation:",
          items: [
            "first and last name",
            "email address",
            "phone number",
            "postal address",
            "number of reserved seats",
            "selected date and time",
            "optional message from the guest",
            "selected host",
            "technical reservation, availability and confirmation information",
          ],
          text1:
            "The information is used to perform the requested availability check, transmit the reservation to the selected host, document the reservation and send the necessary confirmation and notification emails.",
          text2:
            "Where processing is necessary to perform the reservation and intermediary service requested by the guest, it is generally based on Article 6(1)(b) GDPR. Additional processing required for service security, abuse prevention or technical error analysis may be based on Article 6(1)(f) GDPR.",
          text3:
            "Free-text fields should not be used to submit special categories of personal data or other highly sensitive information unless such information is genuinely necessary for the reservation.",
        },

        selectedHost: {
          title: "Disclosure to the Selected Host",
          text1:
            "Personal data required for a reservation is disclosed to the host selected by the guest. The host requires this information to handle the reservation and, where necessary, contact the guest in connection with that reservation.",
          text2:
            "DEHOGA Sachsen e.V. is responsible for the processing required to operate the Mischtisch platform and transmit the reservation.",
          text3:
            "After receiving reservation data, the selected host processes that data under its own responsibility in order to manage the reservation and provide its own hospitality or business services. For this subsequent processing, the host acts as a separate controller under the GDPR.",
          text4:
            "Contact details for the selected host are made available through the booking flow or host presentation so that guests can identify and, where necessary, contact the relevant venue directly.",
        },

        email: {
          title: "Reservation Confirmations and Email Notifications",
          text1:
            "After a successful reservation, a confirmation is sent to the guest and a notification is sent to the selected host.",
          text2: "is used as the technical email integration.",
          text3: "is used as the email service connected to EmailJS.",
          text4:
            "The email flow may process the guest's name and email address, selected host, reservation date and time, number of seats and other reservation information required for the confirmation message.",
          text5:
            "Transactional reservation emails are generally processed on the basis of Article 6(1)(b) GDPR. Technically necessary delivery and security processing may be based on Article 6(1)(f) GDPR.",
          furtherInfo:
            "Further information is available in the privacy information of the relevant providers, including",
          and: "and",
        },

        firebase: {
          title: "Google Firebase",
          intro:
            "Google Firebase services are used for technical functions of the platform.",

          authentication: {
            title: "Firebase Authentication",
            text: "Firebase Authentication is used exclusively for host accounts. Guests currently do not require a user account. Authentication identifiers, technical authentication information and security data may be processed as part of host authentication.",
          },

          firestore: {
            title: "Cloud Firestore",
            text: "Cloud Firestore is used to store platform, host and reservation data. This may include host profiles, Mischtisch configurations, booking times, reservation information and technical status information.",
          },

          storage: {
            title: "Cloud Storage for Firebase",
            text: "Cloud Storage for Firebase is used to store host images and other designated files.",
          },

          furtherInfo:
            "Further information about Google's privacy practices is available at",
        },

        storage: {
          title: "Technically Necessary Browser Storage",
          intro:
            "The platform may use technically necessary browser storage, tokens or comparable technologies where required to provide requested functions. This may include:",
          items: [
            "host login and session management",
            "security and authentication information",
            "language preferences",
            "technically necessary form or session state",
          ],
          text: "No analytics, advertising or marketing trackers are currently planned. If non-essential tracking, analytics or marketing technologies are introduced in the future, the privacy and consent information must be updated before such technologies are used.",
        },

        recipients: {
          title: "Recipients and Service Providers",
          intro:
            "Personal data is disclosed only where necessary for the purposes described above or where another legal basis permits or requires disclosure. Depending on how the platform is used, recipients or service providers may in particular include:",
          items: [
            "the host selected by the guest for reservation handling",
            "Hostinger for website hosting and technical operation",
            "Google/Firebase for host authentication, database functions and image storage",
            "EmailJS for technically triggering reservation emails",
            "Gmail/Google for sending reservation emails",
          ],
          text: "Any further disclosure takes place only where legally permitted or required.",
        },

        thirdCountries: {
          title: "Transfers to Third Countries",
          text1:
            "When individual technical service providers are used, processing of personal data outside the European Union or European Economic Area cannot be ruled out.",
          text2:
            "Where personal data is transferred to a third country, this is done only in accordance with Articles 44 et seq. GDPR. Depending on the provider and processing activity, the transfer may in particular be based on an adequacy decision of the European Commission or appropriate safeguards such as the European Commission's standard contractual clauses.",
        },

        automated: {
          title: "No Automated Decision-Making",
          text1:
            "Mischtisch Saxony currently does not use solely automated decision-making or profiling within the meaning of Article 22 GDPR.",
          text2:
            "A reservation can only be confirmed if sufficient seats remain available at the final booking check. This technical availability check is used to process the reservation correctly and does not constitute profiling of the guest.",
        },

        retention: {
          title: "Retention",
          text1:
            "Personal data is retained only for as long as necessary for the relevant processing purpose or for as long as statutory retention or evidentiary requirements require continued storage.",
          text2:
            "Reservation data is retained for the handling and documentation of the reservation. Once those purposes no longer apply and there is no statutory or other legitimate reason for continued retention, the data is deleted or anonymised.",
          text3:
            "Host-account and public host-profile data is generally processed for the duration of active participation in Mischtisch Saxony. After a partner account ends, data is deleted once it is no longer required to settle the partner relationship, comply with legal obligations or establish, exercise or defend legal claims.",
          text4:
            "Technical security and server logs are retained only for as long as required for operation, security, error analysis or the investigation of specific security incidents. The actual period may depend on the technical configuration and the service providers used.",
          text5:
            "Where a concrete dispute exists or data is required to establish, exercise or defend legal claims, the necessary records may be stored separately with restricted access for the duration of that purpose.",
        },

        rights: {
          title: "Data-Subject Rights",
          intro:
            "Subject to statutory requirements, data subjects may in particular have the right to:",
          items: [
            "access personal data being processed",
            "rectification of inaccurate data and completion of incomplete data",
            "erasure of personal data",
            "restriction of processing",
            "data portability where the statutory requirements are met",
            "object to processing based on Article 6(1)(e) or (f) GDPR",
            "withdraw consent with future effect where processing is based on consent",
          ],
          requests: "Requests may be sent to",
          hostProcessing:
            "Where a selected host subsequently processes reservation data under its own responsibility, requests relating to that processing may also be directed to the relevant host.",
        },

        complaint: {
          title: "Right to Lodge a Complaint",
          text: "Data subjects have the right to lodge a complaint with a competent data-protection supervisory authority concerning the processing of their personal data.",
        },

        changes: {
          title: "Changes to This Privacy Policy",
          text: "This Privacy Policy will be updated when platform functions, service providers, processing activities or legal requirements change. The version published on Mischtisch Saxony at the relevant time applies.",
        },
      },
    },

    termsUses: {
      header: {
        eyebrow: "Reservations",
        title: "Terms of Use & Reservation",
        updated: "Last updated: 19 August 2026",
      },

      sections: {
        platformRole: {
          title: "Platform Role",
          text: "Mischtisch Saxony is operated by DEHOGA Sachsen e.V. and acts as an intermediary between guests and participating hosts. DEHOGA Sachsen e.V. does not itself provide the host's hospitality services and does not become the provider of those services merely because a reservation is made through the platform.",
        },

        minimumAge: {
          title: "Minimum Age",
          text: "Reservations may be made only by persons aged 18 or older. A person reserving several seats confirms that they are entitled to make the reservation for the accompanying persons.",
        },

        reservation: {
          title: "Reservation",
          text: "The guest selects the host, date, time and number of seats and provides the required contact details. Displayed availability is not yet a confirmation. A reservation is confirmed only after the final availability check succeeds and a confirmation is displayed and/or sent by email.",
        },

        multipleSeats: {
          title: "Multiple Seats",
          text: "Where sufficient capacity exists, several seats may be reserved in one booking. The guest is responsible for entering the correct number of seats.",
        },

        accuracy: {
          title: "Accuracy of Information",
          text: "Reservation information must be complete and accurate. Incorrect contact information may prevent important reservation messages from being delivered.",
        },

        changesCancellations: {
          title: "Changes and Cancellations",
          text: "Mischtisch Saxony currently does not provide guest self-service functions for changing, rescheduling or cancelling reservations. Guests may contact the selected host directly. Whether and under what conditions a requested change or cancellation is accepted depends on the circumstances and any conditions of the host. Mischtisch Saxony does not guarantee that a requested change or cancellation will be accepted.",
        },

        hostChanges: {
          title: "Changes by Hosts",
          text: "The current platform does not provide a host-side cancellation function. If a host exceptionally cannot honour a confirmed reservation, the host is responsible for contacting the affected guest directly where reasonably possible.",
        },

        pricesPayments: {
          title: "Prices and Payments",
          text: "Mischtisch Saxony does not process online payments. Any charges for food, drinks, accommodation or other host services are handled directly between the guest and the host.",
        },

        promotionsDiscounts: {
          title: "Promotions, Discounts and Special Offers",
          text1:
            "Hosts may publish promotions, discounts and special offers. Information about those offers displayed on Mischtisch Saxony is supplied by the relevant host.",
          text2:
            "The host is responsible for the content, eligibility requirements, validity period, availability, price or discount information and redemption conditions of the offer. The conditions displayed with the offer apply.",
        },

        availabilityErrors: {
          title: "Availability and Technical Errors",
          text: "Availability may change because of concurrent reservations. The final technical check immediately before confirmation is decisive. DEHOGA Sachsen e.V. does not guarantee uninterrupted or error-free platform operation at all times.",
        },

        prohibitedUse: {
          title: "Prohibited Use",
          text: "Prohibited conduct includes automated bulk reservations, knowingly false reservation data, technical manipulation, attacks on the platform and unlawful use.",
        },

        liability: {
          title: "Liability",
          text: "Statutory liability rules apply. DEHOGA Sachsen e.V. is not responsible for the proper performance of the host's own hospitality or other services where DEHOGA does not provide those services and no broader statutory responsibility applies. Mandatory statutory claims remain unaffected.",
        },

        privacy: {
          title: "Privacy",
          text: "The Mischtisch Saxony Privacy Policy applies to the processing of personal data.",
          link: "Privacy Policy",
        },

        governingLaw: {
          title: "Governing Law",
          text: "German law applies. Mandatory consumer-protection rules remain unaffected.",
        },
      },
    },

    hostTerms: {
      header: {
        eyebrow: "For Hosts",
        title: "Terms for Hosts",
        updated: "Last updated: 19 August 2026",
      },

      sections: {
        registration: {
          title: "Registration",
          text: "A host account may be created only with a registration code generated or approved by the platform. The host must provide accurate, complete and current information during registration and whenever the profile is maintained.",
        },

        credentials: {
          title: "Login Credentials",
          text: "The host is responsible for protecting its login credentials. Credentials must not be shared with unauthorised persons. Suspected misuse, loss or unauthorised access must be reported to DEHOGA Sachsen e.V. without undue delay.",
        },

        oneTable: {
          title: "One Mischtisch per Host",
          text: "Under the current platform model, each host manages one Mischtisch. The host maintains the capacity, table or seat configuration and bookable times within the functions currently provided.",
        },

        schedules: {
          title: "Schedules and Capacity",
          text: "Published booking days, times, capacity, special openings, closure dates and other information relevant to availability must be kept accurate and current. The host is responsible for entering changes in the platform in good time.",
        },

        scheduleChanges: {
          title: "Protection of Existing Reservations When Schedules Change",
          text1:
            "If confirmed reservations already exist for a weekday, those existing reservations are not changed by an update to the recurring weekly schedule.",
          text2:
            "In that situation, changes to the regular bookable times for that weekday apply only from the next occurrence of the relevant weekday. The host remains responsible for respecting and honouring reservations already confirmed under the original schedule unless a different arrangement is agreed directly with the guest in the individual case.",
          text3:
            "For weekdays without protected confirmed reservations, changes may become effective for new bookings immediately, within the functionality actually implemented by the platform.",
        },

        reservations: {
          title: "Reservations",
          text1:
            "The host receives guest data required for a reservation and may use it only for reservation handling, communication with the guest and directly related business services unless another lawful basis exists.",
          text2:
            "The current platform does not provide a host-side cancellation function. If a confirmed reservation exceptionally cannot be honoured, the host must contact the affected guest directly using the available contact details where reasonably possible.",
        },

        content: {
          title: "Photos, Logos and Other Content",
          text1:
            "The host may upload or publish only photos, logos, text and other material for which it holds the necessary rights and permissions.",
          text2:
            "This includes, in particular, copyright, trade-mark and other identifier rights, image and personality rights of identifiable persons, and required usage rights for commercially supplied images.",
        },

        promotions: {
          title: "Promotions, Discounts and Special Offers",
          text1:
            "The host is responsible for the accuracy and transparency of all promotions, discounts and special offers published through Mischtisch Saxony.",
          text2:
            "Where relevant, the host must clearly state the content of the offer, validity period, eligibility or redemption conditions, limitations, price or discount and availability.",
          text3:
            "If DEHOGA Sachsen e.V. receives a credible indication that published content may be misleading, unlawful or clearly incorrect, DEHOGA may require the host to correct or deactivate it. In serious or repeated cases, public visibility or the partner account may be suspended while the matter is reviewed.",
        },

        privacy: {
          title: "Privacy and Confidentiality",
          text1:
            "For guest personal data received and subsequently processed for the host's own reservation handling, the host acts as a separate controller under data-protection law.",
          text2:
            "Without an independent lawful basis, guest data must not be used for advertising, disclosed to unrelated third parties or used for purposes unrelated to the reservation or the host's own service.",
          text3:
            "The host must ensure that only authorised persons can access reservation data and must apply appropriate technical and organisational safeguards.",
          text4:
            "Where the host is legally required to inform data subjects about processing carried out under the host's own responsibility, the host is responsible for providing its own privacy information.",
        },

        publicProfile: {
          title: "Public Profile Information",
          text: "Publicly visible information may include the venue name, location and region, venue type, public contact details, images, description, Mischtisch times, special dates and public promotions or offers. The host is responsible for keeping this information accurate and current.",
        },

        technical: {
          title: "Technical Operation",
          text: "DEHOGA Sachsen e.V. seeks to provide a reliable platform but does not guarantee uninterrupted or error-free availability at all times. Maintenance, security measures, technical faults or external service providers may temporarily restrict availability.",
        },

        suspension: {
          title: "Suspension and Termination",
          text1: "The host may request deactivation of its partner account.",
          text2:
            "DEHOGA Sachsen e.V. may temporarily suspend an account or terminate participation, particularly in cases of false or misleading information, platform misuse, security risks, legal infringements, improper use of guest data or repeated serious reservation problems.",
        },

        liability: {
          title: "Liability",
          text: "Statutory liability rules apply. The host remains responsible for its own services, content, prices, offers and fulfilment of confirmed reservations.",
        },
      },
    },
  },
};

export function t(key, params) {
  let text = TRANSLATIONS[language][key];

  if (text === undefined) return key;

  if (params) {
    for (const [k, value] of Object.entries(params)) {
      text = text.split(`{${k}}`).join(String(value));
    }
  }

  return text;
}

export function tn(key, params) {
  let text = TRANSLATIONS[language];

  for (const part of key.split(".")) {
    if (text === undefined || text === null) {
      return key;
    }

    text = text[part];
  }

  if (text === undefined || text === null) {
    return key;
  }

  if (params) {
    for (const [k, value] of Object.entries(params)) {
      text = text.split(`{${k}}`).join(String(value));
    }
  }

  return text;
}
