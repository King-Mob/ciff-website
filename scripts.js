// ---------- Drawing canvas + local "analysis" ----------

(function () {
  const canvas = document.getElementById('drawCanvas');
  const ctx = canvas.getContext('2d');
  const colorPicker = document.getElementById('colorPicker');
  const clearBtn = document.getElementById('clearBtn');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const resultBox = document.getElementById('resultBox');
  const resultText = document.getElementById('resultText');

  let drawing = false;
  let lastX = 0;
  let lastY = 0;
  let hasDrawn = false;

  // Track basic stats as the user draws, cheaper than scanning pixels later.
  let strokeCount = 0;
  let totalPathLength = 0;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  function resizeCanvas() {
    // Preserve drawing on resize by snapshotting first.
    const prev = document.createElement('canvas');
    prev.width = canvas.width;
    prev.height = canvas.height;
    prev.getContext('2d').drawImage(canvas, 0, 0);

    const parent = canvas.parentElement;
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    /*
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    */

    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 4;

    if (hasDrawn) {
      ctx.drawImage(prev, 0, 0, prev.width, prev.height, 0, 0, width, height);
    }
    // No fill here — canvas stays transparent until the user draws.
  }

  function getPos(evt) {
    const rect = canvas.getBoundingClientRect();
    if (evt.touches && evt.touches.length) {
      return {
        x: evt.touches[0].clientX - rect.left,
        y: evt.touches[0].clientY - rect.top
      };
    }
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

  function startDraw(evt) {
    evt.preventDefault();
    drawing = true;
    hasDrawn = true;
    strokeCount++;
    const pos = getPos(evt);
    lastX = pos.x;
    lastY = pos.y;
    updateBounds(pos);
  }

  function moveDraw(evt) {
    if (!drawing) return;
    evt.preventDefault();
    const pos = getPos(evt);

    ctx.strokeStyle = colorPicker.value;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    totalPathLength += Math.hypot(pos.x - lastX, pos.y - lastY);
    updateBounds(pos);

    lastX = pos.x;
    lastY = pos.y;
  }

  function endDraw() {
    drawing = false;
  }

  function updateBounds(pos) {
    minX = Math.min(minX, pos.x);
    minY = Math.min(minY, pos.y);
    maxX = Math.max(maxX, pos.x);
    maxY = Math.max(maxY, pos.y);
  }

  function resetStats() {
    strokeCount = 0;
    totalPathLength = 0;
    minX = Infinity;
    minY = Infinity;
    maxX = -Infinity;
    maxY = -Infinity;
    hasDrawn = false;
  }

  function clearCanvas() {
    const parent = canvas.parentElement;
    ctx.clearRect(0, 0, parent.clientWidth, parent.clientHeight);
    resetStats();
    resultBox.hidden = true;
  }

  // Mouse events
  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', moveDraw);
  window.addEventListener('mouseup', endDraw);

  // Touch events
  canvas.addEventListener('touchstart', startDraw, { passive: false });
  canvas.addEventListener('touchmove', moveDraw, { passive: false });
  canvas.addEventListener('touchend', endDraw);
  canvas.addEventListener('touchcancel', endDraw);

  clearBtn.addEventListener('click', clearCanvas);
  window.addEventListener('resize', resizeCanvas);

  // ---------- "Analysis" heuristic ----------
  // No AI, no pixel scanning needed beyond what we already tracked while
  // drawing, plus a quick ink-coverage sample from the canvas pixels.

  function sampleInkCoverage() {
    const parent = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const w = Math.round(parent.clientWidth * dpr);
    const h = Math.round(parent.clientHeight * dpr);
    const imageData = ctx.getImageData(0, 0, w, h).data;

    let inkPixels = 0;
    const totalPixels = w * h;
    // Sample every 4th pixel for performance.
    for (let i = 0; i < imageData.length; i += 16) {
      const alpha = imageData[i + 3];
      // Any non-transparent pixel counts as ink.
      if (alpha > 10) {
        inkPixels++;
      }
    }
    const sampledPixels = totalPixels / 4;
    return inkPixels / sampledPixels; // rough coverage ratio 0-1
  }

  function hexToHsl(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = 0; s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
        case g: h = ((b - r) / d + 2); break;
        default: h = ((r - g) / d + 4);
      }
      h *= 60;
    }
    return { h, s, l };
  }

  function colorMood(hex) {
    const { h, s, l } = hexToHsl(hex);
    if (s < 0.15) return l > 0.7 ? 'calm' : 'serious';
    if (h < 20 || h >= 340) return 'bold';
    if (h < 50) return 'energetic';
    if (h < 90) return 'optimistic';
    if (h < 160) return 'balanced';
    if (h < 200) return 'cool';
    if (h < 260) return 'calm';
    if (h < 300) return 'creative';
    return 'bold';
  }

  const RECOMMENDATIONS = {
    calm: [
      "Your drawing has a calm, settled feel. Maybe today's the day for something low-key and steady, rather than diving into anything chaotic.",
      "There's a relaxed quality here. Consider pacing yourself today; slow and steady will serve you well."
    ],
    serious: [
      "Your drawing leans minimal and focused. This might be a good moment to tackle something that needs concentration.",
      "Understated and direct, that's the vibe. Trust your judgement on the next decision you're weighing."
    ],
    bold: [
      "Lots of boldness in that drawing. Good time to take a confident step on something you've been putting off.",
      "Strong, decisive strokes, this could be the nudge to speak up about something on your mind."
    ],
    energetic: [
      "There's real energy in this one. Channel it into something active, a walk, a workout, or a burst of productivity.",
      "Warm and lively, sounds like a good day to start something new rather than wait around."
    ],
    optimistic: [
      "Bright and hopeful, lean into that. It's a good day to reach out to someone or try something a little outside your comfort zone.",
      "There's an upbeat quality here. Worth riding that feeling into a conversation you've been putting off."
    ],
    balanced: [
      "Nicely balanced composition. Could be a sign to keep things steady today, neither rushing nor stalling.",
      "Even and considered, a good day for weighing up a decision carefully rather than rushing it."
    ],
    cool: [
      "Cool tones suggest a clear head. Good day for planning or for organising something you've been meaning to sort out.",
      "Composed and clear-headed, lean into that for any task requiring patience."
    ],
    creative: [
      "Plenty of creative spark in that drawing. Good day to start a project, write, or make something rather than just consume.",
      "Imaginative and a little unconventional, maybe today calls for an unconventional solution to something."
    ]
  };

  function pickRecommendation(mood, coverage, strokeCount, boundsRatio) {
    const options = RECOMMENDATIONS[mood] || RECOMMENDATIONS.balanced;
    let base = options[Math.floor(Math.random() * options.length)];

    let extra = '';
    if (coverage < 0.03) {
      extra = " You kept it minimal, sometimes less really is more.";
    } else if (coverage > 0.35) {
      extra = " You really filled the canvas, sounds like you've got energy to spare today.";
    }

    if (strokeCount >= 8) {
      extra += " Lots of separate strokes too, multitasking suits you today.";
    } else if (strokeCount <= 2) {
      extra += " Just a few confident strokes, simplicity is your friend right now.";
    }

    return base + extra;
  }

  function analyzeDrawing() {
    if (!hasDrawn) {
      resultText.textContent = "Draw something first, then tap analyse.";
      resultBox.hidden = false;
      return;
    }

    const coverage = sampleInkCoverage();
    const mood = colorMood(colorPicker.value);
    const width = isFinite(maxX - minX) ? maxX - minX : 0;
    const height = isFinite(maxY - minY) ? maxY - minY : 0;
    const boundsRatio = height > 0 ? width / height : 1;

    const recommendation = pickRecommendation(mood, coverage, strokeCount, boundsRatio);
    resultText.textContent = recommendation;
    resultBox.hidden = false;
  }

  analyzeBtn.addEventListener('click', analyzeDrawing);

  // Init
  resizeCanvas();
})();