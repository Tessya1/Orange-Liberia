const fs = require("fs");
const path = require("path");

const resultPath = path.join(__dirname, "..", "reports", "run-result.json");
const outPath = path.join(__dirname, "..", "reports", "email-summary.html");

const { run } = JSON.parse(fs.readFileSync(resultPath, "utf8"));
const stats = run.stats;
const failures = run.failures || [];

const totalRequests = stats.requests.total;
const totalAssertions = stats.assertions.total;
const failedAssertions = stats.assertions.failed;
const passedAssertions = totalAssertions - failedAssertions;
const passRate = totalAssertions === 0 ? 100 : Math.round((passedAssertions / totalAssertions) * 1000) / 10;

const GREEN = "#2ecc71";
const RED = "#e74c3c";
const BLUE = "#3498db";
const DARK = "#2c3e50";

const bannerColor = failedAssertions === 0 ? GREEN : RED;
const bannerText = failedAssertions === 0
  ? `All ${totalAssertions} assertions passed`
  : `${failedAssertions} of ${totalAssertions} assertions failed (${passRate}% pass rate)`;

function esc(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function statCard(label, value, color) {
  return `
    <td align="center" style="padding:14px 8px; background:#ffffff; border-radius:8px;">
      <div style="font-size:30px; font-weight:bold; color:${color};">${value}</div>
      <div style="font-size:11px; letter-spacing:0.5px; color:#7f8c8d; margin-top:4px;">${label}</div>
    </td>
    <td style="width:10px;"></td>`;
}

const failureRows = failures.map((f, i) => {
  const rowBg = i % 2 === 0 ? "#fff5f5" : "#ffffff";
  return `
    <tr style="background:${rowBg};">
      <td style="padding:10px 12px; border-bottom:1px solid #f1d4d4; font-size:13px; color:${DARK}; font-weight:600;">${esc(f.source && f.source.name)}</td>
      <td style="padding:10px 12px; border-bottom:1px solid #f1d4d4; font-size:12px; color:${RED}; font-weight:600; white-space:nowrap;">${esc(f.error && f.error.name)}</td>
      <td style="padding:10px 12px; border-bottom:1px solid #f1d4d4; font-size:12px; color:#555;">${esc(f.error && f.error.message)}</td>
    </tr>`;
}).join("");

const failureTable = failures.length === 0 ? "" : `
  <h3 style="color:${DARK}; font-size:15px; margin:28px 0 10px;">Failure Details</h3>
  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; background:#ffffff; border-radius:8px; overflow:hidden;">
    <tr style="background:${DARK};">
      <th align="left" style="padding:10px 12px; font-size:12px; color:#ffffff;">Request</th>
      <th align="left" style="padding:10px 12px; font-size:12px; color:#ffffff;">Type</th>
      <th align="left" style="padding:10px 12px; font-size:12px; color:#ffffff;">Message</th>
    </tr>
    ${failureRows}
  </table>`;

const html = `
<div style="font-family:Arial,Helvetica,sans-serif; max-width:680px; margin:0 auto;">
  <div style="background-color:#ff5f6d; background:linear-gradient(135deg,#ff7e00,#ff4f81); padding:24px; border-radius:10px 10px 0 0; text-align:center;">
    <div style="font-size:20px; color:#ffffff; font-weight:bold;">Orange Liberia RetailCode API Regression</div>
    <div style="font-size:13px; color:#ffe8d6; margin-top:4px;">Weekly automated run &middot; ${new Date().toUTCString()}</div>
  </div>
  <div style="background:#ecf0f1; padding:24px; border-radius:0 0 10px 10px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        ${statCard("REQUESTS", totalRequests, BLUE)}
        ${statCard("PASSED", passedAssertions, GREEN)}
        ${statCard("FAILED", failedAssertions, RED)}
        ${statCard("PASS RATE", passRate + "%", DARK)}
      </tr>
    </table>

    <div style="margin-top:18px; padding:14px; border-radius:8px; background:${bannerColor}; color:#ffffff; font-weight:bold; text-align:center; font-size:14px;">
      ${failedAssertions === 0 ? "&#9989;" : "&#9888;&#65039;"} ${bannerText}
    </div>

    ${failureTable}

    <div style="text-align:center; margin-top:24px; font-size:11px; color:#95a5a6;">
      Full interactive report attached (regression-report.html) and committed to the repository.
    </div>
  </div>
</div>`;

fs.writeFileSync(outPath, html.trim());
console.log(`Email summary written to ${outPath}`);
