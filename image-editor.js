(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(typeof self !== 'undefined' ? self : root);
  } else {
    root.ImageEditor = factory(root);
  }
})(typeof self !== 'undefined' ? self : this, function (root) {
  const math = (root && root.ImageEditorMath) || {
    fitCoverScale: function (iw, ih, fw, fh, rot) {
      if (!iw || !ih || !fw || !fh) return 1;
      const cos = Math.abs(Math.cos(rot));
      const sin = Math.abs(Math.sin(rot));
      const rotatedW = iw * cos + ih * sin;
      const rotatedH = iw * sin + ih * cos;
      return Math.max(fw / rotatedW, fh / rotatedH);
    },
    clamp: function (value, min, max) {
      return Math.min(max, Math.max(min, value));
    }
  };

  let activeModal = null;

  function ensureBlob(source) {
    if (typeof source === 'string') {
      return fetch(source).then(function (res) {
        if (!res.ok) throw new Error('Failed to fetch image source');
        return res.blob();
      });
    }
    if (source instanceof Blob) {
      return Promise.resolve(source);
    }
    throw new Error('Unsupported image source');
  }

  function loadViaBitmap(source) {
    if (typeof createImageBitmap !== 'function') {
      return Promise.reject(new Error('createImageBitmap unavailable'));
    }
    return ensureBlob(source)
      .then(function (blob) {
        return createImageBitmap(blob);
      })
      .then(function (bitmap) {
        return {
          image: bitmap,
          width: bitmap.width,
          height: bitmap.height,
          cleanup: function () {
            if (bitmap.close) bitmap.close();
          }
        };
      });
  }

  function loadViaImageElement(source) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      var objectUrl = null;
      img.onload = function () {
        resolve({
          image: img,
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
          cleanup: function () {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
          }
        });
      };
      img.onerror = function (err) {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        reject(err || new Error('Failed to load image'));
      };
      if (typeof source === 'string') {
        img.src = source;
      } else if (source instanceof Blob) {
        objectUrl = URL.createObjectURL(source);
        img.src = objectUrl;
      } else {
        reject(new Error('Unsupported image source'));
      }
    });
  }

  function decodeSource(source) {
    return loadViaBitmap(source).catch(function () {
      return loadViaImageElement(source);
    });
  }

  function roundRectPath(x, y, w, h, r) {
    var path = new Path2D();
    var radius = Math.min(r, w / 2, h / 2);
    path.moveTo(x + radius, y);
    path.lineTo(x + w - radius, y);
    path.quadraticCurveTo(x + w, y, x + w, y + radius);
    path.lineTo(x + w, y + h - radius);
    path.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    path.lineTo(x + radius, y + h);
    path.quadraticCurveTo(x, y + h, x, y + h - radius);
    path.lineTo(x, y + radius);
    path.quadraticCurveTo(x, y, x + radius, y);
    path.closePath();
    return path;
  }

  function createFrame(canvas, target) {
    var padding = 48;
    var maxFrameHeight = canvas.height - padding * 2;
    var maxFrameWidth = canvas.width - padding * 2;
    var ratio = target.width / target.height;
    var frameHeight = maxFrameHeight;
    var frameWidth = frameHeight * ratio;
    if (frameWidth > maxFrameWidth) {
      frameWidth = maxFrameWidth;
      frameHeight = frameWidth / ratio;
    }
    var x = (canvas.width - frameWidth) / 2;
    var y = (canvas.height - frameHeight) / 2;
    return {
      x: x,
      y: y,
      w: frameWidth,
      h: frameHeight,
      cx: x + frameWidth / 2,
      cy: y + frameHeight / 2,
      radius: 12,
      path: roundRectPath(x, y, frameWidth, frameHeight, 12)
    };
  }

  function createElement(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }

  function open(options) {
    if (!options || !options.source) {
      return Promise.reject(new Error('ImageEditor.open requires a source'));
    }
    if (activeModal) {
      return Promise.reject(new Error('Image editor already open'));
    }
    var target = options.target || { width: 750, height: 1050 };
    var background = options.background || '#ffffff';

    return decodeSource(options.source).then(function (decoded) {
      return new Promise(function (resolve, reject) {
        var image = decoded.image;
        var imgW = decoded.width;
        var imgH = decoded.height;
        var cleanupImage = decoded.cleanup;
        var stage = document.createElement('canvas');
        stage.width = 860;
        stage.height = 620;
        var ctx = stage.getContext('2d');
        var frame = createFrame(stage, target);
        var state = {
          panX: 0,
          panY: 0,
          scale: 1,
          rotation: 0
        };
        var minScale = 1;
        var maxScale = 1;
        var zoomSlider;
        var zoomLabel;
        var rotationLabel;
        var zoomInBtn;
        var zoomOutBtn;
        var applyBtn;
        var cancelBtn;
        var resetBtn;
        var modal;
        var previousOverflow = document.body.style.overflow;
        var previousActive = document.activeElement;
        var dragging = false;
        var lastX = 0;
        var lastY = 0;
        var rafId = null;

        function requestRender() {
          if (rafId) return;
          rafId = requestAnimationFrame(function () {
            rafId = null;
            drawStage();
          });
        }

        function updateZoomLabel() {
          if (!zoomLabel) return;
          var ratio = state.scale / minScale;
          zoomLabel.textContent = Math.round(ratio * 100) + '%';
        }

        function updateRotationLabel() {
          if (!rotationLabel) return;
          var deg = Math.round((state.rotation * 180) / Math.PI);
          rotationLabel.textContent = deg + '°';
        }

        function scaleToSliderValue(scale) {
          var minLog = Math.log(minScale);
          var maxLog = Math.log(maxScale);
          if (!isFinite(minLog) || !isFinite(maxLog) || maxLog === minLog) {
            return 0;
          }
          var t = (Math.log(scale) - minLog) / (maxLog - minLog);
          return Math.round(math.clamp(t, 0, 1) * 100);
        }

        function sliderValueToScale(value) {
          var minLog = Math.log(minScale);
          var maxLog = Math.log(maxScale);
          var t = value / 100;
          return Math.exp(minLog + (maxLog - minLog) * t);
        }

        function refreshZoomSlider() {
          if (!zoomSlider) return;
          zoomSlider.value = String(scaleToSliderValue(state.scale));
          updateZoomLabel();
        }

        function recomputeScaleBounds() {
          minScale = math.fitCoverScale(imgW, imgH, frame.w, frame.h, state.rotation);
          maxScale = minScale * 8;
          state.scale = math.clamp(state.scale, minScale, maxScale);
          refreshZoomSlider();
        }

        function resetState() {
          state.panX = 0;
          state.panY = 0;
          state.rotation = 0;
          state.scale = 1;
          recomputeScaleBounds();
          updateRotationLabel();
          requestRender();
        }

        function applyZoomFactor(factor) {
          var next = math.clamp(state.scale * factor, minScale, maxScale);
          if (next === state.scale) return;
          state.scale = next;
          refreshZoomSlider();
          requestRender();
        }

        function zoomAtPoint(canvasX, canvasY, factor) {
          var next = math.clamp(state.scale * factor, minScale, maxScale);
          if (next === state.scale) return;
          var prev = state.scale;
          var relX = canvasX - frame.cx;
          var relY = canvasY - frame.cy;
          var cos = Math.cos(state.rotation);
          var sin = Math.sin(state.rotation);
          var imgX = (relX * cos + relY * sin) / prev - state.panX;
          var imgY = (-relX * sin + relY * cos) / prev - state.panY;
          state.scale = next;
          var scaleRatio = prev / next;
          state.panX += imgX * (1 - scaleRatio);
          state.panY += imgY * (1 - scaleRatio);
          refreshZoomSlider();
          requestRender();
        }

        function panByStage(dx, dy) {
          var cos = Math.cos(state.rotation);
          var sin = Math.sin(state.rotation);
          var imgDx = (dx * cos + dy * sin) / state.scale;
          var imgDy = (-dx * sin + dy * cos) / state.scale;
          state.panX += imgDx;
          state.panY += imgDy;
          requestRender();
        }

        function rotateBy(deltaRad) {
          state.rotation = normalizeAngle(state.rotation + deltaRad);
          recomputeScaleBounds();
          updateRotationLabel();
          requestRender();
        }

        function normalizeAngle(rad) {
          var twoPi = Math.PI * 2;
          rad = rad % twoPi;
          if (rad < 0) rad += twoPi;
          return rad;
        }

        function drawStage() {
          ctx.clearRect(0, 0, stage.width, stage.height);
          ctx.save();
          ctx.fillStyle = '#101010';
          ctx.fillRect(0, 0, stage.width, stage.height);
          ctx.restore();

          ctx.save();
          ctx.fillStyle = 'rgba(0,0,0,0.55)';
          ctx.fillRect(0, 0, stage.width, stage.height);
          ctx.globalCompositeOperation = 'destination-out';
          ctx.fill(frame.path);
          ctx.restore();

          ctx.save();
          ctx.clip(frame.path);
          ctx.translate(frame.cx, frame.cy);
          ctx.rotate(state.rotation);
          ctx.scale(state.scale, state.scale);
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(image, -imgW / 2 + state.panX, -imgH / 2 + state.panY);
          ctx.restore();

          ctx.save();
          ctx.strokeStyle = 'rgba(255,255,255,0.6)';
          ctx.lineWidth = 1;
          for (var i = 1; i < 3; i++) {
            var gx = frame.x + (frame.w / 3) * i;
            ctx.beginPath();
            ctx.moveTo(gx, frame.y);
            ctx.lineTo(gx, frame.y + frame.h);
            ctx.stroke();
            var gy = frame.y + (frame.h / 3) * i;
            ctx.beginPath();
            ctx.moveTo(frame.x, gy);
            ctx.lineTo(frame.x + frame.w, gy);
            ctx.stroke();
          }
          ctx.restore();

          ctx.save();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke(frame.path);
          ctx.restore();
        }

        function exportImage() {
          var out = document.createElement('canvas');
          out.width = target.width;
          out.height = target.height;
          var outCtx = out.getContext('2d');
          outCtx.fillStyle = background;
          outCtx.fillRect(0, 0, out.width, out.height);
          outCtx.translate(out.width / 2, out.height / 2);
          outCtx.rotate(state.rotation);
          var scaleX = state.scale * (out.width / frame.w);
          var scaleY = state.scale * (out.height / frame.h);
          outCtx.scale(scaleX, scaleY);
          outCtx.imageSmoothingQuality = 'high';
          outCtx.drawImage(image, -imgW / 2 + state.panX, -imgH / 2 + state.panY);
          return out.toDataURL('image/png');
        }

        function destroy(result, isError) {
          if (activeModal !== modal) return;
          activeModal = null;
          document.body.style.overflow = previousOverflow;
          if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
          document.removeEventListener('keydown', handleKeydown, true);
          if (previousActive && previousActive.focus) {
            previousActive.focus();
          }
          if (cleanupImage) cleanupImage();
          if (isError) {
            reject(result);
          } else {
            resolve(result);
          }
        }

        function handleKeydown(e) {
          if (!modal.contains(document.activeElement)) {
            modal.focus();
          }
          var handled = false;
          var step = e.shiftKey ? 1 : 10;
          switch (e.key) {
            case 'ArrowUp':
              panByStage(0, -step);
              handled = true;
              break;
            case 'ArrowDown':
              panByStage(0, step);
              handled = true;
              break;
            case 'ArrowLeft':
              panByStage(-step, 0);
              handled = true;
              break;
            case 'ArrowRight':
              panByStage(step, 0);
              handled = true;
              break;
            case '+':
            case '=':
              applyZoomFactor(1.075);
              handled = true;
              break;
            case '-':
            case '_':
              applyZoomFactor(1 / 1.075);
              handled = true;
              break;
            case '[':
              rotateBy(-Math.PI / 2);
              handled = true;
              break;
            case ']':
              rotateBy(Math.PI / 2);
              handled = true;
              break;
            case 'r':
            case 'R':
              resetState();
              handled = true;
              break;
            case 'Enter':
              handled = true;
              finish();
              break;
            case 'Escape':
              handled = true;
              destroy(new Error('cancelled'), true);
              break;
            default:
              break;
          }
          if (handled) {
            e.preventDefault();
          }
        }

        function finish() {
          try {
            var dataUrl = exportImage();
            destroy(dataUrl, false);
          } catch (err) {
            destroy(err, true);
          }
        }

        function cancel() {
          destroy(new Error('cancelled'), true);
        }

        modal = createElement('div', 'ie-modal');
        modal.tabIndex = -1;
        var dialog = createElement('div', 'ie-dialog');
        var stageWrap = createElement('div', 'ie-stage');
        stageWrap.appendChild(stage);
        dialog.appendChild(stageWrap);

        var controls = createElement('div', 'ie-controls');

        var zoomField = document.createElement('fieldset');
        var zoomLegend = document.createElement('legend');
        zoomLegend.textContent = 'Zoom';
        zoomField.appendChild(zoomLegend);
        var zoomLabelWrapper = document.createElement('label');
        zoomLabelWrapper.textContent = 'Adjust zoom';
        zoomSlider = document.createElement('input');
        zoomSlider.type = 'range';
        zoomSlider.min = '0';
        zoomSlider.max = '100';
        zoomSlider.value = '0';
        zoomSlider.setAttribute('aria-label', 'Zoom slider');
        zoomLabel = document.createElement('span');
        zoomLabel.className = 'ie-grid-preview';
        zoomLabel.textContent = '100%';
        zoomLabelWrapper.appendChild(zoomSlider);
        zoomLabelWrapper.appendChild(zoomLabel);
        zoomField.appendChild(zoomLabelWrapper);
        var zoomButtons = createElement('div');
        zoomButtons.style.display = 'flex';
        zoomButtons.style.gap = '0.5rem';
        zoomButtons.style.marginTop = '0.5rem';
        zoomOutBtn = createElement('button');
        zoomOutBtn.type = 'button';
        zoomOutBtn.textContent = 'Zoom Out';
        zoomInBtn = createElement('button');
        zoomInBtn.type = 'button';
        zoomInBtn.textContent = 'Zoom In';
        zoomButtons.appendChild(zoomOutBtn);
        zoomButtons.appendChild(zoomInBtn);
        zoomField.appendChild(zoomButtons);

        var rotateField = document.createElement('fieldset');
        var rotateLegend = document.createElement('legend');
        rotateLegend.textContent = 'Rotate';
        rotateField.appendChild(rotateLegend);
        var rotateInfo = createElement('div', null);
        rotationLabel = createElement('strong');
        rotationLabel.textContent = '0°';
        rotateInfo.appendChild(rotationLabel);
        rotateField.appendChild(rotateInfo);
        var rotateButtons = createElement('div');
        rotateButtons.style.display = 'flex';
        rotateButtons.style.gap = '0.5rem';
        var rotateLeftBtn = createElement('button');
        rotateLeftBtn.type = 'button';
        rotateLeftBtn.textContent = '⟲ 90°';
        var rotateRightBtn = createElement('button');
        rotateRightBtn.type = 'button';
        rotateRightBtn.textContent = '90° ⟳';
        rotateButtons.appendChild(rotateLeftBtn);
        rotateButtons.appendChild(rotateRightBtn);
        rotateField.appendChild(rotateButtons);

        var actionsField = document.createElement('fieldset');
        var actionsLegend = document.createElement('legend');
        actionsLegend.textContent = 'Actions';
        actionsField.appendChild(actionsLegend);
        resetBtn = createElement('button');
        resetBtn.type = 'button';
        resetBtn.textContent = 'Reset';
        applyBtn = createElement('button', 'primary');
        applyBtn.type = 'button';
        applyBtn.textContent = 'Apply';
        cancelBtn = createElement('button', 'danger');
        cancelBtn.type = 'button';
        cancelBtn.textContent = 'Cancel';
        actionsField.style.display = 'flex';
        actionsField.style.flexDirection = 'column';
        actionsField.style.gap = '0.5rem';
        actionsField.appendChild(resetBtn);
        actionsField.appendChild(applyBtn);
        actionsField.appendChild(cancelBtn);

        var tips = createElement('p', 'ie-grid-preview',
          'Pan with drag or arrow keys (Shift for fine). Use +/- keys for zoom, [ ] for rotate. Enter applies, Esc cancels.');

        controls.appendChild(zoomField);
        controls.appendChild(rotateField);
        controls.appendChild(actionsField);
        controls.appendChild(tips);

        dialog.appendChild(controls);
        modal.appendChild(dialog);
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        modal.focus();
        activeModal = modal;

        zoomSlider.addEventListener('input', function () {
          state.scale = sliderValueToScale(parseFloat(zoomSlider.value));
          updateZoomLabel();
          requestRender();
        });
        zoomInBtn.addEventListener('click', function () {
          applyZoomFactor(1.075);
        });
        zoomOutBtn.addEventListener('click', function () {
          applyZoomFactor(1 / 1.075);
        });
        rotateLeftBtn.addEventListener('click', function () {
          rotateBy(-Math.PI / 2);
        });
        rotateRightBtn.addEventListener('click', function () {
          rotateBy(Math.PI / 2);
        });
        resetBtn.addEventListener('click', resetState);
        applyBtn.addEventListener('click', finish);
        cancelBtn.addEventListener('click', cancel);

        stage.addEventListener('pointerdown', function (e) {
          stage.setPointerCapture(e.pointerId);
          dragging = true;
          lastX = e.clientX;
          lastY = e.clientY;
          e.preventDefault();
        });
        stage.addEventListener('pointermove', function (e) {
          if (!dragging) return;
          var dx = e.clientX - lastX;
          var dy = e.clientY - lastY;
          lastX = e.clientX;
          lastY = e.clientY;
          var rect = stage.getBoundingClientRect();
          var scaleX = stage.width / rect.width;
          var scaleY = stage.height / rect.height;
          panByStage(dx * scaleX, dy * scaleY);
          e.preventDefault();
        });
        function endPointer(e) {
          if (dragging) {
            dragging = false;
            stage.releasePointerCapture(e.pointerId);
          }
        }
        stage.addEventListener('pointerup', endPointer);
        stage.addEventListener('pointercancel', endPointer);

        stage.addEventListener('wheel', function (e) {
          e.preventDefault();
          var rect = stage.getBoundingClientRect();
          var canvasX = ((e.clientX - rect.left) / rect.width) * stage.width;
          var canvasY = ((e.clientY - rect.top) / rect.height) * stage.height;
          var factor = e.deltaY < 0 ? 1.075 : 1 / 1.075;
          zoomAtPoint(canvasX, canvasY, factor);
        });

        document.addEventListener('keydown', handleKeydown, true);

        recomputeScaleBounds();
        resetState();
        requestRender();
      });
    });
  }

  return { open: open };
});
