import React, { useEffect } from "react";
import "./TermsForHost.css";
import { tn } from "../../Utils/i18n";

const HostTerms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="host-terms-page">
      <div className="mt-wrap host-terms-container">

        {/* Header */}
        <header className="host-terms-header">
          <p className="host-terms-eyebrow">
            {tn("hostTerms.header.eyebrow")}
          </p>

          <h1>
            {tn("hostTerms.header.title")}
          </h1>

          <p className="host-terms-updated">
            {tn("hostTerms.header.updated")}
          </p>
        </header>

        {/* 1. Registration */}
        <section className="host-terms-section">
          <h2>
            <span>1.</span>{" "}
            {tn("hostTerms.sections.registration.title")}
          </h2>

          <p>
            {tn("hostTerms.sections.registration.text")}
          </p>
        </section>

        {/* 2. Login Credentials */}
        <section className="host-terms-section">
          <h2>
            <span>2.</span>{" "}
            {tn("hostTerms.sections.credentials.title")}
          </h2>

          <p>
            {tn("hostTerms.sections.credentials.text")}
          </p>
        </section>

        {/* 3. One Mischtisch per Host */}
        <section className="host-terms-section">
          <h2>
            <span>3.</span>{" "}
            {tn("hostTerms.sections.oneTable.title")}
          </h2>

          <p>
            {tn("hostTerms.sections.oneTable.text")}
          </p>
        </section>

        {/* 4. Schedules and Capacity */}
        <section className="host-terms-section">
          <h2>
            <span>4.</span>{" "}
            {tn("hostTerms.sections.schedules.title")}
          </h2>

          <p>
            {tn("hostTerms.sections.schedules.text")}
          </p>
        </section>

        {/* 5. Protection of Existing Reservations When Schedules Change */}
        <section className="host-terms-section">
          <h2>
            <span>5.</span>{" "}
            {tn("hostTerms.sections.scheduleChanges.title")}
          </h2>

          <p>
            {tn("hostTerms.sections.scheduleChanges.text1")}
          </p>

          <p>
            {tn("hostTerms.sections.scheduleChanges.text2")}
          </p>

          <p>
            {tn("hostTerms.sections.scheduleChanges.text3")}
          </p>
        </section>

        {/* 6. Reservations */}
        <section className="host-terms-section">
          <h2>
            <span>6.</span>{" "}
            {tn("hostTerms.sections.reservations.title")}
          </h2>

          <p>
            {tn("hostTerms.sections.reservations.text1")}
          </p>

          <p>
            {tn("hostTerms.sections.reservations.text2")}
          </p>
        </section>

        {/* 7. Photos, Logos and Other Content */}
        <section className="host-terms-section">
          <h2>
            <span>7.</span>{" "}
            {tn("hostTerms.sections.content.title")}
          </h2>

          <p>
            {tn("hostTerms.sections.content.text1")}
          </p>

          <p>
            {tn("hostTerms.sections.content.text2")}
          </p>
        </section>

        {/* 8. Promotions, Discounts and Special Offers */}
        <section className="host-terms-section">
          <h2>
            <span>8.</span>{" "}
            {tn("hostTerms.sections.promotions.title")}
          </h2>

          <p>
            {tn("hostTerms.sections.promotions.text1")}
          </p>

          <p>
            {tn("hostTerms.sections.promotions.text2")}
          </p>

          <p>
            {tn("hostTerms.sections.promotions.text3")}
          </p>
        </section>

        {/* 9. Privacy and Confidentiality */}
        <section className="host-terms-section">
          <h2>
            <span>9.</span>{" "}
            {tn("hostTerms.sections.privacy.title")}
          </h2>

          <p>
            {tn("hostTerms.sections.privacy.text1")}
          </p>

          <p>
            {tn("hostTerms.sections.privacy.text2")}
          </p>

          <p>
            {tn("hostTerms.sections.privacy.text3")}
          </p>

          <p>
            {tn("hostTerms.sections.privacy.text4")}
          </p>
        </section>

        {/* 10. Public Profile Information */}
        <section className="host-terms-section">
          <h2>
            <span>10.</span>{" "}
            {tn("hostTerms.sections.publicProfile.title")}
          </h2>

          <p>
            {tn("hostTerms.sections.publicProfile.text")}
          </p>
        </section>

        {/* 11. Technical Operation */}
        <section className="host-terms-section">
          <h2>
            <span>11.</span>{" "}
            {tn("hostTerms.sections.technical.title")}
          </h2>

          <p>
            {tn("hostTerms.sections.technical.text")}
          </p>
        </section>

        {/* 12. Suspension and Termination */}
        <section className="host-terms-section">
          <h2>
            <span>12.</span>{" "}
            {tn("hostTerms.sections.suspension.title")}
          </h2>

          <p>
            {tn("hostTerms.sections.suspension.text1")}
          </p>

          <p>
            {tn("hostTerms.sections.suspension.text2")}
          </p>
        </section>

        {/* 13. Liability */}
        <section className="host-terms-section">
          <h2>
            <span>13.</span>{" "}
            {tn("hostTerms.sections.liability.title")}
          </h2>

          <p>
            {tn("hostTerms.sections.liability.text")}
          </p>
        </section>

      </div>
    </main>
  );
};

export default HostTerms;