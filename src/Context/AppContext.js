import { createContext, useContext } from "react";

// Globaler App-Zustand: Konto (mt-konto), Sprache, Verbandslogo und Toast.
// Wird von App.js bereitgestellt; Seiten und Bausteine greifen über useApp() zu.
export const AppContext = createContext(null);

export function useApp() {
  return useContext(AppContext);
}
