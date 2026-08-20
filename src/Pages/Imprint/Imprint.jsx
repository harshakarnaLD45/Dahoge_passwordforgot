import React, { useEffect } from "react";
import { tn } from "../../Utils/i18n";
import "./Imprint.css";

const Imprint = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="imprint-page">
      <div className="mt-wrap imprint-container">

        {/* Header */}
        <header className="imprint-header">
          <p className="imprint-eyebrow">
            {tn("imprint.eyebrow")}
          </p>

          <h1>
            {tn("imprint.title")}
          </h1>

          <p className="imprint-updated">
            {tn("imprint.lastUpdated")}
          </p>
        </header>

        {/* Provider */}
        <section className="imprint-section">
          <h2>
            {tn("imprint.provider.title")}
          </h2>

          <div className="imprint-content">
            <p className="imprint-company">
              {tn("imprint.provider.company")}
              <br />
              {tn("imprint.provider.companyShort")}
            </p>

            <p>
              {tn("imprint.provider.address")}
              <br />
              {tn("imprint.provider.city")}
              <br />
              {tn("imprint.provider.country")}
            </p>

            <p>
              <strong>
                {tn("imprint.provider.phone")}
              </strong>{" "}
              <a href="tel:+493514289510">
                +49 (0)351 428 95 10
              </a>

              <br />

              <strong>
                {tn("imprint.provider.email")}
              </strong>{" "}
              <a href="mailto:info@dehoga-sachsen.de">
                info@dehoga-sachsen.de
              </a>

              <br />

              <strong>
                {tn("imprint.provider.website")}
              </strong>{" "}
              <a
                href="https://mischtisch-sachsen.de/"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://mischtisch-sachsen.de/
              </a>
            </p>
          </div>
        </section>

        {/* Authorised Representative */}
        <section className="imprint-section">
          <h2>
            {tn("imprint.representative.title")}
          </h2>

          <p>
            {tn("imprint.representative.text")}{" "}
            <strong>
              {tn("imprint.representative.name")}
            </strong>
          </p>
        </section>

        {/* Register */}
        <section className="imprint-section">
          <h2>
            {tn("imprint.register.title")}
          </h2>

          <p>
            {tn("imprint.register.text")}
            <br />
            {tn("imprint.register.court")}
            <br />
            {tn("imprint.register.number")}
          </p>
        </section>

        {/* Mischtisch Saxony */}
        <section className="imprint-section">
          <h2>
            {tn("imprint.mischtisch.title")}
          </h2>

          <p>
            {tn("imprint.mischtisch.text1")}
          </p>

          <p>
            {tn("imprint.mischtisch.text2")}
          </p>
        </section>

        {/* Consumer Dispute Resolution */}
        <section className="imprint-section">
          <h2>
            {tn("imprint.consumerDispute.title")}
          </h2>

          <p>
            {tn("imprint.consumerDispute.text")}
          </p>
        </section>

        {/* Content and Image Rights */}
        <section className="imprint-section">
          <h2>
            {tn("imprint.contentRights.title")}
          </h2>

          <p>
            {tn("imprint.contentRights.text")}
          </p>
        </section>

      </div>
    </main>
  );
};

export default Imprint;