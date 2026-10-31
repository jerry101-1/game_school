// ============================================================
//  ★ 雲端同步與排行榜 (Realtime Database 版)
// ============================================================
let currentUser = null;
let lastSyncTime = 0;
let lastSyncStatus = '未登入';

window.addEventListener('DOMContentLoaded', () => {
  if (!window.FB) return;
  window.FB.onAuthChange(window.FB.auth, (user) => {
    currentUser = user;
    updateSyncIndicator();
    if (user) {
      console.log('已登入：', user.email);
      loadCloudSave();
    }
  });
});

function openCloud() {
  showScreen('screen-cloud');
  renderAccountUI();
}

function renderAccountUI() {
  const c = $('cloudContent');
  if (!currentUser) {
    c.innerHTML = `
      <div class="cloud-card">
        <div class="panel-title">🔐 登入 / 註冊</div>
        <div class="subtitle" style="margin-bottom:10px;">登入後即可在不同電腦同步存檔</div>
        <div class="editor-row" style="padding:0;border:none;"><input type="email" id="accEmail" placeholder="電子郵件" style="margin-bottom:8px;"></div>
        <div class="editor-row" style="padding:0;border:none;"><input type="password" id="accPassword" placeholder="密碼 (至少 6 碼)" style="margin-bottom:12px;"></div>
        <div class="actions"><button class="gold" onclick="doLogin()">登入</button><button onclick="doRegister()">註冊新帳號</button></div>
      </div>
      <div class="actions" style="margin-top:10px;"><button onclick="backToTown()">← 返回村莊</button></div>
    `;
  } else {
    c.innerHTML = `
      <div class="cloud-card">
        <div class="panel-title">✅ 已登入</div>
        <div class="stat-row"><span>帳號：</span><span class="val">${currentUser.email}</span></div>
        <div class="stat-row"><span>雲端同步：</span><span class="val">每 30 秒自動上傳</span></div>
        <div class="actions" style="margin-top:12px;">
          <button class="gold" onclick="manualUpload()">📤 立即上傳存檔</button>
          <button onclick="manualDownload()">📥 下載雲端存檔 (覆蓋本機)</button>
          <button class="danger" onclick="doLogout()">🚪 登出</button>
        </div>
      </div>
      <div class="actions" style="margin-top:10px;"><button onclick="backToTown()">← 返回村莊</button></div>
    `;
  }
}

async function doRegister() {
  const email = $('accEmail').value.trim(); const pw = $('accPassword').value;
  if (!email || pw.length < 6) { alert('請輸入有效的 Email 且密碼至少 6 碼'); return; }
  try { await window.FB.createUser(window.FB.auth, email, pw); alert('註冊成功！已自動登入。'); renderAccountUI(); }
  catch (e) { alert('註冊失敗：' + e.message); }
}

async function doLogin() {
  const email = $('accEmail').value.trim(); const pw = $('accPassword').value;
  if (!email || !pw) { alert('請輸入帳號密碼'); return; }
  try { await window.FB.login(window.FB.auth, email, pw); alert('登入成功！'); renderAccountUI(); }
  catch (e) { alert('登入失敗：' + e.message); }
}

async function doLogout() {
  await window.FB.logout(window.FB.auth); currentUser = null; renderAccountUI(); updateSyncIndicator();
}

async function saveToCloud() {
  if (!currentUser) return false;
  try {
    const saveData = {...S, monster:null, inBattle:false, gameOver:false, returnTo3D:false};
    await window.FB.set(window.FB.ref(window.FB.db, 'users/' + currentUser.uid), saveData);
    console.log('☁ 已上傳至雲端');
    lastSyncStatus = '已同步'; lastSyncTime = Date.now(); updateSyncIndicator();
    return true;
  } catch (e) {
    console.error('雲端存檔失敗', e); lastSyncStatus = '同步失敗'; updateSyncIndicator();
    return false;
  }
}

async function loadCloudSave() {
  if (!currentUser) return;
  try {
    const dbRef = window.FB.ref(window.FB.db);
    const snapshot = await window.FB.get(window.FB.child(dbRef, 'users/' + currentUser.uid));
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (confirm('☁ 發現雲端存檔，是否載入並覆蓋本機進度？')) {
        Object.assign(S, data);
        S.monster = null; S.inBattle = false; S.gameOver = false;
        saveGame(); alert('載入成功！'); location.reload();
      }
    } else {
      saveToCloud(); // 第一次登入直接存檔
    }
  } catch (e) { console.error('讀取雲端失敗', e); }
}

function manualUpload() { if (!currentUser) return; saveToCloud().then(ok => { if (ok) alert('☁ 上傳成功！'); }); }
function manualDownload() { if (!currentUser) return; loadCloudSave(); }

function updateSyncIndicator() {
  const el = document.getElementById('syncIndicator');
  if (!el) return;
  if (!currentUser) { el.innerHTML = `<span style="color:#ff9800;">☁ 未登入</span>`; return; }
  const timeStr = lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString('zh-TW', { hour12: false }) : '';
  const color = lastSyncStatus === '已同步' ? '#4caf50' : lastSyncStatus === '同步失敗' ? '#f44336' : '#ffd54f';
  el.innerHTML = `<span style="color:${color};">☁ ${lastSyncStatus}${timeStr ? '｜' + timeStr : ''}</span>`;
}

setInterval(() => { if (currentUser) saveToCloud(); }, 30000);

function backToTown() { updateTownUI(); showScreen('screen-town'); }

// ══════════════════════════════════════════════════════════
//  雲端排行榜 (Realtime Database)
// ══════════════════════════════════════════════════════════
async function openCloudLeaderboard() {
  showScreen('screen-leaderboard');
  const c = $('leaderboardContent');
  c.innerHTML = `<div class="subtitle" style="text-align:center;padding:20px;">☁ 正在載入全球排行榜...</div>`;
  if (!currentUser) {
    c.innerHTML = `<div class="subtitle" style="text-align:center;padding:20px;color:#f44336;">⚠️ 請先登入才能查看排行榜</div>
      <div class="actions" style="margin-top:10px;"><button onclick="openCloud()">前往登入</button><button onclick="closeLeaderboard()">離開</button></div>`;
    return;
  }

  try {
    const dbRef = window.FB.ref(window.FB.db);
    const snapshot = await window.FB.get(window.FB.child(dbRef, 'leaderboard'));
    
    let html = `<div class="subtitle" style="text-align:center;padding:8px;">🏆 全服最高等級 Top 10</div>`;
    
    if (!snapshot.exists()) {
      html += `<div class="subtitle" style="text-align:center;padding:20px;">目前還沒有任何紀錄，快去成為第一名吧！</div>`;
    } else {
      const data = snapshot.val();
      // 將物件轉為陣列並排序
      const list = Object.values(data).sort((a, b) => b.level - a.level).slice(0, 10);
      
      list.forEach((p, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`;
        const isMe = p.uid === currentUser.uid;
        const color = isMe ? '#ffd54f' : (i < 3 ? '#4fc3f7' : '#ccc');
        html += `<div class="lb-row" style="${isMe ? 'border-color:#ffd54f;' : ''}">
          <div class="lb-icon" style="color:${color};font-weight:bold;">${medal}</div>
          <div class="lb-info">
            <div class="lb-name" style="color:${color};">${p.name} ${isMe ? '(你)' : ''}</div>
            <div class="lb-value">Lv.${formatNumber(p.level)}</div>
          </div>
        </div>`;
      });
    }

    html += `<div class="actions" style="margin-top:12px;">
      <button class="gold" onclick="uploadToLeaderboard()">📤 更新我的排名</button>
      <button onclick="openCloudLeaderboard()">🔄 重新整理</button>
      <button onclick="closeLeaderboard()">離開</button>
    </div>`;

    c.innerHTML = html;
  } catch (e) {
    console.error('排行榜載入失敗', e);
    c.innerHTML = `<div class="subtitle" style="text-align:center;padding:20px;color:#f44336;">⚠️ 載入失敗：${e.message}</div>
      <div class="actions" style="margin-top:10px;"><button onclick="closeLeaderboard()">離開</button></div>`;
  }
}

async function uploadToLeaderboard() {
  if (!currentUser) return;
  try {
    await window.FB.set(window.FB.ref(window.FB.db, 'leaderboard/' + currentUser.uid), {
      uid: currentUser.uid,
      name: S.playerName || '無名勇者',
      level: S.level,
      updatedAt: Date.now()
    });
    alert('📤 排名已更新！');
    openCloudLeaderboard();
  } catch (e) {
    alert('更新失敗：' + e.message);
  }
}
