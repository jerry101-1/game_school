// ============================================================
//  ★ 雲端同步 — 已移除前端 Token（避免外洩）
//  目前僅保留「本機排行榜」與同步狀態顯示。
//  若要真正的跨裝置同步，請見文末 Worker 範例。
// ============================================================

let autoSyncTimer = null;
let syncInProgress = false;
let lastSyncTime = 0;
let lastSyncStatus = '本機模式';

// ══════════════════════════════════════════════════════════
//  本機「上傳」= 把目前分數寫進 localStorage 排行榜
// ══════════════════════════════════════════════════════════
async function uploadScore() {
  if (syncInProgress) return;
  syncInProgress = true;
  lastSyncStatus = '同步中...';
  updateSyncIndicator();

  try {
    if (typeof updateLeaderboard === 'function') updateLeaderboard();
    lastSyncTime = Date.now();
    lastSyncStatus = '已同步（本機）';
  } catch (e) {
    console.error('本機同步失敗', e);
    lastSyncStatus = '同步失敗';
  } finally {
    syncInProgress = false;
    updateSyncIndicator();
  }
}

async function downloadLeaderboard() {
  // 回傳 null，讓 openCloudLeaderboard 走「無法載入雲端」分支
  return null;
}

function startAutoSync() {
  if (autoSyncTimer) clearInterval(autoSyncTimer);
  setTimeout(() => uploadScore(), 5000);
  autoSyncTimer = setInterval(() => uploadScore(), 60000);
  console.log('☁ 本機同步已啟動（每 60 秒）');
}

function stopAutoSync() {
  if (autoSyncTimer) { clearInterval(autoSyncTimer); autoSyncTimer = null; }
}

function forceSync() { uploadScore(); }

function updateSyncIndicator() {
  const el = document.getElementById('syncIndicator');
  if (!el) return;
  const timeStr = lastSyncTime
    ? new Date(lastSyncTime).toLocaleTimeString('zh-TW', { hour12: false }) : '';
  const color = lastSyncStatus.includes('失敗') ? '#f44336'
              : lastSyncStatus.includes('已同步') ? '#4caf50' : '#ffd54f';
  el.innerHTML = `<span style="color:${color};">☁ ${lastSyncStatus}${timeStr ? '｜' + timeStr : ''}</span>`;
}

// ══════════════════════════════════════════════════════════
//  全球排行榜畫面（目前僅顯示「本機模式」提示）
// ══════════════════════════════════════════════════════════
async function openCloudLeaderboard() {
  showScreen('screen-leaderboard');
  const c = $('leaderboardContent');
  c.innerHTML = `
    <div class="subtitle" style="text-align:center;padding:20px;color:#ffd54f;">
      ☁ 目前為本機模式<br>
      <span style="font-size:11px;color:#888;">（雲端 Token 已移除，排行榜僅記錄本機成績，日後會加入）</span>
    </div>
    <div class="actions" style="margin-top:10px;">
      <button onclick="renderLeaderboard()">📊 本機紀錄</button>
      <button onclick="closeLeaderboard()">離開</button>
    </div>`;
}
