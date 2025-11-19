const { fitCoverScale, clamp } = require('../imageEditorMath');

function approxEqual(a, b, epsilon = 1e-6) {
  assert(Math.abs(a - b) < epsilon, `Expected ${a} to be approximately ${b}`);
}

test('fitCoverScale covers unrotated frame', () => {
  const scale = fitCoverScale(4000, 3000, 750, 1050, 0);
  assert(scale >= 750 / 4000);
  assert(scale >= 1050 / 3000);
});

test('fitCoverScale rotated 90 degrees matches swapped dimensions', () => {
  const rotated = fitCoverScale(4000, 3000, 750, 1050, Math.PI / 2);
  const swapped = fitCoverScale(3000, 4000, 750, 1050, 0);
  approxEqual(rotated, swapped);
});

test('fitCoverScale symmetric across rotations', () => {
  const angle = Math.PI / 4;
  const forward = fitCoverScale(1000, 500, 200, 400, angle);
  const reverse = fitCoverScale(1000, 500, 200, 400, -angle);
  approxEqual(forward, reverse);
});

test('clamp constrains values to a range', () => {
  assert.strictEqual(clamp(5, 1, 10), 5);
  assert.strictEqual(clamp(-1, 1, 10), 1);
  assert.strictEqual(clamp(20, 1, 10), 10);
});
