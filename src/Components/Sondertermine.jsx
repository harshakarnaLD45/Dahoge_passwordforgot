// Sondertermine: geschlossene Tage ("zu") und Sonderöffnungen ("offen").
import { useRef, useState } from "react";
import { v } from "../Utils/i18n";
import { buildSlots } from "../Utils/format";
import { shortDate } from "../Utils/dates";
import { compressImage, isAllowedImage } from "../Utils/images";

export function Sondertermine({ sonder, onChange, standardSlots, showToast }) {
  let [date, setDate] = useState("");
  let [typ, setTyp] = useState("zu");
  let [von, setVon] = useState("18:00");
  let [bis, setBis] = useState("20:00");
  let [takt, setTakt] = useState(60);
  let [note, setNote] = useState("");
  let [bild, setBild] = useState(null);
 
  let fileRef = useRef(null);
  let entries = Object.entries(sonder || {}).sort((a, b) =>
    a[0].localeCompare(b[0]),
  );

  const pickBild = async (e) => {
    const file = e.target.files?.[0];

    e.target.value = "";

    if (!file) return;

   

    if (!isAllowedImage(file)) {
      if (showToast) {
        showToast(
          v(
            "Bitte nur PNG- oder JPEG-Dateien wählen.",
            "Please choose PNG or JPEG files only.",
          ),
        );
      }

      return;
    }

    if (file.size > 1e6) {
      //console.error("FILE TOO LARGE:", file.size);

      if (showToast) {
        showToast(
          v(
            "Die Datei ist größer als 1 MB — bitte ein kleineres Bild wählen.",
            "The file is larger than 1 MB — please choose a smaller image.",
          ),
        );
      }

      return;
    }

    try {
      const imageData = await compressImage(file, 800, 0.7);

      //console.log("🖼️ COMPRESSED IMAGE");
      //console.log("IMAGE TYPE:", typeof imageData);
      //console.log("IMAGE LENGTH:", imageData?.length);
      //console.log("IMAGE PREFIX:", imageData?.substring(0, 50));

      setBild(imageData);
    } catch (err) {
     // console.error("❌ IMAGE PROCESSING ERROR:", err);

      if (showToast) {
        showToast(
          v(
            "Bild konnte nicht verarbeitet werden.",
            "The image could not be processed.",
          ),
        );
      }
    }
  };

  const add = () => {
   // console.log("🔥 ADD CLOSED DATE");

    if (!date) {
     // console.log("❌ No date selected");
      return;
    }

    // Closed days only
    if (typ !== "zu") {
      //console.log("⚠️ Not a closed day");
      return;
    }

    // IMPORTANT:
    // Closed days must NEVER contain an image.
    const entry = {
      typ: "zu",
      note: note.trim(),
      bild: "",
    };

    console.log("🔥 CLOSED ENTRY =", entry);

    onChange(date, entry);

    // Reset form
    setDate("");
    setNote("");
    setBild(null);

    //console.log("✅ CLOSED DATE ADDED:", date);
  };

  const saveSpecialOpening = () => {
   // console.log("🔥 SPECIAL OPENING SAVE");

    if (!date) {
    //  console.log("❌ SPECIAL OPENING: DATE MISSING");
      return;
    }

    if (typ !== "offen") {
    //  console.log("❌ SPECIAL OPENING: TYPE IS NOT offen");
      return;
    }

    const slots = buildSlots(von, bis, takt);

    if (!slots.length) {
     // console.log("❌ SPECIAL OPENING: NO SLOTS");
      return;
    }

    const entry = {
      typ: "offen",
      slots,
      note: note.trim(),
    };

    if (bild) {
      entry.bild = bild;
    }

    //console.log("🔥 SPECIAL OPENING ENTRY =", entry);

    onChange(date, entry);

    //console.log("✅ SPECIAL OPENING SENT TO PARENT");
  };

  let remove = (d) => {
    onChange(d, null);
  };

  return (
    <div>
      {/* =========================
        EXISTING SPECIAL DATES
       ========================= */}
      {entries.length > 0 && (
        <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
          {entries.map(([d, entry]) => (
            <div
              key={d}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
                border: "1px solid var(--linie)",
                borderRadius: 10,
                padding: "8px 12px",
                fontSize: 14,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                {entry.bild && (
                  <img
                    src={entry.bild}
                    alt=""
                    style={{
                      width: 56,
                      height: 40,
                      objectFit: "cover",
                      borderRadius: 6,
                      border: "1px solid var(--linie)",
                    }}
                  />
                )}

                <span>
                  <b>{shortDate(d)}</b> ·{" "}
                  {entry.typ === "zu" ? (
                    <span style={{ color: "#B4443C" }}>
                      {v(
                        "geschlossen — Gäste sehen „ausgebucht“",
                        "closed — guests see “fully booked”",
                      )}
                    </span>
                  ) : (
                    <span style={{ color: "var(--moos)" }}>
                      {v("Sonderöffnung", "Special opening")}{" "}
                      {(entry.slots || standardSlots).join(", ")}
                      {v(" Uhr", "")}
                    </span>
                  )}
                  {entry.note && (
                    <span style={{ color: "#8A8FA3" }}> · {entry.note}</span>
                  )}
                </span>
              </span>

              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => remove(d)}
              >
                {v("Entfernen", "Remove")}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* =========================
        ADD SPECIAL DATE FORM
       ========================= */}
      <div className="form-grid">
        {/* DATE */}
        <div>
          <label
            className="label"
            htmlFor="so-datum"
            style={{ fontWeight: 500 }}
          >
            {v("Datum", "Date")}
          </label>

          <input
            id="so-datum"
            type="date"
            className="input"
            value={date}
            onChange={(e) => {
            
              setDate(e.target.value);
            }}
          />
        </div>

        {/* TYPE */}
        <div>
          <label className="label" htmlFor="so-typ" style={{ fontWeight: 500 }}>
            {v("Art", "Type")}
          </label>

          <select
            id="so-typ"
            className="input"
            value={typ}
            onChange={(e) => {
              const newType = e.target.value;

              setTyp(newType);

              // Closed days must not keep an image
              if (newType === "zu") {
                setBild(null);
              }
            }}
          >
            <option value="zu">
              {v(
                "Geschlossen / Ruhetag / Urlaub",
                "Closed / day off / holiday",
              )}
            </option>

            <option value="offen">
              {v(
                "Sonderöffnung (zusätzlicher Tag)",
                "Special opening (additional day)",
              )}
            </option>
          </select>
        </div>

        {/* SPECIAL OPENING */}
        {typ === "offen" && (
          <>
            <div>
              <label
                className="label"
                htmlFor="so-von"
                style={{ fontWeight: 500 }}
              >
                {v("Reservierbar von", "Bookable from")}
              </label>

              <input
                id="so-von"
                type="time"
                className="input"
                value={von}
                onChange={(e) => setVon(e.target.value)}
              />
            </div>

            <div>
              <label
                className="label"
                htmlFor="so-bis"
                style={{ fontWeight: 500 }}
              >
                {v("bis", "to")}
              </label>

              <input
                id="so-bis"
                type="time"
                className="input"
                value={bis}
                onChange={(e) => setBis(e.target.value)}
              />
            </div>

            <div>
              <label
                className="label"
                htmlFor="so-takt"
                style={{ fontWeight: 500 }}
              >
                {v("Takt", "Interval")}
              </label>

              <select
                id="so-takt"
                className="input"
                value={takt}
                onChange={(e) => setTakt(Number(e.target.value))}
              >
                <option value={30}>
                  {v("alle 30 Minuten", "every 30 minutes")}
                </option>

                <option value={60}>{v("jede Stunde", "every hour")}</option>

                <option value={90}>
                  {v("alle 90 Minuten", "every 90 minutes")}
                </option>

                <option value={120}>
                  {v("alle 2 Stunden", "every 2 hours")}
                </option>
              </select>
            </div>
          </>
        )}

        {/* NOTE */}
        <div>
          <label
            className="label"
            htmlFor="so-note"
            style={{ fontWeight: 500 }}
          >
            {v("Interne Notiz (optional)", "Internal note (optional)")}
          </label>

          <input
            id="so-note"
            className="input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={v(
              "z. B. Betriebsurlaub, Hochzeit",
              "e.g. company holiday, wedding",
            )}
          />
        </div>

        {/* IMAGE */}
        <div>
          <div className="label" style={{ fontWeight: 500 }}>
            {v("Bild zum Termin (optional)", "Image for the date (optional)")}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg"
            onChange={pickBild}
            style={{ display: "none" }}
            aria-hidden="true"
            tabIndex={-1}
          />

          {bild ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <img
                src={bild}
                alt={v("Vorschau", "Preview")}
                style={{
                  width: 96,
                  height: 64,
                  objectFit: "cover",
                  borderRadius: 8,
                  border: "1px solid var(--linie)",
                }}
              />

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setBild(null)}
              >
                {v("Bild entfernen", "Remove image")}
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => fileRef.current && fileRef.current.click()}
            >
              {v("Bild auswählen", "Choose image")}
            </button>
          )}
        </div>
      </div>

      {/* =========================
        ADD BUTTON
       ========================= */}
      <div
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
          {v(
            "Geschlossene Tage erscheinen für Gäste als „ausgebucht“, nicht als geschlossen.",
            "Closed days appear as “fully booked” to guests, not as closed.",
          )}
        </span>

        {typ === "zu" ? (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={!date}
            onClick={(e) => {
              e.preventDefault();
              add();
            }}
          >
            {v("Termin hinzufügen", "Add date")}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={!date}
            onClick={(e) => {
              e.preventDefault();

             // console.log("🟢 SPECIAL OPENING BUTTON CLICKED");
              //console.log("DATE =", date);
              //console.log("VON =", von);
              //console.log("BIS =", bis);
              //console.log("TAKT =", takt);
              //console.log("BILD =", bild);

              saveSpecialOpening();
            }}
          >
            {v("Sonderöffnung übernehmen", "Apply special opening")}
          </button>
        )}
      </div>
    </div>
  );
}
