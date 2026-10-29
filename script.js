(() => {
  'use strict';

  const readPreference = (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const writePreference = (key, value) => {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch {
      // The page remains usable when browser storage is unavailable.
    }
  };

  const translations = window.VIOLET_TRANSLATIONS;
  const supportedLanguages = new Set(['es', 'en']);
  const requestedLanguage = new URLSearchParams(window.location.search).get('lang');
  const savedLanguage = readPreference('violet-language');
  let currentLanguage = supportedLanguages.has(requestedLanguage) ? requestedLanguage :
    supportedLanguages.has(savedLanguage) ? savedLanguage : 'es';
  const ui = () => translations.ui[currentLanguage];
  const message = (key, values = {}) => ui()[key].replace(/\{(\w+)\}/g,
    (match, name) => values[name] ?? match);

  // The CSS controls the breakpoint; its menu button is our source of truth.
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.getElementById('main-nav');
  let menuOpen = false;

  const isMobileNavigation = () => getComputedStyle(menuToggle).display !== 'none';

  const setMenuOpen = (open, restoreFocus = false) => {
    const mobile = isMobileNavigation();
    menuOpen = mobile && open;
    document.body.classList.toggle('menu-open', menuOpen);
    menuToggle.setAttribute('aria-expanded', String(menuOpen));
    menuToggle.setAttribute('aria-label', menuOpen ? ui().menuClose : ui().menuOpen);
    mainNav.inert = mobile && !menuOpen;
    if (mobile && !menuOpen) mainNav.setAttribute('aria-hidden', 'true');
    else mainNav.removeAttribute('aria-hidden');
    if (restoreFocus && mobile) menuToggle.focus({ preventScroll: true });
  };

  menuToggle.addEventListener('click', () => setMenuOpen(!menuOpen));
  mainNav.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || !menuOpen) return;
    setMenuOpen(false);
    const destination = document.getElementById(link.hash.slice(1));
    if (destination) {
      destination.setAttribute('tabindex', '-1');
      destination.focus({ preventScroll: true });
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuOpen && !document.querySelector('dialog[open]')) {
      event.preventDefault();
      setMenuOpen(false, true);
    }
  });
  document.addEventListener('click', (event) => {
    if (menuOpen && !event.target.closest('.navigation')) setMenuOpen(false);
  });
  let resizeFrame = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => setMenuOpen(menuOpen));
  }, { passive: true });
  setMenuOpen(false);

  const worldImages = ['./assets/paldea.jpg', './assets/exploration.jpg', './assets/terastal.jpg'];
  let currentWorld = 0;
  const worldTabs = [...document.querySelectorAll('[data-world]')];
  const worldImage = document.getElementById('world-image');
  const worldPanel = document.getElementById('world-panel');
  const worldTitle = document.getElementById('world-title');

  const selectWorld = (index, moveFocus = false) => {
    const scene = ui().worlds[index];
    if (!scene) return;
    currentWorld = index;
    worldTabs.forEach((tab, tabIndex) => {
      const selected = index === tabIndex;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    worldImage.src = worldImages[index];
    worldImage.alt = scene.alt;
    document.getElementById('world-kicker').textContent = scene.kicker;
    worldTitle.replaceChildren(
      document.createTextNode(scene.title[0]),
      document.createElement('br'),
      document.createTextNode(scene.title[1])
    );
    document.getElementById('world-description').textContent = scene.description;
    document.getElementById('world-count').textContent = String(index + 1).padStart(2, '0');
    worldPanel.setAttribute('aria-labelledby', worldTabs[index].id);
    if (moveFocus) worldTabs[index].focus();
  };

  worldTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectWorld(index));
    tab.addEventListener('keydown', (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      let nextIndex;
      switch (event.key) {
        case 'ArrowRight': nextIndex = (index + 1) % worldTabs.length; break;
        case 'ArrowLeft': nextIndex = (index - 1 + worldTabs.length) % worldTabs.length; break;
        case 'Home': nextIndex = 0; break;
        case 'End': nextIndex = worldTabs.length - 1; break;
        default: return;
      }
      event.preventDefault();
      selectWorld(nextIndex, true);
    });
  });

  const partners = {
    sprigatito: { name: 'Sprigatito' },
    fuecoco: { name: 'Fuecoco' },
    quaxly: { name: 'Quaxly' }
  };
  const partnerButtons = [...document.querySelectorAll('[data-partner]')];
  const partnerStatus = document.getElementById('partner-status-text');
  const resetPartner = document.getElementById('reset-partner');
  let currentPartner = null;

  const selectPartner = (key, persist = true) => {
    const validKey = Object.hasOwn(partners, key) ? key : null;
    currentPartner = validKey;
    partnerButtons.forEach((button) => {
      const buttonKey = button.dataset.partner;
      const partner = partners[buttonKey];
      const selected = buttonKey === validKey;
      button.closest('[data-partner-card]').classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
      button.setAttribute('aria-label', message(selected ? 'partnerSelectedLabel' : 'partnerChoose', { name: partner.name }));
      button.querySelector('span').textContent = selected ? ui().partnerSelected : message('partnerChoose', { name: partner.name });
      button.querySelector('use').setAttribute('href', selected ? '#i-check' : '#i-arrow');
    });
    partnerStatus.textContent = validKey ? ui().partnerMessages[validKey] : ui().partnerDefault;
    resetPartner.hidden = !validKey;
    if (persist) writePreference('violet-partner', validKey);
  };

  partnerButtons.forEach((button) => {
    button.addEventListener('click', () => selectPartner(button.dataset.partner));
  });
  resetPartner.addEventListener('click', () => {
    const previouslySelected = partnerButtons.find((button) => button.getAttribute('aria-pressed') === 'true');
    selectPartner(null);
    (previouslySelected || partnerButtons[0]).focus({ preventScroll: true });
  });
  selectPartner(readPreference('violet-partner'), false);

  const gallerySlides = ['./assets/paldea.jpg', './assets/miraidon-screenshot.jpg', './assets/terastal-art.jpg'];
  const galleryDialog = document.getElementById('gallery-dialog');
  const creditsDialog = document.getElementById('credits-dialog');
  let currentSlide = 0;

  const renderGallerySlide = (index) => {
    currentSlide = (index + gallerySlides.length) % gallerySlides.length;
    const slide = ui().gallery[currentSlide];
    const image = document.getElementById('lightbox-image');
    image.src = gallerySlides[currentSlide];
    image.alt = slide.alt;
    document.getElementById('lightbox-category').textContent = slide.category;
    document.getElementById('lightbox-title').textContent = slide.title;
    document.getElementById('lightbox-counter').textContent = `${currentSlide + 1} / ${gallerySlides.length}`;
  };

  const syncModalScroll = () => {
    document.body.classList.toggle('modal-open', Boolean(document.querySelector('dialog[open]')));
  };

  // Native dialogs provide focus containment, inert background content and Escape.
  const prepareDialog = (dialog) => {
    let opener = null;
    let pointerStartedOnBackdrop = false;
    const outsideDialog = (event) => {
      const rect = dialog.getBoundingClientRect();
      return event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom;
    };
    dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('pointerdown', (event) => {
      pointerStartedOnBackdrop = event.target === dialog && outsideDialog(event);
    });
    dialog.addEventListener('click', (event) => {
      if (pointerStartedOnBackdrop && event.target === dialog && outsideDialog(event)) dialog.close();
      pointerStartedOnBackdrop = false;
    });
    dialog.addEventListener('close', () => {
      syncModalScroll();
      if (opener?.isConnected && !document.querySelector('dialog[open]')) opener.focus({ preventScroll: true });
    });
    return (trigger) => {
      if (dialog.open) return;
      opener = trigger || document.activeElement;
      if (menuOpen) setMenuOpen(false);
      dialog.showModal();
      syncModalScroll();
      dialog.querySelector('.dialog-close').focus({ preventScroll: true });
    };
  };

  const openGallery = prepareDialog(galleryDialog);
  const openCredits = prepareDialog(creditsDialog);
  document.querySelectorAll('[data-gallery]').forEach((button) => {
    button.addEventListener('click', () => {
      renderGallerySlide(Number(button.dataset.gallery));
      openGallery(button);
    });
  });
  galleryDialog.querySelector('.gallery-prev').addEventListener('click', () => renderGallerySlide(currentSlide - 1));
  galleryDialog.querySelector('.gallery-next').addEventListener('click', () => renderGallerySlide(currentSlide + 1));
  galleryDialog.addEventListener('keydown', (event) => {
    if (!galleryDialog.open || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      renderGallerySlide(currentSlide + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  document.getElementById('credits-button').addEventListener('click', (event) => openCredits(event.currentTarget));

  const eventDialog = document.getElementById('event-dialog');
  const openEventDialog = prepareDialog(eventDialog);
  let selectedEventCard = null;

  // The translated card is the single source of the event's content.
  const renderEventDetails = (card) => {
    if (!card) return;
    ['status', 'category', 'period', 'title', 'description'].forEach((field) => {
      document.getElementById(`event-dialog-${field}`).textContent =
        card.querySelector(`[data-event-${field}]`).textContent;
    });
    const sourceImage = card.querySelector('[data-event-image]');
    const dialogImage = document.getElementById('event-dialog-image');
    dialogImage.src = sourceImage.src;
    dialogImage.alt = sourceImage.alt;
  };

  const showEvent = (card, trigger) => {
    if (!card || typeof eventDialog.showModal !== 'function') return;
    selectedEventCard = card;
    renderEventDetails(card);
    openEventDialog(trigger);
  };

  document.querySelectorAll('[data-event-details]').forEach((button) => {
    button.addEventListener('click', () => showEvent(button.closest('[data-event-card]'), button));
  });
  document.getElementById('event-dialog-dismiss').addEventListener('click', () => eventDialog.close());

  const motionToggle = document.querySelector('.motion-toggle');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const savedMotionPreference = readPreference('violet-reduce-motion');
  let motionPreference = savedMotionPreference === 'true' ? true : savedMotionPreference === 'false' ? false : null;

  const applyMotionPreference = () => {
    const reduced = motionPreference ?? reducedMotionQuery.matches;
    document.body.classList.toggle('reduce-motion', reduced);
    document.body.classList.toggle('motion-enabled', !reduced);
    motionToggle.setAttribute('aria-pressed', String(reduced));
    motionToggle.textContent = ui().motionReduce;
    motionToggle.title = reduced ? ui().motionEnable : ui().motionReduce;
    motionToggle.setAttribute('aria-label', ui().motionReduceLabel);
  };
  motionToggle.addEventListener('click', () => {
    motionPreference = !document.body.classList.contains('reduce-motion');
    writePreference('violet-reduce-motion', String(motionPreference));
    applyMotionPreference();
  });
  reducedMotionQuery.addEventListener('change', applyMotionPreference);
  applyMotionPreference();

  const languageButtons = [...document.querySelectorAll('[data-language]')];
  const officialLinks = [...document.querySelectorAll('a[href^="https://scarletviolet.pokemon.com/es-mx/"]')]
    .map(link => ({ link, spanishHref: link.href }));

  const applyLanguage = (language, { persist = false, announce = false } = {}) => {
    if (!supportedLanguages.has(language)) return;
    currentLanguage = language;
    document.documentElement.lang = language === 'es' ? 'es-MX' : 'en';
    document.documentElement.dataset.locale = language;

    // These translations are local, authored strings; no remote or user HTML is inserted.
    translations.static.forEach(entry => {
      const value = entry[language];
      document.querySelectorAll(entry.selector).forEach(element => {
        if (entry.mode === 'attr') element.setAttribute(entry.attribute, value);
        else if (entry.mode === 'html') element.innerHTML = value;
        else if (entry.mode === 'direct') {
          const textNode = [...element.childNodes].find(node =>
            node.nodeType === Node.TEXT_NODE && node.textContent.trim());
          if (textNode) textNode.textContent = value;
        } else element.textContent = value;
      });
    });
    languageButtons.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.language === language));
    });
    officialLinks.forEach(({ link, spanishHref }) => {
      link.href = language === 'en' ? spanishHref.replace('/es-mx/', '/en-us/') : spanishHref;
    });

    // Re-render the existing interaction state instead of resetting the visitor's choices.
    selectWorld(currentWorld);
    selectPartner(currentPartner, false);
    renderGallerySlide(currentSlide);
    renderEventDetails(selectedEventCard);
    setMenuOpen(menuOpen);
    applyMotionPreference();

    if (persist) {
      writePreference('violet-language', language);
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('lang', language);
        window.history.replaceState(null, '', url);
      } catch {
        // Local file previews still work when history changes are restricted.
      }
    }
    if (announce) document.getElementById('language-status').textContent = ui().languageStatus;
  };

  languageButtons.forEach(button => button.addEventListener('click', () => {
    applyLanguage(button.dataset.language, { persist: true, announce: true });
  }));
  applyLanguage(currentLanguage);

  // Show the first listed event once per page load, after applying the chosen language.
  // Closing it does not suppress future visits; changing languages does not reopen it.
  const firstEventCard = document.querySelector('#eventos [data-event-card]');
  if (firstEventCard && !document.querySelector('dialog[open]')) {
    showEvent(firstEventCard, document.querySelector('.navigation .brand'));
  }

  // A narrow viewport band tracks the current chapter without scroll handlers.
  if ('IntersectionObserver' in window) {
    const navigationLinks = [...mainNav.querySelectorAll('a[href^="#"]')];
    const visibleSections = new Set();
    const chapterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visibleSections.add(entry.target);
        else visibleSections.delete(entry.target);
      });
      const sections = [...visibleSections].sort((a, b) =>
        Math.abs(a.getBoundingClientRect().top - window.innerHeight * 0.2) -
        Math.abs(b.getBoundingClientRect().top - window.innerHeight * 0.2)
      );
      if (!sections.length) return;
      const currentHash = `#${sections[0].id}`;
      navigationLinks.forEach((link) => {
        if (link.hash === currentHash) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-18% 0px -55% 0px', threshold: 0 });
    document.querySelectorAll('main section[id]').forEach((section) => chapterObserver.observe(section));
  }
})();
