import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "./Styles/index.css";
import "./Styles/testguide.css";
import App from "./App";
import { initFirebase } from "./Services/firebase";

const root = ReactDOM.createRoot(document.getElementById("root"));

function FirebaseSetupError({ error }) {
  return (
    <main style={{ maxWidth: 760, margin: "48px auto", padding: 24, fontFamily: "system-ui" }}>
      <h1>Firebase-Konfiguration fehlt</h1>
      <p>{error.message}</p>
      <p>
        Kopieren Sie <code>.env.example</code> nach <code>.env</code>, tragen Sie die Web-App-Werte aus
        der Firebase Console ein und starten Sie die Anwendung neu.
      </p>
    </main>
  );
}

initFirebase()
  .then(() => {
    root.render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );
  })
  .catch((error) => {
    console.error("Firebase-Initialisierung fehlgeschlagen", error);
    root.render(<FirebaseSetupError error={error} />);
  });
