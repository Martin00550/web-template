import test from "node:test";
import assert from "node:assert/strict";
import { calculateEstimate, getProjectArea } from "../src/calculator.js";
import { client } from "../src/client-config.js";

const selection = {
  type: "patio",
  measurement: "area",
  area: 30,
  preparation: "sound",
  extras: [],
  demo: true,
};
test("patio rates use project area m², not an unrelated garden area", () => {
  assert.deepEqual(calculateEstimate(client.pricing, selection), {
    available: true,
    low: 2550,
    high: 3750,
  });
});
test("length × width and direct m² give the same result", () => {
  const dimensions = {
    ...selection,
    measurement: "dimensions",
    length: 6,
    width: 5,
    area: 999,
  };
  assert.equal(getProjectArea(client.pricing, dimensions), 30);
  assert.deepEqual(
    calculateEstimate(client.pricing, dimensions),
    calculateEstimate(client.pricing, selection),
  );
});
test("decimal measurements produce stable square metres", () => {
  assert.equal(
    getProjectArea(client.pricing, {
      measurement: "dimensions",
      length: 5.2,
      width: 2.4,
    }),
    12.48,
  );
});
test("extra preparation adds only its configured per-m² allowance", () => {
  assert.deepEqual(
    calculateEstimate(client.pricing, { ...selection, preparation: "extra" }),
    { available: true, low: 2910, high: 4350 },
  );
});
test("minimum charges apply to each bound after all allowances", () => {
  assert.deepEqual(
    calculateEstimate(client.pricing, {
      ...selection,
      area: 5,
      preparation: "extra",
    }),
    { available: true, low: 650, high: 950 },
  );
});
test("lawn selects its own low/high rates", () => {
  assert.deepEqual(
    calculateEstimate(client.pricing, { ...selection, type: "lawn" }),
    { available: true, low: 650, high: 950 },
  );
});
test("included preparation cannot be charged twice", () => {
  const pricing = {
    ...client.pricing,
    preparation: [
      { id: "sound", included: true, perSqM: { low: 100, high: 100 } },
    ],
  };
  assert.deepEqual(calculateEstimate(pricing, selection), {
    available: true,
    low: 2550,
    high: 3750,
  });
});
test("optional flat and per-m² extras are each applied once", () => {
  const pricing = {
    ...client.pricing,
    extras: [
      { id: "flat", unit: "flat", low: 100, high: 200 },
      { id: "surface", unit: "m2", low: 2, high: 3 },
    ],
  };
  assert.deepEqual(
    calculateEstimate(pricing, { ...selection, extras: ["flat", "surface"] }),
    { available: true, low: 2710, high: 4040 },
  );
  assert.deepEqual(
    calculateEstimate(pricing, {
      ...selection,
      area: 5,
      extras: ["flat", "surface"],
    }),
    { available: true, low: 650, high: 950 },
  );
});
test("invalid surface sizes and methods are rejected", () => {
  for (const area of [0, 4, 1001, -1, NaN, Infinity])
    assert.throws(() =>
      calculateEstimate(client.pricing, { ...selection, area }),
    );
  for (const length of [0, -1, 101, NaN, Infinity])
    assert.throws(() =>
      getProjectArea(client.pricing, {
        measurement: "dimensions",
        length,
        width: 3,
      }),
    );
  assert.throws(() =>
    getProjectArea(client.pricing, { measurement: "floor-plan", area: 30 }),
  );
  assert.throws(() =>
    calculateEstimate(client.pricing, { ...selection, preparation: "unknown" }),
  );
});
test("unpriced services, absent rates and unapproved production pricing request a quote", () => {
  assert.deepEqual(calculateEstimate(null, selection), { available: false });
  assert.deepEqual(
    calculateEstimate({ ...client.pricing, rates: {} }, selection),
    { available: false },
  );
  assert.deepEqual(
    calculateEstimate(client.pricing, {
      ...selection,
      type: "planting",
      area: null,
    }),
    { available: false },
  );
  assert.deepEqual(
    calculateEstimate(client.pricing, { ...selection, demo: false }),
    { available: false },
  );
});
test("approved production rates work without adding a second VAT amount", () => {
  assert.deepEqual(
    calculateEstimate(
      { ...client.pricing, approved: true },
      { ...selection, demo: false },
    ),
    { available: true, low: 2550, high: 3750 },
  );
});
test("unknown/duplicate extras and invalid or reversed prices do not produce an estimate", () => {
  assert.throws(() =>
    calculateEstimate(client.pricing, { ...selection, extras: ["unpriced"] }),
  );
  assert.throws(() =>
    calculateEstimate(client.pricing, { ...selection, extras: ["x", "x"] }),
  );
  for (const rate of [
    { low: -1, high: 28 },
    { low: 18 },
    { low: 100, high: 1 },
  ])
    assert.throws(() =>
      calculateEstimate(
        { ...client.pricing, rates: { patio: rate } },
        selection,
      ),
    );
});
