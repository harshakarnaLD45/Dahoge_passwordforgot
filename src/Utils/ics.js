import { slugify } from "./strings";
import { v } from "./i18n";

// Lädt die Reservierung als Kalenderdatei (.ics) herunter.
export function downloadIcs(res) {
  const pad = (n) => String(n).padStart(2, "0");
  const slots = (res.slots || [res.slot]).slice().sort();
  const [y, m, d] = res.dateKey.split("-").map(Number);
  const [sh, sm] = slots[0].split(":").map(Number);
  const [eh, em] = slots[slots.length - 1].split(":").map(Number);
  const start = new Date(y, m - 1, d, sh, sm);
  const end = new Date(y, m - 1, d, eh + 2, em);
  const stamp = (dt) =>
    `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(dt.getMinutes())}00`;
  const esc = (text) =>
    String(text || "")
      .replace(/([,;\\])/g, "\\$1")
      .replace(/\n/g, "\\n");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mischtisch Sachsen//DE",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${res.id}@mischtisch-sachsen`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(v(`Mischtisch im ${res.locName}`, `Mischtisch at ${res.locName}`))}`,
    `LOCATION:${esc(`${res.locName}, ${res.city}`)}`,
    `DESCRIPTION:${esc(v(
      `${res.persons === 1 ? "1 Platz" : `${res.persons} Plätze`} am Mischtisch · Stuhl ${res.seats.map((s) => s + 1).join(", ")}${res.aktion ? ` · ${res.aktion}` : ""}`,
      `${res.persons === 1 ? "1 seat" : `${res.persons} seats`} at the Mischtisch · chair ${res.seats.map((s) => s + 1).join(", ")}${res.aktion ? ` · ${res.aktion}` : ""}`,
    ))}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(
    new Blob([lines], { type: "text/calendar;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `Mischtisch-${slugify(res.locName)}-${res.dateKey}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}
