(function () {
  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function tagRow(label, items) {
    if (!items || !items.length) return '';
    return `<div style="margin:4px 0;font-size:13.5px;"><span style="font-weight:700;color:#1B4B4F;">${esc(label)}:</span> <span style="color:#5C6B7A;">${items.map(esc).join(' · ')}</span></div>`;
  }

  function cardHtml(card) {
    return `
      <div style="background:#fff;border:2px solid #DCEEE2;border-radius:14px;padding:18px 20px;margin:0 0 14px;break-inside:avoid;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap;">
          <span style="background:#0E7C86;color:#fff;font-family:'Baloo 2',sans-serif;font-weight:700;font-size:12px;padding:3px 10px;border-radius:999px;">${esc(card.id)}</span>
          <span style="font-family:'Baloo 2',sans-serif;font-weight:700;font-size:17px;color:#1B4B4F;">${esc(card.title)}</span>
        </div>
        <div style="font-size:14.5px;color:#2B2B2B;margin-bottom:8px;line-height:1.5;">${esc(card.goal)}</div>
        ${tagRow('Functions', card.functions)}
        ${tagRow('Grammar', card.grammar)}
        ${tagRow('Discourse', card.discourse)}
        ${tagRow('Lexis', card.lexis)}
        ${tagRow('Exponents', card.exponents)}
        <div style="background:#FFF6D8;border:2px dashed #F2C94C;border-radius:10px;padding:10px 14px;margin:10px 0 0;font-size:13px;color:#5C4A00;"><strong>Evidence:</strong> ${esc(card.evidence)}</div>
        ${card.skin_examples && card.skin_examples.length ? `<div style="font-size:12.5px;color:#9A9483;margin-top:8px;font-style:italic;">e.g. ${card.skin_examples.map(esc).join(' · ')}</div>` : ''}
        ${card.note ? `<div style="font-size:12px;color:#9A9483;margin-top:6px;">Note: ${esc(card.note)}</div>` : ''}
      </div>
    `;
  }

  const STRAND_COLORS = ['#DCEEE2', '#D9EFEF', '#DCE5FB', '#E9E0FB', '#FBE6D2', '#FADADD'];

  async function renderCurriculumLevel(jsonFile, containerId) {
    const container = document.getElementById(containerId);
    try {
      const res = await fetch(jsonFile);
      if (!res.ok) throw new Error('fetch failed: ' + res.status);
      const data = await res.json();

      const byStrand = {};
      for (const card of data.cards) {
        (byStrand[card.strand] = byStrand[card.strand] || []).push(card);
      }

      container.innerHTML = data.strands.map((strand, i) => {
        const cards = byStrand[strand.id] || [];
        const color = STRAND_COLORS[i % STRAND_COLORS.length];
        return `
          <div style="margin:0 0 34px;">
            <div style="font-family:'Baloo 2',sans-serif;font-weight:700;font-size:20px;color:#0E7C86;border-bottom:3px solid ${color};padding-bottom:8px;margin-bottom:14px;">${esc(strand.title)}</div>
            ${cards.map(cardHtml).join('')}
          </div>
        `;
      }).join('');
    } catch (err) {
      container.innerHTML = '<div style="color:#9A9483;">Could not load curriculum data.</div>';
      console.error('renderCurriculumLevel failed:', err);
    }
  }

  window.renderCurriculumLevel = renderCurriculumLevel;
})();
