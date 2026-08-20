// Reservierungs-Beleg für die Bestätigungsseite und "Meine Plätze".
import { t, v, getLanguage } from "../Utils/i18n";
import { longDate } from "../Utils/dates";
import { DEHOGA_LOGO } from "../Utils/logo";

export function Beleg({ res, loc }) {
  let slots = (res.slots || [res.slot]).join(" & ");
  return (
    <div className="beleg">
      <div className="beleg-kopf">
        <div>
          <div
            className="f-display"
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--kobalt-dunkel)",
              letterSpacing: ".5px",
            }}
          >
            MISCH·TISCH SACHSEN
          </div>
          <div
            style={{
              fontSize: 12,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#6A7288",
            }}
          >
            {t("beleg.ReservationConfirmation")}
          </div>
        </div>
        <div
          style={{
            textAlign: "right",
            fontSize: 12,
            color: "#6A7288",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 6,
          }}
        >
          {DEHOGA_LOGO && (
            <img
              src={DEHOGA_LOGO}
              alt="DEHOGA Sachsen"
              style={{ height: 34, maxWidth: 150, objectFit: "contain" }}
            />
          )}
          <span>
            {v("Nr.", "No.")} {res.id.split("-")[0]}
            <br />
            {new Date(res.createdAt).toLocaleDateString(
              getLanguage() === "en" ? "en-GB" : "de-DE",
            )}
          </span>
        </div>
      </div>
      <div className="beleg-zeile">
        <b>{t("beleg.Venue")}</b>
        <span>
          {res.locName}, {res.city}
        </span>
      </div>
      <div className="beleg-zeile">
        <b>{t("beleg.Date")}</b>
        <span>{longDate(res.dateKey)}</span>
      </div>
      <div className="beleg-zeile">
        <b>{t("beleg.Time")}</b>
        <span>
          {slots}
          {t("beleg.ClockSuffix")}
        </span>
      </div>
      <div className="beleg-zeile">
        <b>{t("beleg.People")}</b>
        <span>
          {res.persons === 1
            ? t("beleg.OnePerson")
            : t("beleg.ManyPeople", { count: res.persons })}{" "}
          · {t("beleg.Chair")} {res.seats.map((s) => s + 1).join(", ")}
        </span>
      </div>
      <div className="beleg-zeile">
        <b>{t("beleg.Guest")}</b>
        <span>
          {res.vorname} {res.nachname}
        </span>
      </div>
      <div className="beleg-zeile">
        <b>{t("beleg.Contact")}</b>
        <span>
          {res.email} · {res.telefon}
        </span>
      </div>
      {res.strasse && (
        <div className="beleg-zeile">
          <b>{t("beleg.Address")}</b>
          <span>
            {res.strasse}, {res.plzort}
          </span>
        </div>
      )}
      {res.aktion && (
        <div className="beleg-zeile">
          <b>{t("beleg.Promotion")}</b>
          <span>
            {res.aktion}
            {res.angebot ? ` — ${res.angebot}` : ""}
          </span>
        </div>
      )}
      {res.note && (
        <div className="beleg-zeile">
          <b>{t("beleg.Message")}</b>
          <span>{res.note}</span>
        </div>
      )}
      {loc && (loc.oeffnungText || loc.telefon) && (
        <div className="beleg-zeile">
          <b>{t("beleg.VenueReachable")}</b>
          <span>{[loc.telefon, loc.oeffnungText].filter(Boolean).join(" · ")}</span>
        </div>
      )}
      <div style={{ marginTop: 14, fontSize: 12.5, color: "#6A7288" }}>
        {t("beleg.Footnote")}
      </div>
    </div>
  );
}

// Druckt den Beleg über das Browser-Druckfenster (PDF/Print)
export function printBeleg() {
  window.setTimeout(() => window.print(), 60);
}
