// Platz-Stepper: − [Zahl] + mit Grenzen (Standard 2–14).
import { v } from "../Utils/i18n";

export function SeatStepper({ seats, onChange, min = 2, max = 14 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => onChange(Math.max(min, seats - 1))}
        aria-label={v("Weniger Plätze", "Fewer seats")}
      >
        −
      </button>
      <input
        type="number"
        className="input"
        style={{ width: 88, textAlign: "center", fontWeight: 600 }}
        value={seats}
        min={min}
        max={max}
        onChange={(e) => {
          let n = parseInt(e.target.value, 10);
          if (!isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
        }}
        aria-label={v("Anzahl Plätze", "Number of seats")}
      />
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => onChange(Math.min(max, seats + 1))}
        aria-label={v("Mehr Plätze", "More seats")}
      >
        +
      </button>
      <span className="notice">
        {v(`${min} bis ${max} Personen`, `${min} to ${max} people`)}
      </span>
    </div>
  );
}
