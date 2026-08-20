import React, { useEffect } from "react";
import "./Accessibility.css";

import { tn } from "../../Utils/i18n";

const Accessibility = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="accessibility-page">
      <div className="mt-wrap accessibility-container">

        {/* Header */}
        <header className="accessibility-header">
          <p className="accessibility-eyebrow">
            {tn("accessibilityPage.eyebrow")}
          </p>

          <h1>{tn("accessibilityPage.title")}</h1>

          <p className="accessibility-updated">
            {tn("accessibilityPage.lastUpdated")}
          </p>
        </header>

        {/* Our Goal */}
        <section className="accessibility-section">
          <h2>{tn("accessibilityPage.ourGoal.title")}</h2>

          {tn("accessibilityPage.ourGoal.paragraphs").map(
            (paragraph, index) => (
              <p key={index}>{paragraph}</p>
            )
          )}
        </section>

        {/* Creation and Update Date */}
        <section className="accessibility-section">
          <h2>{tn("accessibilityPage.creationUpdate.title")}</h2>

          <p>{tn("accessibilityPage.creationUpdate.text")}</p>
        </section>

        {/* Description of the Service */}
        <section className="accessibility-section">
          <h2>{tn("accessibilityPage.serviceDescription.title")}</h2>

          {tn("accessibilityPage.serviceDescription.paragraphs").map(
            (paragraph, index) => (
              <p key={index}>{paragraph}</p>
            )
          )}
        </section>

        {/* Accessibility Measures */}
        <section className="accessibility-section">
          <h2>{tn("accessibilityPage.measures.title")}</h2>

          <p>{tn("accessibilityPage.measures.intro")}</p>

          <ul>
            {tn("accessibilityPage.measures.items").map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        {/* Current Conformance Status */}
        <section className="accessibility-section">
          <h2>{tn("accessibilityPage.currentStatus.title")}</h2>

          {tn("accessibilityPage.currentStatus.paragraphs").map(
            (paragraph, index) => (
              <p key={index}>{paragraph}</p>
            )
          )}
        </section>

        {/* Report an Accessibility Barrier */}
        <section className="accessibility-section">
          <h2>{tn("accessibilityPage.reportBarrier.title")}</h2>

          <p>{tn("accessibilityPage.reportBarrier.intro")}</p>

          <div className="accessibility-contact">
            <p className="accessibility-company">
              <strong>
                {tn("accessibilityPage.reportBarrier.company")}
              </strong>
            </p>

            {tn("accessibilityPage.reportBarrier.address").map(
              (line, index) => (
                <p key={index}>{line}</p>
              )
            )}

            <p>
              <strong>
                {tn("accessibilityPage.reportBarrier.emailLabel")}:
              </strong>{" "}
              <a href="mailto:info@dehoga-sachsen.de">
                {tn("accessibilityPage.reportBarrier.email")}
              </a>
            </p>

            <p>
              <strong>
                {tn("accessibilityPage.reportBarrier.phoneLabel")}:
              </strong>{" "}
              <a href="tel:+493514289510">
                {tn("accessibilityPage.reportBarrier.phone")}
              </a>
            </p>
          </div>

          <p>{tn("accessibilityPage.reportBarrier.text")}</p>
        </section>

        {/* Updates to This Statement */}
        <section className="accessibility-section">
          <h2>{tn("accessibilityPage.updates.title")}</h2>

          <p>{tn("accessibilityPage.updates.text")}</p>
        </section>

      </div>
    </main>
  );
};

export default Accessibility;