// Über Mischtisch: Idee, Schritte, Nutzungsvereinbarung (Um im Bundle).
import { getLanguage, v } from "../Utils/i18n";

export function AboutPage() {
  const cards =
    getLanguage() === "en"
      ? [
          [
            "One table per house",
            "Every participating venue — inn, restaurant or hotel — sets exactly one communal table under the shared brand and enters itself how many people fit around it.",
          ],
          [
            "Seats, not tables",
            "At a Mischtisch you book a chair, not a table. Whoever comes simply joins in — alone, as a couple, or on the spur of the moment.",
          ],
          [
            "One account, all of Saxony",
            "Every Mischtisch in the state runs through one central platform. Guest and venue each receive an automatic email confirmation for every booking.",
          ],
        ]
      : [
          [
            "Ein Tisch pro Haus",
            "Jeder teilnehmende Betrieb — Wirtshaus, Restaurant oder Hotel — deckt genau einen Gemeinschaftstisch unter dem gemeinsamen Label und trägt selbst ein, wie viele Personen daran passen.",
          ],
          [
            "Plätze statt Tische",
            "Am Mischtisch reserviert man keinen Tisch, sondern einen Stuhl. Wer kommt, setzt sich dazu — allein, zu zweit oder spontan.",
          ],
          [
            "Ein Konto, ganz Sachsen",
            "Alle Mischtische im Freistaat laufen über eine zentrale Plattform. Gast und Betrieb erhalten bei jeder Reservierung automatisch eine Bestätigung per E-Mail.",
          ],
        ];

  return (
    <div className="mt-wrap" style={{ padding: "28px 20px 60px", maxWidth: 820 }}>
      <div className="eyebrow">{v("Die Idee", "The idea")}</div>
      <h2
        className="f-display"
        style={{
          fontSize: "clamp(26px,4.5vw,38px)",
          fontWeight: 600,
          margin: "6px 0 12px",
          color: "var(--kobalt-dunkel)",
        }}
      >
        {v("Ein Tisch, der mischt", "One table that mixes")}
      </h2>
      <p className="lead" style={{ marginBottom: 22 }}>
        {v(
          "Der Mischtisch wurde vom DEHOGA Bayern als landesweite Kampagne für lebendige Wirtshauskultur entwickelt. Diese Plattform überträgt die Idee nach Sachsen — und ergänzt sie um das, was bisher fehlte: eine zentrale Online-Reservierung für alle teilnehmenden Betriebe.",
          "The Mischtisch was developed by DEHOGA Bayern as a statewide campaign for a living pub culture. This platform brings the idea to Saxony and adds what was missing so far: one central online booking system for every participating venue.",
        )}
      </p>
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 14 }}
      >
        {cards.map(([titel, text]) => (
          <div key={titel} className="card">
            <div
              className="f-display"
              style={{ fontSize: 19, fontWeight: 600, color: "var(--kobalt-dunkel)", marginBottom: 6 }}
            >
              {titel}
            </div>
            <div style={{ fontSize: 14.5, color: "#3A4258" }}>{text}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, fontSize: 14.5, color: "#3A4258" }}>
        {v("Die offiziellen Claims der Kampagne:", "The campaign’s official claims:")}{" "}
        <i>„Teilt Tische. Mischt Menschen.“</i> {v("und", "and")}{" "}
        <i>„Gemeinsam isst besser.“</i>
      </div>
      <div className="eyebrow" style={{ margin: "36px 0 8px" }}>
        {v("Mitmischen — so geht’s", "Joining in — how it works")}
      </div>
      <h3
        className="f-display"
        style={{
          fontSize: "clamp(20px,3.5vw,26px)",
          fontWeight: 600,
          margin: "0 0 14px",
          color: "var(--kobalt-dunkel)",
        }}
      >
        {v(
          "In vier Schritten Teil der MischTisch-Familie",
          "Four steps into the MischTisch family",
        )}
      </h3>
      <div style={{ display: "grid", gap: 12 }}>
        <div className="card" style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div className="step-nr">1</div>
          <div>
            <div style={{ fontWeight: 700 }}>
              Nutzungsvereinbarung ausfüllen und unterschreiben
            </div>
            <div style={{ fontSize: 14.5, color: "#3A4258", marginTop: 2 }}>
              Die Nutzungsvereinbarung des DEHOGA Bayern mit den Kontaktdaten des
              Betriebs ausfüllen, unterschreiben und mit dem Betreff „MISCHTISCH in
              SACHSEN“ per E-Mail an{" "}
              <a
                href="mailto:info@gastgeber-ag.bayern?subject=MISCHTISCH%20in%20SACHSEN"
                style={{ color: "var(--kobalt)", fontWeight: 600 }}
              >
                info@gastgeber-ag.bayern
              </a>{" "}
              senden. Alternativ per Post an: DEHOGA Bayern e. V., Fachbereich
              Gastronomie, MISCHTISCH in SACHSEN, Türkenstraße 7, 80333 München.
            </div>
          </div>
        </div>
        <div className="card" style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div className="step-nr">2</div>
          <div>
            <div style={{ fontWeight: 700 }}>Eintrag im „Mischtisch“-Finder</div>
            <div style={{ fontSize: 14.5, color: "#3A4258", marginTop: 2 }}>
              Sobald die Vereinbarung eingegangen ist, wird der Betrieb im
              „Mischtisch“-Finder auf{" "}
              <a
                href="https://www.misch-tisch.de"
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--kobalt)", fontWeight: 600 }}
              >
                www.misch-tisch.de
              </a>{" "}
              verortet — der Landkarte, auf der Gäste alle teilnehmenden Häuser finden.
            </div>
          </div>
        </div>
        <div className="card" style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div className="step-nr">3</div>
          <div>
            <div style={{ fontWeight: 700 }}>Starterpaket vom DEHOGA Sachsen</div>
            <div style={{ fontSize: 14.5, color: "#3A4258", marginTop: 2 }}>
              Das Starterpaket kommt direkt vom DEHOGA Sachsen — die Kosten hat der
              Landesverband für sächsische Betriebe bereits übernommen.
            </div>
          </div>
        </div>
        <div className="card" style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div className="step-nr">4</div>
          <div>
            <div style={{ fontWeight: 700 }}>Das Mischen kann losgehen</div>
            <div style={{ fontSize: 14.5, color: "#3A4258", marginTop: 2 }}>
              Das Starterpaket ist der Grundstein für die Einrichtung des eigenen
              Mischtischs. Danach kann der Tisch hier auf der Plattform mit Plätzen,
              Tagen und Uhrzeiten für Reservierungen freigeschaltet werden.
            </div>
          </div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <div
          className="f-display"
          style={{ fontSize: 19, fontWeight: 600, color: "var(--kobalt-dunkel)", marginBottom: 8 }}
        >
          Gut zu wissen — aus der Nutzungsvereinbarung
        </div>
        <div style={{ fontSize: 14.5, color: "#3A4258", display: "grid", gap: 8 }}>
          <div>
            „Mischtisch“ ist eine geschützte Wort- und Wort-Bild-Marke; Markeninhaber
            ist der DEHOGA Bayern. Die Markenvorlagen aus Anlage 1 dürfen nicht
            verändert oder verfremdet werden.
          </div>
          <div>
            Die Nutzungsgebühr ist mit dem Starterpaket abgegolten (90 € brutto für
            Verbandsmitglieder, 120 € für Nicht-Mitglieder) — für sächsische Betriebe
            übernimmt der DEHOGA Sachsen diese Kosten.
          </div>
          <div>
            Jeder teilnehmende Betrieb bewirtet am Mischtisch jede Person —
            unabhängig von Nationalität, Hautfarbe oder Geschlecht. Das Hausrecht des
            Gastwirts bleibt unberührt.
          </div>
          <div>
            Die Vereinbarung läuft unbefristet und kann vom Betrieb mit einer Frist von
            vier Wochen zum Monatsende gekündigt werden.
          </div>
        </div>
      </div>
      <p className="notice" style={{ marginTop: 18 }}>
        Prototyp / Konzeptentwurf — die Betriebe und E-Mail-Adressen in der
        Tischübersicht sind Beispieldaten. Grundlage der Teilnahme-Infos:
        Nutzungsvereinbarung „Mischtisch“ des DEHOGA Bayern (Stand Oktober 2024) inkl.
        Anlage 1 sowie die offiziellen Bearbeitungsschritte für „MISCHTISCH in
        SACHSEN“. Für den Live-Auftritt sind die Original-Markenvorlagen aus Anlage 1
        unverändert zu verwenden.
      </p>
    </div>
  );
}
