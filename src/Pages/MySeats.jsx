// Meine Plätze: alle Reservierungen des Kontos, Drucken, Kalender, Stornieren (Fm im Bundle).
import { useState, useEffect } from "react";
import { v } from "../Utils/i18n";
import { shortDate } from "../Utils/dates";
import { downloadIcs } from "../Utils/ics";
import {
  withTransaction,
  getOccupancy,
  setOccupancy,
  removeReservation,
  getAccount,
} from "../Services/storage";
import { Beleg, printBeleg } from "../Components/Beleg";

export function MySeats({ user, setUser, onExplore, showToast, locations }) {
  const res = (user?.res || [])
    .slice()
    .sort((a, b) => (a.dateKey + a.slot).localeCompare(b.dateKey + b.slot));
  const [print, setPrint] = useState(null);

  useEffect(() => {
    if (print) {
      printBeleg();
      const t = window.setTimeout(() => setPrint(null), 1500);
      return () => window.clearTimeout(t);
    }
  }, [print]);

  const findLoc = (r) => (locations || []).find((l) => l.id === r.locId) || null;

  const cancel = async (r) => {
    try {
      await withTransaction(async () => {
        const occ = { ...((await getOccupancy(r.locId, r.dateKey)) || {}) };
        (r.slots || [r.slot]).forEach((s) => {
          occ[s] = (occ[s] || []).filter((n) => !r.seats.includes(n));
        });
        await setOccupancy(r.locId, r.dateKey, occ);
        await removeReservation(r.locId, r.id);
      });
      const next = await getAccount();
      setUser(next);
      showToast(
        v(
          "Reservierung storniert — der Betrieb wird informiert",
          "Reservation cancelled — the venue will be informed",
        ),
      );
    } catch (err) {
      console.error(err);
      showToast(v("Stornieren hat nicht geklappt.", "Cancellation failed."));
    }
  };

  return (
    <div className="mt-wrap" style={{ padding: "28px 20px 60px", maxWidth: 760 }}>
      <div className="eyebrow">{v("Dein Konto", "Your account")}</div>
      <h2
        className="f-display"
        style={{
          fontSize: "clamp(26px,4.5vw,36px)",
          fontWeight: 600,
          margin: "6px 0 6px",
          color: "var(--kobalt-dunkel)",
        }}
      >
        {v("Meine Plätze", "My seats")}
      </h2>
      {user?.profile && (
        <div style={{ color: "#5B627A", marginBottom: 18 }}>
          {user.profile.vorname} {user.profile.nachname} · {user.profile.email} ·{" "}
          {user.profile.telefon}
        </div>
      )}
      {print && (
        <div className="print-area">
          {(print === "alle" ? res : [print]).map((r) => (
            <div key={r.id} style={{ marginBottom: 18, pageBreakAfter: "always" }}>
              <Beleg res={r} loc={findLoc(r)} />
            </div>
          ))}
        </div>
      )}
      {res.length > 0 && (
        <div
          className="no-print"
          style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}
        >
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setPrint("alle")}
          >
            {v("Alle drucken oder als PDF speichern", "Print all or save as PDF")}
          </button>
        </div>
      )}
      {res.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "36px 24px" }}>
          <div style={{ fontSize: 34, marginBottom: 8 }}>🪑</div>
          <div className="f-display" style={{ fontSize: 22, fontWeight: 600 }}>
            {v("Noch kein Platz reserviert", "No seat booked yet")}
          </div>
          <p style={{ color: "#5B627A", margin: "8px auto 18px", maxWidth: "40ch" }}>
            {v(
              "Irgendwo in Sachsen ist gerade ein Stuhl frei. Such dir einen Tisch aus.",
              "Somewhere in Saxony a chair is free right now. Pick a table.",
            )}
          </p>
          <button className="btn btn-primary" onClick={onExplore}>
            {v("Tische entdecken", "Discover tables")}
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {res.map((r) => (
            <div
              key={r.id}
              className="card no-print"
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div className="f-display" style={{ fontSize: 19, fontWeight: 600 }}>
                  {r.locName}{" "}
                  <span style={{ fontWeight: 400, color: "#5B627A", fontSize: 15 }}>
                    · {r.city}
                  </span>
                </div>
                <div style={{ fontSize: 14.5, color: "#3A4258", marginTop: 3 }}>
                  {shortDate(r.dateKey)} · {(r.slots || [r.slot]).join(" & ")}
                  {v(" Uhr", "")} ·{" "}
                  {r.persons === 1
                    ? v("1 Person", "1 person")
                    : v(`${r.persons} Personen`, `${r.persons} people`)}{" "}
                  ({v("Stuhl", "chair")} {r.seats.map((n) => n + 1).join(", ")})
                </div>
                {r.aktion && (
                  <div style={{ fontSize: 13, color: "var(--eiche)", marginTop: 2 }}>
                    ★ {r.aktion}
                  </div>
                )}
                {r.note && (
                  <div style={{ fontSize: 13, color: "#8A8FA3", marginTop: 2 }}>
                    „{r.note}“
                  </div>
                )}
              </div>
              <div className="no-print" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setPrint(r)}>
                  {v("Drucken / PDF", "Print / PDF")}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => downloadIcs(r)}>
                  {v("Kalender", "Calendar")}
                </button>
                <button className="btn btn-danger" onClick={() => cancel(r)}>
                  {v("Stornieren", "Cancel")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
