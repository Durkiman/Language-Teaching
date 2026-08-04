// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
/* BEGIN USAGE */
/**
 * VocabCards — spaced-repetition flip-card study widget for the Vocabulary Book.
 *
 * Usage:
 *   <div id="vocab-cards-root"></div>
 *   <script src="../vocab-cards.js"></script>
 *   <script>
 *     VocabCards.init(document.getElementById('vocab-cards-root'), {
 *       deckId: 'food-and-drink',   // must be unique per page — used as the
 *                                   // localStorage key, so progress survives reloads
 *       words: [{ term: 'apple', ipa: '/ˈæp.əl/', meaning: 'a round fruit…', example: 'I eat an apple…' }]
 *     });
 *   </script>
 *
 * Scheduling is a lightweight SM-2-style scheme: each card tracks reps/interval/due
 * in localStorage under `vocabSR:<deckId>:<term>`. Cards graded "Didn't know" reset
 * to 0 and are re-queued later in the same session; cards graded "Knew it" get a
 * growing interval (1 → 3 → 7 → 16 days, then ×2.3) and drop out of today's queue.
 * A session only ever includes cards due today (or all cards, if nothing is due yet).
 */
/* END USAGE */

(function () {
  var COLORS = {
    teal: '#0E7C86', tealDark: '#0A5F67', ink: '#1B4B4F', orange: '#F2994A',
    green: '#2D7A3A', greenBg: '#E4F8ED', red: '#B83A1A', redBg: '#FDE8E8',
    paper: '#FFFFFF', cream: '#F4F1EA', border: '#DCEEE2', muted: '#9A9483'
  };

  function todayNum() {
    var d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime();
  }

  function loadState(deckId, term) {
    try {
      var raw = localStorage.getItem('vocabSR:' + deckId + ':' + term);
      return raw ? JSON.parse(raw) : { reps: 0, interval: 0, due: 0 };
    } catch (e) { return { reps: 0, interval: 0, due: 0 }; }
  }

  function saveState(deckId, term, state) {
    try { localStorage.setItem('vocabSR:' + deckId + ':' + term, JSON.stringify(state)); } catch (e) {}
  }

  function clearDeck(deckId, words) {
    words.forEach(function (w) {
      try { localStorage.removeItem('vocabSR:' + deckId + ':' + w.term); } catch (e) {}
    });
  }

  function nextInterval(reps) {
    if (reps <= 1) return 1;
    if (reps === 2) return 3;
    if (reps === 3) return 7;
    if (reps === 4) return 16;
    return Math.round(16 * Math.pow(2.3, reps - 4));
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function el(tag, style, html) {
    var e = document.createElement(tag);
    if (style) e.style.cssText = style;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function init(root, opts) {
    var deckId = opts.deckId;
    var words = opts.words || [];
    if (!root || !words.length) return;

    var direction = 'word-first';
    var queue = [];
    var pos = 0;
    var flipped = false;
    var sessionDone = 0;
    var sessionAgain = 0;

    root.innerHTML = '';
    var wrap = el('div', 'font-family:\'Nunito\',sans-serif;max-width:560px;margin:0 auto;');
    root.appendChild(wrap);

    var toggleBar = el('div', 'display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:14px;flex-wrap:wrap;');
    var btnWordFirst = el('button', btnStyle(true), 'Word → Meaning');
    var btnMeaningFirst = el('button', btnStyle(false), 'Meaning → Word');
    var btnReset = el('button', 'font-family:\'Nunito\',sans-serif;font-size:12px;font-weight:700;color:' + COLORS.muted + ';background:transparent;border:none;cursor:pointer;text-decoration:underline;margin-left:8px;', 'Reset progress');
    toggleBar.appendChild(btnWordFirst);
    toggleBar.appendChild(btnMeaningFirst);
    toggleBar.appendChild(btnReset);
    wrap.appendChild(toggleBar);

    var statusLine = el('div', 'text-align:center;font-size:12.5px;font-weight:700;color:' + COLORS.muted + ';margin-bottom:10px;');
    wrap.appendChild(statusLine);

    var cardBox = el('div');
    wrap.appendChild(cardBox);

    function btnStyle(active) {
      return 'font-family:\'Baloo 2\',sans-serif;font-weight:700;font-size:12.5px;padding:6px 14px;border-radius:20px;cursor:pointer;border:1.5px solid ' + COLORS.teal + ';background:' + (active ? COLORS.teal : '#fff') + ';color:' + (active ? '#fff' : COLORS.teal) + ';';
    }

    btnWordFirst.addEventListener('click', function () {
      direction = 'word-first';
      btnWordFirst.style.cssText = btnStyle(true);
      btnMeaningFirst.style.cssText = btnStyle(false);
      flipped = false;
      renderCard();
    });
    btnMeaningFirst.addEventListener('click', function () {
      direction = 'meaning-first';
      btnMeaningFirst.style.cssText = btnStyle(true);
      btnWordFirst.style.cssText = btnStyle(false);
      flipped = false;
      renderCard();
    });
    btnReset.addEventListener('click', function () {
      if (!confirm('Reset spaced-repetition progress for this batch?')) return;
      clearDeck(deckId, words);
      buildQueue();
      renderCard();
    });

    function buildQueue() {
      var today = todayNum();
      var due = [], notDue = 0;
      words.forEach(function (w) {
        var st = loadState(deckId, w.term);
        w._state = st;
        if (!st.due || st.due <= today) due.push(w); else notDue++;
      });
      queue = shuffle(due.length ? due.slice() : words.slice());
      pos = 0;
      flipped = false;
      sessionDone = 0;
      sessionAgain = 0;
      statusLine.dataset.notDue = notDue;
    }

    function grade(knewIt) {
      var card = queue[pos];
      var st = card._state;
      if (knewIt) {
        st.reps = (st.reps || 0) + 1;
        st.interval = nextInterval(st.reps);
        st.due = todayNum() + st.interval * 86400000;
        saveState(deckId, card.term, st);
        sessionDone++;
        queue.splice(pos, 1);
      } else {
        st.reps = 0;
        st.interval = 0;
        st.due = 0;
        saveState(deckId, card.term, st);
        sessionAgain++;
        queue.splice(pos, 1);
        var reinsertAt = Math.min(queue.length, pos + 3);
        queue.splice(reinsertAt, 0, card);
      }
      flipped = false;
      if (pos >= queue.length) pos = 0;
      renderCard();
    }

    function renderCard() {
      cardBox.innerHTML = '';
      var notDue = parseInt(statusLine.dataset.notDue || '0', 10);

      if (!queue.length) {
        statusLine.textContent = sessionDone + ' reviewed this session';
        var doneBox = el('div', 'background:' + COLORS.greenBg + ';border:2px solid ' + COLORS.green + ';border-radius:16px;padding:28px 20px;text-align:center;');
        doneBox.innerHTML = '<div style="font-size:32px;margin-bottom:6px;">🎉</div>'
          + '<div style="font-family:\'Baloo 2\',sans-serif;font-weight:800;font-size:18px;color:' + COLORS.ink + ';">All caught up!</div>'
          + '<div style="font-size:13.5px;color:' + COLORS.ink + ';margin-top:6px;">' + (notDue > 0 ? notDue + ' word(s) are scheduled to come back later.' : 'Every word in this batch has been reviewed.') + '</div>';
        var restartBtn = el('button', 'margin-top:14px;font-family:\'Baloo 2\',sans-serif;font-weight:700;font-size:13px;color:#fff;background:' + COLORS.teal + ';border:none;border-radius:20px;padding:8px 18px;cursor:pointer;', 'Study all words again');
        restartBtn.addEventListener('click', function () {
          queue = shuffle(words.slice());
          pos = 0; flipped = false;
          renderCard();
        });
        doneBox.appendChild(el('div'));
        doneBox.appendChild(restartBtn);
        cardBox.appendChild(doneBox);
        return;
      }

      var card = queue[pos];
      statusLine.textContent = (pos + 1) + ' / ' + queue.length + ' due now'
        + (sessionAgain ? '  ·  ' + sessionAgain + ' to review again' : '')
        + (notDue ? '  ·  ' + notDue + ' scheduled for later' : '');

      var showTermFirst = direction === 'word-first';
      var frontText = showTermFirst ? card.term : card.meaning;
      var backTitle = showTermFirst ? 'Meaning' : 'Word';
      var backText = showTermFirst ? card.meaning : card.term;

      var frontIpa = showTermFirst ? card.ipa : '';
      var backIpa = !showTermFirst ? card.ipa : '';

      var face = el('div', 'background:#fff;border:2px solid ' + COLORS.border + ';border-radius:18px;padding:36px 24px;min-height:140px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;cursor:pointer;');
      face.innerHTML = '<div style="font-family:\'Baloo 2\',sans-serif;font-weight:800;font-size:26px;color:' + COLORS.ink + ';">' + frontText + '</div>'
        + (frontIpa ? '<div style="font-family:\'Nunito\',sans-serif;font-size:14px;color:' + COLORS.teal + ';margin-top:2px;">' + frontIpa + '</div>' : '')
        + (!flipped ? '<div style="font-size:12px;color:' + COLORS.muted + ';margin-top:14px;">tap to reveal</div>' : '');

      if (flipped) {
        var back = el('div', 'margin-top:16px;padding-top:16px;border-top:2px dashed #FFE29A;width:100%;');
        back.innerHTML = '<div style="font-family:\'Baloo 2\',sans-serif;font-weight:700;font-size:12px;color:' + COLORS.orange + ';text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">' + backTitle + '</div>'
          + '<div style="font-size:15px;color:' + COLORS.ink + ';">' + backText + '</div>'
          + (backIpa ? '<div style="font-family:\'Nunito\',sans-serif;font-size:13px;color:' + COLORS.teal + ';margin-top:2px;">' + backIpa + '</div>' : '')
          + (card.example ? '<div style="font-size:13px;color:' + COLORS.muted + ';font-style:italic;margin-top:8px;">' + card.example + '</div>' : '');
        face.appendChild(back);
      }

      face.addEventListener('click', function () {
        flipped = !flipped;
        renderCard();
      });
      cardBox.appendChild(face);

      if (flipped) {
        var gradeRow = el('div', 'display:flex;gap:10px;justify-content:center;margin-top:14px;');
        var againBtn = el('button', 'flex:1;max-width:200px;font-family:\'Baloo 2\',sans-serif;font-weight:700;font-size:13.5px;color:' + COLORS.red + ';background:' + COLORS.redBg + ';border:1.5px solid ' + COLORS.red + ';border-radius:20px;padding:10px 16px;cursor:pointer;', '😵 Didn\'t know');
        var knewBtn = el('button', 'flex:1;max-width:200px;font-family:\'Baloo 2\',sans-serif;font-weight:700;font-size:13.5px;color:' + COLORS.green + ';background:' + COLORS.greenBg + ';border:1.5px solid ' + COLORS.green + ';border-radius:20px;padding:10px 16px;cursor:pointer;', '✅ Knew it');
        againBtn.addEventListener('click', function (e) { e.stopPropagation(); grade(false); });
        knewBtn.addEventListener('click', function (e) { e.stopPropagation(); grade(true); });
        gradeRow.appendChild(againBtn);
        gradeRow.appendChild(knewBtn);
        cardBox.appendChild(gradeRow);
      }
    }

    buildQueue();
    renderCard();
  }

  window.VocabCards = { init: init };
})();
