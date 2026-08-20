// Tischform melden: Variante wählen oder selbst anordnen, Umgebung (Vm im Bundle).
import { useState } from "react";
import { v } from "../Utils/i18n";
import { presetById, presetLabel, presetVariant, tischLabel, TABLE_PRESETS, UMGEBUNG, umgebungLabel } from "../Utils/table";
import { slugify } from "../Utils/strings";
import { mailtoHref } from "../Utils/mail";
import { upsertVenue, setSetting } from "../Services/storage";
import { TableSvg } from "../Components/TableSvg";
import { ChairEditor } from "../Components/ChairEditor";

export function TischformPage({ locations, preselect, reload, showToast, onDone, onBack }) {
  const [selected, setSelected] = useState(preselect || "");
  const [name, setName] = useState("");
  const [kontakt, setKontakt] = useState("");
  const [modus, setModus] = useState("var");
  const [variant, setVariant] = useState("E8");
  const [shape, setShape] = useState("rect");
  const [slots, setSlots] = useState([]);
  const [notiz, setNotiz] = useState("");
  const [umgebung, setUmgebung] = useState({ top: "", bottom: "", left: "", right: "" });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(null);

  const env = umgebung.top || umgebung.bottom || umgebung.left || umgebung.right ? umgebung : null;

  const tisch = {
    ...(modus === "var"
      ? presetVariant(presetById(variant))
      : {
          variant: "custom",
          shape,
          custom: { shape, slots: [...slots].sort((a, b) => a - b) },
          seats: slots.length,
        }),
    umgebung: env,
  };

  const toggleSlot = (n) =>
    setSlots((cur) => (cur.includes(n) ? cur.filter((m) => m !== n) : [...cur, n]));

  const save = async () => {
    const loc = locations.find((l) => l.id === selected);
    const g = loc ? loc.name : name.trim();
    if (!g || g.length < 3) {
      showToast(v("Bitte Betrieb auswählen oder Namen eintragen.", "Please select a venue or enter a name."));
      return;
    }
    if (modus === "eigen" && slots.length < 4) {
      showToast(v("Bitte mindestens 4 Plätze setzen.", "Please set at least 4 seats."));
      return;
    }
    setSaving(true);
    try {
      const entry = {
        tisch,
        seats: tisch.seats,
        tischNote: notiz.trim(),
        tischKontakt: kontakt.trim(),
        tischEingereicht: new Date().toISOString(),
      };
      if (loc) {
        // upsertVenue ersetzt die ganze Zeile — loc ist der vollständige Betrieb.
        await upsertVenue({ ...loc, ...entry });
        reload();
      } else {
        await setSetting(
          `tischform-new:${slugify(g)}-${Date.now() % 1e5}`,
          { name: g, ...entry },
        );
      }
      const mail = {
        an: "",
        betreff: v(`Tischform Mischtisch — ${g}`, `Table shape Mischtisch — ${g}`),
        lines: [
          v(`Betrieb: ${g}`, `Venue: ${g}`),
          v(`Tischform: ${tischLabel(tisch)}`, `Table shape: ${tischLabel(tisch)}`),
          tisch.custom
            ? v(
                `Verteilung: eigene Anordnung (Positionen ${tisch.custom.slots.map((n) => n + 1).join(", ")})`,
                `Layout: custom arrangement (positions ${tisch.custom.slots.map((n) => n + 1).join(", ")})`,
              )
            : v(
                `Gewählte Variante: ${presetLabel(presetById(tisch.variant)) || tisch.variant}`,
                `Chosen variant: ${presetLabel(presetById(tisch.variant)) || tisch.variant}`,
              ),
          env
            ? v(
                `Umgebung: ${[umgebung.top && `oben ${umgebung.top}`, umgebung.bottom && `unten ${umgebung.bottom}`, umgebung.left && `links ${umgebung.left}`, umgebung.right && `rechts ${umgebung.right}`].filter(Boolean).join(", ")}`,
                `Surroundings: ${[umgebung.top && `above ${umgebungLabel(umgebung.top)}`, umgebung.bottom && `below ${umgebungLabel(umgebung.bottom)}`, umgebung.left && `left ${umgebungLabel(umgebung.left)}`, umgebung.right && `right ${umgebungLabel(umgebung.right)}`].filter(Boolean).join(", ")}`,
              )
            : null,
          notiz.trim() ? v(`Hinweise: ${notiz.trim()}`, `Notes: ${notiz.trim()}`) : null,
          kontakt.trim()
            ? v(`Rückfragen an: ${kontakt.trim()}`, `Contact for queries: ${kontakt.trim()}`)
            : null,
          v(
            "— übermittelt über das Tischform-Formular von Mischtisch Sachsen",
            "— submitted via the table-shape form of Mischtisch Sachsen",
          ),
        ].filter(Boolean),
      };
      setDone({ name: g, tisch, mail, imSystem: !!loc });
      showToast(v("Tischform gespeichert", "Table shape saved"));
      window.scrollTo({ top: 0 });
    } catch (err) {
      console.error(err);
      showToast(v("Speichern hat nicht geklappt.", "Saving failed."));
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="mt-wrap" style={{ padding: "28px 20px 60px", maxWidth: 720 }}>
        <div className="card" style={{ textAlign: "center", padding: "30px 22px" }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "var(--kobalt)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              margin: "0 auto 12px",
            }}
          >
            ✓
          </div>
          <div
            className="f-display"
            style={{ fontSize: 26, fontWeight: 600, color: "var(--kobalt-dunkel)" }}
          >
            {v("Tischform übermittelt", "Table shape submitted")}
          </div>
          <p style={{ color: "#3A4258", margin: "8px auto 4px", maxWidth: "46ch" }}>
            <b>{done.name}</b> — {tischLabel(done.tisch)}.
            {done.imSystem
              ? v(
                  " Der Tischplan in der Reservierungsansicht zeigt ab sofort genau diese Anordnung.",
                  " The table plan in the booking view now shows exactly this layout.",
                )
              : v(
                  " Das Team trägt den Betrieb mit dieser Anordnung ein.",
                  " The team will add the venue with this layout.",
                )}
          </p>
        </div>
        <div className="card" style={{ marginTop: 14 }}>
          <TableSvg tisch={done.tisch} seats={done.tisch.seats} occupied={[]} />
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: 16,
          }}
        >
          {/* <a
            className="btn btn-primary"
            style={{ textDecoration: "none", display: "inline-block" }}
            href={mailtoHref(done.mail)}
          >
            {v("Ans MischTisch-Team senden", "Send to the Mischtisch team")}
          </a> */}
          <button className="btn btn-ghost" onClick={onDone}>
            {v("Fertig", "Done")}
          </button>
        </div>
        <p className="notice" style={{ marginTop: 10, textAlign: "center" }}>
          {v(
            "Der Button öffnet Ihr E-Mail-Programm mit der Zusammenfassung — Empfänger-Adresse des Teams eintragen und senden.",
            "The button opens your email program with the summary — enter the team's address and send.",
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-wrap" style={{ padding: "20px 20px 60px", maxWidth: 820 }}>
      <button className="nav-btn" onClick={onBack} style={{ marginLeft: -10 }}>
        {v("← Zurück", "← Back")}
      </button>
      <div className="eyebrow" style={{ marginTop: 10 }}>
        {v("Für Partnerbetriebe", "For partner venues")}
      </div>
      <h2
        className="f-display"
        style={{
          fontSize: "clamp(24px,4.2vw,36px)",
          fontWeight: 600,
          margin: "6px 0 8px",
          color: "var(--kobalt-dunkel)",
        }}
      >
        {v("Ihr Mischtisch: Form & Plätze", "Your Mischtisch: shape & seats")}
      </h2>
      <p className="lead" style={{ marginBottom: 20 }}>
        {v(
          "Sagen Sie uns, wie Ihr Mischtisch aussieht: rund oder eckig, wie viele Personen daran sitzen und wie die Plätze verteilt sind. Wählen Sie eine von zehn Varianten — oder ordnen Sie die Plätze selbst an und zeichnen Sie dazu. Ihre Angaben erscheinen direkt im Reservierungs-Tischplan.",
          "Tell us what your Mischtisch looks like: round or rectangular, how many people sit at it and how the seats are arranged. Choose one of ten variants — or arrange the seats yourself and add a sketch. Your entries appear directly in the booking table plan.",
        )}
      </p>
      <div className="card" style={{ display: "grid", gap: 16 }}>
        <div className="form-grid">
          <div>
            <label className="label" htmlFor="tf-sel">
              {v("Ihr Betrieb", "Your venue")}
            </label>
            <select
              id="tf-sel"
              className="input"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="">{v("— Betrieb wählen —", "— choose venue —")}</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} · {l.city}
                </option>
              ))}
              <option value="__frei">{v("Mein Betrieb ist nicht in der Liste", "My venue is not in the list")}</option>
            </select>
            {selected === "__frei" && (
              <input
                className="input"
                style={{ marginTop: 8 }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={v("Name des Betriebs", "Name of the venue")}
                aria-label={v("Name des Betriebs", "Name of the venue")}
              />
            )}
          </div>
          <div>
            <label className="label" htmlFor="tf-mail">
              {v("Ihre E-Mail für Rückfragen (optional)", "Your email for queries (optional)")}
            </label>
            <input
              id="tf-mail"
              type="email"
              className="input"
              value={kontakt}
              onChange={(e) => setKontakt(e.target.value)}
              placeholder={v("reservierung@ihr-betrieb.example", "booking@your-venue.example")}
            />
          </div>
        </div>
        <div>
          <div className="label">{v("Variante wählen — oder selbst anordnen", "Choose a variant — or arrange it yourself")}</div>
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 10 }}
          >
            {TABLE_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`varbtn ${modus === "var" && variant === p.id ? "on" : ""}`}
                onClick={() => {
                  setModus("var");
                  setVariant(p.id);
                }}
                aria-pressed={modus === "var" && variant === p.id}
              >
                <div style={{ fontSize: 24, lineHeight: 1 }}>
                  {p.shape === "round" ? "◯" : p.shape === "square" ? "▢" : "▭"}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6 }}>{presetLabel(p)}</div>
              </button>
            ))}
            <button
              type="button"
              className={`varbtn ${modus === "eigen" ? "on" : ""}`}
              onClick={() => setModus("eigen")}
              aria-pressed={modus === "eigen"}
            >
              <div style={{ fontSize: 24, lineHeight: 1 }}>✎</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6 }}>{v("Selbst anordnen", "Arrange yourself")}</div>
            </button>
          </div>
        </div>
        {modus === "var" ? (
          <div>
            <div className="label">{v("Vorschau — so sehen Gäste Ihren Tisch", "Preview — this is how guests see your table")}</div>
            <TableSvg tisch={tisch} seats={tisch.seats} occupied={[]} />
          </div>
        ) : (
          <div>
            <div className="label">
              {v(
                "Eigene Anordnung: Grundform wählen, dann auf die gestrichelten Positionen tippen",
                "Custom layout: choose a basic shape, then tap the dashed positions",
              )}
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <button
                type="button"
                className={`chip ${shape === "rect" ? "on" : ""}`}
                onClick={() => {
                  setShape("rect");
                  setSlots([]);
                }}
                aria-pressed={shape === "rect"}
              >
                {v("Eckig", "Rectangular")}
              </button>
              <button
                type="button"
                className={`chip ${shape === "round" ? "on" : ""}`}
                onClick={() => {
                  setShape("round");
                  setSlots([]);
                }}
                aria-pressed={shape === "round"}
              >
                {v("Rund", "Round")}
              </button>
              <span className="notice" style={{ alignSelf: "center" }}>
                {slots.length} {slots.length === 1 ? v("Platz", "seat") : v("Plätze", "seats")} {v("gesetzt", "set")}
              </span>
            </div>
            <ChairEditor shape={shape} slots={slots} onToggle={toggleSlot} umgebung={env} />
          </div>
        )}
        <div>
          <div className="label">
            {v(
              "Umgebung des Tischs (optional): Was liegt an welcher Seite? So bilden wir auch Küche, Eingang & Co. ab.",
              "Table surroundings (optional): what is on which side? This lets us show the kitchen, entrance & co. as well.",
            )}
          </div>
          <div className="form-grid">
            {[
              ["top", v("Oberhalb des Tischs", "Above the table")],
              ["bottom", v("Unterhalb des Tischs", "Below the table")],
              ["left", v("Links vom Tisch", "Left of the table")],
              ["right", v("Rechts vom Tisch", "Right of the table")],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="label" htmlFor={`tf-umg-${key}`} style={{ fontWeight: 500 }}>
                  {label}
                </label>
                <select
                  id={`tf-umg-${key}`}
                  className="input"
                  value={umgebung[key]}
                  onChange={(e) => setUmgebung((u) => ({ ...u, [key]: e.target.value }))}
                >
                  <option value="">{v("— nichts angeben —", "— nothing —")}</option>
                  {UMGEBUNG.map((opt) => (
                    <option key={opt} value={opt}>
                      {umgebungLabel(opt)}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="notice" style={{ marginTop: 6 }}>
            {v(
              "Die Angaben erscheinen als Beschriftung rund um den Tischplan — auch für Gäste bei der Reservierung.",
              "These entries appear as labels around the table plan — also for guests while booking.",
            )}
          </div>
        </div>
        <div>
          <label className="label" htmlFor="tf-note">
            {v("Anmerkungen (optional)", "Notes (optional)")}
          </label>
          <input
            id="tf-note"
            className="input"
            value={notiz}
            onChange={(e) => setNotiz(e.target.value)}
            placeholder={v("z. B. Eichentisch am Fenster, Bank an der Wandseite …", "e.g. oak table by the window, bench along the wall …")}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span className="notice">
            {v(
              "Prototyp: Angaben sind sofort sichtbar — im Live-Betrieb mit Freigabe durch das Team.",
              "Prototype: entries are visible immediately — in live operation the team approves them.",
            )}
          </span>
          <button className="btn btn-primary" disabled={saving} onClick={save}>
            {saving
              ? v("Wird gespeichert …", "Saving …")
              : v("Tischform speichern & senden", "Save & send table shape")}
          </button>
        </div>
      </div>
    </div>
  );
}
