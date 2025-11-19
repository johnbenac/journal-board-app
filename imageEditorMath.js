(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ImageEditorMath = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function fitCoverScale(imageWidth, imageHeight, frameWidth, frameHeight, rotationRad) {
    const cos = Math.abs(Math.cos(rotationRad));
    const sin = Math.abs(Math.sin(rotationRad));
    const rotatedWidth = imageWidth * cos + imageHeight * sin;
    const rotatedHeight = imageWidth * sin + imageHeight * cos;
    return Math.max(frameWidth / rotatedWidth, frameHeight / rotatedHeight);
  }

  return { clamp, fitCoverScale };
});
