// Kennzeichnung & Rechtliches (Qm im Bundle).
// ponytail: Die Rechtstexte bleiben bewusst deutsch (rechtlich bindende
// Fassung); EN-Nutzer sehen vorab eine englische Zusammenfassung. Nur
// Gliederungstitel werden über v() übersetzt.
import { getLanguage, v } from "../Utils/i18n";

export function LegalPage() {
  const Card = ({ titel, kinder }) => (
    <div className="card" style={{ marginBottom: 14 }}>
      <div
        className="f-display"
        style={{ fontSize: 19, fontWeight: 600, color: "var(--kobalt-dunkel)", marginBottom: 8 }}
      >
        {titel}
      </div>
      <div style={{ fontSize: 14.5, color: "#3A4258", display: "grid", gap: 8 }}>{kinder}</div>
    </div>
  );

  const Dashed = ({ children }) => (
    <div
      style={{
        border: "1px dashed #9AA0B4",
        borderRadius: 8,
        padding: "8px 10px",
        color: "#6A7288",
        fontSize: 13.5,
      }}
    >
      {children}
    </div>
  );

  return (
    <div className="mt-wrap" style={{ padding: "28px 20px 60px", maxWidth: 820 }}>
      <div className="eyebrow">{v("Kennzeichnung & Rechtliches", "Labelling & legal")}</div>
      <h2
        className="f-display"
        style={{
          fontSize: "clamp(26px,4.5vw,36px)",
          fontWeight: 600,
          margin: "6px 0 10px",
          color: "var(--kobalt-dunkel)",
        }}
      >
        {v("Transparenz zu dieser Anwendung", "Transparency about this application")}
      </h2>
      <p className="lead" style={{ marginBottom: 16 }}>
        {v(
          "Diese Seite bündelt alle Kennzeichnungen. Sie ist für die Testphase geschrieben; vor dem Echtbetrieb müssen die markierten Stellen ergänzt und das Ganze anwaltlich geprüft werden.",
          "This page collects all labelling. It is written for the test phase; before going live the marked sections must be completed and the whole page reviewed by a lawyer.",
        )}
      </p>
      {getLanguage() === "en" && (
        <div
          className="card"
          style={{ marginBottom: 20, background: "#EEF1FA", borderColor: "var(--kobalt)" }}
          lang="en"
        >
          <b>English summary.</b> This application was built with AI assistance but
          contains no AI itself — no chatbot, no automated decisions, no profiling. For
          a reservation we collect first name, last name, email and phone; address and
          message are optional. Your details go to the venue you chose and to nobody
          else; other guests only see which chairs are taken. Nothing is loaded from
          third-party servers, and no advertising or analytics services are used. You
          can cancel and thereby delete a booking at any time under “My seats”. The
          German text below is the legally binding version.
        </div>
      )}
      <Card
        titel={v("Mit KI erstellt", "Created with AI")}
        kinder={
          <>
            <div>
              <b>Diese Anwendung wurde mit Unterstützung künstlicher Intelligenz entwickelt.</b>{" "}
              Aufbau, Programmcode und Texte sind im Dialog mit einem KI-Assistenten
              (Claude von Anthropic) entstanden und anschließend redaktionell geprüft
              worden.
            </div>
            <div>
              Die Anwendung selbst enthält <b>keine künstliche Intelligenz</b>: Es gibt
              keinen Chatbot, keine automatisierten Entscheidungen und keine
              Profilbildung. Verfügbarkeit, Zeitfenster und Tischpläne folgen
              ausschließlich den Angaben, die die Betriebe selbst eintragen.
            </div>
            <div>
              Damit greifen die Transparenzpflichten aus Art. 50 der KI-Verordnung (EU)
              2024/1689, die seit dem 2. August 2026 gelten, für diese Anwendung nicht.
              Sollte später eine KI-Funktion ergänzt werden — etwa ein Chatbot oder
              automatisch erzeugte Texte und Bilder — ist sie an dieser Stelle und
              direkt an der Funktion zu kennzeichnen.
            </div>
          </>
        }
      />
      <Card
        titel={v("Datenschutz", "Privacy")}
        kinder={
          <>
            <div>
              <b>Verantwortlich</b> für die Reservierungsdaten ist der jeweils gewählte
              Betrieb gemeinsam mit dem Betreiber der Plattform. Für den Echtbetrieb
              ist eine Vereinbarung über die gemeinsame Verantwortlichkeit nach Art. 26
              DSGVO erforderlich.
            </div>
            <div>
              <b>Welche Daten</b> erhoben werden: Vorname, Nachname, E-Mail und
              Telefonnummer zur Bearbeitung und Rückfrage bei der Reservierung.
              Anschrift und Nachricht sind freiwillig. Rechtsgrundlage ist Art. 6
              Abs. 1 lit. b DSGVO (Durchführung vorvertraglicher Maßnahmen) bzw. lit. a
              bei freiwilligen Angaben.
            </div>
            <div>
              <b>Wer sie sieht:</b> nur der gewählte Betrieb. Anderen Gästen wird
              ausschließlich angezeigt, welche Stühle belegt sind — ohne Namen oder
              Kontaktdaten.
            </div>
            <div>
              <b>Speicherung:</b> Gemeinsam genutzte Betriebs-, Registrierungs- und
              Reservierungsdaten werden im konfigurierten Firebase-Projekt gespeichert.
              Gastgeber-Zugänge werden über Firebase Authentication verwaltet, Fotos in
              Cloud Storage und Fachdaten in Cloud Firestore. Sprache, Logo-Auswahl und
              lokale Anzeigezustände bleiben im Browser. E-Mails werden über den
              konfigurierten SMTP-Dienst versendet. Die Anwendung setzt selbst keine
              Marketing- oder Analysefunktionen ein.
            </div>
            <div>
              <b>Ihre Rechte:</b> Auskunft, Berichtigung, Löschung, Einschränkung,
              Datenübertragbarkeit und Widerspruch (Art. 15–21 DSGVO) sowie Beschwerde
              bei einer Aufsichtsbehörde. Reservierungen lassen sich jederzeit unter
              „Meine Plätze“ selbst stornieren und damit löschen.
            </div>
            <Dashed>
              Vor dem Echtbetrieb zu ergänzen: Name und Kontakt des Verantwortlichen,
              Datenschutzbeauftragte Stelle, konkrete Löschfristen, Firebase-Projektregion,
              eingesetzte Auftragsverarbeiter (Firebase/Google Cloud, Hosting,
              E-Mail-Versand) und die zugehörigen Verträge und Datenschutzhinweise.
            </Dashed>
          </>
        }
      />
      <Card
        titel={v("Marken und Nutzungsrechte", "Trademarks and usage rights")}
        kinder={
          <>
            <div>
              „Mischtisch“ ist eine geschützte Wortmarke und Wort-Bild-Marke des
              Bayerischen Hotel- und Gaststättenverbands DEHOGA Bayern e. V. Die
              Nutzung durch teilnehmende Betriebe richtet sich nach der
              Nutzungsvereinbarung; die Vorlagen aus deren Anlage 1 dürfen nicht
              verändert oder verfremdet werden.
            </div>
            <div>
              <b>Fotos der Betriebe</b> werden von den teilnehmenden Häusern selbst
              hochgeladen. Der jeweilige Betrieb sichert dabei zu, die Nutzungsrechte
              an den Bildern zu besitzen und keine Aufnahmen einzustellen, auf denen
              Personen ohne deren Einwilligung erkennbar sind (§§ 22 f. KunstUrhG,
              Art. 6 DSGVO). Die Plattform prüft die Bilder nicht vorab; auf Hinweis
              werden beanstandete Fotos entfernt.
            </div>
            <div>
              Das Logo des DEHOGA Sachsen e. V. wird als unveränderte Originaldatei
              verwendet und lediglich auf Bildschirmgröße skaliert; Farben,
              Proportionen und Schriftzug bleiben unangetastet. Die Verwendung erfolgt
              in Abstimmung mit dem Verband. Die Wortmarken-Darstellung „MISCH·TISCH“
              im Kopfbereich ist dagegen ein Platzhalter und vor der Veröffentlichung
              durch die freigegebene Vorlage aus Anlage 1 der Nutzungsvereinbarung zu
              ersetzen.
            </div>
          </>
        }
      />
      <Card
        titel={v("Weitere Kennzeichnungen", "Further notices")}
        kinder={
          <>
            <div>
              <b>Impressum</b> nach § 5 DDG und{" "}
              <b>Verantwortlicher nach § 18 Abs. 2 MStV</b> sind vor der
              Veröffentlichung zu ergänzen.
            </div>
            <div>
              <b>Barrierefreiheit:</b> Die Anwendung ist tastaturbedienbar, arbeitet
              mit Beschriftungen für Screenreader und respektiert die
              Systemeinstellung für reduzierte Bewegung. Für Verbraucherdienste gilt
              seit dem 28. Juni 2025 das Barrierefreiheitsstärkungsgesetz; eine
              Erklärung zur Barrierefreiheit ist zu ergänzen, sobald der
              Anwendungsbereich geklärt ist.
            </div>
            <div>
              <b>Keine Zahlungsfunktion:</b> Die Reservierung ist unentgeltlich, es
              entsteht keine Zahlungspflicht. Angaben zur Verfügbarkeit stammen
              ausschließlich aus echten Reservierungen und den Angaben der Betriebe.
            </div>
            <Dashed>
              Zu ergänzen: Impressum, Erklärung zur Barrierefreiheit, ggf. Hinweis zur
              Streitbeilegung.
            </Dashed>
          </>
        }
      />
      <Card
        titel={v("Stand dieser Fassung", "Status of this version")}
        kinder={
          <>
            <div>
              Testfassung / Konzeptentwurf mit Beispieldaten. Die Zugangsdaten der
              Gastgeber sind nur einfach gesichert und nicht für den Echtbetrieb
              geeignet — bitte ausschließlich Testdaten verwenden.
            </div>
            <div>
              Vor der Freischaltung sind Serverbetrieb mit verschlüsselter
              Datenhaltung, ein Löschkonzept und eine juristische Prüfung erforderlich.
            </div>
          </>
        }
      />

      <Card
        titel={v("Impressum", "Legal notice")}
        kinder={
          <>
            <div>
              <b>Angaben gemäß § 5 DDG</b>
            </div>

            <div>
              <b>
                DEHOGA Hotel- und Gaststättenverband Sachsen e.V.
                <br />
                (DEHOGA Sachsen e.V.)
              </b>
              <br />
              Tharandter Straße 5
              <br />
              01159 Dresden
            </div>

            <div>
              <b>Kontakt</b>
              <br />
              Telefon:{" "}
              <a
                href="tel:+493514289510"
                style={{ color: "var(--kobalt)" }}
              >
                (0351) 428 95 10
              </a>
              <br />
              Telefax: (0351) 428 95 19
              <br />
              WhatsApp:{" "}
              <a
                href="https://wa.me/4915222344383"
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--kobalt)" }}
              >
                0152 22344383
              </a>
              <br />
              E-Mail:{" "}
              <a
                href="mailto:info@dehoga-sachsen.de"
                style={{ color: "var(--kobalt)" }}
              >
                info@dehoga-sachsen.de
              </a>
            </div>

            <div>
              <b>Vertreten durch</b>
              <br />
              Hauptgeschäftsführer: Axel Klein
            </div>

            <div>
              <b>Registereintrag</b>
              <br />
              Eingetragen im Vereinsregister.
              <br />
              Registergericht: Amtsgericht Dresden
              <br />
              Registernummer: 1104
            </div>

            {/* <div>
              <b>Bildrechte</b>
              <br />
              Bereich Startseite:
              <ul
                style={{
                  margin: "8px 0 0",
                  paddingLeft: 20,
                }}
              >
                <li>© Wavebreakmedia Ltd | Dreamstime.com</li>
                <li>© Alexander Kirch | Dreamstime.com</li>
                <li>© Taiga | Dreamstime.com</li>
                <li>© Wavebreakrneora Ltd | Dreamstime.com</li>
                <li>© Wavebreakmedia Ltd | Dreamstime.com</li>
                <li>© Rosshelen | Dreamstime.corn</li>
              </ul>
            </div> */}
          </>
        }
      />
    </div>
  );
}
