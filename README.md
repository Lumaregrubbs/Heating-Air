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

The homepage estimate form is a modal quiz that submits with vanilla JavaScript to a FormSubmit tokenized endpoint:

```text
https://formsubmit.co/ajax/2f8df8eb4de780a3bf524023a5a5a0c0
```

This keeps the form static, avoids exposing the Gmail address directly in the public form action, and removes the need for a Vercel email environment variable. The submission includes all quiz answers, contact fields, and the required preliminary-estimate acknowledgment. On success, visitors are redirected to `thank-you.html`.

FormSubmit routes the tokenized endpoint to `alwaysac.net@gmail.com`. If the production domain ever receives a separate activation email from FormSubmit, click its activation link once and future leads should deliver to that inbox.

The old Vercel Function at `/api/estimate` remains in the repo as an optional Resend-based fallback if you later want server-side email delivery. To use that route instead, change the form `action` in `index.html` back to `/api/estimate` and add this environment variable in Vercel:

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

## Google Reviews

The homepage includes a live-ready Google Reviews section. The “Leave a Google Review” button falls back to a Google search until the real Google Business Profile connection is added.

To show recent public Google reviews automatically on Vercel, add these environment variables:

```text
GOOGLE_PLACES_API_KEY=your_google_places_api_key
GOOGLE_PLACE_ID=your_google_business_profile_place_id
```

The `/api/google-reviews` route reads public Google Places review data, returns up to three public reviews, and updates the review button to the Google review-writing link. Do not hard-code the API key in the website. If the environment variables are missing, the site keeps the static placeholder copy visible and does not show fake reviews.

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

