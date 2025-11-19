(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ImageEditorMath = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  function fitCoverScale(iw, ih, fw, fh, rotRad) {
    if (!iw || !ih || !fw || !fh) return 1;
    const angle = rotRad % (Math.PI * 2);
    const cos = Math.abs(Math.cos(angle));
    const sin = Math.abs(Math.sin(angle));
    const rotatedWidth = iw * cos + ih * sin;
    const rotatedHeight = iw * sin + ih * cos;
    return Math.max(fw / rotatedWidth, fh / rotatedHeight);
  }

  function clamp(value, min, max) {
    if (min > max) {
      const temp = min;
      min = max;
      max = temp;
    }
    return Math.min(max, Math.max(min, value));
  }

  return { fitCoverScale, clamp };
});
