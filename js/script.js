/* =========================================================
   Smart Spend Coach — Application Script
   Vanilla JS, no dependencies.
   ========================================================= */

(() => {
  'use strict';

  // ---------- Utility helpers ----------
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const STORAGE_KEY = 'ssc_history_v1';
  const PREFS_KEY = 'ssc_prefs_v1';
  const CURRENCY_SYMBOLS = { USD: '$', NPR: 'रू', EUR: '€', GBP: '£', INR: '₹' };

  // ---------- Loader ----------
  window.addEventListener('load', () => {
    setTimeout(() => $('#loader')?.classList.add('hidden'), 400);
  });

  // ---------- Year ----------
  $('#year').textContent = new Date().getFullYear();

  // ---------- Theme toggle (persisted) ----------
  const themeToggle = $('#theme-toggle');
  const savedTheme = localStorage.getItem('ssc_theme');
  if (savedTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  themeToggle?.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('ssc_theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('ssc_theme', 'dark');
    }
  });

  // ---------- Navbar scroll state + scroll progress ----------
  const navbar = $('#navbar');
  const progress = $('#scroll-progress');
  const backTop = $('#back-to-top');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 20);
    backTop.classList.toggle('show', y > 400);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = h > 0 ? `${(y / h) * 100}%` : '0%';
  }, { passive: true });
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // ---------- Hamburger ----------
  const hamburger = $('#hamburger');
  const mobileMenu = $('#mobile-menu');
  hamburger?.addEventListener('click', () => {
    const open = !mobileMenu.hidden;
    mobileMenu.hidden = open;
    hamburger.setAttribute('aria-expanded', String(!open));
  });
  $$('#mobile-menu a').forEach(a => a.addEventListener('click', () => { mobileMenu.hidden = true; }));

  // ---------- Toast ----------
  function toast(msg, type = 'success') {
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.textContent = msg;
    $('#toast-container').appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(100%)'; }, 2800);
    setTimeout(() => el.remove(), 3200);
  }

  // ---------- Reveal on scroll ----------
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach(el => io.observe(el));

  // ---------- Animated counters ----------
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const dur = 1400;
      const start = performance.now();
      function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const v = Math.floor(p * target);
        el.textContent = v.toLocaleString() + suffix;
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target.toLocaleString() + suffix;
      }
      requestAnimationFrame(tick);
      counterIO.unobserve(el);
    });
  }, { threshold: 0.5 });
  $$('[data-count]').forEach(el => counterIO.observe(el));

  // ---------- Calculator ----------
  const els = {
    currency: $('#currency'),
    income: $('#income'),
    days: $('#days'),
    hours: $('#hours'),
    savings: $('#savings'),
    price: $('#price'),
    badge: $('#decision-badge'),
    msg: $('#decision-msg'),
    rHours: $('#r-hours'),
    rDays: $('#r-days'),
    rRate: $('#r-rate'),
    rSavings: $('#r-savings'),
    rNeeded: $('#r-needed'),
    rReco: $('#r-reco'),
    fill: $('#progress-fill'),
    save: $('#save-decision'),
  };

  // restore prefs
  try {
    const prefs = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}');
    if (prefs.currency) els.currency.value = prefs.currency;
    if (prefs.income) els.income.value = prefs.income;
    if (prefs.days) els.days.value = prefs.days;
    if (prefs.hours) els.hours.value = prefs.hours;
    if (prefs.savings) els.savings.value = prefs.savings;
  } catch {}

  let lastCalc = null;

  function fmt(n, cur) {
    if (!isFinite(n)) return '—';
    const sym = CURRENCY_SYMBOLS[cur] || '';
    return `${sym}${Math.round(n).toLocaleString()}`;
  }

  function calculate() {
    const currency = els.currency.value;
    const income = parseFloat(els.income.value) || 0;
    const days = parseFloat(els.days.value) || 0;
    const hoursPerDay = parseFloat(els.hours.value) || 0;
    const savings = parseFloat(els.savings.value) || 0;
    const price = parseFloat(els.price.value) || 0;

    // persist prefs
    localStorage.setItem(PREFS_KEY, JSON.stringify({ currency, income, days, hours: hoursPerDay, savings }));

    if (income <= 0 || days <= 0 || hoursPerDay <= 0 || price <= 0) {
      resetResult();
      return;
    }

    const hourlyRate = income / (days * hoursPerDay);
    const usableSavings = Math.min(savings * 0.3, savings);
    const amountToEarn = Math.max(price - usableSavings, 0);
    const workHours = amountToEarn / hourlyRate;
    const workDays = workHours / hoursPerDay;

    let level, message, color, recommendation;
    if (workHours <= 4) {
      level = 'SAFE'; color = 'safe';
      message = 'This looks safe to buy.';
      recommendation = 'Go ahead — the cost in your time is minimal.';
    } else if (workHours <= 12) {
      level = 'THINK'; color = 'think';
      message = 'Take a moment before purchasing.';
      recommendation = 'Sleep on it for 24 hours, then revisit.';
    } else {
      level = 'RISKY'; color = 'risky';
      message = 'This may not be the best financial decision right now.';
      recommendation = 'Consider waiting, saving more, or finding alternatives.';
    }

    els.badge.textContent = level;
    els.badge.className = `decision-badge decision-badge--${color}`;
    els.msg.textContent = message;
    els.rHours.textContent = workHours.toFixed(1) + ' h';
    els.rDays.textContent = workDays.toFixed(1) + ' d';
    els.rRate.textContent = fmt(hourlyRate, currency) + '/h';
    els.rSavings.textContent = fmt(usableSavings, currency);
    els.rNeeded.textContent = fmt(amountToEarn, currency);
    els.rReco.textContent = recommendation;

    const pct = Math.min((workHours / 24) * 100, 100);
    els.fill.style.width = pct + '%';
    const colorVar = color === 'safe' ? 'var(--success)' : color === 'think' ? 'var(--warning)' : 'var(--danger)';
    els.fill.style.background = colorVar;

    lastCalc = { currency, price, hourlyRate, workHours, workDays, level, date: Date.now() };
  }

  function resetResult() {
    els.badge.textContent = 'Awaiting input';
    els.badge.className = 'decision-badge decision-badge--idle';
    els.msg.textContent = 'Fill in your income and purchase price to see the result.';
    ['rHours','rDays','rRate','rSavings','rNeeded','rReco'].forEach(k => els[k].textContent = '—');
    els.fill.style.width = '0%';
    lastCalc = null;
  }

  ['currency','income','days','hours','savings','price'].forEach(k => {
    els[k].addEventListener('input', calculate);
  });

  els.save.addEventListener('click', () => {
    if (!lastCalc) { toast('Enter values first', 'danger'); return; }
    const history = readHistory();
    history.unshift(lastCalc);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 50)));
    renderHistory();
    renderInsights();
    toast('Decision saved');
  });

  // ---------- History ----------
  function readHistory() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  }

  function renderHistory() {
    const list = $('#history-list');
    const items = readHistory();
    if (items.length === 0) {
      list.innerHTML = '<p class="empty" id="history-empty">No decisions saved yet. Try the calculator above.</p>';
      return;
    }
    list.innerHTML = items.map((it, i) => {
      const date = new Date(it.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      const badgeClass = it.level === 'SAFE' ? 'safe' : it.level === 'THINK' ? 'think' : 'risky';
      return `
        <div class="history-item">
          <div class="history-item__main">
            <div class="history-item__price">${fmt(it.price, it.currency)}</div>
            <div class="history-item__meta">${it.workHours.toFixed(1)}h required · ${date}</div>
          </div>
          <span class="decision-badge decision-badge--${badgeClass}">${it.level}</span>
          <button class="history-item__del" data-i="${i}" aria-label="Delete">✕</button>
        </div>
      `;
    }).join('');
    $$('.history-item__del').forEach(b => b.addEventListener('click', e => {
      const i = +e.currentTarget.dataset.i;
      const arr = readHistory();
      arr.splice(i, 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
      renderHistory();
      renderInsights();
      toast('Decision removed');
    }));
  }

  $('#clear-history').addEventListener('click', () => {
    if (!confirm('Clear all saved decisions?')) return;
    localStorage.removeItem(STORAGE_KEY);
    renderHistory();
    renderInsights();
    toast('History cleared');
  });

  // ---------- Insights ----------
  function renderInsights() {
    const items = readHistory();
    const total = items.length;
    const safe = items.filter(i => i.level === 'SAFE').length;
    const think = items.filter(i => i.level === 'THINK').length;
    const risky = items.filter(i => i.level === 'RISKY').length;

    $('#i-total').textContent = total;
    $('#i-safe').textContent = safe;
    $('#i-think').textContent = think;
    $('#i-risky').textContent = risky;

    if (total === 0) {
      $('#i-avgcost').textContent = '—';
      $('#i-avghours').textContent = '—';
      $('#i-common').textContent = '—';
    } else {
      const avgCost = items.reduce((s, x) => s + x.price, 0) / total;
      const avgHours = items.reduce((s, x) => s + x.workHours, 0) / total;
      const cur = items[0].currency;
      $('#i-avgcost').textContent = fmt(avgCost, cur);
      $('#i-avghours').textContent = avgHours.toFixed(1) + ' h';
      const counts = { SAFE: safe, THINK: think, RISKY: risky };
      $('#i-common').textContent = Object.entries(counts).sort((a,b) => b[1]-a[1])[0][0];
    }

    // Chart
    const chart = $('#chart');
    const max = Math.max(safe, think, risky, 1);
    chart.innerHTML = `
      <div class="chart__bar" style="height:${(safe/max)*100}%;background:var(--success)"><span>${safe}</span></div>
      <div class="chart__bar" style="height:${(think/max)*100}%;background:var(--warning)"><span>${think}</span></div>
      <div class="chart__bar" style="height:${(risky/max)*100}%;background:var(--danger)"><span>${risky}</span></div>
    `;
  }

  // ---------- Testimonials ----------
  const TESTIMONIALS = [
    { name: 'Aarav Sharma', role: 'Student', quote: 'Stopped my coffee splurges. I now see every purchase as study time.', stars: 5 },
    { name: 'Maya Patel', role: 'Freelancer', quote: 'A game-changer for my budget. Pure clarity in seconds.', stars: 5 },
    { name: 'Daniel Lee', role: 'Developer', quote: 'Beautifully simple. I check it before any purchase over $50.', stars: 4 },
    { name: 'Priya Singh', role: 'Teacher', quote: 'Helped me build real spending discipline this year.', stars: 5 },
    { name: 'Marco Rossi', role: 'Office Worker', quote: 'The hours-of-work framing changed how I think about money.', stars: 5 },
    { name: 'Sara Khan', role: 'Business Owner', quote: 'Recommended to my whole team. Practical and powerful.', stars: 4 },
  ];
  const track = $('#t-track');
  track.innerHTML = TESTIMONIALS.map(t => `
    <div class="testimonial">
      <div class="testimonial__stars">${'★'.repeat(t.stars)}${'☆'.repeat(5-t.stars)}</div>
      <p class="testimonial__quote">"${t.quote}"</p>
      <div class="testimonial__author">
        <div class="testimonial__avatar">${t.name.charAt(0)}</div>
        <div>
          <div class="testimonial__name">${t.name}</div>
          <div class="testimonial__role">${t.role}</div>
        </div>
      </div>
    </div>
  `).join('');
  $('#t-next').addEventListener('click', () => track.scrollBy({ left: track.clientWidth, behavior: 'smooth' }));
  $('#t-prev').addEventListener('click', () => track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' }));

  // ---------- FAQ ----------
  const FAQS = [
    ['How are calculations made?', 'We divide your monthly income by your working hours to find your real hourly rate, then translate purchase prices into hours of work.'],
    ['Is my data stored online?', 'No. Everything is saved privately in your browser using localStorage. Nothing is sent to a server.'],
    ['Is Smart Spend Coach free?', 'Yes — completely free to use on web and Android.'],
    ['Can I use different currencies?', 'Yes. NPR, USD, EUR, GBP, and INR are supported.'],
    ['Why work hours instead of money?', 'Time is finite. Framing cost as hours of life makes trade-offs intuitive and emotional.'],
    ['Can I save calculations?', 'Yes — every decision can be saved and reviewed in your history.'],
    ['Is my information private?', 'Absolutely. We never collect or transmit your inputs.'],
  ];
  const faqList = $('#faq-list');
  faqList.innerHTML = FAQS.map(([q, a]) => `
    <div class="faq-item">
      <button class="faq-q" type="button">${q}</button>
      <div class="faq-a">${a}</div>
    </div>
  `).join('');
  $$('.faq-q').forEach(btn => btn.addEventListener('click', () => {
    btn.parentElement.classList.toggle('open');
  }));

  // ---------- Newsletter ----------
  $('#newsletter-form').addEventListener('submit', e => {
    e.preventDefault();
    const email = $('#newsletter-email').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast('Enter a valid email', 'danger'); return; }
    e.target.reset();
    toast('Subscribed! Welcome aboard.');
  });

  // ---------- Contact ----------
  $('#contact-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#c-name').value.trim();
    const email = $('#c-email').value.trim();
    const msg = $('#c-message').value.trim();
    if (!name || name.length < 2) return toast('Please enter your name', 'danger');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast('Enter a valid email', 'danger');
    if (msg.length < 10) return toast('Message is too short', 'danger');
    e.target.reset();
    toast('Message sent — we will reply soon');
  });

  // ---------- Init ----------
  renderHistory();
  renderInsights();
  calculate();
})();
