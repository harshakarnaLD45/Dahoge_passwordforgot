// Zentrale Routen: ersetzt die Seiten-State-Machine der Legacy-Fassung (hs im Bundle).
// Jede Route entspricht genau einer Seite des Original-Bundles; Parameter und
// Navigation übernehmen, was dort über setState + Callbacks lief.
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useApp } from "../Context/AppContext";
import { HomePage } from "../Pages/HomePage";
import { VenueDetail } from "../Pages/VenueDetail";
// MySeats ist derzeit ausgeblendet (Route unten auskommentiert); bei
// Reaktivierung hier wieder importieren: import { MySeats } from "../Pages/MySeats";
import { HostPage } from "../Pages/HostPage";
import { TischformPage } from "../Pages/TischformPage";
import { AboutPage } from "../Pages/AboutPage";
//import { LegalPage } from "../Pages/LegalPage";
import { CodesPage } from "../Pages/CodesPage";

import Impressum from "../Pages/Imprint/Imprint";
import  Privacy from "../Pages/privacypolicy/PrivacyPolicy";
import Terms from "../Pages/TermsUses/TermsUses";
import  Accessibility from "../Pages/Accessibility/Accessibility";
import HostPrivacy from "../Pages/PrivacyForHost/PrivacyForHost";

import HostTerms from "../Pages/TermsForHost/TermsForHost";

// Betriebsdetail: lädt den Betrieb aus der URL. Unbekannte IDs führen wie im
// Bundle (Detail nur bei vorhandenem Betrieb) zurück zur Startseite.
function DetailRoute() {
  const app = useApp();
  const navigate = useNavigate();
  const { id } = useParams();
  const loc = app.locations.find((l) => l.id === id);
  if (!loc) return <Navigate to="/" replace />;
  return (
    <VenueDetail
      key={loc.id}
      loc={loc}
      profile={app.account?.profile}
      onBooked={app.setAccount}
      onBack={() => navigate("/")}
      showToast={app.showToast}
      onRecht={() => navigate("/rechtliches")}
    />
  );
}

export default function AppRouter() {
  const app = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselect = searchParams.get("betrieb");

  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomePage
            locations={app.locations}
            onOpen={(loc) => navigate(`/betrieb/${loc.id}`)}
            onHost={() => navigate("/gastgeber")}
          />
        }
      />
      <Route path="/betrieb/:id" element={<DetailRoute />} />
      {/* <Route
        path="/meine-plaetze"
        element={
          <MySeats
            user={app.account}
            setUser={app.setAccount}
            onExplore={() => navigate("/")}
            showToast={app.showToast}
            locations={app.locations}
          />
        }
      /> */}
      <Route
        path="/gastgeber"
        element={
          <HostPage
            locations={app.locations}
            reload={app.reload}
            showToast={app.showToast}
            onAbout={() => navigate("/ueber")}
            onTischform={(id) =>
              navigate(id ? `/tischform?betrieb=${id}` : "/tischform")
            }
            onSeen={() => app.setHostUnseen(0)}
            onRecht={() => navigate("/rechtliches")}
            onCodes={() => navigate("/codes")}
            onHome={() => navigate("/")}
          />
        }
      />
      <Route
        path="/tischform"
        element={
          <TischformPage
            locations={app.locations}
            preselect={preselect}
            reload={app.reload}
            showToast={app.showToast}
            onDone={() => navigate("/gastgeber")}
            onBack={() => navigate("/gastgeber")}
          />
        }
      />
      <Route path="/ueber" element={<AboutPage />} />
      {/*<Route path="/rechtliches" element={<LegalPage />} />*/}

      <Route path="/impressum" element={<Impressum />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/rechtliches" element={<Terms />} />
      <Route path="/barrierefreiheit" element={<Accessibility />} />
      <Route path="/gastgeber-bedingungen" element={<HostTerms />} />
      <Route path="/gastgeber-datenschutz" element={<HostPrivacy />} />
      <Route
        path="/codes"
        element={
          <CodesPage
            locations={app.locations}
            onBack={() => navigate("/gastgeber")}
          />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
