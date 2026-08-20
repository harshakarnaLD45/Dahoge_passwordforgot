// Anmelden (jm) und Registrieren (Hm) für den Gastgeber-Bereich.
import { useState } from "react";
import { v } from "../Utils/i18n";
import { isEmail } from "../Utils/validate";
import { slugify } from "../Utils/strings";
import {
  activateRegistration,
  createHostAccount,
  deleteCurrentHostAccount,
  findVenueByHostUid,
  saveHostRegistration,
  setSession,
  signInHost,
} from "../Services/storage";
import { buildRegistrationMails } from "../Services/email";
import {
  sendHostPasswordResetEmail,
  sendRegistrationEmails,
} from "../Services/mailer";
import { REGIONS, VENUE_TYPES } from "../Services/data";

// Automatische Freischaltung nach erfolgreichem Login: findet den Betrieb des
// Hosts und setzt ihn (und das Profil) auf "active". Blockiert die Anmeldung
// nie — ein einziger Versuch; schlägt er fehl, bleibt der Status "pending".
async function activateOnLogin(session) {
  try {
    const venue = await findVenueByHostUid(session.uid);
    if (!venue) {
      console.warn("auto-activate: kein Betrieb für UID", session.uid);
      return;
    }
    if (venue.registrationStatus === "active") return;
    await activateRegistration(venue);
  } catch (err) {
    console.warn(
      "auto-activate: Fehler — Status bleibt 'pending':",
      err.message,
    );
  }
}

export function LoginForm({ onDone, showToast, onForgotPassword }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!isEmail(email) || pw.length === 0) {
      showToast(
        v(
          "Bitte E-Mail und Passwort eingeben.",
          "Please enter email and password.",
        ),
      );
      return;
    }

    setBusy(true);

    try {
      const session = await signInHost(email, pw);

      // Ältere "pending"-Betriebe beim Login automatisch freischalten —
      // Feuer-und-vergessen; Fehler blockieren die Anmeldung nicht.
      activateOnLogin(session);

      showToast(v("Willkommen zurück!", "Welcome back!"));

      onDone(session);
    } catch (err) {
      console.error(err);

      const invalid = [
        "auth/invalid-credential",
        "auth/invalid-login-credentials",
        "auth/user-not-found",
        "auth/wrong-password",
      ].includes(err?.code);

      showToast(
        invalid
          ? v(
              "E-Mail oder Passwort ist nicht korrekt.",
              "Email or password is incorrect.",
            )
          : v("Anmelden hat nicht geklappt.", "Sign-in failed."),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="card"
      style={{
        display: "grid",
        gap: 12,
      }}
    >
      <div className="form-grid">
        <div>
          <label className="label" htmlFor="li-em">
            {v("E-Mail-Adresse", "Email address")}
          </label>

          <input
            id="li-em"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={v(
              "reservierung@ihr-betrieb.example",
              "booking@your-venue.example",
            )}
          />
        </div>

        <div>
          <label className="label" htmlFor="li-pw">
            {v("Passwort", "Password")}
          </label>

          <input
            id="li-pw"
            type="password"
            className="input"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder="••••••"
          />
        </div>
      </div>

      {/* Forgot password — available to every host. */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <button
          type="button"
          onClick={() => {
            console.log("FORGOT BUTTON CLICKED");
            console.log("EMAIL:", email);
            console.log("onForgotPassword:", onForgotPassword);

            if (onForgotPassword) {
              onForgotPassword(email);
            }
          }}
          style={{
            all: "unset",
            cursor: "pointer",
            color: "var(--kobalt)",
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "underline",
          }}
        >
          {v("Passwort vergessen?", "Forgot password?")}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <button className="btn btn-primary" disabled={busy} onClick={submit}>
          {busy ? v("Wird geprüft …", "Checking …") : v("Anmelden", "Sign in")}
        </button>
      </div>
    </div>
  );
}

export function ForgotPasswordForm({ onBack, showToast, initialEmail = "" }) {
  console.log("FORGOT PASSWORD FORM RENDERED");
  console.log("INITIAL EMAIL:", initialEmail);
  const [email, setEmail] = useState(initialEmail);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [checking, setChecking] = useState(false);

  const apiBaseUrl = (process.env.REACT_APP_RESET_PASSWORD_API || "")
    .replace(/\/api\/reset-password\/?$/, "")
    .replace(/\/+$/, "");

  const verifyEmail = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!isEmail(normalizedEmail)) {
      setVerificationStatus(null);
      return;
    }

    setChecking(true);
    setVerificationStatus(null);

    try {
      const res = await fetch(
        `${apiBaseUrl}/api/check-registration`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalizedEmail }),
        },
      );
      const data = await res.json().catch(() => null);

      if (data?.status === "active") {
        setVerificationStatus("active");
        showToast(v("E-Mail bestätigt.", "Email verified."));
      } else if (data?.status === "pending") {
        setVerificationStatus("pending");
        showToast(
          v(
            "Ihre Registrierung wird noch geprüft — ein Passwort-Reset ist erst nach Freischaltung möglich.",
            "Your registration is still under review — password reset is only possible once it has been activated.",
          ),
        );
      } else if (data?.status === "not_found") {
        setVerificationStatus("not_found");
        showToast(
          v(
            "Für diese E-Mail-Adresse wurde kein Konto gefunden.",
            "No account was found for this email address.",
          ),
        );
      } else {
        // Server nicht erreichbar oder Fehlerantwort (unavailable/error):
        // kein "Abgelehnt" anzeigen, nur neutral informieren.
        setVerificationStatus(null);
        showToast(
          v(
            "Die Prüfung ist gerade nicht möglich — bitte später erneut versuchen.",
            "Verification is currently unavailable — please try again later.",
          ),
        );
      }
    } catch (err) {
      console.error("Verification check error:", err);
      setVerificationStatus(null);
      showToast(
        v(
          "Die Prüfung ist gerade nicht möglich — bitte später erneut versuchen.",
          "Verification is currently unavailable — please try again later.",
        ),
      );
    } finally {
      setChecking(false);
    }
  };

  const submit = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!isEmail(normalizedEmail)) {
      showToast(
        v(
          "Bitte eine gültige E-Mail-Adresse eingeben.",
          "Please enter a valid email address.",
        ),
      );
      return;
    }

    setBusy(true);

    try {
      await sendHostPasswordResetEmail(normalizedEmail);

      setSent(true);

      showToast(
        v(
          "Eine E-Mail zum Zurücksetzen des Passworts wurde versendet.",
          "A password reset email has been sent.",
        ),
      );
    } catch (err) {
      const expectedCodes = [
        "auth/invalid-email",
        "auth/user-not-found",
        "registration/pending",
      ];
      if (expectedCodes.includes(err?.code)) {
        console.warn("Password reset rejected:", err?.code);
      } else {
        console.error(err);
      }

      if (err?.code === "auth/invalid-email") {
        showToast(
          v(
            "Die E-Mail-Adresse ist ungültig.",
            "The email address is invalid.",
          ),
        );
      } else if (err?.code === "auth/user-not-found") {
        showToast(
          v(
            "Für diese E-Mail-Adresse wurde kein Konto gefunden.",
            "No account was found for this email address.",
          ),
        );
      } else if (err?.code === "registration/pending") {
        showToast(
          v(
            "Ihre Registrierung wird noch geprüft — ein Passwort-Reset ist erst nach Freischaltung möglich.",
            "Your registration is still under review — password reset is only possible once it has been activated.",
          ),
        );
      } else {
        showToast(
          v(
            "Das Zurücksetzen des Passworts ist fehlgeschlagen.",
            "Password reset failed.",
          ),
        );
      }
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div
        className="card"
        style={{
          display: "grid",
          gap: 16,
          textAlign: "center",
          padding: "28px 22px",
        }}
      >
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: "50%",
            background: "var(--kobalt)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            margin: "0 auto",
          }}
        >
          ✓
        </div>

        <div
          className="f-display"
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: "var(--kobalt-dunkel)",
          }}
        >
          {v("E-Mail wurde versendet", "Email sent")}
        </div>

        <p
          style={{
            color: "#3A4258",
            margin: 0,
          }}
        >
          {v(
            "Wenn ein Konto mit dieser E-Mail-Adresse existiert, erhalten Sie eine E-Mail mit einem Link zum Zurücksetzen Ihres Passworts.",
            "If an account exists with this email address, you will receive an email with a link to reset your password.",
          )}
        </p>

        <button type="button" className="btn btn-ghost" onClick={onBack}>
          {v("Zur Anmeldung", "Back to sign in")}
        </button>
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{
        display: "grid",
        gap: 16,
      }}
    >
      <div>
        <h2
          className="f-display"
          style={{
            margin: "0 0 8px",
            color: "var(--kobalt-dunkel)",
          }}
        >
          {v("Passwort zurücksetzen", "Reset password")}
        </h2>

        <p
          style={{
            margin: 0,
            color: "#3A4258",
          }}
        >
          {v(
            "Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.",
            "Enter your email address. We will send you a link to reset your password.",
          )}
        </p>
      </div>

      <div>
        <label className="label" htmlFor="forgot-email">
          {v("E-Mail-Adresse", "Email address")}
        </label>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            id="forgot-email"
            type="email"
            className="input"
            style={{ flex: 1 }}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (verificationStatus) setVerificationStatus(null);
            }}
            onBlur={() => verifyEmail()}
            onKeyDown={(e) => {
              if (e.key === "Enter" && verificationStatus === "active") submit();
            }}
            placeholder={v(
              "reservierung@ihr-betrieb.example",
              "booking@your-venue.example",
            )}
          />

          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              whiteSpace: "nowrap",
              color: checking
                ? "var(--honig)"
                : verificationStatus === "active"
                  ? "#1b7a3d"
                  : verificationStatus
                    ? "#b4443c"
                    : "transparent",
              minWidth: 60,
            }}
          >
            {checking
              ? v("Prüfe …", "Checking …")
              : verificationStatus === "active"
                ? "✓ " + v("Bestätigt", "Verified")
                : verificationStatus
                  ? v("Abgelehnt", "Rejected")
                  : "."}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          {v("Zurück", "Back")}
        </button>

        <button
          type="button"
          className="btn btn-primary"
          disabled={busy || verificationStatus !== "active"}
          onClick={submit}
        >
          {busy
            ? v("Wird gesendet …", "Sending …")
            : v("Reset-Link senden", "Send reset link")}
        </button>
      </div>
    </div>
  );
}
export function RegisterForm({ onHome, reload, showToast, onAbout, onRecht }) {
  const [form, setForm] = useState({
    name: "",
    strasse: "",
    plz: "",
    city: "",
    region: REGIONS[0],
    type: VENUE_TYPES[0],
    inhaber: "",
    email: "",
    telefon: "",
    desc: "",
  });
  const [nv, setNv] = useState(false);
  const [ds, setDs] = useState(false);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const [confirmMail, setConfirmMail] = useState({
    sent: false,
    error: false,
    preview: null,
  });

  const field = (key) => (ev) =>
    setForm((f) => ({ ...f, [key]: ev.target.value }));

  const errs = {
    name: form.name.trim().length < 3,
    strasse: form.strasse.trim().length < 3,
    plz: form.plz.trim().length < 4,
    city: form.city.trim().length < 2,
    inhaber: form.inhaber.trim().length < 3,
    email: !isEmail(form.email),

    nv: !nv,
    ds: !ds,
  };
  const valid = !Object.values(errs).some(Boolean);
  const inputCls = (key) => "input" + (tried && errs[key] ? " field-err" : "");
  const generatedPassword = Array.from({ length: 14 }, () =>
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$".charAt(
      Math.floor(Math.random() * 62),
    ),
  ).join("");
  const submit = async () => {
    setTried(true);
    if (!valid) return;
    setBusy(true);
    let accountCreated = false;
    let registrationSaved = false;
    try {
      const email = form.email.trim().toLowerCase();
      const id = `b-${slugify(form.name + "-" + form.city)}-${Date.now() % 1e5}`;
      const createdAt = new Date().toISOString();

      // Firebase Authentication stores the password. It is never copied into Firestore.
      const session = await createHostAccount(email, generatedPassword);
      accountCreated = true;
      // Test mode: do not create a Firebase Authentication account

      // const session = {
      //   uid: `TEST-${Date.now()}`,
      //   email,
      // };
      const venue = {
        id,
        hostUid: session.uid,
        custom: true,
        name: form.name.trim(),
        city: form.city.trim(),
        strasse: form.strasse.trim(),
        plz: form.plz.trim(),
        inhaber: form.inhaber.trim(),
        region: form.region,
        type: form.type,
        email,
        telefon: form.telefon.trim(),
        desc:
          form.desc.trim() ||
          v("Ein Tisch, der mischt.", "A table that mixes."),
        createdAt,
      };

      const anschrift =
        [venue.strasse, [venue.plz, venue.city].filter(Boolean).join(" ")]
          .filter(Boolean)
          .join(", ") || venue.city;
      const mischtisch = v(
        "Plätze, Tage und Uhrzeiten werden im Gastgeber-Bereich festgelegt",
        "Seats, days and times will be set in the host area",
      );

      // Prepare the confirmation messages before committing the registration.
      // No email is sent until the Firestore transaction succeeds.
      const mails = await buildRegistrationMails({
        venue,
        email,
        inhaber: form.inhaber.trim(),
        telefon: form.telefon.trim(),
        isNew: true,
        anschrift,
        mischtisch,
      });

      const reg = {
        id: session.uid,
        betriebId: id,
        name: venue.name,
        city: venue.city,
        strasse: venue.strasse || "",
        plz: venue.plz || "",
        region: venue.region,
        type: venue.type,
        inhaber: form.inhaber.trim(),
        email,
        telefon: form.telefon.trim(),
        desc: form.desc.trim(),
        neuerEintrag: true,
        status: "pending",
        consents: {
          nutzungsvereinbarung: nv,
          datenschutz: ds,
        },
        createdAt,
      };

      // Store host profile, venue and registration together. Either all records
      // are committed to Firestore or none of them are.
      const saved = await saveHostRegistration({
        venue,
        registration: reg,
        profile: {
          inhaber: form.inhaber.trim(),
          createdAt,
        },
      });
      //       const saved = {
      //   regCode: `TEST-${Date.now()}`,
      //   registrationId: `TEST-${Date.now()}`,
      // };
      registrationSaved = true;
      const regCode = saved.regCode;
      venue.regCode = regCode;
      venue.registrationId = saved.registrationId;
      reg.regCode = regCode;

      // createUserWithEmailAndPassword sign-in happened at createHostAccount.
      // Sign out NOW, before the success screen appears, so clicking "Zur Startseite →"
      // never navigates away while the user is still authenticated.
      try {
        await setSession(null);
      } catch (signOutError) {
        console.warn(
          "Abmeldung nach Registrierung fehlgeschlagen",
          signOutError,
        );
      }

      const registrationNumberLine = v(
        `Registrierungsnummer: ${regCode}`,
        `Registration number: ${regCode}`,
      );
      const displayMails = mails.map((mail, index) =>
        index === 2
          ? {
              ...mail,
              lines: [
                mail.lines[0],
                registrationNumberLine,
                ...mail.lines.slice(1),
              ],
            }
          : mail,
      );

      setDone({
        betrieb: venue,
        mails: displayMails,
      });
      try {
        reload?.();
      } catch (reloadError) {
        console.warn(
          "Ansicht konnte nach der Firebase-Speicherung nicht neu geladen werden",
          reloadError,
        );
      }

      try {
        const result = await sendRegistrationEmails({
          hostName: form.inhaber.trim(),
          companyName: venue.name,
          email,
          phone: form.telefon?.trim() || "—",
          street: venue.strasse || "—",
          postalCode: venue.plz || "—",
          city: venue.city || "—",
          venueType: venue.type || "—",
          region: venue.region || "—",
          registrationDate: new Date(createdAt).toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
          // regCode is the single source of truth for the registration number.
          regCode,
          accountEmail: email,
          temporaryPassword: generatedPassword,
          credentialsCreatedAt: new Date(createdAt).toLocaleDateString(
            "de-DE",
            {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            },
          ),
        });

        if (result?.hostEmail?.success) {
          setConfirmMail({ sent: true, error: false, preview: null });
          showToast(
            v(
              "Bestätigungs-E-Mail wurde versendet.",
              "Confirmation email sent.",
            ),
          );
        } else {
          setConfirmMail({ sent: false, error: true, preview: null });
          showToast(
            v(
              "Die Bestätigungs-E-Mail an den Gastgeber konnte nicht versendet werden.",
              "The confirmation email to the host could not be sent.",
            ),
          );
        }

        if (!result?.verificationEmail?.success) {
          console.error(
            "Prüf-E-Mail fehlgeschlagen:",
            result?.verificationEmail?.error,
          );
          showToast(
            v(
              "Die Prüf-E-Mail an die Organisation konnte nicht versendet werden.",
              "The verification email to the organization could not be sent.",
            ),
          );
        }

        if (!result?.internalEmail?.success) {
          console.error(
            "Interne E-Mail fehlgeschlagen:",
            result?.internalEmail?.error,
          );
        }
      } catch (emailErr) {
        console.error(emailErr);
        setConfirmMail({ sent: false, error: true, preview: null });
        showToast(
          v(
            "Registrierung gespeichert, aber die E-Mails konnten nicht automatisch versendet werden.",
            "Registration saved, but the emails could not be sent automatically.",
          ),
        );
      }

      showToast(
        v(
          "Registrierung gespeichert — Ihre Daten liegen jetzt in Firebase.",
          "Registration saved — your data is saved and under review with our team.",
        ),
      );
      window.scrollTo({ top: 0 });
    } catch (err) {
      console.error(err);
      if (accountCreated && !registrationSaved) {
        try {
          await deleteCurrentHostAccount();
        } catch (rollbackError) {
          console.error(
            "Firebase-Registrierung konnte nicht vollständig zurückgerollt werden",
            rollbackError,
          );
        }
      }
      showToast(
        registrationSaved
          ? v(
              "Die Registrierung ist in Firebase gespeichert, aber ein nachfolgender Schritt ist fehlgeschlagen.",
              "The registration is stored in Firebase, but a follow-up step failed.",
            )
          : err?.code === "auth/email-already-in-use"
            ? v(
                "Diese E-Mail ist bereits registriert — bitte anmelden.",
                "This email is already registered — please sign in.",
              )
            : err?.code === "permission-denied"
              ? v(
                  "Firebase hat das Speichern blockiert. Bitte die mitgelieferten Firestore-Regeln bereitstellen.",
                  "Firebase blocked the write. Please deploy the included Firestore rules.",
                )
              : v("Registrieren hat nicht geklappt.", "Registration failed."),
      );
    } finally {
      setBusy(false);
    }
  };
  if (done) {
    return (
      <div>
        <div
          className="card"
          style={{ textAlign: "center", padding: "28px 22px" }}
        >
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: "50%",
              background: "var(--kobalt)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              margin: "0 auto 12px",
            }}
          >
            ✓
          </div>
          <div
            className="f-display"
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: "var(--kobalt-dunkel)",
            }}
          >
            {v("Registrierung gespeichert", "Registration saved")}
          </div>
          <p
            style={{ color: "#3A4258", margin: "8px auto 0", maxWidth: "46ch" }}
          >
            {v("Der Zugang für", "The account for")} <b>{done.betrieb.name}</b>{" "}
            {v(
              "ist angelegt — Anmeldung künftig mit",
              "has been created — sign in from now on with",
            )}{" "}
            {done.betrieb.email}.{" "}
            {confirmMail.sent
              ? confirmMail.preview
                ? v(
                    "Die Bestätigung wurde im Testmodus erfasst — eine echte Zustellung erfordert gültige SMTP-Zugangsdaten.",
                    "The confirmation was captured in test mode — real delivery requires valid SMTP credentials.",
                  )
                : v(
                    "Eine Bestätigung wurde an Ihre E-Mail-Adresse gesendet.",
                    "A confirmation has been sent to your email address.",
                  )
              : confirmMail.error
                ? v(
                    "Die automatische Bestätigungs-E-Mail ist fehlgeschlagen — Sie können sie unten manuell senden.",
                    "The automatic confirmation email failed — you can send it manually below.",
                  )
                : v(
                    "Die Bestätigungs-E-Mail wird versendet …",
                    "The confirmation email is being sent …",
                  )}
          </p>
          <div
            style={{
              marginTop: 12,
              padding: "10px 14px",
              border: "1px solid var(--honig)",
              background: "#FBF4E4",
              borderRadius: 10,
              fontSize: 14,
              textAlign: "left",
            }}
          >
            <b>{v("Ihre Angaben werden jetzt geprüft.", "Under review :-")}</b>{" "}
            {v(
              "Sobald die Prüfung abgeschlossen ist, erhalten Sie eine E-Mail von unserem Team.",
              "Once the review is complete, you will receive an email from our team.",
            )}
          </div>
          {confirmMail.preview && (
            <p className="notice" style={{ marginTop: 8 }}>
              {v(
                "Testmodus: Die E-Mail wurde nicht wirklich zugestellt — Vorschau öffnen:",
                "Test mode: the email was not actually delivered — open the preview:",
              )}{" "}
              <a href={confirmMail.preview} target="_blank" rel="noreferrer">
                {v("Testmail ansehen", "View test email")}
              </a>
            </p>
          )}
        </div>
        {/* <div className="eyebrow" style={{ margin: "22px 0 8px" }}>
          {v("Anmeldung absenden", "Send registration")}
        </div>
        <div style={{ display: "grid", gap: 14 }}>
          {done.mails.map((m, i) => (
            <EmailCard key={i} {...m} />
          ))}
        </div>
        <div
          style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}
        >
          <a
            className="btn btn-primary"
            style={{ textDecoration: "none", display: "inline-block" }}
            href={mailtoHref(done.mails[0])}
          >
            {v("An DEHOGA Sachsen senden", "Send to DEHOGA Sachsen")}
          </a>
          <a
            className="btn btn-primary"
            style={{ textDecoration: "none", display: "inline-block" }}
            href={mailtoHref(done.mails[1])}
          >
            {v("An Gastgeber AG senden", "Send to Gastgeber AG")}
          </a>
          <a
            className="btn btn-ghost"
            style={{ textDecoration: "none", display: "inline-block" }}
            href={mailtoHref(done.mails[2])}
          >
            {v("Bestätigung an mich", "Confirmation to me")}
          </a>
        </div>
        <p className="notice" style={{ marginTop: 10 }}>
          {v("Die Buttons öffnen Ihr E-Mail-Programm mit fertigem Text an", "The buttons open your email program with the finished text to")}{" "}
          {EMAIL_DEHOGA} {v("bzw.", "and")} {EMAIL_GASTGEBER_AG}.{" "}
          {v(
            "Bitte hängen Sie an die Mail an die Gastgeber AG die unterschriebene Nutzungsvereinbarung als PDF an — ohne sie ist die Teilnahme nicht abgeschlossen. Ihre Anmeldung selbst ist bereits gespeichert.",
            "Please attach the signed usage agreement as a PDF to the email to Gastgeber AG — without it the participation is not complete. Your registration itself is already saved.",
          )}
        </p> */}
        <div style={{ marginTop: 16 }}>
          <button className="btn btn-ghost" onClick={() => onHome && onHome()}>
            {v("Zur Startseite →", "Back to the home page →")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ display: "grid", gap: 16 }}>
      <div>
        <label className="label" htmlFor="rg-name">
          {v("Ihr Betrieb", "Your venue")}
        </label>
        <input
          id="rg-name"
          className={inputCls("name")}
          value={form.name}
          onChange={field("name")}
          placeholder={v("Gasthof Beispiel", "Example Inn")}
        />
      </div>
      <div className="form-grid">
        <div>
          <label className="label" htmlFor="rg-str">
            {v("Straße und Hausnummer *", "Street and number *")}
          </label>
          <input
            id="rg-str"
            className={inputCls("strasse")}
            value={form.strasse}
            onChange={field("strasse")}
            placeholder={v("Hauptstraße 1", "Main Street 1")}
          />
        </div>
        <div>
          <label className="label" htmlFor="rg-plz">
            {v("PLZ *", "Postcode *")}
          </label>
          <input
            id="rg-plz"
            className={inputCls("plz")}
            value={form.plz}
            onChange={field("plz")}
            placeholder="01067"
          />
        </div>
        <div>
          <label className="label" htmlFor="rg-city">
            {v("Ort *", "Town *")}
          </label>
          <input
            id="rg-city"
            className={inputCls("city")}
            value={form.city}
            onChange={field("city")}
            placeholder="Dresden"
          />
        </div>
        <div>
          <label className="label" htmlFor="rg-region">
            {v("Region", "Region")}
          </label>
          <select
            id="rg-region"
            className="input"
            value={form.region}
            onChange={field("region")}
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="rg-type">
            {v("Art des Betriebs", "Type of venue")}
          </label>
          <select
            id="rg-type"
            className="input"
            value={form.type}
            onChange={field("type")}
          >
            {VENUE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="rg-desc">
            {v(
              "Kurzbeschreibung (für Gäste sichtbar)",
              "Short description (visible to guests)",
            )}
          </label>
          <input
            id="rg-desc"
            className="input"
            value={form.desc}
            onChange={field("desc")}
            placeholder={v(
              "Was macht Ihren Mischtisch besonders?",
              "What makes your Mischtisch special?",
            )}
          />
        </div>
      </div>
      <div className="form-grid">
        <div>
          <label className="label" htmlFor="rg-inh">
            {v("Inhaber / Pächter *", "Owner / leaseholder *")}
          </label>
          <input
            id="rg-inh"
            className={inputCls("inhaber")}
            value={form.inhaber}
            onChange={field("inhaber")}
            placeholder={v("Vor- und Nachname", "First and last name")}
          />
        </div>
        <div>
          <label className="label" htmlFor="rg-em">
            {v(
              "E-Mail (Zugang & Bestätigungen) *",
              "Email (account & confirmations) *",
            )}
          </label>
          <input
            id="rg-em"
            type="email"
            className={inputCls("email")}
            value={form.email}
            onChange={field("email")}
            placeholder={v(
              "reservierung@ihr-betrieb.example",
              "booking@your-venue.example",
            )}
          />
        </div>
        <div>
          <label className="label" htmlFor="rg-tel">
            {v("Telefon (optional)", "Phone (optional)")}
          </label>
          <input
            id="rg-tel"
            type="tel"
            className="input"
            value={form.telefon}
            onChange={field("telefon")}
            placeholder={v("+49 351 1234567", "+49 351 1234567")}
          />
        </div>
      </div>
      <label
        style={{
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={nv}
          onChange={(e) => setNv(e.target.checked)}
          style={{ marginTop: 3 }}
        />
        <span>
          {v(
            "Ich habe die Nutzungsvereinbarung „Mischtisch“ gelesen und sende sie unterschrieben mit dem Betreff „MISCHTISCH in SACHSEN“ an den DEHOGA Bayern. *",
            "I have read the “Mischtisch” usage agreement and will send it signed with the subject “MISCHTISCH in SACHSEN” to DEHOGA Bayern. *",
          )}{" "}
          <button
            type="button"
            onClick={onAbout}
            style={{
              all: "unset",
              cursor: "pointer",
              color: "var(--kobalt)",
              fontWeight: 600,
              textDecoration: "underline",
            }}
          >
            {v("Zu den Schritten", "See the steps")}
          </button>
        </span>
      </label>
      <label
        style={{
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={ds}
          onChange={(e) => setDs(e.target.checked)}
          style={{ marginTop: 3 }}
        />
        <span>
          {v(
            "Ich bin einverstanden, dass die Angaben zu meinem Betrieb gespeichert und zur Anmeldung an den DEHOGA Sachsen und die Bayerische Gastgeber AG übermittelt werden. *",
            "I agree that the details of my venue are stored and transmitted to DEHOGA Sachsen and the Bayerische Gastgeber AG for the registration. *",
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
        <div style={{ color: "#B4443C", fontSize: 13.5 }}>
          {v(
            "Bitte alle Pflichtfelder (*) prüfen",
            "Please check all required fields (*)",
          )}
          {errs.nv
            ? v(
                " — bitte die Nutzungsvereinbarung bestätigen",
                " — please confirm the usage agreement",
              )
            : ""}
          {errs.ds
            ? v(
                " — bitte den Datenschutzhinweisen zustimmen",
                " — please agree to the privacy notice",
              )
            : ""}
          .
        </div>
      )}
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
            "Prototyp: bitte nur Beispieldaten verwenden.",
            "Prototype: please use sample data only.",
          )}
        </span>
        <button className="btn btn-primary" disabled={busy} onClick={submit}>
          {busy
            ? v("Wird registriert …", "Registering …")
            : v("Registrieren & loslegen", "Register & get started")}
        </button>
      </div>
    </div>
  );
}
