import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clipText } from '../src/lib/text';

test('clipping never splits an emoji (hydration regression: 🇲🇦 at the cut)', () => {
  const caption = 'والانتماء 🇲🇦 🔴⚪';
  for (let max = 0; max <= caption.length; max++) {
    const out = clipText(caption, max);
    assert.ok(out.length <= max, `≤ ${max}`);
    assert.ok(caption.startsWith(out));
    assert.ok(!/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(out), `no lone surrogate at ${max}`);
    assert.ok(!out.endsWith('🇲'), `no half flag at ${max}`);
  }
});

test('short text is returned as is', () => {
  assert.equal(clipText('Dima Wydad', 140), 'Dima Wydad');
  assert.equal(clipText('', 10), '');
});
