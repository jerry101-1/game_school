// ============================================================
//  ★ 境界系統與飛升
// ============================================================

const REALMS = [
  { name: '凡人', mult: 1 },
  { name: '練氣期', mult: 10 },
  { name: '築基期', mult: 50 },
  { name: '金丹期', mult: 200 },
  { name: '元嬰期', mult: 1000 },
  { name: '化神期', mult: 5000 },
  { name: '煉虛期', mult: 20000 },
  { name: '合體期', mult: 100000 },
  { name: '大乘期', mult: 500000 },
  { name: '渡劫期', mult: 2000000 },
  { name: '仙人',   mult: 10000000 },
];

function openRealm() {
  showScreen('screen-realm');
  renderRealm();
}

function renderRealm() {
  const c = $('realmContent');
  const totalPower = effAtk() + effDef() + effMaxHp();
  let currentRealm = 0;
  for (let i = 0; i < REALMS.length; i++) {
    if (totalPower >= REALMS[i].mult * 100000) currentRealm = i;
    else break;
  }

  let html = `
    <div class="panel" style="text-align:center; border-color:#9c27b0; background:linear-gradient(135deg,#1a0b1a,#2a1a2a);">
      <div class="panel-title" style="color:#e1bee7; justify-content:center;">☯️ 當前境界</div>
      <div style="font-size:2em; color:#ce93d8; font-weight:bold; margin:10px 0;">${REALMS[currentRealm].name}</div>
      <div class="subtitle">總戰力：${formatNumber(totalPower)}</div>
      ${currentRealm < REALMS.length - 1 ? `
        <div class="subtitle" style="margin-top:10px;">下一境界需要戰力：${formatNumber(REALMS[currentRealm + 1].mult * 100000)}</div>
      ` : '<div class="subtitle" style="margin-top:10px;">已達最高境界！</div>'}
    </div>

    <div class="panel" style="margin-top:15px;">
      <div class="panel-title">🚀 飛升仙界</div>
      <div class="subtitle">當你轉生次數達到 10 次以上，可以進行飛升。</div>
      <div class="subtitle" style="color:#ff5252;">飛升將重置所有等級、轉生點數、果實、裝備。</div>
      <div class="subtitle" style="color:#4caf50;">你將獲得「仙緣點數」，解鎖永久特權。</div>
      
      <div style="margin-top:10px; text-align:center;">
        目前轉生次數：<b style="color:#ffd54f;">${S.rebirthCount || 0} / 10</b>
      </div>
      
      <button class="danger" style="width:100%; margin-top:15px; padding:12px;" 
        ${(S.rebirthCount >= 10) ? '' : 'disabled'} onclick="doAscend()">
        立即飛升 (獲得 ${Math.floor((S.rebirthCount || 0) / 2)} 仙緣點數)
      </button>
    </div>
  `;
  c.innerHTML = html;
}

function doAscend() {
  if (S.rebirthCount < 10) { log('轉生次數不足，無法飛升！', 'lose'); return; }
  if (!confirm('確定要飛升嗎？你將失去當前所有進度，換取仙緣點數！')) return;

  S.ascendPoints = (S.ascendPoints || 0) + Math.floor(S.rebirthCount / 2);
  S.rebirthCount = 0;
  S.rebirthPoints = 0;
  S.rebirthBonusAtk = 0;
  S.rebirthBonusHp = 0;
  S.rebirthBonusExp = 0;
  S.rebirthBonusGold = 0;
  
  // 重置到新手狀態 (呼叫你原本的 startGame 或重置邏輯)
  S.level = 1; S.exp = 0; S.expNeeded = 100;
  S.maxHp = 150; S.hp = 150; S.atk = 35; S.def = 9;
  S.money = 0; S.potion = 3; S.chapter = 1;
  S.breakthroughLevel = 0; S.breakthroughPoints = 0;
  S.fruits = {}; S.inventory = []; S.equipment = {weapon:null,armor:null,accessory:null};
  
  log(`🚀 飛升成功！獲得 ${Math.floor(S.rebirthCount / 2)} 仙緣點數。`, 'win');
  saveGame();
  updateTownUI();
  showScreen('screen-town');
}
