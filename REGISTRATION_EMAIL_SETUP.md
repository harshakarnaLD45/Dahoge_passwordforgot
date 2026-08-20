# Registration Email Setup

The Firebase-generated `regCode` is the registration number. It is passed to the SMTP endpoint as `regCode` and rendered in templates 01 and 02 as `{{registrationNumber}}`.

## Files changed

- `src/Components/AuthForms.jsx`
- `src/Services/mailer.js`
- `server/server.js`
- `server/.env.example`
- `.env.example`
- registration templates 01-03

## Local setup

1. Install packages: `npm install`.
2. Copy `server/.env.example` to `server/.env`.
3. Enter SMTP credentials and `REGISTRATION_REVIEW_EMAIL`.
4. Start SMTP server: `npm run server`.
5. In another terminal start React: `npm start`.
6. Check `http://localhost:5000/api/email-health`.
7. Register a new host. Template 01 goes to the host and template 02 goes to the review address.

## Registration number mapping

Firebase returns:

```js
const regCode = saved.regCode;
```

React submits:

```js
{ regCode }
```

The server maps it into both templates:

```js
registrationNumber: regCode
```

The templates display:

```html
{{registrationNumber}}
```

## EmailJS — one shared template for all mail types

All five mail types (01–05) are delivered through **one** EmailJS template. The
app renders the **full HTML templates from `public/mailtempletes/`** (01–05,
same letters that the SMTP path sends) and sends them as the `full_html`
variable. The dashboard template embeds it with `{{{full_html}}}` (triple
braces = raw HTML, not escaped). No building blocks are sent — the payload is
exactly four variables.

### Env vars (React)

```
REACT_APP_EMAILJS_SERVICE_ID=
REACT_APP_EMAILJS_TEMPLATE_ID=
REACT_APP_EMAILJS_PUBLIC_KEY=
```

When these are empty, the SMTP.js fallback in `mailer.js` / `VenueDetail` stays
active. When set, EmailJS is the single delivery source.

### EmailJS dashboard template

Create one template in the EmailJS dashboard (Email Templates → New Template):

- **To Email**: `{{to_email}}`
- **Reply To**: `{{reply_to}}`
- **Subject**: `{{subject}}`
- **Content (HTML)**: `{{{full_html}}}` (triple braces = raw HTML, not escaped)

`{{{full_html}}}` carries the complete rendered letter from
`public/mailtempletes/` (01–05).

`{{reply_to}}` is the address replies should go to — the app sends the
contact of the sender side (registration: the host's email; booking guest
mail: the venue email; booking venue mail: the guest email).

### Variables sent per mail type

| Mail type | Template | Reply-To |
| --- | --- | --- |
| Registration confirmation (host) | 01 | host's email |
| Verification request | 02 | host's email |
| Internal credentials | 03 | host's email |
| Booking confirmation (guest) | 04 | venue email |
| Booking notification (venue) | 05 | guest email |

The payload always has the same shape — only 4 variables:
`{ to_email, subject, full_html, reply_to }`.

### Size limit (50 KB)

EmailJS rejects requests whose variables exceed **50 KB** (error 413). The
templates previously embedded a ~90 KB inline SVG logo — that was removed and
replaced by a hosted `<img>` (Google Drive direct link) plus alt text. Keep the
templates compact:
- no inline SVG or base64 images (Gmail/Outlook.com strip inline SVG anyway)
- the logo is fetched from
  `https://drive.google.com/uc?export=view&id=1hxxOO-KVZvx7NBZ99NfUxoOIaOMfh8M7`
- **caveat**: the Drive file is an SVG — Gmail/Outlook do not render SVG
  images; only Apple Mail etc. show it, everyone else sees the alt text.
  Upgrade path: export the logo as PNG, host it on Firebase Storage, and swap
  the `src` in the five templates
- current template sizes: ~18–20 KB each, safely below the limit
