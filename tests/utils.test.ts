import assert from "node:assert/strict";
import test from "node:test";
import { formatDateInput } from "../src/lib/utils";

test("formatDateInput uses the local calendar date", () => {
  assert.equal(formatDateInput(new Date(2026, 7, 10, 23, 59)), "2026-08-10");
  assert.equal(formatDateInput(new Date(2026, 0, 2, 0, 1)), "2026-01-02");
});