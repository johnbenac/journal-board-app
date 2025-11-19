const { clamp, fitCoverScale } = require('../imageEditorMath');

test('clamp keeps values in range', () => {
  assert.strictEqual(clamp(5, 1, 10), 5);
  assert.strictEqual(clamp(-5, 1, 10), 1);
  assert.strictEqual(clamp(50, 1, 10), 10);
});

test('fitCoverScale matches simple orientation expectations', () => {
  const fw = 750;
  const fh = 1050;
  const iw = 4000;
  const ih = 3000;
  const s0 = fitCoverScale(iw, ih, fw, fh, 0);
  const expected0 = Math.max(fw / iw, fh / ih);
  assert.ok(Math.abs(s0 - expected0) < 1e-6);

  const s90 = fitCoverScale(iw, ih, fw, fh, Math.PI / 2);
  const expected90 = Math.max(fw / ih, fh / iw);
  assert.ok(Math.abs(s90 - expected90) < 1e-6);
});

test('fitCoverScale handles diagonal rotations', () => {
  const fw = 750;
  const fh = 1050;
  const s45 = fitCoverScale(1000, 500, fw, fh, Math.PI / 4);
  const s135 = fitCoverScale(1000, 500, fw, fh, (3 * Math.PI) / 4);
  assert.ok(Number.isFinite(s45));
  assert.ok(Number.isFinite(s135));
  assert.ok(s45 > 0 && s135 > 0);
});
