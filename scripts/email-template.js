// Branded HTML email wrapper for the weekly digest.
//
// Reuses the exact per-student --accent colors and emoji already assigned
// in dashboard.html / {Student}/index.html, so the email doesn't invent a
// new visual identity — it's the same studio brand, in an inbox.
//
// Structural HTML lives here (table-based, inline styles, for email-client
// compatibility). The creative copy (challenge text, subject) does NOT
// live here — that's a writing task done per run, see scripts/README.md.

const STUDENT_BRAND = {
  micha:     { accent: '#5b8fa8', emoji: '🎮' },
  mehdi:     { accent: '#7a9e87', emoji: '💼' },
  mel:       { accent: '#a89bce', emoji: '🌿' },
  emma:      { accent: '#c0392b', emoji: '🇪🇸' },
  thomas:    { accent: '#8a9099', emoji: '📖' },
  angelique: { accent: '#c49a3c', emoji: '🌸' },
  greg:      { accent: '#2a8a8a', emoji: '💬' },
};

const SITE_ROOT = 'https://durkiman.github.io/Language-Teaching';

/**
 * @param {object} opts
 * @param {string} opts.studentId - lowercase id, must be a key in STUDENT_BRAND
 * @param {string} opts.studentName - display name, e.g. "Micha"
 * @param {string} opts.hookLine - short bold line under the greeting (the "hook")
 * @param {string} opts.challengeText - the task itself, plain text (line breaks become <br>)
 * @param {string} [opts.folder] - repo folder name for the hub link, defaults to studentName
 * @param {string} [opts.lastLessonFile] - filename to deep-link instead of the hub index
 */
function renderDigestEmail({ studentId, studentName, hookLine, challengeText, folder, lastLessonFile }) {
  const brand = STUDENT_BRAND[studentId];
  if (!brand) throw new Error(`No brand entry for student "${studentId}" — add one to STUDENT_BRAND.`);

  const hubUrl = `${SITE_ROOT}/${folder || studentName}/${lastLessonFile || 'index.html'}`;
  const challengeHtml = challengeText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('<br><br>');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  @media (prefers-color-scheme: dark) {
    .email-bg { background-color: #1a1a2e !important; }
    .email-card { background-color: #24243a !important; }
    .email-text { color: #e8e4da !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#f5f0e8;">
<div class="email-bg" style="background-color:#f5f0e8;padding:32px 16px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;">
    <tr><td style="height:4px;background-color:${brand.accent};border-radius:4px 4px 0 0;font-size:0;line-height:0;">&nbsp;</td></tr>
    <tr>
      <td class="email-card" style="background-color:#ffffff;border-radius:0 0 12px 12px;padding:32px 28px;box-shadow:0 2px 12px rgba(0,0,0,0.06);font-family:'DM Sans',Verdana,sans-serif;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:${brand.accent};">Language Studio · Durim</p>
        <h1 class="email-text" style="margin:0 0 20px;font-family:Georgia,'Playfair Display',serif;font-size:24px;font-weight:700;color:#1a1a2e;">${brand.emoji} Hey ${studentName}</h1>
        <p class="email-text" style="margin:0 0 18px;font-size:15px;font-weight:600;color:#1a1a2e;">${hookLine}</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${brand.accent}14;border-left:3px solid ${brand.accent};border-radius:8px;margin-bottom:22px;">
          <tr><td style="padding:16px 18px;font-size:14px;line-height:1.6;color:#333;">${challengeHtml}</td></tr>
        </table>
        <p style="margin:0 0 22px;font-size:13px;color:#888;">Voice note me, or just have it ready in your head for next session.</p>
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr><td style="border-radius:8px;background-color:${brand.accent};">
            <a href="${hubUrl}" style="display:inline-block;padding:11px 22px;font-family:'DM Sans',Verdana,sans-serif;font-size:13px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">Open your lessons →</a>
          </td></tr>
        </table>
        <p style="margin:26px 0 0;padding-top:18px;border-top:1px solid #e8ddd0;font-size:11px;color:#bbb;">Made with care by Durim</p>
      </td>
    </tr>
  </table>
</div>
</body>
</html>`;
}

module.exports = { renderDigestEmail, STUDENT_BRAND, SITE_ROOT };
