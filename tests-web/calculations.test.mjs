import assert from "node:assert/strict";
import test from "node:test";

test("PR tied-score interval formula", () => {
  const percentage = 16.42;
  const cumulativeLow = 65.72;
  assert.equal(Number((cumulativeLow - percentage).toFixed(2)), 49.3);
});

test("academic year conversion", () => {
  assert.equal(115 + 1911, 2026);
});
