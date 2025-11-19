(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./imageEditorMath.js'));
  } else {
    root.ImageEditor = factory(root.ImageEditorMath || {});
  }
})(typeof self !== 'undefined' ? self : this, function (mathHelpers) {
  const fitCoverScale = mathHelpers.fitCoverScale || function (iw, ih, fw, fh) {
    return Math.max(fw / iw, fh / ih);
  };
  const clamp = mathHelpers.clamp || function (value, min, max) {
    if (min > max) {
      const temp = min;
      min = max;
      max = temp;
    }
    return Math.min(max, Math.max(min, value));
  };

  const STAGE_WIDTH = 640;
  const STAGE_HEIGHT = 520;

  function loadImageSource(source) {
    return new Promise((resolve, reject) => {
      const useBitmap = typeof createImageBitmap === 'function';
      if (useBitmap && (source instanceof Blob || source instanceof File)) {
        createImageBitmap(source).then(resolve).catch(reject);
        return;
      }
      if (useBitmap && typeof source === 'string') {
        fetch(source)
          .then((resp) => resp.blob())
          .then((blob) => createImageBitmap(blob))
          .then(resolve)
          .catch(() => fallbackDecode(source, resolve, reject));
        return;
      }
      fallbackDecode(source, resolve, reject);
    });
  }

  function fallbackDecode(source, resolve, reject) {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    if (source instanceof Blob) {
      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(source);
    } else {
      img.src = source;
    }
  }

  function createFrame(targetAspect) {
    const margin = 40;
    const maxWidth = STAGE_WIDTH - margin * 2;
    const maxHeight = STAGE_HEIGHT - margin * 2;
    let frameWidth = maxWidth;
    let frameHeight = frameWidth / targetAspect;
    if (frameHeight > maxHeight) {
      frameHeight = maxHeight;
      frameWidth = frameHeight * targetAspect;
    }
    const x = (STAGE_WIDTH - frameWidth) / 2;
    const y = (STAGE_HEIGHT - frameHeight) / 2;
    return {
      x,
      y,
      w: frameWidth,
      h: frameHeight,
      cx: x + frameWidth / 2,
      cy: y + frameHeight / 2,
      radius: 8,
    };
  }

  function roundRectPath(ctx, x, y, width, height, radius) {
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

  function drawRuleOfThirds(ctx, frame) {
    const stepX = frame.w / 3;
    const stepY = frame.h / 3;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      const x = frame.x + stepX * i;
      ctx.beginPath();
      ctx.moveTo(x, frame.y);
      ctx.lineTo(x, frame.y + frame.h);
      ctx.stroke();
    }
    for (let j = 1; j < 3; j++) {
      const y = frame.y + stepY * j;
      ctx.beginPath();
      ctx.moveTo(frame.x, y);
      ctx.lineTo(frame.x + frame.w, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function open(options) {
    if (typeof document === 'undefined') {
      return Promise.reject(new Error('ImageEditor requires a browser environment.'));
    }
    const opts = Object.assign(
      {
        target: { width: 750, height: 1050 },
        background: '#ffffff',
      },
      options || {}
    );
    const targetAspect = opts.target.width / opts.target.height;
    const frame = createFrame(targetAspect);

    const modal = document.createElement('div');
    modal.className = 'ie-modal';
    const dialog = document.createElement('div');
    dialog.className = 'ie-dialog';
    dialog.tabIndex = -1;
    const stageWrap = document.createElement('div');
    stageWrap.className = 'ie-stage';
    const canvas = document.createElement('canvas');
    canvas.width = STAGE_WIDTH;
    canvas.height = STAGE_HEIGHT;
    const ctx = canvas.getContext('2d');
    stageWrap.appendChild(canvas);

    const controls = document.createElement('div');
    controls.className = 'ie-controls';
    const controlsHeader = document.createElement('h3');
    controlsHeader.textContent = 'Image Controls';
    controls.appendChild(controlsHeader);

    const loadingMessage = document.createElement('div');
    loadingMessage.textContent = 'Loading image…';
    loadingMessage.style.color = '#666';
    controls.appendChild(loadingMessage);

    dialog.appendChild(stageWrap);
    dialog.appendChild(controls);
    modal.appendChild(dialog);
    document.body.appendChild(modal);
    dialog.focus();

    let imageSource = null;
    let rafId = 0;
    let needsRender = true;
    const state = {
      panX: 0,
      panY: 0,
      scale: 1,
      rotation: 0,
      minScale: 1,
      maxScale: 5,
    };
    const corners = [
      { x: frame.x, y: frame.y },
      { x: frame.x + frame.w, y: frame.y },
      { x: frame.x, y: frame.y + frame.h },
      { x: frame.x + frame.w, y: frame.y + frame.h },
    ];

    const zoomRow = document.createElement('div');
    zoomRow.className = 'ie-control-row';
    const zoomLabel = document.createElement('label');
    zoomLabel.textContent = 'Zoom';
    const zoomSlider = document.createElement('input');
    zoomSlider.type = 'range';
    zoomSlider.min = '0';
    zoomSlider.max = '100';
    zoomSlider.value = '0';
    zoomSlider.className = 'ie-slider';
    zoomSlider.disabled = true;
    zoomRow.appendChild(zoomLabel);
    zoomRow.appendChild(zoomSlider);
    controls.appendChild(zoomRow);

    const rotateRow = document.createElement('div');
    rotateRow.className = 'ie-control-row';
    const rotateLabel = document.createElement('label');
    rotateLabel.textContent = 'Rotate';
    const rotateButtons = document.createElement('div');
    rotateButtons.className = 'ie-button-group';
    const rotateLeft = document.createElement('button');
    rotateLeft.type = 'button';
    rotateLeft.textContent = '⟲ 90°';
    rotateLeft.disabled = true;
    const rotateRight = document.createElement('button');
    rotateRight.type = 'button';
    rotateRight.textContent = '⟳ 90°';
    rotateRight.disabled = true;
    rotateButtons.appendChild(rotateLeft);
    rotateButtons.appendChild(rotateRight);
    rotateRow.appendChild(rotateLabel);
    rotateRow.appendChild(rotateButtons);
    controls.appendChild(rotateRow);

    const actionRow = document.createElement('div');
    actionRow.className = 'ie-button-group';
    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.textContent = 'Reset';
    resetBtn.disabled = true;
    const applyBtn = document.createElement('button');
    applyBtn.type = 'button';
    applyBtn.textContent = 'Apply';
    applyBtn.className = 'primary';
    applyBtn.disabled = true;
    actionRow.appendChild(resetBtn);
    actionRow.appendChild(applyBtn);
    controls.appendChild(actionRow);

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'danger';
    controls.appendChild(cancelBtn);

    let resolver = null;
    let rejecter = null;
    const wheelListenerOptions = { passive: false };

    function cleanup() {
      if (rafId) cancelAnimationFrame(rafId);
      modal.remove();
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
      canvas.removeEventListener('wheel', handleWheel, wheelListenerOptions);
    }

    function closeWithCancel() {
      cleanup();
      if (rejecter) rejecter(new Error('Image editor cancelled'));
    }

    cancelBtn.addEventListener('click', closeWithCancel);

    zoomSlider.addEventListener('input', () => {
      const t = parseFloat(zoomSlider.value) / 100;
      const newScale = state.minScale * Math.pow(state.maxScale / state.minScale, t);
      setScale(newScale);
    });

    rotateLeft.addEventListener('click', () => rotateBy(-Math.PI / 2));
    rotateRight.addEventListener('click', () => rotateBy(Math.PI / 2));
    resetBtn.addEventListener('click', resetState);

    applyBtn.addEventListener('click', () => {
      applyBtn.disabled = true;
      exportImage()
        .then((dataUrl) => {
          cleanup();
          if (resolver) resolver(dataUrl);
        })
        .catch((err) => {
          applyBtn.disabled = false;
          console.error(err);
        });
    });

    window.addEventListener('keydown', handleKeyDown);

    function handleKeyDown(event) {
      if (!imageSource) return;
      if (!modal.contains(document.activeElement)) return;
      const step = event.shiftKey ? 1 : 10;
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          panBy(step * -1, 0);
          break;
        case 'ArrowRight':
          event.preventDefault();
          panBy(step, 0);
          break;
        case 'ArrowUp':
          event.preventDefault();
          panBy(0, step * -1);
          break;
        case 'ArrowDown':
          event.preventDefault();
          panBy(0, step);
          break;
        case '+':
        case '=':
          event.preventDefault();
          setScale(state.scale * 1.05);
          break;
        case '-':
          event.preventDefault();
          setScale(state.scale / 1.05);
          break;
        case '[':
          event.preventDefault();
          rotateBy(-Math.PI / 2);
          break;
        case ']':
          event.preventDefault();
          rotateBy(Math.PI / 2);
          break;
        case 'r':
        case 'R':
          event.preventDefault();
          resetState();
          break;
        case 'Enter':
          event.preventDefault();
          if (!applyBtn.disabled) {
            applyBtn.click();
          }
          break;
        case 'Escape':
          event.preventDefault();
          closeWithCancel();
          break;
        default:
          break;
      }
    }

    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    function canvasToLocal(event) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
      };
    }

    function handlePointerDown(event) {
      if (!imageSource) return;
      canvas.setPointerCapture(event.pointerId);
      dragging = true;
      const pos = canvasToLocal(event);
      lastX = pos.x;
      lastY = pos.y;
    }

    function handlePointerMove(event) {
      if (!dragging || !imageSource) return;
      const pos = canvasToLocal(event);
      const dx = pos.x - lastX;
      const dy = pos.y - lastY;
      lastX = pos.x;
      lastY = pos.y;
      state.panX += dx / state.scale;
      state.panY += dy / state.scale;
      clampPan();
      requestRender();
    }

    function handlePointerUp(event) {
      if (!dragging) return;
      dragging = false;
      canvas.releasePointerCapture(event.pointerId);
    }

    function handleWheel(event) {
      if (!imageSource) return;
      event.preventDefault();
      const factor = event.deltaY < 0 ? 1.075 : 1 / 1.075;
      setScale(state.scale * factor);
    }

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);
    canvas.addEventListener('wheel', handleWheel, wheelListenerOptions);

    function requestRender() {
      needsRender = true;
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          rafId = 0;
          if (needsRender) {
            needsRender = false;
            draw();
          }
        });
      }
    }

    function updateZoomSlider() {
      const range = state.maxScale / state.minScale;
      if (!isFinite(range) || range <= 1.00001) {
        zoomSlider.value = '0';
        return;
      }
      const t = Math.log(state.scale / state.minScale) / Math.log(range);
      const value = clamp(Math.round(t * 100), 0, 100);
      zoomSlider.value = String(value);
    }

    function normalizeRotation() {
      const full = Math.PI * 2;
      state.rotation = ((state.rotation % full) + full) % full;
    }

    function rotateBy(angle) {
      state.rotation += angle;
      normalizeRotation();
      updateMinScale();
      clampPan();
      requestRender();
    }

    function updateMinScale() {
      state.minScale = fitCoverScale(
        imageSource.width,
        imageSource.height,
        frame.w,
        frame.h,
        state.rotation
      );
      if (!isFinite(state.minScale) || state.minScale <= 0) {
        state.minScale = 1;
      }
      state.maxScale = state.minScale * 5;
      setScale(Math.max(state.scale, state.minScale));
      zoomSlider.disabled = false;
    }

    function setScale(nextScale) {
      const newScale = clamp(nextScale, state.minScale, state.maxScale);
      if (newScale === state.scale) {
        updateZoomSlider();
        return;
      }
      state.scale = newScale;
      clampPan();
      updateZoomSlider();
      requestRender();
    }

    function resetState() {
      state.panX = 0;
      state.panY = 0;
      state.rotation = 0;
      state.scale = state.minScale;
      clampPan();
      updateZoomSlider();
      requestRender();
    }

    function stagePointToLocal(x, y) {
      const px = x - frame.cx;
      const py = y - frame.cy;
      const cos = Math.cos(state.rotation);
      const sin = Math.sin(state.rotation);
      const localX = (px * cos + py * sin) / state.scale;
      const localY = (-px * sin + py * cos) / state.scale;
      return { x: localX, y: localY };
    }

    function clampPan() {
      if (!imageSource) return;
      let lowerX = -Infinity;
      let upperX = Infinity;
      let lowerY = -Infinity;
      let upperY = Infinity;
      for (const corner of corners) {
        const local = stagePointToLocal(corner.x, corner.y);
        lowerX = Math.max(lowerX, local.x - imageSource.width / 2);
        upperX = Math.min(upperX, local.x + imageSource.width / 2);
        lowerY = Math.max(lowerY, local.y - imageSource.height / 2);
        upperY = Math.min(upperY, local.y + imageSource.height / 2);
      }
      state.panX = clamp(state.panX, lowerX, upperX);
      state.panY = clamp(state.panY, lowerY, upperY);
    }

    function panBy(dx, dy) {
      state.panX += dx / state.scale;
      state.panY += dy / state.scale;
      clampPan();
      requestRender();
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Background dim
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cut out frame
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      roundRectPath(ctx, frame.x, frame.y, frame.w, frame.h, frame.radius);
      ctx.fill();
      ctx.restore();

      // Frame border
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 2;
      roundRectPath(ctx, frame.x, frame.y, frame.w, frame.h, frame.radius);
      ctx.stroke();
      ctx.restore();

      // Guides
      drawRuleOfThirds(ctx, frame);

      if (!imageSource) return;

      ctx.save();
      roundRectPath(ctx, frame.x, frame.y, frame.w, frame.h, frame.radius);
      ctx.clip();
      ctx.translate(frame.cx, frame.cy);
      ctx.rotate(state.rotation);
      ctx.scale(state.scale, state.scale);
      ctx.drawImage(
        imageSource,
        -imageSource.width / 2 + state.panX,
        -imageSource.height / 2 + state.panY
      );
      ctx.restore();
    }

    function exportImage() {
      return new Promise((resolve, reject) => {
        try {
          const out = document.createElement('canvas');
          out.width = opts.target.width;
          out.height = opts.target.height;
          const outCtx = out.getContext('2d');
          outCtx.fillStyle = opts.background;
          outCtx.fillRect(0, 0, out.width, out.height);
          const scaleX = opts.target.width / frame.w;
          const scaleY = opts.target.height / frame.h;
          outCtx.translate(out.width / 2, out.height / 2);
          outCtx.rotate(state.rotation);
          outCtx.scale(state.scale * scaleX, state.scale * scaleY);
          outCtx.drawImage(
            imageSource,
            -imageSource.width / 2 + state.panX,
            -imageSource.height / 2 + state.panY
          );
          resolve(out.toDataURL('image/png'));
        } catch (err) {
          reject(err);
        }
      });
    }

    loadImageSource(opts.source)
      .then((img) => {
        imageSource = img;
        loadingMessage.remove();
        rotateLeft.disabled = false;
        rotateRight.disabled = false;
        resetBtn.disabled = false;
        applyBtn.disabled = false;
        zoomSlider.disabled = false;
        updateMinScale();
        clampPan();
        updateZoomSlider();
        requestRender();
      })
      .catch((err) => {
        loadingMessage.textContent = 'Failed to load image';
        console.error(err);
      });

    requestRender();

    return new Promise((resolve, reject) => {
      resolver = resolve;
      rejecter = reject;
    });
  }

  return { open };
});
