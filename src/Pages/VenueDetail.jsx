// Betriebs-Detailseite: Datum/Uhrzeit, Tischplan, Kontaktformular, Bestätigung (Am im Bundle).
import { useMemo, useState, useEffect } from "react";
import { v, dayShortName } from "../Utils/i18n";
import { dateKey, longDate, daysList } from "../Utils/dates";
import { isEmail, isPhone } from "../Utils/validate";
import { mailtoHref } from "../Utils/mail";
import { downloadIcs } from "../Utils/ics";
import {
  activeAktion,
  activeAktionen,
  nextAktion,
  aktionRange,
  dayStatus,
} from "../Utils/aktion";
import {
  getAccount,
  setAccount,
  getOccupancy,
  setOccupancy as saveOccupancy,
  addReservation,
  withTransaction,
} from "../Services/storage";
import { pushNotification } from "../Services/notify";
import { sendEmail } from "../Services/mailer";
import { buildBookingMails } from "../Services/email";
import { emailJsConfigured, sendEmailJs } from "../Services/emailjs";
import { TableSvg, Legend } from "../Components/TableSvg";
import { Beleg, printBeleg } from "../Components/Beleg";
import { EmailCard } from "../Components/EmailCard";

export function VenueDetail({
  loc,
  profile,
  onBooked,
  onBack,
  showToast,
  onRecht,
}) {
  const clearBookingData = () => {
    setForm(createEmptyForm());
    setSelected([]);
    setTried(false);
    setBusy(false);
  };
  // Alle Tage des aktuellen Monats anzeigen (vom 1. bis zum Monatsletzten).
  const days = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const total = new Date(year, month + 1, 0).getDate();
    return Array.from(
      { length: total },
      (_, i) => new Date(year, month, i + 1),
    );
  }, []);
  // Vergangene Tage (vor heute) sind nicht buchbar; YYYY-MM-DD lässt sich
  // lexikografisch vergleichen.
  const todayKey = dateKey(new Date());
  const isPast = (dk) => dk < todayKey;
  const initial =
    days.find(
      (d) =>
        !isPast(dateKey(d)) &&
        dayStatus(loc, dateKey(d), d.getDay()).status === "offen",
    ) ||
    days.find((d) => !isPast(dateKey(d))) ||
    days[0];
  const [date, setDate] = useState(dateKey(initial));
  const [slots, setSlots] = useState(() => {
    const st = dayStatus(loc, dateKey(initial), initial.getDay());
    return st.slots.length ? [st.slots[0]] : [];
  });
  const [occupancy, setOccupancy] = useState({});
  const [selected, setSelected] = useState([]);
  const createEmptyForm = () => ({
    vorname: "",
    nachname: "",
    email: "",
    telefon: "",
    strasse: "",
    plzort: "",
    note: "",
    einwilligung: false,
  });

  const [form, setForm] = useState(createEmptyForm);

  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [booked, setBooked] = useState(null);
  // Titelbild kommt als Base64 direkt aus dem venue-Dokument.
  const coverImage = loc.coverImage || loc.titelbild || "";

  const field = (key) => (ev) =>
    setForm((f) => ({ ...f, [key]: ev.target.value }));
  const dowOf = (key) => {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d).getDay();
  };
  const weekday = dowOf(date);
  const day = dayStatus(loc, date, weekday);
  const sonderEntry = (loc.sonder || {})[date] || null;
  
  const daySlots = day.slots;
  const isOpen = day.status === "offen";
  const isFull = day.status === "voll";

  useEffect(() => {
    let alive = true;
    setSelected([]);
    setOccupancy({});
    const st = dayStatus(loc, date, dowOf(date));
    setSlots(st.slots.length ? [st.slots[0]] : []);
    (async () => {
      const occ = await getOccupancy(loc.id, date);
      if (alive && occ) setOccupancy(occ);
    })();
    return () => {
      alive = false;
    };
    // Zurücksetzen ist an Betrieb + Datum geknüpft; `loc` selbst ändert seine
    // Identität bei jedem Reload und darf den Effekt nicht erneut auslösen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc.id, date]);

  const seatCount = (loc.tisch && loc.tisch.seats) || loc.seats;
  const occupiedSet = new Set();
  if (isOpen) {
    slots.forEach((s) => {
      (occupancy[s] || []).forEach((n) => occupiedSet.add(n));
    });
  }
  const taken = isFull
    ? [...Array(seatCount).keys()]
    : Array.from(occupiedSet).filter((n) => n < seatCount);
  const free = seatCount - taken.length;

  const toggleSeat = (n) =>
    setSelected((cur) =>
      cur.includes(n) ? cur.filter((m) => m !== n) : [...cur, n],
    );

  const toggleSlot = (s) => {
    if (loc.mehrfach) {
      setSlots((cur) =>
        cur.includes(s)
          ? cur.length > 1
            ? cur.filter((m) => m !== s)
            : cur
          : [...cur, s].sort(),
      );
    } else {
      setSlots([s]);
    }
    setSelected([]);
  };

  const slotLabel = slots.join(" & ");
  const errors = {
    vorname: form.vorname.trim().length < 2,
    nachname: form.nachname.trim().length < 2,
    email: !isEmail(form.email),
    telefon: !isPhone(form.telefon),
    strasse: form.strasse.trim().length > 0 && form.strasse.trim().length < 3,
    plzort: form.plzort.trim().length > 0 && form.plzort.trim().length < 3,
    einwilligung: !form.einwilligung,
  };
  const valid = !Object.values(errors).some(Boolean);
  const canBook =
    isOpen && slots.length > 0 && selected.length > 0 && valid && !busy;

  const submit = async () => {
    setTried(true);
    if (!canBook) return;
    setBusy(true);
    try {
      const count = selected.length;
      const seats = [...selected].sort((a, b) => a - b);
      const name = `${form.vorname.trim()} ${form.nachname.trim()}`;
      let res = null;
      // Buchung als eine Transaktion: Belegung, Reservierung und Gastprofil.
      await withTransaction(async () => {
        const occ = { ...((await getOccupancy(loc.id, date)) || {}) };
        slots.forEach((s) => {
          occ[s] = Array.from(new Set([...(occ[s] || []), ...seats])).sort(
            (a, b) => a - b,
          );
        });
        await saveOccupancy(loc.id, date, occ);
        setOccupancy(occ);

        res = {
          id: `${Date.now()}-${Math.floor(Math.random() * 9999)}`,
          locId: loc.id,
          locName: loc.name,
          city: loc.city,
          dateKey: date,
          slot: slots[0],
          slots: [...slots],
          seats,
          persons: count,
          aktion: day.aktion ? day.aktion.titel : "",
          angebot: day.aktion ? day.aktion.angebot || "" : loc.angebot || "",
          vorname: form.vorname.trim(),
          nachname: form.nachname.trim(),
          email: form.email.trim(),
          telefon: form.telefon.trim(),
          strasse: form.strasse.trim(),
          plzort: form.plzort.trim(),
          note: form.note.trim(),
          createdAt: new Date().toISOString(),
        };
        await addReservation(res);

        await setAccount({
          profile: {
            vorname: res.vorname,
            nachname: res.nachname,
            email: res.email,
            telefon: res.telefon,
            strasse: res.strasse,
            plzort: res.plzort,
            einwilligungAm: new Date().toISOString(),
          },
        });
      });

      const account = await getAccount();
      onBooked(account);

      const chairList = seats.map((n) => n + 1).join(", ");
      const people = `${count} ${count === 1 ? "Person" : "Personen"}`;
      // E-Mails kommen aus Firebase-Vorlagen mit lokalen Standardvorlagen als Fallback.
      const { guestMail, venueMail } = await buildBookingMails({
        loc,
        res,
        date,
        slots,
        day,
        slotLabel,
        chairList,
        people,
        name,
        seatCount: count,
        remainingSeats: free,
      });
      // Echte Zustellung über den Mail-Server zuerst; nur wenn sie nicht
      // klappt, läuft die Benachrichtigung über Webhook bzw. die Warteschlange
      // im Gastgeber-Bereich — sonst würde dieselbe Mail doppelt auftauchen.
      const apiSent = { guest: false, venue: false, test: false, previews: [] };
      try {
        // EmailJS mit der gemeinsamen Vorlage, sobald konfiguriert; sonst SMTP.js.
        const g = emailJsConfigured
          ? await sendEmailJs({
              to: res.email,
              subject: guestMail.betreff,
              html: guestMail.html,
              replyTo: loc.email || res.email,
            })
          : await sendEmail({
              to: res.email,
              subject: guestMail.betreff,
              text: guestMail.lines.join("\n\n"),
              html: guestMail.html,
            });
        apiSent.guest = !!g.success;
        if (g.mode === "ethereal") {
          apiSent.test = true;
          if (g.previewUrl) apiSent.previews.push(g.previewUrl);
        }
      } catch (err) {
        console.warn("E-Mail-Server nicht erreichbar (Gast)", err);
      }
      try {
        if (isEmail(venueMail.an)) {
          const vn = emailJsConfigured
            ? await sendEmailJs({
                to: venueMail.an,
                subject: venueMail.betreff,
                html: venueMail.html,
                replyTo: res.email,
              })
            : await sendEmail({
                to: venueMail.an,
                subject: venueMail.betreff,
                text: venueMail.lines.join("\n\n"),
                html: venueMail.html,
              });
          apiSent.venue = !!vn.success;
          if (vn.mode === "ethereal" && vn.previewUrl)
            apiSent.previews.push(vn.previewUrl);
        }
      } catch (err) {
        console.warn("E-Mail-Server nicht erreichbar (Betrieb)", err);
      }
      const push = apiSent.venue
        ? { ok: true, weg: "smtp" }
        : await pushNotification(loc, venueMail, res);
      setBooked({ res, mails: [guestMail, venueMail], push, apiSent });
      showToast(
        apiSent.test
          ? v(
              "Platz reserviert — Mails im Testmodus erfasst (keine echte Zustellung)",
              "Seat booked — emails captured in test mode (no real delivery)",
            )
          : apiSent.venue
            ? v(
                "Platz reserviert — E-Mails versendet",
                "Seat booked — emails sent",
              )
            : push.ok
              ? v(
                  "Platz reserviert — Betrieb benachrichtigt",
                  "Seat booked — venue notified",
                )
              : v("Platz reserviert", "Seat booked"),
      );
      await setAccount({
        profile: {
          vorname: res.vorname,
          nachname: res.nachname,
          email: res.email,
          telefon: res.telefon,
          strasse: res.strasse,
          plzort: res.plzort,
          einwilligungAm: new Date().toISOString(),
        },
      });
      window.scrollTo({ top: 0 });
    } catch (err) {
     // console.error("Buchung fehlgeschlagen", err);
      showToast(
        v(
          "Das hat nicht geklappt — bitte noch einmal versuchen.",
          "This did not work — please try again.",
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  if (booked) {
    const r = booked.res;
    return (
      <div
        className="mt-wrap"
        style={{ padding: "28px 20px 60px", maxWidth: 720 }}
      >
        <div
          className="card no-print"
          style={{ textAlign: "center", padding: "32px 24px" }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "var(--kobalt)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              margin: "0 auto 14px",
            }}
          >
            ✓
          </div>
          <div
            className="f-display"
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: "var(--kobalt-dunkel)",
            }}
          >
            {v("Du sitzt mit am Tisch", "You have a seat at the table")}
          </div>
          <p
            style={{
              color: "#3A4258",
              margin: "10px auto 4px",
              maxWidth: "46ch",
            }}
          >
            {r.persons === 1
              ? v("1 Platz", "1 seat")
              : v(`${r.persons} Plätze`, `${r.persons} seats`)}{" "}
            {v("am Mischtisch im", "at the Mischtisch at")} <b>{loc.name}</b>,{" "}
            {loc.city} —{longDate(r.dateKey)},{" "}
            {(r.slots || [r.slot]).join(" & ")}
            {v(" Uhr", "")}.
          </p>
          <div style={{ fontSize: 13.5, color: "#5B627A" }}>
            {v("Stuhl", "Chair")} {r.seats.map((n) => n + 1).join(", ")}
          </div>
          {r.aktion && (
            <div style={{ fontSize: 14, color: "var(--eiche)", marginTop: 6 }}>
              ★ {r.aktion}
              {r.angebot ? ` — ${r.angebot}` : ""}
            </div>
          )}
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: 18,
            }}
          >
            <button className="btn btn-ghost btn-sm" onClick={printBeleg}>
              {v(
                "Bestätigung drucken oder als PDF speichern",
                "Print confirmation or save as PDF",
              )}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => downloadIcs(r)}
            >
              {v("In den Kalender übernehmen", "Add to calendar")}
            </button>
          </div>
        </div>

        <div className="print-area" style={{ marginTop: 16 }}>
          <Beleg res={r} loc={loc} />
        </div>

        {/* <div
          className="card no-print"
          style={{
            marginTop: 14,
            fontSize: 14,
            borderColor:
              booked.apiSent.venue || booked.push.ok ? "var(--moos)" : "var(--honig)",
            background:
              booked.apiSent.venue || booked.push.ok ? "#F2F6F2" : "#FDF6E7",
          }}
        >
          {booked.apiSent.test
            ? v(
                <>
                  <b>Mails im Testmodus erfasst — keine echte Zustellung.</b> Gültige
                  SMTP-Zugangsdaten in server/.env eintragen, dann wird wirklich
                  versendet. Vorschau:{" "}
                  {booked.apiSent.previews.map((p, i) => (
                    <span key={p}>
                      {i > 0 ? " · " : ""}
                      <a href={p} target="_blank" rel="noreferrer">
                        Mail {i + 1}
                      </a>
                    </span>
                  ))}
                </>,
                <>
                  <b>Emails captured in test mode — no real delivery.</b> Add valid SMTP
                  credentials to server/.env for real sending. Preview:{" "}
                  {booked.apiSent.previews.map((p, i) => (
                    <span key={p}>
                      {i > 0 ? " · " : ""}
                      <a href={p} target="_blank" rel="noreferrer">
                        Mail {i + 1}
                      </a>
                    </span>
                  ))}
                </>,
              )
            : booked.apiSent.venue
            ? v(
                <>
                  <b>E-Mails versendet.</b> Bestätigung und Benachrichtigung wurden über
                  den Mail-Server zugestellt.
                </>,
                <>
                  <b>Emails sent.</b> The confirmation and the notification were delivered
                  via the mail server.
                </>,
              )
            : booked.push.ok
              ? v(
                  <>
                  <b>Der Betrieb wurde automatisch benachrichtigt.</b> Die Reservierung
                  wurde an {loc.name} übermittelt und liegt zusätzlich im Gastgeber-Bereich
                  bereit.
                </>,
                <>
                  <b>The venue has been notified automatically.</b> The reservation was
                  sent to {loc.name} and is also waiting in the host area.
                </>,
              )
            : v(
                <>
                  <b>Die Reservierung liegt im Gastgeber-Bereich von {loc.name} bereit.</b>{" "}
                  Für den automatischen E-Mail-Versand hinterlegt der Betrieb einmalig eine
                  Versand-Adresse in seinen Einstellungen.
                </>,
                <>
                  <b>The reservation is waiting in the host area of {loc.name}.</b> For
                  automatic email delivery the venue stores a delivery address once in its
                  settings.
                </>,
              )}
        </div> */}

        {/* <div className="eyebrow no-print" style={{ margin: "26px 0 10px" }}>
          {v("Bestätigungen", "Confirmations")}
        </div>
        <div className="no-print" style={{ display: "grid", gap: 14 }}>
          {booked.mails.map((m, i) => (
            <EmailCard key={i} {...m} />
          ))}
        </div>
        <div
          className="no-print"
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: 16,
          }}
        >
          {isEmail(booked.mails[1].an) ? (
            <a
              className="btn btn-primary"
              style={{ textDecoration: "none", display: "inline-block" }}
              href={mailtoHref(booked.mails[1])}
            >
              {v("Jetzt E-Mail an den Betrieb senden", "Send email to the venue now")}
            </a>
          ) : (
            <span className="notice" style={{ alignSelf: "center", maxWidth: "46ch" }}>
              {v(
                "Der Betrieb hat noch keine E-Mail hinterlegt — die Reservierung liegt in seinem Gastgeber-Bereich bereit.",
                "The venue has not stored an email yet — the reservation is waiting in its host area.",
              )}
            </span>
          )}
          <a
            className="btn btn-ghost"
            style={{ textDecoration: "none", display: "inline-block" }}
            href={mailtoHref(booked.mails[0])}
          >
            {v("Bestätigung an mich mailen", "Email the confirmation to me")}
          </a>
        </div>
        <p className="notice no-print" style={{ marginTop: 10, textAlign: "center" }}>
          {v(
            "Die Buttons öffnen dein E-Mail-Programm mit fertigem Text — einmal auf Senden tippen, und die Mail geht raus.",
            "The buttons open your email program with the finished text — just tap send and the email goes out.",
          )}
        </p> */}
        <div
          className="no-print"
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: 14,
          }}
        >
          <button className="btn btn-ghost" onClick={onBack}>
            {v("Weitere Tische ansehen", "Browse more tables")}
          </button>
        </div>
      </div>
    );
  }

  const inputCls = (key) =>
    "input" + (tried && errors[key] ? " field-err" : "");

  return (
    <div className="mt-wrap" style={{ padding: "20px 20px 60px" }}>
      <button className="nav-btn" onClick={onBack} style={{ marginLeft: -10 }}>
        {v("← Alle Tische", "← All tables")}
      </button>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 12,
          flexWrap: "wrap",
          margin: "10px 0 4px",
        }}
      >
        <div>
          <div className="eyebrow">
            {loc.region} · {loc.type}
          </div>
          <h2
            className="f-display"
            style={{
              fontSize: "clamp(26px,4.5vw,38px)",
              fontWeight: 600,
              margin: "6px 0 4px",
              color: "var(--kobalt-dunkel)",
            }}
          >
            {loc.name}
          </h2>
          <div style={{ color: "#5B627A" }}>
            {loc.city} · {loc.desc}
          </div>
        </div>
        <span className="tag">
          {seatCount} {v("Plätze · ein Tisch", "seats · one table")}
        </span>
      </div>

      {coverImage && (
        <figure className="galerie" style={{ margin: "16px 0 0" }}>
          <img
            className="gross"
            src={coverImage}
            alt={`${loc.name}, ${v("Titelbild", "cover image")}`}
          />
        </figure>
      )}

      {/* {(loc.oeffnungText || loc.kueche || loc.angebot || (loc.days || []).length > 0) && (
        <div
          className="card"
          style={{
            marginTop: 14,
            padding: "12px 16px",
            fontSize: 14,
            display: "grid",
            gap: 3,
            color: "#3A4258",
          }}
        >
          {loc.oeffnungText && (
            <div>
              <b>{v("Öffnungszeiten:", "Opening hours:")}</b> {loc.oeffnungText}
            </div>
          )}
          {loc.kueche && (
            <div>
              <b>{v("Küche:", "Kitchen:")}</b> {loc.kueche}
            </div>
          )}
          Mischtisch-Tage im bekannten Muster (wie LocCard): Tage · Zeitfenster
          {(loc.days || []).length > 0 && (
            <div>
              <b>{v("Mischtisch:", "Mischtisch:")}</b> {daysList(loc.days)}
              {loc.fenster
                ? ` · ${loc.fenster.von}–${loc.fenster.bis}` +
                  (loc.mehrfach
                    ? v(" Uhr · mehrere Zeitfenster kombinierbar", " Uhr · several time slots can be combined")
                    : v(" Uhr", ""))
                : ""}
            </div>
          )}
          {loc.angebot && (
            <div>
              <b>{v("Spezialangebot:", "Special offer:")}</b> {loc.angebot}
            </div>
          )}
          {loc.masse && (
            <div>
              <b>{v("Tisch:", "Table:")}</b> {loc.masse}
            </div>
          )}
        </div>
      )} */}

      {(activeAktionen(loc, date).length > 0 ||
        nextAktion(loc, dateKey(new Date()))) &&
        (() => {
          const aktionen = activeAktionen(loc, date);
          const next = nextAktion(loc, dateKey(new Date()));
          if (aktionen.length === 0 && !next) return null;
          const cols = Math.min(4, aktionen.length || 1);
          return (
            <div
              style={{
                marginTop: 14,
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap: 12,
              }}
            >
              {aktionen.length > 0
                ? aktionen.map((a) => (
                    <div key={a.titel} className="aktion-box">
                      <span className="aktion-tag">
                        {v("Aktion an diesem Tag", "Promotion on this day")}
                      </span>
                      <div
                        className="f-display"
                        style={{
                          fontSize: 19,
                          fontWeight: 600,
                          margin: "6px 0 2px",
                          color: "var(--kobalt-dunkel)",
                        }}
                      >
                        {a.titel}
                      </div>
                      <div style={{ fontSize: 14, color: "#3A4258" }}>
                        {aktionRange(a)}
                        {a.alleTage
                          ? v(
                              " · in dieser Zeit täglich buchbar",
                              " · bookable daily during this period",
                            )
                          : ""}
                      </div>
                      {a.angebot && (
                        <div
                          style={{
                            fontSize: 14.5,
                            color: "#3A4258",
                            marginTop: 6,
                          }}
                        >
                          {a.angebot}
                        </div>
                      )}
                    </div>
                  ))
                : next && (
                    <div className="aktion-box">
                      <span className="aktion-tag">
                        {v("Kommende Aktionswoche", "Upcoming theme week")}
                      </span>
                      <div
                        className="f-display"
                        style={{
                          fontSize: 19,
                          fontWeight: 600,
                          margin: "6px 0 2px",
                          color: "var(--kobalt-dunkel)",
                        }}
                      >
                        {next.titel}
                      </div>
                      <div style={{ fontSize: 14, color: "#3A4258" }}>
                        {aktionRange(next)}
                        {next.alleTage
                          ? v(
                              " · in dieser Zeit täglich buchbar",
                              " · bookable daily during this period",
                            )
                          : ""}
                      </div>
                      {next.angebot && (
                        <div
                          style={{
                            fontSize: 14.5,
                            color: "#3A4258",
                            marginTop: 6,
                          }}
                        >
                          {next.angebot}
                        </div>
                      )}
                    </div>
                  )}
            </div>
          );
        })()}

      <div style={{ margin: "18px 0 8px" }} className="label">
        {v("Datum", "Date")}
      </div>
      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 6,
        }}
      >
        {days.map((d) => {
          const dk = dateKey(d);
          const st = dayStatus(loc, dk, d.getDay()).status;
          const past = isPast(dk);
          return (
            <button
              key={dk}
              className={`daybtn ${dk === date ? "on" : ""} ${st === "kein" || st === "ruhetag" || past ? "off" : ""}`}
              onClick={() => setDate(dk)}
              disabled={past}
              aria-pressed={dk === date}
            >
              <div className="dow">{dayShortName[d.getDay()]}</div>
              <div className="dom">{d.getDate()}</div>
              <div
                style={{
                  fontSize: 9,
                  lineHeight: 1,
                  height: 10,
                  color: dk === date ? "var(--honig)" : "var(--eiche)",
                }}
              >
                {(loc.sonder || {})[dk]?.typ === "offen"
                  ? "★"
                  : activeAktion(loc, dk)
                    ? "●"
                    : ""}
              </div>
            </button>
          );
        })}
      </div>

      {sonderEntry?.typ === "zu" ? (
        <div
          className="card"
          style={{
            marginTop: 14,
            textAlign: "center",
            color: "#5B627A",
          }}
        >
          <b style={{ color: "var(--tinte)" }}>{v("Ruhetag", "Closed")}</b>

          {" — "}

          {v(
            `${loc.name} hat an diesem Tag geschlossen.`,
            `${loc.name} is closed on this day.`,
          )}
        </div>
      ) : day.status === "kein" ? (
        <div
          className="card"
          style={{ marginTop: 14, textAlign: "center", color: "#5B627A" }}
        >
          {v(
            `An diesem Tag deckt ${loc.name} den Mischtisch nicht.`,
            `${loc.name} does not set the Mischtisch on this day.`,
          )}{" "}
          {v("Mischtisch-Tage hier:", "Mischtisch days here:")}{" "}
          <b>{daysList(loc.days || [])}</b>.
        </div>
      ) : isFull ? (
        <div className="card" style={{ marginTop: 18, paddingTop: 14 }}>
          <div
            style={{
              textAlign: "center",
              fontSize: 14,
              color: "#3A4258",
              marginBottom: 2,
            }}
          >
            {longDate(date)} —{" "}
            <b style={{ color: "#B4443C" }}>
              {v("ausgebucht", "fully booked")}
            </b>
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#8A8FA3",
              textAlign: "center",
              marginBottom: 6,
            }}
          >
            {v(
              "Für diesen Termin sind alle Plätze vergeben. Bitte ein anderes Datum wählen.",
              "All seats are taken for this date. Please pick another day.",
            )}
          </div>
          <TableSvg seats={seatCount} tisch={loc.tisch} occupied={taken} />
          <Legend />
        </div>
      ) : (
        <>
          <div style={{ margin: "14px 0 8px" }} className="label">
            {v("Uhrzeit", "Time")}
            {loc.mehrfach && (
              <span style={{ fontWeight: 400, color: "#6A7288" }}>
                {v(
                  " — mehrere Zeitfenster wählbar",
                  " — several slots can be selected",
                )}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {daySlots.map((s) => (
              <button
                key={s}
                className={`slot ${slots.includes(s) ? "on" : ""}`}
                onClick={() => toggleSlot(s)}
                aria-pressed={slots.includes(s)}
              >
                {s}
                {v(" Uhr", "")}
              </button>
            ))}
          </div>
          {sonderEntry && (
            <div
              className="aktion-box"
              style={{
                marginTop: 14,
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                <span className="aktion-tag">
                  {v("Sondertermin", "Special date")}
                </span>
                <div
                  className="f-display"
                  style={{
                    fontSize: 19,
                    fontWeight: 600,
                    margin: "6px 0 2px",
                    color: "var(--kobalt-dunkel)",
                  }}
                >
                  {longDate(date)}
                </div>
                <div style={{ fontSize: 14, color: "#3A4258" }}>
                  {sonderEntry.typ === "offen"
                    ? `${v("Sonderöffnung", "Special opening")} · ${(sonderEntry.slots || []).join(", ")}${v(" Uhr", "")}`
                    : v(
                        "Geschlossen — Gäste sehen „ausgebucht“",
                        "Closed — guests see “fully booked”",
                      )}
                </div>
                {sonderEntry.note && (
                  <div
                    style={{ fontSize: 14.5, color: "#3A4258", marginTop: 6 }}
                  >
                    {sonderEntry.note}
                  </div>
                )}
                <div className="notice" style={{ marginTop: 8 }}>
                  {v(
                    "Sondertermin — an diesem Tag gibt es den Mischtisch zusätzlich.",
                    "Special date — the Mischtisch is set on this day in addition.",
                  )}
                </div>
              </div>
              {sonderEntry.bild && (
                <img
                  src={sonderEntry.bild}
                  alt={v("Bild zum Sondertermin", "Special date image")}
                  style={{
                    flex: "0 0 auto",
                    width: 180,
                    maxHeight: 170,
                    objectFit: "cover",
                    borderRadius: 10,
                    border: "1px solid var(--honig)",
                  }}
                />
              )}
            </div>
          )}
          {loc.mehrfach && slots.length > 1 && (
            <div className="notice" style={{ marginTop: 8 }}>
              {v(
                `Deine Plätze werden für alle ${slots.length} gewählten Zeitfenster reserviert.`,
                `Your seats will be booked for all ${slots.length} selected time slots.`,
              )}
            </div>
          )}
          {loc.provisional && (
            <div className="notice" style={{ marginTop: 8 }}>
              {v(
                "Vorläufige Standardzeiten — Plätze, Tage und Uhrzeiten bestätigt der Betrieb im Gastgeber-Bereich.",
                "Provisional default times — the venue confirms seats, days and times in the host area.",
              )}
            </div>
          )}
          <div className="card" style={{ marginTop: 18, paddingTop: 14 }}>
            <div
              style={{
                textAlign: "center",
                fontSize: 14,
                color: "#3A4258",
                marginBottom: 2,
              }}
            >
              {longDate(date)}, {slotLabel}
              {v(" Uhr", "")} —{" "}
              <b style={{ color: free > 0 ? "var(--moos)" : "#B4443C" }}>
                {free > 0
                  ? v(
                      `${free} von ${seatCount} Plätzen frei`,
                      `${free} of ${seatCount} seats free`,
                    )
                  : v("ausgebucht", "fully booked")}
              </b>
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#8A8FA3",
                textAlign: "center",
                marginBottom: 6,
              }}
            >
              {v(
                "Tippe auf freie Stühle — jeder gewählte Stuhl steht für eine Person.",
                "Tap the free chairs — each chair you pick is one person.",
              )}
            </div>
            <TableSvg
              seats={seatCount}
              tisch={loc.tisch}
              occupied={taken}
              selected={selected}
              onToggle={toggleSeat}
            />
            <Legend />
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <div
              className="f-display"
              style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}
            >
              {selected.length === 0
                ? v("Deine Kontaktdaten", "Your contact details")
                : selected.length === 1
                  ? v("Reservierung für 1 Person", "Reservation for 1 person")
                  : v(
                      `Reservierung für ${selected.length} Personen`,
                      `Reservation for ${selected.length} people`,
                    )}
            </div>
            <div className="form-grid">
              <div>
                <label className="label" htmlFor="mt-vn">
                  {v("Vorname *", "First name *")}
                </label>
                <input
                  id="mt-vn"
                  className={inputCls("vorname")}
                  value={form.vorname}
                  onChange={field("vorname")}
                  placeholder="Anna"
                />
              </div>
              <div>
                <label className="label" htmlFor="mt-nn">
                  {v("Nachname *", "Last name *")}
                </label>
                <input
                  id="mt-nn"
                  className={inputCls("nachname")}
                  value={form.nachname}
                  onChange={field("nachname")}
                  placeholder="Beispiel"
                />
              </div>
              <div>
                <label className="label" htmlFor="mt-em">
                  {v("E-Mail-Adresse *", "Email address *")}
                </label>
                <input
                  id="mt-em"
                  type="email"
                  className={inputCls("email")}
                  value={form.email}
                  onChange={field("email")}
                  placeholder="anna@beispiel.example"
                />
              </div>
              <div>
                <label className="label" htmlFor="mt-tel">
                  {v("Telefonnummer *", "Phone number *")}
                </label>
                <input
                  id="mt-tel"
                  type="tel"
                  className={inputCls("telefon")}
                  value={form.telefon}
                  onChange={field("telefon")}
                  placeholder="0351 1234567"
                />
              </div>
              <div>
                <label className="label" htmlFor="mt-str">
                  {v("Straße und Hausnummer", "Street and number")}{" "}
                  <span style={{ fontWeight: 400, color: "#8A8FA3" }}>
                    {v("(freiwillig)", "(optional)")}
                  </span>
                </label>
                <input
                  id="mt-str"
                  className={inputCls("strasse")}
                  value={form.strasse}
                  onChange={field("strasse")}
                  placeholder="Musterweg 12"
                />
              </div>
              <div>
                <label className="label" htmlFor="mt-plz">
                  {v("PLZ und Ort", "Postcode and town")}{" "}
                  <span style={{ fontWeight: 400, color: "#8A8FA3" }}>
                    {v("(freiwillig)", "(optional)")}
                  </span>
                </label>
                <input
                  id="mt-plz"
                  className={inputCls("plzort")}
                  value={form.plzort}
                  onChange={field("plzort")}
                  placeholder="01067 Dresden"
                />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="label" htmlFor="mt-note">
                {v(
                  "Nachricht an den Gastgeber (optional)",
                  "Message to the host (optional)",
                )}
              </label>
              <input
                id="mt-note"
                className="input"
                value={form.note}
                onChange={field("note")}
                placeholder={v(
                  "z. B. vegetarisch, komme etwas später …",
                  "e.g. vegetarian, arriving a little late …",
                )}
              />
            </div>
            <label
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                cursor: "pointer",
                fontSize: 14,
                marginTop: 14,
              }}
            >
              <input
                type="checkbox"
                checked={form.einwilligung}
                onChange={(ev) =>
                  setForm((f) => ({ ...f, einwilligung: ev.target.checked }))
                }
                style={{ marginTop: 3 }}
              />
              <span>
                {v(
                  `Ich bin einverstanden, dass meine Angaben zur Bearbeitung dieser Reservierung gespeichert und an ${loc.name} übermittelt werden. *`,
                  `I agree that my details are stored to process this reservation and passed on to ${loc.name}. *`,
                )}{" "}
                <button
                  type="button"
                  onClick={onRecht}
                  style={{
                    all: "unset",
                    cursor: "pointer",
                    color: "var(--kobalt)",
                    fontWeight: 600,
                    textDecoration: "underline",
                  }}
                >
                  {v("Datenschutzhinweise", "Privacy notice")}
                </button>
              </span>
            </label>
            {tried && !valid && (
              <div style={{ color: "#B4443C", fontSize: 13.5, marginTop: 10 }}>
                {errors.einwilligung
                  ? v(
                      "Bitte der Verarbeitung deiner Angaben zustimmen.",
                      "Please agree to the processing of your details.",
                    )
                  : v(
                      "Bitte alle Pflichtfelder (*) vollständig ausfüllen.",
                      "Please complete all required fields (*).",
                    )}
              </div>
            )}
            {tried && valid && selected.length === 0 && (
              <div style={{ color: "#B4443C", fontSize: 13.5, marginTop: 10 }}>
                {v(
                  "Bitte oben im Tischplan mindestens einen Stuhl auswählen.",
                  "Please select at least one chair in the table plan above.",
                )}
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 12,
                marginTop: 16,
                // flexWrap: "wrap",
              }}
            >
              {/* <div className="notice" style={{ maxWidth: "50ch" }}>
                {loc.email
                  ? v(
                      `Du und der Betrieb (${loc.email}) erhaltet je eine Bestätigung. `,
                      `You and the venue (${loc.email}) each receive a confirmation. `,
                    )
                  : v(
                      "Du erhältst eine Bestätigung; die Benachrichtigung an den Betrieb greift, sobald er im Gastgeber-Bereich seine E-Mail hinterlegt. ",
                      "You receive a confirmation; the venue is notified as soon as it stores an email address in the host area. ",
                    )}
                {v(
                  "Andere Gäste sehen nur belegte Stühle, keine Namen.",
                  "Other guests only see which chairs are taken, never names.",
                )}
                <b>
                  {" "}
                  {v(
                    "Testfassung: bitte keine echten personenbezogenen Daten eingeben.",
                    "Test version: please do not enter real personal data.",
                  )}
                </b>
              </div> */}
              <button
                className="btn btn-primary"
                disabled={busy}
                onClick={submit}
              >
                {busy
                  ? v("Wird reserviert …", "Booking …")
                  : v("Verbindlich reservieren", "Book now")}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
