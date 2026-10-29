import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import config from "../vite.config.js";
import { client } from "../src/client-config.js";
import { launchIssues, isConfiguredText } from "../src/client-readiness.js";
const html = () =>
  readFileSync(new URL("../index.html", import.meta.url), "utf8");
const makeLive = () => {
  client.demo = false;
  Object.assign(client.business, {
    approved: true,
    name: "A & B Painting",
    primaryCity: "Wellington",
    serviceAreas: ["Wellington"],
    phone: "+64 21 555 0100",
    email: "painter@example.com",
    logo: "/favicon.svg",
    website: "https://painting.example",
    description: "Approved & accurate description",
  });
  client.services[0].sample = false;
  client.hero.kind = "client";
  Object.assign(client.contact, {
    mode: "endpoint",
    endpoint: "/api/quote",
    privacyUrl: "/privacy",
  });
};
test("demo metadata uses the configured name/location and stays non-indexable", () => {
  const result = config.plugins[0].transformIndexHtml(html());
  assert.match(result, /Example Painting Co\./);
  assert.match(result, /\[City\]/);
  assert.match(result, /noindex, nofollow/);
  assert.doesNotMatch(result, /concrete|Texas|USD|McKinney/i);
});
test("production metadata is static, escaped and uses accurate painter schema", () => {
  const original = structuredClone(client);
  try {
    makeLive();
    const result = config.plugins[0].transformIndexHtml(html());
    assert.match(result, /<title>A &amp; B Painting/);
    assert.match(result, /content="Approved &amp; accurate description"/);
    assert.match(result, /rel="canonical" href="https:\/\/painting.example"/);
    assert.match(result, /"@type":"HousePainter"/);
    assert.doesNotMatch(result, /noindex|aggregateRating|\[City\]|\[Phone\]/);
  } finally {
    Object.assign(client, original);
  }
});
test("all bracket placeholders are recognised and block a live build", () => {
  assert.equal(isConfiguredText("[Phone]"), false);
  assert.equal(isConfiguredText("[Logo]"), false);
  assert.equal(isConfiguredText(""), false);
  assert.ok(launchIssues(client).length > 0);
  const original = structuredClone(client);
  try {
    client.demo = false;
    assert.throws(
      () => config.plugins[0].transformIndexHtml(html()),
      /Complete approved/,
    );
  } finally {
    Object.assign(client, original);
  }
});
test("clearing only approval flags cannot publish placeholder contacts or generated hero work", () => {
  const original = structuredClone(client);
  try {
    makeLive();
    assert.deepEqual(launchIssues(client), []);
    client.business.phone = "[Phone]";
    assert.ok(launchIssues(client).includes("real phone number"));
    client.business.phone = "+64 21 555 0100";
    client.hero.kind = "generated";
    assert.ok(launchIssues(client).includes("genuine client hero photography"));
  } finally {
    Object.assign(client, original);
  }
});
