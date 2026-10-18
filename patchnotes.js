// ============================================================
//  ★ 更新日誌系統
// ============================================================

function openPatchNotes() {
  showScreen('screen-patch');
  renderPatchNotes();
}

function closePatchNotes() {
  updateTownUI();
  showScreen('screen-town');
}

function renderPatchNotes() {
  const c = document.getElementById('patchContent');
  if (!c) return;

  const notes = [
    {
      version: 'v1.5.1',
      date: '2026-10-15',
      color: '#ba68c8',
      changes: [
        '🌟 轉生系統改善：加入 X1, X10, X100, Max 按鈕，不用再點到手痠。',
        '📈 排行榜數值優化：支援 K, M, B, T 等單位縮寫，解決數字爆版問題。'
      ]
    },
    {
      version: 'v1.5.0',
      date: '2026-10-15',
      color: '#4caf50',
      changes: [
        '🌟 新增「無限轉生」系統：滿等後可重置換取永久加成。',
        '📈 加入科學記號與單位格式化（K, M, B, T），解決後期數值爆版。',
        '📜 新增「更新日誌」功能（就是你現在看到的這個）。',
        '🔄 優化「戰鬥系統」，修復打完怪按鈕卡死的問題。',
        '🔊 自動戰鬥現在會自動處理連擊爆發與果實技能。'
      ]
    },
    {
      version: 'v1.4.0',
      date: '2026-10-10',
      color: '#f9a825',
      changes: [
        '🎰 新增「賭場系統」，提供 8 種賭博小遊戲。',
        '🏆 新增「排行榜」與 GitHub Gist 雲端自動同步。',
        '☁️ 雲端存檔導入 LZ-String 壓縮，分享碼縮小 70%。',
        '🐾 優化寵物出戰 AI，現在會更頻繁地觸發被動效果。'
      ]
    }
  ];

  let html = `<div class="subtitle" style="text-align:center;margin-bottom:15px;">
    目前版本：<b style="color:#4fc3f7;">v1.5.1</b>
  </div>`;

  notes.forEach(note => {
    html += `<div class="panel" style="border-left: 4px solid ${note.color}; background: #151520;">`;
    html += `<div class="panel-title" style="color:${note.color}; margin-bottom:8px;">`;
    html += `${note.version} <span class="subtitle" style="font-weight:normal;">(${note.date})</span>`;
    html += `</div>`;
    html += `<ul style="padding-left: 20px; font-size: 13px; line-height: 1.6; color: #ccc;">`;
    note.changes.forEach(change => {
      html += `<li style="margin-bottom: 6px;">${change}</li>`;
    });
    html += `</ul></div>`;
  });

  c.innerHTML = html;
}
