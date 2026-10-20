import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import config from '../vite.config.js';
import { client } from '../src/client-config.js';

test('demo metadata stays non-indexable', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const result = config.plugins[0].transformIndexHtml(html);
  assert.match(result, /noindex, nofollow/);
});

test('production metadata is emitted as escaped static HTML', () => {
  const original = structuredClone(client);
  try {
    client.demo = false;
    client.business.approved = true;
    client.business.name = 'A & B Fencing';
    client.business.description = 'Approved & accurate description';
    client.business.website = 'https://fencing.example';
    client.services[0].sample = false;
    client.contact.mode = 'endpoint';
    client.contact.endpoint = '/api/quote';
    const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    const result = config.plugins[0].transformIndexHtml(html);
    assert.match(result, /<title>A &amp; B Fencing/);
    assert.match(result, /content="Approved &amp; accurate description"/);
    assert.match(result, /rel="canonical" href="https:\/\/fencing.example"/);
    assert.doesNotMatch(result, /noindex|website demo: compare/i);
  } finally { Object.assign(client, original); }
});

test('production build refuses unapproved sample business configuration', () => {
  client.demo = false;
  try { assert.throws(() => config.plugins[0].transformIndexHtml(''), /Complete approved/); }
  finally { client.demo = true; }
});
