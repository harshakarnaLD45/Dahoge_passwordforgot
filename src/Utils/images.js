// Bildkompression für Foto-Uploads: lädt die Datei, skaliert sie auf maxW und
// liefert eine JPEG-dataURL (Standard 1400 px / 0.75 Qualität für große Fotos).
export function compressImage(file, maxWidth = 1400, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        try {
          const scale = Math.min(1, maxWidth / img.width);
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error("Bild nicht lesbar"));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("Datei nicht lesbar"));
    reader.readAsDataURL(file);
  });
}

// Zulässige Upload-Formate: nur PNG und JPEG (MIME-Typ oder Endung).
export function isAllowedImage(file) {
  const type = String(file?.type || "").toLowerCase();
  const ext = String(file?.name || "")
    .split(".")
    .pop()
    ?.toLowerCase();
  return (
    type === "image/png" ||
    type === "image/jpeg" ||
    ext === "png" ||
    ext === "jpg" ||
    ext === "jpeg"
  );
}