# Always Heating and Air Conditioning Static Website

This is a Git-friendly, Vercel-friendly static HTML/CSS website for Always Heating and Air Conditioning, an HVAC company serving Jacksonville, FL.

The site is built for lead generation, local SEO, and fast static deployment. It uses no JavaScript, no React, no Tailwind, no Bootstrap, and no external libraries. The only script tags are JSON-LD structured data blocks for SEO.

## Project Structure

```text
/always-hvac-site
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
  /css
    styles.css
  /services
    ac-repair.html
    ac-installation.html
    heating-services.html
    maintenance.html
    diagnostics.html
    emergency-hvac.html
  /locations
    jacksonville-fl.html
  /assets
    /icons
      icon.svg
```

## How to Open Locally

You can open `index.html` directly in a browser.

For a local static server:

```bash
npm run dev
```

This uses `npx serve .` and does not require production dependencies.

## How to Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Import the repository into Vercel.
3. Use the project root as the deployment directory.
4. Leave the build command blank.
5. Leave the output directory blank.
6. Deploy.

The `vercel.json` file includes static routing support, security headers, and cache headers for CSS and assets.

## Editing Contact Info

Current placeholder contact details are:

- Phone: `(904) XXX-XXXX`
- Email: `service@example.com`
- Address: `Jacksonville, FL`
- Website: `https://www.alwaysheatingair.com`

Replace these values across the HTML files, sitemap, structured data, and README when final client details are available.

## Form Handling Note

The estimate form is static and currently uses Netlify-style form attributes:

```html
method="POST"
name="hvac-estimate"
data-netlify="true"
netlify-honeypot="bot-field"
action="/thank-you.html"
```

If deploying on Vercel, you must connect the form to a form backend or third-party form handler. Static HTML alone cannot send email, store submissions, or process leads on Vercel without a form service.

If using another backend, update the form `action`, remove or replace Netlify-specific attributes as needed, and keep the required legal/disclaimer language near the submit button.

## SEO Notes

The site includes unique title tags, meta descriptions, canonical links, Open Graph tags, Twitter card tags, LocalBusiness/HVAC schema, Service schema, FAQ schema, internal links, robots.txt, sitemap.xml, and service-specific pages for Jacksonville HVAC keywords.
