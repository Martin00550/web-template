import test from "node:test";
import assert from "node:assert/strict";
import { calculateEstimate } from "../src/calculator.js";
import { client } from "../src/client-config.js";

const selection = {
  type: "cedar",
  length: 150,
  height: 6,
  gates: 0,
  removal: false,
  demo: true,
};
test("sample cedar pricing uses both configured per-foot rates", () => {
  assert.deepEqual(calculateEstimate(client.pricing, selection), {
    available: true,
    low: 4200,
    high: 5700,
  });
});
test("height, gates and removal are applied in the documented order", () => {
  assert.deepEqual(
    calculateEstimate(client.pricing, {
      ...selection,
      length: 200,
      height: 8,
      gates: 2,
      removal: true,
    }),
    { available: true, low: 8100, high: 11400 },
  );
});
test("minimum job charges apply to each end of the range", () => {
  assert.deepEqual(
    calculateEstimate(client.pricing, { ...selection, length: 10 }),
    { available: true, low: 1500, high: 2000 },
  );
});
test("vinyl, aluminum and decimal measurements use the selected rates", () => {
  assert.equal(
    calculateEstimate(client.pricing, {
      ...selection,
      type: "vinyl",
      length: 100,
    }).low,
    3200,
  );
  assert.equal(
    calculateEstimate(client.pricing, {
      ...selection,
      type: "aluminum",
      length: 100,
    }).high,
    5000,
  );
  assert.equal(
    calculateEstimate(client.pricing, { ...selection, length: 150.5 }).low,
    4214,
  );
});
test("rejects out-of-range and invalid inputs", () => {
  for (const length of [0, 9, 1001, NaN, Infinity, -100])
    assert.throws(() =>
      calculateEstimate(client.pricing, { ...selection, length }),
    );
  for (const gates of [-1, 6, 1.5, Infinity])
    assert.throws(() =>
      calculateEstimate(client.pricing, { ...selection, gates }),
    );
  assert.throws(() =>
    calculateEstimate(client.pricing, { ...selection, type: "unsupported" }),
  );
  assert.throws(() =>
    calculateEstimate(client.pricing, { ...selection, height: 100 }),
  );
});
test("missing and unapproved production pricing never produce a numeric estimate", () => {
  assert.deepEqual(calculateEstimate(null, selection), { available: false });
  assert.deepEqual(
    calculateEstimate({ ...client.pricing, rates: {} }, selection),
    { available: false },
  );
  assert.deepEqual(
    calculateEstimate(client.pricing, { ...selection, demo: false }),
    { available: false },
  );
});
test("approved rates are available in production", () => {
  assert.equal(
    calculateEstimate(
      { ...client.pricing, approved: true },
      { ...selection, demo: false },
    ).available,
    true,
  );
});
test("invalid price ranges cannot silently produce misleading output", () => {
  assert.throws(() =>
    calculateEstimate(
      { ...client.pricing, rates: { cedar: { low: 100, high: 1 } } },
      selection,
    ),
  );
});
