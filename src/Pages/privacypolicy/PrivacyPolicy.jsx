import React, { useEffect } from "react";
import "./PrivacyPolicy.css";
import { tn } from "../../Utils/i18n";

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="privacy-page">
      <div className="mt-wrap privacy-container">

        {/* Header */}
        <header className="privacy-header">
          <p className="privacy-eyebrow">
            {tn("privacyPolicy.header.eyebrow")}
          </p>

          <h1>{tn("privacyPolicy.header.title")}</h1>

          <p className="privacy-updated">
            {tn("privacyPolicy.header.updated")}
          </p>
        </header>

        {/* 1. Privacy at a Glance */}
        <section className="privacy-section">
          <h2>
            <span>1.</span>{" "}
            {tn("privacyPolicy.sections.privacyAtGlance.title")}
          </h2>

          <p>
            {tn("privacyPolicy.sections.privacyAtGlance.intro")}
          </p>

          <ul className="privacy-list">
            {tn("privacyPolicy.sections.privacyAtGlance.items").map(
              (item, index) => (
                <li key={index}>{item}</li>
              )
            )}
          </ul>
        </section>

        {/* 2. Controller */}
        <section className="privacy-section">
          <h2>
            <span>2.</span>{" "}
            {tn("privacyPolicy.sections.controller.title")}
          </h2>

          <div className="privacy-content">
            <p>
              {tn("privacyPolicy.sections.controller.intro")}
            </p>

            <p className="privacy-company">
              DEHOGA Hotel- und Gaststättenverband Sachsen e.V.
            </p>

            <p>
              Tharandter Straße 5
              <br />
              01159 Dresden
              <br />
              {tn("privacyPolicy.sections.controller.country")}
            </p>

            <p>
              <strong>
                {tn("privacyPolicy.contact.phone")}:
              </strong>{" "}
              <a href="tel:+493514289510">
                +49 (0)351 428 95 10
              </a>

              <br />

              <strong>
                {tn("privacyPolicy.contact.email")}:
              </strong>{" "}
              <a href="mailto:info@dehoga-sachsen.de">
                info@dehoga-sachsen.de
              </a>
            </p>

            <p>
              {tn("privacyPolicy.sections.controller.privacyRequests")}
            </p>
          </div>
        </section>

        {/* 3. Website Access, Hosting and Server Log Files */}
        <section className="privacy-section">
          <h2>
            <span>3.</span>{" "}
            {tn("privacyPolicy.sections.hosting.title")}
          </h2>

          <p>
            {tn("privacyPolicy.sections.hosting.text1")}{" "}
            <a
              href="https://mischtisch-sachsen.de/"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://mischtisch-sachsen.de/
            </a>{" "}
            {tn("privacyPolicy.sections.hosting.text2")}
          </p>

          <p>
            {tn("privacyPolicy.sections.hosting.text3")}
          </p>

          <p>
            {tn("privacyPolicy.sections.hosting.text4")}
          </p>

          <p>
            {tn("privacyPolicy.sections.hosting.furtherInfo")}{" "}
            <a
              href="https://www.hostinger.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://www.hostinger.com/legal/privacy-policy
            </a>
          </p>
        </section>

        {/* 4. SSL/TLS Encryption */}
        <section className="privacy-section">
          <h2>
            <span>4.</span>{" "}
            {tn("privacyPolicy.sections.ssl.title")}
          </h2>

          <p>
            {tn("privacyPolicy.sections.ssl.text1")}{" "}
            <strong>https://</strong>{" "}
            {tn("privacyPolicy.sections.ssl.text2")}
          </p>

          <p>
            {tn("privacyPolicy.sections.ssl.text3")}
          </p>
        </section>

        {/* 5. Guest Reservations */}
        <section className="privacy-section">
          <h2>
            <span>5.</span>{" "}
            {tn("privacyPolicy.sections.reservations.title")}
          </h2>

          <p>
            {tn("privacyPolicy.sections.reservations.intro")}
          </p>

          <p>
            {tn("privacyPolicy.sections.reservations.dataIntro")}
          </p>

          <ul className="privacy-list">
            {tn("privacyPolicy.sections.reservations.items").map(
              (item, index) => (
                <li key={index}>{item}</li>
              )
            )}
          </ul>

          <p>
            {tn("privacyPolicy.sections.reservations.text1")}
          </p>

          <p>
            {tn("privacyPolicy.sections.reservations.text2")}
          </p>

          <p>
            {tn("privacyPolicy.sections.reservations.text3")}
          </p>
        </section>

        {/* 6. Disclosure to the Selected Host */}
        <section className="privacy-section">
          <h2>
            <span>6.</span>{" "}
            {tn("privacyPolicy.sections.selectedHost.title")}
          </h2>

          <p>
            {tn("privacyPolicy.sections.selectedHost.text1")}
          </p>

          <p>
            {tn("privacyPolicy.sections.selectedHost.text2")}
          </p>

          <p>
            {tn("privacyPolicy.sections.selectedHost.text3")}
          </p>

          <p>
            {tn("privacyPolicy.sections.selectedHost.text4")}
          </p>
        </section>

        {/* 7. Reservation Confirmations and Email Notifications */}
        <section className="privacy-section">
          <h2>
            <span>7.</span>{" "}
            {tn("privacyPolicy.sections.email.title")}
          </h2>

          <p>
            {tn("privacyPolicy.sections.email.text1")}
          </p>

          <p>
            <strong>EmailJS</strong>{" "}
            {tn("privacyPolicy.sections.email.text2")}{" "}
            <strong>Gmail by Google</strong>{" "}
            {tn("privacyPolicy.sections.email.text3")}
          </p>

          <p>
            {tn("privacyPolicy.sections.email.text4")}
          </p>

          <p>
            {tn("privacyPolicy.sections.email.text5")}
          </p>

          <p>
            {tn("privacyPolicy.sections.email.furtherInfo")}{" "}
            <a
              href="https://www.emailjs.com/legal/data-protection-agreement/"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://www.emailjs.com/legal/data-protection-agreement/
            </a>{" "}
            {tn("privacyPolicy.sections.email.and")}{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://policies.google.com/privacy
            </a>
          </p>
        </section>

        {/* 8. Google Firebase */}
        <section className="privacy-section">
          <h2>
            <span>8.</span>{" "}
            {tn("privacyPolicy.sections.firebase.title")}
          </h2>

          <p>
            {tn("privacyPolicy.sections.firebase.intro")}
          </p>

          <h3>
            {tn("privacyPolicy.sections.firebase.authentication.title")}
          </h3>

          <p>
            {tn("privacyPolicy.sections.firebase.authentication.text")}
          </p>

          <h3>
            {tn("privacyPolicy.sections.firebase.firestore.title")}
          </h3>

          <p>
            {tn("privacyPolicy.sections.firebase.firestore.text")}
          </p>
{/* 
          <h3>
            {tn("privacyPolicy.sections.firebase.storage.title")}
          </h3>

          <p>
            {tn("privacyPolicy.sections.firebase.storage.text")}
          </p> */}

          <p>
            {tn("privacyPolicy.sections.firebase.furtherInfo")}{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://policies.google.com/privacy
            </a>
          </p>
        </section>

        {/* 9. Technically Necessary Browser Storage */}
        <section className="privacy-section">
          <h2>
            <span>9.</span>{" "}
            {tn("privacyPolicy.sections.storage.title")}
          </h2>

          <p>
            {tn("privacyPolicy.sections.storage.intro")}
          </p>

          <ul className="privacy-list">
            {tn("privacyPolicy.sections.storage.items").map(
              (item, index) => (
                <li key={index}>{item}</li>
              )
            )}
          </ul>

          <p>
            {tn("privacyPolicy.sections.storage.text")}
          </p>
        </section>

        {/* 10. Recipients and Service Providers */}
        <section className="privacy-section">
          <h2>
            <span>10.</span>{" "}
            {tn("privacyPolicy.sections.recipients.title")}
          </h2>

          <p>
            {tn("privacyPolicy.sections.recipients.intro")}
          </p>

          <ul className="privacy-list">
            {tn("privacyPolicy.sections.recipients.items").map(
              (item, index) => (
                <li key={index}>{item}</li>
              )
            )}
          </ul>

          <p>
            {tn("privacyPolicy.sections.recipients.text")}
          </p>
        </section>

        {/* 11. Transfers to Third Countries */}
        <section className="privacy-section">
          <h2>
            <span>11.</span>{" "}
            {tn("privacyPolicy.sections.thirdCountries.title")}
          </h2>

          <p>
            {tn("privacyPolicy.sections.thirdCountries.text1")}
          </p>

          <p>
            {tn("privacyPolicy.sections.thirdCountries.text2")}
          </p>
        </section>

        {/* 12. No Automated Decision-Making */}
        <section className="privacy-section">
          <h2>
            <span>12.</span>{" "}
            {tn("privacyPolicy.sections.automated.title")}
          </h2>

          <p>
            {tn("privacyPolicy.sections.automated.text1")}
          </p>

          <p>
            {tn("privacyPolicy.sections.automated.text2")}
          </p>
        </section>

        {/* 13. Retention */}
        <section className="privacy-section">
          <h2>
            <span>13.</span>{" "}
            {tn("privacyPolicy.sections.retention.title")}
          </h2>

          <p>
            {tn("privacyPolicy.sections.retention.text1")}
          </p>

          <p>
            {tn("privacyPolicy.sections.retention.text2")}
          </p>

          <p>
            {tn("privacyPolicy.sections.retention.text3")}
          </p>

          <p>
            {tn("privacyPolicy.sections.retention.text4")}
          </p>

          <p>
            {tn("privacyPolicy.sections.retention.text5")}
          </p>
        </section>

        {/* 14. Data-Subject Rights */}
        <section className="privacy-section">
          <h2>
            <span>14.</span>{" "}
            {tn("privacyPolicy.sections.rights.title")}
          </h2>

          <p>
            {tn("privacyPolicy.sections.rights.intro")}
          </p>

          <ul className="privacy-list">
            {tn("privacyPolicy.sections.rights.items").map(
              (item, index) => (
                <li key={index}>{item}</li>
              )
            )}
          </ul>

          <p>
            {tn("privacyPolicy.sections.rights.requests")}{" "}
            <a href="mailto:info@dehoga-sachsen.de">
              info@dehoga-sachsen.de
            </a>
            .
          </p>

          <p>
            {tn("privacyPolicy.sections.rights.hostProcessing")}
          </p>
        </section>

        {/* 15. Right to Lodge a Complaint */}
        <section className="privacy-section">
          <h2>
            <span>15.</span>{" "}
            {tn("privacyPolicy.sections.complaint.title")}
          </h2>

          <p>
            {tn("privacyPolicy.sections.complaint.text")}
          </p>
        </section>

        {/* 16. Changes to This Privacy Policy */}
        <section className="privacy-section">
          <h2>
            <span>16.</span>{" "}
            {tn("privacyPolicy.sections.changes.title")}
          </h2>

          <p>
            {tn("privacyPolicy.sections.changes.text")}
          </p>
        </section>

      </div>
    </main>
  );
};

export default PrivacyPolicy;