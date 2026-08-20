// Shared application data stored in Firebase.
// - Cloud Firestore: venues, accounts, reservations, occupancy, notifications,
//   registrations and editable templates. Venue cover images are stored as
//   Base64 data URLs directly in the venue document (venues/<id>.titelbild).
// - Firebase Authentication: host sign-in and password management.
// Browser-only UI preferences remain local and are not shared between users.
import {
  ensureGuestUser,
  getFirebaseServices,
  waitForHostAuth,
} from "./firebase";
import { EMAIL_TEMPLATE_SEEDS } from "./emailTemplates";

const LOCAL_PREFIX = "mischtisch:";
const LOCAL_SETTING_KEYS = new Set(["language", "logo", "checks"]);
let activeTransaction = null;

const nowIso = () => new Date().toISOString();
const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
const clean = (value) => {
  if (Array.isArray(value)) return value.map(clean).filter((item) => item !== undefined);
  if (value && typeof value === "object" && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, clean(item)]),
    );
  }
  return value;
};

function isLocalSetting(key) {
  return LOCAL_SETTING_KEYS.has(key) || key.startsWith("seen:");
}

function readLocal(key) {
  try {
    const raw = window.localStorage.getItem(LOCAL_PREFIX + key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeLocal(key, value) {
  try {
    if (value === null || value === undefined) {
      window.localStorage.removeItem(LOCAL_PREFIX + key);
    } else {
      window.localStorage.setItem(LOCAL_PREFIX + key, JSON.stringify(value));
    }
  } catch {}
}

async function getDoc(ref) {
  if (activeTransaction) return activeTransaction.transaction.get(ref);
  return ref.get();
}

async function setDoc(ref, data, options) {
  const payload = clean(data);
  if (activeTransaction) {
    activeTransaction.pending.push({ type: "set", ref, data: payload, options });
    return;
  }
  return ref.set(payload, options);
}

async function deleteDoc(ref) {
  if (activeTransaction) {
    activeTransaction.pending.push({ type: "delete", ref });
    return;
  }
  return ref.delete();
}

function dbForTransactionOr(db) {
  return activeTransaction ? activeTransaction.db : db;
}

// ---------------------------------------------------------------- Einstellungen

export async function getSetting(key) {
  if (isLocalSetting(key)) return readLocal(key);
  const { db } = await getFirebaseServices();
  const snap = await db.collection("settings").doc(key).get();
  return snap.exists ? snap.data().value ?? null : null;
}

export async function setSetting(key, value) {
  if (isLocalSetting(key)) {
    writeLocal(key, value);
    return;
  }

  if (key.startsWith("tischform-new:")) {
    const user = await ensureGuestUser();
    const { guestDb } = await getFirebaseServices();
    await guestDb.collection("tableShapeSubmissions").doc(key).set({
      value: clean(value),
      createdByUid: user.uid,
      updatedAt: nowIso(),
    });
    return;
  }

  const { db } = await getFirebaseServices();
  await db.collection("settings").doc(key).set(
    { value: clean(value), updatedAt: nowIso() },
    { merge: true },
  );
}

export async function nextRegistrationCode() {
  const { db } = await getFirebaseServices();
  const ref = db.collection("settings").doc("regCounter");
  const next = await db.runTransaction(async (transaction) => {
    const snap = await transaction.get(ref);
    const value = Number(snap.exists ? snap.data().value : 0) + 1;
    transaction.set(ref, { value, updatedAt: nowIso() });
    return value;
  });
  return `REG-${new Date().getFullYear()}-${String(next).padStart(5, "0")}`;
}

// -------------------------------------------------------------------- Betriebe

export async function getVenues() {
  const { db } = await getFirebaseServices();
  const snap = await db.collection("venues").get();
  return snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => Number(!!a.custom) - Number(!!b.custom) || String(a.name || "").localeCompare(String(b.name || "")));
}

// Der Betrieb eines Hosts (für die automatische Freischaltung nach dem
// Login). Einfache Einzelfeld-Gleichheit — kein Composite-Index nötig.
export async function findVenueByHostUid(uid) {
  const { db } = await getFirebaseServices();
  const snap = await db
    .collection("venues")
    .where("hostUid", "==", uid)
    .limit(1)
    .get();
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

// Persists the full venue document, including the Base64 cover image fields
// (titelbild = small preview, coverImage = large image) written straight into
// the document — no Cloud Storage involved.
export async function upsertVenue(loc) {
  if (!loc || !loc.id) {
    throw new Error("Betrieb-ID fehlt.");
  }



  const { db, auth } = await getFirebaseServices();

  const ref = db.collection("venues").doc(loc.id);

  const existing = await ref.get();

  const cleaned = clean(loc);



  const payload = {
    ...cleaned,
    id: loc.id,
    // registrationStatus wird hier bewusst nicht verändert: neue Betriebe
    // bleiben "pending" und werden erst beim Login automatisch auf "active"
    // gesetzt (activateRegistration via LoginForm).
    updatedAt: nowIso(),
    createdAt: existing.exists
      ? existing.data().createdAt || nowIso()
      : loc.createdAt || nowIso(),
  };

  if (!payload.hostUid && auth.currentUser) {
    payload.hostUid = auth.currentUser.uid;
  }

  // { merge: true } behält alte verschachtelte Felder: ein früherer
  // tisch.custom (eigene Anordnung) würde eine neu gewählte Variante
  // überlagern und den Tischplan kapern (Vorschau zeigt alte Plätze).
  // Schlüssel, die im neuen tisch fehlen, explizit auf null setzen, damit
  // der Merge sie löscht statt stillschweigend zu behalten.
  if (existing.exists && payload.tisch && typeof payload.tisch === "object") {
    const oldTisch = existing.data().tisch || {};
    for (const key of Object.keys(oldTisch)) {
      if (!(key in payload.tisch)) payload.tisch[key] = null;
    }
  }

  await ref.set(payload, { merge: true });
}

// Automatische Freischaltung nach dem Login (LoginForm) für ältere Betriebe,
// die noch "pending" sind: setzt den Status dauerhaft auf "active" — in
// venues und hostProfiles, genau den Dokumenten, die der Passwort-Reset-Gate
// auf dem Server prüft. Idempotent, kein Weg zurück zu "pending". (Das
// registrations-Dokument ist nur für Admins beschreibbar und bleibt
// unverändert.) ponytail: bewusst ein einziger Aufruf — dient zugleich als
// Admin-Override für Einzelfälle.
export async function activateRegistration(venue) {
  if (!venue || !venue.id) throw new Error("Betrieb-ID fehlt.");
  const { db, auth } = await getFirebaseServices();
  if (!auth.currentUser) throw new Error("auth/no-current-user");

  const batch = db.batch();
  const stamp = nowIso();
  batch.update(db.collection("venues").doc(venue.id), {
    registrationStatus: "active",
    updatedAt: stamp,
  });
  batch.update(db.collection("hostProfiles").doc(auth.currentUser.uid), {
    registrationStatus: "active",
    updatedAt: stamp,
  });
  await batch.commit();
}

export async function deleteVenue(id) {
  const { db } = await getFirebaseServices();
  const ref = db.collection("venues").doc(id);
  const snap = await ref.get();
  if (snap.exists && snap.data().custom) await ref.delete();
}

// ---------------------------------------------------------------------- Konto

export async function getAccount() {
  const user = await ensureGuestUser();
  const { guestDb } = await getFirebaseServices();
  const profileSnap = await guestDb.collection("guests").doc(user.uid).get();
  const reservationsSnap = await guestDb
    .collection("reservations")
    .where("guestUid", "==", user.uid)
    .get();

  if (!profileSnap.exists && reservationsSnap.empty) return null;
  const reservations = reservationsSnap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => String(a.dateKey || "").localeCompare(String(b.dateKey || "")) || String(a.slot || "").localeCompare(String(b.slot || "")));

  return {
    profile: profileSnap.exists ? profileSnap.data().profile || null : null,
    res: reservations,
  };
}

export async function setAccount(account) {
  const user = await ensureGuestUser();
  const { guestDb } = await getFirebaseServices();
  const db = dbForTransactionOr(guestDb);
  await setDoc(
    db.collection("guests").doc(user.uid),
    {
      profile: account?.profile || null,
      guestUid: user.uid,
      updatedAt: nowIso(),
    },
    { merge: true },
  );
}

// -------------------------------------------------------------- Reservierungen

export async function listReservations(venueId) {
  const { db } = await getFirebaseServices();
  const snap = await db.collection("reservations").where("locId", "==", venueId).get();
  return snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || "")));
}

export async function addReservation(res) {
  const user = await ensureGuestUser();
  const { guestDb } = await getFirebaseServices();
  const db = dbForTransactionOr(guestDb);
  await setDoc(
    db.collection("reservations").doc(res.id),
    { ...clean(res), id: res.id, guestUid: user.uid, createdAt: res.createdAt || nowIso() },
  );
}

export async function removeReservation(venueId, resId) {
  const services = await getFirebaseServices();
  const targetDb = activeTransaction
    ? activeTransaction.db
    : services.auth.currentUser
      ? services.db
      : services.guestDb;
  if (!activeTransaction && !services.auth.currentUser) await ensureGuestUser();

  const ref = targetDb.collection("reservations").doc(resId);
  const snap = await getDoc(ref);
  if (!snap.exists) return;
  if (snap.data().locId !== venueId) throw new Error("Reservierung gehört nicht zu diesem Betrieb.");
  await deleteDoc(ref);
}

// ------------------------------------------------------------------- Belegung

const occupancyId = (venueId, dateKey) => `${encodeURIComponent(venueId)}__${dateKey}`;

export async function getOccupancy(venueId, dateKey) {
  const { db } = await getFirebaseServices();
  const targetDb = dbForTransactionOr(db);
  const snap = await getDoc(targetDb.collection("occupancy").doc(occupancyId(venueId, dateKey)));
  return snap.exists ? snap.data().slots || {} : {};
}

export async function setOccupancy(venueId, dateKey, occ) {
  const services = await getFirebaseServices();
  if (activeTransaction) {
    await setDoc(
      activeTransaction.db.collection("occupancy").doc(occupancyId(venueId, dateKey)),
      { venueId, dateKey, slots: clean(occ || {}), updatedAt: nowIso() },
    );
    return;
  }
  const targetDb = services.auth.currentUser ? services.db : services.guestDb;
  if (!services.auth.currentUser) await ensureGuestUser();
  await targetDb.collection("occupancy").doc(occupancyId(venueId, dateKey)).set({
    venueId,
    dateKey,
    slots: clean(occ || {}),
    updatedAt: nowIso(),
  });
}

// ---------------------------------------------------------------- Benachrichtigungen

export async function listNotifications(venueId) {
  const { db } = await getFirebaseServices();
  const snap = await db.collection("notifications").where("venueId", "==", venueId).get();
  return snap.docs
    .map((doc) => {
      const row = doc.data();
      return {
        id: doc.id,
        an: row.recipient || row.an || "",
        betreff: row.subject || row.betreff || "",
        lines: row.lines || [],
        createdAt: row.createdAt || "",
      };
    })
    .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
}

export async function addNotification(item) {
  const user = await ensureGuestUser();
  const { guestDb } = await getFirebaseServices();
  await guestDb.collection("notifications").doc(item.id).set({
    venueId: item.venue_id || item.venueId,
    recipient: item.recipient || item.an || "",
    subject: item.subject || item.betreff || "",
    lines: item.lines || [],
    createdAt: item.createdAt || nowIso(),
    createdByUid: user.uid,
  });
}

export async function removeNotification(venueId, id) {
  const { db } = await getFirebaseServices();
  const ref = db.collection("notifications").doc(id);
  const snap = await ref.get();
  if (!snap.exists) return;
  if (snap.data().venueId !== venueId) throw new Error("Benachrichtigung gehört nicht zu diesem Betrieb.");
  await ref.delete();
}

// --------------------------------------------------------------------- Zugänge

export async function signInHost(email, password) {
  const { auth, db } = await getFirebaseServices();
  const credential = await auth.signInWithEmailAndPassword(normalizeEmail(email), password);
  const profile = await db.collection("hostProfiles").doc(credential.user.uid).get();
  if (!profile.exists) {
    await auth.signOut();
    throw new Error("HOST_PROFILE_NOT_FOUND");
  }
  return {
    uid: credential.user.uid,
    email: credential.user.email,
    betriebId: profile.data().betriebId,
    inhaber: profile.data().inhaber || "",
  };
}

export async function createHostAccount(email, password) {
  const { auth } = await getFirebaseServices();
  const credential = await auth.createUserWithEmailAndPassword(normalizeEmail(email), password);
  return { uid: credential.user.uid, email: credential.user.email };
}

// Saves the complete host registration as one Firestore transaction.
// The password is intentionally never written to Firestore; Firebase Auth
// securely owns host credentials.
export async function saveHostRegistration({ venue, registration, profile }) {
  const { db, auth } = await getFirebaseServices();
  const user = auth.currentUser;
  if (!user) throw new Error("auth/no-current-user");
  if (!venue?.id) throw new Error("Betrieb-ID fehlt.");

  const registrationId = registration?.id || user.uid;
  const profileRef = db.collection("hostProfiles").doc(user.uid);
  const venueRef = db.collection("venues").doc(venue.id);
  const registrationRef = db.collection("registrations").doc(registrationId);
  const counterRef = db.collection("settings").doc("regCounter");
  const createdAt = registration?.createdAt || nowIso();

  return db.runTransaction(async (transaction) => {
    // Firestore requires all transaction reads before transaction writes.
    const counterSnap = await transaction.get(counterRef);
    const counterValue = Number(counterSnap.exists ? counterSnap.data().value : 0) + 1;
    const regCode = `REG-${new Date().getFullYear()}-${String(counterValue).padStart(5, "0")}`;

    transaction.set(counterRef, {
      value: counterValue,
      updatedAt: nowIso(),
    });

    transaction.set(profileRef, clean({
      uid: user.uid,
      email: user.email,
      betriebId: venue.id,
      inhaber: profile?.inhaber || registration?.inhaber || "",
      registrationId,
      registrationStatus: "pending",
      createdAt: profile?.createdAt || createdAt,
      updatedAt: nowIso(),
    }));

    transaction.set(venueRef, clean({
      ...venue,
      id: venue.id,
      hostUid: user.uid,
      email: user.email,
      regCode,
      registrationId,
      registrationStatus: "pending",
      createdAt: venue.createdAt || createdAt,
      updatedAt: nowIso(),
    }));

    transaction.set(registrationRef, clean({
      ...registration,
      id: registrationId,
      betriebId: venue.id,
      hostUid: user.uid,
      createdByUid: user.uid,
      email: user.email,
      regCode,
      status: "pending",
      createdAt,
      submittedAt: createdAt,
      updatedAt: nowIso(),
    }));

    return { registrationId, regCode };
  });
}

export async function deleteCurrentHostAccount() {
  const { auth, db } = await getFirebaseServices();
  const user = auth.currentUser;
  if (!user) return;
  try {
    await db.collection("hostProfiles").doc(user.uid).delete();
  } catch {}
  await user.delete();
}

export async function reauthenticateHost(currentPassword) {
  const { firebase, auth } = await getFirebaseServices();
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error("auth/no-current-user");
  const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
  await user.reauthenticateWithCredential(credential);
  return user;
}

export async function updateHostPassword(newPassword) {
  const { auth } = await getFirebaseServices();
  if (!auth.currentUser) throw new Error("auth/no-current-user");
  await auth.currentUser.updatePassword(newPassword);
}

export async function changeHostPassword(currentPassword, newPassword) {
  await reauthenticateHost(currentPassword);
  await updateHostPassword(newPassword);
}

export async function getHosts() {
  const { db, auth } = await getFirebaseServices();
  const user = await waitForHostAuth();
  if (!user) return {};
  const hosts = {};
  try {
    const snap = await db.collection("hostProfiles").get();
    snap.docs.forEach((doc) => {
      const data = doc.data();
      hosts[normalizeEmail(data.email)] = { ...data, uid: doc.id };
    });
    return hosts;
  } catch {
    const own = await db.collection("hostProfiles").doc(auth.currentUser.uid).get();
    if (own.exists) {
      const data = own.data();
      hosts[normalizeEmail(data.email)] = { ...data, uid: own.id };
    }
    return hosts;
  }
}

export async function upsertHost(host) {
  const { db, auth } = await getFirebaseServices();
  if (!auth.currentUser) throw new Error("auth/no-current-user");
  await db.collection("hostProfiles").doc(auth.currentUser.uid).set(
    {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      betriebId: host.betriebId,
      inhaber: host.inhaber || "",
      updatedAt: nowIso(),
    },
    { merge: true },
  );
}

export async function getSession() {
  const { db } = await getFirebaseServices();
  const user = await waitForHostAuth();
  if (!user) return null;
  const snap = await db.collection("hostProfiles").doc(user.uid).get();
  if (!snap.exists) return null;
  return { uid: user.uid, email: user.email, betriebId: snap.data().betriebId, inhaber: snap.data().inhaber || "" };
}

export async function setSession(session) {
  const { auth } = await getFirebaseServices();
  if (!session) await auth.signOut();
}

// --------------------------------------------------------------- Registrierungen

export async function listRegistrations() {
  const { db } = await getFirebaseServices();
  const snap = await db.collection("registrations").get();
  return snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || "")));
}

export async function addRegistration(reg) {
  const { db, auth } = await getFirebaseServices();
  if (!auth.currentUser) throw new Error("auth/no-current-user");
  await db.collection("registrations").doc(reg.id).set({
    ...clean(reg),
    id: reg.id,
    createdByUid: auth.currentUser.uid,
    createdAt: reg.createdAt || nowIso(),
  });
}

// ----------------------------------------------------------- E-Mail-Vorlagen

function defaultEmailTemplate(key, lang) {
  const template = EMAIL_TEMPLATE_SEEDS.find((item) => item.key === key && item.lang === lang);
  return template ? { subject: template.subject, lines: template.lines } : null;
}

export async function getEmailTemplate(key, lang) {
  const { db } = await getFirebaseServices();
  const id = encodeURIComponent(`${key}__${lang}`);
  try {
    const snap = await db.collection("emailTemplates").doc(id).get();
    if (snap.exists) return { subject: snap.data().subject, lines: snap.data().lines || [] };
  } catch (error) {
    console.warn("Firebase-E-Mail-Vorlage nicht verfügbar; Standardvorlage wird verwendet.", error);
  }
  return defaultEmailTemplate(key, lang);
}

export async function setEmailTemplate(key, lang, subject, lines) {
  const { db } = await getFirebaseServices();
  const id = encodeURIComponent(`${key}__${lang}`);
  await db.collection("emailTemplates").doc(id).set({ key, lang, subject, lines, updatedAt: nowIso() });
}

// ---------------------------------------------------------- Wartung & Backup

export async function resetAll() {
  const user = await ensureGuestUser();
  const { guestDb, guestAuth, auth } = await getFirebaseServices();
  const accountRef = guestDb.collection("guests").doc(user.uid);
  const reservations = await guestDb.collection("reservations").where("guestUid", "==", user.uid).get();
  const batch = guestDb.batch();
  batch.delete(accountRef);
  reservations.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  Object.keys(window.localStorage)
    .filter((key) => key.startsWith(LOCAL_PREFIX))
    .forEach((key) => window.localStorage.removeItem(key));
  await Promise.allSettled([guestAuth.signOut(), auth.signOut()]);
}

export async function downloadBackup() {
  const data = {
    exportedAt: nowIso(),
    format: "mischtisch-firebase-json-v1",
    venues: await getVenues(),
    account: await getAccount(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mischtisch-sachsen-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function restoreBackup(file) {
  const data = JSON.parse(await file.text());
  if (data.format !== "mischtisch-firebase-json-v1") throw new Error("Ungültiges Firebase-Backupformat.");
  for (const venue of data.venues || []) await upsertVenue(venue);
  if (data.account) {
    await setAccount(data.account);
    for (const reservation of data.account.res || []) await addReservation(reservation);
  }
  return true;
}

// Firestore transaction used by guest booking/cancellation paths. Writes are
// queued until all reads have completed, satisfying Firestore transaction rules.
export async function withTransaction(fn) {
  if (activeTransaction) return fn();
  await ensureGuestUser();
  const { guestDb } = await getFirebaseServices();
  return guestDb.runTransaction(async (transaction) => {
    const previous = activeTransaction;
    activeTransaction = { transaction, db: guestDb, pending: [] };
    try {
      const output = await fn();
      for (const op of activeTransaction.pending) {
        if (op.type === "set") {
          if (op.options) transaction.set(op.ref, op.data, op.options);
          else transaction.set(op.ref, op.data);
        } else {
          transaction.delete(op.ref);
        }
      }
      return output;
    } finally {
      activeTransaction = previous;
    }
  });
}
