(function () {
  const REPO_RAW = 'https://raw.githubusercontent.com/Durkiman/Language-Teaching/main';
  const FOLDER = document.currentScript.dataset.folder;
  const listEl = document.getElementById('lesson-list');

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
    try {
      const res = await fetch(`${REPO_RAW}/${FOLDER}/lessons.json`);
      if (!res.ok) throw new Error();
      const lessons = await res.json();

      if (!lessons.length) {
        listEl.innerHTML = '<li><div class="empty-state">No lessons yet — check back after your next session!</div></li>';
        return;
      }

      listEl.innerHTML = lessons.map(lesson => `
        <li>
          <a href="${lesson.file}">
            <span class="icon">📄</span>
            ${lesson.title}
            <span class="arrow">→</span>
          </a>
        </li>
      `).join('');

      renderGrammarBook(lessons);

    } catch {
      listEl.innerHTML = '<li><div class="empty-state">Could not load lessons right now — try refreshing.</div></li>';
    }
  }

  function renderGrammarBook(lessons) {
    const grammarSeen = new Map();
    lessons.forEach(lesson => {
      (lesson.grammar || []).forEach(g => {
        if (!grammarSeen.has(g.file)) grammarSeen.set(g.file, g.title);
      });
    });
    if (!grammarSeen.size) return;

    const section = document.createElement('div');
    section.className = 'grammar-book';
    section.innerHTML = `
      <p class="grammar-book-label">📘 My Grammar Book</p>
      <div class="grammar-links">
        ${[...grammarSeen].map(([file, title]) => `<a href="../Grammar-book/English/${file}">${title}</a>`).join('')}
      </div>
    `;
    listEl.insertAdjacentElement('afterend', section);
  }

  loadLessons();
  loadHomework();
})();
