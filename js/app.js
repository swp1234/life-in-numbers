// Your Life in Numbers - Main Application
(function() {
  'use strict';

  // Hide app loader
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

  function animateCount(el, target, duration) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      el.textContent = formatNumber(target);
      return;
    }

    const start = performance.now();
    const dur = Math.min(duration, 2000);

    function update(now) {
      const progress = Math.min((now - start) / dur, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = formatNumber(current);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = formatNumber(target);
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

      // Staggered reveal + count-up
      setTimeout(() => {
        card.classList.add('visible');
        const valEl = card.querySelector('.stat-value');
        animateCount(valEl, value, 1500);
        if (stat.unit) {
          const origFormat = formatNumber;
          const checkUnit = setInterval(() => {
            if (valEl.textContent && !valEl.textContent.includes(stat.unit)) {
              // will be overwritten by animateCount
            } else {
              clearInterval(checkUnit);
            }
          }, 100);
          // Ensure unit is appended after animation
          setTimeout(() => {
            if (!valEl.textContent.includes(stat.unit)) {
              valEl.textContent = formatNumber(value) + ' ' + stat.unit;
            }
          }, 1600);
        }
      }, idx * 100);
    });

    // Switch screens
    inputScreen.classList.remove('active');
    resultScreen.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // GA4 event
    if (typeof gtag === 'function') {
      gtag('event', 'calculate_life_numbers', { years: data.years });
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
    text += '\n' + t('share.cta', 'Check yours!') + '\nhttps://dopabrain.com/life-in-numbers/';
    return text;
  }

  document.getElementById('share-kakao').addEventListener('click', () => {
    const text = getShareText();
    const url = 'https://dopabrain.com/life-in-numbers/';
    if (window.Kakao && window.Kakao.isInitialized()) {
      window.Kakao.Share.sendDefault({
        objectType: 'text',
        text: text,
        link: { mobileWebUrl: url, webUrl: url }
      });
    } else {
      window.open(`https://story.kakao.com/share?url=${encodeURIComponent(url)}`, '_blank');
    }
  });

  document.getElementById('share-twitter').addEventListener('click', () => {
    const text = getShareText();
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  });

  document.getElementById('share-facebook').addEventListener('click', () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://dopabrain.com/life-in-numbers/')}`, '_blank');
  });

  document.getElementById('share-copy').addEventListener('click', () => {
    const text = getShareText();
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('share-copy');
      const origHTML = btn.innerHTML;
      const t = (key, fb) => (window.i18n && window.i18n.initialized) ? window.i18n.t(key, fb) : fb;
      btn.querySelector('span').textContent = t('share.copied', 'Copied!');
      setTimeout(() => {
        btn.querySelector('span').textContent = t('share.copyLink', 'Copy Link');
      }, 2000);
    });
  });

})();
