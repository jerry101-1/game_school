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
