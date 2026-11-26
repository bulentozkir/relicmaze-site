(function () {
  const I18N = window.RELICMAZE_I18N || { languages: [], strings: {} };
  const translationsUrl = new URL("i18n-translations.js?v=15", document.currentScript.src);
  const STORAGE_LANG = "rm_site_lang";
  const STORAGE_CLEAR = "rm_clear_view";
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const labelKeys = ["site_menu", "atlas_floor", "previous", "next", "watch_trailer", "accessibility"];
  const labels = {
    en: ["Menu", "Floor", "Previous", "Next", "Watch trailer", "Accessibility"],
    zh: ["菜单", "楼层", "上一项", "下一项", "观看预告片", "无障碍"],
    hi: ["मेन्यू", "मंज़िल", "पिछला", "अगला", "ट्रेलर देखें", "सुलभता"],
    es: ["Menú", "Piso", "Anterior", "Siguiente", "Ver tráiler", "Accesibilidad"],
    ar: ["القائمة", "الطابق", "السابق", "التالي", "شاهد العرض", "إمكانية الوصول"],
    fr: ["Menu", "Étage", "Précédent", "Suivant", "Voir la bande-annonce", "Accessibilité"],
    bn: ["মেনু", "তলা", "আগেরটি", "পরেরটি", "ট্রেলার দেখুন", "অভিগম্যতা"],
    pt: ["Menu", "Andar", "Anterior", "Próximo", "Ver trailer", "Acessibilidade"],
    id: ["Menu", "Lantai", "Sebelumnya", "Berikutnya", "Tonton cuplikan", "Aksesibilitas"],
    ur: ["مینو", "منزل", "پچھلا", "اگلا", "ٹریلر دیکھیں", "رسائی"],
    ru: ["Меню", "Этаж", "Назад", "Далее", "Смотреть трейлер", "Доступность"],
    de: ["Menü", "Etage", "Zurück", "Weiter", "Trailer ansehen", "Barrierefreiheit"],
    ja: ["メニュー", "階", "前へ", "次へ", "予告編を見る", "アクセシビリティ"],
    pcm: ["Menu", "Floor", "Back", "Next", "Watch trailer", "Accessibility"],
    mr: ["मेनू", "मजला", "मागील", "पुढील", "ट्रेलर पाहा", "सुलभता"],
    vi: ["Menu", "Tầng", "Trước", "Sau", "Xem đoạn giới thiệu", "Trợ năng"],
    te: ["మెనూ", "అంతస్తు", "మునుపటి", "తదుపరి", "ట్రైలర్ చూడండి", "ప్రాప్యత"],
    sw: ["Menyu", "Ghorofa", "Iliyotangulia", "Inayofuata", "Tazama trela", "Ufikivu"],
    ha: ["Menu", "Bene", "Na baya", "Na gaba", "Kalli tirela", "Sauƙin shiga"],
    tr: ["Menü", "Kat", "Önceki", "Sonraki", "Fragmanı izle", "Erişilebilirlik"],
  };
  const englishCopy = {
    hero_platform: "Offline puzzle platformer for Windows",
    hero_tagline: "144 chambers beneath a stepped pyramid",
    gameplay_still: "Gameplay still",
    gameplay_label: "Gameplay footage",
    intro_rules: "Guide Milo through the pyramid, collecting seals and treasure to open each door. Miss a jump or hit a trap and you can try again without losing collected items.",
    cta_explore: "Explore 144 chambers",
    hero_explore: "Pyramid atlas",
    trailer_title: "Trailer and soundtrack",
    soundtrack_label: "Original soundtrack",
    walkthrough_strip_title: "Solver walkthroughs",
    pyramid_eyebrow: "Survey of the pyramid",
    pyramid_sub: "Select a chamber to see its region, sigil, or Sanctum gateway. On a smaller screen, use the floor picker to move through the pyramid.",
    puzzles_eyebrow: "Hidden gateways",
    enemies_eyebrow: "Illustrated bestiary",
    kabeelith_eyebrow: "Chamber 144",
    relics_eyebrow: "Field notes on the Astral Veil",
    gallery_eyebrow: "Visual archive",
    the_legend: "The legend",
    btn_throw_stone: "Throw a sun-stone",
    btn_reset_duel: "Reset duel",
    btn_phase_toggle: "Switch phase",
    phase_astral: "Astral Veil",
    listen_story: "Listen to the prologue",
    pause_story: "Pause narration",
    msstore_banner_title: "RelicMaze for Windows",
    find_store: "Find on Microsoft Store",
    filter_all: "All media",
    legend_says: "The legend says",
    evidence_says: "What the evidence says",
    on_the_record: "On the record",
  };
  const localizedFallbacks = {
    hero_platform: "subtitle_game",
    hero_tagline: "hero_kicker",
    hero_explore: "nav_pyramid",
    soundtrack_label: "music",
    find_store: "msstore_label",
  };

  function getInitialLang() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("lang");
    const supported = (code) => I18N.languages.some((language) => language.code === code);
    if (supported(q)) return q;
    try {
      const saved = localStorage.getItem(STORAGE_LANG);
      if (supported(saved)) return saved;
    } catch (_) {}
    return "en";
  }

  const preferredLang = getInitialLang();
  let currentLang = "en";
  const languagePicker = document.getElementById("site-language");
  let translations;
  let languageRequest = 0;
  let languageError;

  function t(key, fallback) {
    const table = I18N.strings[currentLang] || I18N.strings.en || {};
    const labelIndex = labelKeys.indexOf(key);
    if (labelIndex !== -1) return (labels[currentLang] || labels.en)[labelIndex];
    if (currentLang === "en" && englishCopy[key]) return englishCopy[key];
    return table[key] || table[localizedFallbacks[key]] || englishCopy[key] || I18N.strings.en?.[key] || fallback || key;
  }

  function loadTranslations() {
    if (!translations) {
      translations = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = translationsUrl.href;
        script.onload = () => {
          const strings = window.RELICMAZE_TRANSLATIONS;
          if (!strings || !I18N.languages.every(({ code }) => code === "en" || Object.hasOwn(strings, code))) {
            script.remove();
            reject(new Error("Missing RelicMaze translation data"));
            return;
          }
          Object.assign(I18N.strings, strings);
          resolve();
        };
        script.onerror = () => {
          script.remove();
          reject(new Error(`Could not load ${translationsUrl.pathname}`));
        };
        document.head.append(script);
      }).catch((error) => {
        translations = undefined;
        throw error;
      });
    }
    return translations;
  }

  async function chooseLanguage(code, updateUrl) {
    const request = ++languageRequest;
    if (languageError) languageError.hidden = true;
    if (code !== "en" && !Object.hasOwn(I18N.strings, code)) {
      try {
        await loadTranslations();
      } catch (error) {
        console.warn("RelicMaze language could not load:", error);
        if (request !== languageRequest) return;
        if (languagePicker) languagePicker.value = currentLang;
        if (languageError) languageError.hidden = false;
        return;
      }
    }
    if (request === languageRequest) applyLanguage(code, updateUrl);
  }

  function applyLanguage(code, updateUrl) {
    if (!I18N.strings[code]) code = "en";
    currentLang = code;
    try {
      localStorage.setItem(STORAGE_LANG, code);
    } catch (_) {}

    if (updateUrl && window.history && typeof window.history.replaceState === "function") {
      try {
        const url = new URL(window.location.href);
        if (code === "en") url.searchParams.delete("lang");
        else url.searchParams.set("lang", code);
        window.history.replaceState(null, "", url.pathname + url.search + url.hash);
      } catch (_) {}
    }

    const meta = I18N.languages.find((l) => l.code === code) || {
      code: "en",
      native: "English",
      english: "English",
      rtl: false,
    };

    document.documentElement.lang = meta.code;
    document.documentElement.dir = meta.rtl ? "rtl" : "ltr";

    if (languagePicker) languagePicker.value = code;

    const table = I18N.strings[code] || {};
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      el.textContent = t(key, el.textContent.trim());
      const localized = table[key] || table[localizedFallbacks[key]] || (labels[code] && labelKeys.includes(key));
      if (code !== "en" && !localized) el.lang = "en";
      else el.removeAttribute("lang");
    });

    syncPhaseState();
    renderLoreLine(loreIndex);
    updateRegionButtonNames();
    renderActiveSanctum();
    renderActiveHelpPage();
    renderStoryKaraokeWords();
    syncNarrationButton();
    inspectChamber(selectedChamber, selectedSanctum);
  }

  function initNavigation() {
    if (languagePicker && I18N.languages.length > 0) {
      languagePicker.replaceChildren(...I18N.languages.map((lang) => {
        const option = new Option(lang.native, lang.code);
        option.lang = lang.code;
        option.dir = lang.rtl ? "rtl" : "ltr";
        return option;
      }));
      languagePicker.closest("label").hidden = false;
      languageError = document.createElement("p");
      languageError.className = "language-error";
      languageError.hidden = true;
      languageError.setAttribute("role", "status");
      languageError.textContent = "Could not load this language. Choose it again to retry.";
      languagePicker.closest(".toolbar-actions").append(languageError);
      languagePicker.addEventListener("change", () => chooseLanguage(languagePicker.value, true));
    }

    const menu = document.querySelector(".site-menu");
    if (!menu) return;
    document.addEventListener("click", (event) => {
      if (menu.open && (!menu.contains(event.target) || event.target.closest(".menu-panel a"))) menu.open = false;
    });

    menu.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu.open) {
        menu.open = false;
        menu.querySelector("summary").focus();
      }
    });
  }

  function initStoreHighlight() {
    const link = document.querySelector(".msstore-cta");
    if (!link || !("IntersectionObserver" in window)) return;

    const forcedColors = matchMedia("(forced-colors: active)");
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.intersectionRatio < 0.5) return;
      observer.disconnect();
      if (!reducedMotion.matches && !forcedColors.matches && !link.matches(":hover, :focus")) {
        link.classList.add("is-pulsing");
      }
    }, { threshold: 0.5 });

    const finish = () => link.classList.remove("is-pulsing");
    link.addEventListener("animationend", finish);
    link.addEventListener("animationcancel", finish);
    observer.observe(link);
  }

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

  let loreIndex = 0;
  const loreTextEl = document.getElementById("legend-ticker-line");
  const lorePage = document.getElementById("lore-index");

  function renderLoreLine(index) {
    if (!loreTextEl) return;
    loreIndex = (index + 6) % 6;
    loreTextEl.textContent = t(`lore_${loreIndex}`);
    lorePage.textContent = `0${loreIndex + 1} / 06`;
  }

  if (lorePage) {
    lorePage.parentElement.hidden = false;
    document.getElementById("lore-prev").addEventListener("click", () => renderLoreLine(loreIndex - 1));
    document.getElementById("lore-next").addEventListener("click", () => renderLoreLine(loreIndex + 1));
  }

  function initSoundtrack() {
    const audio = document.getElementById("rm-audio");
    const menuButton = document.getElementById("toolbar-music-btn");
    const picker = document.getElementById("audio-track");
    const error = document.getElementById("soundtrack-error");
    if (!audio) return;
    const tracks = ["assets/media/relicmaze.mp3?v=8", "assets/media/relicmaze-phrygian.mp3?v=8"];
    const narration = document.getElementById("legend-voice-audio");
    let track = 0;
    audio.volume = 0.75;

    const reportAudioError = (reason) => {
      if (reason?.name === "AbortError") return;
      if (error) error.hidden = false;
      console.warn("RelicMaze soundtrack could not play:", reason);
    };
    const setTrack = (index, play) => {
      track = index;
      if (error) error.hidden = true;
      if (picker) picker.value = String(track);
      audio.src = tracks[track];
      if (play) audio.play().catch(reportAudioError);
    };
    audio.addEventListener("play", () => {
      if (narration && !narration.paused) narration.pause();
      if (error) error.hidden = true;
      menuButton?.setAttribute("aria-pressed", "true");
    });
    audio.addEventListener("pause", () => menuButton?.setAttribute("aria-pressed", "false"));
    audio.addEventListener("ended", () => setTrack((track + 1) % tracks.length, true));
    audio.addEventListener("error", () => reportAudioError(audio.error));
    menuButton?.addEventListener("click", () => {
      if (audio.paused) audio.play().catch(reportAudioError);
      else audio.pause();
    });
    picker?.addEventListener("change", () => setTrack(Number(picker.value), !audio.paused));
  }

  const trailer = document.getElementById("trailer-video");
  if (trailer) {
    const trailerError = document.getElementById("trailer-error");
    const showTrailerError = () => { trailerError.hidden = false; };
    trailer.addEventListener("error", showTrailerError);
    trailer.querySelector("source")?.addEventListener("error", showTrailerError);
    trailer.addEventListener("playing", () => { trailerError.hidden = true; });
  }

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
    { idx: 9, start: 136, end: 144, color: "#ff8533", sigil: null, vibe: "Deepest inferno of the Pyramid: Kabeelith, the winged satanic lava-born beast, guards the Heart of the Meridian." },
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
    90: { code: "S9", name: "The Shifting Labyrinth", kind: "Compass Navigation" },
    121: { code: "S10", name: "The Altar of Tribute", kind: "Equilibrium Logic" },
    144: { code: "S11", name: "The Final Synthesis", kind: "Master Sanctum" },
  };

  const SIGIL_ROOMS = new Set([15, 30, 45, 60, 75, 90, 105, 120, 135]);
  const floorPicker = document.getElementById("pyramid-floor-select");
  const atlasHover = matchMedia("(min-width: 1120px) and (hover: hover) and (pointer: fine)");
  let activeRegionFilter = null;
  let selectedChamber = 144;
  let selectedSanctum = false;

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
    selectedSanctum = Boolean(sanctumOverride && SANCTUMS[n]);
    const numEl = document.getElementById("inspector-num");
    const titleEl = document.getElementById("inspector-title");
    const metaEl = document.getElementById("inspector-meta");
    if (!numEl || !titleEl || !metaEl) return;

    const reg = regionForRoom(n);
    const floor = Math.floor(Math.sqrt(n - 1)) + 1;
    const selector = selectedSanctum ? ".sanctum-node" : ".chamber-cell";
    const current = document.querySelector(`${selector}[data-room="${n}"]`);
    const last = document.querySelector('.pyramid-rows [aria-pressed="true"]');
    if (last && last !== current) last.setAttribute("aria-pressed", "false");
    current?.setAttribute("aria-pressed", "true");
    if (floorPicker && floorPicker.value !== String(floor)) {
      floorPicker.value = String(floor);
    }
    document.querySelector(".pyramid-floor.is-current")?.classList.remove("is-current");
    document.querySelector(`.pyramid-floor[data-floor="${floor}"]`)?.classList.add("is-current");

    if (selectedSanctum) {
      const sc = SANCTUMS[n];
      numEl.textContent = sc.code;
      const sIdx = SANCTUM_LIST.findIndex((x) => x.room === n);
      titleEl.textContent = sIdx >= 0 ? t(`s${SANCTUM_LIST[sIdx].order}_title`) : sc.name;
      metaEl.textContent = `${t("atlas_floor")} ${floor} / 12 · ${t(`reg_${reg.idx}`)} · ${sc.kind}`;
      if (sIdx >= 0 && sIdx !== activeSanctumIdx) {
        activeSanctumIdx = sIdx;
        renderActiveSanctum();
      }
      return;
    }

    numEl.textContent = String(n).padStart(3, "0");
    let badge = "";
    if (n === 144) badge = " · Kabeelith";
    else if (SIGIL_ROOMS.has(n)) badge = ` · Meridian sigil ${n / 15}`;
    if (SANCTUMS[n] && n !== 144) badge += ` · Gateway to Sanctum ${SANCTUMS[n].code}`;

    titleEl.textContent = `${t(`reg_${reg.idx}`)}${badge}`;
    metaEl.textContent = `${t("atlas_floor")} ${floor} / 12 · ${reg.vibe}`;
  }

  function applyRegionHighlight(regionIdx) {
    activeRegionFilter = activeRegionFilter === regionIdx ? null : regionIdx;
    document.querySelectorAll(".region-btn").forEach((b) => {
      b.setAttribute("aria-pressed", String(Number(b.dataset.region) === activeRegionFilter));
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
      btn.setAttribute("aria-pressed", "false");
      btn.style.setProperty("--reg-color", reg.color);
      const name = document.createElement("span");
      name.className = "region-name";
      name.textContent = t(`reg_${reg.idx}`);
      const range = document.createElement("bdi");
      range.className = "region-range";
      range.textContent = `${reg.start}–${reg.end}`;
      btn.append(name, range);
      btn.addEventListener("click", () => applyRegionHighlight(reg.idx));
      regContainer.appendChild(btn);
    });

    rowsContainer.innerHTML = "";
    let roomNum = 1;
    for (let floor = 1; floor <= 12; floor++) {
      const count = 2 * floor - 1;
      const row = document.createElement("div");
      row.className = "pyramid-floor";
      row.dataset.floor = String(floor);
      const firstInFloor = roomNum;
      const lastInFloor = roomNum + count - 1;
      if (floorPicker) {
        const range = firstInFloor === lastInFloor ? "1" : `${firstInFloor}–${lastInFloor}`;
        floorPicker.add(new Option(`${floor} (${range})`, String(floor)));
      }

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
        const appendix = SIGIL_ROOMS.has(n) ? ", Meridian sigil" : n === 144 ? ", finale" : "";
        const gateway = SANCTUMS[n] ? `, Sanctum ${SANCTUMS[n].code} gateway` : "";
        cell.setAttribute("aria-label", `Chamber ${n}${appendix}${gateway}`);
        cell.setAttribute("aria-pressed", "false");
        cell.addEventListener("pointerenter", (event) => {
          if (event.pointerType === "mouse" && atlasHover.matches) inspectChamber(n, false);
        });
        cell.addEventListener("click", () => inspectChamber(n, false));
        row.appendChild(cell);
        if (SANCTUMS[n]) {
          const sc = SANCTUMS[n];
          const sBtn = document.createElement("button");
          sBtn.type = "button";
          sBtn.className = "sanctum-node";
          sBtn.dataset.room = String(n);
          sBtn.textContent = sc.code;
          sBtn.setAttribute("aria-label", `${sc.code}: ${sc.name}`);
          sBtn.setAttribute("aria-pressed", "false");
          sBtn.addEventListener("pointerenter", (event) => {
            if (event.pointerType === "mouse" && atlasHover.matches) inspectChamber(n, true);
          });
          sBtn.addEventListener("click", () => inspectChamber(n, true));
          row.appendChild(sBtn);
        }
      }

      rowsContainer.appendChild(row);
    }

    if (floorPicker) {
      floorPicker.closest("label").hidden = false;
      floorPicker.addEventListener("change", () => {
        const floor = Number(floorPicker.value);
        inspectChamber((floor - 1) ** 2 + 1, false);
      });
    }
    inspectChamber(selectedChamber, false);
  }

  const astralSection = document.getElementById("relics");
  const phaseBtn = document.getElementById("btn-phase-toggle");
  const phasePill = document.getElementById("phase-status-pill");
  let isAstral = false;

  function syncPhaseState() {
    if (!astralSection) return;
    astralSection.classList.toggle("astral-active", isAstral);
    if (phaseBtn) phaseBtn.setAttribute("aria-pressed", isAstral ? "true" : "false");
    if (phasePill) phasePill.textContent = t(isAstral ? "phase_astral" : "phase_physical");

    const pw = document.getElementById("state-phase-wall");
    const ab = document.getElementById("state-astral-bridge");
    const wr = document.getElementById("state-wraith");
    const ld = document.getElementById("state-ladder");
    if (pw) pw.textContent = isAstral ? "Passable" : "Solid sandstone";
    if (ab) ab.textContent = isAstral ? "Solid bridge · Can cross" : "Mist · Cannot cross";
    if (wr) wr.textContent = isAstral ? "Solid · Dangerous" : "Harmless";
    if (ld) ld.textContent = isAstral ? "Intangible · Cannot climb" : "Climbable";
  }

  if (phaseBtn) {
    phaseBtn.addEventListener("click", () => {
      isAstral = !isAstral;
      syncPhaseState();
    });
  }

  const galleryFilters = document.querySelectorAll("[data-filter]");
  galleryFilters.forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.filter === "all"));
    btn.addEventListener("click", () => {
      const cat = btn.dataset.filter;
      galleryFilters.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      document.querySelectorAll(".gallery-item").forEach((card) => {
        const match = cat === "all" || card.dataset.category === cat;
        card.hidden = !match;
      });
    });
  });

  function initLightbox() {
    const dialog = document.getElementById("lightbox");
    if (!dialog || typeof dialog.showModal !== "function") return;
    const image = document.getElementById("lightbox-img");
    const player = document.getElementById("lightbox-video");
    const caption = document.getElementById("lightbox-caption");
    const index = document.getElementById("lightbox-index");
    const pagination = index.parentElement;
    const error = document.getElementById("lightbox-error");
    let opener;
    let items = [];
    let current = 0;

    function clearVideo() {
      if (!player.hasAttribute("src")) return;
      player.pause();
      player.removeAttribute("src");
      player.load();
    }

    function show(indexInGroup) {
      current = (indexInGroup + items.length) % items.length;
      const link = items[current];
      const { lightboxTitle } = link.dataset;
      const lightboxVideo = link.hasAttribute("data-lightbox-video");
      const thumb = link.querySelector("img");
      const title = lightboxTitle || "RelicMaze";
      clearVideo();
      image.hidden = Boolean(lightboxVideo);
      player.hidden = !lightboxVideo;
      error.hidden = true;
      if (lightboxVideo) {
        image.removeAttribute("src");
        player.poster = thumb?.currentSrc || thumb?.src || "";
        player.setAttribute("aria-label", title);
        player.src = link.href;
      } else {
        image.alt = thumb?.alt || title;
        image.src = link.href;
      }
      caption.textContent = title;
      index.textContent = `${current + 1} / ${items.length}`;
      pagination.hidden = items.length < 2;
    }

    document.querySelectorAll("a[data-lightbox-title]").forEach((item) => {
      item.setAttribute("aria-haspopup", "dialog");
      item.addEventListener("click", (event) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        const group = item.closest("[data-viewer-group]");
        items = group ? [...group.querySelectorAll("a[data-lightbox-title]")].filter((el) => !el.closest("[hidden]")) : [item];
        opener = item;
        show(items.indexOf(item));
        dialog.showModal();
      });
    });

    document.getElementById("lightbox-prev").addEventListener("click", () => show(current - 1));
    document.getElementById("lightbox-next").addEventListener("click", () => show(current + 1));
    image.addEventListener("error", () => { if (!image.hidden) error.hidden = false; });
    player.addEventListener("error", () => { if (!player.hidden) error.hidden = false; });
    dialog.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        dialog.close();
        return;
      }
      if (items.length < 2 || event.target === player || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const step = (event.key === "ArrowRight") === (document.documentElement.dir !== "rtl") ? 1 : -1;
      show(current + step);
    });
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
    dialog.addEventListener("close", () => {
      clearVideo();
      opener?.focus({ preventScroll: true });
    });
  }

  const SANCTUM_LIST = [
    { order: 1, room: 4, plate: 1 },
    { order: 2, room: 9, plate: 1 },
    { order: 3, room: 16, plate: 1 },
    { order: 4, room: 25, plate: 4 },
    { order: 5, room: 36, plate: 4 },
    { order: 6, room: 49, plate: 4 },
    { order: 7, room: 64, plate: 7 },
    { order: 8, room: 81, plate: 7 },
    { order: 9, room: 90, plate: 7 },
    { order: 10, room: 121, plate: 4 },
    { order: 11, room: 144, plate: 7 },
  ];
  const SANCTUM_PLATES = {
    1: { file: "sanctum-04-dial", alt: "A glyph dial beside a stairway in the Tilted Dial Sanctum" },
    4: { file: "sanctum-25-prism", alt: "A prism and the light path in the Prism and Sunbeam Sanctum" },
    7: { file: "05-Gameplay-Hidden-Sanctum-Puzzle", alt: "A torchlit chamber with a stone sphere and ladders in the Rolling Boulder Maze" },
  };
  let activeSanctumIdx = 6; // Default S07 (Chamber 64 — Rolling Boulder Maze)

  function renderActiveSanctum() {
    const item = SANCTUM_LIST[activeSanctumIdx];
    if (!item) return;
    const k = item.order;

    document.querySelectorAll(".sanctum-tab").forEach((btn, idx) => {
      btn.setAttribute("aria-pressed", String(idx === activeSanctumIdx));
    });

    const badgeCode = document.getElementById("sanctum-badge-code");
    const badgeArch = document.getElementById("sanctum-badge-arch");
    const badgeRegion = document.getElementById("sanctum-badge-region");
    const titleEl = document.getElementById("sanctum-stage-title");
    const objEl = document.getElementById("sanctum-stage-obj");
    const clueEl = document.getElementById("sanctum-stage-clue");
    const shotImg = document.getElementById("sanctum-shot-img");
    const shotBtn = document.getElementById("sanctum-shot-btn");
    const shotCaption = document.getElementById("sanctum-shot-caption");

    const titleText = t(`s${k}_title`);
    const archText = t(`s${k}_arch`);
    if (badgeCode) badgeCode.textContent = `Sanctum ${String(k).padStart(2, "0")} / 11 · Chamber ${String(item.room).padStart(3, "0")}`;
    if (badgeArch) badgeArch.textContent = archText;
    const floor = Math.floor(Math.sqrt(item.room - 1)) + 1;
    if (badgeRegion) badgeRegion.textContent = `${t("atlas_floor")} ${floor} · ${t(`reg_${regionForRoom(item.room).idx}`)}`;
    if (titleEl) titleEl.textContent = titleText;
    if (objEl) objEl.textContent = t(`s${k}_obj`);
    if (clueEl) clueEl.textContent = t(`s${k}_clue`);
    const plate = SANCTUM_PLATES[item.plate];
    const plateLabel = `${t(`s${item.plate}_title`)} · Sanctum S${String(item.plate).padStart(2, "0")}`;
    if (shotCaption) shotCaption.textContent = plateLabel;
    if (shotImg) {
      shotImg.src = `assets/thumbnails/${plate.file}.webp`;
      shotImg.alt = plate.alt;
    }
    if (shotBtn) {
      shotBtn.href = `assets/screenshots/${plate.file}.png`;
      shotBtn.dataset.lightboxTitle = plateLabel;
    }
  }

  function initSanctumExplorer() {
    const rail = document.getElementById("sanctums-rail");
    if (!rail) return;
    rail.innerHTML = "";
    SANCTUM_LIST.forEach((s, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sanctum-tab";
      btn.innerHTML = `<bdi class="sanctum-tab-code">S${String(s.order).padStart(2, "0")}</bdi><bdi class="sanctum-tab-room">${String(s.room).padStart(3, "0")}</bdi>`;
      btn.setAttribute("aria-label", `Sanctum ${s.order}, Chamber ${s.room}`);
      btn.addEventListener("click", () => {
        activeSanctumIdx = idx;
        renderActiveSanctum();
      });
      rail.appendChild(btn);
    });

    const prevBtn = document.getElementById("sanctum-prev");
    const nextBtn = document.getElementById("sanctum-next");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        activeSanctumIdx = (activeSanctumIdx - 1 + SANCTUM_LIST.length) % SANCTUM_LIST.length;
        renderActiveSanctum();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        activeSanctumIdx = (activeSanctumIdx + 1) % SANCTUM_LIST.length;
        renderActiveSanctum();
      });
    }

    renderActiveSanctum();
  }

  function initEnemyFilters() {
    const btns = document.querySelectorAll("[data-enemy-filter]");
    const cards = document.querySelectorAll(".enemy-card");
    if (!btns.length || !cards.length) return;
    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const f = btn.dataset.enemyFilter;
        btns.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        cards.forEach((c) => {
          c.hidden = f !== "all" && c.dataset.enemyGroup !== f;
        });
      });
    });
  }

  function initKabeelithAltar() {
    const portraitImg = document.getElementById("kabeelith-main-img");
    const stageWrap = document.getElementById("kabeelith-portrait-stage");
    const viewFullBtn = document.getElementById("kabeelith-view-full");
    const viewWitheredBtn = document.getElementById("kabeelith-view-withered");
    const viewVisageBtn = document.getElementById("kabeelith-view-visage");
    const strikeBtn = document.getElementById("btn-throw-stone");
    const resetBtn = document.getElementById("btn-reset-duel");
    const elHits = document.getElementById("kabeelith-hits-val");
    const elScore = document.getElementById("kabeelith-score-val");
    const elHorn = document.getElementById("kabeelith-horn-val");
    const elState = document.getElementById("kabeelith-bridge-val");
    const progress = document.getElementById("kabeelith-progress");

    if (!portraitImg) return;
    let hits = 0;
    const NEEDED = 50;

    function setActivePortraitTab(activeBtn, src) {
      portraitImg.src = src;
      const isVisage = src.indexOf("visage") !== -1;
      portraitImg.width = isVisage ? 537 : 776;
      portraitImg.height = isVisage ? 516 : 752;
      portraitImg.alt = isVisage ? "Close-up of Kabeelith’s horned face" :
        activeBtn === viewWitheredBtn ? "Withered Kabeelith with exposed bones" : "Illustration of Kabeelith with four horns and unfurled wings";
      [viewFullBtn, viewWitheredBtn, viewVisageBtn].forEach((b) => {
        b?.setAttribute("aria-pressed", String(b === activeBtn));
      });
    }

    function syncStats() {
      const felled = hits >= NEEDED;
      const pts = hits * 100 + (felled ? 5000 : 0);
      if (progress) progress.value = hits;
      if (elHits) elHits.textContent = `${hits} / ${NEEDED}`;
      if (elScore) elScore.textContent = `+${pts.toLocaleString(currentLang, { numberingSystem: "latn" })} pts`;
      if (elHorn) {
        elHorn.textContent =
          hits >= 35 ? "Femur and skull exposed" : hits >= 25 ? "Horn shattered" : "Four horns intact";
      }
      if (elState) {
        elState.textContent = felled
          ? "Heart pierced"
          : hits >= 25
          ? "Withering"
          : hits > 0 && hits % 5 === 0
          ? "Roaring"
          : "Enthroned";
      }
      if (strikeBtn) strikeBtn.disabled = felled;
      if (stageWrap) stageWrap.classList.toggle("kabeelith-felled", felled);
    }

    if (viewFullBtn) {
      viewFullBtn.addEventListener("click", () => setActivePortraitTab(viewFullBtn, "assets/enemies/kabeelith-portrait.png?v=6"));
    }
    if (viewWitheredBtn) {
      viewWitheredBtn.addEventListener("click", () => setActivePortraitTab(viewWitheredBtn, "assets/enemies/kabeelith-withered.png?v=6"));
    }
    if (viewVisageBtn) {
      viewVisageBtn.addEventListener("click", () => setActivePortraitTab(viewVisageBtn, "assets/enemies/kabeelith-visage.png?v=6"));
    }

    if (strikeBtn) {
      strikeBtn.addEventListener("click", () => {
        if (hits >= NEEDED) return;
        hits++;
        if (hits === 25 && viewWitheredBtn) {
          setActivePortraitTab(viewWitheredBtn, "assets/enemies/kabeelith-withered.png?v=6");
        }
        syncStats();
        if (hits === NEEDED) resetBtn?.focus();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        hits = 0;
        if (viewFullBtn) setActivePortraitTab(viewFullBtn, "assets/enemies/kabeelith-portrait.png?v=6");
        syncStats();
      });
    }

    syncStats();
  }

  const HELP_CHAPTERS = [
    {
      id: "screen",
      pageBadge: "PAGE 02 / 14",
      partKey: "help_part1",
      titleKey: "help_p2_title",
      plate: "assets/help/help-screen.png?v=11",
      items: [
        ["hp_screen_a_h", "hp_screen_a_b"],
        ["hp_screen_b_h", "hp_screen_b_b"],
        ["hp_screen_c_h", "hp_screen_c_b"],
      ],
    },
    {
      id: "moves",
      pageBadge: "PAGE 03 / 14",
      partKey: "help_part1",
      titleKey: "help_p3_title",
      plate: "assets/help/help-moves.png?v=11",
      items: [
        ["hp_moves_a_h", "hp_moves_a_b"],
        ["hp_moves_b_h", "hp_moves_b_b"],
        ["hp_moves_c_h", "hp_moves_c_b"],
      ],
    },
    {
      id: "toolbar",
      pageBadge: "PAGE 08 / 14",
      partKey: "help_part3",
      titleKey: "help_p8_title",
      plate: "assets/help/help-toolbar.png?v=11",
      items: [
        ["hp_toolbar_a_h", "hp_toolbar_a_b"],
        ["hp_toolbar_b_h", "hp_toolbar_b_b"],
        ["hp_toolbar_c_h", "hp_toolbar_c_b"],
      ],
    },
    {
      id: "symbols",
      pageBadge: "PAGE 09 / 14",
      partKey: "help_part3",
      titleKey: "help_p9_title",
      plate: "assets/help/help-symbols.png?v=11",
      items: [
        ["hp_symbols_a_h", "hp_symbols_a_b"],
        ["hp_symbols_b_h", "hp_symbols_b_b"],
        ["hp_symbols_c_h", "hp_symbols_c_b"],
      ],
    },
    {
      id: "crowns",
      pageBadge: "PAGE 11 / 14",
      partKey: "help_part4",
      titleKey: "help_p11_title",
      plate: "assets/help/help-crowns.png?v=11",
      items: [
        ["hp_crowns_a_h", "hp_crowns_a_b"],
        ["hp_crowns_b_h", "hp_crowns_b_b"],
        ["hp_crowns_c_h", "hp_crowns_c_b"],
      ],
    },
    {
      id: "stuck",
      pageBadge: "PAGE 12 / 14",
      partKey: "help_part4",
      titleKey: "help_p12_title",
      plate: "assets/help/help-stuck.png?v=11",
      items: [
        ["hp_stuck_a_h", "hp_stuck_a_b"],
        ["hp_stuck_b_h", "hp_stuck_b_b"],
        ["hp_stuck_c_h", "hp_stuck_c_b"],
      ],
    },
  ];

  let activeHelpIdx = 0;

  function renderActiveHelpPage() {
    const rail = document.getElementById("help-tabs-rail");
    const plateImg = document.getElementById("help-plate-img");
    const plateBtn = document.getElementById("help-plate-btn");
    const badgePage = document.getElementById("help-badge-page");
    const badgePart = document.getElementById("help-badge-part");
    const stageTitle = document.getElementById("help-stage-title");
    const calloutsWrap = document.getElementById("help-callouts");
    if (!rail || !plateImg || !calloutsWrap) return;

    const ch = HELP_CHAPTERS[activeHelpIdx] || HELP_CHAPTERS[0];
    rail.querySelectorAll(".help-tab-btn").forEach((b, idx) => {
      b.setAttribute("aria-pressed", String(idx === activeHelpIdx));
      const lbl = b.querySelector(".help-tab-label");
      if (lbl) lbl.textContent = t(HELP_CHAPTERS[idx].titleKey);
    });

    const titleText = t(ch.titleKey);
    if (badgePage) badgePage.textContent = ch.pageBadge.replace(/^PAGE /, "Page ");
    if (badgePart) badgePart.textContent = t(ch.partKey);
    if (stageTitle) stageTitle.textContent = titleText;
    plateImg.src = ch.plate;
    plateImg.alt = `${titleText} — RelicMaze Help Book Plate`;
    if (plateBtn) {
      plateBtn.href = ch.plate;
      plateBtn.dataset.lightboxTitle = `${t("book_help")} (${ch.pageBadge}) — ${titleText}`;
    }

    calloutsWrap.innerHTML = "";
    ch.items.forEach(([hk, bk]) => {
      const box = document.createElement("div");
      box.className = "help-callout-item";
      const h4 = document.createElement("h4");
      h4.textContent = t(hk);
      const p = document.createElement("p");
      p.textContent = t(bk);
      if (currentLang !== "en" && !I18N.strings[currentLang]?.[bk]) p.lang = "en";
      box.appendChild(h4);
      box.appendChild(p);
      calloutsWrap.appendChild(box);
    });
  }

  function initHelpBookExplorer() {
    const rail = document.getElementById("help-tabs-rail");
    if (!rail) return;

    rail.innerHTML = "";
    HELP_CHAPTERS.forEach((ch, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "help-tab-btn";

      const pg = document.createElement("span");
      pg.className = "help-tab-page";
      pg.textContent = ch.pageBadge.split(" ")[1];
      const lbl = document.createElement("span");
      lbl.className = "help-tab-label";
      lbl.textContent = t(ch.titleKey);

      btn.appendChild(pg);
      btn.appendChild(lbl);
      btn.addEventListener("click", () => {
        activeHelpIdx = idx;
        renderActiveHelpPage();
      });
      rail.appendChild(btn);
    });

    renderActiveHelpPage();
  }

  // Word cue times from Content/voice/legend/en/timing.json (p00_l00).
  const PROLOGUE_TIMING_MS = [
    74, 135, 478, 686, 919, 1801, 2022, 2623, 2892, 3125, 4142, 4400, 4694, 4939, 5760, 6434, 6569, 6630, 7010,
    7390, 7463, 7574, 7966, 8235, 8333, 9240, 9375, 9473, 9877, 10576, 10772, 11274, 12034, 12328, 12476, 12868,
    13297, 13358, 13652, 13934, 15184, 16471, 16801, 17034, 17120, 17549, 17831, 18088, 19020, 19228, 19301,
    20037, 20159, 20233, 20588, 20882, 21434, 21544, 21593, 22047, 22402, 22819, 23346, 23493, 23578, 23824,
    24632, 24718, 24914, 25049, 25110,
  ];
  const voiceAudio = document.getElementById("legend-voice-audio");
  const voiceButton = document.getElementById("btn-play-legend-voice");
  let storyWords = [];
  let activeWord = null;

  function renderStoryKaraokeWords() {
    const titleEl = document.getElementById("story-karaoke-title");
    const bodyEl = document.getElementById("story-karaoke-body");
    if (!titleEl || !bodyEl) return;
    storyWords = [];
    activeWord = null;
    if (currentLang !== "en") return;
    for (const el of [titleEl, bodyEl]) {
      const words = el.textContent.trim().split(/\s+/);
      el.replaceChildren();
      words.forEach((word, i) => {
        if (i > 0) el.append(" ");
        const span = document.createElement("span");
        span.className = "story-word";
        span.textContent = word;
        el.appendChild(span);
        storyWords.push(span);
      });
    }
  }

  function syncNarrationButton() {
    if (!voiceAudio || !voiceButton) return;
    const playing = !voiceAudio.paused;
    voiceButton.querySelector("[data-voice-label]").textContent = t(playing ? "pause_story" : "listen_story");
    if (!playing) clearWordHighlight();
  }

  function clearWordHighlight() {
    activeWord?.classList.remove("active-word");
    activeWord = null;
  }

  function initLegendStudioVoice() {
    if (!voiceButton || !voiceAudio) return;
    const background = document.getElementById("rm-audio");
    const error = document.getElementById("story-voice-error");
    voiceButton.addEventListener("click", () => {
      if (voiceAudio.paused) {
        if (background && !background.paused) background.pause();
        error.hidden = true;
        voiceAudio.play().catch((reason) => {
          if (reason.name !== "AbortError") error.hidden = false;
        });
      } else {
        voiceAudio.pause();
      }
    });
    voiceAudio.addEventListener("play", syncNarrationButton);
    voiceAudio.addEventListener("pause", syncNarrationButton);
    voiceAudio.addEventListener("ended", () => {
      voiceAudio.currentTime = 0;
      syncNarrationButton();
    });
    voiceAudio.addEventListener("timeupdate", () => {
      if (voiceAudio.paused || reducedMotion.matches || document.hidden || storyWords.length !== PROLOGUE_TIMING_MS.length) return;
      const ms = voiceAudio.currentTime * 1000;
      const next = PROLOGUE_TIMING_MS.findIndex((cue) => cue > ms);
      const current = storyWords[next === -1 ? storyWords.length - 1 : next - 1];
      if (current === activeWord) return;
      clearWordHighlight();
      activeWord = current;
      activeWord?.classList.add("active-word");
    });
    reducedMotion.addEventListener("change", clearWordHighlight);
  }

  initNavigation();
  initStoreHighlight();
  initSoundtrack();
  initPyramidExplorer();
  initSanctumExplorer();
  initEnemyFilters();
  initKabeelithAltar();
  initHelpBookExplorer();
  initLightbox();
  initLegendStudioVoice();
  if (preferredLang === "en") applyLanguage("en");
  else chooseLanguage(preferredLang, false);
})();
