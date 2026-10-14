import { readFileSync, appendFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export function assessZapReport(report) {
  if (!Array.isArray(report?.site) || report.site.length === 0) {
    throw new Error("ZAP did not report any scanned sites");
  }
  const counts = [0, 0, 0, 0];
  const highRiskIds = new Set();
  for (const site of report.site) {
    if (!Array.isArray(site.alerts)) throw new Error("Malformed ZAP alerts");
    for (const alert of site.alerts) {
      const risk = String(alert.riskcode);
      if (!/^[0-3]$/.test(risk)) throw new Error("Unrecognized ZAP risk code");
      counts[Number(risk)]++;
      if (risk === "3") {
        // Only numeric scanner identifiers enter logs, never response bodies,
        // URLs, token parameters, evidence, or externally supplied alert text.
        const id = String(alert.pluginid);
        highRiskIds.add(/^\d+$/.test(id) ? id : "unknown");
      }
    }
  }
  return { counts, highRiskIds: [...highRiskIds], passed: counts[3] === 0 };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = assessZapReport(JSON.parse(readFileSync(process.argv[2] || "report_json.json", "utf8")));
    const summary = `ZAP passive findings: ${result.counts[3]} high, ${result.counts[2]} medium, ${result.counts[1]} low, ${result.counts[0]} informational.\n`;
    console.log(summary.trim());
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
    if (!result.passed) throw new Error(`High-risk passive alerts require investigation: ${result.highRiskIds.join(", ")}`);
    console.log("PASS: no high-risk passive alerts; review lower-risk findings in the scan artifact.");
  } catch {
    // A missing/invalid report cannot be treated as a clean scan.
    console.error("FAIL: passive scan report missing, malformed, or contains high-risk alerts. Review the scan artifact.");
    process.exitCode = 1;
  }
}
