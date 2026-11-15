// Your Life in Numbers - Main Application
(function() {
  'use strict';

  // Hide app loader
  document.addEventListener('DOMContentLoaded', preserveLanguageLinks);
  window.addEventListener('load', () => {
    const loader = document.getElementById('app-loader');
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 500);
    }
  });
  setTimeout(() => {
    const loader = document.getElementById('app-loader');
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 500);
    }
  }, 5000);

  function preserveLanguageLinks() {
    try {
      var lang = (window.i18n && window.i18n.currentLang) || new URLSearchParams(window.location.search).get('lang') || 'ko';
      document.querySelectorAll('.related-card, footer a, a[href^="/biorhythm/"], a[href^="/bmi-calculator/"], a[href^="/future-self/"], a[href^="/soul-age/"]').forEach(function(a) {
        var href = a.getAttribute('data-base-href') || a.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('http')) return;
        var url = new URL(href, window.location.origin);
        if (lang) {
          url.searchParams.set('lang', lang);
        }
        url.searchParams.set('source', 'life_in_numbers_result');
        a.setAttribute('href', url.pathname + url.search + url.hash);

        if (!a.__ctaBound) {
          a.__ctaBound = true;
          a.addEventListener('click', function() {
            if (typeof gtag === 'function') {
              gtag('event', 'content_cta_click', {
                cta_surface: 'related_tools',
                destination: a.getAttribute('href'),
                source: 'life_in_numbers_result',
                lang: lang || 'ko'
              });
            }
          });
        }
      });
    } catch (e) {}
  }

  // Stars background
  function initStars() {
    const canvas = document.getElementById('stars-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let stars = [];
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.5,
        a: Math.random() * 0.5 + 0.2,
        speed: Math.random() * 0.003 + 0.001
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const time = Date.now();
      for (const s of stars) {
        const alpha = prefersReduced ? s.a : s.a * (0.5 + 0.5 * Math.sin(time * s.speed));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 255, ${alpha})`;
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    draw();
  }
  initStars();

  // Set max date to today
  const birthdayInput = document.getElementById('birthday');
  const today = new Date();
  birthdayInput.max = today.toISOString().split('T')[0];

  // Elements
  const calculateBtn = document.getElementById('calculate-btn');
  const retryBtn = document.getElementById('retry-btn');
  const inputScreen = document.getElementById('input-screen');
  const resultScreen = document.getElementById('result-screen');
  const ageSummary = document.getElementById('age-summary');
  const statsGrid = document.getElementById('stats-grid');

  // Stats definitions with daily averages
  const STATS = [
    { key: 'daysAlive',      icon: '\u{1F4C5}', perDay: 1,       unit: '' },
    { key: 'hoursAlive',     icon: '\u{23F0}',  perDay: 24,      unit: '' },
    { key: 'minutesAlive',   icon: '\u{23F3}',  perDay: 1440,    unit: '' },
    { key: 'heartbeats',     icon: '\u{2764}\u{FE0F}',  perDay: 100800,  unit: '' },
    { key: 'breaths',        icon: '\u{1F4A8}', perDay: 23040,   unit: '' },
    { key: 'sleepHours',     icon: '\u{1F634}', perDay: 8,       unit: 'h' },
    { key: 'meals',          icon: '\u{1F37D}\u{FE0F}',  perDay: 3,       unit: '' },
    { key: 'steps',          icon: '\u{1F6B6}', perDay: 8000,    unit: '' },
    { key: 'dreams',         icon: '\u{1F4AD}', perDay: 6,       unit: '' },
    { key: 'laughs',         icon: '\u{1F602}', perDay: 15,      unit: '' },
    { key: 'moonCycles',     icon: '\u{1F319}', perDay: null,    unit: '' },
    { key: 'earthDistance',  icon: '\u{1F30D}', perDay: null,    unit: 'km' },
    { key: 'seasons',        icon: '\u{1F343}', perDay: null,    unit: '' },
    { key: 'nextBirthday',   icon: '\u{1F382}', perDay: null,    unit: '' }
  ];

  function calculate(birthDate) {
    const now = new Date();
    const diff = now - birthDate;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const years = now.getFullYear() - birthDate.getFullYear();
    const months = (years * 12) + now.getMonth() - birthDate.getMonth();

    // Moon cycle: ~29.53 days
    const moonCycles = Math.floor(days / 29.53);

    // Earth orbital distance: ~940 million km/year
    const earthDistKm = Math.round(days * 2575342); // ~940M / 365.25

    // Seasons: 4 per year
    const seasons = Math.floor(days / 365.25 * 4);

    // Next birthday
    const nextBday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (nextBday <= now) nextBday.setFullYear(nextBday.getFullYear() + 1);
    const daysUntilBday = Math.ceil((nextBday - now) / (1000 * 60 * 60 * 24));

    const results = {};
    for (const stat of STATS) {
      if (stat.perDay !== null) {
        results[stat.key] = Math.floor(days * stat.perDay);
      }
    }
    results.moonCycles = moonCycles;
    results.earthDistance = earthDistKm;
    results.seasons = seasons;
    results.nextBirthday = daysUntilBday;

    return { days, years, months, results };
  }

  function formatNumber(num) {
    if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    return num.toLocaleString();
  }

  function animateCount(el, target, duration, unit) {
    const suffix = unit ? ' ' + unit : '';
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      el.textContent = formatNumber(target) + suffix;
      return;
    }

    const start = performance.now();
    const dur = Math.min(duration, 2000);

    function update(now) {
      const progress = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = formatNumber(current) + suffix;
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = formatNumber(target) + suffix;
    }
    requestAnimationFrame(update);
  }

  function getLabel(key) {
    if (window.i18n && window.i18n.initialized) {
      const val = window.i18n.t('stats.' + key);
      if (val !== 'stats.' + key) return val;
    }
    // Fallback labels
    const fallbacks = {
      daysAlive: 'Days Alive',
      hoursAlive: 'Hours Alive',
      minutesAlive: 'Minutes Alive',
      heartbeats: 'Heartbeats',
      breaths: 'Breaths Taken',
      sleepHours: 'Hours Slept',
      meals: 'Meals Eaten',
      steps: 'Steps Walked',
      dreams: 'Dreams',
      laughs: 'Times Laughed',
      moonCycles: 'Moon Cycles',
      earthDistance: 'Earth Travel Distance',
      seasons: 'Seasons',
      nextBirthday: 'Days Until Birthday'
    };
    return fallbacks[key] || key;
  }

  function showResults(data) {
    // Age summary
    const t = (key, fb) => (window.i18n && window.i18n.initialized) ? window.i18n.t(key, fb) : fb;
    ageSummary.textContent = t('result.ageSummary', '{years} years, {days} days')
      .replace('{years}', data.years)
      .replace('{days}', data.days.toLocaleString());

    // Build stat cards
    statsGrid.innerHTML = '';
    STATS.forEach((stat, idx) => {
      const card = document.createElement('div');
      card.className = 'stat-card';
      const value = data.results[stat.key];
      const displayVal = stat.unit ? formatNumber(value) + ' ' + stat.unit : formatNumber(value);

      card.innerHTML = `
        <span class="stat-icon">${stat.icon}</span>
        <div class="stat-value" data-target="${value}">0</div>
        <div class="stat-label">${getLabel(stat.key)}</div>
      `;

      statsGrid.appendChild(card);

      const revealDelay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : idx * 100;
      setTimeout(() => {
        card.classList.add('visible');
        const valEl = card.querySelector('.stat-value');
        animateCount(valEl, value, 1500, stat.unit);
      }, revealDelay);
    });

    lastComputedData = data;
    renderCuratedResources();

    // Switch screens
    inputScreen.classList.remove('active');
    resultScreen.classList.add('active');
    preserveLanguageLinks();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // GA4 event (clean taxonomy without raw age/years leak)
    if (typeof gtag === 'function') {
      gtag('event', 'test_complete', {
        event_category: 'life_in_numbers',
        app_name: 'life-in-numbers',
        result_type: 'life_stats_profile'
      });
    }
  }

  let lastComputedData = null;

  function getCurrentLocale() {
    return (window.i18n && window.i18n.currentLang) || new URLSearchParams(window.location.search).get('lang') || 'ko';
  }

  function getShareUrl() {
    return 'https://dopabrain.com/life-in-numbers/?lang=' + encodeURIComponent(getCurrentLocale()) + '&utm_source=share';
  }

  function showToast(msg) {
    let toast = document.getElementById('lin-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'lin-toast';
      toast.className = 'lin-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function getAmazonDomain(lang) {
    const map = { ja: 'amazon.co.jp', de: 'amazon.de', fr: 'amazon.fr', es: 'amazon.es', hi: 'amazon.in' };
    return map[lang] || 'amazon.com';
  }

  function renderCuratedResources() {
    const container = document.getElementById('curated-resources-card');
    if (!container) return;
    const t = (key, fb) => (window.i18n && window.i18n.initialized) ? window.i18n.t(key, fb) : fb;
    const lang = getCurrentLocale();
    const domain = getAmazonDomain(lang);
    const items = [
      {
        key: 'fourThousandWeeks',
        asin: '0374159122',
        title: t('curated.burkemanTitle', 'Four Thousand Weeks: Time Management for Mortals'),
        desc: t('curated.burkemanDesc', 'Practical philosophy for embracing finite human time with clarity and calm.')
      },
      {
        key: 'whenTiming',
        asin: '0735210624',
        title: t('curated.pinkTitle', 'When: The Scientific Secrets of Perfect Timing'),
        desc: t('curated.pinkDesc', 'Chronobiology research on energy cycles and life milestones.')
      }
    ];

    container.innerHTML = `
      <div class="curated-resources-header">
        <h3 class="curated-resources-title">${t('curated.title', 'Recommended Chronobiology & Time Books')}</h3>
        <span class="curated-disclosure">${t('curated.disclosure', 'Affiliate links')}</span>
      </div>
      <p class="curated-resources-subtitle">${t('curated.subtitle', 'Turn your biometric stats into mindful perspective on your days.')}</p>
      <div class="curated-list">
        ${items.map(item => `
          <a class="curated-item" href="https://www.${domain}/dp/${item.asin}?tag=dopabrain-20" target="_blank" rel="noopener sponsored nofollow" data-resource-key="${item.key}">
            <div class="curated-item-top">
              <span class="curated-item-title">${item.title}</span>
              <span class="curated-item-cta">${t('curated.cta', 'View Book ->')}</span>
            </div>
            <span class="curated-item-desc">${item.desc}</span>
          </a>
        `).join('')}
      </div>`;

    container.querySelectorAll('.curated-item').forEach(link => {
      link.addEventListener('click', () => {
        if (typeof gtag === 'function') {
          gtag('event', 'curated_resource_click', {
            app_name: 'life-in-numbers',
            resource_key: link.getAttribute('data-resource-key'),
            result_type: 'life_stats_profile',
            content_locale: lang,
            cta_surface: 'curated_resources'
          });
          gtag('event', 'content_cta_click', {
            cta_type: 'curated_book',
            destination: link.getAttribute('href'),
            source: 'life_in_numbers'
          });
        }
      });
    });
  }

  function saveLifeCard() {
    const canvas = document.getElementById('share-canvas');
    if (!canvas || !lastComputedData) return;
    const t = (key, fb) => (window.i18n && window.i18n.initialized) ? window.i18n.t(key, fb) : fb;
    const lang = getCurrentLocale();
    const ctx = canvas.getContext('2d');
    canvas.width = 1080;
    canvas.height = 1920;

    const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
    grad.addColorStop(0, '#04121f');
    grad.addColorStop(0.5, '#092238');
    grad.addColorStop(1, '#060c1a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);

    ctx.fillStyle = 'rgba(0, 229, 255, 0.12)';
    ctx.beginPath();
    ctx.arc(540, 420, 320, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 34px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DOPABRAIN · LIFE IN NUMBERS', 540, 160);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 62px system-ui, -apple-system, sans-serif';
    ctx.fillText(t('result.title', 'Your Life So Far'), 540, 280);

    ctx.fillStyle = '#67e8f9';
    ctx.font = 'bold 50px system-ui, -apple-system, sans-serif';
    ctx.fillText(ageSummary ? ageSummary.textContent : '', 540, 370);

    const highlights = ['daysAlive', 'heartbeats', 'breaths', 'sleepHours', 'dreams', 'earthDistance'];
    highlights.forEach((key, idx) => {
      const y = 470 + idx * 195;
      const stat = STATS.find(s => s.key === key) || { icon: '*', unit: '' };
      const val = lastComputedData.results[key] || 0;
      const display = formatNumber(val) + (stat.unit ? ' ' + stat.unit : '');

      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.fillRect(110, y, 860, 155);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
      ctx.lineWidth = 2;
      ctx.strokeRect(110, y, 860, 155);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '32px system-ui, -apple-system, sans-serif';
      ctx.fillText(stat.icon + '  ' + getLabel(key), 150, y + 60);

      ctx.fillStyle = '#00e5ff';
      ctx.font = 'bold 56px system-ui, -apple-system, sans-serif';
      ctx.fillText(display, 150, y + 125);
    });

    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '30px system-ui, -apple-system, sans-serif';
    ctx.fillText('dopabrain.com/life-in-numbers/?lang=' + lang, 540, 1790);

    try {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'life-in-numbers-card.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      showToast(t('share.saved', 'Card Saved!'));
      if (typeof gtag === 'function') {
        gtag('event', 'save_image', {
          event_category: 'life_in_numbers',
          app_name: 'life-in-numbers',
          result_type: 'life_stats_profile',
          save_surface: 'result_story_1080x1920'
        });
      }
    } catch (e) {
      showToast(t('share.saveFailed', 'Could not save card.'));
    }
  }

  // Calculate button
  calculateBtn.addEventListener('click', () => {
    const val = birthdayInput.value;
    if (!val) {
      birthdayInput.focus();
      birthdayInput.style.borderColor = '#ff4444';
      setTimeout(() => { birthdayInput.style.borderColor = ''; }, 1500);
      return;
    }
    const birthDate = new Date(val + 'T00:00:00');
    if (isNaN(birthDate.getTime()) || birthDate > today) {
      birthdayInput.style.borderColor = '#ff4444';
      setTimeout(() => { birthdayInput.style.borderColor = ''; }, 1500);
      return;
    }
    if (typeof gtag === 'function') {
      gtag('event', 'test_start', {
        event_category: 'life_in_numbers',
        app_name: 'life-in-numbers'
      });
    }
    const data = calculate(birthDate);
    showResults(data);
  });

  // Enter key
  birthdayInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') calculateBtn.click();
  });

  // Retry button
  retryBtn.addEventListener('click', () => {
    resultScreen.classList.remove('active');
    inputScreen.classList.add('active');
    birthdayInput.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Share functions
  function getShareText() {
    const t = (key, fb) => (window.i18n && window.i18n.initialized) ? window.i18n.t(key, fb) : fb;
    const valEls = document.querySelectorAll('.stat-card');
    let text = t('share.text', 'My Life in Numbers') + '\n\n';
    valEls.forEach(card => {
      const icon = card.querySelector('.stat-icon').textContent;
      const label = card.querySelector('.stat-label').textContent;
      const value = card.querySelector('.stat-value').textContent;
      text += `${icon} ${label}: ${value}\n`;
    });
    text += '\n' + t('share.cta', 'Check yours!') + '\n' + getShareUrl();
    return text;
  }

  document.getElementById('save-card-btn')?.addEventListener('click', saveLifeCard);

  document.getElementById('share-kakao').addEventListener('click', () => {
    const text = getShareText();
    const url = getShareUrl();
    if (window.Kakao && window.Kakao.isInitialized()) {
      window.Kakao.Share.sendDefault({
        objectType: 'text',
        text: text,
        link: { mobileWebUrl: url, webUrl: url }
      });
    } else {
      window.open(`https://story.kakao.com/share?url=${encodeURIComponent(url)}`, '_blank');
    }
    if (typeof gtag === 'function') gtag('event', 'share', { method: 'kakao', content_type: 'life_stats' });
  });

  document.getElementById('share-twitter').addEventListener('click', () => {
    const text = getShareText();
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    if (typeof gtag === 'function') gtag('event', 'share', { method: 'twitter', content_type: 'life_stats' });
  });

  document.getElementById('share-facebook').addEventListener('click', () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`, '_blank');
    if (typeof gtag === 'function') gtag('event', 'share', { method: 'facebook', content_type: 'life_stats' });
  });

  document.getElementById('share-copy').addEventListener('click', () => {
    const text = getShareText();
    const t = (key, fb) => (window.i18n && window.i18n.initialized) ? window.i18n.t(key, fb) : fb;
    const onCopied = () => {
      const btn = document.getElementById('share-copy');
      btn.querySelector('span').textContent = t('share.copied', 'Copied!');
      showToast(t('share.copied', 'Copied!'));
      setTimeout(() => {
        btn.querySelector('span').textContent = t('share.copyLink', 'Copy Link');
      }, 2000);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onCopied).catch(() => {});
    }
    if (typeof gtag === 'function') gtag('event', 'share', { method: 'copy', content_type: 'life_stats' });
  });

})();
