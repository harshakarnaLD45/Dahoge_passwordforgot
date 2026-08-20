// Tischplan-Geometrie: Varianten, Sitzpositionen und Verteilung der Plätze.
import { v } from "./i18n";

// Zehn vordefinierte Tischvarianten (aus dem Legacy-Bundle).
export const TABLE_PRESETS = [
  { id: "E6", label: "Eckig · 6 Plätze (3+3)", en: "Rectangular · 6 seats (3+3)", shape: "rect", layout: { top: 3, bottom: 3, left: 0, right: 0 } },
  { id: "E8", label: "Eckig · 8 Plätze (4+4)", en: "Rectangular · 8 seats (4+4)", shape: "rect", layout: { top: 4, bottom: 4, left: 0, right: 0 } },
  { id: "E8S", label: "Eckig · 8 mit Stirnplätzen", en: "Rectangular · 8 with head seats", shape: "rect", layout: { top: 3, bottom: 3, left: 1, right: 1 } },
  { id: "E10", label: "Eckig · 10 Plätze (5+5)", en: "Rectangular · 10 seats (5+5)", shape: "rect", layout: { top: 5, bottom: 5, left: 0, right: 0 } },
  { id: "E10S", label: "Eckig · 10 mit Stirnplätzen", en: "Rectangular · 10 with head seats", shape: "rect", layout: { top: 4, bottom: 4, left: 1, right: 1 } },
  { id: "E12", label: "Lange Tafel · 12 Plätze", en: "Long table · 12 seats", shape: "rect", layout: { top: 6, bottom: 6, left: 0, right: 0 } },
  { id: "Q8", label: "Quadratisch · 8 Plätze", en: "Square · 8 seats", shape: "square", layout: { top: 2, bottom: 2, left: 2, right: 2 } },
  { id: "R6", label: "Rund · 6 Plätze", en: "Round · 6 seats", shape: "round", n: 6 },
  { id: "R8", label: "Rund · 8 Plätze", en: "Round · 8 seats", shape: "round", n: 8 },
  { id: "R10", label: "Rund · 10 Plätze", en: "Round · 10 seats", shape: "round", n: 10 },
];

// Sprachabhängige Anzeige eines Presets (gespeichert wird nur die id).
export function presetLabel(preset) {
  return preset ? v(preset.label, preset.en) : "";
}

// Feste Sitzpositionen für rechteckige/selbst angeordnete Tische (6+2 Stühle).
export const RECT_SEATS = (() => {
  const top = [...Array(6)].map((_t, n) => 150 + (260 * n) / 5);
  return [
    ...top.map((x) => ({ x, y: 76 })),
    ...top.map((x) => ({ x, y: 264 })),
    { x: 70, y: 170 },
    { x: 490, y: 170 },
  ];
})();

// Feste Sitzpositionen für runde Tische (12 Stühle im Kreis).
export const ROUND_SEATS = [...Array(12)].map((_e, t) => {
  const a = -Math.PI / 2 + (t * Math.PI) / 6;
  return { x: 280 + 145 * Math.cos(a), y: 170 + 145 * Math.sin(a) };
});

export function presetById(id) {
  return TABLE_PRESETS.find((p) => p.id === id);
}

// Variante (aus Preset) in die Tischform-Darstellung überführen.
export function presetVariant(preset) {
  const seats =
    preset.shape === "round"
      ? preset.n
      : preset.layout.top + preset.layout.bottom + preset.layout.left + preset.layout.right;
  return {
    variant: preset.id,
    shape: preset.shape,
    layout: preset.layout || null,
    n: preset.n || null,
    seats,
  };
}

// Standard-Layout für eine freie Platzzahl (eckig, 2–14 Plätze).
// Kap bei 14: auch Alt-Datenbestände mit mehr Plätzen bleiben auf 14 begrenzt.
export function standardLayout(seats) {
  const half = Math.floor(Math.min(seats, 14) / 2);
  return {
    variant: "standard",
    shape: "rect",
    layout: { top: half, bottom: half, left: 0, right: seats % 2 === 1 ? 1 : 0 },
    seats,
  };
}

// Kurzbeschreibung einer Tischform, z. B. "rund · 8 Plätze".
export function tischLabel(tisch) {
  const shape = tisch.custom ? tisch.custom.shape : tisch.shape;
  const shapeName =
    shape === "round"
      ? v("rund", "round")
      : shape === "square"
        ? v("quadratisch", "square")
        : v("eckig", "rectangular");
  return `${shapeName} · ${tisch.seats} ${v("Plätze", "seats")}${tisch.custom ? v(" · eigene Anordnung", " · custom layout") : ""}`;
}

// Sitzpositionen für eine Tischform (Preset, Standard oder eigene Anordnung).
export function seatPositions(tisch) {
  if (tisch.custom) {
    const fixed = tisch.custom.shape === "round" ? ROUND_SEATS : RECT_SEATS;
    return tisch.custom.slots.map((s) => fixed[s]).filter(Boolean);
  }
  if (tisch.shape === "round") {
    const n = tisch.n || tisch.seats;
    return [...Array(n)].map((_a, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      return { x: 280 + 145 * Math.cos(angle), y: 170 + 145 * Math.sin(angle) };
    });
  }
  const layout = tisch.layout || standardLayout(tisch.seats).layout;
  const row = (count, a, b) =>
    count <= 0
      ? []
      : count === 1
        ? [(a + b) / 2]
        : [...Array(count)].map((_s, i) => a + ((b - a) * i) / (count - 1));
  const seats = [];
  if (tisch.shape === "square") {
    row(layout.top, 220, 340).forEach((x) => seats.push({ x, y: 48 }));
    row(layout.bottom, 220, 340).forEach((x) => seats.push({ x, y: 292 }));
    row(layout.left, 120, 220).forEach((y) => seats.push({ x: 150, y }));
    row(layout.right, 120, 220).forEach((y) => seats.push({ x: 410, y }));
  } else {
    row(layout.top, 150, 410).forEach((x) => seats.push({ x, y: 76 }));
    row(layout.bottom, 150, 410).forEach((x) => seats.push({ x, y: 264 }));
    row(layout.left, 140, 200).forEach((y) => seats.push({ x: 70, y }));
    row(layout.right, 140, 200).forEach((y) => seats.push({ x: 490, y }));
  }
  return seats;
}

// Verteilt eine Platzzahl auf eine Grundform (eckig/quadratisch/rund).
export function distributeSeats(tisch, seats) {
  const shape = tisch && tisch.custom ? tisch.custom.shape : (tisch && tisch.shape) || "rect";
  const umgebung = (tisch && tisch.umgebung) || null;
  if (shape === "round") {
    return { variant: "round", shape: "round", n: seats, seats, umgebung };
  }
  if (shape === "square") {
    const base = Math.floor(seats / 4);
    const rest = seats % 4;
    return {
      variant: "square",
      shape: "square",
      layout: {
        top: base + (rest > 0 ? 1 : 0),
        bottom: base + (rest > 1 ? 1 : 0),
        left: base + (rest > 2 ? 1 : 0),
        right: base,
      },
      seats,
      umgebung,
    };
  }
  const side = seats % 2 === 1 ? 1 : 0;
  const pair = seats - side;
  return {
    variant: "rect",
    shape: "rect",
    layout: { top: Math.ceil(pair / 2), bottom: Math.floor(pair / 2), left: 0, right: side },
    seats,
    umgebung,
  };
}

// Mögliche Umgebungs-Labels rund um den Tischplan. Gespeichert wird der
// deutsche Wert (Datenbestand); die Anzeige übersetzt umgebungLabel().
export const UMGEBUNG = [
  "Küche",
  "Eingang",
  "Fenster",
  "Theke / Bar",
  "Terrasse",
  "Wand",
  "Kachelofen",
  "Garten",
];

const UMGEBUNG_EN = {
  Küche: "Kitchen",
  Eingang: "Entrance",
  Fenster: "Window",
  "Theke / Bar": "Counter / bar",
  Terrasse: "Terrace",
  Wand: "Wall",
  Kachelofen: "Tiled stove",
  Garten: "Garden",
};

export function umgebungLabel(value) {
  return value ? v(value, UMGEBUNG_EN[value] || value) : "";
}
