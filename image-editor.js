(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./imageEditorMath'));
  } else {
    root.ImageEditor = factory(root.ImageEditorMath);
  }
})(typeof self !== 'undefined' ? self : this, function (math) {
  const noopMath = {
    clamp: (v, min, max) => Math.min(max, Math.max(min, v)),
    fitCoverScale: (iw, ih, fw, fh) => Math.max(fw / iw, fh / ih),
  };
  const helpers = math || noopMath;
  const { clamp, fitCoverScale } = helpers;

  const STAGE_WIDTH = 600;
  const STAGE_HEIGHT = 520;
  const FRAME_RADIUS = 12;

  function open(options) {
    if (!options || !options.source) {
      return Promise.reject(new Error('ImageEditor.open requires a source.'));
    }
    const target = options.target || { width: 750, height: 1050 };
    const background = options.background || '#ffffff';

    return new Promise((resolve, reject) => {
      let closed = false;
      let loadedImage = null;
      let minScale = 1;
      let maxScale = 8;
      const stage = document.createElement('canvas');
      stage.width = STAGE_WIDTH;
      stage.height = STAGE_HEIGHT;
      const ctx = stage.getContext('2d');
      ctx.imageSmoothingQuality = 'high';

      const frame = computeFrameRect(stage, target);
      const state = {
        panX: 0,
        panY: 0,
        scale: 1,
        rotation: 0,
      };
      let rafPending = false;

      const modal = buildModal(stage);
      document.body.appendChild(modal.root);
      modal.dialog.setAttribute('aria-label', 'Image editor');
      modal.zoomSlider.disabled = true;
      modal.applyBtn.disabled = true;
      modal.dialog.focus();

      function cleanup() {
        if (closed) return;
        closed = true;
        modal.root.remove();
      }

      function closeWithReject(err) {
        cleanup();
        reject(err);
      }

      function closeWithResolve(dataUrl) {
        cleanup();
        resolve(dataUrl);
      }

      function requestRender() {
        if (rafPending) return;
        rafPending = true;
        requestAnimationFrame(() => {
          rafPending = false;
          draw();
        });
      }

      function updateZoomDisplay() {
        const percent = loadedImage ? Math.round((state.scale / minScale) * 100) : 100;
        modal.zoomDisplay.textContent = `${percent}%`;
      }

      function updateZoomSliderLimits() {
        modal.zoomSlider.min = String(minScale);
        modal.zoomSlider.max = String(maxScale);
        modal.zoomSlider.step = '0.001';
        modal.zoomSlider.value = String(state.scale);
        modal.zoomSlider.disabled = !loadedImage;
        updateZoomDisplay();
      }

      function clampPan() {
        if (!loadedImage) return;
        const cos = Math.cos(state.rotation);
        const sin = Math.sin(state.rotation);
        const stageShiftX = (state.panX * cos - state.panY * sin) * state.scale;
        const stageShiftY = (state.panX * sin + state.panY * cos) * state.scale;
        const rotW = (Math.abs(loadedImage.width * cos) + Math.abs(loadedImage.height * sin)) * state.scale;
        const rotH = (Math.abs(loadedImage.width * sin) + Math.abs(loadedImage.height * cos)) * state.scale;
        const maxShiftX = Math.max(0, (rotW - frame.w) / 2);
        const maxShiftY = Math.max(0, (rotH - frame.h) / 2);
        const clampedShiftX = clamp(stageShiftX, -maxShiftX, maxShiftX);
        const clampedShiftY = clamp(stageShiftY, -maxShiftY, maxShiftY);
        if (clampedShiftX === stageShiftX && clampedShiftY === stageShiftY) {
          return;
        }
        const invScale = 1 / state.scale;
        state.panX = (clampedShiftX * cos + clampedShiftY * sin) * invScale;
        state.panY = (-clampedShiftX * sin + clampedShiftY * cos) * invScale;
      }

      function resetState() {
        if (!loadedImage) return;
        state.panX = 0;
        state.panY = 0;
        state.rotation = 0;
        minScale = fitCoverScale(loadedImage.width, loadedImage.height, frame.w, frame.h, state.rotation);
        maxScale = minScale * 8;
        state.scale = minScale;
        updateZoomSliderLimits();
        clampPan();
        requestRender();
      }

      function rotate(deltaRad) {
        if (!loadedImage) return;
        state.rotation += deltaRad;
        const tau = Math.PI * 2;
        state.rotation = ((state.rotation % tau) + tau) % tau;
        const newMin = fitCoverScale(loadedImage.width, loadedImage.height, frame.w, frame.h, state.rotation);
        minScale = newMin;
        maxScale = minScale * 8;
        if (state.scale < minScale) state.scale = minScale;
        if (state.scale > maxScale) state.scale = maxScale;
        updateZoomSliderLimits();
        clampPan();
        requestRender();
      }

      function setScale(nextScale) {
        if (!loadedImage) return;
        const clamped = clamp(nextScale, minScale, maxScale);
        if (clamped === state.scale) return;
        state.scale = clamped;
        modal.zoomSlider.value = String(state.scale);
        updateZoomDisplay();
        clampPan();
        requestRender();
      }

      function applyZoomFactor(factor) {
        setScale(state.scale * factor);
      }

      function applyStagePan(dx, dy) {
        if (!loadedImage) return;
        const cos = Math.cos(state.rotation);
        const sin = Math.sin(state.rotation);
        const imageDx = (dx * cos + dy * sin) / state.scale;
        const imageDy = (-dx * sin + dy * cos) / state.scale;
        state.panX += imageDx;
        state.panY += imageDy;
        clampPan();
        requestRender();
      }

      function exportImage() {
        if (!loadedImage) return null;
        const out = document.createElement('canvas');
        out.width = target.width;
        out.height = target.height;
        const outCtx = out.getContext('2d');
        outCtx.imageSmoothingQuality = 'high';
        outCtx.fillStyle = background;
        outCtx.fillRect(0, 0, out.width, out.height);
        outCtx.translate(out.width / 2, out.height / 2);
        outCtx.rotate(state.rotation);
        outCtx.scale(state.scale * (out.width / frame.w), state.scale * (out.height / frame.h));
        outCtx.drawImage(
          loadedImage,
          -loadedImage.width / 2 + state.panX,
          -loadedImage.height / 2 + state.panY
        );
        return out.toDataURL('image/png');
      }

      function draw() {
        ctx.clearRect(0, 0, stage.width, stage.height);
        ctx.fillStyle = '#090909';
        ctx.fillRect(0, 0, stage.width, stage.height);

        if (loadedImage) {
          ctx.save();
          ctx.beginPath();
          roundRectPath(ctx, frame.x, frame.y, frame.w, frame.h, FRAME_RADIUS);
          ctx.clip();
          ctx.translate(frame.cx, frame.cy);
          ctx.rotate(state.rotation);
          ctx.scale(state.scale, state.scale);
          ctx.drawImage(
            loadedImage,
            -loadedImage.width / 2 + state.panX,
            -loadedImage.height / 2 + state.panY
          );
          ctx.restore();
        } else {
          ctx.save();
          ctx.fillStyle = '#fff';
          ctx.font = '16px system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Loading image…', stage.width / 2, stage.height / 2);
          ctx.restore();
        }

        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(0, 0, stage.width, stage.height);
        ctx.globalCompositeOperation = 'destination-out';
        roundRectPath(ctx, frame.x, frame.y, frame.w, frame.h, FRAME_RADIUS);
        ctx.fill();
        ctx.restore();

        drawRuleOfThirds(ctx, frame);
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 2;
        roundRectPath(ctx, frame.x, frame.y, frame.w, frame.h, FRAME_RADIUS);
        ctx.stroke();
        ctx.restore();
      }

      function onPointerDown(e) {
        if (!loadedImage) return;
        stage.setPointerCapture(e.pointerId);
        pointerState.active = true;
        pointerState.lastX = e.clientX;
        pointerState.lastY = e.clientY;
      }

      function onPointerMove(e) {
        if (!pointerState.active) return;
        const dx = e.clientX - pointerState.lastX;
        const dy = e.clientY - pointerState.lastY;
        pointerState.lastX = e.clientX;
        pointerState.lastY = e.clientY;
        applyStagePan(dx, dy);
      }

      function onPointerUp(e) {
        if (pointerState.active) {
          stage.releasePointerCapture(e.pointerId);
        }
        pointerState.active = false;
      }

      function onWheel(e) {
        if (!loadedImage) return;
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.075 : 1 / 1.075;
        applyZoomFactor(factor);
      }

      function onKeyDown(e) {
        if (!loadedImage) {
          if (e.key === 'Escape') {
            e.preventDefault();
            closeWithReject(new Error('cancelled'));
          }
          return;
        }
        const key = e.key;
        const shift = e.shiftKey;
        const panAmount = shift ? 1 : 10;
        switch (key) {
          case 'ArrowUp':
            e.preventDefault();
            applyStagePan(0, -panAmount);
            break;
          case 'ArrowDown':
            e.preventDefault();
            applyStagePan(0, panAmount);
            break;
          case 'ArrowLeft':
            e.preventDefault();
            applyStagePan(-panAmount, 0);
            break;
          case 'ArrowRight':
            e.preventDefault();
            applyStagePan(panAmount, 0);
            break;
          case '+':
          case '=':
            e.preventDefault();
            applyZoomFactor(1.1);
            break;
          case '-':
          case '_':
            e.preventDefault();
            applyZoomFactor(1 / 1.1);
            break;
          case '[':
            e.preventDefault();
            rotate(-Math.PI / 2);
            break;
          case ']':
            e.preventDefault();
            rotate(Math.PI / 2);
            break;
          case 'r':
          case 'R':
            e.preventDefault();
            resetState();
            break;
          case 'Enter':
            e.preventDefault();
            if (!modal.applyBtn.disabled) {
              const data = exportImage();
              if (data) closeWithResolve(data);
            }
            break;
          case 'Escape':
            e.preventDefault();
            closeWithReject(new Error('cancelled'));
            break;
          default:
            break;
        }
      }

      modal.zoomSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        setScale(value);
      });
      modal.rotateLeftBtn.addEventListener('click', () => rotate(-Math.PI / 2));
      modal.rotateRightBtn.addEventListener('click', () => rotate(Math.PI / 2));
      modal.zoomInBtn.addEventListener('click', () => applyZoomFactor(1.1));
      modal.zoomOutBtn.addEventListener('click', () => applyZoomFactor(1 / 1.1));
      modal.resetBtn.addEventListener('click', () => resetState());
      modal.applyBtn.addEventListener('click', () => {
        const data = exportImage();
        if (data) closeWithResolve(data);
      });
      modal.cancelBtn.addEventListener('click', () => {
        closeWithReject(new Error('cancelled'));
      });

      const pointerState = { active: false, lastX: 0, lastY: 0 };
      stage.addEventListener('pointerdown', onPointerDown);
      stage.addEventListener('pointermove', onPointerMove);
      stage.addEventListener('pointerup', onPointerUp);
      stage.addEventListener('pointercancel', onPointerUp);
      stage.addEventListener('wheel', onWheel, { passive: false });
      modal.root.addEventListener('keydown', onKeyDown);

      requestRender();

      decodeSource(options.source)
        .then((img) => {
          if (closed) return;
          loadedImage = img;
          minScale = fitCoverScale(loadedImage.width, loadedImage.height, frame.w, frame.h, state.rotation);
          maxScale = minScale * 8;
          state.scale = minScale;
          modal.applyBtn.disabled = false;
          updateZoomSliderLimits();
          requestRender();
        })
        .catch((err) => {
          closeWithReject(err);
        });
    });
  }

  function computeFrameRect(canvas, target) {
    const margin = 36;
    let frameHeight = canvas.height - margin * 2;
    let frameWidth = frameHeight * (target.width / target.height);
    if (frameWidth > canvas.width - margin * 2) {
      frameWidth = canvas.width - margin * 2;
      frameHeight = frameWidth * (target.height / target.width);
    }
    const x = (canvas.width - frameWidth) / 2;
    const y = (canvas.height - frameHeight) / 2;
    return {
      x,
      y,
      w: frameWidth,
      h: frameHeight,
      cx: x + frameWidth / 2,
      cy: y + frameHeight / 2,
    };
  }

  function buildModal(stage) {
    const zoomId = `ie-zoom-${Math.random().toString(36).slice(2)}`;

    const root = document.createElement('div');
    root.className = 'ie-modal';
    root.setAttribute('role', 'dialog');
    root.tabIndex = -1;

    const dialog = document.createElement('div');
    dialog.className = 'ie-dialog';
    dialog.tabIndex = -1;

    const stageWrap = document.createElement('div');
    stageWrap.className = 'ie-stage';
    stageWrap.appendChild(stage);

    const controls = document.createElement('div');
    controls.className = 'ie-controls';

    const title = document.createElement('h2');
    title.textContent = 'Adjust image';
    controls.appendChild(title);

    const zoomGroup = document.createElement('div');
    zoomGroup.className = 'ie-slider';
    const zoomLabel = document.createElement('label');
    zoomLabel.htmlFor = zoomId;
    const zoomText = document.createElement('span');
    zoomText.textContent = 'Zoom';
    const zoomValue = document.createElement('span');
    zoomValue.textContent = '100%';
    zoomLabel.appendChild(zoomText);
    zoomLabel.appendChild(zoomValue);
    const zoomSlider = document.createElement('input');
    zoomSlider.type = 'range';
    zoomSlider.id = zoomId;
    zoomSlider.min = '0.1';
    zoomSlider.max = '4';
    zoomSlider.value = '1';
    zoomGroup.appendChild(zoomLabel);
    zoomGroup.appendChild(zoomSlider);
    controls.appendChild(zoomGroup);

    const rotateRow = document.createElement('div');
    rotateRow.className = 'ie-button-row';
    const rotateLeftBtn = document.createElement('button');
    rotateLeftBtn.type = 'button';
    rotateLeftBtn.textContent = 'Rotate Left ( [ )';
    const rotateRightBtn = document.createElement('button');
    rotateRightBtn.type = 'button';
    rotateRightBtn.textContent = 'Rotate Right ( ] )';
    rotateRow.appendChild(rotateLeftBtn);
    rotateRow.appendChild(rotateRightBtn);
    controls.appendChild(rotateRow);

    const zoomButtons = document.createElement('div');
    zoomButtons.className = 'ie-button-row';
    const zoomInBtn = document.createElement('button');
    zoomInBtn.type = 'button';
    zoomInBtn.textContent = 'Zoom In (+)';
    const zoomOutBtn = document.createElement('button');
    zoomOutBtn.type = 'button';
    zoomOutBtn.textContent = 'Zoom Out (-)';
    zoomButtons.appendChild(zoomInBtn);
    zoomButtons.appendChild(zoomOutBtn);
    controls.appendChild(zoomButtons);

    const panHint = document.createElement('p');
    panHint.style.fontSize = '0.85rem';
    panHint.style.margin = '0';
    panHint.textContent = 'Pan with drag or arrow keys (Shift for fine).';
    controls.appendChild(panHint);

    const keyHint = document.createElement('p');
    keyHint.style.fontSize = '0.85rem';
    keyHint.style.margin = '0';
    keyHint.textContent = 'Use [ ] to rotate, +/- to zoom, Enter to apply, Esc to cancel.';
    controls.appendChild(keyHint);

    const actionRow = document.createElement('div');
    actionRow.className = 'ie-button-row';
    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.textContent = 'Reset (R)';
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'Cancel (Esc)';
    cancelBtn.classList.add('danger');
    actionRow.appendChild(resetBtn);
    actionRow.appendChild(cancelBtn);
    controls.appendChild(actionRow);

    const actionRow2 = document.createElement('div');
    actionRow2.className = 'ie-button-row';
    const applyBtn = document.createElement('button');
    applyBtn.type = 'button';
    applyBtn.textContent = 'Apply (Enter)';
    applyBtn.classList.add('primary');
    const spacer = document.createElement('div');
    actionRow2.appendChild(applyBtn);
    actionRow2.appendChild(spacer);
    controls.appendChild(actionRow2);

    dialog.appendChild(stageWrap);
    dialog.appendChild(controls);
    root.appendChild(dialog);

    const zoomDisplay = zoomValue;

    return {
      root,
      dialog,
      controls,
      zoomSlider,
      zoomDisplay,
      zoomInBtn,
      zoomOutBtn,
      rotateLeftBtn,
      rotateRightBtn,
      resetBtn,
      cancelBtn,
      applyBtn,
    };
  }

  function drawRuleOfThirds(ctx, frame) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 2; i++) {
      const x = frame.x + (frame.w / 3) * i;
      ctx.beginPath();
      ctx.moveTo(x, frame.y);
      ctx.lineTo(x, frame.y + frame.h);
      ctx.stroke();
    }
    for (let i = 1; i <= 2; i++) {
      const y = frame.y + (frame.h / 3) * i;
      ctx.beginPath();
      ctx.moveTo(frame.x, y);
      ctx.lineTo(frame.x + frame.w, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function roundRectPath(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.arcTo(x + width, y, x + width, y + r, r);
    ctx.lineTo(x + width, y + height - r);
    ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
    ctx.lineTo(x + r, y + height);
    ctx.arcTo(x, y + height, x, y + height - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  function decodeSource(source) {
    if (typeof createImageBitmap === 'function') {
      return toBlob(source).then((blob) => createImageBitmap(blob));
    }
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      if (typeof source === 'string') {
        img.src = source;
      } else {
        const url = URL.createObjectURL(source);
        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve(img);
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load image'));
        };
        img.src = url;
      }
    });
  }

  function toBlob(source) {
    if (typeof source === 'string') {
      if (source.startsWith('data:')) {
        const commaIndex = source.indexOf(',');
        if (commaIndex === -1) {
          return Promise.reject(new Error('Invalid data URL'));
        }
        const meta = source.substring(5, commaIndex);
        const mime = meta.split(';')[0] || 'image/png';
        const isBase64 = /;base64/i.test(meta);
        const dataPart = source.substring(commaIndex + 1);
        let byteString;
        if (isBase64) {
          byteString = atob(dataPart);
        } else {
          byteString = decodeURIComponent(dataPart);
        }
        const len = byteString.length;
        const array = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          array[i] = byteString.charCodeAt(i);
        }
        return Promise.resolve(new Blob([array], { type: mime }));
      }
      return fetch(source).then((res) => res.blob());
    }
    if (source instanceof Blob) {
      return Promise.resolve(source);
    }
    throw new Error('Unsupported image source');
  }

  return { open };
});
