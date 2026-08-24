import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const envelope = JSON.parse(readFileSync("data/processed/admissions/fact_noncurrent_pathway.json", "utf8"));

test("noncurrent shares reconcile with official counts", () => {
  for (const row of envelope.data) {
    const gsatShare = Number((row.gsat_noncurrent_registered / row.gsat_total_registered * 100).toFixed(2));
    const admissionRate = Number((row.distribution_noncurrent_admitted / row.distribution_noncurrent_registered * 100).toFixed(2));
    const admittedShare = Number((row.distribution_noncurrent_admitted / row.distribution_total_admitted * 100).toFixed(2));
    assert.equal(gsatShare, row.gsat_noncurrent_share, `${row.academic_year} 學測非應屆占比`);
    assert.equal(admissionRate, row.distribution_noncurrent_admission_rate, `${row.academic_year} 分發非應屆錄取率`);
    assert.equal(admittedShare, row.distribution_noncurrent_admitted_share, `${row.academic_year} 非應屆占錄取生`);
  }
});
