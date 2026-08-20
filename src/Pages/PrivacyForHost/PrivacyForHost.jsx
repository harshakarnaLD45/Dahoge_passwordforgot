import React, { useEffect } from "react";
import "./PrivacyForHost.css";
import { tn } from "../../Utils/i18n";

const HostPrivacy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="host-privacy-page">
      <div className="mt-wrap host-privacy-container">

        {/* Header */}
        <header className="host-privacy-header">
          <p className="host-privacy-label">
            {tn("hostPrivacy.header.label")}
          </p>

          <h1>
            {tn("hostPrivacy.header.title")}
          </h1>

          <p className="host-privacy-updated">
            {tn("hostPrivacy.header.updated")}
          </p>
        </header>

        {/* 1. Privacy at a Glance */}
        <section className="host-privacy-section">
          <h2>
            <span>1.</span>{" "}
            {tn("hostPrivacy.sections.privacyAtGlance.title")}
          </h2>

          <p>
            {tn("hostPrivacy.sections.privacyAtGlance.text")}
          </p>

          <ul className="host-privacy-list">
            {tn("hostPrivacy.sections.privacyAtGlance.items").map(
              (item, index) => (
                <li key={index}>{item}</li>
              )
            )}
          </ul>
        </section>

        {/* 2. Controller */}
        <section className="host-privacy-section">
          <h2>
            <span>2.</span>{" "}
            {tn("hostPrivacy.sections.controller.title")}
          </h2>

          <div className="host-privacy-content">
            <p className="host-privacy-company">
              {tn("hostPrivacy.sections.controller.company")}
            </p>

            <p>
              {tn("hostPrivacy.sections.controller.address")}
              <br />
              {tn("hostPrivacy.sections.controller.city")}
              <br />
              {tn("hostPrivacy.sections.controller.country")}
            </p>

            <p>
              <strong>
                {tn("hostPrivacy.contact.phone")}:
              </strong>{" "}
              <a href="tel:+493514289510">
                +49 (0)351 428 95 10
              </a>

              <br />

              <strong>
                {tn("hostPrivacy.contact.email")}:
              </strong>{" "}
              <a href="mailto:info@dehoga-sachsen.de">
                info@dehoga-sachsen.de
              </a>
            </p>
          </div>
        </section>

        {/* 3. Data Processed */}
        <section className="host-privacy-section">
          <h2>
            <span>3.</span>{" "}
            {tn("hostPrivacy.sections.dataProcessed.title")}
          </h2>

          <p>
            {tn("hostPrivacy.sections.dataProcessed.intro")}
          </p>

          <ul className="host-privacy-list">
            {tn("hostPrivacy.sections.dataProcessed.items").map(
              (item, index) => (
                <li key={index}>{item}</li>
              )
            )}
          </ul>
        </section>

        {/* 4. Purposes and Legal Bases */}
        <section className="host-privacy-section">
          <h2>
            <span>4.</span>{" "}
            {tn("hostPrivacy.sections.purposes.title")}
          </h2>

          <p>
            {tn("hostPrivacy.sections.purposes.text1")}
          </p>

          <p>
            {tn("hostPrivacy.sections.purposes.text2")}
          </p>
        </section>

        {/* 5. Website Access, Hosting and Technical Logs */}
        <section className="host-privacy-section">
          <h2>
            <span>5.</span>{" "}
            {tn("hostPrivacy.sections.hosting.title")}
          </h2>

          <p>
            {tn("hostPrivacy.sections.hosting.text1")}{" "}
            <a
              href="https://mischtisch-sachsen.de/"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://mischtisch-sachsen.de/
            </a>{" "}
            {tn("hostPrivacy.sections.hosting.text2")}
          </p>

          <p>
            {tn("hostPrivacy.sections.hosting.text3")}
          </p>

          <p>
            {tn("hostPrivacy.sections.hosting.furtherInfo")}{" "}
            <a
              href="https://www.hostinger.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              {tn("hostPrivacy.sections.hosting.hostingerPrivacy")}
            </a>
            .
          </p>
        </section>

        {/* 6. Firebase Authentication */}
        <section className="host-privacy-section">
          <h2>
            <span>6.</span>{" "}
            {tn("hostPrivacy.sections.firebaseAuth.title")}
          </h2>

          <p>
            {tn("hostPrivacy.sections.firebaseAuth.text")}
          </p>

          <p>
            {tn("hostPrivacy.sections.firebaseAuth.furtherInfo")}{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              {tn("hostPrivacy.sections.firebaseAuth.googlePrivacy")}
            </a>
            .
          </p>
        </section>

        {/* 7. Cloud Firestore and Cloud Storage */}
        <section className="host-privacy-section">
          <h2>
            <span>7.</span>{" "}
            {tn("hostPrivacy.sections.firestore.title")}
          </h2>

          <p>
            {tn("hostPrivacy.sections.firestore.text1")}
          </p>

          <p>
            {tn("hostPrivacy.sections.firestore.text2")}
          </p>

          <p>
            {tn("hostPrivacy.sections.firestore.furtherInfo")}{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              {tn("hostPrivacy.sections.firestore.googlePrivacy")}
            </a>
            .
          </p>
        </section>

        {/* 8. Email Notifications */}
        <section className="host-privacy-section">
          <h2>
            <span>8.</span>{" "}
            {tn("hostPrivacy.sections.emailNotifications.title")}
          </h2>

          <p>
            {tn("hostPrivacy.sections.emailNotifications.text")}
          </p>

          <p>
            {tn("hostPrivacy.sections.emailNotifications.furtherInfo")}{" "}
            <a
              href="https://www.emailjs.com/legal/data-protection-agreement/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {tn(
                "hostPrivacy.sections.emailNotifications.emailjsPrivacy"
              )}
            </a>
            {" "}
            {tn("hostPrivacy.sections.emailNotifications.and")}{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              {tn(
                "hostPrivacy.sections.emailNotifications.googlePrivacy"
              )}
            </a>
            .
          </p>
        </section>

        {/* 9. Recipients and Service Providers */}
        <section className="host-privacy-section">
          <h2>
            <span>9.</span>{" "}
            {tn("hostPrivacy.sections.recipients.title")}
          </h2>

          <p>
            {tn("hostPrivacy.sections.recipients.intro")}
          </p>

          <ul className="host-privacy-list">
            {tn("hostPrivacy.sections.recipients.items").map(
              (item, index) => (
                <li key={index}>{item}</li>
              )
            )}
          </ul>
        </section>

        {/* 10. Public Host Profile */}
        <section className="host-privacy-section">
          <h2>
            <span>10.</span>{" "}
            {tn("hostPrivacy.sections.publicProfile.title")}
          </h2>

          <p>
            {tn("hostPrivacy.sections.publicProfile.text1")}
          </p>

          <p>
            {tn("hostPrivacy.sections.publicProfile.text2")}
          </p>
        </section>

        {/* 11. Guest Reservation Data */}
        <section className="host-privacy-section">
          <h2>
            <span>11.</span>{" "}
            {tn("hostPrivacy.sections.guestData.title")}
          </h2>

          <p>
            {tn("hostPrivacy.sections.guestData.text1")}
          </p>

          <p>
            {tn("hostPrivacy.sections.guestData.text2")}
          </p>
        </section>

        {/* 12. Transfers to Third Countries */}
        <section className="host-privacy-section">
          <h2>
            <span>12.</span>{" "}
            {tn("hostPrivacy.sections.thirdCountryTransfers.title")}
          </h2>

          <p>
            {tn("hostPrivacy.sections.thirdCountryTransfers.text1")}
          </p>

          <p>
            {tn("hostPrivacy.sections.thirdCountryTransfers.text2")}
          </p>
        </section>

        {/* 13. Retention */}
        <section className="host-privacy-section">
          <h2>
            <span>13.</span>{" "}
            {tn("hostPrivacy.sections.retention.title")}
          </h2>

          <p>
            {tn("hostPrivacy.sections.retention.text1")}
          </p>

          <p>
            {tn("hostPrivacy.sections.retention.text2")}
          </p>

          <p>
            {tn("hostPrivacy.sections.retention.text3")}
          </p>

          <p>
            {tn("hostPrivacy.sections.retention.text4")}
          </p>
        </section>

        {/* 14. Data-Subject Rights */}
        <section className="host-privacy-section">
          <h2>
            <span>14.</span>{" "}
            {tn("hostPrivacy.sections.rights.title")}
          </h2>

          <p>
            {tn("hostPrivacy.sections.rights.intro")}
          </p>

          <ul className="host-privacy-list">
            {tn("hostPrivacy.sections.rights.items").map(
              (item, index) => (
                <li key={index}>{item}</li>
              )
            )}
          </ul>

          <p>
            {tn("hostPrivacy.sections.rights.requests")}{" "}
            <a href="mailto:info@dehoga-sachsen.de">
              info@dehoga-sachsen.de
            </a>
            .
          </p>
        </section>

        {/* 15. Right to Lodge a Complaint */}
        <section className="host-privacy-section">
          <h2>
            <span>15.</span>{" "}
            {tn("hostPrivacy.sections.complaint.title")}
          </h2>

          <p>
            {tn("hostPrivacy.sections.complaint.text")}
          </p>
        </section>

        {/* 16. Changes to This Notice */}
        <section className="host-privacy-section">
          <h2>
            <span>16.</span>{" "}
            {tn("hostPrivacy.sections.changes.title")}
          </h2>

          <p>
            {tn("hostPrivacy.sections.changes.text")}
          </p>
        </section>

      </div>
    </main>
  );
};

export default HostPrivacy;