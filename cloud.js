// ============================================================
//  ★ 帳號系統與雲端存檔 (依賴 Firebase)
// ============================================================

let currentUser = null;

// ══════════════════════════════════════════════════════════
//  監聽登入狀態
// ══════════════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
  if (!window.FB) {
    console.warn('⚠️ Firebase 未載入');
    return;
  }

  window.FB.onAuthChange(window.FB.auth, (user) => {
    currentUser = user;
    updateSyncIndicator();
    
    if (user) {
      console.log('已登入：', user.email);
      loadCloudSave(); // 登入後自動載入雲端存檔
    } else {
      console.log('未登入');
    }
  });
});

// ══════════════════════════════════════════════════════════
//  帳號 UI 渲染
// ══════════════════════════════════════════════════════════
function openCloud() {
  showScreen('screen-cloud');
  renderAccountUI();
}

function renderAccountUI() {
  const c = $('cloudContent');
  if (!currentUser) {
    // 未登入畫面
    c.innerHTML = `
      <div class="cloud-card">
        <div class="panel-title">🔐 登入 / 註冊</div>
        <div class="subtitle" style="margin-bottom:10px;">登入後即可在不同電腦同步存檔</div>
        <div class="editor-row" style="padding:0;border:none;">
          <input type="email" id="accEmail" placeholder="電子郵件" style="margin-bottom:8px;">
        </div>
        <div class="editor-row" style="padding:0;border:none;">
          <input type="password" id="accPassword" placeholder="密碼 (至少 6 碼)" style="margin-bottom:12px;">
        </div>
        <div class="actions">
          <button class="gold" onclick="doLogin()">登入</button>
          <button onclick="doRegister()">註冊新帳號</button>
        </div>
      </div>
      <div class="actions" style="margin-top:10px;">
        <button onclick="backToTown()">← 返回村莊</button>
      </div>
    `;
  } else {
    // 已登入畫面
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
      <div class="actions" style="margin-top:10px;">
        <button onclick="backToTown()">← 返回村莊</button>
      </div>
    `;
  }
}

// ══════════════════════════════════════════════════════════
//  登入 / 註冊 / 登出
// ══════════════════════════════════════════════════════════
async function doRegister() {
  const email = $('accEmail').value.trim();
  const pw = $('accPassword').value;
  if (!email || pw.length < 6) { alert('請輸入有效的 Email 且密碼至少 6 碼'); return; }

  try {
    await window.FB.createUser(window.FB.auth, email, pw);
    alert('註冊成功！已自動登入。');
    renderAccountUI();
  } catch (e) {
    alert('註冊失敗：' + e.message);
  }
}

async function doLogin() {
  const email = $('accEmail').value.trim();
  const pw = $('accPassword').value;
  if (!email || !pw) { alert('請輸入帳號密碼'); return; }

  try {
    await window.FB.login(window.FB.auth, email, pw);
    alert('登入成功！');
    renderAccountUI();
  } catch (e) {
    alert('登入失敗：' + e.message);
  }
}

async function doLogout() {
  await window.FB.logout(window.FB.auth);
  currentUser = null;
  renderAccountUI();
  updateSyncIndicator();
}

// ══════════════════════════════════════════════════════════
//  雲端存讀檔
// ══════════════════════════════════════════════════════════
async function saveToCloud() {
  if (!currentUser) return false;
  try {
    const saveData = {...S, monster:null, inBattle:false, gameOver:false, returnTo3D:false};
    // 使用 UID 作為文件 ID
    await window.FB.setDoc(window.FB.doc(window.FB.db, 'saves', currentUser.uid), saveData);
    console.log('☁ 已上傳至雲端');
    lastSyncStatus = '已同步';
    lastSyncTime = Date.now();
    updateSyncIndicator();
    return true;
  } catch (e) {
    console.error('雲端存檔失敗', e);
    lastSyncStatus = '同步失敗';
    updateSyncIndicator();
    return false;
  }
}

async function loadCloudSave() {
  if (!currentUser) return;
  try {
    const docRef = window.FB.doc(window.FB.db, 'saves', currentUser.uid);
    const docSnap = await window.FB.getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (confirm('☁ 發現雲端存檔，是否載入並覆蓋本機進度？\n(選取消則以本機進度為主)')) {
        Object.assign(S, data);
        S.monster = null; S.inBattle = false; S.gameOver = false;
        saveGame(); // 覆蓋本機
        alert('載入成功！');
        location.reload(); // 重新整理套用
      }
    } else {
      console.log('雲端無存檔，將以目前進度為主。');
      saveToCloud(); // 第一次登入，順便建檔
    }
  } catch (e) {
    console.error('讀取雲端失敗', e);
  }
}

function manualUpload() {
  if (!currentUser) { alert('請先登入'); return; }
  saveToCloud().then(ok => { if (ok) alert('☁ 上傳成功！'); });
}

function manualDownload() {
  if (!currentUser) { alert('請先登入'); return; }
  loadCloudSave();
}

// ══════════════════════════════════════════════════════════
//  狀態列更新
// ══════════════════════════════════════════════════════════
let lastSyncTime = 0;
let lastSyncStatus = '未登入';

function updateSyncIndicator() {
  const el = document.getElementById('syncIndicator');
  if (!el) return;
  
  if (!currentUser) {
    el.innerHTML = `<span style="color:#ff9800;">☁ 未登入</span>`;
    return;
  }

  const timeStr = lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString('zh-TW', { hour12: false }) : '';
  const color = lastSyncStatus === '已同步' ? '#4caf50' : lastSyncStatus === '同步失敗' ? '#f44336' : '#ffd54f';
  el.innerHTML = `<span style="color:${color};">☁ ${lastSyncStatus}${timeStr ? '｜' + timeStr : ''}</span>`;
}

// ══════════════════════════════════════════════════════════
//  自動存檔 (每 30 秒)
// ══════════════════════════════════════════════════════════
setInterval(() => {
  if (currentUser) {
    saveToCloud();
  }
}, 30000);

function backToTown() { updateTownUI(); showScreen('screen-town'); }


// ══════════════════════════════════════════════════════════
//  雲端排行榜 (Firebase 版本)
// ══════════════════════════════════════════════════════════
async function openCloudLeaderboard() {
  showScreen('screen-leaderboard');
  const c = $('leaderboardContent');
  c.innerHTML = `<div class="subtitle" style="text-align:center;padding:20px;">☁ 正在載入全球排行榜...</div>`;

  if (!currentUser) {
    c.innerHTML = `
      <div class="subtitle" style="text-align:center;padding:20px;color:#f44336;">
        ⚠️ 請先登入才能查看排行榜
      </div>
      <div class="actions" style="margin-top:10px;">
        <button onclick="openCloud()">前往登入</button>
        <button onclick="closeLeaderboard()">離開</button>
      </div>
    `;
    return;
  }

  try {
    // 抓取 leaderboard 集合，依照「等級」降冪排序，取前 10 名
    const q = window.FB.query(
      window.FB.collection(window.FB.db, 'leaderboard'),
      window.FB.orderBy('level', 'desc'),
      window.FB.limit(10)
    );
    const querySnapshot = await window.FB.getDocs(q);

    if (querySnapshot.empty) {
      c.innerHTML = `
        <div class="subtitle" style="text-align:center;padding:20px;">目前還沒有任何紀錄，快去成為第一名吧！</div>
        <div class="actions" style="margin-top:10px;">
          <button onclick="closeLeaderboard()">離開</button>
        </div>`;
      return;
    }

    let html = `<div class="subtitle" style="text-align:center;padding:8px;">🏆 全服最高等級 Top 10</div>`;
    
    let rank = 1;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
      const isMe = data.email === currentUser.email;
      const color = isMe ? '#ffd54f' : (rank <= 3 ? '#4fc3f7' : '#ccc');
      
      html += `<div class="lb-row" style="${isMe ? 'border-color:#ffd54f;' : ''}">
        <div class="lb-icon" style="color:${color};font-weight:bold;">${medal}</div>
        <div class="lb-info">
          <div class="lb-name" style="color:${color};">${data.name} ${isMe ? '(你)' : ''}</div>
          <div class="lb-value">Lv.${formatNumber(data.level)}</div>
        </div>
      </div>`;
      rank++;
    });

    html += `<div class="actions" style="margin-top:12px;">
      <button class="gold" onclick="uploadToLeaderboard()">📤 更新我的排名</button>
      <button onclick="openCloudLeaderboard()">🔄 重新整理</button>
      <button onclick="closeLeaderboard()">離開</button>
    </div>`;

    c.innerHTML = html;
  } catch (e) {
    console.error('排行榜載入失敗', e);
    c.innerHTML = `
      <div class="subtitle" style="text-align:center;padding:20px;color:#f44336;">
        ⚠️ 排行榜載入失敗<br><span style="font-size:11px;">${e.message}</span>
      </div>
      <div class="actions" style="margin-top:10px;">
        <button onclick="closeLeaderboard()">離開</button>
      </div>`;
  }
}

async function uploadToLeaderboard() {
  if (!currentUser) return;
  try {
    // 將玩家資料寫入 leaderboard 集合，文件 ID 用 UID 避免重複
    await window.FB.setDoc(
      window.FB.doc(window.FB.db, 'leaderboard', currentUser.uid),
      {
        name: S.playerName || '無名勇者',
        email: currentUser.email,
        level: S.level,
        updatedAt: Date.now()
      }
    );
    alert('📤 排名已更新！');
    openCloudLeaderboard(); // 重新整理畫面
  } catch (e) {
    alert('更新失敗：' + e.message);
  }
}
