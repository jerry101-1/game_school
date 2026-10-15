// ============================================================
//  ★ 雲端自動同步（GitHub Gist 版本）
// ============================================================


const GITHUB_TOKEN = ['ghp_RgWbduW28hL', 'ni9Qytq26EGjyAEdnsg3AJTKi'].join('');
const GIST_ID = 'd7afa8f9089d303f050c01d0363f05b9';

// 自動同步設定
const AUTO_SYNC_INTERVAL = 60000; // 60 秒上傳一次（GitHub 建議不要太頻繁）
let autoSyncTimer = null;
let syncInProgress = false;
let lastSyncTime = 0;
let lastSyncStatus = '未同步';

// ══════════════════════════════════════════════════════════
//  讀取雲端資料
// ══════════════════════════════════════════════════════════
async function fetchGist() {
  if (!GITHUB_TOKEN || GITHUB_TOKEN.includes('請換成')) {
    console.warn('⚠️ 未設定 GITHUB_TOKEN');
    return null;
  }
  if (!GIST_ID || GIST_ID.includes('請換成')) {
    console.warn('⚠️ 未設定 GIST_ID');
    return null;
  }

  try {
    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
      },
    });
    if (!res.ok) throw new Error('讀取失敗：' + res.status);
    const data = await res.json();
    const content = data.files['rpg-leaderboard.json'].content;
    return JSON.parse(content);
  } catch(e) {
    console.error('讀取 Gist 失敗', e);
    return null;
  }
}

// ══════════════════════════════════════════════════════════
//  上傳雲端資料
// ══════════════════════════════════════════════════════════
async function updateGist(content) {
  try {
    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: {
          'rpg-leaderboard.json': {
            content: JSON.stringify(content, null, 2),
          },
        },
      }),
    });
    if (!res.ok) throw new Error('更新失敗：' + res.status);
    return true;
  } catch(e) {
    console.error('更新 Gist 失敗', e);
    return false;
  }
}

// ══════════════════════════════════════════════════════════
//  上傳分數
// ══════════════════════════════════════════════════════════
async function uploadScore() {
  if (syncInProgress) return;
  if (!GITHUB_TOKEN || GITHUB_TOKEN.includes('請換成')) return;

  syncInProgress = true;
  lastSyncStatus = '同步中...';
  updateSyncIndicator();

  try {
    // 先讀取現有資料
    let cloud = await fetchGist();
    if (!cloud) cloud = { leaderboard: {}, players: {} };
    if (!cloud.leaderboard) cloud.leaderboard = {};
    if (!cloud.players) cloud.players = {};

    // 準備我的分數
    const playerName = S.playerName || '無名勇者';
    const myScore = {
      name: playerName,
      level: S.level,
      atk: effAtk(),
      maxHp: effMaxHp(),
      money: S.money,
      abyssBest: S.abyssBest,
      killCount: S.killCount,
      maxCombo: S.maxCombo,
      fruitCount: Object.keys(S.fruits || {}).length,
      petCount: Object.keys(S.pets || {}).length,
      updatedAt: Date.now(),
    };

    // 更新玩家資料
    cloud.players[playerName] = myScore;

    // 更新各項目 Top 10
    const categories = ['level', 'atk', 'maxHp', 'money', 'abyssBest', 'killCount', 'maxCombo'];
    for (const cat of categories) {
      if (!cloud.leaderboard[cat]) cloud.leaderboard[cat] = [];
      const list = cloud.leaderboard[cat];
      const existing = list.findIndex(p => p.name === playerName);
      const entry = { name: playerName, value: myScore[cat], date: Date.now() };

      if (existing >= 0) {
        // 只在新分數更高時更新
        if (myScore[cat] > list[existing].value) {
          list[existing] = entry;
        }
      } else {
        list.push(entry);
      }
      list.sort((a, b) => b.value - a.value);
      cloud.leaderboard[cat] = list.slice(0, 10);
    }

    // 上傳
    const ok = await updateGist(cloud);
    if (!ok) throw new Error('上傳失敗');

    lastSyncTime = Date.now();
    lastSyncStatus = '已同步';
    console.log('☁ 已上傳分數', myScore);
  } catch(e) {
    console.error('上傳失敗', e);
    lastSyncStatus = '同步失敗';
  } finally {
    syncInProgress = false;
    updateSyncIndicator();
  }
}

// ══════════════════════════════════════════════════════════
//  下載排行榜
// ══════════════════════════════════════════════════════════
async function downloadLeaderboard() {
  return await fetchGist();
}

// ══════════════════════════════════════════════════════════
//  自動同步
// ══════════════════════════════════════════════════════════
function startAutoSync() {
  if (autoSyncTimer) clearInterval(autoSyncTimer);

  // 啟動時先上傳一次（延遲 5 秒避免卡開場）
  setTimeout(() => uploadScore(), 5000);

  // 每 60 秒上傳一次
  autoSyncTimer = setInterval(() => {
    uploadScore();
  }, AUTO_SYNC_INTERVAL);

  console.log('☁ 自動同步已啟動（每 60 秒）');
}

function stopAutoSync() {
  if (autoSyncTimer) {
    clearInterval(autoSyncTimer);
    autoSyncTimer = null;
    console.log('☁ 自動同步已停止');
  }
}

function forceSync() {
  uploadScore();
}

// ══════════════════════════════════════════════════════════
//  UI 同步狀態
// ══════════════════════════════════════════════════════════
function updateSyncIndicator() {
  const el = document.getElementById('syncIndicator');
  if (!el) return;
  const timeStr = lastSyncTime
    ? new Date(lastSyncTime).toLocaleTimeString('zh-TW', { hour12: false })
    : '';
  const color = lastSyncStatus === '已同步' ? '#4caf50'
              : lastSyncStatus === '同步失敗' ? '#f44336'
              : '#ffd54f';
  el.innerHTML = `<span style="color:${color};">☁ ${lastSyncStatus}${timeStr ? '｜' + timeStr : ''}</span>`;
}

// ══════════════════════════════════════════════════════════
//  全球排行榜畫面
// ══════════════════════════════════════════════════════════
async function openCloudLeaderboard() {
  showScreen('screen-leaderboard');
  const c = $('leaderboardContent');
  c.innerHTML = `<div class="subtitle" style="text-align:center;padding:20px;">
    ☁ 正在載入雲端排行榜...
  </div>`;

  const cloud = await downloadLeaderboard();
  if (!cloud || !cloud.leaderboard) {
    c.innerHTML = `
      <div class="subtitle" style="text-align:center;padding:20px;color:#f44336;">
        ⚠️ 無法載入雲端排行榜<br>
        <span style="font-size:11px;">請確認 GITHUB_TOKEN 和 GIST_ID 已設定正確</span>
      </div>
      <div class="actions" style="margin-top:10px;">
        <button onclick="renderLeaderboard()">回本地排行榜</button>
        <button onclick="closeLeaderboard()">離開</button>
      </div>
    `;
    return;
  }

  const CATEGORIES = {
    level: { name: '最高等級', icon: '⭐', format: v => `Lv.${v}` },
    atk: { name: '最高攻擊力', icon: '⚔️', format: v => v.toLocaleString() },
    maxHp: { name: '最高 HP', icon: '🩷', format: v => v.toLocaleString() },
    money: { name: '最多金幣', icon: '💰', format: v => v.toLocaleString() },
    abyssBest: { name: '深淵最高層', icon: '🌀', format: v => `第 ${v} 層` },
    killCount: { name: '最多擊殺', icon: '💀', format: v => v.toLocaleString() },
    maxCombo: { name: '最高連擊', icon: '🔥', format: v => `${v} 連擊` },
  };

  let html = `<div class="subtitle" style="text-align:center;padding:8px;">
    ☁ 全球排行榜
  </div>
  <div class="subtitle" style="text-align:center;font-size:11px;color:#888;margin-bottom:12px;">
    更新時間：${new Date().toLocaleTimeString('zh-TW', { hour12: false })}
  </div>`;

  for (const [catId, cat] of Object.entries(CATEGORIES)) {
    const list = cloud.leaderboard[catId] || [];
    if (list.length === 0) continue;

    html += `<div class="panel" style="margin:8px 0;">
      <div class="panel-title">${cat.icon} ${cat.name}</div>`;
    list.slice(0, 10).forEach((p, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`;
      const isMe = p.name === S.playerName;
      const color = isMe ? '#ffd54f' : (i < 3 ? '#4fc3f7' : '#ccc');
      html += `<div class="lb-row" style="${isMe ? 'border-color:#ffd54f;' : ''}">
        <div class="lb-icon" style="color:${color};font-weight:bold;">${medal}</div>
        <div class="lb-info">
          <div class="lb-name" style="color:${color};">${p.name}</div>
          <div class="lb-value">${cat.format(p.value)}</div>
        </div>
      </div>`;
    });
    html += `</div>`;
  }

  html += `<div class="actions" style="margin-top:12px;">
    <button class="gold" onclick="forceSync()">☁ 立即上傳</button>
    <button onclick="openCloudLeaderboard()">🔄 重新整理</button>
    <button onclick="renderLeaderboard()">📊 本地紀錄</button>
    <button onclick="closeLeaderboard()">離開</button>
  </div>`;

  c.innerHTML = html;
}
