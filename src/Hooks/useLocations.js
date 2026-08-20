import { useEffect, useState } from "react";
import { getVenues } from "../Services/storage";

// Lädt alle Betriebe aus Cloud Firestore. Änderungen und neue Registrierungen
// sind dadurch in allen Browsern mit demselben Firebase-Projekt sichtbar.
// reload() lädt neu — z. B. nach dem Speichern im Gastgeber-Bereich.
export function useLocations() {
  const [locations, setLocations] = useState([]);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const venues = await getVenues();
        if (alive) setLocations(venues);
      } catch (err) {
        console.error("Betriebe laden fehlgeschlagen", err);
      }
    })();
    return () => {
      alive = false;
    };
  }, [version]);

  return [locations, () => setVersion((n) => n + 1)];
}
