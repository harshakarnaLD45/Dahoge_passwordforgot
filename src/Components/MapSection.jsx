import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

// ponytail: simple in-memory cache so the same address is only geocoded once
// per page session (Photon is a free public service — don't hammer it).
// Cache lives at module scope, keyed by the normalized address string.
const geocodeCache = new Map();

async function getCoordinates(loc) {
  const address = [
    loc.strasse,
    loc.plz,
    loc.city,
    loc.region,
    "Germany",
  ]
    .filter(Boolean)
    .join(", ");

  if (!address || address === "Germany") return null;

  const cacheKey = address.toLowerCase();
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  // Photon (komoot) instead of Nominatim: the public Nominatim API rejects
  // browser requests (no Access-Control-Allow-Origin header). Photon is
  // free, keyless, and CORS-enabled. Try the full address first, then the
  // city alone so venues with placeholder/test street data can still plot.
  const queries = [address, loc.city].filter(Boolean);

  let coords = null;
  for (const query of queries) {
    try {
      const response = await fetch(
        `https://photon.komoot.io/api/?${new URLSearchParams({
          q: query,
          limit: "1",
        })}`,
      );

      if (!response.ok) continue;

      const data = await response.json();
      const feature = data.features?.[0];
      if (!feature) continue;

      // Photon returns coordinates as [lng, lat] (GeoJSON order).
      const [lng, lat] = feature.geometry.coordinates;
      coords = { lat, lng };
      break;
    } catch {
      // try the next candidate; nothing found → coords stays null
    }
  }

  geocodeCache.set(cacheKey, coords);
  return coords;
}

function FitMapToLocations({ locations }) {
  const map = useMap();

  useEffect(() => {
    if (!locations.length) return;

    const bounds = locations.map((loc) => [
      loc.coords.lat,
      loc.coords.lng,
    ]);

    if (bounds.length === 1) {
      map.setView(bounds[0], 14);
    } else {
      map.fitBounds(bounds, {
        padding: [50, 50],
      });
    }
  }, [locations, map]);

  return null;
}

function MapController({ selectedLocation, mapLocations }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedLocation) return;

    const selected = mapLocations.find(
      (loc) => loc.id === selectedLocation.id,
    );

    if (!selected?.coords) return;

    map.flyTo(
      [
        selected.coords.lat,
        selected.coords.lng,
      ],
      15,
      {
        duration: 1,
      },
    );
  }, [selectedLocation, mapLocations, map]);

  return null;
}

export function MapSection({
  locations,
  selectedLocation,
  onSelect,
}) {
  const [mapLocations, setMapLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadLocations() {
      setLoading(true);

      const results = await Promise.all(
        locations.map(async (loc) => {
          try {
            const coords = await getCoordinates(loc);

            if (!coords) {
              console.warn(
                "No coordinates found for:",
                loc.name,
              );

              return null;
            }

            return {
              ...loc,
              coords,
            };
          } catch (error) {
            console.error(
              "Could not find location:",
              loc.name,
              error,
            );

            return null;
          }
        }),
      );

      if (active) {
        setMapLocations(results.filter(Boolean));
        setLoading(false);
      }
    }

    loadLocations();

    return () => {
      active = false;
    };
  }, [locations]);

  return (
    <div className="map-wrapper">
      {loading && (
        <div className="map-loading">
          Loading locations...
        </div>
      )}

      <MapContainer
        center={[51.0504, 13.7373]}
        zoom={7}
        scrollWheelZoom={true}
        className="mischtisch-map"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitMapToLocations locations={mapLocations} />

        <MapController
          selectedLocation={selectedLocation}
          mapLocations={mapLocations}
        />

        {mapLocations.map((loc) => (
          <Marker
            key={loc.id}
            position={[
              loc.coords.lat,
              loc.coords.lng,
            ]}
            icon={markerIcon}
            eventHandlers={{
              click: () => onSelect?.(loc),
            }}
          >
            <Tooltip direction="top" offset={[0, -34]}>
              <strong>{loc.name}</strong>
              {loc.city && (
                <>
                  {" "}
                  · {loc.city}
                </>
              )}
            </Tooltip>
            <Popup>
              <div style={{ minWidth: 200 }}>
                <strong>{loc.name}</strong>
                {loc.type && (
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      color: "#8A8FA3",
                    }}
                  >
                    {loc.type}
                  </div>
                )}
                <br />
                {loc.strasse && (
                  <>
                    {loc.strasse}
                    <br />
                  </>
                )}
                {[loc.plz, loc.city].filter(Boolean).join(" ")}
                {loc.region && loc.region !== loc.city && (
                  <>
                    {" "}
                    · {loc.region}
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}