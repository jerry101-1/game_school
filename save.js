// ============================================================
//  ★ 存讀檔 — 本地 + 跨電腦（Base64 分享碼）
// ============================================================

const SAVE_KEY = 'rpg_save_v6';

function saveToCloud() {
  openCloud();
  setTimeout(() => exportCloudSave(), 100);
}

function saveGame() {
  try {
    const save = {...S, monster:null, inBattle:false, gameOver:false};
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    log('【系統】遊戲已存檔。', 'system');
  } catch(e) { log('【系統】存檔失敗。', 'lose'); }
}

function loadGame() {
  try {
    localStorage.removeItem('rpg_save_v5');
    const data = localStorage.getItem(SAVE_KEY);
    if (data) {
      const p = JSON.parse(data);
      Object.assign(S, p);
      // 補齊欄位
      if (!S.equipment) S.equipment = {weapon:null,armor:null,accessory:null};
      if (!S.inventory) S.inventory = [];
      if (!S.talents) S.talents = {};
      if (!S.achievements) S.achievements = {};
      if (!S.fruits) S.fruits = {};
      if (S.breakthroughLevel === undefined) S.breakthroughLevel = 0;
      if (S.breakthroughPoints === undefined) S.breakthroughPoints = 0;
      if (!S.breakthroughMilestones) S.breakthroughMilestones = {};
      if (S.roleLevel === undefined) S.roleLevel = 1;
      if (S.roleExp === undefined) S.roleExp = 0;
      if (!S.roleLevels) S.roleLevels = { [S.roleType]: S.roleLevel };
      if (!S.dungeon) S.dungeon = { active:null, floor:0 };
      if (!S.guild) S.guild = { id:null, contrib:0, questProgress:{}, questClaimed:{} };
      if (!S.pets) S.pets = {};
      if (S.activePet === undefined) S.activePet = null;
      // 清空戰鬥暫存
      S.monster = null; S.inBattle = false; S.gameOver = false;
      S.inAbyss = false; S.abyssFloor = 0; S.buttonLocked = false;
      S.dungeon.active = null; S.dungeon.floor = 0;
      return true;
    }
  } catch(e) {}
  return false;
}

// ── 跨電腦存檔（Base64 分享碼） ──
function openCloud() { showScreen('screen-cloud'); renderCloud(); }
function closeCloud() { updateTownUI(); showScreen('screen-town'); }

function renderCloud() {
  const c = $('cloudContent');
  c.innerHTML = `
    <div class="cloud-card">
      <div class="panel-title">☁ 匯出存檔</div>
      <div class="subtitle">將下方文字複製到另一台電腦的遊戲中，即可繼續遊玩。</div>
      <textarea id="cloudExport" readonly style="margin-top:8px;"></textarea>
      <div class="actions" style="margin-top:8px;">
        <button class="gold" onclick="exportCloudSave()">產生分享碼</button>
        <button onclick="copyCloudSave()">📋 複製</button>
      </div>
    </div>
    <div class="cloud-card">
      <div class="panel-title">📥 匯入存檔</div>
      <div class="subtitle">貼上分享碼並匯入。</div>
      <textarea id="cloudImport" placeholder="貼上分享碼..." style="margin-top:8px;"></textarea>
      <div class="actions" style="margin-top:8px;">
        <button class="danger" onclick="importCloudSave()">匯入並覆蓋</button>
      </div>
    </div>
  `;
}

// ── 跨電腦存檔（壓縮版） ──
function exportCloudSave() {
  try {
    const save = {...S, monster:null, inBattle:false, gameOver:false};
    const json = JSON.stringify(save);
    // ★ LZ-String 壓縮 → Base64（比單純 Base64 縮 70%）
    const compressed = LZString.compressToBase64(json);
    const code = 'RPG1:' + compressed;
    $('cloudExport').value = code;
    const origLen = json.length;
    const codeLen = code.length;
    const saved = Math.round((1 - codeLen/origLen) * 100);
    log(`☁ 分享碼已產生（原始 ${origLen} → 壓縮 ${codeLen} 字元，省 ${saved}%）`, 'system');
  } catch(e) { log('產生失敗：' + e.message, 'lose'); }
}

function copyCloudSave() {
  const ta = $('cloudExport');
  if (!ta || !ta.value) { log('請先產生分享碼！', 'lose'); return; }
  ta.select();
  try {
    document.execCommand('copy');
    log('📋 已複製到剪貼簿！', 'win');
  } catch(e) { log('複製失敗，請手動複製。', 'lose'); }
}

function importCloudSave() {
  const code = $('cloudImport').value.trim();
  if (!code) { log('請貼上分享碼！', 'lose'); return; }
  if (!code.startsWith('RPG1:')) {
    log('分享碼格式錯誤（缺少 RPG1: 前綴）', 'lose');
    return;
  }
  if (!confirm('匯入會覆蓋目前進度，確定嗎？')) return;
  try {
    const compressed = code.slice(5);  // 去掉 "RPG1:"
    const json = LZString.decompressFromBase64(compressed);
    if (!json) { log('解壓失敗，分享碼可能損壞。', 'lose'); return; }
    const p = JSON.parse(json);
    Object.assign(S, p);
    // 修復欄位
    if (!S.dungeon) S.dungeon = { active:null, floor:0 };
    if (!S.guild) S.guild = { id:null, contrib:0, questProgress:{}, questClaimed:{} };
    if (!S.pets) S.pets = {};
    S.monster = null; S.inBattle = false; S.gameOver = false;
    S.inAbyss = false; S.abyssFloor = 0; S.buttonLocked = false;
    S.dungeon.active = null; S.dungeon.floor = 0;
    saveGame();
    log('☁ 匯入成功！', 'win');
    updateTownUI();
    closeCloud();
    showScreen('screen-town');
  } catch(e) { log('匯入失敗：' + e.message, 'lose'); }
}
// 快速載入雲端（開場畫面用）
function loadFromCloud() {
  openCloud();
}
