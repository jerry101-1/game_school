// ============================================================
//  ★ 存讀檔 — 本地 + 跨電腦（Base64 分享碼/rpg2）
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
      if (!S.dungeon) S.dungeon = { active:null, floor:0, cleared:0 };
      if (S.dungeon.cleared === undefined) S.dungeon.cleared = 0;
      if (!S.gambleLog) S.gambleLog = [];
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

// ── 裝備精簡：匯出時把裝備轉成短格式 ──
function compressItem(item) {
  if (!item) return null;
  return {
    r: item.rarity,
    l: item.level,
    s: item.slot,
    a: item.affixes.map(x => [x.stat, x.val]),
  };
}

// ── 裝備還原 ──
function decompressItem(short) {
  if (!short) return null;
  const item = genEquipment(short.l, short.r);
  item.slot = short.s;
  item.name = SLOT_DATA[short.s].pre[rand(0, SLOT_DATA[short.s].pre.length-1)]
            + SLOT_DATA[short.s].base[rand(0, SLOT_DATA[short.s].base.length-1)];
  item.affixes = short.a.map(([stat, val]) => {
    const pool = AFFIX_POOL.find(p => p.stat === stat);
    const label = pool ? `${pool.label} +${val}${pool.pct?'%':''}` : `${stat} +${val}`;
    return { stat, val, label };
  });
  return item;
}

// ── 跨電腦存檔（組合壓縮版） ──
function exportCloudSave() {
  try {
    const save = JSON.parse(JSON.stringify({...S, monster:null, inBattle:false, gameOver:false}));

    // 背包只保留稀有度 ≥ 3 的，並壓縮
    if (save.inventory) {
      save.inventory = save.inventory
        .filter(it => it.rarity >= 3)
        .map(compressItem);
    }
    // 已裝備的壓縮
    if (save.equipment) {
      for (const slot of ['weapon','armor','accessory']) {
        save.equipment[slot] = compressItem(save.equipment[slot]);
      }
    }

    const json = JSON.stringify(save);
    const compressed = LZString.compressToBase64(json);
    $('cloudExport').value = 'RPG2:' + compressed;

    const saved = Math.round((1 - (compressed.length+5)/json.length) * 100);
    log(`☁ 分享碼已產生（省 ${saved}%）`, 'system');
  } catch(e) { log('產生失敗：' + e.message, 'lose'); }
}

function importCloudSave() {
  const code = $('cloudImport').value.trim();
  if (!code) { log('請貼上分享碼！', 'lose'); return; }

  let json;
  if (code.startsWith('RPG2:')) {
    json = LZString.decompressFromBase64(code.slice(5));
  } else if (code.startsWith('RPG1:')) {
    json = LZString.decompressFromBase64(code.slice(5));
  } else {
    log('分享碼格式錯誤', 'lose');
    return;
  }

  if (!json) { log('解壓失敗，分享碼可能損壞。', 'lose'); return; }
  if (!confirm('匯入會覆蓋目前進度，確定嗎？')) return;

  try {
    const p = JSON.parse(json);

    // 還原裝備
    if (p.inventory && p.inventory[0] && p.inventory[0].r !== undefined) {
      p.inventory = p.inventory.map(decompressItem).filter(Boolean);
    }
    if (p.equipment) {
      for (const slot of ['weapon','armor','accessory']) {
        if (p.equipment[slot] && p.equipment[slot].r !== undefined) {
          p.equipment[slot] = decompressItem(p.equipment[slot]);
        }
      }
    }

    Object.assign(S, p);
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
