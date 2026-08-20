// Zugangscodes der Partnerbetriebe — nur für den Verband (Ym im Bundle).
import { useState, useEffect } from "react";
import { v } from "../Utils/i18n";
import { accessCode } from "../Services/auth";
import { mailtoHref } from "../Utils/mail";
import { getHosts } from "../Services/storage";
import { printBeleg } from "../Components/Beleg";

export function CodesPage({ locations, onBack }) {
  const [print, setPrint] = useState(false);
  const [hosts, setHosts] = useState({});

  useEffect(() => {
    let alive = true;
    (async () => {
      const h = await getHosts();
      if (alive) setHosts(h || {});
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (print) {
      printBeleg();
      const t = window.setTimeout(() => setPrint(false), 1500);
      return () => window.clearTimeout(t);
    }
  }, [print]);

  const hostOf = (locId) => Object.values(hosts).find((h) => h.betriebId === locId);

  const mail = (loc) => ({
    an: loc.email || "",
    betreff: v(
      `Ihr Zugang zur Mischtisch-Reservierungsplattform — ${loc.name}`,
      `Your access to the Mischtisch booking platform — ${loc.name}`,
    ),
    lines: v(
      [
        "Guten Tag,",
        `Für Ihren Mischtisch in ${loc.city} steht ab sofort die zentrale Reservierungsplattform bereit. Gäste können dort Plätze an Ihrem Tisch reservieren; Sie sehen jede Reservierung mit allen Kontaktdaten.`,
        `Ihr persönlicher Zugangscode: ${accessCode(loc.id)}`,
        "So richten Sie Ihren Zugang ein: Plattform öffnen — Reiter „Gastgeber“ — „Neu registrieren“ — Ihren Betrieb aus der Liste wählen — Zugangscode eingeben — E-Mail und eigenes Passwort festlegen.",
        "Danach hinterlegen Sie Tischgröße, Tage und Uhrzeiten, optional Fotos und Aktionswochen.",
        "Bitte behandeln Sie den Code vertraulich — er schützt die Daten Ihrer Gäste.",
        "Mit freundlichen Grüßen",
        "DEHOGA Sachsen e. V.",
      ],
      [
        "Hello,",
        `The central booking platform is now available for your Mischtisch in ${loc.city}. Guests can book seats at your table there; you see every reservation with all contact details.`,
        `Your personal access code: ${accessCode(loc.id)}`,
        "To set up your access: open the platform — “Hosts” tab — “Register” — choose your venue from the list — enter the access code — set your email and own password.",
        "Afterwards you store table size, days and times, optionally photos and promotion weeks.",
        "Please treat the code confidentially — it protects your guests' data.",
        "Kind regards",
        "DEHOGA Sachsen e. V.",
      ],
    ),
  });

  return (
    <div className="mt-wrap" style={{ padding: "20px 20px 60px", maxWidth: 860 }}>
      <button className="nav-btn no-print" onClick={onBack} style={{ marginLeft: -10 }}>
        {v("← Zurück", "← Back")}
      </button>
      <div className="eyebrow" style={{ marginTop: 10 }}>
        {v("Nur für den Verband", "Association only")}
      </div>
      <h2
        className="f-display"
        style={{
          fontSize: "clamp(24px,4vw,34px)",
          fontWeight: 600,
          margin: "6px 0 8px",
          color: "var(--kobalt-dunkel)",
        }}
      >
        {v("Zugangscodes der Partnerbetriebe", "Access codes of the partner venues")}
      </h2>
      <p className="lead no-print" style={{ marginBottom: 16 }}>
        {v(
          "Jeder gelistete Betrieb erhält einen eigenen Code. Damit legt er seinen Zugang selbst an — und nur er kann seine Reservierungen einsehen. Versand am besten mit dem Starterpaket.",
          "Every listed venue receives its own code. With it the venue creates its own access — and only it can view its reservations. Best sent together with the starter package.",
        )}
      </p>
      <div
        className="no-print"
        style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}
      >
        <button className="btn btn-ghost btn-sm" onClick={() => setPrint(true)}>
          {v("Liste drucken oder als PDF speichern", "Print the list or save as PDF")}
        </button>
      </div>
      <div className={print ? "print-area" : ""}>
        <div style={{ display: "grid", gap: 10 }}>
          {locations.map((loc) => {
            const host = hostOf(loc.id);
            return (
              <div
                key={loc.id}
                className="card"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                  padding: "14px 16px",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {loc.name}{" "}
                    <span style={{ fontWeight: 400, color: "#5B627A" }}>· {loc.city}</span>
                  </div>
                  <div
                    style={{
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                      fontSize: 17,
                      letterSpacing: 1.5,
                      color: "var(--kobalt-dunkel)",
                      marginTop: 3,
                    }}
                  >
                    {accessCode(loc.id)}
                  </div>
                  <div style={{ fontSize: 12.5, color: host ? "var(--moos)" : "#8A8FA3", marginTop: 2 }}>
                    {host
                      ? v(
                          `Zugang aktiv seit ${new Date(host.createdAt).toLocaleDateString("de-DE")} · ${host.email}`,
                          `Access active since ${new Date(host.createdAt).toLocaleDateString("en-GB")} · ${host.email}`,
                        )
                      : v("Noch kein Zugang angelegt", "No access created yet")}
                  </div>
                </div>
                {!host && (
                  <a
                    className="btn btn-ghost btn-sm no-print"
                    style={{ textDecoration: "none" }}
                    href={mailtoHref(mail(loc))}
                  >
                    {v("Code per E-Mail senden", "Send the code by email")}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <p className="notice no-print" style={{ marginTop: 16 }}>
        {v(
          "Testfassung: Die Codes werden hier im Browser berechnet und sind deshalb kein echter Schutz. Im Echtbetrieb erzeugt sie der Server, speichert sie verschlüsselt und zeigt diese Seite nur nach Anmeldung von Verbandsmitarbeitenden.",
          "Test version: the codes are computed in the browser and therefore offer no real protection. In live operation the server generates them, stores them encrypted and shows this page only to signed-in association staff.",
        )}
      </p>
    </div>
  );
}
