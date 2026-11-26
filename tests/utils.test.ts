import assert from "node:assert/strict";
import test from "node:test";
import { formatDateInput, getWhatsAppLink } from "../src/lib/utils";

test("getWhatsAppLink appends the message whether or not the link already has a query", () => {
  assert.equal(getWhatsAppLink("https://wa.me/33600000000"), "https://wa.me/33600000000");
  assert.equal(getWhatsAppLink("https://wa.me/33600000000", "Bonjour à vous"), "https://wa.me/33600000000?text=Bonjour%20%C3%A0%20vous");
  assert.equal(getWhatsAppLink("https://wa.me/33600000000?lang=fr", "Bonjour"), "https://wa.me/33600000000?lang=fr&text=Bonjour");
});

test("formatDateInput uses the local calendar date", () => {
  assert.equal(formatDateInput(new Date(2026, 7, 10, 23, 59)), "2026-08-10");
  assert.equal(formatDateInput(new Date(2026, 0, 2, 0, 1)), "2026-01-02");
});
