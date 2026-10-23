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

  // ★ 在這裡維護你的更新紀錄
  const notes = [
    {
      version: 'v1.5.3',
      date: '2026-10-22',
      color: '#d7b6ad',
      changes: [
        '📈 排行榜數值優化：改以用中文顯示',
        '🔄 寵物及玩家升級優化：避免一次飛升太多級導致網頁死機',
      ]
    },
    {
      version: 'v1.5.2',
      date: '2026-10-20',
      color: '#4fc6b2',
      changes: [
        '📈優化按鈕與寶箱判斷'
      ]
    },
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
    },
    {
      version: 'v1.3.0',
      date: '2026-09-28',
      color: '#00897b',
      changes: [
        '🏰 新增「副本模式」與 5 個不同難度的副本。',
        '🏛️ 新增「公會系統」與每日任務。',
        '🐉 新增 8 種寵物與專屬技能。',
        '✨ 新增「突破系統」與里程碑。'
      ]
    },
    {
      version: 'v1.0.0',
      date: '2026-09-01',
      color: '#4fc3f7',
      changes: [
        '⚔️ 遊戲首次發布！',
        '🍇 實裝 10 種惡魔果實與 4 階技能解鎖。',
        '🎭 實裝 12 種職業與轉職系統。',
        '🎽 實裝隨機屬性裝備與武器合成系統。'
      ]
    }
  ];

  let html = `<div class="subtitle" style="text-align:center;margin-bottom:15px;">
    目前版本：<b style="color:#4fc3f7;">v1.5.1</b>
  </div>`;

  notes.forEach(note => {
    html += `<div class="panel" style="border-left: 4px solid ${note.color || '#4fc3f7'}; background: #151520;">`;
    html += `<div class="panel-title" style="color:${note.color || '#4fc3f7'}; margin-bottom:8px;">`;
    html += `${note.version} <span class="subtitle" style="font-weight:normal;">(${note.date})</span>`;
    html += `</div>`;
    html += `<ul style="padding-left: 20px; font-size: 13px; line-height: 1.6; color: #ccc;">`;
    
    // ★ 這裡加了防呆：就算你打成 change，或是漏寫，也不會崩潰
    if (note.changes && Array.isArray(note.changes)) {
      note.changes.forEach(change => {
        html += `<li style="margin-bottom: 6px;">${change}</li>`;
      });
    } else {
      html += `<li style="color:#f44336;">（此版本無更新紀錄或格式錯誤）</li>`;
    }
    
    html += `</ul></div>`;
  });

  c.innerHTML = html;
}
