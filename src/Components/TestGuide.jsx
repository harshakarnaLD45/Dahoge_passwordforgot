// Testleitfaden für den DEHOGA Sachsen: Schrittliste mit Häkchen,
// Fortschrittsbalken und Zurücksetzen der Testdaten.
import { useState, useEffect, useRef } from "react";
import { v } from "../Utils/i18n";
import {
  getSetting,
  setSetting,
  resetAll,
  downloadBackup,
  restoreBackup,
} from "../Services/storage";

// Fünf Gruppen mit Prüfschritten [id, Titel, Hinweis]. Als Funktion, damit
// v() erst beim Rendern ausgewertet wird (Sprache steht beim Modul-Load
// noch nicht fest).
function testGuideGroups() {
  return [
    {
      titel: v("Als Gast reservieren", "Reserve as a guest"),
      hinweis: v("Startseite „Tische“", "Home page “Tables”"),
      schritte: [
        [
          "g1",
          v("Region filtern und nach einem Ort suchen", "Filter by region and search for a town"),
          v(
            "Oben Regionen antippen, z. B. „Oberlausitz“, oder „Görlitz“ ins Suchfeld.",
            "Tap a region at the top, e.g. “Oberlausitz”, or type “Görlitz” into the search field.",
          ),
        ],
        [
          "g2",
          v("Betrieb öffnen und Öffnungszeiten prüfen", "Open a venue and check the opening hours"),
          v(
            "„Platz wählen“ — darunter stehen Öffnungs- und Küchenzeiten, Telefon, Reservierungsfenster.",
            "“Choose a seat” — below it you find opening and kitchen hours, phone, booking window.",
          ),
        ],
        [
          "g3",
          v("Datum und Uhrzeit wählen, Stuhl antippen", "Pick date and time, tap a chair"),
          v(
            "Jeder gewählte Stuhl steht für eine Person. Belegte Stühle sind dunkel.",
            "Each chosen chair stands for one person. Taken chairs are dark.",
          ),
        ],
        [
          "g4",
          v("Kontaktdaten ausfüllen und verbindlich reservieren", "Fill in contact details and make a binding reservation"),
          v(
            "Vorname, Name, E-Mail, Telefon, Adresse — alles Pflicht.",
            "First name, last name, email, phone, address — all required.",
          ),
        ],
        [
          "g5",
          v("Beide Bestätigungs-E-Mails ansehen", "View both confirmation emails"),
          v(
            "Auf der Bestätigungsseite: eine an den Gast, eine an den Betrieb. Buttons öffnen das E-Mail-Programm.",
            "On the confirmation page: one for the guest, one for the venue. Buttons open the email program.",
          ),
        ],
        [
          "g6",
          v("Bestätigung drucken und in den Kalender legen", "Print the confirmation and add it to the calendar"),
          v(
            "Auf der Bestätigungsseite und bei „Meine Plätze“: Drucken/PDF sowie Kalender-Datei (.ics).",
            "On the confirmation page and under “My seats”: print/PDF and calendar file (.ics).",
          ),
        ],
        [
          "g7",
          v("Unter „Meine Plätze“ stornieren", "Cancel under “My seats”"),
          v(
            "Der Platz wird sofort wieder frei — auch im Gastgeber-Bereich.",
            "The seat becomes free again immediately — also in the host area.",
          ),
        ],
      ],
    },
    {
      titel: v("Als Gastronom anmelden", "Sign in as a venue"),
      hinweis: v("Reiter „Gastgeber“", "“Hosts” tab"),
      schritte: [
        [
          "r0",
          v("Mit dem Demo-Zugang anmelden", "Sign in with the demo account"),
          v(
            "E-Mail demo@mischtisch-sachsen.example, Passwort mischtisch — führt direkt in den Bereich von „Hotel und Gasthof Zur Post“, Pirna.",
            "Email demo@mischtisch-sachsen.example, password mischtisch — takes you straight into the area of “Hotel und Gasthof Zur Post”, Pirna.",
          ),
        ],
        [
          "r1",
          v("Neu registrieren — eigenen Betrieb anlegen", "Register — create your own venue"),
          v(
            "Betrieb, Straße, PLZ, Ort, Inhaber, E-Mail. Felder wie in der Nutzungsvereinbarung.",
            "Venue, street, postcode, town, owner, email. Fields as in the usage agreement.",
          ),
        ],
        [
          "r2",
          v("Bestehenden Partnerbetrieb übernehmen", "Take over an existing partner venue"),
          v(
            "Einen der 19 Partner wählen — dafür ist der Zugangscode nötig, den der Verband verschickt.",
            "Pick one of the 19 partners — you need the access code sent by the association.",
          ),
        ],
        [
          "r5",
          v("Zugangscodes als Verband verwalten", "Manage access codes as the association"),
          v(
            "Gastgeber-Bereich unten: „Für den Verband: Zugangscodes verwalten“ — Codes einsehen, per E-Mail versenden, Liste drucken.",
            "Bottom of the host area: “For the association: manage access codes” — view codes, send them by email, print the list.",
          ),
        ],
        [
          "r3",
          v("Anmelde-Mails prüfen", "Check the registration emails"),
          v(
            "Drei fertige Nachrichten: DEHOGA Sachsen, Bayerische Gastgeber AG (Betreff „MISCHTISCH in SACHSEN“), Bestätigung an den Betrieb.",
            "Three finished messages: DEHOGA Sachsen, Bayerische Gastgeber AG (subject “MISCHTISCH in SACHSEN”), confirmation to the venue.",
          ),
        ],
        [
          "r4",
          v("Abmelden und wieder anmelden", "Sign out and sign in again"),
          v(
            "Zugang bleibt gespeichert, Anmeldung mit E-Mail und Passwort.",
            "The account stays saved; sign in with email and password.",
          ),
        ],
      ],
    },
    {
      titel: v("Mischtisch verwalten", "Manage your Mischtisch"),
      hinweis: v("Gastgeber-Bereich, Reiter „Mein Mischtisch“", "Host area, “My Mischtisch” tab"),
      schritte: [
        [
          "v1",
          v("Tischgröße ändern", "Change the table size"),
          v(
            "Frei wählbar von 2 bis 14 Plätzen — die Stühle verteilen sich neu.",
            "Freely selectable from 2 to 14 seats — the chairs are redistributed.",
          ),
        ],
        [
          "v2",
          v("Reservierbar von–bis mit Takt festlegen", "Set bookable from–to with an interval"),
          v(
            "Zeitfenster berechnen lassen und mit „Zeitfenster übernehmen“ setzen.",
            "Have time slots calculated and apply them with “Apply time slots”.",
          ),
        ],
        [
          "v3",
          v("Mehrfachreservierungen einschalten", "Enable multiple reservations"),
          v(
            "Danach als Gast prüfen: mehrere Uhrzeiten sind gleichzeitig wählbar.",
            "Then check as a guest: several times can be selected at once.",
          ),
        ],
        [
          "v4",
          v("Schließtag eintragen", "Add a closure day"),
          v(
            "Gäste sehen diesen Tag als „ausgebucht“, nicht als geschlossen.",
            "Guests see this day as “fully booked”, not as closed.",
          ),
        ],
        [
          "v5",
          v("Sonderöffnung eintragen", "Add a special opening"),
          v(
            "Zusätzlicher Tag mit eigenen Zeiten — schlägt auch einen Ruhetag.",
            "Extra day with custom times — overrides even a day off.",
          ),
        ],
        [
          "v6",
          v("Aktionswoche anlegen", "Create a promotion week"),
          v(
            "Zeitraum, Titel (z. B. „Lausitzer Fischwochen“), Spezialangebot, optional eigene Zeiten und täglich buchbar.",
            "Period, title (e.g. “Lusatian fish weeks”), special offer, optionally custom times and bookable daily.",
          ),
        ],
        [
          "v7",
          v("Dauerhaftes Spezialangebot hinterlegen", "Add a permanent special offer"),
          v("Erscheint auf der Karte und in der Bestätigung.", "Appears on the card and in the confirmation."),
        ],
        [
          "v8",
          v("Reservierungseingang ansehen", "View incoming reservations"),
          v(
            "Reiter „Reservierungen“: Personenzahl, Gastdaten, Aktion. Der Zähler am Reiter „Gastgeber“ meldet Neueingänge.",
            "“Reservations” tab: party size, guest data, promotion. The counter on the “Hosts” tab reports new arrivals.",
          ),
        ],
        [
          "v11",
          v("Fotos hinzufügen", "Add photos"),
          v(
            "Abschnitt „Fotos Ihres Hauses“: Bilder auswählen, Titelbild festlegen, speichern — danach als Gast die Galerie prüfen.",
            "“Photos of your venue” section: choose images, set the cover image, save — then check the gallery as a guest.",
          ),
        ],
        [
          "v9",
          v("Automatische Benachrichtigung einrichten", "Set up automatic notifications"),
          v(
            "Feld „Automatische Benachrichtigung“: Versand-Adresse eintragen — dann geht bei jeder Reservierung sofort eine E-Mail raus.",
            "“Automatic notification” field: enter a dispatch address — then an email goes out immediately for every reservation.",
          ),
        ],
        [
          "v10",
          v("Wartende Benachrichtigungen verschicken", "Send pending notifications"),
          v(
            "Ohne Versand-Adresse sammeln sich neue Reservierungen oben im Reiter „Reservierungen“ und lassen sich einzeln senden.",
            "Without a dispatch address, new reservations collect at the top of the “Reservations” tab and can be sent individually.",
          ),
        ],
      ],
    },
    {
      titel: v("Tischform melden", "Report the table shape"),
      hinweis: v("Gastgeber-Bereich, Karte „Tischform … melden“", "Host area, “Set the table shape …” card"),
      schritte: [
        [
          "t1",
          v("Eine der zehn Varianten wählen", "Choose one of ten variants"),
          v("Eckig, quadratisch oder rund, 6 bis 12 Plätze.", "Rectangular, square or round, 6 to 12 seats."),
        ],
        [
          "t2",
          v("Plätze selbst anordnen", "Arrange the seats yourself"),
          v(
            "„Selbst anordnen“, Grundform wählen, dann auf die gestrichelten Positionen tippen.",
            "“Arrange yourself”, choose a basic shape, then tap the dashed positions.",
          ),
        ],
        [
          "t3",
          v("Umgebung angeben", "Specify the surroundings"),
          v(
            "Küche, Eingang, Fenster, Theke — erscheint rund um den Tischplan, auch für Gäste.",
            "Kitchen, entrance, window, bar — appears around the table plan, also for guests.",
          ),
        ],
        [
          "t4",
          v("Rückmeldung ans Team senden", "Send feedback to the team"),
          v(
            "Nach dem Speichern öffnet der Button die fertige E-Mail mit allen Angaben.",
            "After saving, the button opens the finished email with all details.",
          ),
        ],
      ],
    },
    {
      titel: v("Rahmen und Marke", "Framework and brand"),
      hinweis: v("Reiter „Über“", "“About” tab"),
      schritte: [
        [
          "u1",
          v("Die vier Teilnahme-Schritte prüfen", "Check the four participation steps"),
          v(
            "Nutzungsvereinbarung, Mischtisch-Finder, Starterpaket, Mischen — inklusive Adressen.",
            "Usage agreement, Mischtisch finder, starter package, joining in — including addresses.",
          ),
        ],
        [
          "u2",
          v("Angaben aus der Nutzungsvereinbarung prüfen", "Check the details from the usage agreement"),
          v(
            "Markenschutz, Gebühren, Bewirtungspflicht, Kündigungsfrist.",
            "Trademark protection, fees, obligation to serve, notice period.",
          ),
        ],
        [
          "u4",
          v("Kennzeichnung prüfen", "Check the labelling"),
          v(
            "Reiter „Rechtliches“: KI-Hinweis, Datenschutz, Marken, offene Punkte für den Echtbetrieb.",
            "“Legal” tab: AI notice, privacy, trademarks, open points for live operation.",
          ),
        ],
        [
          "u3",
          v("DEHOGA-Sachsen-Logo prüfen", "Check the DEHOGA Sachsen logo"),
          v(
            "Das Originallogo steht in Kopfzeile, Fußzeile und auf jedem gedruckten Beleg. Über „Logo austauschen“ in der Fußzeile lässt sich eine andere Fassung hinterlegen.",
            "The original logo is in the header, footer and on every printed receipt. “Swap logo” in the footer lets you set a different version.",
          ),
        ],
      ],
    },
  ];
}

let ALL_IDS = testGuideGroups().flatMap((g) => g.schritte.map((s) => s[0]));

export function TestGuide() {
  let [open, setOpen] = useState(false);
  let [checks, setChecks] = useState([]);
  let [group, setGroup] = useState(0);
  let [restoreMsg, setRestoreMsg] = useState(null);
  let restoreInputRef = useRef(null);

  // Test-Häkchen aus den lokalen Browser-Einstellungen laden.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const stored = await getSetting("checks");
        if (alive && Array.isArray(stored)) setChecks(stored);
      } catch {}
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    setSetting("checks", checks);
  }, [checks]);

  let toggle = (id) =>
    setChecks((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  let done = checks.filter((c) => ALL_IDS.includes(c)).length;
  let reset = async () => {
    if (
      window.confirm(
        v(
          "Lokale Testdaten dieses Browsers löschen? Das Gastprofil und seine Reservierungen werden aus Firebase entfernt, lokale Einstellungen werden zurückgesetzt und die Seite wird neu geladen.",
          "Delete this browser's local test data? Its guest profile and reservations will be removed from Firebase, local settings will be reset, and the page will reload.",
        ),
      )
    ) {
      await resetAll();
      window.location.reload();
    }
  };

  // Sicherung/Wiederherstellung als Firebase-kompatible JSON-Datei.
  let restore = async (e) => {
    let file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      await restoreBackup(file);
      setRestoreMsg(
        v("Firebase-Backup wiederhergestellt — die Seite wird neu geladen …", "Firebase backup restored — the page will reload …"),
      );
      window.setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      console.error(err);
      setRestoreMsg(
        v(
          "Wiederherstellung fehlgeschlagen — die Datei ist kein gültiges Firebase-JSON-Backup.",
          "Restore failed — the file is not a valid Firebase JSON backup.",
        ),
      );
    }
  };

  if (!open)
    return (
      <button
        className="tg-tab"
        onClick={() => setOpen(true)}
        aria-label={v("Testleitfaden öffnen", "Open test guide")}
      >
        {v("Testleitfaden", "Test guide")}
        <span className="tg-count">
          {done}/{ALL_IDS.length}
        </span>
      </button>
    );

  let groups = testGuideGroups();
  let current = groups[group];
  return (
    <aside className="tg-panel" aria-label={v("Testleitfaden", "Test guide")}>
      <header className="tg-head">
        <div>
          <div className="tg-eyebrow">
            {v("Testleitfaden für den DEHOGA Sachsen", "Test guide for DEHOGA Sachsen")}
          </div>
          <div className="tg-title">
            {v("Alle Funktionen einmal durchklicken", "Click through every feature once")}
          </div>
        </div>
        <button
          className="tg-x"
          onClick={() => setOpen(false)}
          aria-label={v("Testleitfaden schließen", "Close test guide")}
        >
          ✕
        </button>
      </header>
      <div
        className="tg-bar"
        role="progressbar"
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={ALL_IDS.length}
      >
        <span style={{ width: `${(done / ALL_IDS.length) * 100}%` }} />
      </div>
      <div className="tg-meta">
        {v(`${done} von ${ALL_IDS.length} Schritten geprüft`, `${done} of ${ALL_IDS.length} steps checked`)}
      </div>
      <nav className="tg-nav">
        {groups.map((g, i) => {
          let allDone = g.schritte.every((s) => checks.includes(s[0]));
          return (
            <button
              key={g.titel}
              className={`tg-navbtn ${i === group ? "on" : ""}`}
              onClick={() => setGroup(i)}
            >
              {allDone ? "✓ " : ""}
              {g.titel}
            </button>
          );
        })}
      </nav>
      <div className="tg-body">
        <div className="tg-where">{current.hinweis}</div>
        {current.schritte.map(([id, titel, hint]) => (
          <label key={id} className={`tg-item ${checks.includes(id) ? "done" : ""}`}>
            <input
              type="checkbox"
              checked={checks.includes(id)}
              onChange={() => toggle(id)}
            />
            <span>
              <b>{titel}</b>
              <span className="tg-hint">{hint}</span>
            </span>
          </label>
        ))}
      </div>
      <footer className="tg-foot">
        <p>
          {v(
            "Testfassung, mit Unterstützung von KI erstellt — die Anwendung selbst enthält keine KI-Funktion. Gemeinsam genutzte Eingaben werden im konfigurierten Firebase-Projekt gespeichert; lokale UI-Einstellungen bleiben in diesem Browser. E-Mails werden je nach Konfiguration über den Mail-Server versendet oder als Entwurf geöffnet.",
            "Test version created with AI assistance — the application itself contains no AI feature. Shared input is stored in the configured Firebase project; local UI settings remain in this browser. Depending on the configuration, emails are sent through the mail server or opened as drafts.",
          )}
        </p>
        {/* <div
          style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}
        >
          <input
            ref={restoreInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: "none" }}
            onChange={restore}
          />
          <button
            type="button"
            onClick={() => downloadBackup()}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid var(--linie)",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            {v("Daten sichern (.json)", "Back up data (.json)")}
          </button>
          <button
            type="button"
            onClick={() => restoreInputRef.current && restoreInputRef.current.click()}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid var(--linie)",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            {v("Daten wiederherstellen (.json)", "Restore data (.json)")}
          </button>
        </div>
        {restoreMsg && (
          <p style={{ marginTop: 8, fontSize: 13, color: "var(--kobalt-dunkel)" }}>
            {restoreMsg}
          </p>
        )}
        <button className="tg-reset" onClick={reset}>
          {v("Testdaten zurücksetzen", "Reset test data")}
        </button> */}
      </footer>
    </aside>
  );
}
