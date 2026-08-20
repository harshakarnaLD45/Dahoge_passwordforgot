// Startseite: Hero, Regionen-Filter, Suche und Betriebs-Karten (Xm im Bundle).
import { useState } from "react";
import { v } from "../Utils/i18n";
import { dateKey } from "../Utils/dates";
import { TableSvg } from "../Components/TableSvg";
import { LocCard } from "../Components/LocCard";
import { REGIONS } from "../Services/data";
import { MapSection } from "../Components/MapSection";

export function HomePage({
  locations,
  isHost,
  onOpen,
  onHost,
}) {
  console.log("HOME locations:", locations);
  console.log("HOME isHost:", isHost);
  const [region, setRegion] = useState("Alle Regionen");
  const [query, setQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const todayKey = dateKey(new Date());

  const isConfigured = (loc) => {
    const hasSlotByDay = Object.keys(loc.slotsByDay || {}).length > 0;

    return !!(
      (loc.days || []).length &&
      ((loc.slots || []).length || hasSlotByDay)
    );
  };

  const filtered = locations.filter((loc) => {
    return (
      (region === "Alle Regionen" || loc.region === region) &&
      (query.trim() === "" ||
        `${loc.name} ${loc.city} ${loc.type}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()))
    );
  });


  const ambientTaken = [0, 2, 5, 7];

  return (
    <div className="mt-wrap" style={{ paddingBottom: 60 }}>
      <div
        className="hero-panel"
        style={{ marginTop: 18, padding: "clamp(22px,4vw,40px)" }}
      >
        <div
          style={{
            display: "flex",
            gap: 28,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "1 1 320px", minWidth: 280 }}>
            <div className="eyebrow">
              {v("Gemeinschaftstische in ganz Sachsen", "Communal tables across Saxony")}
            </div>
            <h1 className="h1">
              {v(
                <>
                  Ein Tisch,
                  <br />
                  der mischt.
                </>,
                <>
                  One table
                  <br />
                  that mixes.
                </>,
              )}
            </h1>
            <p className="lead">
              {v(
                "In jedem teilnehmenden Wirtshaus, Restaurant und Hotel steht genau ein Mischtisch — der Tisch für alle, die Gesellschaft suchen. Hier reservierst du deinen Stuhl. Zentral, mit einem Konto, von der Oberlausitz bis ins Vogtland.",
                "Every participating inn, restaurant and hotel sets exactly one Mischtisch — the table for anyone who would rather not eat alone. Here you book your seat: one place for all of Saxony, from Görlitz to the Vogtland.",
              )}
            </p>
            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 18,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <button
                className="btn btn-primary"
                onClick={() =>
                  document
                    .getElementById("mt-liste")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                {v("Platz finden", "Find a seat")}
              </button>
              <button className="btn btn-ghost" onClick={onHost}>
                {v("Für Gastgeber", "For hosts")}
              </button>
              <span style={{ fontSize: 13.5, color: "#5B627A" }}>
                {locations.length} {v("Partnerbetriebe", "partner venues")} ·{" "}
                {new Set(locations.map((loc) => loc.region)).size}{" "}
                {v("Regionen", "regions")} · {v("1 Konto", "one account")}
              </span>
            </div>
          </div>
          <div style={{ flex: "1 1 300px", minWidth: 260 }}>
            <TableSvg seats={10} occupied={ambientTaken} ambient />
            <div
              style={{
                textAlign: "center",
                fontSize: 13,
                color: "#8A8FA3",
                marginTop: 2,
              }}
            >
              {v(
                "So sieht Mischen aus: belegt, frei — und bald du.",
                "This is what mixing looks like: taken, free — and soon you.",
              )}
            </div>
          </div>
        </div>
      </div>
       {/* SMALL MAP BELOW THE HERO CONTENT */}

      <div className="home-map-section">
        <MapSection
          locations={locations}
          selectedLocation={selectedLocation}
          onSelect={(loc) => setSelectedLocation(loc)}
        />
      </div>

      <div id="mt-liste" style={{ margin: "30px 0 14px" }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 12,
          }}
        >
          {["Alle Regionen", ...REGIONS].map((c) => (
            <button
              key={c}
              className={`chip ${c === region ? "on" : ""}`}
              onClick={() => setRegion(c)}
              aria-pressed={c === region}
            >
              {c === "Alle Regionen" ? v("Alle Regionen", "All regions") : c}
            </button>
          ))}
        </div>
        <input
          className="input"
          style={{ maxWidth: 380 }}
          placeholder={v("Ort oder Betrieb suchen …", "Search town or venue …")}
          value={query}
          onChange={(ev) => setQuery(ev.target.value)}
          aria-label={v("Suche", "Search")}
        />
      </div>


     
      {filtered.length === 0 ? (
        <div
          className="card"
          style={{ textAlign: "center", color: "#5B627A" }}
        >
          {v(
            "Kein Mischtisch gefunden. Andere Region oder Suchbegriff probieren.",
            "No Mischtisch found. Try another region or search term.",
          )}
        </div>
      ) : (
        <div className="grid-cards">
          {filtered.map((loc) => (
            <LocCard key={loc.id} loc={loc} todayKey={todayKey} onOpen={onOpen} />
          ))}
        </div>
      )}
    </div>
  );
}
