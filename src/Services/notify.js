import { addNotification } from "./storage";

// Benachrichtigung an den Betrieb: Webhook-POST, sonst Blind-Versuch (no-cors),
// sonst in die Warteschlange (Firestore-Warteschlange) legen, die der Gastgeber
// im Gastgeber-Bereich abrufen kann.
export async function pushNotification(loc, mail, res) {
  const webhook = (loc.webhook || "").trim();
  const payload = {
    typ: "neue_reservierung",
    an: mail.an,
    betreff: mail.betreff,
    text: mail.lines.join("\n\n"),
    betrieb: { id: loc.id, name: loc.name, ort: loc.city },
    reservierung: res,
  };
  if (webhook) {
    try {
      if (
        (await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })).ok
      ) {
        return { ok: true, weg: "webhook" };
      }
    } catch {}
    try {
      await fetch(webhook, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: JSON.stringify(payload),
      });
      return { ok: true, weg: "webhook-blind" };
    } catch {}
  }
  try {
    await addNotification({
      id: res.id,
      venue_id: loc.id,
      recipient: mail.an,
      subject: mail.betreff,
      lines: mail.lines,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Warteschlange fehlgeschlagen", err);
  }
  return { ok: false, weg: webhook ? "fehlgeschlagen" : "kein-endpunkt" };
}
