// ============================================================
//  ★ 寵物系統
//  抽寵 → 出戰 → 自動攻擊 → 升級
// ============================================================

function openPet() { showScreen('screen-pet'); renderPet(); }
function closePet() { updateTownUI(); showScreen('screen-town'); }

function renderPet() {
  const c = $('petContent');
  const owned = Object.keys(S.pets);

  if (!owned.length) {
    c.innerHTML = `<div class="subtitle" style="text-align:center;padding:20px;">
      🐾 還沒有寵物，去打副本或購買寵物蛋吧！<br>
      <button class="pet small" onclick="buyPetEgg()" style="margin-top:12px;">🥚 買寵物蛋（5000 金）</button>
    </div>`;
    return;
  }

  // 出戰中
  let html = '';
  if (S.activePet && S.pets[S.activePet]) {
    const p = PETS[S.activePet];
    const pet = S.pets[S.activePet];
    html += `<div class="pet-card active">
      <div class="pet-name">${p.icon} ${p.name} Lv.${formatNumber(pet.level)} <span class="badge pet">出戰中</span></div>
      <div class="pet-lv">經驗：${formatNumber(pet.exp)} / ${formatNumber(petExpNeeded(pet.level))}</div>
      <div class="pet-skill">技能：${p.skill.name}｜${p.skill.desc}</div>
      <div class="pet-skill">被動：${p.passive.name}｜${p.passive.desc}</div>
      <div class="subtitle" style="margin-top:4px;">攻擊：${formatNumber(getPetAtk())}｜HP：${formatNumber(getPetHp())}</div>
      
      <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;">
        <button class="gold small" onclick="unequipPet()">收回</button>
        <button class="potion small" onclick="buyPetLevel()">💰 花金幣升級</button>
      </div>
    </div>`;
  }

  // 擁有列表
  html += `<div class="panel" style="margin-top:12px;">
    <div class="panel-title">🐾 擁有的寵物</div>`;
  owned.forEach(id => {
    const p = PETS[id];
    const pet = S.pets[id];
    const isActive = S.activePet === id;
    html += `<div class="pet-card ${isActive?'active':''}">
      <div class="pet-name">${p.icon} ${p.name} Lv.${pet.level}</div>
      <div class="pet-lv">經驗：${pet.exp} / ${petExpNeeded(pet.level)}</div>
      <div class="pet-skill">${p.skill.name}｜${p.skill.desc}</div>
      <div class="pet-skill">被動：${p.passive.desc}</div>
      <div style="margin-top:8px;">
        ${isActive ? '<button class="gold small" disabled>出戰中</button>'
                   : `<button class="pet small" onclick="equipPet('${id}')">出戰</button>`}
      </div>
    </div>`;
  });
  html += `</div>`;

  // 抽寵
  html += `<div class="actions" style="margin-top:12px;">
    <button class="pet" onclick="buyPetEgg()">🥚 買寵物蛋（5000 金）</button>
  </div>`;

  c.innerHTML = html;
}

// 寵物升級所需經驗（稍微調低，讓後期好升一點）
function petExpNeeded(lv) { 
  return Math.floor(100 * Math.pow(lv, 1.3)); 
}

// 獲得寵物經驗
function gainPetExp(baseExp) {
  if (!S.activePet || !S.pets[S.activePet]) return;
  const pet = S.pets[S.activePet];
  const p = PETS[S.activePet];
  
  // ★ 後期優化：寵物吸收的經驗會隨著主人等級放大
  const finalExp = Math.floor(baseExp * (1 + S.level * 0.1));
  
  pet.exp += finalExp;
  
  let leveled = false;
  while (pet.exp >= petExpNeeded(pet.level)) {
    pet.exp -= petExpNeeded(pet.level);
    pet.level++;
    leveled = true;
    // 每升 100 級提示一次，避免洗頻
    if (pet.level % 100 === 0) {
      log(`🐾 ${p.name} 升到了 Lv.${formatNumber(pet.level)}！`, 'pet-text');
    }
  }
  
  if (leveled && pet.level < 100) {
    log(`🐾 ${p.name} 升到了 Lv.${pet.level}！`, 'pet-text');
  }
}

function pickPet() {
  const total = PET_POOL.reduce((s,p)=>s+p.weight,0);
  let r = Math.random() * total;
  for (const p of PET_POOL) { r -= p.weight; if (r <= 0) return p.id; }
  return PET_POOL[0].id;
}
function buyPetEgg() {
  if (S.money < 5000) { log('金幣不足！需要 5000 金。', 'lose'); return; }
  S.money -= 5000;
  grantRandomPet();
  renderPet();
  updateTownUI();
  checkAchievements();
}
function equipPet(id) {
  S.activePet = id;
  log(`🐾 ${PETS[id].name} 出戰！`, 'pet-text');
  renderPet();
  updateTownUI();
}
function unequipPet() {
  S.activePet = null;
  log(`🐾 收回寵物`, 'pet-text');
  renderPet();
  updateTownUI();
}

// ── 寵物戰鬥數值 ──
function getPetAtk() {
  if (!S.activePet || !S.pets[S.activePet]) return 0;
  const p = PETS[S.activePet];
  const pet = S.pets[S.activePet];
  const baseAtk = p.baseAtk * (1 + (pet.level - 1) * 0.2);
  
  // ★ 寵物攻擊力 = 基礎 * 主人的轉生攻擊加成 * 主人的突破攻擊加成
  const rebirthMult = 1 + (S.rebirthBonusAtk || 0) / 100;
  const breakMult = 1 + (S.breakthroughLevel * 2) / 100;
  
  return Math.floor(baseAtk * rebirthMult * breakMult);
}

function getPetHp() {
  if (!S.activePet || !S.pets[S.activePet]) return 0;
  const p = PETS[S.activePet];
  const pet = S.pets[S.activePet];
  const baseHp = p.baseHp * (1 + (pet.level - 1) * 0.2);
  
  const rebirthMult = 1 + (S.rebirthBonusHp || 0) / 100;
  const breakMult = 1 + (S.breakthroughLevel * 2) / 100;
  
  return Math.floor(baseHp * rebirthMult * breakMult);
}

// 戰鬥中寵物自動攻擊（每回合 30% 機率觸發）
function petAutoAttack() {
  if (!S.activePet || !S.pets[S.activePet]) return;
  if (!S.inBattle || S.gameOver) return;
  if (!roll(30)) return;

  const p = PETS[S.activePet];
  const pet = S.pets[S.activePet];
  const dmg = Math.round(getPetAtk() * p.skill.mult);
  S.monster.hp -= dmg;
  log(`🐾 ${p.name} 使用【${p.skill.name}】，造成 ${dmg} 點傷害！`, 'pet-text');

  // 寵物技能附加效果
  const eff = p.skill.effect;
  if (eff === 'burn') { S.burnTurns = 3; S.burnDamage = Math.floor(effMaxHp()*0.02) + 5; }
  if (eff === 'bleed') { S.poisonTurns = 3; S.poisonDamage = Math.floor(effMaxHp()*0.03); }
  if (eff === 'lifesteal') {
    const heal = Math.floor(dmg * 0.3);
    S.hp = Math.min(effMaxHp(), S.hp + heal);
  }
  if (eff === 'all') {
    S.burnTurns = 3; S.poisonTurns = 3;
    S.burnDamage = Math.floor(effMaxHp()*0.02) + 5;
    S.poisonDamage = Math.floor(effMaxHp()*0.03);
  }
}

// 戰鬥畫面顯示寵物
function renderPetBattleBar() {
  const bar = $('petBattleBar');
  if (!bar) return;
  if (!S.activePet || !S.pets[S.activePet]) {
    bar.innerHTML = '';
    return;
  }
  const p = PETS[S.activePet];
  const pet = S.pets[S.activePet];
  bar.innerHTML = `<span class="badge pet">${p.icon} ${p.name} Lv.${pet.level}</span>
    <span class="subtitle" style="margin-left:8px;">攻擊 ${getPetAtk()}｜HP ${getPetHp()}</span>`;
}

// 在怪物回合前插入寵物攻擊（由 battle.js 呼叫）

// ── 花金幣直接幫寵物升級（後期專屬）──
function buyPetLevel() {
  if (!S.activePet || !S.pets[S.activePet]) return;
  const pet = S.pets[S.activePet];
  const p = PETS[S.activePet];
  
  // 每次花費 = 寵物當前等級 * 10000 金幣
  const cost = pet.level * 10000;
  if (S.money < cost) { log(`金幣不足！升級需要 ${formatNumber(cost)} 金幣。`, 'lose'); return; }

  S.money -= cost;
  
  // 隨機升 10 ~ 50 級
  const gainLv = rand(10, 50);
  pet.level += gainLv;
  
  log(`🐾 消耗 ${formatNumber(cost)} 金幣，${p.name} 直接升了 ${gainLv} 級！(目前 Lv.${formatNumber(pet.level)})`, 'pet-text');
  renderPet();
  updateTownUI();
}
