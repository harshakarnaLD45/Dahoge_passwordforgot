// Wochentags-Auswahl als Chips (Montag bis Sonntag).
import { dayShortName, WEEK_ORDER } from "../Utils/i18n";

export function DayChips({ days, onChange }) {
  let toggle = (day) =>
    onChange(days.includes(day) ? days.filter((d) => d !== day) : [...days, day]);
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {WEEK_ORDER.map((day) => (
        <button
          key={day}
          type="button"
          className={`chip ${days.includes(day) ? "on" : ""}`}
          onClick={() => toggle(day)}
          aria-pressed={days.includes(day)}
        >
          {dayShortName[day]}
        </button>
      ))}
    </div>
  );
}
