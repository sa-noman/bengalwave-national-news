import test from "node:test";
import assert from "node:assert/strict";
import { assessZapReport } from "../scripts/check-zap-report.mjs";

test("passive scan blocks high-risk findings but retains lower-risk triage", () => {
  const result = assessZapReport({ site: [{ alerts: [
    { riskcode: "1", pluginid: "10015" },
    { riskcode: "2", pluginid: "10055" },
    { riskcode: "3", pluginid: "40012" },
  ] }] });
  assert.equal(result.passed, false);
  assert.deepEqual(result.counts, [0, 1, 1, 1]);
  assert.deepEqual(result.highRiskIds, ["40012"]);
  assert.equal(assessZapReport({ site: [{ alerts: [] }] }).passed, true);
});

test("passive scan fails closed on incomplete or unknown report schemas", () => {
  for (const report of [{}, { site: [] }, { site: [{}] },
    { site: [{ alerts: [{ riskcode: "unknown" }] }] },
    { site: [{ alerts: [{ riskcode: "" }] }] }]) {
    assert.throws(() => assessZapReport(report));
  }
});

test("untrusted scan evidence never enters gate identifiers", () => {
  const result = assessZapReport({ site: [{ alerts: [{
    riskcode: 3, pluginid: "::error::secret", evidence: "sensitive", url: "https://example.com/?token=secret",
  }] }] });
  assert.deepEqual(result.highRiskIds, ["unknown"]);
  assert.ok(!JSON.stringify(result).includes("secret"));
});
