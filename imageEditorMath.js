(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ImageEditorMath = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  function fitCoverScale(iw, ih, fw, fh, rotRad) {
    if (!iw || !ih || !fw || !fh) return 1;
    const cos = Math.abs(Math.cos(rotRad));
    const sin = Math.abs(Math.sin(rotRad));
    const rotatedW = iw * cos + ih * sin;
    const rotatedH = iw * sin + ih * cos;
    return Math.max(fw / rotatedW, fh / rotatedH);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  return { fitCoverScale, clamp };
});
