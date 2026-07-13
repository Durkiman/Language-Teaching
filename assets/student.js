(function () {
  const REPO_RAW = 'https://raw.githubusercontent.com/Durkiman/Language-Teaching/main';
  const FOLDER = document.currentScript.dataset.folder;
  const listEl = document.getElementById('lesson-list');

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

    } catch {
      listEl.innerHTML = '<li><div class="empty-state">Could not load lessons right now — try refreshing.</div></li>';
    }
  }

  loadLessons();
})();
