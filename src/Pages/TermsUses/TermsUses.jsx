import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./TermsUses.css";
import { tn } from "../../Utils/i18n";

const TermsUses = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="terms-page">
      <div className="mt-wrap terms-container">

        {/* Header */}
        <header className="terms-header">
          <p className="terms-eyebrow">
            {tn("termsUses.header.eyebrow")}
          </p>

          <h1>
            {tn("termsUses.header.title")}
          </h1>

          <p className="terms-updated">
            {tn("termsUses.header.updated")}
          </p>
        </header>

        {/* 1. Platform Role */}
        <section className="terms-section">
          <h2>
            <span>1.</span>{" "}
            {tn("termsUses.sections.platformRole.title")}
          </h2>

          <p>
            {tn("termsUses.sections.platformRole.text")}
          </p>
        </section>

        {/* 2. Minimum Age */}
        <section className="terms-section">
          <h2>
            <span>2.</span>{" "}
            {tn("termsUses.sections.minimumAge.title")}
          </h2>

          <p>
            {tn("termsUses.sections.minimumAge.text")}
          </p>
        </section>

        {/* 3. Reservation */}
        <section className="terms-section">
          <h2>
            <span>3.</span>{" "}
            {tn("termsUses.sections.reservation.title")}
          </h2>

          <p>
            {tn("termsUses.sections.reservation.text")}
          </p>
        </section>

        {/* 4. Multiple Seats */}
        <section className="terms-section">
          <h2>
            <span>4.</span>{" "}
            {tn("termsUses.sections.multipleSeats.title")}
          </h2>

          <p>
            {tn("termsUses.sections.multipleSeats.text")}
          </p>
        </section>

        {/* 5. Accuracy of Information */}
        <section className="terms-section">
          <h2>
            <span>5.</span>{" "}
            {tn("termsUses.sections.accuracy.title")}
          </h2>

          <p>
            {tn("termsUses.sections.accuracy.text")}
          </p>
        </section>

        {/* 6. Changes and Cancellations */}
        <section className="terms-section">
          <h2>
            <span>6.</span>{" "}
            {tn("termsUses.sections.changesCancellations.title")}
          </h2>

          <p>
            {tn("termsUses.sections.changesCancellations.text")}
          </p>
        </section>

        {/* 7. Changes by Hosts */}
        <section className="terms-section">
          <h2>
            <span>7.</span>{" "}
            {tn("termsUses.sections.hostChanges.title")}
          </h2>

          <p>
            {tn("termsUses.sections.hostChanges.text")}
          </p>
        </section>

        {/* 8. Prices and Payments */}
        <section className="terms-section">
          <h2>
            <span>8.</span>{" "}
            {tn("termsUses.sections.pricesPayments.title")}
          </h2>

          <p>
            {tn("termsUses.sections.pricesPayments.text")}
          </p>
        </section>

        {/* 9. Promotions, Discounts and Special Offers */}
        <section className="terms-section">
          <h2>
            <span>9.</span>{" "}
            {tn("termsUses.sections.promotionsDiscounts.title")}
          </h2>

          <p>
            {tn("termsUses.sections.promotionsDiscounts.text1")}
          </p>

          <p>
            {tn("termsUses.sections.promotionsDiscounts.text2")}
          </p>
        </section>

        {/* 10. Availability and Technical Errors */}
        <section className="terms-section">
          <h2>
            <span>10.</span>{" "}
            {tn("termsUses.sections.availabilityErrors.title")}
          </h2>

          <p>
            {tn("termsUses.sections.availabilityErrors.text")}
          </p>
        </section>

        {/* 11. Prohibited Use */}
        <section className="terms-section">
          <h2>
            <span>11.</span>{" "}
            {tn("termsUses.sections.prohibitedUse.title")}
          </h2>

          <p>
            {tn("termsUses.sections.prohibitedUse.text")}
          </p>
        </section>

        {/* 12. Liability */}
        <section className="terms-section">
          <h2>
            <span>12.</span>{" "}
            {tn("termsUses.sections.liability.title")}
          </h2>

          <p>
            {tn("termsUses.sections.liability.text")}
          </p>
        </section>

        {/* 13. Privacy */}
        <section className="terms-section">
          <h2>
            <span>13.</span>{" "}
            {tn("termsUses.sections.privacy.title")}
          </h2>

          <p>
            {tn("termsUses.sections.privacy.text")}{" "}

            <Link to="/privacy">
              {tn("termsUses.sections.privacy.link")}
            </Link>
          </p>
        </section>

        {/* 14. Governing Law */}
        <section className="terms-section">
          <h2>
            <span>14.</span>{" "}
            {tn("termsUses.sections.governingLaw.title")}
          </h2>

          <p>
            {tn("termsUses.sections.governingLaw.text")}
          </p>
        </section>

      </div>
    </main>
  );
};

export default TermsUses;