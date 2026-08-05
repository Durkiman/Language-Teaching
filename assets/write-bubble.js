/* Shared writing bubble widget.
   Include after write-bubble.css. Injects its own DOM — no markup needed
   in the host page. Storage is namespaced per-page (by pathname), so it
   works standalone without colliding with a page's own localStorage keys. */
(function(){
  var STORE_KEY = 'wb_entries_' + location.pathname;

  function loadEntries(){
    try{ return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
    catch(e){ return []; }
  }
  function saveEntries(entries){
    try{ localStorage.setItem(STORE_KEY, JSON.stringify(entries)); }catch(e){}
  }
  function todayStr(){ return new Date().toISOString().slice(0,10); }

  function build(){
    var overlay = document.createElement('div');
    overlay.className = 'wb-overlay';

    var tab = document.createElement('div');
    tab.className = 'wb-tab';
    tab.textContent = '✍️ Write';

    var panel = document.createElement('div');
    panel.className = 'wb-panel';
    panel.innerHTML =
      '<div class="wb-head"><h2>Writing</h2><button class="wb-close" aria-label="Close">✕</button></div>' +
      '<div class="wb-toolbar">' +
        '<button data-cmd="bold" title="Bold"><b>B</b></button>' +
        '<button data-cmd="italic" title="Italic"><i>I</i></button>' +
        '<button data-cmd="underline" title="Underline"><u>U</u></button>' +
        '<button data-cmd="insertUnorderedList" title="Bullet list">•</button>' +
        '<button data-cmd="removeFormat" title="Clear formatting">✕</button>' +
      '</div>' +
      '<div class="wb-editor" contenteditable="true" data-placeholder="Write here..."></div>' +
      '<div class="wb-actions">' +
        '<button class="wb-filled wb-save">Save</button>' +
        '<button class="wb-export">Export</button>' +
        '<button class="wb-danger wb-clear">Clear all</button>' +
      '</div>' +
      '<div class="wb-log"></div>';

    document.body.appendChild(overlay);
    document.body.appendChild(tab);
    document.body.appendChild(panel);

    var toast = document.createElement('div');
    toast.className = 'wb-toast';
    document.body.appendChild(toast);
    var toastTimer;
    function showToast(msg){
      toast.textContent = msg;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function(){ toast.classList.remove('show'); }, 1600);
    }

    function open(){ panel.classList.add('open'); overlay.classList.add('open'); }
    function close(){ panel.classList.remove('open'); overlay.classList.remove('open'); }

    tab.addEventListener('click', open);
    overlay.addEventListener('click', close);
    panel.querySelector('.wb-close').addEventListener('click', close);

    var editor = panel.querySelector('.wb-editor');
    panel.querySelectorAll('.wb-toolbar button').forEach(function(b){
      b.addEventListener('click', function(){
        editor.focus();
        document.execCommand(b.dataset.cmd, false, null);
      });
    });

    var entries = loadEntries();
    var log = panel.querySelector('.wb-log');
    function render(){
      log.innerHTML = '';
      entries.slice().reverse().forEach(function(e){
        var div = document.createElement('div');
        div.className = 'wb-entry';
        div.innerHTML = '<div class="wb-entry-date">' + e.date + '</div><div class="wb-entry-content">' + e.html + '</div>';
        log.appendChild(div);
      });
    }
    render();

    panel.querySelector('.wb-save').addEventListener('click', function(){
      var html = editor.innerHTML.trim();
      if(!html){ showToast('Nothing to save'); return; }
      entries.push({ date: todayStr(), html: html });
      saveEntries(entries);
      editor.innerHTML = '';
      render();
      showToast('Saved');
    });

    panel.querySelector('.wb-export').addEventListener('click', function(){
      if(!entries.length){ showToast('Nothing to export'); return; }
      var text = entries.map(function(e){
        var tmp = document.createElement('div');
        tmp.innerHTML = e.html;
        return e.date + '\n' + tmp.textContent + '\n';
      }).join('\n');
      var title = (document.title || 'writing').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
      var blob = new Blob([text], { type: 'text/plain' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = title + '-writing-' + todayStr() + '.txt';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast('Exported');
    });

    panel.querySelector('.wb-clear').addEventListener('click', function(){
      if(!confirm('Clear all saved writing entries? This cannot be undone.')) return;
      entries = [];
      saveEntries(entries);
      render();
      showToast('Cleared');
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
