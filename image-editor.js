(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./imageEditorMath'));
  } else {
    root.ImageEditor = factory(root.ImageEditorMath);
  }
})(typeof self !== 'undefined' ? self : this, function (math) {
  if (!math) {
    throw new Error('ImageEditorMath is required');
  }

  const { fitCoverScale, clamp } = math;
  const TARGET_WIDTH = 750;
  const TARGET_HEIGHT = 1050;
  const BACKGROUND = '#ffffff';
  const STAGE_WIDTH = 640;
  const STAGE_HEIGHT = 880;
  let activeInstance = null;

  function open(options) {
    if (!options || !options.source) {
      return Promise.reject(new Error('source is required'));
    }
    const target = options.target || { width: TARGET_WIDTH, height: TARGET_HEIGHT };
    const background = options.background || BACKGROUND;

    return loadImageSource(options.source).then((imageBitmap) => {
      if (activeInstance) {
        activeInstance.close('cancel');
      }
      return new Promise((resolve, reject) => {
        activeInstance = createEditor({ imageBitmap, target, background, resolve, reject });
      });
    });
  }

  function createEditor(context) {
    const { imageBitmap, target, background, resolve, reject } = context;
    const modal = document.createElement('div');
    modal.className = 'ie-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = '';

    const dialog = document.createElement('div');
    dialog.className = 'ie-dialog';

    const stageWrap = document.createElement('div');
    stageWrap.className = 'ie-stage';
    const stage = document.createElement('canvas');
    stage.width = STAGE_WIDTH;
    stage.height = STAGE_HEIGHT;
    stage.setAttribute('aria-label', 'Image canvas');
    stageWrap.appendChild(stage);

    const controls = document.createElement('div');
    controls.className = 'ie-controls';

    const zoomLabel = document.createElement('label');
    zoomLabel.textContent = 'Zoom';
    zoomLabel.className = 'ie-label';
    const zoomSlider = document.createElement('input');
    zoomSlider.type = 'range';
    zoomSlider.min = '0';
    zoomSlider.max = '100';
    zoomSlider.value = '0';
    zoomSlider.setAttribute('aria-label', 'Zoom level');
    const zoomValue = document.createElement('span');
    zoomValue.className = 'ie-zoom-value';
    zoomValue.textContent = '100%';
    zoomLabel.appendChild(zoomSlider);
    zoomLabel.appendChild(zoomValue);

    const rotateLeft = button('Rotate left (90°)');
    rotateLeft.setAttribute('aria-label', 'Rotate left');
    const rotateRight = button('Rotate right (90°)');
    rotateRight.setAttribute('aria-label', 'Rotate right');

    const resetBtn = button('Reset');
    resetBtn.setAttribute('aria-label', 'Reset image');
    const applyBtn = button('Apply');
    applyBtn.classList.add('ie-primary');
    const cancelBtn = button('Cancel');

    const buttonRow = document.createElement('div');
    buttonRow.className = 'ie-button-row';
    buttonRow.appendChild(rotateLeft);
    buttonRow.appendChild(rotateRight);
    buttonRow.appendChild(resetBtn);

    const bottomRow = document.createElement('div');
    bottomRow.className = 'ie-button-row';
    bottomRow.appendChild(cancelBtn);
    bottomRow.appendChild(applyBtn);

    const hint = document.createElement('p');
    hint.className = 'ie-hint';
    hint.textContent = 'Scroll to zoom · Drag to pan · Use keyboard shortcuts for fine adjustments';

    controls.appendChild(zoomLabel);
    controls.appendChild(buttonRow);
    controls.appendChild(hint);
    controls.appendChild(bottomRow);

    dialog.appendChild(stageWrap);
    dialog.appendChild(controls);
    modal.appendChild(dialog);
    document.body.appendChild(modal);

    const ctx = stage.getContext('2d');
    ctx.imageSmoothingQuality = 'high';

    const frame = computeFrame(stage, target);
    const frameScaleX = frame.width / target.width;
    const frameScaleY = frame.height / target.height;
    const state = {
      panX: 0,
      panY: 0,
      scale: 1,
      rotation: 0,
    };
    let minScale = 1;
    let maxScale = 8;
    let needsRender = false;
    let rafId = null;
    let dragging = false;
    let lastPointer = { x: 0, y: 0 };

    function updateScaleBounds() {
      minScale = fitCoverScale(getImageWidth(imageBitmap), getImageHeight(imageBitmap), target.width, target.height, state.rotation);
      maxScale = minScale * 8;
      state.scale = clamp(state.scale, minScale, maxScale);
      syncZoomSlider();
      clampPan();
      requestRender();
    }

    function syncZoomSlider() {
      const normalized = (state.scale - minScale) / (maxScale - minScale || 1);
      zoomSlider.value = String(Math.round(normalized * 100));
      zoomValue.textContent = `${Math.round(state.scale / minScale * 100)}%`;
    }

    function requestRender() {
      if (needsRender) return;
      needsRender = true;
      rafId = requestAnimationFrame(draw);
    }

    function draw() {
      needsRender = false;
      ctx.clearRect(0, 0, stage.width, stage.height);
      ctx.fillStyle = '#1c1c1c';
      ctx.fillRect(0, 0, stage.width, stage.height);

      // Dimmed overlay
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, stage.width, stage.height);
      ctx.globalCompositeOperation = 'destination-out';
      roundRect(ctx, frame.x, frame.y, frame.width, frame.height, 8);
      ctx.fill();
      ctx.restore();

      drawGuideLines(ctx, frame);

      ctx.save();
      ctx.beginPath();
      roundRect(ctx, frame.x, frame.y, frame.width, frame.height, 8);
      ctx.clip();
      ctx.translate(frame.x + frame.width / 2, frame.y + frame.height / 2);
      ctx.scale(frameScaleX, frameScaleY);
      ctx.rotate(state.rotation);
      ctx.scale(state.scale, state.scale);
      ctx.drawImage(
        imageBitmap,
        -getImageWidth(imageBitmap) / 2 + state.panX,
        -getImageHeight(imageBitmap) / 2 + state.panY
      );
      ctx.restore();
    }

    function clampPan() {
      const absCos = Math.abs(Math.cos(state.rotation));
      const absSin = Math.abs(Math.sin(state.rotation));
      const imgW = getImageWidth(imageBitmap);
      const imgH = getImageHeight(imageBitmap);
      const rotW = imgW * state.scale * absCos + imgH * state.scale * absSin;
      const rotH = imgW * state.scale * absSin + imgH * state.scale * absCos;
      const maxX = Math.max(0, (rotW - target.width) / 2);
      const maxY = Math.max(0, (rotH - target.height) / 2);
      state.panX = clamp(state.panX, -maxX / state.scale, maxX / state.scale);
      state.panY = clamp(state.panY, -maxY / state.scale, maxY / state.scale);
    }

    function handleZoomInput(value) {
      const normalized = parseInt(value, 10) / 100;
      state.scale = clamp(minScale + normalized * (maxScale - minScale), minScale, maxScale);
      clampPan();
      requestRender();
      syncZoomSlider();
    }

    function applyZoomFactor(factor) {
      state.scale = clamp(state.scale * factor, minScale, maxScale);
      clampPan();
      syncZoomSlider();
      requestRender();
    }

    function rotate(deltaRad) {
      state.rotation = (state.rotation + deltaRad + Math.PI * 2) % (Math.PI * 2);
      updateScaleBounds();
    }

    function reset() {
      state.panX = 0;
      state.panY = 0;
      state.rotation = 0;
      state.scale = minScale;
      syncZoomSlider();
      requestRender();
    }

    function exportImage() {
      const out = document.createElement('canvas');
      out.width = target.width;
      out.height = target.height;
      const outCtx = out.getContext('2d');
      outCtx.imageSmoothingQuality = 'high';
      outCtx.fillStyle = background;
      outCtx.fillRect(0, 0, out.width, out.height);
      outCtx.translate(out.width / 2, out.height / 2);
      outCtx.rotate(state.rotation);
      outCtx.scale(state.scale, state.scale);
      outCtx.drawImage(
        imageBitmap,
        -getImageWidth(imageBitmap) / 2 + state.panX,
        -getImageHeight(imageBitmap) / 2 + state.panY
      );
      return out.toDataURL('image/png');
    }

    function close(reason) {
      cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', handleKeyDown, true);
      modal.remove();
      activeInstance = null;
      if (reason === 'apply') {
        resolve(exportImage());
      } else if (reason === 'cancel') {
        reject(new Error('Image editing cancelled'));
      }
    }

    zoomSlider.addEventListener('input', (event) => {
      handleZoomInput(event.target.value);
    });

    rotateLeft.addEventListener('click', () => rotate(-Math.PI / 2));
    rotateRight.addEventListener('click', () => rotate(Math.PI / 2));
    resetBtn.addEventListener('click', reset);
    cancelBtn.addEventListener('click', () => close('cancel'));
    applyBtn.addEventListener('click', () => close('apply'));

    stage.addEventListener('wheel', (event) => {
      event.preventDefault();
      const factor = event.deltaY < 0 ? 1.075 : 1 / 1.075;
      applyZoomFactor(factor);
    });

    stage.addEventListener('pointerdown', (event) => {
      stage.setPointerCapture(event.pointerId);
      dragging = true;
      lastPointer = { x: event.clientX, y: event.clientY };
    });

    stage.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      const rect = stage.getBoundingClientRect();
      const scaleRatioX = frameScaleX || 1;
      const scaleRatioY = frameScaleY || 1;
      const deltaX = (event.clientX - lastPointer.x) * (stage.width / rect.width);
      const deltaY = (event.clientY - lastPointer.y) * (stage.height / rect.height);
      const targetDX = deltaX / scaleRatioX;
      const targetDY = deltaY / scaleRatioY;
      state.panX += targetDX / state.scale;
      state.panY += targetDY / state.scale;
      clampPan();
      lastPointer = { x: event.clientX, y: event.clientY };
      requestRender();
    });

    stage.addEventListener('pointerup', (event) => {
      stage.releasePointerCapture(event.pointerId);
      dragging = false;
    });

    stage.addEventListener('pointerleave', () => {
      dragging = false;
    });

    stage.addEventListener('pointercancel', () => {
      dragging = false;
    });

    function handleKeyDown(event) {
      if (!modal.contains(document.activeElement)) {
        // allow shortcuts even without focus in modal
      }
      const step = event.shiftKey ? 1 : 10;
      let handled = false;
      switch (event.key) {
        case 'ArrowUp':
          state.panY -= step / state.scale;
          handled = true;
          break;
        case 'ArrowDown':
          state.panY += step / state.scale;
          handled = true;
          break;
        case 'ArrowLeft':
          state.panX -= step / state.scale;
          handled = true;
          break;
        case 'ArrowRight':
          state.panX += step / state.scale;
          handled = true;
          break;
        case '+':
        case '=':
          applyZoomFactor(1.1);
          handled = true;
          break;
        case '-':
        case '_':
          applyZoomFactor(1 / 1.1);
          handled = true;
          break;
        case '[':
          rotate(-Math.PI / 2);
          handled = true;
          break;
        case ']':
          rotate(Math.PI / 2);
          handled = true;
          break;
        case 'r':
        case 'R':
          reset();
          handled = true;
          break;
        case 'Enter':
          close('apply');
          handled = true;
          break;
        case 'Escape':
          close('cancel');
          handled = true;
          break;
        default:
          break;
      }
      if (handled) {
        event.preventDefault();
        clampPan();
        syncZoomSlider();
        requestRender();
      }
    }

    window.addEventListener('keydown', handleKeyDown, true);

    function init() {
      state.scale = fitCoverScale(getImageWidth(imageBitmap), getImageHeight(imageBitmap), target.width, target.height, state.rotation);
      updateScaleBounds();
      requestRender();
      syncZoomSlider();
      applyBtn.focus();
    }

    function destroy(reason) {
      close(reason);
    }

    init();

    return {
      close: destroy,
    };
  }

  function button(label) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
    return btn;
  }

  function computeFrame(stage, target) {
    const padding = 40;
    let frameWidth = stage.width - padding * 2;
    let frameHeight = stage.height - padding * 2;
    const ratio = target.width / target.height;
    if (frameWidth / frameHeight > ratio) {
      frameWidth = frameHeight * ratio;
    } else {
      frameHeight = frameWidth / ratio;
    }
    const x = (stage.width - frameWidth) / 2;
    const y = (stage.height - frameHeight) / 2;
    return {
      x,
      y,
      width: frameWidth,
      height: frameHeight,
    };
  }

  function drawGuideLines(ctx, frame) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1;
    const thirdW = frame.width / 3;
    const thirdH = frame.height / 3;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(frame.x + thirdW * i, frame.y);
      ctx.lineTo(frame.x + thirdW * i, frame.y + frame.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(frame.x, frame.y + thirdH * i);
      ctx.lineTo(frame.x + frame.width, frame.y + thirdH * i);
      ctx.stroke();
    }
    ctx.restore();
  }

  function roundRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function getImageWidth(img) {
    return img.width || img.naturalWidth;
  }

  function getImageHeight(img) {
    return img.height || img.naturalHeight;
  }

  function loadImageSource(source) {
    if (source instanceof Blob) {
      return decodeBlob(source);
    }
    if (typeof source === 'string') {
      if (source.startsWith('data:')) {
        if (typeof createImageBitmap === 'function') {
          return fetch(source)
            .then((res) => res.blob())
            .then((blob) => createImageBitmap(blob))
            .catch(() => decodeImage(source));
        }
        return decodeImage(source);
      }
      return decodeImage(source);
    }
    return Promise.reject(new Error('Unsupported image source'));
  }

  function decodeBlob(blob) {
    if (typeof createImageBitmap === 'function') {
      return createImageBitmap(blob).catch(() => decodeImageBlob(blob));
    }
    return decodeImageBlob(blob);
  }

  function decodeImageBlob(blob) {
    const url = URL.createObjectURL(blob);
    return decodeImage(url).finally(() => URL.revokeObjectURL(url));
  }

  function decodeImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  return { open };
});
