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
  const toEmail = process.env.ESTIMATE_TO_EMAIL || "alwaysac.net@gmail.com";
  const fromEmail = process.env.ESTIMATE_FROM_EMAIL || "Always Heating and Air <onboarding@resend.dev>";

  if (!apiKey) {
    htmlResponse(res, 503, "Form Delivery Is Not Configured", "The website form is ready, but email delivery still needs a RESEND_API_KEY environment variable.");
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

  const text = [
    "New HVAC Estimate Request",
    "",
    "A homeowner submitted the Always Heating and Air estimate quiz.",
    "",
    ...fields.map(([label, value]) => `${label}: ${value || "Not provided"}`)
  ].join("\n");

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #102033; line-height: 1.6;">
      <h1 style="margin-bottom: 8px;">New HVAC Estimate Request</h1>
      <p style="margin-top: 0;">A homeowner submitted the Always Heating and Air estimate quiz.</p>
      <p style="margin: 24px 0 12px;"><strong>Lead summary</strong></p>
      <table cellpadding="10" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse; background: #f4f8fc; border: 1px solid #d7e3f3;">
        ${fields.map(([label, value]) => `
          <tr>
            <th align="left" style="width: 220px; border-bottom: 1px solid #d7e3f3; padding: 10px; color: #0e4c92; background: #edf4fb;">${escapeHtml(label)}</th>
            <td style="border-bottom: 1px solid #d7e3f3; padding: 10px; background: #ffffff;">${escapeHtml(value || "Not provided")}</td>
          </tr>
        `).join("")}
      </table>
      <p style="margin-top: 20px;">Reply directly to this email to respond to <strong>${escapeHtml(data.fullName)}</strong> at <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a>.</p>
    </div>
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
      html,
      text
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
