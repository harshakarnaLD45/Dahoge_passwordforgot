import { v, dayShortName, dayLongName, monthName } from "./i18n";

// YYYY-MM-DD aus einem Date-Objekt
export function dateKey(date) {
  let year = date.getFullYear();
  let month = String(date.getMonth() + 1).padStart(2, "0");
  let day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Die nächsten n Tage (ab heute, jeweils 00:00 Uhr)
export function nextDays(count) {
  let result = [];
  let now = new Date();
  now.setHours(0, 0, 0, 0);
  for (let i = 0; i < count; i++) {
    let d = new Date(now);
    d.setDate(now.getDate() + i);
    result.push(d);
  }
  return result;
}

// "Mo, 04.08." aus einem Datums-Schlüssel
export function shortDate(dateKeyStr) {
  let [y, m, d] = dateKeyStr.split("-").map(Number);
  let date = new Date(y, m - 1, d);
  return `${dayShortName[date.getDay()]}, ${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}.`;
}

// "Montag, 4. August 2026" (de) bzw. "Monday, 4 August 2026" (en)
export function longDate(dateKeyStr) {
  let [y, m, d] = dateKeyStr.split("-").map(Number);
  let date = new Date(y, m - 1, d);
  return v(
    `${dayLongName[date.getDay()]}, ${d}. ${monthName(m - 1)} ${y}`,
    `${dayLongName[date.getDay()]}, ${d} ${monthName(m - 1)} ${y}`,
  );
}

// "täglich", "Mo–Fr" oder "Mo, Di, Do" aus einer Wochentags-Liste
export function daysList(days) {
  let list = [1, 2, 3, 4, 5, 6, 0].filter((i) => days.includes(i));
  if (list.length === 7) return v("täglich", "daily");
  let indexes = list.map((i) => [1, 2, 3, 4, 5, 6, 0].indexOf(i));
  let contiguous = true;
  for (let i = 1; i < indexes.length; i++) {
    if (indexes[i] !== indexes[i - 1] + 1) contiguous = false;
  }
  if (contiguous && list.length > 2)
    return `${dayShortName[list[0]]}–${dayShortName[list[list.length - 1]]}`;
  return list.map((i) => dayShortName[i]).join(", ");
}
