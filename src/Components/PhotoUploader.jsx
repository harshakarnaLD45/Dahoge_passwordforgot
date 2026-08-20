// Foto-Upload: einzelnes Titelbild, max. 1 MB.
import { useRef, useState } from "react";
import { v } from "../Utils/i18n";
import { compressImage, isAllowedImage } from "../Utils/images";

export function PhotoUploader({ fotos, onChange, showToast }) {
  let inputRef = useRef(null);
  let [busy, setBusy] = useState(false);
  let current = fotos?.[0] || null;
  let maxSize = 1e6; // 1 MB

  let handleFiles = async (e) => {
    let file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!isAllowedImage(file)) {
      showToast(
        v(
          "Bitte nur PNG- oder JPEG-Dateien wählen.",
          "Please choose PNG or JPEG files only.",
        ),
      );
      return;
    }
    if (file.size > maxSize) {
      showToast(
        v(
          "Die Datei ist größer als 1 MB — bitte ein kleineres Bild wählen.",
          "The file is larger than 1 MB — please choose a smaller image.",
        ),
      );
      return;
    }

    setBusy(true);
    try {
      let gross = await compressImage(file, 1400, 0.75);
      let klein = await compressImage(file, 420, 0.6);
      onChange([
        {
          id: `f-${Date.now()}-${Math.floor(Math.random() * 999)}`,
          gross,
          klein,
          titel: file.name.replace(/\.[^.]+$/, "").slice(0, 60),
        },
      ]);
      showToast(v("Titelbild festgelegt", "Cover image set"));
    } catch (err) {
      console.error(err);
      showToast(v("Das Bild konnte nicht verarbeitet werden.", "The image could not be processed."));
    }
    setBusy(false);
  };

  let remove = () => onChange([]);

  return (
    <div>
      {current && (
        <div style={{ marginBottom: 12 }}>
          <div className="foto-kachel" style={{ maxWidth: 260 }}>
            <img src={current.klein || current.gross} alt={current.titel || v("Titelbild", "Cover image")} />
            <button
              type="button"
              className="foto-weg"
              onClick={remove}
              aria-label={v("Titelbild entfernen", "Remove cover image")}
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        onChange={handleFiles}
        style={{ display: "none" }}
        aria-hidden="true"
        tabIndex={-1}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <span className="notice" style={{ maxWidth: "46ch" }}>
          {v(
            "Ein Titelbild (max. 1 MB), freiwillig.",
            "One cover image (max. 1 MB), optional.",
          )}{" "}
          {v(
            "Bitte nur eigene Aufnahmen verwenden, an denen Sie die Rechte haben — und keine Bilder, auf denen Gäste erkennbar sind.",
            "Please use only your own photos that you hold the rights to — and no images showing recognisable guests.",
          )}
        </span>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={busy}
          onClick={() => inputRef.current && inputRef.current.click()}
        >
          {busy
            ? v("Wird verarbeitet …", "Processing …")
            : current
              ? v("Titelbild ersetzen", "Replace cover image")
              : v("Titelbild auswählen", "Choose cover image")}
        </button>
      </div>
    </div>
  );
}