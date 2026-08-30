import assert from "node:assert/strict";
import test from "node:test";
import { computeDevis, convertEurToFcfa, formatFcfa, DEVIS_FCFA_PER_EUR } from "../src/lib/devis";

test("fixed rate is 670 FCFA per EUR", () => {
  assert.equal(DEVIS_FCFA_PER_EUR, 670);
});

test("convertEurToFcfa matches the documented examples", () => {
  assert.equal(convertEurToFcfa(100), 67_000);
  assert.equal(convertEurToFcfa(250), 167_500);
  assert.equal(convertEurToFcfa(1_000), 670_000);
});

test("computeDevis sums cart amount and shipping fee per line", () => {
  const result = computeDevis([
    { store: "Zara", cartAmount: 120, shippingFee: 0 },
    { store: "Amazon", cartAmount: 80, shippingFee: 0 },
  ]);

  assert.equal(result.lines[0].totalEur, 120);
  assert.equal(result.lines[0].totalFcfa, 80_400);
  assert.equal(result.lines[1].totalFcfa, 53_600);
  assert.equal(result.totalEur, 200);
  assert.equal(result.totalFcfa, 134_000);
});

test("computeDevis treats a missing shipping fee as 0", () => {
  const result = computeDevis([{ store: "Nike", cartAmount: 250, shippingFee: 10 }]);
  assert.equal(result.totalArticlesEur, 250);
  assert.equal(result.totalShippingEur, 10);
  assert.equal(result.totalEur, 260);
  assert.equal(result.totalFcfa, 174_200);
});

test("computeDevis falls back to a generic store label when empty", () => {
  const result = computeDevis([{ cartAmount: 50 }]);
  assert.equal(result.lines[0].store, "Boutique 1");
});

test("formatFcfa inserts thousand separators", () => {
  assert.equal(formatFcfa(67_000), "67 000 FCFA");
  assert.equal(formatFcfa(1_005_000), "1 005 000 FCFA");
});
