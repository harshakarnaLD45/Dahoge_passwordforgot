# Mischtisch Sachsen — Firebase Version

React-18-Anwendung für die zentrale Mischtisch-Reservierungsplattform. Alle gemeinsam genutzten Daten werden in Firebase gespeichert und stehen dadurch in jedem Browser und auf jedem Gerät über dasselbe Firebase-Projekt zur Verfügung.

## Firebase-Dienste

- **Cloud Firestore:** Betriebe, Registrierungen, Gastkonten, Reservierungen, Belegung, Benachrichtigungen und E-Mail-Vorlagen.
- **Firebase Authentication:** Gastgeber-Anmeldung mit E-Mail und Passwort sowie anonyme Gast-Sitzungen.
- **Cloud Storage:** Fotos der Betriebe.
- **Lokale Browser-Einstellungen:** ausschließlich Sprache, Logo-Auswahl, Testleitfaden-Haken und lokale „gesehen“-Zeitpunkte. Es werden keine Geschäftsdaten lokal gespeichert.

SQLite, `sql.js`, WASM-Dateien und die IndexedDB-Datenbank wurden vollständig entfernt.

## Einrichtung

1. In der Firebase Console ein Projekt und eine Web-App erstellen.
2. Unter **Authentication → Sign-in method** aktivieren:
   - Email/Password
   - Anonymous
3. Eine Cloud-Firestore-Datenbank und einen Cloud-Storage-Bucket erstellen.
4. `.env.example` nach `.env` kopieren und die Web-App-Konfiguration eintragen.
5. Die Sicherheitsregeln bereitstellen:

```bash
npx firebase-tools login
npx firebase-tools use <firebase-project-id>
npx firebase-tools deploy --only firestore:rules,firestore:indexes,storage
```

6. Abhängigkeiten installieren und die Anwendung starten:

```bash
npm install
npm start
```

Der E-Mail-Server bleibt separat:

```bash
cp server/.env.example server/.env
npm run server
```

## Umgebungsvariablen

```env
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
REACT_APP_FIREBASE_MEASUREMENT_ID=
```

Die Firebase-Web-Konfiguration verbindet die Anwendung mit dem Projekt. Der Zugriff auf Daten wird durch `firestore.rules` und `storage.rules` geschützt.

## Datenstruktur

| Collection | Inhalt |
| --- | --- |
| `venues` | Betriebe und Mischtisch-Konfiguration |
| `hostProfiles` | Zuordnung eines Firebase-Auth-Nutzers zu seinem Betrieb |
| `guests` | Gastprofil der anonymen Firebase-Sitzung |
| `reservations` | Zentrale Reservierungsdaten für Gast- und Gastgeberansicht |
| `occupancy` | Belegte Plätze je Betrieb, Datum und Zeitfenster |
| `notifications` | Wartende Gastgeber-Benachrichtigungen |
| `registrations` | Registrierungsdatensätze |
| `venuePhotos` | Foto-Metadaten und Cloud-Storage-URLs |
| `emailTemplates` | Optional angepasste E-Mail-Vorlagen |
| `settings` | Globaler Registrierungszähler |

### Speicherung nach der Gastgeber-Registrierung

Nach erfolgreicher Email/Password-Registrierung speichert die Anwendung die vollständigen Formulardaten in einer einzigen Firestore-Transaktion:

- `hostProfiles/{firebaseUid}` — Login-Zuordnung, Betrieb und Prüfstatus
- `venues/{betriebId}` — Betrieb, Adresse, Region, Typ und Beschreibung
- `registrations/{firebaseUid}` — unveränderter Registrierungsdatensatz, Einwilligungen, Registrierungsnummer und Status `pending`

Die E-Mail wird erst nach einer erfolgreichen Firestore-Transaktion versendet. Das Passwort wird ausschließlich von Firebase Authentication verwaltet und niemals in Firestore gespeichert.

## Verfügbare Skripte

| Befehl | Beschreibung |
| --- | --- |
| `npm start` | React-Entwicklungsserver auf `http://localhost:3000` |
| `npm run build` | Produktions-Build nach `build/` |
| `npm test` | Tests im Watch-Modus |
| `npm run server` | SMTP-/NodeMailer-Server auf Port 5000 |
| `node scripts/serve-build.mjs` | Lokale Vorschau des Produktions-Builds |

## Sicherheitsmodell

- Betriebe können öffentlich gelesen werden.
- Gastgeber-Zugriffe erfordern Firebase Email/Password-Authentifizierung; anonyme Gäste können keine Gastgeber-Datensätze anlegen.
- Gastgeber können nur ihren eigenen Betrieb und dessen Reservierungen verwalten.
- Gäste erhalten eine anonyme Firebase-ID und können nur ihre eigenen Kontodaten und Reservierungen verwalten.
- Verbandsweite Listen und administrative Änderungen benötigen den Custom Claim `admin: true`.
- Fotos sind öffentlich lesbar, können aber nur vom zugehörigen Gastgeber hochgeladen oder gelöscht werden.

## Hinweise zur Umstellung

Bestehende SQLite-/IndexedDB-Daten aus älteren Browserinstallationen werden nicht automatisch in Firebase übertragen. Da die alte Datenbank nur lokal im jeweiligen Browser lag, muss sie vor dem Update separat exportiert und über ein individuelles Migrationsskript importiert werden, falls diese Altdaten benötigt werden.
