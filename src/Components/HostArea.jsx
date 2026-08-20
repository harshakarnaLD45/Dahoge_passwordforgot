// Gastgeber-Bereich eines Betriebs: Reservierungen, Benachrichtigungen, Einstellungen (Im im Bundle).
import { useState, useEffect } from "react";
import { v, dayShortName } from "../Utils/i18n";
import { buildSlots } from "../Utils/format";
import { isEmail } from "../Utils/validate";
import { mailtoHref } from "../Utils/mail";
import { tischLabel, distributeSeats } from "../Utils/table";
import { shortDate } from "../Utils/dates";
import {
  listReservations,
  removeReservation,
  listNotifications,
  upsertVenue,
  setSetting,
  removeNotification,
  getOccupancy,
  setOccupancy,
  reauthenticateHost,
  updateHostPassword,
} from "../Services/storage";
import { DayChips } from "./DayChips";
import { SeatStepper } from "./SeatStepper";
import { SlotEditor } from "./SlotEditor";
import { Sondertermine } from "./Sondertermine";
import { AktionenEditor } from "./AktionenEditor";
import { PhotoUploader } from "./PhotoUploader";
import { sendEmail } from "../Services/mailer";
import { REGIONS, VENUE_TYPES } from "../Services/data";
import { accessCode } from "../Services/auth";

export function HostArea({
  loc,
  session,
  onLogout,
  reload,
  showToast,
  onTischform,
  onSeen,
}) {
  const [tab, setTab] = useState("res");
  // Registrierte Betriebe haben noch keine Tisch-Konfiguration — der Gastgeber
  // legt Plätze, Tage und Uhrzeiten hier fest und speichert sie.
  const [seats, setSeats] = useState(
    (loc.tisch && loc.tisch.seats) || loc.seats || 8,
  );
  const [days, setDays] = useState(loc.days || []);
  const [slots, setSlots] = useState(loc.slots || []);
  // Per-Wochentag konfigurierbare Slots (Schlüssel = Wochentag-Nummer 0–6).
  const [slotsByDay, setSlotsByDay] = useState(() => {
    const existing = loc.slotsByDay || {};
    // Migration alter venues: aus days+slots die per-Tag-Map aufbauen.
    if (
      Object.keys(existing).length === 0 &&
      (loc.slots || []).length > 0 &&
      (loc.days || []).length > 0
    ) {
      const map = {};
      loc.days.forEach((d) => {
        map[d] = [...loc.slots];
      });
      return map;
    }
    return existing;
  });
  const [fensterVon, setFensterVon] = useState(
    (loc.fenster && loc.fenster.von) || (loc.slots && loc.slots[0]) || "18:00",
  );
  const [fensterBis, setFensterBis] = useState(
    (loc.fenster && loc.fenster.bis) ||
      (loc.slots && loc.slots[loc.slots.length - 1]) ||
      "20:00",
  );
  const [takt, setTakt] = useState((loc.fenster && loc.fenster.takt) || 60);
  const [mehrfach, setMehrfach] = useState(!!loc.mehrfach);
  const [masse, setMasse] = useState(loc.masse || "");
  const [sonder, setSonder] = useState(loc.sonder || {});

  useEffect(() => {
    setSonder(loc.sonder || {});
  }, [loc.sonder]);

  useEffect(() => {
    console.log("4️⃣ HOST STATE =", sonder);
  }, [sonder]);

  const [aktionen, setAktionen] = useState(loc.aktionen || []);
  const [angebot, setAngebot] = useState(loc.angebot || "");
  const [webhook, setWebhook] = useState(loc.webhook || "");
  const [pending, setPending] = useState([]);
  // Titelbild liegt als Base64 direkt im venue-Dokument (titelbild/klein,
  // coverImage/gross) — kein separater Foto-Abruf mehr nötig.
  const [fotos, setFotos] = useState(() =>
    loc.titelbild
      ? [{ id: "cover", gross: loc.coverImage || "", klein: loc.titelbild, titel: "" }]
      : [],
  );
  const [email, setEmail] = useState(loc.email || "");
  const [desc, setDesc] = useState(loc.desc || "");
  // Stammdaten aus der Registrierung — im Reiter „Profil“ bearbeitbar.
  const [name, setName] = useState(loc.name || "");
  const [strasse, setStrasse] = useState(loc.strasse || "");
  const [plz, setPlz] = useState(loc.plz || "");
  const [city, setCity] = useState(loc.city || "");
  const [region, setRegion] = useState(loc.region || "");
  const [type, setType] = useState(loc.type || "");
  const [telefon, setTelefon] = useState(loc.telefon || "");
  // Inhaber aus dem Gastgeber-Profil (hostProfiles) vorbelegen — das Profil
  // ist die autoritative Quelle für den angemeldeten Nutzer.
  const [inhaber, setInhaber] = useState(session?.inhaber || loc.inhaber || "");
  // Passwort-Änderung (Reiter „Profil“).
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwTried, setPwTried] = useState(false);
  const [pwCurrentWrong, setPwCurrentWrong] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resList, setResList] = useState(null);
  // Session-only flag: shown briefly after a successful profile save.
  const [justSaved, setJustSaved] = useState(
    () => !sessionStorage.getItem(`ha-saved-${loc.id}`),
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await listReservations(loc.id);
        if (alive) setResList(res || []);
        const pend = await listNotifications(loc.id);
        if (alive) setPending(pend || []);
      } catch (err) {
        // Reservierungen/Benachrichtigungen erfordern die Gastgeber-Anmeldung:
        // Bei Abmeldung während des Ladens darf kein unbehandelter Fehler
        // auftauchen — die Listen bleiben einfach leer.
        console.warn(
          "Gastgeber-Daten konnten nicht geladen werden",
          err?.code || err,
        );
        if (alive) setResList([]);
      }
      try {
        await setSetting(`seen:${loc.id}`, new Date().toISOString());
        if (onSeen) onSeen();
      } catch {}
    })();
    return () => {
      alive = false;
    };
    // onSeen bewusst weggelassen: Lade-Effekt läuft genau einmal pro Betrieb;
    // die Prop-Identität wechselt bei jedem Render der Elternkomponente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc.id]);

  const profileValid = [name, strasse, plz, city, inhaber].every((f) =>
    f.trim(),
  );

  // Pflichtfeld- und Übereinstimmungsprüfung für die Passwort-Änderung.
  const pwErrs = {
    current: !currentPw
      ? v(
          "Bitte aktuelles Passwort eingeben.",
          "Please enter your current password.",
        )
      : pwCurrentWrong
        ? v(
            "Das aktuelle Passwort ist falsch.",
            "The current password is incorrect.",
          )
        : null,
    neu: !newPw
      ? v("Bitte neues Passwort eingeben.", "Please enter a new password.")
      : newPw.length < 8
        ? v("Mindestens 8 Zeichen.", "At least 8 characters.")
        : null,
    confirm: !confirmPw
      ? v(
          "Bitte neues Passwort wiederholen.",
          "Please repeat the new password.",
        )
      : confirmPw !== newPw
        ? v(
            "Die Passwörter stimmen nicht überein.",
            "The passwords do not match.",
          )
        : null,
  };

  const save = async (requireConfig = true) => {
    if (!profileValid) {
      showToast(
        v(
          "Bitte Betriebsname, Straße, PLZ, Ort und Inhaber ausfüllen.",
          "Please fill in the venue name, street, postcode, town and owner.",
        ),
      );
      return;
    }
    if (!isEmail(email)) {
      showToast(
        v(
          "Bitte eine E-Mail für Reservierungsbestätigungen angeben.",
          "Please provide an email for reservation confirmations.",
        ),
      );
      return;
    }
    // Tisch-Konfiguration (Tage/Uhrzeiten) wird nur beim Speichern im
    // Reiter „Mein Mischtisch“ verlangt — Profil-Änderungen funktionieren
    // auch bei noch nicht konfigurierten Betrieben.
    if (requireConfig && days.length === 0) {
      showToast(
        v(
          "Bitte mindestens einen Mischtisch-Tag wählen.",
          "Please choose at least one Mischtisch day.",
        ),
      );
      return;
    }
    if (
      requireConfig &&
      slots.length === 0 &&
      Object.keys(slotsByDay).length === 0
    ) {
      showToast(
        v(
          "Bitte mindestens eine Uhrzeit festlegen.",
          "Please set at least one time.",
        ),
      );
      return;
    }
    // Jeder ausgewählte Tag braucht mindestens eine Uhrzeit (entweder global
    // oder per-Tag konfiguriert).
    if (requireConfig) {
      const missing = days.filter((d) => {
        const daySlots = slotsByDay[d] || slots;
        return !daySlots || daySlots.length === 0;
      });
      if (missing.length > 0) {
        showToast(
          v(
            `Bitte für alle ausgewählten Tage Uhrzeiten festlegen (fehlt: ${missing.map((d) => dayShortName[d]).join(", ")}).`,
            `Please set times for all selected days (missing: ${missing.map((d) => dayShortName[d]).join(", ")}).`,
          ),
        );
        return;
      }
    }
    setSaving(true);
    try {
      // Passwort-Änderung nur, wenn Felder ausgefüllt sind; das aktuelle
      // Passwort wird VOR dem Speichern verifiziert, damit bei einem Fehler
      // nichts geschrieben wird.
      const pwActive = Boolean(currentPw || newPw || confirmPw);
      if (pwActive) {
        setPwTried(true);
        setPwCurrentWrong(false);
        if (pwErrs.current || pwErrs.neu || pwErrs.confirm) {
          showToast(
            v(
              "Bitte die Passwort-Felder prüfen.",
              "Please check the password fields.",
            ),
          );
          return;
        }
      }
      if (pwActive) {
        try {
          await reauthenticateHost(currentPw);
        } catch (error) {
          const wrongPassword = [
            "auth/invalid-credential",
            "auth/invalid-login-credentials",
            "auth/wrong-password",
          ].includes(error?.code);
          if (wrongPassword) setPwCurrentWrong(true);
          showToast(
            wrongPassword
              ? v(
                  "Das aktuelle Passwort ist falsch.",
                  "The current password is incorrect.",
                )
              : v(
                  "Das Passwort konnte nicht geprüft werden.",
                  "The password could not be verified.",
                ),
          );
          return;
        }
      }

      // Titelbild als Base64 direkt im venue-Dokument speichern — kein
      // Cloud-Storage-Upload mehr.
      const overrides = {
        seats,
        // Tisch-Konfiguration aus dem Tischformular (Variante / eigene
        // Anordnung) unangetastet lassen, solange sich die Platzzahl nicht
        // ändert — distributeSeats würde custom.slots verwerfen. Nur bei
        // geänderter Platzzahl (oder ohne bestehende Form) neu verteilen.
        tisch:
          loc.tisch && Number(seats) === Number(loc.tisch.seats)
            ? loc.tisch
            : distributeSeats(loc.tisch, seats),
        titelbild: fotos[0] ? fotos[0].klein : "",
        coverImage: fotos[0] ? fotos[0].gross : "",
        days: [...days].sort((a, b) => a - b),
        slots: [...slots].sort(),
        // Per-Wochentag-Slots: nur explizit konfigurierte Tage speichern;
        // Tage ohne Eintrag bleiben nicht buchbar (leer = unavailable).
        slotsByDay: (() => {
          const map = { ...slotsByDay };
          // Aufgeräumte Tage aus der Map entfernen
          Object.keys(map).forEach((k) => {
            if (!days.includes(Number(k))) delete map[k];
          });
          return map;
        })(),
        fenster: { von: fensterVon, bis: fensterBis, takt },
        mehrfach,
        masse: masse.trim(),
        sonder,
        aktionen,
        angebot: angebot.trim(),
        webhook: webhook.trim(),
        email: email.trim(),
        desc: desc.trim(),
        name: name.trim(),
        strasse: strasse.trim(),
        plz: plz.trim(),
        city: city.trim(),
        region,
        type,
        inhaber: inhaber.trim(),
        telefon: telefon.trim(),
        provisional: false,
      };
      // upsertVenue ersetzt die ganze Zeile — loc ist der vollständige Betrieb.
      await upsertVenue({ ...loc, ...overrides });
      if (pwActive) {
        await updateHostPassword(newPw);
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
        setPwTried(false);
        setPwCurrentWrong(false);
      }
      reload();
      setJustSaved(true);
      showToast(
        v(
          "Mischtisch-Daten gespeichert — sofort für Gäste sichtbar",
          "Mischtisch data saved — visible to guests immediately",
        ),
      );
    } catch (err) {
      console.error(err);
      showToast(v("Speichern hat nicht geklappt.", "Saving failed."));
    } finally {
      setSaving(false);
    }
  };

  const cancel = async (r) => {
    try {
      const occ = { ...((await getOccupancy(loc.id, r.dateKey)) || {}) };
      (r.slots || [r.slot]).forEach((s) => {
        occ[s] = (occ[s] || []).filter((n) => !r.seats.includes(n));
      });
      await setOccupancy(loc.id, r.dateKey, occ);
      const list = (await listReservations(loc.id)).filter(
        (x) => x.id !== r.id,
      );
      await removeReservation(loc.id, r.id);
      setResList(list);
      showToast(
        v(
          "Storniert — der Gast würde per E-Mail informiert",
          "Cancelled — the guest would be informed by email",
        ),
      );
    } catch (err) {
      //console.error(err);
      showToast(v("Stornieren hat nicht geklappt.", "Cancelling failed."));
    }
  };

  const sorted = (resList || [])
    .slice()
    .sort((a, b) => (a.dateKey + a.slot).localeCompare(b.dateKey + b.slot));

  // Wartende Benachrichtigung versenden: API first, sonst mailto-Fallback.
  const sendNow = async (n) => {
    const an = n.an || email;
    try {
      const res = await sendEmail({
        to: an,
        subject: n.betreff,
        text: (n.lines || []).join("\n\n"),
      });
      if (res.success) {
        await removeNotification(loc.id, n.id);
        setPending((p) => p.filter((x) => x.id !== n.id));
        showToast(v("E-Mail versendet", "Email sent"));
        return;
      }
    } catch (err) {
      console.warn("E-Mail-Server nicht erreichbar — mailto-Fallback", err);
    }
    window.location.href = mailtoHref({ ...n, an });
  };

  return (
    <div
      className="mt-wrap"
      style={{ padding: "20px 20px 60px", maxWidth: 860 }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        {/* <span className="notice">
          {v("Angemeldet als", "Signed in as")} <b>{session?.email}</b>
        </span> */}
        <button className="btn btn-ghost btn-sm" onClick={onLogout}>
          {v("Abmelden", "Sign out")}
        </button>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          flexWrap: "wrap",
          margin: "12px 0 14px",
        }}
      >
        <div>
          <div className="eyebrow">
            {v("Gastgeber-Bereich", "Host area")} · {loc.city}
          </div>
          <h2
            className="f-display"
            style={{
              fontSize: "clamp(24px,4vw,34px)",
              fontWeight: 600,
              margin: "6px 0 2px",
              color: "var(--kobalt-dunkel)",
            }}
          >
            {loc.name}
          </h2>
          <div className="notice">
            {v("Benachrichtigungen gehen an:", "Notifications go to:")}{" "}
            <b>
              {email ||
                v("— keine E-Mail hinterlegt —", "— no email on file —")}
            </b>
          </div>
        </div>
        <div
          className="card"
          style={{ padding: "10px 16px", textAlign: "right" }}
        >
          <div className="label" style={{ marginBottom: 2 }}>
            {v("Registrierungs-Code", "Registration code")}
          </div>
          <div
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 18,
              letterSpacing: 1.5,
              fontWeight: 700,
              color: "var(--kobalt-dunkel)",
            }}
          >
            {loc.regCode || v("—", "—")}
          </div>
          {/* <div
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 15,
              letterSpacing: 1.2,
              fontWeight: 600,
              color: "var(--kobalt-dunkel)",
            }}
          >
            {accessCode(loc.id)}
          </div> */}
        </div>
      </div>
      {/* <div
        className="card"
        style={{
          marginBottom: 16,
          borderColor: "var(--honig)",
          background: "#FBF4E4",
          fontSize: 14,
        }}
      >
        <b>{v("Offizielle Freischaltung:", "Official activation:")}</b>{" "}
        {v(
          "unterschriebene Nutzungsvereinbarung mit Betreff „MISCHTISCH in SACHSEN“ an",
          "send the signed usage agreement with the subject “MISCHTISCH in SACHSEN” to",
        )}{" "}
        <a
          href="mailto:info@gastgeber-ag.bayern?subject=MISCHTISCH%20in%20SACHSEN"
          style={{ color: "var(--kobalt)", fontWeight: 600 }}
        >
          info@gastgeber-ag.bayern
        </a>{" "}
        {v(
          "senden — das Starterpaket kommt vom DEHOGA Sachsen.",
          "— the starter package comes from DEHOGA Sachsen.",
        )}
      </div> */}
      {/*
        One-time notification after a successful host-profile save.
        Dismissed by the host or hidden on next session (sessionStorage).
      */}
      
      <div className="tabbar">
        <button
          className={`tab ${tab === "res" ? "on" : ""}`}
          onClick={() => setTab("res")}
        >
          {v("Reservierungen", "Reservations")}
          {sorted.length > 0 && ` (${sorted.length})`}
        </button>
        <button
          className={`tab ${tab === "cfg" ? "on" : ""}`}
          onClick={() => setTab("cfg")}
        >
          {v("Mein Mischtisch", "My Mischtisch")}
        </button>
        <button
          className={`tab ${tab === "profil" ? "on" : ""}`}
          onClick={() => setTab("profil")}
        >
          {v("Profil", "Profile")}
        </button>
      </div>
      {tab === "res" && (
        <div className="tabpanel">
          {pending.length > 0 && (
            <div
              className="card"
              style={{
                marginBottom: 14,
                borderColor: "var(--honig)",
                background: "#FDF6E7",
              }}
            >
              <div
                className="f-display"
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "var(--kobalt-dunkel)",
                }}
              >
                {pending.length === 1
                  ? v("1 Benachrichtigung wartet", "1 notification waiting")
                  : v(
                      `${pending.length} Benachrichtigungen warten`,
                      `${pending.length} notifications waiting`,
                    )}
              </div>
              <div
                style={{ fontSize: 14, color: "#3A4258", margin: "6px 0 10px" }}
              >
                {v(
                  "Diese Reservierungen konnten noch nicht automatisch per E-Mail zugestellt werden. Mit einem Klick verschicken — oder unten eine Versand-Adresse hinterlegen, dann läuft es künftig von selbst.",
                  "These reservations could not yet be delivered automatically by email. Send them with one click — or add a dispatch address below and it will happen automatically from now on.",
                )}
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {pending.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      alignItems: "center",
                      flexWrap: "wrap",
                      fontSize: 14,
                    }}
                  >
                    <span>{n.betreff}</span>
                    <span style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => sendNow(n)}
                      >
                        {v("Jetzt senden", "Send now")}
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={async () => {
                          const rest = pending.filter((x) => x.id !== n.id);
                          setPending(rest);
                          await removeNotification(loc.id, n.id);
                        }}
                      >
                        {v("Erledigt", "Done")}
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {resList === null ? (
            <div className="notice">
              {v("Reservierungen werden geladen …", "Loading reservations …")}
            </div>
          ) : sorted.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "20px 10px",
                color: "#5B627A",
              }}
            >
              {v(
                "Noch keine Reservierungen über die Plattform.",
                "No reservations via the platform yet.",
              )}
              <br />
              <span className="notice">
                {v(
                  "Sobald ein Gast bucht, erscheint die Reservierung hier — zusätzlich zur E-Mail.",
                  "As soon as a guest books, the reservation appears here — in addition to the email.",
                )}
              </span>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {sorted.map((r) => (
                <div key={r.id} className="card" style={{ padding: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      flexWrap: "wrap",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>
                        {shortDate(r.dateKey)} ·{" "}
                        {(r.slots || [r.slot]).join(" & ")}
                        {v(" Uhr", "")} —{" "}
                        {r.persons === 1
                          ? v("1 Person", "1 person")
                          : v(`${r.persons} Personen`, `${r.persons} people`)}
                        <span style={{ fontWeight: 400, color: "#8A8FA3" }}>
                          {" "}
                          ({v("Stuhl", "chair")}{" "}
                          {r.seats.map((n) => n + 1).join(", ")})
                        </span>
                      </div>
                      <div style={{ fontSize: 14.5, marginTop: 4 }}>
                        {r.vorname} {r.nachname}
                      </div>
                      <div style={{ fontSize: 13.5, color: "#5B627A" }}>
                        <a
                          href={`mailto:${r.email}`}
                          style={{ color: "var(--kobalt)" }}
                        >
                          {r.email}
                        </a>{" "}
                        · {r.telefon}
                      </div>
                      <div style={{ fontSize: 13.5, color: "#5B627A" }}>
                        {r.strasse}, {r.plzort}
                      </div>
                      {r.aktion && (
                        <div
                          style={{
                            fontSize: 13.5,
                            color: "var(--eiche)",
                            marginTop: 4,
                          }}
                        >
                          ★ {v("Aktion:", "Promotion:")} {r.aktion}
                        </div>
                      )}
                      {r.note && (
                        <div
                          style={{
                            fontSize: 13.5,
                            color: "#3A4258",
                            marginTop: 4,
                          }}
                        >
                          {v("Nachricht:", "Message:")} „{r.note}“
                        </div>
                      )}
                    </div>
                    <button
                      className="btn btn-danger"
                      onClick={() => cancel(r)}
                    >
                      {v("Stornieren", "Cancel")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {tab === "cfg" && (
        <div className="tabpanel" style={{ display: "grid", gap: 18 }}>
          <div>
            <div className="label">
              {v(
                "Tischform (rund oder eckig) und Verteilung der Plätze",
                "Table shape (round or rectangular) and seat layout",
              )}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: 14.5, color: "#3A4258" }}>
                {loc.tisch ? (
                  <b>{tischLabel(loc.tisch)}</b>
                ) : (
                  v(
                    "Noch nicht festgelegt — Standardanordnung (eckig)",
                    "Not set yet — standard layout (rectangular)",
                  )
                )}
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={onTischform}
              >
                {v("Tischform festlegen / ändern", "Set / change table shape")}
              </button>
            </div>
          </div>
          <div>
            <div className="label">
              {v(
                "Tischgröße: wie viele Personen passen an Ihren Mischtisch?",
                "Table size: how many people fit at your Mischtisch?",
              )}
            </div>
            <SeatStepper seats={seats} onChange={setSeats} />
            {loc.tisch && seats !== loc.tisch.seats && (
              <div className="notice" style={{ marginTop: 6 }}>
                {v(
                  `Die Plätze werden auf der gewählten Tischform (${tischLabel(loc.tisch).split(" · ")[0]}) gleichmäßig neu verteilt.`,
                  `The seats will be redistributed evenly across the chosen table shape (${tischLabel(loc.tisch).split(" · ")[0]}).`,
                )}
              </div>
            )}
          </div>
          <div>
            <div className="label">
              {v(
                "Titelbild Ihres Betriebs (freiwillig)",
                "Cover image of your venue (optional)",
              )}
            </div>
            <div className="notice" style={{ marginBottom: 10 }}>
              {v(
                "Gäste sehen das Bild beim Reservieren und in der Übersicht.",
                "Guests see the cover image while booking and in the overview.",
              )}
            </div>
            <PhotoUploader
              fotos={fotos}
              onChange={setFotos}
              showToast={showToast}
            />
          </div>
          <div>
            <label className="label" htmlFor="hg-masse">
              {v(
                "Maße des Tischs (optional, für unsere Unterlagen)",
                "Table dimensions (optional, for our records)",
              )}
            </label>
            <input
              id="hg-masse"
              className="input"
              value={masse}
              onChange={(e) => setMasse(e.target.value)}
              placeholder={v(
                "z. B. 220 × 90 cm oder Ø 140 cm",
                "e.g. 220 × 90 cm or Ø 140 cm",
              )}
            />
          </div>
          <div>
            <div className="label">
              {v(
                "An welchen Tagen wird der Mischtisch gedeckt?",
                "On which days is the Mischtisch set?",
              )}
            </div>
            <DayChips days={days} onChange={setDays} />
          </div>
          <div>
            <div className="label">
              {v(
                "Von wann bis wann kann reserviert werden?",
                "Between which times can guests book?",
              )}
            </div>
            {/* <div className="form-grid">
              <div>
                <label className="label" htmlFor="hg-von" style={{ fontWeight: 500 }}>
                  {v("Erste Reservierung", "First reservation")}
                </label>
                <input
                  id="hg-von"
                  type="time"
                  className="input"
                  value={fensterVon}
                  onChange={(e) => setFensterVon(e.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="hg-bis" style={{ fontWeight: 500 }}>
                  {v("Letzte Reservierung", "Last reservation")}
                </label>
                <input
                  id="hg-bis"
                  type="time"
                  className="input"
                  value={fensterBis}
                  onChange={(e) => setFensterBis(e.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="hg-takt" style={{ fontWeight: 500 }}>
                  {v("Takt der Zeitfenster", "Time-slot interval")}
                </label>
                <select
                  id="hg-takt"
                  className="input"
                  value={takt}
                  onChange={(e) => setTakt(Number(e.target.value))}
                >
                  <option value={30}>{v("alle 30 Minuten", "every 30 minutes")}</option>
                  <option value={60}>{v("jede Stunde", "every hour")}</option>
                  <option value={90}>{v("alle 90 Minuten", "every 90 minutes")}</option>
                  <option value={120}>{v("alle 2 Stunden", "every 2 hours")}</option>
                </select>
              </div>
            </div> */}
            {/* <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                marginTop: 10,
                flexWrap: "wrap",
              }}
            >
              <span className="notice">
                {v("Ergibt", "Yields")}{" "}
                {buildSlots(fensterVon, fensterBis, takt).length > 0
                  ? buildSlots(fensterVon, fensterBis, takt).join(", ") + v(" Uhr", "")
                  : v("— bitte Zeitraum prüfen", "— please check the time range")}
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setSlots(buildSlots(fensterVon, fensterBis, takt))}
              >
                {v("Zeitfenster übernehmen", "Apply time slots")}
              </button>
            </div> */}
          </div>
          <div>
            <div className="label">
              {v(
                "Buchbare Uhrzeiten pro Wochentag",
                "Bookable times per weekday",
              )}
            </div>
            {days.length === 0 ? (
              <span className="notice">
                {v(
                  "Bitte zuerst Mischtisch-Tage wählen.",
                  "Please select Mischtisch days first.",
                )}
              </span>
            ) : (
              <div style={{ display: "grid", gap: 16 }}>
                {days.map((day) => (
                  <div key={day} className="card" style={{ padding: 14 }}>
                    <div className="label" style={{ marginBottom: 8 }}>
                      {dayShortName[day]}
                    </div>
                    <SlotEditor
                      slots={slotsByDay[day] || slots || []}
                      onChange={(newSlots) => {
                        setSlotsByDay((prev) => ({ ...prev, [day]: newSlots }));
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                cursor: "pointer",
                fontSize: 14.5,
              }}
            >
              <input
                type="checkbox"
                checked={mehrfach}
                onChange={(e) => setMehrfach(e.target.checked)}
                style={{ marginTop: 4 }}
              />
              <span>
                <b>
                  {v(
                    "Mehrfachreservierungen zulassen",
                    "Allow multiple reservations",
                  )}
                </b>
                <br />
                <span style={{ color: "#5B627A", fontSize: 14 }}>
                  {v(
                    "Gäste dürfen mehrere Zeitfenster in einem Vorgang buchen — Ihr Tisch kann pro Tag mehrfach belegt werden.",
                    "Guests may book several time slots in one go — your table can be booked multiple times per day.",
                  )}
                </span>
              </span>
            </label>
          </div>
          <div>
            <div className="label">
              {v(
                "Sondertermine: Schließtage und Sonderöffnungen",
                "Special dates: closure days and special openings",
              )}
            </div>
            <Sondertermine
              sonder={sonder}
              onChange={(date, entry) => {
                // console.log(" HOST RECEIVED DATE =", date);
                //console.log(" HOST RECEIVED ENTRY =", entry);
                //console.log("HOST RECEIVED IMAGE =", entry?.bild);

                setSonder((prev) => {
                  const next = { ...prev };

                  if (entry === null) {
                    delete next[date];
                  } else {
                    next[date] = entry;
                  }

                  // console.log("🟢 HOST NEXT SONDER =", next);

                  return next;
                });
              }}
              standardSlots={slots}
              showToast={showToast}
            />
          </div>
          <div>
            <label className="label" htmlFor="hg-angebot">
              {v(
                "Dauerhaftes Spezialangebot am Mischtisch (optional)",
                "Permanent special offer at the Mischtisch (optional)",
              )}
            </label>
            <input
              id="hg-angebot"
              className="input"
              value={angebot}
              onChange={(e) => setAngebot(e.target.value)}
              placeholder={v(
                "z. B. Mischtisch-Menü 19,90 € inkl. Getränk",
                "e.g. Mischtisch menu €19.90 incl. drink",
              )}
            />
          </div>
          <div>
            <div className="label">
              {v(
                "Aktionswochen & Zusatz-Events",
                "Promotion weeks & extra events",
              )}
            </div>
            <div className="notice" style={{ marginBottom: 10 }}>
              {v(
                "Themenwochen wie „Lausitzer Fischwochen“, Wildwochen oder Spargelzeit: Zeitraum eintragen, optional eigene Zeiten und ein Spezialangebot. Gäste sehen die Aktion beim Reservieren.",
                "Theme weeks such as “Lusatian fish weeks”, game weeks or asparagus season: enter the period, optionally custom times and a special offer. Guests see the promotion while booking.",
              )}
            </div>
            <AktionenEditor
              aktionen={aktionen}
              onChange={setAktionen}
              showToast={showToast}
            />
          </div>
          {/* <div>
            <div className="label">
              {v("Automatische Benachrichtigung bei jeder neuen Reservierung", "Automatic notification for every new reservation")}
            </div>
            <input
              className="input"
              value={webhook}
              onChange={(e) => setWebhook(e.target.value)}
              placeholder={v("https://… Versand-Adresse Ihres Mail-Dienstes", "https://… dispatch address of your mail service")}
              aria-label={v("Versand-Adresse für automatische Benachrichtigungen", "Dispatch address for automatic notifications")}
            />
            <div className="notice" style={{ marginTop: 6 }}>
              {v(
                "Ist hier eine Versand-Adresse hinterlegt (z. B. aus Zapier, Make oder dem späteren Plattform-Server), geht bei jeder Reservierung sofort automatisch eine E-Mail an Ihr Haus — ohne Zutun des Gastes. Ohne Eintrag sammeln sich die Benachrichtigungen oben im Reiter „Reservierungen“ und können dort mit einem Klick verschickt werden. Da dabei Gästedaten an den Versanddienst übermittelt werden, ist mit dessen Anbieter ein Auftragsverarbeitungsvertrag nötig — möglichst ein Anbieter mit Serverstandort in der EU.",
                "If a dispatch address is stored here (e.g. from Zapier, Make or the future platform server), every reservation automatically triggers an email to your venue — without any action by the guest. Without one, notifications collect at the top of the “Reservations” tab and can be sent with one click. Since guest data is passed to the dispatch service, a data processing agreement with its provider is required — preferably one with servers in the EU.",
              )}
            </div>
          </div> */}
          <div className="form-grid">
            <div>
              <label className="label" htmlFor="hg-em">
                {v(
                  "E-Mail für Reservierungsbestätigungen *",
                  "Email for reservation confirmations *",
                )}
              </label>
              <input
                id="hg-em"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="reservierung@ihr-betrieb.example"
              />
            </div>
            <div>
              <label className="label" htmlFor="hg-desc">
                {v(
                  "Kurzbeschreibung (für Gäste sichtbar)",
                  "Short description (visible to guests)",
                )}
              </label>
              <input
                id="hg-desc"
                className="input"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder={v(
                  "Was macht Ihren Mischtisch besonders?",
                  "What makes your Mischtisch special?",
                )}
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <span className="notice">
              {v(
                "Änderungen gelten sofort für neue Reservierungen.",
                "Changes apply immediately to new reservations.",
              )}
            </span>
            <button
              className="btn btn-primary"
              disabled={saving}
              onClick={save}
            >
              {saving
                ? v("Wird gespeichert …", "Saving …")
                : v("Änderungen speichern", "Save changes")}
            </button>
          </div>
        </div>
      )}
      {tab === "profil" && (
        <div className="tabpanel" style={{ display: "grid", gap: 18 }}>
          <div className="form-grid">
            <div>
              <label className="label" htmlFor="hg-name">
                {v("Betriebsname *", "Venue name *")}
              </label>
              <input
                id="hg-name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="hg-inh">
                {v("Inhaber *", "Owner *")}
              </label>
              <input
                id="hg-inh"
                className="input"
                value={inhaber}
                onChange={(e) => setInhaber(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="hg-str">
                {v("Straße *", "Street *")}
              </label>
              <input
                id="hg-str"
                className="input"
                value={strasse}
                onChange={(e) => setStrasse(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="hg-plz">
                {v("PLZ *", "Postcode *")}
              </label>
              <input
                id="hg-plz"
                className="input"
                value={plz}
                onChange={(e) => setPlz(e.target.value)}
                placeholder="01067"
              />
            </div>
            <div>
              <label className="label" htmlFor="hg-city">
                {v("Ort *", "Town *")}
              </label>
              <input
                id="hg-city"
                className="input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="hg-region">
                {v("Region", "Region")}
              </label>
              <select
                id="hg-region"
                className="input"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="hg-type">
                {v("Art des Betriebs", "Type of venue")}
              </label>
              <select
                id="hg-type"
                className="input"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {VENUE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="hg-tel">
                {v("Telefon", "Phone")}
              </label>
              <input
                id="hg-tel"
                type="tel"
                className="input"
                value={telefon}
                onChange={(e) => setTelefon(e.target.value)}
                placeholder={v("+49 351 1234567", "+49 351 1234567")}
              />
            </div>
          </div>
          <div
            style={{
              borderTop: "1px solid var(--linie)",
              paddingTop: 18,
            }}
          >
            <div className="form-grid">
              <div>
                <label
                  className="label"
                  htmlFor="hg-pw-alt"
                  style={{ fontWeight: 500 }}
                >
                  {v("Aktuelles Passwort", "Current password")}
                </label>
                <input
                  id="hg-pw-alt"
                  type="password"
                  className={`input${pwTried && pwErrs.current ? " field-err" : ""}`}
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  autoComplete="current-password"
                />
                {pwTried && pwErrs.current && (
                  <div style={{ color: "#B4443C", fontSize: 13, marginTop: 4 }}>
                    {pwErrs.current}
                  </div>
                )}
              </div>
              <div>
                <label
                  className="label"
                  htmlFor="hg-pw-neu"
                  style={{ fontWeight: 500 }}
                >
                  {v("Neues Passwort", "New password")}
                </label>
                <input
                  id="hg-pw-neu"
                  type="password"
                  className={`input${pwTried && pwErrs.neu ? " field-err" : ""}`}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  autoComplete="new-password"
                />
                {pwTried && pwErrs.neu && (
                  <div style={{ color: "#B4443C", fontSize: 13, marginTop: 4 }}>
                    {pwErrs.neu}
                  </div>
                )}
              </div>
              <div>
                <label
                  className="label"
                  htmlFor="hg-pw-wdh"
                  style={{ fontWeight: 500 }}
                >
                  {v("Passwort wiederholen", "Confirm password")}
                </label>
                <input
                  id="hg-pw-wdh"
                  type="password"
                  className={`input${pwTried && pwErrs.confirm ? " field-err" : ""}`}
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  autoComplete="new-password"
                />
                {pwTried && pwErrs.confirm && (
                  <div style={{ color: "#B4443C", fontSize: 13, marginTop: 4 }}>
                    {pwErrs.confirm}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <span className="notice">
              {v(
                "Angaben aus der Registrierung — erscheinen auf der Gästeseite.",
                "Details from your registration — shown on the guest page.",
              )}
            </span>
            <button
              className="btn btn-primary"
              disabled={saving}
              onClick={() => save(false)}
            >
              {saving
                ? v("Wird gespeichert …", "Saving …")
                : v("Profil speichern", "Save profile")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
