/**
 * Community OTT - Demo Static Website Application
 * Consumes sample.json dynamically and renders with Hotstar-level styling
 */

(function () {
  'use strict';

  // ── 1. Native Language Name Mapping ─────────────────────────────────
  const NATIVE_LANGUAGE_MAP = {
    en: 'English',
    ta: 'தமிழ்',
    te: 'తెలుగు',
    hi: 'हिन्दी',
    kn: 'ಕನ್ನಡ',
    ml: 'മലയാളം',
    mr: 'मराठी',
    bn: 'বাংলা',
    gu: 'ગુજરાતી',
    pa: 'ਪੰਜਾਬੀ',
    ur: 'اردو',
  };

  function getNativeLanguageName(code) {
    if (!code) return 'English';
    const key = code.toLowerCase().trim();
    return NATIVE_LANGUAGE_MAP[key] || code.toUpperCase();
  }

  // ── 2. Cinematic SVG Poster Fallback Generator ────────────────────────
  function createFallbackPosterSvg(title, subtitle = 'Community OTT') {
    const cleanTitle = (title || 'Featured Title').replace(/[<>&"]/g, '');
    const cleanSubtitle = subtitle.replace(/[<>&"]/g, '');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%"><defs><linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#241E16"/><stop offset="50%" stop-color="#17140F"/><stop offset="100%" stop-color="#100E0B"/></linearGradient><radialGradient id="blueGlow" cx="50%" cy="30%" r="50%"><stop offset="0%" stop-color="#1677D2" stop-opacity="0.35"/><stop offset="100%" stop-color="#1677D2" stop-opacity="0"/></radialGradient></defs><rect width="400" height="600" fill="url(#bgGrad)"/><rect width="400" height="600" fill="url(#blueGlow)"/><circle cx="200" cy="240" r="64" fill="#1D1913" stroke="#1677D2" stroke-width="3" stroke-dasharray="6,4"/><polygon points="190,215 225,240 190,265" fill="#1677D2"/><text x="200" y="360" font-family="Inter, sans-serif" font-size="20" font-weight="700" fill="#F5F0E6" text-anchor="middle">${cleanTitle.length > 20 ? cleanTitle.substring(0, 18) + '...' : cleanTitle}</text><text x="200" y="390" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#F59E0B" text-anchor="middle" letter-spacing="2">${cleanSubtitle.toUpperCase()}</text><rect x="160" y="420" width="80" height="3" rx="1.5" fill="#16A34A"/></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  window.onPosterImgError = function (img) {
    if (!img) return;
    img.onerror = null;
    const title = img.getAttribute('data-title') || 'Featured Presentation';
    img.src = createFallbackPosterSvg(title);
  };

  function createFallbackBannerSvg(title) {
    const cleanTitle = (title || 'Featured Presentation').replace(/[<>&"]/g, '');
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="100%" height="100%">
        <defs>
          <linearGradient id="bannerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#2A2319"/>
            <stop offset="40%" stop-color="#1D1913"/>
            <stop offset="100%" stop-color="#100E0B"/>
          </linearGradient>
          <radialGradient id="glow" cx="70%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#1677D2" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#1677D2" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="1280" height="720" fill="url(#bannerGrad)"/>
        <rect width="1280" height="720" fill="url(#glow)"/>
        <circle cx="920" cy="360" r="140" fill="#17140F" stroke="#1677D2" stroke-width="4" stroke-opacity="0.4"/>
        <polygon points="900,310 970,360 900,410" fill="#1677D2" opacity="0.8"/>
        <text x="140" y="380" font-family="'Inter', sans-serif" font-size="44" font-weight="800" fill="#F5F0E6">
          ${cleanTitle}
        </text>
      </svg>
    `;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.trim());
  }

  // ── 3. Application State ──────────────────────────────────────────────
  const state = {
    data: null,
    availableLanguages: ['en', 'ta'],
    currentLanguage: localStorage.getItem('ott_demo_lang') || 'en',
    currentHeroIndex: 0,
    heroTimer: null,
    sectionObserver: null,
    searchQuery: '',
    watchlist: new Set(JSON.parse(localStorage.getItem('ott_demo_watchlist') || '[]')),
    activeModalItem: null,
    isPlayingSimulatedVideo: false,
  };

  // ── 4. DOM Elements Cache ─────────────────────────────────────────────
  const elements = {
    appHeader: document.getElementById('appHeader'),
    brandLogo: document.getElementById('brandLogo'),
    headerNav: document.getElementById('headerNav'),
    sectionNavLinks: document.getElementById('sectionNavLinks'),
    brandLogoFooter: document.getElementById('brandLogoFooter'),
    langSelectorBtn: document.getElementById('langSelectorBtn'),
    langSelectorLabel: document.getElementById('langSelectorLabel'),
    langDropdownMenu: document.getElementById('langDropdownMenu'),
    searchToggleBtn: document.getElementById('searchToggleBtn'),
    searchBox: document.getElementById('searchBox'),
    searchInput: document.getElementById('searchInput'),
    searchClearBtn: document.getElementById('searchClearBtn'),
    heroSection: document.getElementById('heroSection'),
    heroBanner: document.getElementById('heroBanner'),
    heroContentBox: document.getElementById('heroContentBox'),
    heroArrowLeft: document.getElementById('heroArrowLeft'),
    heroArrowRight: document.getElementById('heroArrowRight'),
    heroIndicators: document.getElementById('heroIndicators'),
    heroWatchBtn: document.getElementById('heroWatchBtn'),
    heroInfoBtn: document.getElementById('heroInfoBtn'),
    mainContentContainer: document.getElementById('mainContentContainer'),
    railsContainer: document.getElementById('railsContainer'),
    searchResultsSection: document.getElementById('searchResultsSection'),
    searchResultsCount: document.getElementById('searchResultsCount'),
    searchResultsGrid: document.getElementById('searchResultsGrid'),
    clearSearchFilterBtn: document.getElementById('clearSearchFilterBtn'),
    detailsModal: document.getElementById('detailsModal'),
    modalContainer: document.getElementById('modalContainer'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    modalHeroCover: document.getElementById('modalHeroCover'),
    modalTitle: document.getElementById('modalTitle'),
    modalTitleLogo: document.getElementById('modalTitleLogo'),
    modalMetaRow: document.getElementById('modalMetaRow'),
    modalDescription: document.getElementById('modalDescription'),
    modalPlayBtn: document.getElementById('modalPlayBtn'),
    modalWatchlistBtn: document.getElementById('modalWatchlistBtn'),
    modalShareBtn: document.getElementById('modalShareBtn'),
    modalPlayerBox: document.getElementById('modalPlayerBox'),
    modalPlayerScreen: document.getElementById('modalPlayerScreen'),
    toastBox: document.getElementById('toastBox'),
    toastMessage: document.getElementById('toastMessage'),
  };

  // ── 5. Toast Notification Helper ──────────────────────────────────────
  let toastTimer = null;
  function showToast(message) {
    if (!elements.toastBox || !elements.toastMessage) return;
    elements.toastMessage.textContent = message;
    elements.toastBox.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      elements.toastBox.classList.remove('show');
    }, 2800);
  }

  // ── 6. Data Helpers (Multilingual & Ratio Normalization) ───────────────
  function getLocalizedHero(item, lang = state.currentLanguage) {
    if (!item) return null;
    const values = item.language_specific_values || [];
    const localized = values.find((v) => v.language === lang) || values[0] || {};
    const assets = localized.assets || {};
    return {
      id: item.id || 'hero_item',
      title: localized.title || 'Featured Presentation',
      description: localized.description || 'Watch now exclusively on Community OTT.',
      assets: {
        '16_9': assets['16_9'] || assets['3_2'] || assets['2_3'],
        '3_1': assets['3_1'],
        '2_3': assets['2_3'] || assets['1_1'],
        '1_1': assets['1_1'],
        '3_2': assets['3_2'],
      },
      raw: item,
    };
  }

  function getLocalizedSection(sec, lang = state.currentLanguage) {
    if (!sec) return null;
    const values = sec.language_specific_values || [];
    const localized = values.find((v) => v.language === lang) || values[0] || {};
    return {
      id: sec.id || 'section_id',
      title: localized.title || sec.description || 'Featured Section',
      description: localized.description || sec.description || '',
      content: (sec.content || []).map((c) => getLocalizedContent(c, lang)),
      raw: sec,
    };
  }

  function getLocalizedContent(item, lang = state.currentLanguage) {
    if (!item) return null;
    const languagesContent = item.languages_content || [];
    const localized = languagesContent.find((lc) => lc.language === lang) || languagesContent[0] || {};
    const assets = localized.assets || {};
    return {
      id: item.random_value || item.id || Math.random().toString(),
      title: localized.title || 'Untitled Movie',
      description: localized.description || 'Explore premium community cinema and exclusive series.',
      ageRating: item.ageRating || 'U/A 13+',
      duration: item.duration || '2h 14m',
      year: item.year || '2025',
      assets: {
        '2_3': assets['2_3'] || assets['1_1'] || assets['16_9'],
        '16_9': assets['16_9'] || assets['3_2'] || assets['2_3'],
        '3_1': assets['3_1'],
        '1_1': assets['1_1'],
        '3_2': assets['3_2'],
      },
      raw: item,
    };
  }

  function renderSectionNavigation() {
    if (!elements.headerNav || !elements.sectionNavLinks) return;
    const homeLink = elements.headerNav.querySelector('[data-home-link]');
    if (homeLink) homeLink.textContent = state.currentLanguage === 'te' ? 'హోమ్' : 'Home';

    elements.sectionNavLinks.replaceChildren();
    (state.data?.content_section || []).forEach((section) => {
      const localized = getLocalizedSection(section, state.currentLanguage);
      if (!localized || localized.content.length === 0) return;
      const link = document.createElement('a');
      link.className = 'nav-link';
      link.href = `#section-${localized.id}`;
      link.dataset.navSection = localized.id;
      link.textContent = localized.title;
      link.setAttribute('aria-label', `Browse ${localized.title}`);
      elements.sectionNavLinks.append(link);
    });
  }

  function updateActiveSectionLink(id) {
    elements.headerNav?.querySelectorAll('.nav-link').forEach((link) => {
      const isActive = link.dataset.navSection === id || (!id && link.hasAttribute('data-home-link'));
      link.classList.toggle('active', isActive);
      if (isActive) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  // ── 7. Render Language Selector ───────────────────────────────────────
  function renderLanguageDropdown() {
    if (!elements.langDropdownMenu) return;
    elements.langSelectorLabel.textContent = getNativeLanguageName(state.currentLanguage);

    elements.langDropdownMenu.innerHTML = `
      <div class="lang-dropdown-header">Select App Language</div>
      ${state.availableLanguages
        .map((langCode) => {
          const isActive = langCode === state.currentLanguage;
          const nativeName = getNativeLanguageName(langCode);
          return `
            <div class="lang-option-item ${isActive ? 'active' : ''}" data-lang="${langCode}">
              <span>${nativeName} <small style="color:var(--text-muted);font-family:monospace;font-size:11px">(${langCode.toUpperCase()})</small></span>
              ${isActive ? '<span class="lang-check-icon">✓</span>' : ''}
            </div>
          `;
        })
        .join('')}
    `;

    elements.langDropdownMenu.querySelectorAll('.lang-option-item').forEach((item) => {
      item.addEventListener('click', () => {
        const selected = item.getAttribute('data-lang');
        if (selected && selected !== state.currentLanguage) {
          state.currentLanguage = selected;
          localStorage.setItem('ott_demo_lang', selected);
          closeLanguageDropdown();
          renderLanguageDropdown();
          renderHeroCarousel();
          renderContentRails();
          if (state.searchQuery) {
            handleSearch(state.searchQuery);
          }
          showToast(`App language switched to ${getNativeLanguageName(selected)}`);
        }
      });
    });
  }

  function toggleLanguageDropdown() {
    const isOpen = elements.langDropdownMenu.classList.contains('show');
    if (isOpen) {
      closeLanguageDropdown();
    } else {
      elements.langDropdownMenu.classList.add('show');
      elements.langSelectorBtn.classList.add('open');
    }
  }

  function closeLanguageDropdown() {
    elements.langDropdownMenu.classList.remove('show');
    elements.langSelectorBtn.classList.remove('open');
  }

  // ── 8. Render Hero Carousel ───────────────────────────────────────────
  function renderHeroCarousel() {
    const heroes = state.data?.hero_section || [];
    if (heroes.length === 0) {
      if (elements.heroSection) elements.heroSection.style.display = 'none';
      return;
    }
    if (elements.heroSection) elements.heroSection.style.display = 'block';

    const safeIndex = state.currentHeroIndex % heroes.length;
    const heroItem = getLocalizedHero(heroes[safeIndex], state.currentLanguage);
    if (!heroItem) return;

    // Set Banner Background (16:9)
    const bannerUrl = heroItem.assets['16_9'];
    if (elements.heroBanner) {
      elements.heroBanner.style.backgroundImage = `url("${bannerUrl}")`;
      elements.heroBanner.classList.remove('zoom-active');
      void elements.heroBanner.offsetWidth; // trigger reflow
      elements.heroBanner.classList.add('zoom-active');

      // Test banner image load; fallback if error
      const testImg = new Image();
      testImg.src = bannerUrl;
      testImg.onerror = () => {
        elements.heroBanner.style.backgroundImage = `url("${createFallbackBannerSvg(heroItem.title)}")`;
      };
    }

    // Build Content Box (Title Logo / text, badges, desc)
    const titleLogoUrl = heroItem.assets['3_1'];
    let titleHtml = '';
    if (titleLogoUrl) {
      titleHtml = `
        <img 
          src="${titleLogoUrl}" 
          alt="${heroItem.title}" 
          class="hero-title-logo-img"
          onerror="this.style.display='none'; document.getElementById('heroFallbackTitleText').style.display='block';"
        />
        <h1 id="heroFallbackTitleText" class="hero-title-text" style="display:none;">${heroItem.title}</h1>
      `;
    } else {
      titleHtml = `<h1 class="hero-title-text">${heroItem.title}</h1>`;
    }

    const langDisplayBadge = state.availableLanguages.length > 1
      ? `${state.availableLanguages.length} Languages`
      : getNativeLanguageName(state.currentLanguage);

    elements.heroContentBox.innerHTML = `
      ${titleHtml}
      <div class="hero-meta-row">
        <span class="hero-badge hero-badge-age">U/A 13+</span>
        <span class="hero-badge hero-badge-primary">4K UHD</span>
        <span class="hero-badge">2h 15m</span>
        <span class="hero-badge hero-badge-primary">${langDisplayBadge}</span>
        <span class="hero-badge">Action &bull; Drama</span>
      </div>
      <p class="hero-description">${heroItem.description}</p>
      <div class="hero-actions-row">
        <button id="heroPlayActionBtn" class="hero-btn-primary">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          Watch Now
        </button>
        <button id="heroInfoActionBtn" class="hero-btn-secondary">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          More Details
        </button>
      </div>
    `;

    document.getElementById('heroPlayActionBtn')?.addEventListener('click', () => {
      openDetailsModal(heroItem, true);
    });

    document.getElementById('heroInfoActionBtn')?.addEventListener('click', () => {
      openDetailsModal(heroItem, false);
    });

    // Render Indicator Dots
    renderHeroIndicators(heroes.length, safeIndex);
  }

  function renderHeroIndicators(total, current) {
    if (!elements.heroIndicators) return;
    if (total <= 1) {
      elements.heroIndicators.style.display = 'none';
      return;
    }
    elements.heroIndicators.style.display = 'flex';
    elements.heroIndicators.innerHTML = Array.from({ length: total })
      .map(
        (_, i) =>
          `<div class="hero-indicator-dot ${i === current ? 'active' : ''}" data-index="${i}"></div>`
      )
      .join('');

    elements.heroIndicators.querySelectorAll('.hero-indicator-dot').forEach((dot) => {
      dot.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        state.currentHeroIndex = idx;
        renderHeroCarousel();
        resetHeroTimer();
      });
    });
  }

  function nextHero() {
    const heroes = state.data?.hero_section || [];
    if (heroes.length <= 1) return;
    state.currentHeroIndex = (state.currentHeroIndex + 1) % heroes.length;
    renderHeroCarousel();
    resetHeroTimer();
  }

  function prevHero() {
    const heroes = state.data?.hero_section || [];
    if (heroes.length <= 1) return;
    state.currentHeroIndex = (state.currentHeroIndex - 1 + heroes.length) % heroes.length;
    renderHeroCarousel();
    resetHeroTimer();
  }

  function startHeroTimer() {
    stopHeroTimer();
    state.heroTimer = setInterval(nextHero, 6000);
  }

  function stopHeroTimer() {
    if (state.heroTimer) {
      clearInterval(state.heroTimer);
      state.heroTimer = null;
    }
  }

  function resetHeroTimer() {
    stopHeroTimer();
    startHeroTimer();
  }

  // ── 9. Render Content Rails ───────────────────────────────────────────
  function renderContentRails() {
    const sections = state.data?.content_section || [];
    if (!elements.railsContainer) return;

    if (sections.length === 0) {
      elements.railsContainer.innerHTML = `
        <div style="text-align: center; padding: 60px 0; color: var(--text-muted);">
          No content sections available in sample.json.
        </div>
      `;
      return;
    }

    elements.railsContainer.innerHTML = sections
      .map((sec, secIdx) => {
        const localizedSec = getLocalizedSection(sec, state.currentLanguage);
        if (!localizedSec || localizedSec.content.length === 0) return '';

        const cardsHtml = localizedSec.content
          .map((card) => renderCardHtml(card, `sec-${secIdx}`))
          .join('');

        return `
          <section class="homepage-section" id="section-${localizedSec.id}" data-section-id="${localizedSec.id}">
            <div class="section-header">
              <div class="section-title-wrap">
                <h3 class="section-title">
                  <span class="section-title-bar"></span>
                  ${localizedSec.title}
                </h3>
                ${localizedSec.description ? `<p class="section-description">${localizedSec.description}</p>` : ''}
              </div>
              <button class="section-see-all" data-sec-idx="${secIdx}">
                See All
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>

            <div class="rail-container">
              <button class="rail-scroll-arrow rail-arrow-left" data-target="rail-${secIdx}" aria-label="Scroll left">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              
              <div id="rail-${secIdx}" class="horizontal-rail">
                ${cardsHtml}
              </div>

              <button class="rail-scroll-arrow rail-arrow-right" data-target="rail-${secIdx}" aria-label="Scroll right">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          </section>
        `;
      })
      .join('');

    renderSectionNavigation();
    if (state.sectionObserver) state.sectionObserver.disconnect();
    if ('IntersectionObserver' in window) {
      state.sectionObserver = new IntersectionObserver((entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) updateActiveSectionLink(visible.target.dataset.sectionId || '');
      }, { rootMargin: '-18% 0px -68% 0px', threshold: [0, 0.15, 0.35] });
      elements.railsContainer.querySelectorAll('.homepage-section').forEach((section) => state.sectionObserver.observe(section));
      if (elements.heroSection) state.sectionObserver.observe(elements.heroSection);
    }

    // Attach card click handlers
    elements.railsContainer.querySelectorAll('.content-card-wrap').forEach((cardEl) => {
      cardEl.addEventListener('click', () => {
        const cardData = JSON.parse(cardEl.getAttribute('data-content') || '{}');
        openDetailsModal(cardData, false);
      });
    });

    // Attach rail horizontal scroll buttons
    elements.railsContainer.querySelectorAll('.rail-scroll-arrow').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetId = btn.getAttribute('data-target');
        const rail = document.getElementById(targetId);
        if (!rail) return;
        const isLeft = btn.classList.contains('rail-arrow-left');
        const scrollAmount = Math.max(260, rail.clientWidth * 0.75);
        rail.scrollBy({ left: isLeft ? -scrollAmount : scrollAmount, behavior: 'smooth' });
      });
    });

    // Attach See All button handlers
    elements.railsContainer.querySelectorAll('.section-see-all').forEach((btn) => {
      btn.addEventListener('click', () => {
        showToast('Viewing full collection section');
      });
    });
  }

  function renderCardHtml(card, contextKey) {
    const posterUrl = card.assets['2_3'];
    const safeData = JSON.stringify(card).replace(/"/g, '&quot;');
    const fallbackSvg = createFallbackPosterSvg(card.title);

    return `
      <div class="content-card-wrap" data-content="${safeData}">
        <div class="content-card">
          <div class="card-poster-box">
            <img 
              src="${posterUrl}" 
              alt="${card.title}" 
              data-title="${card.title}"
              class="card-poster-img"
              loading="lazy"
              onerror="window.onPosterImgError(this)"
            />
            <div class="card-poster-gradient"></div>
            <div class="card-age-rating">${card.ageRating || 'U/A 13+'}</div>

            <!-- Centered Dappu / Play Sonic Ripple Hover Overlay -->
            <div class="card-hover-overlay">
              <div class="card-dappu-play-wrapper">
                <div class="dappu-ripple dappu-ripple-1"></div>
                <div class="dappu-ripple dappu-ripple-2"></div>
                <div class="card-dappu-btn">
                  <svg viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div class="card-info">
            <div class="card-title" title="${card.title}">${card.title}</div>
            <p class="card-description" title="${card.description}">${card.description}</p>
          </div>
        </div>
      </div>
    `;
  }

  // ── 10. Search Functionality ──────────────────────────────────────────
  function handleSearch(query) {
    state.searchQuery = query.trim();
    if (!state.searchQuery) {
      if (elements.searchResultsSection) elements.searchResultsSection.style.display = 'none';
      if (elements.heroSection) elements.heroSection.style.display = 'block';
      if (elements.railsContainer) elements.railsContainer.style.display = 'block';
      return;
    }

    // Hide normal hero & rails
    if (elements.heroSection) elements.heroSection.style.display = 'none';
    if (elements.railsContainer) elements.railsContainer.style.display = 'none';
    if (elements.searchResultsSection) elements.searchResultsSection.style.display = 'block';

    // Gather all content items across all sections
    const allItems = [];
    (state.data?.content_section || []).forEach((sec) => {
      (sec.content || []).forEach((item) => {
        allItems.push(getLocalizedContent(item, state.currentLanguage));
      });
    });

    const q = state.searchQuery.toLowerCase();
    const matched = allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );

    elements.searchResultsCount.textContent = `${matched.length} ${
      matched.length === 1 ? 'title found' : 'titles found'
    } for "${state.searchQuery}"`;

    if (matched.length === 0) {
      elements.searchResultsGrid.innerHTML = `
        <div class="search-empty-state" style="grid-column: 1 / -1;">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--tenant-primary)" stroke-width="1.5" style="margin-bottom: 12px;">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <h3 style="color:var(--text-primary);margin-bottom:6px;">No titles found matching "${state.searchQuery}"</h3>
          <p style="color:var(--text-secondary);font-size:13px;">Try checking for spelling errors or searching for different keywords.</p>
        </div>
      `;
    } else {
      elements.searchResultsGrid.innerHTML = matched
        .map((card) => renderCardHtml(card, 'search'))
        .join('');

      elements.searchResultsGrid.querySelectorAll('.content-card-wrap').forEach((cardEl) => {
        cardEl.addEventListener('click', () => {
          const cardData = JSON.parse(cardEl.getAttribute('data-content') || '{}');
          openDetailsModal(cardData, false);
        });
      });
    }
  }

  // ── 11. Details Modal & Video Preview Simulation ──────────────────────
  function openDetailsModal(item, autoPlayVideo = false) {
    if (!item) return;
    state.activeModalItem = item;
    state.isPlayingSimulatedVideo = autoPlayVideo;

    const backdropUrl = item.assets['16_9'] || item.assets['2_3'];
    const titleLogoUrl = item.assets['3_1'];
    const fallbackBanner = createFallbackBannerSvg(item.title);

    // Cover image
    elements.modalHeroCover.style.backgroundImage = `url("${backdropUrl}")`;
    const testImg = new Image();
    testImg.src = backdropUrl;
    testImg.onerror = () => {
      elements.modalHeroCover.style.backgroundImage = `url("${fallbackBanner}")`;
    };

    // Title logo or title text
    if (titleLogoUrl) {
      elements.modalTitleLogo.src = titleLogoUrl;
      elements.modalTitleLogo.style.display = 'block';
      elements.modalTitleLogo.onerror = () => {
        elements.modalTitleLogo.style.display = 'none';
        elements.modalTitle.style.display = 'block';
      };
      elements.modalTitle.textContent = item.title;
      elements.modalTitle.style.display = 'none';
    } else {
      elements.modalTitleLogo.style.display = 'none';
      elements.modalTitle.style.display = 'block';
      elements.modalTitle.textContent = item.title;
    }

    // Meta Row
    elements.modalMetaRow.innerHTML = `
      <span class="hero-badge hero-badge-age">${item.ageRating || 'U/A 13+'}</span>
      <span class="hero-badge hero-badge-primary">Ultra HD 4K</span>
      <span class="hero-badge">${item.duration || '2h 15m'}</span>
      <span class="hero-badge hero-badge-primary">${state.availableLanguages.length} Languages</span>
      <span class="hero-badge">${item.year || '2025'}</span>
      <span class="hero-badge" style="background:rgba(var(--tenant-primary-rgb),0.15);color:var(--tenant-primary);border-color:var(--tenant-primary);">Community Exclusive</span>
    `;

    // Description
    elements.modalDescription.textContent = item.description;

    // Watchlist state
    updateWatchlistButtonState(item.id);

    // Player screen backdrop
    elements.modalPlayerScreen.style.backgroundImage = `url("${backdropUrl}")`;
    if (autoPlayVideo) {
      elements.modalPlayerBox.style.display = 'block';
      elements.modalPlayBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        Pause
      `;
    } else {
      elements.modalPlayerBox.style.display = 'none';
      elements.modalPlayBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        Play Movie
      `;
    }

    elements.detailsModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDetailsModal() {
    elements.detailsModal.classList.remove('open');
    document.body.style.overflow = '';
    state.activeModalItem = null;
    state.isPlayingSimulatedVideo = false;
  }

  function updateWatchlistButtonState(id) {
    const isAdded = state.watchlist.has(id);
    if (!elements.modalWatchlistBtn) return;
    if (isAdded) {
      elements.modalWatchlistBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--tenant-primary)"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        Added to List
      `;
      elements.modalWatchlistBtn.style.borderColor = 'var(--tenant-primary)';
      elements.modalWatchlistBtn.style.color = 'var(--tenant-primary)';
    } else {
      elements.modalWatchlistBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        Add to Watchlist
      `;
      elements.modalWatchlistBtn.style.borderColor = '';
      elements.modalWatchlistBtn.style.color = '';
    }
  }

  function toggleWatchlist() {
    if (!state.activeModalItem) return;
    const id = state.activeModalItem.id;
    if (state.watchlist.has(id)) {
      state.watchlist.delete(id);
      showToast('Removed from Watchlist');
    } else {
      state.watchlist.add(id);
      showToast('Added to your Watchlist');
    }
    localStorage.setItem('ott_demo_watchlist', JSON.stringify([...state.watchlist]));
    updateWatchlistButtonState(id);
  }

  // ── 12. Main Initialization ───────────────────────────────────────────
  async function init() {
    try {
      const response = await fetch('./sample.json');
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      state.data = await response.json();
    } catch (err) {
      console.warn('Could not load ./sample.json, using fallback schema', err);
      state.data = getFallbackSampleData();
    }

    // Detect all languages present in sample.json
    const detectedLangs = new Set(['en']);
    (state.data?.hero_section || []).forEach((item) => {
      (item.language_specific_values || []).forEach((v) => {
        if (v.language) detectedLangs.add(v.language);
      });
    });
    (state.data?.content_section || []).forEach((sec) => {
      (sec.language_specific_values || []).forEach((v) => {
        if (v.language) detectedLangs.add(v.language);
      });
    });
    state.availableLanguages = Array.from(detectedLangs);

    // If active language is not among detected, fallback to first available
    if (!state.availableLanguages.includes(state.currentLanguage)) {
      state.currentLanguage = state.availableLanguages[0] || 'en';
    }

    // Render Initial UI
    renderLanguageDropdown();
    renderHeroCarousel();
    renderContentRails();
    startHeroTimer();

    // Event Listeners
    setupEventListeners();
  }

  function setupEventListeners() {
    elements.headerNav?.addEventListener('click', (event) => {
      const link = event.target.closest('.nav-link');
      if (!link) return;
      if (link.hasAttribute('data-home-link')) updateActiveSectionLink('');
      else if (link.dataset.navSection) updateActiveSectionLink(link.dataset.navSection);
    });
    // Header scroll background effect
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        elements.appHeader?.classList.add('scrolled');
      } else {
        elements.appHeader?.classList.remove('scrolled');
      }
    });

    // Language dropdown toggling
    elements.langSelectorBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleLanguageDropdown();
    });

    document.addEventListener('click', (e) => {
      if (!elements.langDropdownMenu?.contains(e.target) && !elements.langSelectorBtn?.contains(e.target)) {
        closeLanguageDropdown();
      }
    });

    // Search Toggle & Input
    elements.searchToggleBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      elements.searchToggleBtn.style.display = 'none';
      elements.searchBox.classList.remove('hidden');
      elements.searchInput.focus();
    });

    elements.searchInput?.addEventListener('input', (e) => {
      handleSearch(e.target.value);
    });

    elements.searchClearBtn?.addEventListener('click', () => {
      elements.searchInput.value = '';
      handleSearch('');
      elements.searchBox.classList.add('hidden');
      elements.searchToggleBtn.style.display = 'flex';
    });

    elements.clearSearchFilterBtn?.addEventListener('click', () => {
      elements.searchInput.value = '';
      handleSearch('');
      elements.searchBox.classList.add('hidden');
      elements.searchToggleBtn.style.display = 'flex';
    });

    // Hero Carousel Arrows
    elements.heroArrowLeft?.addEventListener('click', (e) => {
      e.stopPropagation();
      prevHero();
    });

    elements.heroArrowRight?.addEventListener('click', (e) => {
      e.stopPropagation();
      nextHero();
    });

    // Pause hero timer on mouse hover
    elements.heroSection?.addEventListener('mouseenter', stopHeroTimer);
    elements.heroSection?.addEventListener('mouseleave', startHeroTimer);

    // Modal Events
    elements.modalCloseBtn?.addEventListener('click', closeDetailsModal);
    elements.detailsModal?.addEventListener('click', (e) => {
      if (e.target === elements.detailsModal) {
        closeDetailsModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeDetailsModal();
        closeLanguageDropdown();
      }
    });

    elements.modalWatchlistBtn?.addEventListener('click', toggleWatchlist);

    elements.modalPlayBtn?.addEventListener('click', () => {
      state.isPlayingSimulatedVideo = !state.isPlayingSimulatedVideo;
      if (state.isPlayingSimulatedVideo) {
        elements.modalPlayerBox.style.display = 'block';
        elements.modalPlayBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          Pause
        `;
        showToast('Now playing in 1080p Ultra HD with Adaptive HLS');
      } else {
        elements.modalPlayBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          Resume Movie
        `;
      }
    });

    elements.modalShareBtn?.addEventListener('click', () => {
      navigator.clipboard?.writeText(window.location.href);
      showToast('Link copied to clipboard!');
    });
  }

  // ── 13. Fallback Schema (Guarantees zero-blank rendering) ─────────────
  function getFallbackSampleData() {
    return {
      hero_section: [
        {
          id: 'hero_1',
          language_specific_values: [
            {
              language: 'en',
              title: 'Suddala: The Revolutionary Song',
              description:
                'An epic biographical drama capturing the indomitable soul and poetic legacy of Suddala, echoing the beats of resistance and folk heritage.',
              assets: {
                '16_9': './assets/brand/community-ott-logo-fallback.jpg',
                '3_1': '',
                '2_3': './assets/placeholders/default-poster.svg',
              },
            },
            {
              language: 'ta',
              title: 'சுத்தால: புரட்சியின் பாடல்',
              description:
                'சுத்தால அவர்களின் புரட்சிகர வாழ்க்கை, நாட்டுப்புறக் கலை மற்றும் கவித்துவ பெருமையை விவரிக்கும் பிரம்மாண்ட வரலாற்றுத் திரைப்படம்.',
              assets: {
                '16_9': './assets/brand/community-ott-logo-fallback.jpg',
                '3_1': '',
                '2_3': './assets/placeholders/default-poster.svg',
              },
            },
          ],
        },
      ],
      content_section: [
        {
          id: 'sec_trending',
          language_specific_values: [
            {
              language: 'en',
              title: 'Trending Blockbusters',
              description: 'Top trending community movies and series this week',
            },
            {
              language: 'ta',
              title: 'இப்போது டிரெண்டிங்',
              description: 'இந்த வாரத்தின் அதிகம் பார்க்கப்பட்ட திரைப்படங்கள்',
            },
          ],
          description: 'Trending Blockbusters',
          content: [
            {
              random_value: 'val_1',
              languages_content: [
                {
                  language: 'en',
                  title: 'Echoes of the Soil',
                  description: 'A poignant tale of rural folklore and timeless rhythm.',
                  assets: { '2_3': './assets/placeholders/default-poster.svg' },
                },
                {
                  language: 'ta',
                  title: 'மண்ணின் குரல்',
                  description: 'கிராமியக் கலாச்சாரம் மற்றும் பாரம்பரிய இசையின் கதை.',
                  assets: { '2_3': './assets/placeholders/default-poster.svg' },
                },
              ],
            },
          ],
        },
      ],
    };
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
