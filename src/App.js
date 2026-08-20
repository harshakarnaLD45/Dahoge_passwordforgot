// App-Shell: Kopfzeile, Seiten (AppRouter), Fußzeile und Toast.
// Port der Legacy-Fassung (hs im Bundle) — Konto, Logo, Sprache und
// ungesehene Gastgeber-Reservierungen werden beim Start geladen.
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getAccount,
  getSetting,
  setSetting,
  getSession,
  listReservations,
} from "./Services/storage";
import { useLocations } from "./Hooks/useLocations";
import { DEHOGA_LOGO } from "./Utils/logo";
import { getLanguage, setLanguage, v } from "./Utils/i18n";
import { LogoPicker, LogoSwapButton } from "./Components/LogoPicker";
// import { TestGuide } from "./Components/TestGuide";
import { AppContext } from "./Context/AppContext";
import AppRouter from "./Routes/AppRouter";
import dehogaLogo from "./logo.svg";
import Footer from "./Components/Footer/Footer";

// Legacy-Seitenname aus der aktuellen Route (für aktive Nav-Buttons).
function pageFromPath(pathname) {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/betrieb/")) return "detail";
  if (pathname === "/meine-plaetze") return "mine";
  if (pathname === "/gastgeber") return "host";
  if (pathname === "/tischform") return "tischform";
  if (pathname === "/ueber") return "about";
  if (pathname === "/rechtliches") return "recht";
  if (pathname === "/codes") return "codes";
  return "home";
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const page = pageFromPath(location.pathname);

  const [account, setAccount] = useState(null);
  const [logo, setLogo] = useState(null);
  const [lang, setLang] = useState(getLanguage());
  const [toast, setToast] = useState(null);
  const [hostUnseen, setHostUnseen] = useState(0);
  const [locations, reload] = useLocations();

  // Sprachwechsel wie im Bundle: Modul-Sprache, html[lang] und Speicher.
  const changeLang = (next) => {
    setLanguage(next);
    setLang(next);
    document.documentElement.lang = next;
    setSetting("language", next);
  };

  // Beim Start gespeichertes Konto, Logo und Sprache laden.
  useEffect(() => {
    (async () => {
      try {
        const stored = await getAccount();
        if (stored) setAccount(stored);
      } catch (err) {
        console.warn("Konto konnte nicht geladen werden", err?.code || err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const stored = await getSetting("logo");
      if (stored) setLogo(stored);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const stored = await getSetting("language");
      if (stored === "en" || stored === "de") {
        setLanguage(stored);
        setLang(stored);
        document.documentElement.lang = stored;
        return;
      }
      if (!(navigator.language || "de").toLowerCase().startsWith("de")) {
        setLanguage("en");
        setLang("en");
        document.documentElement.lang = "en";
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const stored = await getSetting("logo");
      if (stored) setLogo(stored);
    })();
  }, []);

  // Ungelesene Reservierungen für den Gastgeber-Badge in der Navigation.
  useEffect(() => {
    (async () => {
      try {
        const session = await getSession();
        if (!session || !session.betriebId) return;
        const seen = await getSetting(`seen:${session.betriebId}`);
        const res = (await listReservations(session.betriebId)) || [];
        setHostUnseen(res.filter((r) => !seen || r.createdAt > seen).length);
      } catch { }
    })();
  }, []);

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  };

  // Navigation wie im Bundle: Seite wechseln und nach oben scrollen.
  const go = (path) => {
    navigate(path);
    window.scrollTo({ top: 0 });
  };

  // Seitenwechsel über andere Wege (z. B. onBack in Seiten) ebenfalls scrollen.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <AppContext.Provider
      value={{
        locations,
        reload,
        account,
        setAccount,
        showToast,
        hostUnseen,
        setHostUnseen,
      }}
    >
      <div className="mt-root">
        <header className="mt-wrap" style={{ paddingTop: 18 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              {/* <button
                onClick={() => go("/")}
                style={{ all: "unset", cursor: "pointer" }}
                aria-label={v("Zur Startseite", "Go to the home page")}
              >
                <div className="sign">
                  <div className="wordmark">
                    MISCH
                    <span className="dot">·</span>
                    TISCH
                  </div>
                  <div className="sub-sign">
                    {v("Sachsen · zentrale Platzreservierung", "Saxony · central seat booking")}
                  </div>
                </div>
              </button> */}
              <button
                type="button"
                onClick={() => go("/")}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                }}
                aria-label={v("Zur Startseite", "Go to the home page")}
              >
                <img
                  src={dehogaLogo}
                  alt="DEHOGA Sachsen"
                  style={{
                    width: 400,
                    height: "auto",
                    display: "block",
                  }}
                />
              </button>            </div>
            <nav
              style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}
              aria-label={v("Hauptnavigation", "Main navigation")}
            >
              <div
                className="sprache"
                role="group"
                aria-label={v("Sprache wählen", "Choose language")}
              >
                <button
                  className={lang === "de" ? "on" : ""}
                  onClick={() => changeLang("de")}
                  aria-pressed={lang === "de"}
                  lang="de"
                >
                  DE
                </button>
                <button
                  className={lang === "en" ? "on" : ""}
                  onClick={() => changeLang("en")}
                  aria-pressed={lang === "en"}
                  lang="en"
                >
                  EN
                </button>
              </div>
              <button
                className={`nav-btn ${page === "home" || page === "detail" ? "on" : ""}`}
                onClick={() => go("/")}
              >
                {v("Tische", "Tables")}
              </button>
              {/* <button
                className={`nav-btn ${page === "mine" ? "on" : ""}`}
                onClick={() => go("/meine-plaetze")}
              >
                {v("Meine Plätze", "My seats")}
                {accountSeats > 0 && <span className="nav-badge">{accountSeats}</span>}
              </button> */}
              <button
                className={`nav-btn ${page === "host" ? "on" : ""}`}
                onClick={() => go("/gastgeber")}
              >
                {v("Gastgeber", "Hosts")}
                {hostUnseen > 0 && <span className="nav-badge">{hostUnseen}</span>}
              </button>
              <button
                className={`nav-btn ${page === "about" ? "on" : ""}`}
                onClick={() => go("/ueber")}
              >
                {v("Über", "About")}
              </button>
              {/*<button
                className={`nav-btn ${page === "recht" ? "on" : ""}`}
                onClick={() => go("/rechtliches")}
              >
                {v("Rechtliches", "Legal")}
              </button>
              */}
            </nav>
          </div>

        </header>

        <AppRouter />

       
<Footer />

        {toast && (
          <div className="toast" role="status">
            {toast}
          </div>
        )}
      </div>
      {/* <TestGuide /> */}
    </AppContext.Provider>
  );
}

export default App;
