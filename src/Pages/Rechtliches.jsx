export function Rechtliches() {
  return (
    <main
      className="mt-wrap"
      style={{
        padding: "32px 20px 60px",
        maxWidth: 900,
      }}
    >
      <div className="eyebrow">Rechtliche Informationen</div>

      <h1
        className="f-display"
        style={{
          margin: "6px 0 24px",
          color: "var(--kobalt-dunkel)",
          fontSize: "clamp(30px, 5vw, 44px)",
        }}
      >
        Impressum
      </h1>

      <section
        className="card"
        style={{
          display: "grid",
          gap: 22,
          lineHeight: 1.7,
          color: "#3A4258",
        }}
      >
        <div>
          <h2
            className="f-display"
            style={{
              margin: "0 0 8px",
              color: "var(--kobalt-dunkel)",
              fontSize: 21,
            }}
          >
            Angaben gemäß § 5 TMG
          </h2>

          <p style={{ margin: 0 }}>
            <strong>
              DEHOGA Hotel- und Gaststättenverband Sachsen e.V.
              <br />
              (DEHOGA Sachsen e.V.)
            </strong>
            <br />
            Tharandter Straße 5
            <br />
            01159 Dresden
          </p>
        </div>

        <div>
          <h2
            className="f-display"
            style={{
              margin: "0 0 8px",
              color: "var(--kobalt-dunkel)",
              fontSize: 21,
            }}
          >
            Kontakt
          </h2>

          <p style={{ margin: 0 }}>
            Telefon:{" "}
            <a
              href="tel:+493514289510"
              style={{ color: "var(--kobalt)" }}
            >
              (0351) 428 95 10
            </a>
            <br />

            Telefax: (0351) 428 95 19
            <br />

            WhatsApp:{" "}
            <a
              href="https://wa.me/4915222344383"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--kobalt)" }}
            >
              0152 22344383
            </a>
            <br />

            E-Mail:{" "}
            <a
              href="mailto:info@dehoga-sachsen.de"
              style={{ color: "var(--kobalt)" }}
            >
              info@dehoga-sachsen.de
            </a>
          </p>
        </div>

        <div>
          <h2
            className="f-display"
            style={{
              margin: "0 0 8px",
              color: "var(--kobalt-dunkel)",
              fontSize: 21,
            }}
          >
            Vertreten durch
          </h2>

          <p style={{ margin: 0 }}>
            Hauptgeschäftsführer: Axel Klein
          </p>
        </div>

        <div>
          <h2
            className="f-display"
            style={{
              margin: "0 0 8px",
              color: "var(--kobalt-dunkel)",
              fontSize: 21,
            }}
          >
            Registereintrag
          </h2>

          <p style={{ margin: 0 }}>
            Eingetragen im Vereinsregister.
            <br />
            Registergericht: Amtsgericht Dresden
            <br />
            Registernummer: 1104
          </p>
        </div>

        <div>
          <h2
            className="f-display"
            style={{
              margin: "0 0 8px",
              color: "var(--kobalt-dunkel)",
              fontSize: 21,
            }}
          >
            Bildrechte
          </h2>

          <p style={{ margin: "0 0 8px" }}>
            <strong>Bereich Startseite:</strong>
          </p>

          <ul
            style={{
              margin: 0,
              paddingLeft: 20,
            }}
          >
            <li>© Wavebreakmedia Ltd | Dreamstime.com</li>
            <li>© Alexander Kirch | Dreamstime.com</li>
            <li>© Taiga | Dreamstime.com</li>
            <li>© Wavebreakrneora Ltd | Dreamstime.com</li>
            <li>© Wavebreakmedia Ltd | Dreamstime.com</li>
            <li>© Rosshelen | Dreamstime.corn</li>
          </ul>
        </div>
      </section>
    </main>
  );
}