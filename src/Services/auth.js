import { fnv1a } from "../Utils/strings";

// Public venue access code derived from the venue ID. Host authentication
// itself is handled by Firebase Authentication.
export function accessCode(betriebId) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let seed = "mischtisch-sachsen|" + betriebId;
  let code = "";
  for (let i = 0; i < 8; i++) {
    seed = String(fnv1a(seed + "|" + i));
    code += alphabet[fnv1a(seed) % alphabet.length];
  }
  return `MT-${code.slice(0, 4)}-${code.slice(4)}`;
}

export function normalizeCode(code) {
  return String(code || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}
