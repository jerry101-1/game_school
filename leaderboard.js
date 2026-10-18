// ============================================================
//  ★ 排行榜系統（本地紀錄）
// ============================================================

const LB_KEY = 'rpg_leaderboard_v1';

// ── 排行榜項目定義 ──
const LB_CATEGORIES = {
  highestLevel:    { name: '最高等級',     icon: '⭐', key: 'level',           format: v => `Lv.${formatNumber(v)}` },
  highestAtk:      { name: '最高攻擊力',   icon: '⚔️', key: 'atk',             format: v => formatNumber(v) },
  highestHp:       { name: '最高 HP',      icon: '🩷', key: 'maxHp',           format: v => formatNumber(v) },
  highestMoney:    { name: '最多金幣',     icon: '💰', key: 'money',           format: v => formatNumber(v) },
  highestAbyss:    { name: '深淵最高層',   icon: '🌀', key: 'abyssBest',       format: v => `第 ${formatNumber(v)} 層` },
  mostKills:       { name: '最多擊殺',     icon: '💀', key: 'killCount',       format: v => formatNumber(v) },
  highestCombo:    { name: '最高連擊',     icon: '🔥', key: 'maxCombo',        format: v => `${formatNumber(v)} 連擊` },
  fastestBoss:     { name: '最快擊敗 BOSS', icon: '👑', key: 'fastestBossTime', format: v => `${formatNumber(v)} 秒` },
  mostFruits:      { name: '最多果實種類', icon: '🍇', key: 'fruitCount',      format: v => `${formatNumber(v)} 種` },
  mostPets:        { name: '最多寵物種類', icon: '🐾', key: 'petCount',        format: v => `${formatNumber(v)} 種` },
};

// ── 載入排行榜 ──
function loadLeaderboard() {
  try {
    const data = localStorage.getItem(LB_KEY);
    return data ? JSON.parse(data) : {};
  } catch(e) { return {}; }
}

// ── 儲存排行榜 ──
function saveLeaderboard(lb) {
  try {
    localStorage.setItem(LB_KEY, JSON.stringify(lb));
  } catch(e) { console.error('排行榜儲存失敗', e); }
}

// ── 更新排行榜 ──
function updateLeaderboard() {
  const lb = loadLeaderboard();
  const playerName = S.playerName || '無名勇者';
  const now = Date.now();
  const newRecords = [];

  const current = {
    level: S.level,
    atk: typeof effAtk === 'function' ? effAtk() : S.atk,
    maxHp: typeof effMaxHp === 'function' ? effMaxHp() : S.maxHp,
    money: S.money,
    abyssBest: S.abyssBest,
    killCount: S.killCount,
    maxCombo: S.maxCombo,
    fastestBossTime: S.fastestBossTime || 99999,
    fruitCount: Object.keys(S.fruits || {}).length,
    petCount: Object.keys(S.pets || {}).length,
  };

  for (const [catId, cat] of Object.entries(LB_CATEGORIES)) {
    const val = current[cat.key];
    if (val === undefined || val === null) continue;
    if (val === 0 && cat.key !== 'killCount') continue;

    const existing = lb[catId];
    const isBetter = cat.key === 'fastestBossTime'
      ? (!existing || val < existing.value)
      : (!existing || val > existing.value);

    if (isBetter) {
      lb[catId] = { value: val, playerName, date: now };
      newRecords.push({ catId, cat, value: val });
    }
  }

  saveLeaderboard(lb);

  // 顯示新紀錄通知
  newRecords.forEach(({ cat, value }) => {
    if (typeof log === 'function') {
      log(`🏆 新紀錄！${cat.icon} ${cat.name}：${cat.format(value)}`, 'ach-text');
    }
  });

  return newRecords;
}

// ── 開啟排行榜畫面 ──
function openLeaderboard() {
  if (typeof showScreen === 'function') showScreen('screen-leaderboard');
  renderLeaderboard();
}
function closeLeaderboard() {
  if (typeof updateTownUI === 'function') updateTownUI();
  if (typeof showScreen === 'function') showScreen('screen-town');
}

function renderLeaderboard() {
  const lb = loadLeaderboard();
  const c = document.getElementById('leaderboardContent');
  if (!c) return;

  let html = `
    <div class="subtitle" style="text-align:center;padding:8px;">
      🏆 你的最佳紀錄
    </div>
    <div class="subtitle" style="text-align:center;font-size:11px;margin-bottom:12px;color:#888;">
      （只會記錄你個人的最高成績）
    </div>
  `;

  for (const [catId, cat] of Object.entries(LB_CATEGORIES)) {
    const record = lb[catId];
    html += `<div class="lb-row">
      <div class="lb-icon">${cat.icon}</div>
      <div class="lb-info">
        <div class="lb-name">${cat.name}</div>
        <div class="lb-value">${record ? cat.format(record.value) : '—'}</div>
      </div>
      ${record ? `<div class="lb-date">${new Date(record.date).toLocaleDateString('zh-TW')}</div>` : ''}
    </div>`;
  }

  // 雲端同步區
  html += `
    <div class="actions" style="margin-top:12px;">
      <button class="gold" onclick="openCloudLeaderboard()">☁ 全球排行榜</button>
      <button onclick="closeLeaderboard()">離開</button>
    </div>
  `;

  c.innerHTML = html;
}

// ── BOSS 計時 ──
function startBossTimer() {
  S.bossStartTime = Date.now();
}
function endBossTimer() {
  if (!S.bossStartTime) return;
  const elapsed = Math.floor((Date.now() - S.bossStartTime) / 1000);
  if (!S.fastestBossTime || elapsed < S.fastestBossTime) {
    S.fastestBossTime = elapsed;
    if (typeof log === 'function') {
      log(`⚡ 新紀錄！最快 BOSS 擊敗：${elapsed} 秒`, 'win');
    }
  }
  S.bossStartTime = null;
}
