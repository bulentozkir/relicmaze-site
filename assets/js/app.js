/* ==========================================================================
   RELICMAZE — Interactive Site Controller (i18n, Soundtrack + WebAudio,
   144-Chamber Pyramid Atlas, Astral Veil Shift, Gallery Lightbox & Clear View)
   ========================================================================== */
(function () {
  const I18N = window.RELICMAZE_I18N || { languages: [], strings: {} };
  const STORAGE_LANG = "rm_site_lang";
  const STORAGE_CLEAR = "rm_clear_view";

  // --------------------------------------------------------------------------
  // 1. LANGUAGE SELECTOR & FULL 20-LANGUAGE RTL/LTR LOCALIZATION
  // --------------------------------------------------------------------------
  function getInitialLang() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("lang");
    if (q && I18N.strings[q]) return q;
    try {
      const saved = localStorage.getItem(STORAGE_LANG);
      if (saved && I18N.strings[saved]) return saved;
    } catch (_) {}
    return "en";
  }

  let currentLang = getInitialLang();

  function t(key, fallback) {
    const table = I18N.strings[currentLang] || I18N.strings.en || {};
    return table[key] || (I18N.strings.en && I18N.strings.en[key]) || fallback || key;
  }

  function applyLanguage(code) {
    if (!I18N.strings[code]) code = "en";
    currentLang = code;
    try {
      localStorage.setItem(STORAGE_LANG, code);
    } catch (_) {}

    const meta = I18N.languages.find((l) => l.code === code) || {
      code: "en",
      native: "English",
      english: "English",
      rtl: false,
    };

    document.documentElement.lang = meta.code;
    document.documentElement.dir = meta.rtl ? "rtl" : "ltr";

    // Update trigger label
    const codePill = document.getElementById("lang-current-code");
    const nativeSpan = document.getElementById("lang-current-native");
    if (codePill) codePill.textContent = meta.code.toUpperCase();
    if (nativeSpan) nativeSpan.textContent = meta.native;

    // Update menu selection state
    document.querySelectorAll(".lang-option").forEach((btn) => {
      btn.setAttribute("aria-selected", btn.dataset.lang === code ? "true" : "false");
    });

    // Translate all [data-i18n] nodes
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const val = t(key);
      if (val) el.textContent = val;
    });

    // Update dynamic audio/GIF/phase button texts & lore ticker
    syncAudioLabels();
    syncGifButtonLabel();
    syncPhaseState();
    renderLoreLine(loreIndex, false);
    updateRegionButtonNames();
    if (selectedChamber) inspectChamber(selectedChamber);
  }

  function initLanguageDropdown() {
    const dropdown = document.getElementById("lang-dropdown");
    const trigger = document.getElementById("lang-trigger");
    const menu = document.getElementById("lang-menu");
    if (!dropdown || !trigger || !menu) return;

    menu.innerHTML = "";
    I18N.languages.forEach((lang) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lang-option";
      btn.setAttribute("role", "option");
      btn.dataset.lang = lang.code;
      btn.setAttribute("aria-selected", lang.code === currentLang ? "true" : "false");

      const top = document.createElement("span");
      top.className = "lang-native";
      const nameSpan = document.createElement("span");
      nameSpan.textContent = lang.native;
      top.appendChild(nameSpan);
      if (lang.rtl) {
        const rtlBadge = document.createElement("span");
        rtlBadge.className = "rtl-tag";
        rtlBadge.textContent = "RTL";
        top.appendChild(rtlBadge);
      }

      const sub = document.createElement("span");
      sub.className = "lang-en-sub";
      sub.textContent = `${lang.english} (${lang.code})`;

      btn.appendChild(top);
      btn.appendChild(sub);
      btn.addEventListener("click", () => {
        applyLanguage(lang.code);
        dropdown.classList.remove("open");
        trigger.setAttribute("aria-expanded", "false");
      });
      menu.appendChild(btn);
    });

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = !dropdown.classList.contains("open");
      dropdown.classList.toggle("open", willOpen);
      trigger.setAttribute("aria-expanded", willOpen ? "true" : "false");
    });

    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove("open");
        trigger.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && dropdown.classList.contains("open")) {
        dropdown.classList.remove("open");
        trigger.setAttribute("aria-expanded", "false");
        trigger.focus();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 2. CLEAR VIEW (F9) & LANTERN AURA & SCROLL MERIDIAN BAR
  // --------------------------------------------------------------------------
  function setClearView(enabled) {
    document.body.classList.toggle("clear-view", enabled);
    try {
      localStorage.setItem(STORAGE_CLEAR, enabled ? "1" : "0");
    } catch (_) {}
    document.querySelectorAll("[data-clear-view-toggle]").forEach((btn) => {
      btn.setAttribute("aria-pressed", enabled ? "true" : "false");
      btn.classList.toggle("active", enabled);
    });
  }

  try {
    if (localStorage.getItem(STORAGE_CLEAR) === "1") setClearView(true);
  } catch (_) {}

  document.querySelectorAll("[data-clear-view-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setClearView(!document.body.classList.contains("clear-view"));
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "F9") {
      e.preventDefault();
      setClearView(!document.body.classList.contains("clear-view"));
    }
  });

  const aura = document.querySelector(".lantern-aura");
  if (aura) {
    window.addEventListener(
      "pointermove",
      (e) => {
        aura.style.left = `${e.clientX}px`;
        aura.style.top = `${e.clientY}px`;
      },
      { passive: true }
    );
  }

  const meridianBar = document.querySelector(".scroll-meridian-bar");
  if (meridianBar) {
    const updateScroll = () => {
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const pct = Math.min(100, Math.max(0, (window.scrollY / max) * 100));
      meridianBar.style.width = `${pct.toFixed(1)}%`;
    };
    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();
  }

  // 3D Poster Tilt in Hero
  const poster = document.getElementById("hero-poster-frame");
  if (poster) {
    poster.addEventListener("pointermove", (e) => {
      if (document.body.classList.contains("reduced-motion")) return;
      const r = poster.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      poster.style.transform = `rotateY(${(nx * 11).toFixed(2)}deg) rotateX(${(-ny * 11).toFixed(2)}deg)`;
    });
    poster.addEventListener("pointerleave", () => {
      poster.style.transform = "";
    });
  }

  // --------------------------------------------------------------------------
  // 3. ROTATING "THE LEGEND" LORE PLATE (6 Authentic Lines from Legend.cs)
  // --------------------------------------------------------------------------
  let loreIndex = 0;
  let lorePaused = false;
  const loreTextEl = document.getElementById("legend-ticker-line");
  const loreDotsWrap = document.getElementById("legend-dots");

  function renderLoreLine(idx, animate) {
    loreIndex = ((idx % 6) + 6) % 6;
    if (!loreTextEl) return;
    if (loreDotsWrap) {
      loreDotsWrap.querySelectorAll(".legend-dot").forEach((d, i) => {
        d.classList.toggle("active", i === loreIndex);
      });
    }
    const line = t(`lore_${loreIndex}`);
    if (animate && !document.body.classList.contains("reduced-motion")) {
      loreTextEl.classList.add("fading");
      setTimeout(() => {
        loreTextEl.textContent = line;
        loreTextEl.classList.remove("fading");
      }, 240);
    } else {
      loreTextEl.textContent = line;
    }
  }

  if (loreDotsWrap && loreTextEl) {
    for (let i = 0; i < 6; i++) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "legend-dot" + (i === 0 ? " active" : "");
      dot.setAttribute("aria-label", `Legend note ${i + 1}`);
      dot.addEventListener("click", () => renderLoreLine(i, true));
      loreDotsWrap.appendChild(dot);
    }
    const tickerBox = loreTextEl.closest(".legend-ticker");
    if (tickerBox) {
      tickerBox.addEventListener("mouseenter", () => (lorePaused = true));
      tickerBox.addEventListener("mouseleave", () => (lorePaused = false));
    }
    setInterval(() => {
      if (!lorePaused && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        renderLoreLine(loreIndex + 1, true);
      }
    }, 7000);
  }

  // --------------------------------------------------------------------------
  // 4. ORIGINAL SOUNDTRACK (relicmaze.mp3) + WEBAUDIO VISUALIZER + GIF STAGE
  // --------------------------------------------------------------------------
  const audioEl = document.getElementById("rm-audio");
  const toolbarMusicBtn = document.getElementById("toolbar-music-btn");
  const deckMusicBtn = document.getElementById("deck-music-btn");
  const overlayMusicBtn = document.getElementById("overlay-music-btn");
  const trailerStatusPill = document.getElementById("trailer-sound-pill");
  const seekBar = document.getElementById("audio-seek");
  const timeLabel = document.getElementById("audio-time");
  const volSlider = document.getElementById("audio-volume");
  const visCanvas = document.getElementById("audio-visualizer");
  const trailerGifImg = document.getElementById("trailer-gif-img");
  const gifToggleBtn = document.getElementById("gif-toggle-btn");

  let audioCtx = null;
  let analyser = null;
  let freqData = null;
  let gifPaused = false;

  function fmtTime(sec) {
    if (!isFinite(sec) || sec < 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }

  function ensureWebAudio() {
    if (!audioEl || audioCtx) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioCtx = new Ctx();
      const src = audioCtx.createMediaElementSource(audioEl);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      freqData = new Uint8Array(analyser.frequencyBinCount);
      src.connect(analyser);
      analyser.connect(audioCtx.destination);
      drawVisualizer();
    } catch (_) {}
  }

  function drawVisualizer() {
    if (!visCanvas || !analyser) return;
    const vctx = visCanvas.getContext("2d");
    const w = visCanvas.width;
    const h = visCanvas.height;

    function loop() {
      vctx.clearRect(0, 0, w, h);
      analyser.getByteFrequencyData(freqData);
      const bars = 24;
      const gap = 3;
      const bw = (w - gap * (bars - 1)) / bars;
      for (let i = 0; i < bars; i++) {
        const v = audioEl && !audioEl.paused ? freqData[i] / 255 : 0.08;
        const bh = Math.max(3, v * (h - 6));
        const x = i * (bw + gap);
        const y = h - bh - 2;
        const grad = vctx.createLinearGradient(0, h, 0, 0);
        grad.addColorStop(0, "#ffd46b");
        grad.addColorStop(1, "#56f6ea");
        vctx.fillStyle = grad;
        vctx.fillRect(x, y, bw, bh);
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  function syncAudioLabels() {
    const playing = Boolean(audioEl && !audioEl.paused);
    if (toolbarMusicBtn) {
      toolbarMusicBtn.classList.toggle("playing", playing);
      toolbarMusicBtn.setAttribute("aria-pressed", playing ? "true" : "false");
    }
    const labelText = playing ? t("btn_pause_music") : t("btn_play_music");
    if (deckMusicBtn) {
      deckMusicBtn.querySelector("[data-label]") &&
        (deckMusicBtn.querySelector("[data-label]").textContent = labelText);
    }
    if (overlayMusicBtn) {
      overlayMusicBtn.style.display = playing ? "none" : "inline-flex";
      const sp = overlayMusicBtn.querySelector("[data-label]");
      if (sp) sp.textContent = t("btn_play_music");
    }
    if (trailerStatusPill) {
      trailerStatusPill.classList.toggle("sound-live", playing);
      trailerStatusPill.textContent = playing ? "♪ relicmaze.mp3 · LIVE" : "♪ relicmaze.mp3 · MUTED";
    }
  }

  async function toggleMusic() {
    if (!audioEl) return;
    ensureWebAudio();
    if (audioCtx && audioCtx.state === "suspended") {
      try {
        await audioCtx.resume();
      } catch (_) {}
    }
    if (audioEl.paused) {
      try {
        await audioEl.play();
      } catch (_) {}
    } else {
      audioEl.pause();
    }
    syncAudioLabels();
  }

  [toolbarMusicBtn, deckMusicBtn, overlayMusicBtn].forEach((btn) => {
    if (btn) btn.addEventListener("click", toggleMusic);
  });

  // Hero "Watch Trailer & Music" button scrolls smoothly & starts soundtrack!
  const heroTrailerCta = document.getElementById("hero-watch-trailer");
  if (heroTrailerCta) {
    heroTrailerCta.addEventListener("click", () => {
      if (audioEl && audioEl.paused) toggleMusic();
    });
  }

  if (audioEl) {
    audioEl.volume = 0.75;
    audioEl.addEventListener("timeupdate", () => {
      if (seekBar && isFinite(audioEl.duration) && audioEl.duration > 0) {
        seekBar.value = String((audioEl.currentTime / audioEl.duration) * 100);
      }
      if (timeLabel) {
        timeLabel.textContent = `${fmtTime(audioEl.currentTime)} / ${fmtTime(audioEl.duration)}`;
      }
    });
    audioEl.addEventListener("loadedmetadata", () => {
      if (timeLabel) {
        timeLabel.textContent = `0:00 / ${fmtTime(audioEl.duration)}`;
      }
    });
    audioEl.addEventListener("play", syncAudioLabels);
    audioEl.addEventListener("pause", syncAudioLabels);
  }

  if (seekBar && audioEl) {
    seekBar.addEventListener("input", () => {
      if (isFinite(audioEl.duration) && audioEl.duration > 0) {
        audioEl.currentTime = (Number(seekBar.value) / 100) * audioEl.duration;
      }
    });
  }
  if (volSlider && audioEl) {
    volSlider.addEventListener("input", () => {
      audioEl.volume = Number(volSlider.value);
    });
  }

  function syncGifButtonLabel() {
    if (!gifToggleBtn) return;
    gifToggleBtn.textContent = gifPaused ? t("btn_resume_gif") : t("btn_pause_gif");
  }

  if (gifToggleBtn && trailerGifImg) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gifPaused = true;
      trailerGifImg.src = trailerGifImg.dataset.poster;
    }
    gifToggleBtn.addEventListener("click", () => {
      gifPaused = !gifPaused;
      trailerGifImg.src = gifPaused ? trailerGifImg.dataset.poster : trailerGifImg.dataset.gif;
      syncGifButtonLabel();
    });
  }

  // --------------------------------------------------------------------------
  // 5. INTERACTIVE 12-FLOOR STEPPED PYRAMID & 10 REGIONS EXPLORER
  // --------------------------------------------------------------------------
  const REGIONS = [
    { idx: 0, start: 1, end: 15, color: "#5cb87a", sigil: 15, vibe: "Root-cut masonry, lantern bearings & foundational latches." },
    { idx: 1, start: 16, end: 30, color: "#d69e49", sigil: 30, vibe: "Warm clay arches, suspended seals & swinging obsidian blades." },
    { idx: 2, start: 31, end: 45, color: "#4bc5cf", sigil: 45, vibe: "Pale glass sluices, cenote channels & spectral Astral Veil seams." },
    { idx: 3, start: 46, end: 60, color: "#8b78e6", sigil: 60, vibe: "Script plates, vertical gecko shafts & shadowy archive shelves." },
    { idx: 4, start: 61, end: 75, color: "#e06d44", sigil: 75, vibe: "Cooling basalt, crushing stone presses & rolling boulder chutes." },
    { idx: 5, start: 76, end: 90, color: "#5ec49e", sigil: 90, vibe: "Clockwork branches, brass conveyors & multi-channel toggle levers." },
    { idx: 6, start: 91, end: 105, color: "#5a9be6", sigil: 105, vibe: "Flooded rainclock basins, breath gauges & hanging conduits." },
    { idx: 7, start: 106, end: 120, color: "#d4b85a", sigil: 120, vibe: "Shrouded astronomical vaults, portals & precision beam instruments." },
    { idx: 8, start: 121, end: 135, color: "#e05568", sigil: 135, vibe: "Ash-lined gauntlets, reactive guardians & spectral trials." },
    { idx: 9, start: 136, end: 144, color: "#ff8533", sigil: null, vibe: "Culmination at the Pyramid base: Kabeel's lava throne & the Heart of the Meridian." },
  ];

  const SANCTUMS = {
    4: { code: "S1", name: "The Tilted Dial", kind: "Symbol & Glyph" },
    9: { code: "S2", name: "The Twin Weight Altars", kind: "Key & Lock" },
    16: { code: "S3", name: "The Pendulum Corridor", kind: "Timing & Rhythm" },
    25: { code: "S4", name: "The Prism and Sunbeam", kind: "Mechanical & Light" },
    36: { code: "S5", name: "The Rising Water Sluice", kind: "Spatial Flood" },
    49: { code: "S6", name: "The Color-Coded Gatekeeper", kind: "Glyph Sequence" },
    64: { code: "S7", name: "The Rolling Boulder Maze", kind: "Mechanical & Trap" },
    81: { code: "S8", name: "The Synchronized Torches", kind: "Symbol & Poem" },
    100: { code: "S9", name: "The Shifting Labyrinth", kind: "Compass Navigation" },
    121: { code: "S10", name: "The Altar of Tribute", kind: "Equilibrium Logic" },
    144: { code: "S11", name: "The Final Synthesis", kind: "Master Sanctum" },
  };

  const SIGIL_ROOMS = new Set([15, 30, 45, 60, 75, 90, 105, 120, 135]);
  let activeRegionFilter = null;
  let selectedChamber = 144;

  function regionForRoom(n) {
    return REGIONS.find((r) => n >= r.start && n <= r.end) || REGIONS[0];
  }

  function updateRegionButtonNames() {
    document.querySelectorAll(".region-btn").forEach((btn) => {
      const idx = Number(btn.dataset.region);
      const nameEl = btn.querySelector(".region-name");
      if (nameEl) nameEl.textContent = t(`reg_${idx}`);
    });
  }

  function inspectChamber(n, sanctumOverride) {
    selectedChamber = n;
    const numEl = document.getElementById("inspector-num");
    const titleEl = document.getElementById("inspector-title");
    const metaEl = document.getElementById("inspector-meta");
    if (!numEl || !titleEl || !metaEl) return;

    document.querySelectorAll(".chamber-cell, .sanctum-node").forEach((c) => {
      c.classList.remove("selected");
    });

    const reg = regionForRoom(n);
    const floor = Math.floor(Math.sqrt(n - 1)) + 1;

    if (sanctumOverride && SANCTUMS[n]) {
      const sc = SANCTUMS[n];
      const node = document.querySelector(`.sanctum-node[data-room="${n}"]`);
      if (node) node.classList.add("selected");
      numEl.textContent = sc.code;
      titleEl.textContent = `${sc.name} — Hidden Sanctum (${sc.kind})`;
      metaEl.textContent = `East-flank gateway from Chamber ${String(n).padStart(3, "0")} · Floor ${floor} of 12 · ${t(`reg_${reg.idx}`)}`;
      return;
    }

    const cell = document.querySelector(`.chamber-cell[data-room="${n}"]`);
    if (cell) cell.classList.add("selected");

    numEl.textContent = String(n).padStart(3, "0");
    let badge = "";
    if (n === 144) badge = " · Throne of Kabeel & Heart of the Meridian (20-Stone Duel)";
    else if (SIGIL_ROOMS.has(n)) badge = ` · Meridian Sigil #${n / 15} Chamber`;
    else if (SANCTUMS[n]) badge = ` · Gateway to Sanctum ${SANCTUMS[n].code} (${SANCTUMS[n].name})`;

    titleEl.textContent = `${t(`reg_${reg.idx}`)}${badge}`;
    metaEl.textContent = `Floor ${floor} of 12 (32×20 tiles, 12 Hz deterministic solver-verified) — ${reg.vibe}`;
  }

  function applyRegionHighlight(regionIdx) {
    activeRegionFilter = activeRegionFilter === regionIdx ? null : regionIdx;
    document.querySelectorAll(".region-btn").forEach((b) => {
      b.classList.toggle("active", Number(b.dataset.region) === activeRegionFilter);
    });
    document.querySelectorAll(".chamber-cell").forEach((cell) => {
      const rIdx = Number(cell.dataset.region);
      cell.classList.toggle("dimmed", activeRegionFilter !== null && rIdx !== activeRegionFilter);
    });
    if (activeRegionFilter !== null) {
      const reg = REGIONS[activeRegionFilter];
      inspectChamber(reg.sigil || reg.end, false);
    }
  }

  function initPyramidExplorer() {
    const regContainer = document.getElementById("region-list");
    const rowsContainer = document.getElementById("pyramid-rows");
    if (!regContainer || !rowsContainer) return;

    regContainer.innerHTML = "";
    REGIONS.forEach((reg) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "region-btn";
      btn.dataset.region = String(reg.idx);
      btn.style.setProperty("--reg-color", reg.color);
      btn.innerHTML = `<span class="region-name">${t(`reg_${reg.idx}`)}</span><span class="region-range">${reg.start}–${reg.end}</span>`;
      btn.addEventListener("click", () => applyRegionHighlight(reg.idx));
      regContainer.appendChild(btn);
    });

    rowsContainer.innerHTML = "";
    let roomNum = 1;
    for (let f = 0; f < 12; f++) {
      const count = 2 * f + 1;
      const row = document.createElement("div");
      row.className = "pyramid-floor";

      const tag = document.createElement("span");
      tag.className = "floor-tag";
      const firstInFloor = roomNum;
      const lastInFloor = roomNum + count - 1;
      tag.textContent = firstInFloor === lastInFloor ? "1" : `${firstInFloor}–${lastInFloor}`;
      row.appendChild(tag);

      for (let c = 0; c < count; c++) {
        const n = roomNum++;
        const reg = regionForRoom(n);
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "chamber-cell";
        if (SIGIL_ROOMS.has(n)) cell.classList.add("has-sigil");
        if (n === 144) cell.classList.add("is-boss");
        cell.dataset.room = String(n);
        cell.dataset.region = String(reg.idx);
        cell.style.setProperty("--cell-color", reg.color);
        cell.textContent = String(n);
        cell.setAttribute("aria-label", `Chamber ${n}`);
        cell.addEventListener("mouseenter", () => inspectChamber(n, false));
        cell.addEventListener("click", () => inspectChamber(n, false));
        row.appendChild(cell);
      }

      // East-flank Hidden Sanctum on floors 1..11 (ends at square numbers 4, 9, 16 ... 144)
      if (SANCTUMS[lastInFloor]) {
        const sc = SANCTUMS[lastInFloor];
        const sBtn = document.createElement("button");
        sBtn.type = "button";
        sBtn.className = "sanctum-node";
        sBtn.dataset.room = String(lastInFloor);
        sBtn.textContent = sc.code;
        sBtn.setAttribute("aria-label", `${sc.code}: ${sc.name}`);
        sBtn.addEventListener("mouseenter", () => inspectChamber(lastInFloor, true));
        sBtn.addEventListener("click", () => inspectChamber(lastInFloor, true));
        row.appendChild(sBtn);
      }

      rowsContainer.appendChild(row);
    }

    inspectChamber(144, false);
  }

  // --------------------------------------------------------------------------
  // 6. ASTRAL VEIL PHASE SHIFT INTERACTIVE TOGGLE
  // --------------------------------------------------------------------------
  const astralSection = document.getElementById("relics");
  const phaseBtn = document.getElementById("btn-phase-toggle");
  const phasePill = document.getElementById("phase-status-pill");
  let isAstral = false;

  function syncPhaseState() {
    if (!astralSection) return;
    astralSection.classList.toggle("astral-active", isAstral);
    if (phaseBtn) phaseBtn.setAttribute("aria-pressed", isAstral ? "true" : "false");
    if (phasePill) phasePill.textContent = isAstral ? `✦ ${t("phase_astral")}` : `◈ ${t("phase_physical")}`;

    const pw = document.getElementById("state-phase-wall");
    const ab = document.getElementById("state-astral-bridge");
    const wr = document.getElementById("state-wraith");
    const ld = document.getElementById("state-ladder");
    if (pw) pw.textContent = isAstral ? "PERMEABLE AIR (Walk Through)" : "SOLID SANDSTONE (#)";
    if (ab) ab.textContent = isAstral ? "SOLID SPIRIT BRIDGE (#)" : "INTANGIBLE MIST (Fall)";
    if (wr) wr.textContent = isAstral ? "SOLIDIFIED STALKER!" : "HARMLESS ECTOPLASM";
    if (ld) ld.textContent = isAstral ? "INTANGIBLE (No Climb)" : "CLIMBABLE RUNGS (H)";
  }

  if (phaseBtn) {
    phaseBtn.addEventListener("click", () => {
      isAstral = !isAstral;
      syncPhaseState();
    });
  }

  // --------------------------------------------------------------------------
  // 7. FILTERABLE SCREENSHOT GALLERY & KEYBOARD LIGHTBOX
  // --------------------------------------------------------------------------
  const filterBtns = document.querySelectorAll(".filter-btn");
  const galleryItems = Array.from(document.querySelectorAll("[data-lightbox-src]"));
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightbox-img");
  const lbCaption = document.getElementById("lightbox-caption");
  const lbClose = document.getElementById("lightbox-close");
  const lbPrev = document.getElementById("lightbox-prev");
  const lbNext = document.getElementById("lightbox-next");
  let lbIndex = 0;

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.filter;
      filterBtns.forEach((b) => b.classList.toggle("active", b === btn));
      document.querySelectorAll(".gallery-item").forEach((card) => {
        const match = cat === "all" || card.dataset.category === cat;
        card.hidden = !match;
      });
    });
  });

  function visibleLightboxItems() {
    return galleryItems.filter((el) => !el.hidden);
  }

  function openLightboxAt(idx) {
    const list = visibleLightboxItems();
    if (!lightbox || !lbImg || list.length === 0) return;
    lbIndex = ((idx % list.length) + list.length) % list.length;
    const item = list[lbIndex];
    lbImg.src = item.dataset.lightboxSrc;
    lbImg.alt = item.dataset.lightboxTitle || "RelicMaze";
    if (lbCaption) {
      lbCaption.textContent = `${item.dataset.lightboxTitle || ""} (${lbIndex + 1} / ${list.length})`;
    }
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
  }

  galleryItems.forEach((el) => {
    el.addEventListener("click", () => {
      const list = visibleLightboxItems();
      const idx = list.indexOf(el);
      openLightboxAt(idx >= 0 ? idx : 0);
    });
  });

  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lbPrev) lbPrev.addEventListener("click", () => openLightboxAt(lbIndex - 1));
  if (lbNext) lbNext.addEventListener("click", () => openLightboxAt(lbIndex + 1));
  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (!lightbox || !lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") openLightboxAt(lbIndex - 1);
    else if (e.key === "ArrowRight") openLightboxAt(lbIndex + 1);
  });

  // --------------------------------------------------------------------------
  // 8. SCROLL REVEAL & ANIMATED NUMBER COUNTERS
  // --------------------------------------------------------------------------
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length > 0) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in-view"));
  }

  const counterEls = document.querySelectorAll("[data-count-to]");
  if ("IntersectionObserver" in window && counterEls.length > 0) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          cio.unobserve(el);
          const target = Number(el.dataset.countTo);
          if (target === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            el.textContent = String(target);
            return;
          }
          const start = performance.now();
          const dur = 950;
          function tick(now) {
            const p = Math.min(1, (now - start) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = String(Math.round(target * eased));
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.4 }
    );
    counterEls.forEach((el) => cio.observe(el));
  }

  // Boot!
  initLanguageDropdown();
  initPyramidExplorer();
  applyLanguage(currentLang);
})();
