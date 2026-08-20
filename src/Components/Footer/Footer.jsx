import React from "react";
import { NavLink } from "react-router-dom";
import logo from "../../logo.svg";
import { t } from "../../Utils/i18n";

import "./Footer.css";

const Footer = () => {
  //const { t } = useTranslation();

  return (
    <footer className="footer" role="contentinfo">
      <div className="mt-wrap footer-content">
        {/* ================================
            TOP ROW
            ================================ */}
        <div className="footer-top">
          {/* Logo */}
          <NavLink
            to="/"
            className="footer-logo-link"
            aria-label={t("footer.homeAria")}
          >
            <img src={logo} alt={t("footer.logoAlt")} className="footer-logo" />
          </NavLink>

          {/* Nav columns */}
          <div className="footer-nav-columns">
            <nav
              className="footer-nav-col"
              aria-label={t("footer.legalNavAria")}
            >
              <span className="footer-nav-heading">{t("footer.legal")}</span>

              <NavLink to="/impressum" className="footer-nav-link">
                {t("footer.imprint")}
              </NavLink>

              <NavLink to="/privacy" className="footer-nav-link">
                {t("footer.privacy")}
              </NavLink>

              <NavLink to="/rechtliches" className="footer-nav-link">
                {t("footer.terms")}
              </NavLink>

              <NavLink to="/barrierefreiheit" className="footer-nav-link">
                {t("footer.accessibility")}
              </NavLink>
            </nav>

            <nav
              className="footer-nav-col"
              aria-label={t("footer.hostNavAria")}
            >
              <span className="footer-nav-heading">{t("footer.forHosts")}</span>

              <NavLink to="/gastgeber-bedingungen" className="footer-nav-link">
                {t("footer.hostTerms")}
              </NavLink>

              <NavLink to="/gastgeber-datenschutz" className="footer-nav-link">
                {t("footer.hostPrivacy")}
              </NavLink>
            </nav>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider" />

        {/* ================================
            BOTTOM ROW
            ================================ */}
        <div className="footer-bottom">
          <span className="footer-tagline">{t("footer.tagline")}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
