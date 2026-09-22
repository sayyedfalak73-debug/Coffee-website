/**
 * Brew Haven — Interactive Application Engine
 * 1. 300-Frame Canvas Scroll Animation Engine
 * 2. Smooth Navigation & Anchor Engine
 * 3. Mobile Navigation Drawer Controller
 * 4. Menu Category Filter & Product Cards
 * 5. Shopping Bag / Cart State Management
 * 6. Live Search Modal
 * 7. Reservation & Cupping Modals
 * 8. Subscription & Newsletter Handlers
 * 9. Policy & Information Modals
 * 10. Toast Notification System
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. 300-FRAME CANVAS SCROLL ANIMATION ENGINE
     ========================================================================== */
  const TOTAL_FRAMES = 300;
  const FRAME_DIR = 'frames/';
  const FRAME_PREFIX = 'ezgif-frame-';
  const FRAME_EXT = '.webp';
  const LERP_FACTOR = 0.085;

  const canvas = document.getElementById('scroll-canvas');
  const ctx = canvas ? canvas.getContext('2d', { alpha: false }) : null;
  const pinSection = document.getElementById('animation-pin-section');
  const loaderOverlay = document.getElementById('loader-overlay');
  const loaderBar = document.getElementById('loader-bar');
  const loaderText = document.getElementById('loader-text');
  const scrollPrompt = document.getElementById('scroll-prompt');

  let targetProgress = 0;
  let currentProgress = 0;
  let lastRenderedIndex = -1;
  let isAnimationRunning = false;

  const frameCache = new Array(TOTAL_FRAMES + 1).fill(null);
  let loadedCount = 0;
  let initialRenderDone = false;

  function getFrameUrl(index) {
    const padded = String(index).padStart(3, '0');
    return `${FRAME_DIR}${FRAME_PREFIX}${padded}${FRAME_EXT}`;
  }

  function loadFrame(index) {
    return new Promise((resolve) => {
      if (frameCache[index]) {
        resolve(frameCache[index]);
        return;
      }
      const img = new Image();
      img.src = getFrameUrl(index);

      const onReady = () => {
        frameCache[index] = img;
        loadedCount++;
        updateLoaderProgress();
        if (!initialRenderDone && index === 1) {
          initialRenderDone = true;
          renderFrame(1);
        }
        resolve(img);
      };

      if (img.decode) {
        img.decode().then(onReady).catch(() => {
          img.onload = onReady;
          img.onerror = () => resolve(null);
        });
      } else {
        img.onload = onReady;
        img.onerror = () => resolve(null);
      }
    });
  }

  function updateLoaderProgress() {
    const percent = Math.round((loadedCount / TOTAL_FRAMES) * 100);
    if (loaderBar) loaderBar.style.width = `${percent}%`;
    if (loaderText) loaderText.textContent = `Loading experience ${percent}%`;

    if (loadedCount >= 25 || percent >= 100) {
      if (loaderOverlay && !loaderOverlay.classList.contains('hidden')) {
        setTimeout(() => {
          loaderOverlay.classList.add('hidden');
        }, 300);
      }
    }
  }

  function getNearestLoadedFrame(targetIndex) {
    if (frameCache[targetIndex]) return frameCache[targetIndex];

    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      const prev = targetIndex - offset;
      if (prev >= 1 && frameCache[prev]) return frameCache[prev];
      const next = targetIndex + offset;
      if (next <= TOTAL_FRAMES && frameCache[next]) return frameCache[next];
    }
    return null;
  }

  async function preloadFrames() {
    await loadFrame(1);

    const keyframeIndices = [];
    for (let i = 1; i <= TOTAL_FRAMES; i += 5) {
      if (i !== 1) keyframeIndices.push(i);
    }
    await Promise.all(keyframeIndices.map(loadFrame));

    const remainingIndices = [];
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      if (!frameCache[i]) remainingIndices.push(i);
    }

    const BATCH_SIZE = 8;
    for (let i = 0; i < remainingIndices.length; i += BATCH_SIZE) {
      const batch = remainingIndices.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(loadFrame));
    }
  }

  function renderFrame(index) {
    if (!ctx || !canvas) return;
    const img = getNearestLoadedFrame(index);
    if (!img) return;

    lastRenderedIndex = index;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const canvasW = canvas.width;
    const canvasH = canvas.height;
    const imgW = img.naturalWidth || img.width;
    const imgH = img.naturalHeight || img.height;

    const hRatio = canvasW / imgW;
    const vRatio = canvasH / imgH;
    const ratio = Math.max(hRatio, vRatio);

    const renderW = imgW * ratio;
    const renderH = imgH * ratio;
    const offsetX = (canvasW - renderW) / 2;
    const offsetY = (canvasH - renderH) / 2;

    ctx.drawImage(img, 0, 0, imgW, imgH, offsetX, offsetY, renderW, renderH);
  }

  function updateScrollTarget() {
    if (!pinSection) return;
    const maxScroll = pinSection.offsetHeight - window.innerHeight;
    if (maxScroll <= 0) {
      targetProgress = 0;
      return;
    }
    const currentY = window.pageYOffset || document.documentElement.scrollTop || 0;
    targetProgress = Math.max(0, Math.min(1, currentY / maxScroll));

    if (scrollPrompt) {
      if (currentY > 40) {
        scrollPrompt.style.opacity = '0';
        scrollPrompt.style.pointerEvents = 'none';
      } else {
        scrollPrompt.style.opacity = '1';
        scrollPrompt.style.pointerEvents = 'auto';
      }
    }
  }

  function animationLoop() {
    const delta = targetProgress - currentProgress;

    if (Math.abs(delta) > 0.00005) {
      currentProgress += delta * LERP_FACTOR;
    } else {
      currentProgress = targetProgress;
    }

    const targetIndex = Math.min(
      TOTAL_FRAMES,
      Math.max(1, Math.round(currentProgress * (TOTAL_FRAMES - 1)) + 1)
    );

    if (targetIndex !== lastRenderedIndex || !initialRenderDone) {
      renderFrame(targetIndex);
    }

    requestAnimationFrame(animationLoop);
  }

  function handleResize() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayW = window.innerWidth;
    const displayH = window.innerHeight;

    canvas.width = Math.round(displayW * dpr);
    canvas.height = Math.round(displayH * dpr);
    canvas.style.width = `${displayW}px`;
    canvas.style.height = `${displayH}px`;

    const currentFrameIndex = Math.min(
      TOTAL_FRAMES,
      Math.max(1, Math.round(currentProgress * (TOTAL_FRAMES - 1)) + 1)
    );
    renderFrame(currentFrameIndex);
  }

  /* ==========================================================================
     2. TOAST NOTIFICATION SYSTEM
     ========================================================================== */
  const toastContainer = document.getElementById('toast-container');

  function showToast(message, icon = 'check_circle') {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast-msg pointer-events-auto flex items-center gap-2.5 px-5 py-3 rounded-full bg-[#200e06] text-[#fcf9f3] text-sm font-medium shadow-2xl border border-[#dfd2c0]/30 transition-all';
    toast.innerHTML = `
      <span class="material-symbols-outlined text-[20px] text-[#cca830]">${icon}</span>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('dismissing');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 350);
    }, 3200);
  }

  /* ==========================================================================
     3. SMOOTH NAVIGATION & ANCHOR ENGINE
     ========================================================================== */
  function scrollToTarget(targetId) {
    if (!targetId || targetId === '#' || targetId === '#hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (history.pushState) history.pushState(null, '', '#hero');
      return;
    }

    const cleanId = targetId.startsWith('#') ? targetId.slice(1) : targetId;
    const el = document.getElementById(cleanId);
    if (!el) return;

    const targetTop = el.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });

    if (history.pushState) {
      history.pushState(null, '', `#${cleanId}`);
    }
  }

  function initSmoothNav() {
    // Intercept all internal anchor clicks
    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      // Let reservation/modal buttons with href handle their own action
      if (anchor.hasAttribute('data-action') || anchor.hasAttribute('data-modal')) {
        return;
      }

      e.preventDefault();

      // If mobile menu is open, close it
      closeMobileMenu();

      scrollToTarget(href);
    });

    // Handle deep-link or page refresh with hash
    if (window.location.hash && window.location.hash !== '#') {
      setTimeout(() => {
        scrollToTarget(window.location.hash);
      }, 250);
    }
  }

  /* ==========================================================================
     4. MOBILE NAVIGATION DRAWER CONTROLLER
     ========================================================================== */
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  const mobileMenuDrawer = document.getElementById('mobile-menu-drawer');
  const mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop');

  function openMobileMenu() {
    if (!mobileMenuDrawer || !mobileMenuBackdrop) return;
    mobileMenuBackdrop.classList.remove('hidden');
    void mobileMenuBackdrop.offsetWidth;
    mobileMenuBackdrop.classList.add('opacity-100');
    mobileMenuDrawer.classList.remove('translate-x-full');
    mobileMenuDrawer.classList.add('translate-x-0');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (!mobileMenuDrawer || !mobileMenuBackdrop) return;
    mobileMenuBackdrop.classList.remove('opacity-100');
    mobileMenuDrawer.classList.remove('translate-x-0');
    mobileMenuDrawer.classList.add('translate-x-full');
    document.body.style.overflow = '';
    setTimeout(() => {
      mobileMenuBackdrop.classList.add('hidden');
    }, 300);
  }

  function initMobileMenu() {
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', openMobileMenu);
    }
    if (mobileMenuClose) {
      mobileMenuClose.addEventListener('click', closeMobileMenu);
    }
    if (mobileMenuBackdrop) {
      mobileMenuBackdrop.addEventListener('click', closeMobileMenu);
    }

    // Close when clicking any mobile link
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });
  }

  /* ==========================================================================
     5. MENU CATEGORY FILTER & PRODUCT CARDS
     ========================================================================== */
  function initMenuFilters() {
    const tabBtns = document.querySelectorAll('#menu-tabs .menu-tab-btn');
    const menuItems = document.querySelectorAll('#menu-grid .menu-item');

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const category = btn.getAttribute('data-category');

        // Update active tab styles
        tabBtns.forEach((b) => {
          b.classList.remove('active', 'bg-primary', 'text-on-primary', 'shadow-sm');
          b.classList.add('bg-surface-container', 'text-on-surface');
        });

        btn.classList.remove('bg-surface-container', 'text-on-surface');
        btn.classList.add('active', 'bg-primary', 'text-on-primary', 'shadow-sm');

        // Filter items
        menuItems.forEach((item) => {
          const itemCat = item.getAttribute('data-category');
          if (category === 'all' || itemCat === category) {
            item.style.display = 'flex';
            item.style.opacity = '1';
          } else {
            item.style.display = 'none';
            item.style.opacity = '0';
          }
        });
      });
    });

    // Clicking a product card itself adds to bag if user didn't click the inner add button directly
    menuItems.forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.add-to-bag-btn')) return;
        const id = card.getAttribute('data-id');
        const name = card.getAttribute('data-name');
        const price = parseFloat(card.getAttribute('data-price') || '0');
        if (id && name) {
          cart.addItem({ id, name, price });
          showToast(`Added ${name} to your bag`, 'shopping_bag');
        }
      });
    });
  }

  /* ==========================================================================
     6. SHOPPING BAG / CART STATE MANAGEMENT
     ========================================================================== */
  const cartBtn = document.getElementById('cart-btn');
  const cartBadge = document.getElementById('cart-badge');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartBackdrop = document.getElementById('cart-drawer-backdrop');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const cartItemsList = document.getElementById('cart-items-list');
  const cartEmptyState = document.getElementById('cart-empty-state');
  const cartSubtotal = document.getElementById('cart-subtotal');
  const checkoutBtn = document.getElementById('checkout-btn');
  const cartBrowseBtn = document.getElementById('cart-browse-btn');

  const cart = {
    items: [],

    addItem(product) {
      const existing = this.items.find((item) => item.id === product.id);
      if (existing) {
        existing.qty += 1;
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          qty: 1
        });
      }
      this.render();
    },

    changeQty(id, delta) {
      const item = this.items.find((i) => i.id === id);
      if (!item) return;
      item.qty += delta;
      if (item.qty <= 0) {
        this.removeItem(id);
      } else {
        this.render();
      }
    },

    removeItem(id) {
      this.items = this.items.filter((i) => i.id !== id);
      this.render();
    },

    clear() {
      this.items = [];
      this.render();
    },

    getTotalCount() {
      return this.items.reduce((sum, i) => sum + i.qty, 0);
    },

    getSubtotal() {
      return this.items.reduce((sum, i) => sum + (i.price * i.qty), 0);
    },

    render() {
      const totalCount = this.getTotalCount();
      const subtotal = this.getSubtotal();

      // Update badge
      if (cartBadge) {
        if (totalCount > 0) {
          cartBadge.textContent = totalCount;
          cartBadge.classList.remove('hidden');
          cartBadge.classList.add('flex');
        } else {
          cartBadge.classList.add('hidden');
          cartBadge.classList.remove('flex');
        }
      }

      // Update subtotal
      if (cartSubtotal) {
        cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
      }

      // Update cart drawer items list
      if (!cartItemsList) return;

      if (this.items.length === 0) {
        if (cartEmptyState) {
          cartEmptyState.style.display = 'block';
        }
        const cards = cartItemsList.querySelectorAll('.cart-item-row');
        cards.forEach((c) => c.remove());
      } else {
        if (cartEmptyState) {
          cartEmptyState.style.display = 'none';
        }

        const cards = cartItemsList.querySelectorAll('.cart-item-row');
        cards.forEach((c) => c.remove());

        this.items.forEach((item) => {
          const row = document.createElement('div');
          row.className = 'cart-item-row flex items-center justify-between p-3.5 bg-surface-container rounded-xl border border-[#dfd2c0]/40';
          row.innerHTML = `
            <div class="flex-1 pr-3">
              <h4 class="font-headline-sm text-sm font-semibold text-primary leading-tight">${item.name}</h4>
              <span class="text-xs text-secondary font-medium">$${item.price.toFixed(2)} each</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="flex items-center bg-surface-container-lowest rounded-full border border-[#dfd2c0] px-1.5 py-0.5">
                <button class="cart-qty-btn p-1 text-primary hover:text-secondary text-sm font-bold" data-action="dec" data-id="${item.id}" aria-label="Decrease quantity">−</button>
                <span class="text-xs font-semibold text-primary px-2">${item.qty}</span>
                <button class="cart-qty-btn p-1 text-primary hover:text-secondary text-sm font-bold" data-action="inc" data-id="${item.id}" aria-label="Increase quantity">+</button>
              </div>
              <span class="text-xs font-bold text-primary w-14 text-right">$${(item.price * item.qty).toFixed(2)}</span>
              <button class="cart-remove-btn p-1 text-outline hover:text-error transition-colors" data-id="${item.id}" aria-label="Remove item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          `;
          cartItemsList.appendChild(row);
        });
      }
    }
  };

  function openCartDrawer() {
    if (!cartDrawer || !cartBackdrop) return;
    cartBackdrop.classList.remove('hidden');
    void cartBackdrop.offsetWidth;
    cartBackdrop.classList.add('opacity-100');
    cartDrawer.classList.remove('translate-x-full');
    cartDrawer.classList.add('translate-x-0');
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    if (!cartDrawer || !cartBackdrop) return;
    cartBackdrop.classList.remove('opacity-100');
    cartDrawer.classList.remove('translate-x-0');
    cartDrawer.classList.add('translate-x-full');
    document.body.style.overflow = '';
    setTimeout(() => {
      cartBackdrop.classList.add('hidden');
    }, 300);
  }

  function initCart() {
    if (cartBtn) {
      cartBtn.addEventListener('click', openCartDrawer);
    }
    if (cartCloseBtn) {
      cartCloseBtn.addEventListener('click', closeCartDrawer);
    }
    if (cartBackdrop) {
      cartBackdrop.addEventListener('click', closeCartDrawer);
    }
    if (cartBrowseBtn) {
      cartBrowseBtn.addEventListener('click', () => {
        closeCartDrawer();
        scrollToTarget('#menu');
      });
    }

    document.addEventListener('click', (e) => {
      const addBtn = e.target.closest('.add-to-bag-btn');
      if (!addBtn) return;
      e.stopPropagation();

      const id = addBtn.getAttribute('data-id');
      const name = addBtn.getAttribute('data-name');
      const price = parseFloat(addBtn.getAttribute('data-price') || '0');

      if (id && name) {
        cart.addItem({ id, name, price });
        showToast(`Added ${name} to your bag`, 'shopping_bag');
      }
    });

    if (cartItemsList) {
      cartItemsList.addEventListener('click', (e) => {
        const qtyBtn = e.target.closest('.cart-qty-btn');
        if (qtyBtn) {
          const action = qtyBtn.getAttribute('data-action');
          const id = qtyBtn.getAttribute('data-id');
          if (action === 'inc') cart.changeQty(id, 1);
          if (action === 'dec') cart.changeQty(id, -1);
          return;
        }

        const removeBtn = e.target.closest('.cart-remove-btn');
        if (removeBtn) {
          const id = removeBtn.getAttribute('data-id');
          cart.removeItem(id);
          showToast('Item removed from your bag', 'delete');
        }
      });
    }

    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (cart.items.length === 0) {
          showToast('Your bag is currently empty', 'shopping_bag');
          return;
        }
        const total = cart.getSubtotal().toFixed(2);
        showToast(`Order placed for $${total}! Preparing fresh roasts...`, 'task_alt');
        cart.clear();
        setTimeout(() => {
          closeCartDrawer();
        }, 1400);
      });
    }
  }

  /* ==========================================================================
     7. LIVE SEARCH MODAL
     ========================================================================== */
  const searchBtn = document.getElementById('search-btn');
  const searchModal = document.getElementById('search-modal');
  const searchCloseBtn = document.getElementById('search-close-btn');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');

  const searchableItems = [
    { id: 'item-1', name: 'Velvet Haven Cortado', price: '$5.75', cat: 'Espresso & Filter', desc: 'Double ristretto, silky textured organic oat milk, Madagascar bourbon vanilla' },
    { id: 'item-2', name: 'Smoked Maple Nitro Cold Brew', price: '$6.50', cat: 'Cold Brews', desc: '18-hour slow steep on nitrogen, organic Vermont maple, smoked sea salt rim' },
    { id: 'item-3', name: 'Cardamom Pistachio Cruffin', price: '$5.25', cat: 'Bakery & Kitchen', desc: 'Flaky laminated brioche filled with Sicilian pistachio cream & cardamom sugar' },
    { id: 'item-4', name: 'Kyoto Slow Drip Single Origin', price: '$7.00', cat: 'Cold Brews', desc: 'Extracted drop-by-drop over 12 hours. Jasmine blossom, bergamot, and peach' },
    { id: 'item-5', name: 'Golden Spiced Turmeric Latte', price: '$6.25', cat: 'Espresso & Filter', desc: 'Hawaiian turmeric, fresh ginger root, cracked pepper, almond micro-foam' },
    { id: 'item-6', name: 'Haven Signature Espresso Roast', price: '$22.00', cat: 'Espresso & Filter', desc: '340g / 12 oz whole bean tin. Praline, dense crema, sweet fig finish' }
  ];

  function openSearchModal() {
    if (!searchModal) return;
    searchModal.classList.remove('hidden');
    if (searchInput) {
      searchInput.value = '';
      setTimeout(() => searchInput.focus(), 100);
    }
    renderSearchResults('');
  }

  function closeSearchModal() {
    if (!searchModal) return;
    searchModal.classList.add('hidden');
  }

  function renderSearchResults(query) {
    if (!searchResults) return;
    const q = query.trim().toLowerCase();

    if (!q) {
      searchResults.innerHTML = `
        <p class="text-xs text-on-surface-variant p-2">Type to filter seasonal drinks, espresso, cold brews, or bakery offerings.</p>
      `;
      return;
    }

    const matches = searchableItems.filter((item) =>
      item.name.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.cat.toLowerCase().includes(q)
    );

    if (matches.length === 0) {
      searchResults.innerHTML = `
        <div class="p-4 text-center text-sm text-on-surface-variant">
          No offerings found matching "<strong>${query}</strong>"
        </div>
      `;
      return;
    }

    searchResults.innerHTML = matches.map((item) => `
      <div class="search-result-item flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer border border-[#dfd2c0]/40" data-id="${item.id}">
        <div>
          <span class="text-[11px] uppercase tracking-wider text-secondary font-semibold">${item.cat}</span>
          <h4 class="font-headline-sm text-sm font-semibold text-primary">${item.name}</h4>
          <p class="text-xs text-on-surface-variant line-clamp-1">${item.desc}</p>
        </div>
        <div class="flex items-center gap-2 pl-3">
          <span class="text-xs font-bold text-primary">${item.price}</span>
          <button class="search-add-btn px-2.5 py-1 rounded-full bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container" data-id="${item.id}" data-name="${item.name}" data-price="${parseFloat(item.price.replace('$', ''))}">
            Add
          </button>
        </div>
      </div>
    `).join('');
  }

  function initSearch() {
    if (searchBtn) searchBtn.addEventListener('click', openSearchModal);
    if (searchCloseBtn) searchCloseBtn.addEventListener('click', closeSearchModal);

    if (searchModal) {
      searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) closeSearchModal();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        renderSearchResults(e.target.value);
      });
    }

    if (searchResults) {
      searchResults.addEventListener('click', (e) => {
        const addBtn = e.target.closest('.search-add-btn');
        if (addBtn) {
          e.stopPropagation();
          const id = addBtn.getAttribute('data-id');
          const name = addBtn.getAttribute('data-name');
          const price = parseFloat(addBtn.getAttribute('data-price') || '0');
          cart.addItem({ id, name, price });
          showToast(`Added ${name} to your bag`, 'shopping_bag');
          closeSearchModal();
          return;
        }

        const resultItem = e.target.closest('.search-result-item');
        if (resultItem) {
          const id = resultItem.getAttribute('data-id');
          closeSearchModal();
          scrollToTarget('#menu');

          setTimeout(() => {
            const card = document.querySelector(`.menu-item[data-id="${id}"]`);
            if (card) {
              card.classList.add('ring-2', 'ring-secondary');
              setTimeout(() => card.classList.remove('ring-2', 'ring-secondary'), 2000);
            }
          }, 600);
        }
      });
    }
  }

  /* ==========================================================================
     8. RESERVATION & CUPPING MODALS
     ========================================================================== */
  const reservationModal = document.getElementById('reservation-modal');
  const reservationCloseBtn = document.getElementById('reservation-close-btn');
  const reservationForm = document.getElementById('reservation-form');
  const resLocationSelect = document.getElementById('res-location');
  const resDateInput = document.getElementById('res-date');

  function openReservationModal(preferredLocation) {
    if (!reservationModal) return;
    closeMobileMenu();

    if (resLocationSelect && preferredLocation) {
      for (let i = 0; i < resLocationSelect.options.length; i++) {
        if (resLocationSelect.options[i].text.includes(preferredLocation) || resLocationSelect.options[i].value.includes(preferredLocation)) {
          resLocationSelect.selectedIndex = i;
          break;
        }
      }
    }

    if (resDateInput) {
      const today = new Date().toISOString().split('T')[0];
      resDateInput.min = today;
      if (!resDateInput.value) resDateInput.value = today;
    }

    reservationModal.classList.remove('hidden');
  }

  function closeReservationModal() {
    if (reservationModal) reservationModal.classList.add('hidden');
  }

  const cuppingModal = document.getElementById('cupping-modal');
  const cuppingCloseBtn = document.getElementById('cupping-close-btn');
  const cuppingForm = document.getElementById('cupping-form');

  function openCuppingModal() {
    if (!cuppingModal) return;
    closeMobileMenu();
    cuppingModal.classList.remove('hidden');
  }

  function closeCuppingModal() {
    if (cuppingModal) cuppingModal.classList.add('hidden');
  }

  function initReservationAndCupping() {
    document.addEventListener('click', (e) => {
      const resBtn = e.target.closest('[data-action="reserve-table"]');
      if (resBtn) {
        e.preventDefault();
        const loc = resBtn.getAttribute('data-location') || '';
        openReservationModal(loc);
        return;
      }

      const cuppingBtn = e.target.closest('[data-action="book-cupping"]');
      if (cuppingBtn) {
        e.preventDefault();
        openCuppingModal();
      }
    });

    if (reservationCloseBtn) reservationCloseBtn.addEventListener('click', closeReservationModal);
    if (reservationModal) {
      reservationModal.addEventListener('click', (e) => {
        if (e.target === reservationModal) closeReservationModal();
      });
    }

    if (reservationForm) {
      reservationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('res-name')?.value || 'Guest';
        const loc = resLocationSelect?.value || 'Brew Haven';
        const date = document.getElementById('res-date')?.value || '';
        const time = document.getElementById('res-time')?.value || '';

        showToast(`Table confirmed for ${name} on ${date} at ${time}!`, 'event_available');
        reservationForm.reset();
        closeReservationModal();
      });
    }

    if (cuppingCloseBtn) cuppingCloseBtn.addEventListener('click', closeCuppingModal);
    if (cuppingModal) {
      cuppingModal.addEventListener('click', (e) => {
        if (e.target === cuppingModal) closeCuppingModal();
      });
    }

    if (cuppingForm) {
      cuppingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('cupping-name')?.value || 'Coffee Enthusiast';
        const email = document.getElementById('cupping-email')?.value || '';

        showToast(`Spot reserved for ${name}! Pass sent to ${email}`, 'verified');
        cuppingForm.reset();
        closeCuppingModal();
      });
    }
  }

  /* ==========================================================================
     9. SUBSCRIPTION & NEWSLETTER
     ========================================================================== */
  const subscriptionModal = document.getElementById('subscription-modal');
  const subCloseBtn = document.getElementById('sub-close-btn');
  const subForm = document.getElementById('sub-form');
  const footerNewsletterForm = document.getElementById('footer-newsletter-form');

  function openSubscriptionModal() {
    if (!subscriptionModal) return;
    subscriptionModal.classList.remove('hidden');
  }

  function closeSubscriptionModal() {
    if (subscriptionModal) subscriptionModal.classList.add('hidden');
  }

  function initSubscriptionAndNewsletter() {
    document.addEventListener('click', (e) => {
      const subBtn = e.target.closest('[data-action="start-subscription"]');
      if (subBtn) {
        e.preventDefault();
        openSubscriptionModal();
      }
    });

    if (subCloseBtn) subCloseBtn.addEventListener('click', closeSubscriptionModal);
    if (subscriptionModal) {
      subscriptionModal.addEventListener('click', (e) => {
        if (e.target === subscriptionModal) closeSubscriptionModal();
      });
    }

    if (subForm) {
      subForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('sub-email')?.value || '';
        showToast(`Welcome to the Rare Harvest Club! Details sent to ${email}`, 'loyalty');
        subForm.reset();
        closeSubscriptionModal();
      });
    }

    if (footerNewsletterForm) {
      footerNewsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = footerNewsletterForm.querySelector('input[type="email"]');
        const email = input?.value || '';
        showToast(`Subscribed! Fresh bean drop notifications will arrive at ${email}`, 'mark_email_read');
        footerNewsletterForm.reset();
      });
    }
  }

  /* ==========================================================================
     10. POLICY & INFORMATION MODALS
     ========================================================================== */
  const infoModal = document.getElementById('info-modal');
  const infoCloseBtn = document.getElementById('info-close-btn');
  const infoModalTitle = document.getElementById('info-modal-title');
  const infoModalBody = document.getElementById('info-modal-body');

  const policyContent = {
    privacy: {
      title: 'Privacy Policy',
      html: `
        <p class="font-medium text-primary">Your privacy is fundamental to our craft.</p>
        <p>At Brew Haven Roasters, we collect only the essential information needed to prepare your artisanal orders, secure table bookings, and dispatch freshly roasted beans.</p>
        <h5 class="font-bold text-primary mt-2">Information We Collect</h5>
        <p>Contact details provided voluntarily through reservation forms, Rare Harvest subscriptions, or drop notifications are encrypted using modern standard protocols.</p>
        <h5 class="font-bold text-primary mt-2">Zero Third-Party Data Sharing</h5>
        <p>We do not sell, rent, or lease customer data to third parties. Information is utilized exclusively for roasting logistics, order fulfillment, and direct guest communication.</p>
        <h5 class="font-bold text-primary mt-2">Your Rights</h5>
        <p>You may request deletion or inspection of your stored profile at any time by contacting our atelier at privacy@brewhaven.coffee.</p>
      `
    },
    terms: {
      title: 'Terms of Sourcing & Craft',
      html: `
        <p class="font-medium text-primary">Direct-trade transparency and ethical accountability.</p>
        <p>Every single-origin green lot roasted in our facility is procured via direct farm contracts paying at least 60% higher than standard Fair Trade base valuations.</p>
        <h5 class="font-bold text-primary mt-2">Batch Freshness Guarantee</h5>
        <p>All café espresso service and club shipments are roasted within 7 days of delivery. If a shipment fails to meet our calibrated sensory profile, our roastery will replace the bag without charge.</p>
        <h5 class="font-bold text-primary mt-2">Sustainable Operations</h5>
        <p>Our Loring convection drum roasters utilize zero-smoke cyclone burners, mitigating greenhouse emissions by 80% compared to traditional direct-flame roasters.</p>
      `
    },
    accessibility: {
      title: 'Accessibility Statement',
      html: `
        <p class="font-medium text-primary">Inclusivity in our spaces and digital experiences.</p>
        <p>Brew Haven is dedicated to ensuring both our physical tasting ateliers and our online ordering interface are accessible to everyone, conforming to WCAG 2.1 AA standards.</p>
        <h5 class="font-bold text-primary mt-2">Atelier Accommodations</h5>
        <p>Our locations feature step-free street entrances, low-counter tasting bars, and acoustic dampening to facilitate quiet, accessible visits for guests with mobility or sensory preferences.</p>
        <h5 class="font-bold text-primary mt-2">Digital Feedback</h5>
        <p>If you encounter any visual or navigation barrier on our digital platforms, please reach us at access@brewhaven.coffee so we can continuously refine the experience.</p>
      `
    }
  };

  function openInfoModal(type) {
    if (!infoModal || !infoModalTitle || !infoModalBody) return;
    const content = policyContent[type] || policyContent.privacy;
    infoModalTitle.textContent = content.title;
    infoModalBody.innerHTML = content.html;
    infoModal.classList.remove('hidden');
  }

  function closeInfoModal() {
    if (infoModal) infoModal.classList.add('hidden');
  }

  function initInfoModal() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-modal]');
      if (btn) {
        e.preventDefault();
        const type = btn.getAttribute('data-modal');
        openInfoModal(type);
      }
    });

    if (infoCloseBtn) infoCloseBtn.addEventListener('click', closeInfoModal);
    if (infoModal) {
      infoModal.addEventListener('click', (e) => {
        if (e.target === infoModal) closeInfoModal();
      });
    }
  }

  /* ==========================================================================
     11. GLOBAL ESCAPE KEY & CLEANUP
     ========================================================================== */
  function initKeyboardListeners() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
        closeCartDrawer();
        closeSearchModal();
        closeReservationModal();
        closeCuppingModal();
        closeSubscriptionModal();
        closeInfoModal();
      }
    });
  }

  /* ==========================================================================
     12. INITIALIZATION ORCHESTRATOR
     ========================================================================== */
  function init() {
    // 1. Canvas scroll animation engine (if canvas is present)
    if (canvas && pinSection) {
      handleResize();
      updateScrollTarget();
      window.addEventListener('resize', handleResize, { passive: true });
      window.addEventListener('scroll', updateScrollTarget, { passive: true });
      preloadFrames();

      if (!isAnimationRunning) {
        isAnimationRunning = true;
        requestAnimationFrame(animationLoop);
      }
    }

    // 2. Interactive features
    initSmoothNav();
    initMobileMenu();
    initMenuFilters();
    initCart();
    initSearch();
    initReservationAndCupping();
    initSubscriptionAndNewsletter();
    initInfoModal();
    initKeyboardListeners();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
