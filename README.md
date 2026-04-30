# Always Heating and Air Static Website

This is a Git-friendly, Vercel-friendly static HTML/CSS website for Always Heating and Air, an HVAC company serving Jacksonville, FL.

The site is built for lead generation, local SEO, and fast static deployment. It uses static HTML, CSS, and lightweight vanilla JavaScript for the modal estimate quiz, scroll reveals, video placeholder messaging, and interactive visuals. It does not use React, Tailwind, Bootstrap, or external frontend libraries.

## Project Structure

```text
/Heating-Air
  index.html
  thank-you.html
  404.html
  robots.txt
  sitemap.xml
  site.webmanifest
  vercel.json
  package.json
  README.md
  .gitignore
  /api
    estimate.js
  /css
    styles.css
  /js
    main.js
  /assets
    /images
      desktop-hero-bg.jpeg
      desktop-hero-bg-20260425-v2.jpg
      hero-mobile-van.jpeg
      phone-hero-bg.jpg
      phone-hero-bg.png
      phone-hero-bg-20260425-v2.jpg
      tech-tablet.jpg
      van-wide-shot-20260425.jpeg
  /services
    ac-repair.html
    ac-installation.html
    heating-services.html
    maintenance.html
    diagnostics.html
    emergency-hvac.html
    duct-installation-cleaning.html
  /locations
    jacksonville-fl.html
  /icons
    icon.svg
    logo.gif
    favicon.ico
    favicon-16.png
    favicon-32.png
    favicon-48.png
    favicon-192.png
    favicon-512.png
    apple-touch-icon.png
    logo-icon.png
```

## How to Open Locally

You can open `index.html` directly in a browser.

For a local static server:

```bash
npm run dev
```

This uses `npx serve .` and does not require production frontend dependencies. The Vercel Function at `/api/estimate` is intended to run on Vercel. Local static preview will show the site and modal quiz, but production email delivery should be tested after deployment.

## How to Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Import the repository into Vercel.
3. Use the project root as the deployment directory.
4. Leave the build command blank.
5. Leave the output directory blank.
6. Deploy.

The `vercel.json` file includes static routing support, security headers, and cache headers for CSS and icons.

## Estimate Form Handling

The homepage estimate form is a modal quiz that posts to:

```text
/api/estimate
```

The Vercel Function validates the required quiz/contact fields and sends the lead by email through Resend. It does not hard-code private API keys.

Add this environment variable in the deployment environment before using the form in production:

```text
RESEND_API_KEY=your_resend_api_key
```

Optional overrides:

```text
ESTIMATE_TO_EMAIL=where_leads_should_go@example.com
ESTIMATE_FROM_EMAIL=Always Heating and Air <verified-sender@yourdomain.com>
```

If `ESTIMATE_TO_EMAIL` is omitted, the function sends to `alwaysac.net@gmail.com`.

If `ESTIMATE_FROM_EMAIL` is omitted, the function falls back to `Always Heating and Air <onboarding@resend.dev>`, which is useful for initial testing on a Resend account. For long-term production sending, replace it with a verified sender/domain inside Resend.

If `RESEND_API_KEY` is missing, the function returns a clear configuration message instead of pretending the lead was captured.

## Editing Contact Info

Current placeholder contact details are:

- Phone: `(904) 310-0857`
- Email: `service@example.com`
- Address: `Jacksonville, FL`
- Website: `https://www.alwaysheatingair.com`

Replace these values across the HTML files, sitemap, structured data, and README when final client details are available.

If using another backend instead of Resend, update the modal form `action` in `index.html` and replace `/api/estimate.js` with the new handler. Keep the required preliminary estimate and in-person diagnosis disclaimer near the submit button.

## SEO Notes

The site includes unique title tags, meta descriptions, canonical links, Open Graph tags, Twitter card tags, LocalBusiness/HVAC schema, Service schema, FAQ schema, internal links, robots.txt, sitemap.xml, and service-specific pages for Jacksonville HVAC keywords, including duct installation and duct cleaning.

