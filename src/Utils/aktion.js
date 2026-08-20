import { shortDate } from "./dates";

// Aktive Aktion eines Betriebs am Datum t (dateKey), sonst null.
export function activeAktion(loc, dateKey) {
  return (
    (loc.aktionen || []).find(
      (a) => a.von && a.bis && a.von <= dateKey && dateKey <= a.bis,
    ) || null
  );
}

// Alle aktiven Aktionen an diesem Datum (leeres Array = keine).
export function activeAktionen(loc, dateKey) {
  return (loc.aktionen || []).filter(
    (a) => a.von && a.bis && a.von <= dateKey && dateKey <= a.bis,
  );
}

// Nächste (kommende) Aktion ab dateKey, sonst null.
export function nextAktion(loc, dateKey) {
  return (
    (loc.aktionen || [])
      .filter((a) => a.bis >= dateKey)
      .sort((a, b) => a.von.localeCompare(b.von))[0] || null
  );
}

// Zeitraum einer Aktion, z. B. "Mo, 04.08.–So, 10.08.".
export function aktionRange(aktion) {
  return `${shortDate(aktion.von)}–${shortDate(aktion.bis)}`;
}

// Gibt die Slots für einen bestimmten Wochentag zurück.
// Bevorzugt per-Tag definierte Slots (slotsByDay), fällt auf loc.slots zurück.
function slotsForDay(loc, weekday) {
  return (loc.slotsByDay || {})[weekday] || loc.slots || [];
}

// Tagesstatus eines Betriebs: voll / offen / ruhetag / kein.
// Berücksichtigt Sondertermine, Ruhetage, Mischtisch-Tage und Aktionswochen.
export function dayStatus(loc, dateKey, weekday) {
  const sonder = (loc.sonder || {})[dateKey] || null;
  const aktion = activeAktion(loc, dateKey);

  const aktionSlots =
    aktion && aktion.slots && aktion.slots.length
      ? aktion.slots
      : null;

  // CLOSED SPECIAL DATE
  if (sonder && sonder.typ === "zu") {
    return {
      status: "voll",
      slots: [],
      aktion,
    };
  }

  // SPECIAL OPENING
  if (sonder && sonder.typ === "offen") {
    return {
      status: "offen",
      slots:
        sonder.slots && sonder.slots.length
          ? sonder.slots
          : aktionSlots || slotsForDay(loc, weekday),
      sonder: true,
      aktion,
    };
  }

  // NORMAL OPENING
  if (loc.oeffnung && loc.oeffnung[weekday] === "Ruhetag") {
    return {
      status: "ruhetag",
      slots: [],
      aktion,
    };
  }

  if (!(loc.days || []).length) {
    return {
      status: "kein",
      slots: [],
      aktion,
    };
  }

  if ((loc.days || []).includes(weekday)) {
    return {
      status: "offen",
      slots: aktionSlots || slotsForDay(loc, weekday),
      aktion,
    };
  }

  if (aktion && aktion.alleTage) {
    return {
      status: "offen",
      slots: aktionSlots || slotsForDay(loc, weekday),
      aktion,
      aktionstag: true,
    };
  }

  return {
    status: "kein",
    slots: [],
    aktion,
  };
}
