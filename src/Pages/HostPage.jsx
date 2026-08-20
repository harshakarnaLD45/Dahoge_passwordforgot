// Gastgeber-Bereich: Anmelden/Registrieren oder HostArea des eigenen Betriebs (Zm im Bundle).
import { useState, useEffect } from "react";
import { v } from "../Utils/i18n";
import { getSession, setSession as saveSession } from "../Services/storage";
import {
  LoginForm,
  RegisterForm,
  ForgotPasswordForm,
} from "../Components/AuthForms";
import { HostArea } from "../Components/HostArea";

export function HostPage({
  locations,
  reload,
  showToast,
  onAbout,
  onTischform,
  onSeen,
  onRecht,
  onCodes,
  onHome,
  onHostStateChange,
}) {
  const [session, setSession] = useState(undefined);
  const [mode, setMode] = useState("login");
  const [regBetrieb, setRegBetrieb] = useState(null);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);

useEffect(() => {
  let alive = true;

  (async () => {
    let s = null;

    try {
      s = await getSession();
    } catch (err) {
      console.warn(
        "Sitzung konnte nicht geladen werden",
        err?.code || err
      );
    }

    if (alive) {
      setSession(s || null);

      if (onHostStateChange) {
        onHostStateChange(!!s);
      }
    }
  })();

  return () => {
    alive = false;
  };
}, [onHostStateChange]);

 const onDone = (s, betrieb) => {
  if (betrieb) {
    setRegBetrieb(betrieb);
  }

  setSession(s);

  if (onHostStateChange) {
    onHostStateChange(!!s);
  }

  reload();
};

const logout = async () => {
  try {
    await saveSession(null);
  } catch {}

  setSession(null);

  if (onHostStateChange) {
    onHostStateChange(false);
  }

  showToast(
    v("Abgemeldet", "Signed out")
  );
};

  const renderAuth = (notice) => (
    <div
      className="mt-wrap"
      style={{ padding: "28px 20px 60px", maxWidth: 760 }}
    >
      <div className="eyebrow">
        {v("Für Gastronomie & Hotellerie", "For gastronomy & hospitality")}
      </div>
      <h2
        className="f-display"
        style={{
          fontSize: "clamp(26px,4.5vw,38px)",
          fontWeight: 600,
          margin: "6px 0 10px",
          color: "var(--kobalt-dunkel)",
        }}
      >
        {v("Gastgeber-Bereich", "Host area")}
      </h2>
      <p className="lead" style={{ marginBottom: 20 }}>
        {v(
          "Melden Sie sich an oder registrieren Sie Ihren Betrieb direkt hier: Mischtisch anlegen, Plätze, Tage und Uhrzeiten pflegen und alle Reservierungen mit den Kontaktdaten Ihrer Gäste einsehen.",
          "Sign in or register your venue right here: set up your Mischtisch, manage seats, days and times, and view all reservations with your guests' contact details.",
        )}
      </p>
      {notice && (
        <div
          className="card"
          style={{
            marginBottom: 14,
            borderColor: "var(--honig)",
            background: "#FDF6E7",
            fontSize: 14,
          }}
        >
          {notice}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button
          className={`chip ${mode === "login" ? "on" : ""}`}
          onClick={() => setMode("login")}
          aria-pressed={mode === "login"}
        >
          {v("Anmelden", "Sign in")}
        </button>
        <button
          className={`chip ${mode === "register" ? "on" : ""}`}
          onClick={() => setMode("register")}
          aria-pressed={mode === "register"}
        >
          {v("Neu registrieren", "Register")}
        </button>
      </div>
      {mode === "login" ? (
        forgotPassword ? (
          <ForgotPasswordForm
            initialEmail={forgotEmail}
            onBack={() => {
              setForgotPassword(false);
            }}
            showToast={showToast}
          />
        ) : (
          <>
            <LoginForm
              onDone={onDone}
              showToast={showToast}
              onForgotPassword={(email) => {
                setForgotEmail(email);
                setForgotPassword(true);
              }}
            />

            <p className="notice" style={{ marginTop: 10 }}>
              {v(
                "Noch kein Zugang? Oben auf „Neu registrieren“ wechseln — die Registrierung dauert keine zwei Minuten.",
                "No account yet? Switch to “Register” above — registration takes less than two minutes.",
              )}
            </p>
          </>
        )
      ) : (
        <RegisterForm
          reload={reload}
          onHome={onHome}
          showToast={showToast}
          onAbout={onAbout}
          onRecht={onRecht}
        />
      )}
      <div
        className="card"
        style={{
          marginTop: 14,
          background: "var(--kobalt)",
          border: "none",
          color: "#F1F3FB",
        }}
      >
        <div
          className="f-display"
          style={{ fontSize: 19, fontWeight: 600, marginBottom: 6 }}
        >
          {v("Offiziell mitmischen", "Join officially")}
        </div>
        <div style={{ fontSize: 14.5, opacity: 0.92 }}>
          {v(
            "Die Teilnahme läuft über die unterschriebene Nutzungsvereinbarung des DEHOGA Bayern — per E-Mail mit dem Betreff „MISCHTISCH in SACHSEN“ an info@gastgeber-ag.bayern. Danach folgen der Eintrag im Mischtisch-Finder und das Starterpaket vom DEHOGA Sachsen, der die Kosten für sächsische Betriebe übernimmt.",
            "Participation runs via the signed usage agreement of DEHOGA Bayern — by email with the subject “MISCHTISCH in SACHSEN” to info@gastgeber-ag.bayern. Afterwards follows the listing in the Mischtisch finder and the starter package from DEHOGA Sachsen, which covers the costs for Saxon businesses.",
          )}
        </div>
        <button
          className="btn btn-sm"
          style={{
            marginTop: 12,
            background: "transparent",
            border: "1.5px solid #F1F3FB",
            color: "#F1F3FB",
          }}
          onClick={onAbout}
        >
          {v("Alle Schritte ansehen", "See all steps")}
        </button>
      </div>
      {/* <div className="card" style={{ marginTop: 14 }}>
        <div style={{ fontSize: 14.5, color: "#3A4258" }}>
          <b>{v("Sie sind bereits Partnerbetrieb?", "Already a partner venue?")}</b>{" "}
          {v(
            "Für die Erstanmeldung brauchen Sie den Zugangscode, den der DEHOGA Sachsen mit dem Starterpaket verschickt. Er stellt sicher, dass nur Ihr Haus die Reservierungen und Gästedaten einsehen kann.",
            "For the initial sign-in you need the access code sent by DEHOGA Sachsen with the starter package. It ensures only your venue can view its reservations and guest data.",
          )}
        </div>
      </div>
      <p className="notice" style={{ marginTop: 12 }}>
        {v(
          "Zugangsdaten werden sicher über Firebase Authentication verwaltet.",
          "Host credentials are securely managed through Firebase Authentication.",
        )}
      </p> */}
    </div>
  );

  if (session === undefined) {
    return (
      <div className="mt-wrap" style={{ padding: "40px 20px 60px" }}>
        <span className="notice">
          {v("Gastgeber-Bereich wird geladen …", "Loading host area …")}
        </span>
      </div>
    );
  }

  if (session) {
    const loc =
      locations.find((l) => l.id === session.betriebId) ||
      (regBetrieb && regBetrieb.id === session.betriebId ? regBetrieb : null);
    return loc ? (
      <HostArea
        key={loc.id}
        loc={loc}
        session={session}
        onLogout={logout}
        reload={reload}
        showToast={showToast}
        onTischform={() => onTischform(loc.id)}
        onSeen={onSeen}
      />
    ) : (
      renderAuth(
        v(
          "Ihr Betrieb konnte nicht geladen werden — bitte erneut anmelden oder registrieren.",
          "Your venue could not be loaded — please sign in or register again.",
        ),
      )
    );
  }

  return renderAuth(null);
}
