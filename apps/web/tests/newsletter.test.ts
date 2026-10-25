import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SubscribeSchema } from '../src/lib/newsletter/schema';

const base = { email: '  Fan@Example.com ', topics: ['club'], locale: 'fr', consent: true, startedAt: Date.now() - 5000 };

test('valid signup is normalized', () => {
  const r = SubscribeSchema.safeParse(base);
  assert.ok(r.success);
  assert.equal(r.success && r.data.email, 'fan@example.com');
});

test('consent, topics, email and honeypot are enforced', () => {
  assert.equal(SubscribeSchema.safeParse({ ...base, consent: false }).success, false);
  assert.equal(SubscribeSchema.safeParse({ ...base, topics: [] }).success, false);
  assert.equal(SubscribeSchema.safeParse({ ...base, topics: ['spam'] }).success, false);
  assert.equal(SubscribeSchema.safeParse({ ...base, email: 'nope' }).success, false);
  assert.equal(SubscribeSchema.safeParse({ ...base, website: 'http://spam' }).success, false);
  assert.equal(SubscribeSchema.safeParse({ ...base, source: '<script>' }).success, false);
});
