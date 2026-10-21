import test from "node:test";
import assert from "node:assert/strict";
import { calculateEstimate, getProjectArea } from "../src/calculator.js";
import { client } from "../src/client-config.js";

const selection = {
  type: "driveway",
  measurement: "area",
  area: 400,
  finish: "broom",
  removal: false,
  demo: true,
};

test("driveway uses square feet and the configured installed rates", () => {
  assert.deepEqual(calculateEstimate(client.pricing, selection), {
    available: true,
    low: 3200,
    high: 4800,
  });
});
test("length × width calculates exactly the same square-foot price", () => {
  const dimensions = {
    ...selection,
    measurement: "dimensions",
    length: 20,
    width: 20,
    area: 999,
  };
  assert.equal(getProjectArea(client.pricing, dimensions), 400);
  assert.deepEqual(
    calculateEstimate(client.pricing, dimensions),
    calculateEstimate(client.pricing, selection),
  );
});
test("decimal dimensions produce a stable area", () => {
  assert.equal(
    getProjectArea(client.pricing, {
      measurement: "dimensions",
      length: 20.5,
      width: 15.2,
    }),
    311.6,
  );
});
test("finish upgrades and removal are added once per square foot", () => {
  assert.deepEqual(
    calculateEstimate(client.pricing, {
      ...selection,
      finish: "smooth",
      removal: true,
    }),
    { available: true, low: 4400, high: 7200 },
  );
  assert.deepEqual(
    calculateEstimate(client.pricing, {
      ...selection,
      measurement: "dimensions",
      length: 20,
      width: 30,
      finish: "smooth",
      removal: true,
    }),
    { available: true, low: 6600, high: 10800 },
  );
});
test("minimum charge applies after extras to each end of the range", () => {
  assert.deepEqual(
    calculateEstimate(client.pricing, {
      ...selection,
      area: 50,
      removal: true,
    }),
    { available: true, low: 1500, high: 2000 },
  );
});
test("each project type selects its actual configured rate", () => {
  assert.deepEqual(
    calculateEstimate(client.pricing, { ...selection, type: "patio" }),
    { available: true, low: 4000, high: 6000 },
  );
  assert.deepEqual(
    calculateEstimate(client.pricing, { ...selection, type: "walkway" }),
    { available: true, low: 3600, high: 5600 },
  );
});
test("an included finish is never charged a second time", () => {
  const pricing = {
    ...client.pricing,
    finishes: [
      { id: "broom", included: true, perSqFt: { low: 100, high: 100 } },
    ],
  };
  assert.deepEqual(calculateEstimate(pricing, selection), {
    available: true,
    low: 3200,
    high: 4800,
  });
});
test("rejects invalid areas, dimensions and unsupported measurement methods", () => {
  for (const area of [0, 49, 5001, -1, NaN, Infinity])
    assert.throws(() =>
      calculateEstimate(client.pricing, { ...selection, area }),
    );
  for (const length of [0, -1, 501, NaN, Infinity])
    assert.throws(() =>
      getProjectArea(client.pricing, {
        measurement: "dimensions",
        length,
        width: 20,
      }),
    );
  assert.throws(() =>
    getProjectArea(client.pricing, { measurement: "other", area: 400 }),
  );
  assert.throws(() =>
    calculateEstimate(client.pricing, { ...selection, finish: "unknown" }),
  );
});
test("missing, partial and unapproved production rates use quote-only mode", () => {
  assert.deepEqual(calculateEstimate(null, selection), { available: false });
  assert.deepEqual(
    calculateEstimate({ ...client.pricing, rates: {} }, selection),
    { available: false },
  );
  assert.deepEqual(
    calculateEstimate(client.pricing, { ...selection, type: "unpriced" }),
    { available: false },
  );
  assert.deepEqual(
    calculateEstimate(client.pricing, { ...selection, demo: false }),
    { available: false },
  );
});
test("approved rates are available in production", () => {
  assert.deepEqual(
    calculateEstimate(
      { ...client.pricing, approved: true },
      { ...selection, demo: false },
    ),
    { available: true, low: 3200, high: 4800 },
  );
});
test("unsupported extras and incomplete or reversed rates cannot produce a price", () => {
  assert.throws(() =>
    calculateEstimate(
      { ...client.pricing, extras: {} },
      { ...selection, removal: true },
    ),
  );
  assert.throws(() =>
    calculateEstimate(
      { ...client.pricing, rates: { driveway: { low: 100, high: 1 } } },
      selection,
    ),
  );
  assert.throws(() =>
    calculateEstimate(
      { ...client.pricing, rates: { driveway: { low: -1, high: 12 } } },
      selection,
    ),
  );
  assert.throws(() =>
    calculateEstimate(
      { ...client.pricing, rates: { driveway: { low: 8 } } },
      selection,
    ),
  );
});
