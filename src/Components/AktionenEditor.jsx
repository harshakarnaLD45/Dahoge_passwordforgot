// Aktions-Editor: Zeitraum, Titel, Angebot, optional eigene Zeiten / täglich.
import { useState } from "react";
import { v } from "../Utils/i18n";
import { buildSlots } from "../Utils/format";
import { aktionRange } from "../Utils/aktion";

export function AktionenEditor({ aktionen, onChange, showToast }) {
  let [titel, setTitel] = useState("");
  let [von, setVon] = useState("");
  let [bis, setBis] = useState("");
  let [angebot, setAngebot] = useState("");
  let [alleTage, setAlleTage] = useState(false);
  let [eigeneZeiten, setEigeneZeiten] = useState(false);
  let [zvon, setZvon] = useState("18:00");
  let [zbis, setZbis] = useState("20:00");
  let [takt, setTakt] = useState(60);
  let sorted = (aktionen || []).slice().sort((a, b) => a.von.localeCompare(b.von));
  let add = () => {
    if (titel.trim().length < 3 || !von || !bis) return;
    if (bis < von) {
      showToast?.(
        v(
          "Das „Bis“-Datum darf nicht vor dem „Von“-Datum liegen.",
          "The “to” date cannot be before the “from” date.",
        ),
      );
      return;
    }
    let entry = {
      id: `a-${Date.now() % 1e6}`,
      titel: titel.trim(),
      von,
      bis,
      angebot: angebot.trim(),
      alleTage,
      slots: eigeneZeiten ? buildSlots(zvon, zbis, takt) : [],
    };
    onChange([...(aktionen || []), entry]);
    setTitel("");
    setVon("");
    setBis("");
    setAngebot("");
    setAlleTage(false);
    setEigeneZeiten(false);
  };
  let remove = (id) => onChange((aktionen || []).filter((a) => a.id !== id));
  return (
    <div>
      {sorted.length > 0 && (
        <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
          {sorted.map((a) => (
            <div
              key={a.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 10,
                flexWrap: "wrap",
                border: "1px solid var(--honig)",
                background: "#FDF6E7",
                borderRadius: 10,
                padding: "10px 12px",
                fontSize: 14,
              }}
            >
              <span>
                <b>{a.titel}</b> · {aktionRange(a)}
                {a.slots && a.slots.length > 0 && (
                  <span style={{ color: "#5B627A" }}>
                    {" "}
                    · {a.slots.join(", ")}
                    {v(" Uhr", "")}
                  </span>
                )}
                {a.alleTage && (
                  <span style={{ color: "var(--moos)" }}> · {v("täglich buchbar", "bookable daily")}</span>
                )}
                {a.angebot && <div style={{ color: "#5B627A" }}>{a.angebot}</div>}
              </span>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => remove(a.id)}
              >
                {v("Entfernen", "Remove")}
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="form-grid">
        <div>
          <label className="label" htmlFor="ak-titel" style={{ fontWeight: 500 }}>
            {v("Titel der Aktion", "Title of the promotion")}
          </label>
          <input
            id="ak-titel"
            className="input"
            value={titel}
            onChange={(e) => setTitel(e.target.value)}
            placeholder={v("z. B. Lausitzer Fischwochen", "e.g. Lusatian fish weeks")}
          />
        </div>
        <div>
          <label className="label" htmlFor="ak-von" style={{ fontWeight: 500 }}>
            {v("Von", "From")}
          </label>
          <input
            id="ak-von"
            type="date"
            className="input"
            value={von}
            onChange={(e) => setVon(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="ak-bis" style={{ fontWeight: 500 }}>
            {v("Bis", "To")}
          </label>
          <input
            id="ak-bis"
            type="date"
            className="input"
            value={bis}
            onChange={(e) => setBis(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="ak-angebot" style={{ fontWeight: 500 }}>
            {v("Spezialangebot (für Gäste sichtbar)", "Special offer (visible to guests)")}
          </label>
          <input
            id="ak-angebot"
            className="input"
            value={angebot}
            onChange={(e) => setAngebot(e.target.value)}
            placeholder={v("z. B. Fischplatte am Mischtisch, 24 € p. P.", "e.g. fish platter at the Mischtisch, €24 p.p.")}
          />
        </div>
      </div>
      <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
        <label
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          <input
            type="checkbox"
            checked={alleTage}
            onChange={(e) => setAlleTage(e.target.checked)}
            style={{ marginTop: 3 }}
          />
          <span>
            {v("In diesem Zeitraum", "During this period")} <b>{v("täglich", "daily")}</b>{" "}
            {v(
              "buchbar — auch an Tagen ohne regulären Mischtisch (Ruhetage bleiben geschlossen).",
              "bookable — also on days without a regular Mischtisch (days off stay closed).",
            )}
          </span>
        </label>
        <label
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          <input
            type="checkbox"
            checked={eigeneZeiten}
            onChange={(e) => setEigeneZeiten(e.target.checked)}
            style={{ marginTop: 3 }}
          />
          <span>
            {v(
              "Eigene Uhrzeiten für die Aktion (sonst gelten die regulären Zeiten).",
              "Custom times for the promotion (otherwise the regular times apply).",
            )}
          </span>
        </label>
        {eigeneZeiten && (
          <div className="form-grid">
            <div>
              <label className="label" htmlFor="ak-zvon" style={{ fontWeight: 500 }}>
                {v("Reservierbar von", "Bookable from")}
              </label>
              <input
                id="ak-zvon"
                type="time"
                className="input"
                value={zvon}
                onChange={(e) => setZvon(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="ak-zbis" style={{ fontWeight: 500 }}>
                {v("bis", "to")}
              </label>
              <input
                id="ak-zbis"
                type="time"
                className="input"
                value={zbis}
                onChange={(e) => setZbis(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="ak-takt" style={{ fontWeight: 500 }}>
                {v("Takt", "Interval")}
              </label>
              <select
                id="ak-takt"
                className="input"
                value={takt}
                onChange={(e) => setTakt(Number(e.target.value))}
              >
                <option value={30}>{v("alle 30 Minuten", "every 30 minutes")}</option>
                <option value={60}>{v("jede Stunde", "every hour")}</option>
                <option value={90}>{v("alle 90 Minuten", "every 90 minutes")}</option>
                <option value={120}>{v("alle 2 Stunden", "every 2 hours")}</option>
              </select>
            </div>
          </div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          marginTop: 12,
          flexWrap: "wrap",
        }}
      >
        <span className="notice">
          {v(
            "Aktionen erscheinen bei Gästen mit Titel, Zeitraum und Angebot — und werden in Bestätigung und E-Mail mitgeführt.",
            "Promotions are shown to guests with title, period and offer — and are included in the confirmation and email.",
          )}
        </span>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={add}
          disabled={titel.trim().length < 3 || !von || !bis}
        >
          {v("Aktion hinzufügen", "Add promotion")}
        </button>
      </div>
    </div>
  );
}
