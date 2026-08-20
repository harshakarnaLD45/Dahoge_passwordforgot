// Diagnostic probe: does the DASHBOARD public key (172 requests left) work
// with any of the service/template ID sets present in .env?
// Sends to a reserved .invalid recipient so no real mailbox is hit.
globalThis.location = {
  href: "http://localhost:3000",
  origin: "http://localhost:3000",
};
const emailjs = require("@emailjs/browser");

const DASH_KEY = "dKJLKlG8mBJLSKelB";

const combos = [
  {
    name: "dashboard key + ACTIVE service/template",
    serviceId: "service_lasfi1l",
    templateId: "template_0q4pr7p",
  },
  {
    name: "dashboard key + COMMENTED service/template",
    serviceId: "service_goznq3x",
    templateId: "template_3ys98m4",
  },
  {
    name: "dashboard key + OLDEST commented service/template",
    serviceId: "Xo8QQy6NxABcNs3dyjOdg",
    templateId: "template_0q4pr7p",
  },
];

(async () => {
  for (const c of combos) {
    try {
      emailjs.init({ publicKey: DASH_KEY });
      const res = await emailjs.send(c.serviceId, c.templateId, {
        to_email: "smtp-diag@invalid.test",
        subject: "EmailJS diagnostic probe",
        full_html: "<p>diagnostic</p>",
        reply_to: "",
      });
      console.log(`[${c.name}] OK =>`, JSON.stringify(res));
    } catch (e) {
      console.log(
        `[${c.name}] FAIL => status=${e?.status} text=${JSON.stringify(e?.text || e?.message)}`,
      );
    }
  }
  process.exit(0);
})();
