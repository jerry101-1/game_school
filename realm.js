// ============================================================
//  ★ 境界系統與飛升（後期專屬）
// ============================================================

const REALMS = [
  { name: '凡人', mult: 1 },
  { name: '練氣期', mult: 100 },         // 10萬
  { name: '築基期', mult: 10000 },        // 100萬
  { name: '金丹期', mult: 1000000 },      // 1億
  { name: '元嬰期', mult: 100000000 },    // 100億
  { name: '化神期', mult: 10000000000 },  // 1000億
  { name: '煉虛期', mult: 1e12 },         // 1兆
  { name: '合體期', mult: 1e14 },         // 100兆
  { name: '大乘期', mult: 1e16 },         // 1京
  { name: '渡劫期', mult: 1e18 },         // 1垓
  { name: '仙人',   mult: 1e20 },         // 100垓
];

function openRealm() {
  showScreen('screen-realm');
  renderRealm();
}

function renderRealm() {
  const c = $('realmContent');
  // 用攻擊力來算戰力最直覺
  const totalPower = effAtk();
  let currentRealm = 0;
  for (let i = 0; i < REALMS.length; i++) {
    if (totalPower >= REALMS[i].mult * 100000) currentRealm = i;
    else break;
  }

  let html = `
    <div class="panel" style="text-align:center; border-color:#9c27b0; background:linear-gradient(135deg,#1a0b1a,#2a1a2a);">
      <div class="panel-title" style="color:#e1bee7; justify-content:center;">☯️ 當前境界</div>
      <div style="font-size:2em; color:#ce93d8; font-weight:bold; margin:10px 0;">${REALMS[currentRealm].name}</div>
      <div class="subtitle">目前戰力（攻擊力）：${formatNumber(totalPower)}</div>
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
        目前轉生次數：<b style="color:#ffd54f;">${S.rebirthCount || 0} / 10</b><br>
        目前仙緣點數：<b style="color:#4fc3f7;">${S.ascendPoints || 0}</b>
      </div>
      
      <button class="danger" style="width:100%; margin-top:15px; padding:12px;" 
        ${(S.rebirthCount >= 10) ? '' : 'disabled'} onclick="doAscend()">
        立即飛升 (獲得 ${Math.floor((S.rebirthCount || 0) / 2)} 仙緣點數)
      </button>
    </div>

    <div class="panel" style="margin-top:15px; border-color:#4fc3f7;">
      <div class="panel-title" style="color:#4fc3f7;">✨ 仙緣特權 (永久生效)</div>
      <div class="subtitle">消耗仙緣點數，購買永久被動。</div>
      <div class="talent-item">
        <div class="talent-info">
          <div class="talent-name">🌸 仙體覺醒</div>
          <div class="talent-desc">永久全屬性 +100% (目前已覺醒: ${S.ascendAtkBonus || 0} 次)</div>
        </div>
        <button class="talent small" onclick="buyAscendBonus('atk')">1 點</button>
      </div>
      <div class="talent-item">
        <div class="talent-info">
          <div class="talent-name">💰 財富法則</div>
          <div class="talent-desc">永久經驗與金幣 +100% (目前已覺醒: ${S.ascendDropBonus || 0} 次)</div>
        </div>
        <button class="talent small" onclick="buyAscendBonus('drop')">1 點</button>
      </div>
    </div>
  `;
  c.innerHTML = html;
}

function doAscend() {
  if (S.rebirthCount < 10) { log('轉生次數不足，無法飛升！', 'lose'); return; }
  const pointsGained = Math.floor(S.rebirthCount / 2);
  if (!confirm(`確定要飛升嗎？\n\n你將失去當前所有進度，換取 ${pointsGained} 仙緣點數！`)) return;

  S.ascendPoints = (S.ascendPoints || 0) + pointsGained;
  S.rebirthCount = 0;
  S.rebirthPoints = 0;
  S.rebirthBonusAtk = 0;
  S.rebirthBonusHp = 0;
  S.rebirthBonusExp = 0;
  S.rebirthBonusGold = 0;
  
  // 重置回初始狀態 (呼叫你原本的重置邏輯)
  S.level = 1; S.exp = 0; S.expNeeded = 100;
  const role = ROLES[S.roleType];
  S.maxHp = role.hp; S.hp = role.hp;
  S.atk = role.atk; S.def = role.def;
  S.money = 0; S.potion = 3; S.chapter = 1;
  S.breakthroughLevel = 0; S.breakthroughPoints = 0;
  S.fruits = {}; S.inventory = []; S.equipment = {weapon:null,armor:null,accessory:null};
  
  log(`🚀 飛升成功！獲得 ${pointsGained} 仙緣點數。`, 'win');
  saveGame();
  updateTownUI();
  showScreen('screen-town');
}

// 購買仙緣特權
function buyAscendBonus(type) {
  if (!S.ascendPoints || S.ascendPoints <= 0) { log('沒有仙緣點數！', 'lose'); return; }
  
  S.ascendPoints--;
  if (type === 'atk') {
    S.ascendAtkBonus = (S.ascendAtkBonus || 0) + 1;
    log(`✨ 仙體覺醒成功！永久全屬性 +100%（目前 ${S.ascendAtkBonus * 100}%）`, 'win');
  } else if (type === 'drop') {
    S.ascendDropBonus = (S.ascendDropBonus || 0) + 1;
    log(`💰 財富法則成功！永久掉落 +100%（目前 ${S.ascendDropBonus * 100}%）`, 'win');
  }
  
  renderRealm();
  updateTownUI();
}
