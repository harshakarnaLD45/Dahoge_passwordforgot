// SVG-Tischpläne: Tischgrundform, Umgebungs-Beschriftung, interaktive
// Stuhl-Sitzplätze, Legende und Mini-Punktanzeige (aus dem Legacy-Bundle).
import { v } from "../Utils/i18n";
import { seatPositions, standardLayout, umgebungLabel } from "../Utils/table";

// Tisch-Grundform (rund / quadratisch / eckig) mit "MISCHTISCH"-Schriftzug
export function TableShape({ shape, compact }) {
  let label =
    !compact &&
    // ponytail: fester Schriftzug wie im Original
    (<text
      x="280"
      y="176"
      textAnchor="middle"
      fontFamily="Georgia, serif"
      fontSize="15"
      fontWeight="600"
      fill="#F5EEDF"
      letterSpacing="2"
    >
      MISCHTISCH
    </text>);
  if (shape === "round")
    return (
      <>
        <circle cx="280" cy="170" r="102" fill="var(--eiche)" />
        <circle cx="280" cy="170" r="88" fill="var(--eiche-hell)" opacity="0.55" />
        {label}
      </>
    );
  if (shape === "square")
    return (
      <>
        <rect x="196" y="86" width="168" height="168" rx="18" fill="var(--eiche)" />
        <rect x="204" y="94" width="152" height="152" rx="14" fill="var(--eiche-hell)" opacity="0.55" />
        {label}
      </>
    );
  return (
    <>
      <rect x="110" y="128" width="340" height="84" rx="20" fill="var(--eiche)" />
      <rect x="118" y="135" width="324" height="70" rx="15" fill="var(--eiche-hell)" opacity="0.55" />
      <line x1="132" y1="170" x2="428" y2="170" stroke="var(--eiche)" strokeWidth="2" opacity="0.5" />
      {label}
    </>
  );
}

// Umgebungs-Beschriftungen (Küche, Eingang, …) rund um den Tischplan
export function UmgebungLabels({ umg }) {
  let style = {
    fontSize: "12.5px",
    fill: "#6A7288",
    letterSpacing: "2px",
    fontWeight: 600,
    fontFamily: "inherit",
  };
  return (
    <g aria-hidden="true">
      {umg.top && (
        <text x="280" y="-12" textAnchor="middle" style={style}>
          {umgebungLabel(umg.top).toUpperCase()}
        </text>
      )}
      {umg.bottom && (
        <text x="280" y="364" textAnchor="middle" style={style}>
          {umgebungLabel(umg.bottom).toUpperCase()}
        </text>
      )}
      {umg.left && (
        <text x="14" y="170" textAnchor="middle" style={style} transform="rotate(-90 14 170)">
          {umgebungLabel(umg.left).toUpperCase()}
        </text>
      )}
      {umg.right && (
        <text x="546" y="170" textAnchor="middle" style={style} transform="rotate(90 546 170)">
          {umgebungLabel(umg.right).toUpperCase()}
        </text>
      )}
    </g>
  );
}

// Interaktiver Tischplan: belegte Stühle dunkel, gewählte mit Haken
export function TableSvg({
  seats,
  occupied,
  selected = [],
  onToggle,
  tisch = null,
  compact = false,
  ambient = false,
}) {
  let table = tisch && tisch.shape ? tisch : standardLayout(seats || 8);
  let positions = seatPositions(table);
  let total = positions.length;
  let shape = table.custom ? table.custom.shape : table.shape;
  let taken = new Set((occupied || []).filter((i) => i < total));
  let picked = new Set(selected);
  let r = 21;
  let umgebung =
    table.umgebung && Object.values(table.umgebung).some(Boolean)
      ? table.umgebung
      : null;
  let pad = umgebung ? 32 : 0;

  return (
    <svg
      viewBox={`0 ${-pad} 560 ${340 + 2 * pad}`}
      width="100%"
      style={{ maxWidth: compact ? 300 : 560, display: "block", margin: "0 auto" }}
      role="group"
      aria-label={v(
        `Tischplan mit ${total} Plätzen`,
        `Table plan with ${total} seats`,
      )}
    >
      <TableShape shape={shape} compact={compact} />
      {umgebung && <UmgebungLabels umg={umgebung} />}
      {positions.map((pos, i) => {
        let isTaken = taken.has(i);
        let isPicked = picked.has(i);
        let cls = isTaken ? "chair chair-taken" : "chair chair-free";
        let fill = isPicked
          ? "var(--kobalt)"
          : isTaken
            ? "var(--tinte)"
            : "#FFFFFF";
        let stroke = isPicked
          ? "var(--kobalt-dunkel)"
          : isTaken
            ? "var(--tinte)"
            : "var(--kobalt)";
        let clickable = !!onToggle && !isTaken;
        return (
          <g
            key={i}
            className={cls + (ambient && isTaken && i % 3 === 0 ? " pulse" : "")}
            role={clickable ? "button" : undefined}
            tabIndex={clickable ? 0 : undefined}
            aria-label={
              clickable
                ? v(`Stuhl ${i + 1} ${isPicked ? "abwählen" : "wählen"}`, `${isPicked ? "Deselect" : "Select"} seat ${i + 1}`)
                : v(`Stuhl ${i + 1} belegt`, `Seat ${i + 1} taken`)
            }
            onClick={clickable ? () => onToggle(i) : undefined}
            onKeyDown={
              clickable
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onToggle(i);
                    }
                  }
                : undefined
            }
            style={{ cursor: onToggle ? (isTaken ? "not-allowed" : "pointer") : "default" }}
          >
            <circle
              className="chair-ring"
              cx={pos.x}
              cy={pos.y}
              r={r + 4}
              fill="none"
              stroke={isPicked ? "var(--honig)" : "transparent"}
              strokeWidth="2.5"
            />
            <circle
              className="chair-body"
              cx={pos.x}
              cy={pos.y}
              r={r}
              fill={fill}
              stroke={stroke}
              strokeWidth="2.5"
            />
            {isPicked && (
              <text
                x={pos.x}
                y={pos.y + 5.5}
                textAnchor="middle"
                fontSize="17"
                fontWeight="700"
                fill="#fff"
              >
                ✓
              </text>
            )}
            {isTaken && !isPicked && (
              <circle cx={pos.x} cy={pos.y} r={7} fill="var(--porzellan)" opacity="0.9" />
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function Legend() {
  return (
    <div className="legend" style={{ marginTop: 4 }}>
      <span>
        <span
          className="dotmini"
          style={{ background: "#fff", border: "2px solid var(--kobalt)" }}
        />{" "}
        {v("frei", "free")}
      </span>
      <span>
        <span className="dotmini" style={{ background: "var(--tinte)" }} />{" "}
        {v("belegt", "taken")}
      </span>
      <span>
        <span className="dotmini" style={{ background: "var(--kobalt)" }} />{" "}
        {v("dein Platz", "your seat")}
      </span>
    </div>
  );
}

export function SeatDots({ total, taken }) {
  return (
    <span
      aria-label={v(
        `${total - taken} von ${total} Plätzen frei`,
        `${total - taken} of ${total} seats free`,
      )}
      style={{ letterSpacing: 2 }}
    >
      {[...Array(total)].map((_, i) => (
        <span
          key={i}
          className="dotmini"
          style={{
            background: i < taken ? "var(--tinte)" : "#fff",
            border: `2px solid ${i < taken ? "var(--tinte)" : "var(--kobalt)"}`,
            marginRight: "2px",

          }}
        />
      ))}
    </span>
  );
}
