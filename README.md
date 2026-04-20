# Toledo Signup

A single-page signup landing for the **CCMT Spring Gala**, collecting names and emails from attendees interested in learning more about Partnership Schools' plans for Toledo. Styled to match [thepartnershipschools.org](https://thepartnershipschools.org).

**Stack:** Astro (SSR) · Tailwind v4 · Netlify Functions · Netlify Blobs · deployed on Netlify.

## Pages

| Route | Purpose | Auth |
| --- | --- | --- |
| `/` | Mobile-first signup landing page with hero + form | Public |
| `/thank-you` | Post-submit confirmation | Public |
| `/api/signup` | POST endpoint that persists entries to Netlify Blobs | Public |
| `/admin` | Table of all signups | Basic auth |
| `/admin/signups.csv` | CSV export of all signups | Basic auth |

## Local development

```sh
npm install
cp .env.example .env   # then edit ADMIN_PASSWORD
npm run dev
```

Note: `/admin` and `/api/signup` use Netlify Blobs for storage. For full local fidelity, run with the Netlify CLI:

```sh
npm install -g netlify-cli
netlify dev
```

## Deploying to Netlify

1. Push this repo to GitHub (`talcottforge/toledo-signup`).
2. In Netlify, **Add new site → Import an existing project** and select the repo.
3. Netlify auto-detects the build (`npm run build`, publish dir `dist`) from `netlify.toml`.
4. Under **Site settings → Environment variables** add:
   - `ADMIN_USER` — e.g. `admin`
   - `ADMIN_PASSWORD` — a long random string (this protects `/admin`)
5. Deploy. Netlify Blobs are provisioned automatically on first request — no extra setup.

### Custom domain / QR code

- Add a custom domain under **Domain management** (e.g. `toledo.partnershipschools.org` via CNAME, or keep the generated `*.netlify.app` URL).
- Generate a QR code for the final URL with any QR generator (e.g. `qrencode -o qr.png <url>`) and drop it onto gala collateral.

## Accessing the signup list

- Visit `https://<your-site>/admin`. Browser prompts for the basic-auth credentials.
- Download everything as CSV via the **Download CSV** button (or go directly to `/admin/signups.csv`).

## Design notes

The visual system was sampled from thepartnershipschools.org:

- **Primary brand**: `#6d2847` (burgundy)
- **Accent**: `#aa579b` (magenta)
- **Typefaces**: **Figtree** (display; substitute for Patron Medium) + **Zilla Slab** (body; substitute for Sentinel)
- Hero imagery reused from the Partnership Schools WordPress uploads

All design tokens live in [src/styles/global.css](src/styles/global.css).
