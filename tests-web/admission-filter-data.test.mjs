import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const universityEnvelope = JSON.parse(
  readFileSync("data/processed/admissions/fact_university_admission.json", "utf8"),
);
const groupEnvelope = JSON.parse(
  readFileSync("data/processed/admissions/fact_group_admission.json", "utf8"),
);

const officialTotals = new Map([
  [111, 25028],
  [112, 36338],
  [113, 35076],
  [114, 32497],
  [115, 32257],
]);

test("university admission totals reconcile with official annual totals", () => {
  for (const [year, expected] of officialTotals) {
    const actual = universityEnvelope.data
      .filter((row) => row.academic_year === year)
      .reduce((sum, row) => sum + row.admitted_count, 0);
    assert.equal(actual, expected, `${year} 學年度錄取總數`);
  }
});

test("university filter dimensions are complete and valid", () => {
  assert.equal(universityEnvelope.data.length, 305);
  for (const row of universityEnvelope.data) {
    assert.ok(["公立", "私立"].includes(row.ownership));
    assert.ok(row.region.length > 0);
    assert.ok(row.university.length > 0);
    assert.ok(row.program_count > 0);
    assert.ok(row.admitted_count > 0);
  }
});

test("official 115 group statistics contain all 19 groups", () => {
  assert.equal(groupEnvelope.data.length, 19);
  assert.equal(new Set(groupEnvelope.data.map((row) => row.group)).size, 19);
  for (const row of groupEnvelope.data) {
    assert.equal(row.academic_year, 115);
    assert.ok(row.admitted_count > 0);
    assert.ok(row.capacity_usage_rate >= 0 && row.capacity_usage_rate <= 100);
  }
});
