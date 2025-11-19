const { fitCoverScale, clamp } = require('../imageEditorMath');

test('fitCoverScale covers frame at 0 degrees', () => {
  const result = fitCoverScale(4000, 3000, 750, 1050, 0);
  assert(result >= 750 / 4000);
  assert(result >= 1050 / 3000);
});

test('fitCoverScale is periodic every full rotation', () => {
  const base = fitCoverScale(3200, 1800, 750, 1050, 0);
  const wrapped = fitCoverScale(3200, 1800, 750, 1050, Math.PI * 2);
  assert(Math.abs(base - wrapped) < 1e-6);
});

test('fitCoverScale matches swapping dimensions at 90°', () => {
  const rotated = fitCoverScale(1600, 900, 750, 1050, Math.PI / 2);
  const swapped = fitCoverScale(900, 1600, 750, 1050, 0);
  assert(Math.abs(rotated - swapped) < 1e-6);
});

test('clamp keeps value between bounds', () => {
  assert.strictEqual(clamp(5, 1, 10), 5);
  assert.strictEqual(clamp(-3, 1, 10), 1);
  assert.strictEqual(clamp(50, 1, 10), 10);
});
