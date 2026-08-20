// Zeitfenster-Helfer: Slots sind "HH:MM"-Strings.

export function slotToMinutes(slot) {
  const [h, m] = String(slot).split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minutesToSlot(min) {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

// Erzeugt Slots von from bis to im Takt step (mindestens 15 Minuten, max. 24 Einträge).
export function buildSlots(from, to, step) {
  const start = slotToMinutes(from);
  const end = slotToMinutes(to);
  const takt = Math.max(15, Number(step) || 60);
  if (!(end >= start)) return [];
  const slots = [];
  for (let s = start; s <= end && slots.length < 24; s += takt) {
    slots.push(minutesToSlot(s));
  }
  return slots;
}
