import assert from "node:assert/strict";
import test from "node:test";
import {
  entityIdSchema,
  exchangeRateUpdateSchema,
  orderSchema,
  shippingRateUpdateSchema,
  trackingEventSchema,
  trackingLookupSchema,
} from "../src/lib/validations";

test("entity IDs accept application IDs and reject unsafe input", () => {
  assert.equal(entityIdSchema.safeParse("cm123_example-ID").success, true);
  assert.equal(entityIdSchema.safeParse("../admin").success, false);
  assert.equal(entityIdSchema.safeParse("id' OR 1=1").success, false);
  assert.equal(entityIdSchema.safeParse("a".repeat(129)).success, false);
});

test("tracking lookups normalize valid values and reject oversized input", () => {
  assert.equal(trackingLookupSchema.parse(" pnz-2026-001 "), "PNZ-2026-001");
  assert.equal(trackingLookupSchema.safeParse("PNZ 2026").success, false);
  assert.equal(trackingLookupSchema.safeParse("x".repeat(101)).success, false);
});

test("tariff updates reject non-finite and out-of-range values", () => {
  assert.equal(exchangeRateUpdateSchema.safeParse({ id: "shein-rate", rate: 655 }).success, true);
  assert.equal(exchangeRateUpdateSchema.safeParse({ id: "shein-rate", rate: Number.NaN }).success, false);
  assert.equal(exchangeRateUpdateSchema.safeParse({ id: "shein-rate", rate: -1 }).success, false);
  assert.equal(shippingRateUpdateSchema.safeParse({ id: "luxe", percentage: 101 }).success, false);
  assert.equal(shippingRateUpdateSchema.safeParse({ id: "standard", price: 9_800 }).success, true);
});

test("orders and tracking events require valid business dates", () => {
  const order = {
    trackingNumber: "pnz-2026-001",
    customerName: "Client Test",
    customerPhone: "+2250700000000",
    destinationCity: "Abidjan",
    destinationCountry: "Côte d'Ivoire",
    status: "PENDING",
    orderDate: "2026-08-10",
  };
  assert.equal(orderSchema.parse(order).trackingNumber, "PNZ-2026-001");
  assert.equal(orderSchema.parse({ ...order, weight: "" }).weight, undefined);
  assert.equal(orderSchema.safeParse({ ...order, orderDate: "10/08/2026" }).success, false);
  assert.equal(trackingEventSchema.safeParse({
    orderId: "order-1",
    status: "PURCHASED",
    title: "Commande achetée",
    eventDate: "2026-08-10T12:30",
  }).success, true);
  assert.equal(trackingEventSchema.parse({
    orderId: "order-1",
    status: "PURCHASED",
    title: "Commande achetée",
    eventDate: "2026-08-12",
  }).eventDate, "2026-08-12T12:00:00");
});
