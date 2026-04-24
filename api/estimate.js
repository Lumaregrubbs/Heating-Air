const requiredFields = [
  "systemIssue",
  "systemType",
  "systemAge",
  "situation",
  "priority",
  "serviceTiming",
  "fullName",
  "phone",
  "email",
  "zip",
  "preferredContact",
  "acknowledgement"
];

function parseBody(body) {
  if (body && typeof body === "object" && !(body instanceof String)) {
    if (Buffer.isBuffer(body)) {
      const params = new URLSearchParams(body.toString("utf8"));
      const data = {};
      for (const [key, value] of params.entries()) {
        data[key] = value;
      }
      return data;
    }
    return body;
  }
  const params = new URLSearchParams(body || "");
  const data = {};
  for (const [key, value] of params.entries()) {
    data[key] = value;
  }
  return data;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function htmlResponse(res, statusCode, title, message) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><link rel="stylesheet" href="/css/styles.css"></head><body><main class="section"><div class="container narrow center"><h1>${escapeHtml(title)}</h1><p class="lead">${escapeHtml(message)}</p><a class="btn btn-primary" href="/">Back to Home</a></div></main></body></html>`);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    res.end("Method Not Allowed");
    return;
  }

  const data = parseBody(req.body);
  const missing = requiredFields.filter((field) => !data[field]);

  if (missing.length) {
    htmlResponse(res, 400, "Estimate Request Incomplete", "Please go back and complete the required estimate fields before submitting.");
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.ESTIMATE_TO_EMAIL;
  const fromEmail = process.env.ESTIMATE_FROM_EMAIL;

  if (!apiKey || !toEmail || !fromEmail) {
    htmlResponse(res, 503, "Form Delivery Is Not Configured", "The website form is ready, but Vercel email delivery still needs RESEND_API_KEY, ESTIMATE_TO_EMAIL, and ESTIMATE_FROM_EMAIL environment variables.");
    return;
  }

  const fields = [
    ["System issue", data.systemIssue],
    ["System type", data.systemType],
    ["System age", data.systemAge],
    ["Situation", data.situation],
    ["Priority", data.priority],
    ["Requested timing", data.serviceTiming],
    ["Additional details", data.additionalDetails],
    ["Full name", data.fullName],
    ["Phone", data.phone],
    ["Email", data.email],
    ["ZIP", data.zip],
    ["Street address", data.streetAddress],
    ["Preferred contact", data.preferredContact],
    ["Acknowledgement", data.acknowledgement],
    ["Source", data.source]
  ];

  const html = `
    <h1>New HVAC Estimate Request</h1>
    <p>A homeowner submitted the Always Heating and Air Conditioning estimate quiz.</p>
    <table cellpadding="8" cellspacing="0" border="1">
      ${fields.map(([label, value]) => `<tr><th align="left">${escapeHtml(label)}</th><td>${escapeHtml(value || "Not provided")}</td></tr>`).join("")}
    </table>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      reply_to: data.email,
      subject: `New HVAC Estimate Request from ${data.fullName}`,
      html
    })
  });

  if (!response.ok) {
    htmlResponse(res, 502, "Form Delivery Failed", "The estimate request could not be delivered. Please check the Vercel function logs and email provider configuration.");
    return;
  }

  res.statusCode = 303;
  res.setHeader("Location", "/thank-you.html");
  res.end();
};

