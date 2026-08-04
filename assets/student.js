(function () {
  const REPO_RAW = 'https://raw.githubusercontent.com/Durkiman/Language-Teaching/main';
  const FOLDER = document.currentScript.dataset.folder;

  // ---- Old flat-list layout (hub-columns) — kept until every student page is migrated to the hero+carousel layout below. Each function no-ops if its target element isn't on the page. ----

  async function loadHomework() {
    const hwListEl = document.getElementById('homework-list');
    if (!hwListEl) return; // page hasn't been updated with the homework column yet

    try {
      const res = await fetch(`${REPO_RAW}/${FOLDER}/homework.json`);
      if (!res.ok) throw new Error();
      const homework = await res.json();

      if (!homework.length) {
        hwListEl.innerHTML = '<li><div class="empty-state">No homework yet.</div></li>';
        return;
      }

      // newest first
      hwListEl.innerHTML = homework.slice().reverse().map(hw => `
        <li>
          <a href="homework/${hw.file}">
            <span class="icon">📝</span>
            ${hw.title}
            <span class="arrow">→</span>
          </a>
        </li>
      `).join('');

    } catch {
      hwListEl.innerHTML = '<li><div class="empty-state">Could not load homework right now — try refreshing.</div></li>';
    }
  }

  async function loadLessons() {
    const listEl = document.getElementById('lesson-list');
    if (!listEl) return; // page has been migrated to the hero+carousel layout

    try {
      const res = await fetch(`${REPO_RAW}/${FOLDER}/lessons.json`);
      if (!res.ok) throw new Error();
      const lessons = await res.json();

      if (!lessons.length) {
        listEl.innerHTML = '<li><div class="empty-state">No lessons yet — check back after your next session!</div></li>';
      } else {
        listEl.innerHTML = lessons.map(lesson => `
          <li>
            <a href="${lesson.file}">
              <span class="icon">📄</span>
              ${lesson.title}
              <span class="arrow">→</span>
            </a>
          </li>
        `).join('');
      }

      renderGrammarBook(lessons);

    } catch {
      listEl.innerHTML = '<li><div class="empty-state">Could not load lessons right now — try refreshing.</div></li>';
      renderGrammarBook(null);
    }
  }

  function renderGrammarBook(lessons) {
    const gbEl = document.getElementById('grammar-book-list');
    if (!gbEl) return; // page hasn't been updated with the grammar book column yet

    if (lessons === null) {
      gbEl.innerHTML = '<div class="empty-state">Could not load right now — try refreshing.</div>';
      return;
    }

    const grammarSeen = new Map();
    lessons.forEach(lesson => {
      (lesson.grammar || []).forEach(g => {
        if (!grammarSeen.has(g.file)) grammarSeen.set(g.file, g.title);
      });
    });

    if (!grammarSeen.size) {
      gbEl.innerHTML = '<div class="empty-state">No grammar pages yet.</div>';
      return;
    }

    gbEl.innerHTML = [...grammarSeen].map(([file, title]) => `<a href="../Grammar-book/English/${file}">${title}</a>`).join('');
  }

  // ---- New hero + horizontal-carousel layout ----
  // Each loader no-ops (returns early) if its hero mount point isn't present,
  // so this coexists safely with student pages still on the old flat-list layout.

  function heroCardHTML(item, href, icon) {
    return `
      <a class="hero-card" href="${href}">
        <span class="hero-icon">${icon}</span>
        <span class="hero-text">
          <span class="hero-eyebrow">Latest</span>
          <span class="hero-title">${item.title}</span>
        </span>
        <span class="hero-arrow">→</span>
      </a>`;
  }

  function carCardHTML(item, href, icon) {
    return `<a class="car-card" href="${href}"><span class="car-card-icon">${icon}</span><span class="car-card-title">${item.title}</span></a>`;
  }

  function carPillHTML(title, href) {
    return `<a class="car-pill" href="${href}">${title}</a>`;
  }

  function setupCarousel(wrapEl) {
    const track = wrapEl.querySelector('.car-track');
    const prev = wrapEl.querySelector('.car-prev');
    const next = wrapEl.querySelector('.car-next');
    if (!track || !prev || !next) return;

    function stepSize() {
      const card = track.firstElementChild;
      if (!card) return 200;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 12;
      return card.getBoundingClientRect().width + gap;
    }

    function updateArrows() {
      const hasOverflow = track.scrollWidth > track.clientWidth + 4;
      prev.style.display = hasOverflow ? '' : 'none';
      next.style.display = hasOverflow ? '' : 'none';
      if (!hasOverflow) return;
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
    }

    prev.addEventListener('click', () => track.scrollBy({ left: -stepSize(), behavior: 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: stepSize(), behavior: 'smooth' }));
    track.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', updateArrows);
    updateArrows();
  }

  function hideCarouselArrows(carEl) {
    carEl.querySelectorAll('.car-arrow').forEach(b => b.style.display = 'none');
  }

  async function loadLessonsCarousel() {
    const heroEl = document.getElementById('lesson-hero');
    if (!heroEl) return; // page hasn't been migrated to the hero+carousel layout yet
    const carEl = document.getElementById('lesson-carousel');

    try {
      const res = await fetch(`${REPO_RAW}/${FOLDER}/lessons.json`);
      if (!res.ok) throw new Error();
      const lessons = await res.json();

      if (!lessons.length) {
        heroEl.innerHTML = '<div class="empty-state">No lessons yet — check back after your next session!</div>';
        if (carEl) carEl.style.display = 'none';
        renderGrammarBookCarousel([]);
        return;
      }

      const [latest, ...rest] = lessons;
      heroEl.innerHTML = heroCardHTML(latest, latest.file, '📄');

      const track = carEl.querySelector('.car-track');
      if (!rest.length) {
        track.innerHTML = '<div class="car-empty">More lessons coming soon</div>';
        hideCarouselArrows(carEl);
      } else {
        track.innerHTML = rest.map(l => carCardHTML(l, l.file, '📄')).join('');
        setupCarousel(carEl);
      }

      renderGrammarBookCarousel(lessons);

    } catch {
      heroEl.innerHTML = '<div class="empty-state">Could not load lessons right now — try refreshing.</div>';
      if (carEl) carEl.style.display = 'none';
      renderGrammarBookCarousel(null);
    }
  }

  async function loadHomeworkCarousel() {
    const heroEl = document.getElementById('homework-hero');
    if (!heroEl) return; // page hasn't been migrated to the hero+carousel layout yet
    const carEl = document.getElementById('homework-carousel');

    try {
      const res = await fetch(`${REPO_RAW}/${FOLDER}/homework.json`);
      if (!res.ok) throw new Error();
      const ordered = (await res.json()).slice().reverse(); // newest first

      if (!ordered.length) {
        heroEl.innerHTML = '<div class="empty-state">No homework yet.</div>';
        if (carEl) carEl.style.display = 'none';
        return;
      }

      const [latest, ...rest] = ordered;
      heroEl.innerHTML = heroCardHTML(latest, `homework/${latest.file}`, '📝');

      const track = carEl.querySelector('.car-track');
      if (!rest.length) {
        track.innerHTML = '<div class="car-empty">More homework coming soon</div>';
        hideCarouselArrows(carEl);
      } else {
        track.innerHTML = rest.map(hw => carCardHTML(hw, `homework/${hw.file}`, '📝')).join('');
        setupCarousel(carEl);
      }

    } catch {
      heroEl.innerHTML = '<div class="empty-state">Could not load homework right now — try refreshing.</div>';
      if (carEl) carEl.style.display = 'none';
    }
  }

  function renderGrammarBookCarousel(lessons) {
    const heroEl = document.getElementById('grammar-hero');
    if (!heroEl) return; // page hasn't been migrated to the hero+carousel layout yet
    const carEl = document.getElementById('grammar-carousel');

    if (lessons === null) {
      heroEl.innerHTML = '<div class="empty-state">Could not load right now — try refreshing.</div>';
      if (carEl) carEl.style.display = 'none';
      return;
    }

    const grammarSeen = new Map();
    lessons.forEach(lesson => {
      (lesson.grammar || []).forEach(g => {
        if (!grammarSeen.has(g.file)) grammarSeen.set(g.file, g.title);
      });
    });
    const entries = [...grammarSeen];

    if (!entries.length) {
      heroEl.innerHTML = '<div class="empty-state">No grammar pages yet.</div>';
      if (carEl) carEl.style.display = 'none';
      return;
    }

    const [[latestFile, latestTitle], ...rest] = entries;
    heroEl.innerHTML = heroCardHTML({ title: latestTitle }, `../Grammar-book/English/${latestFile}`, '📘');

    const track = carEl.querySelector('.car-track');
    if (!rest.length) {
      track.innerHTML = '<div class="car-empty">More grammar pages coming soon</div>';
      hideCarouselArrows(carEl);
    } else {
      track.innerHTML = rest.map(([file, title]) => carPillHTML(title, `../Grammar-book/English/${file}`)).join('');
      setupCarousel(carEl);
    }
  }

  loadLessons();
  loadHomework();
  loadLessonsCarousel();
  loadHomeworkCarousel();
})();
