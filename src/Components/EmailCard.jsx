// Vorschau-Karte für versendete E-Mails (Demo-Versand).
import { v } from "../Utils/i18n";
import { MAIL_FROM } from "../Utils/mail";

export function EmailCard({ typ, an, betreff, lines }) {
  return (
    <div className="email-card">
      <div className="email-top">
        <span>
          ✉ {typ}
        </span>
        <span>{v("Demo-Versand", "Demo dispatch")}</span>
      </div>
      <div className="email-head">
        <div>
          <b>{v("Von", "From")}</b> {MAIL_FROM}
        </div>
        <div>
          <b>{v("An", "To")}</b> {an}
        </div>
        <div>
          <b>{v("Betreff", "Subject")}</b> {betreff}
        </div>
      </div>
      <div className="email-body">
        {lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </div>
  );
}
