// Per-Wochentag-Uhrzeit-Editor nach Referenzdesign: einstellbarer Zeitbereich
// (von/bis/Takt) erzeugt ein Raster anklickbarer Zeitfenster-Chips. Ausgewählte
// Chips = buchbare Slots; leere Auswahl = Tag nicht buchbar.
import { useState, useMemo, useCallback } from "react";
import { v } from "../Utils/i18n";
import { buildSlots, slotToMinutes } from "../Utils/format";

export function SlotEditor({ slots = [], onChange }) {
  // Ausgangswerte aus bestehenden Slots ableiten, damit beim Bearbeiten
  // eines Betriebs das bisherige Zeitfenster korrekt angezeigt wird.
  const first = slots[0] || "18:00";
  const last = slots[slots.length - 1] || "18:00";
  const abstand =
    slots.length >= 2 ? slotToMinutes(slots[1]) - slotToMinutes(slots[0]) : 60;
  const [von, setVon] = useState(first);
  const [bis, setBis] = useState(last);
  const [takt, setTakt] = useState([30, 60, 90, 120].includes(abstand) ? abstand : 60);

  // Alle möglichen Slots im aktuellen Zeitfenster
  const allSlots = useMemo(() => buildSlots(von, bis, takt), [von, bis, takt]);
  const selectedSet = useMemo(() => new Set(slots), [slots]);
  const hasSelection = slots.length > 0;

  // Einzelnen Slot umschalten
  const toggle = useCallback(
    (slot) => {
      const next = selectedSet.has(slot)
        ? slots.filter((s) => s !== slot)
        : [...slots, slot].sort();
      onChange(next);
    },
    [slots, selectedSet, onChange],
  );

  // Alle Slots im aktuellen Zeitfenster auswählen
  const selectAll = useCallback(() => {
    onChange(allSlots);
  }, [allSlots, onChange]);

  // Alle Slots löschen (Tag nicht buchbar)
  const clearAll = useCallback(() => {
    onChange([]);
  }, [onChange]);

  return (
    <div>
      {!hasSelection ? (
        // Unavailable-Zustand: kein Slot ausgewählt
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, color: "#5B627A" }}>
            {v("Nicht buchbar", "Unavailable")}
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={selectAll}
            title={v("Uhrzeiten hinzufügen", "Add time slots")}
          >
            + {v("Uhrzeiten", "Time slots")}
          </button>
        </div>
      ) : (
        <div>
          {/* Zeitfenster-Eingabe */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <div>
              <label className="label" style={{ fontWeight: 500 }}>
                {v("Von", "From")}
              </label>
              <input
                type="time"
                className="input"
                value={von}
                onChange={(e) => setVon(e.target.value)}
                aria-label={v("Beginn", "Start time")}
              />
            </div>
            <div>
              <label className="label" style={{ fontWeight: 500 }}>
                {v("bis", "to")}
              </label>
              <input
                type="time"
                className="input"
                value={bis}
                onChange={(e) => setBis(e.target.value)}
                aria-label={v("Ende", "End time")}
              />
            </div>
            <div>
              <label className="label" style={{ fontWeight: 500 }}>
                {v("Takt", "Interval")}
              </label>
              <select
                className="input"
                value={takt}
                onChange={(e) => setTakt(Number(e.target.value))}
                aria-label={v("Takt", "Interval")}
              >
                <option value={30}>{v("alle 30 Min.", "every 30 min")}</option>
                <option value={60}>{v("jede Stunde", "every hour")}</option>
                <option value={90}>{v("alle 90 Min.", "every 90 min")}</option>
                <option value={120}>{v("alle 2 Std.", "every 2 h")}</option>
              </select>
            </div>
          </div>

          {/* Raster anklickbarer Zeitfenster-Chips */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {allSlots.length === 0 ? (
              <span className="notice">
                {v("„bis“ muss nach „von“ liegen.", "“to” must be after “from”.")}
              </span>
            ) : (
              allSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className={`chip ${selectedSet.has(slot) ? "on" : ""}`}
                  onClick={() => toggle(slot)}
                  aria-pressed={selectedSet.has(slot)}
                >
                  {slot}
                  {v(" Uhr", "")}
                </button>
              ))
            )}
          </div>

          {/* Schnellaktionen */}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            {allSlots.length > 0 && !allSlots.every((s) => selectedSet.has(s)) && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={selectAll}
              >
                {v("Alle auswählen", "Select all")}
              </button>
            )}
            {hasSelection && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={clearAll}
                style={{ color: "#B4443C" }}
              >
                {v("Nicht buchbar", "Unavailable")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}