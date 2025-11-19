const { fitCoverScale, clamp } = require('../imageEditorMath.js');

test('fitCoverScale covers taller frame at 0 degrees', () => {
  const result = fitCoverScale(4000, 2000, 750, 1050, 0);
  const expected = Math.max(750 / 4000, 1050 / 2000);
  assert(Math.abs(result - expected) < 1e-9);
});

test('fitCoverScale 90° rotation matches swapped dimensions', () => {
  const swapped = fitCoverScale(2000, 4000, 750, 1050, 0);
  const result90 = fitCoverScale(4000, 2000, 750, 1050, Math.PI / 2);
  assert(Math.abs(result90 - swapped) < 1e-9);
});

test('fitCoverScale repeats every 180 degrees', () => {
  const resA = fitCoverScale(2000, 1000, 600, 400, Math.PI / 4);
  const resB = fitCoverScale(2000, 1000, 600, 400, Math.PI / 4 + Math.PI);
  assert(Math.abs(resA - resB) < 1e-9);
});

test('clamp keeps values within range', () => {
  assert.strictEqual(clamp(5, 1, 10), 5);
  assert.strictEqual(clamp(-3, 1, 10), 1);
  assert.strictEqual(clamp(15, 1, 10), 10);
});

test('clamp tolerates inverted bounds', () => {
  assert.strictEqual(clamp(5, 10, 1), 5);
});
