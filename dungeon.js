// ============================================================
//  ★ 副本系統
//  流程：選副本 → 進入 → 每層一隻怪 → 打完進下一層 → 通關
// ============================================================

function openDungeon() { showScreen('screen-dungeon'); renderDungeon(); }
function closeDungeon() { updateTownUI(); showScreen('screen-town'); }

function renderDungeon() {
  const c = $('dungeonContent');
  if (S.dungeon.active) {
    // 進行中（通常戰鬥畫面會蓋住，這裡是保險）
    c.innerHTML = `<div class="subtitle" style="text-align:center;padding:20px;">
      副本進行中：${DUNGEONS[S.dungeon.active].name} 第 ${S.dungeon.floor}/${DUNGEONS[S.dungeon.active].floors} 層
    </div>`;
    return;
  }

  let html = `<div class="subtitle" style="text-align:center;padding:8px;">
    🏰 進入副本挑戰，通關後可獲得大量獎勵與寵物
  </div>`;

  for (const [id, d] of Object.entries(DUNGEONS)) {
    const canEnter = S.level >= d.minLv;
    html += `<div class="dungeon-card" style="${canEnter?'':'opacity:0.5;'}"
      ${canEnter ? `onclick="enterDungeon('${id}')"` : ''}>
      <div class="dungeon-name">${d.icon} ${d.name}</div>
      <div class="dungeon-info">需求等級：Lv.${d.minLv}｜層數：${d.floors}</div>
      <div class="dungeon-info">${d.desc}</div>
      <div class="dungeon-info" style="color:#ffd54f;">
        獎勵：💰${d.rewards.money}｜⭐${d.rewards.exp}｜🐾 ${d.rewards.petChance}% 寵物
      </div>
      ${!canEnter ? `<div class="subtitle" style="color:#f44336;">⚠ 等級不足</div>` : ''}
    </div>`;
  }
  c.innerHTML = html;
}

function enterDungeon(id) {
  const d = DUNGEONS[id];
  if (!d) return;
  if (S.level < d.minLv) { log('等級不足！', 'lose'); return; }

  S.dungeon.active = id;
  S.dungeon.floor = 1;
  S.hp = effMaxHp();
  log(`🏰 進入副本：${d.name}`, 'dungeon-text');
  showScreen('screen-adventure');
  setTimeout(() => dungeonEncounter(), 800);
}

function dungeonEncounter() {
  if (S.hp <= 0) { dungeonDeath(); return; }
  const d = DUNGEONS[S.dungeon.active];
  if (!d) return;
  const floor = S.dungeon.floor;
  const isBoss = floor === d.floors;  // 最後一層是 BOSS
  if (isBoss) {
    log(`★ 副本 BOSS 層！`, 'boss');
    spawnDungeonBoss(d, floor);
  } else {
    spawnDungeonMonster(d, floor);
  }
  startBattle();
}

function spawnDungeonMonster(d, floor) {
  const base = MONSTERS[d.monsterType];
  const mult = d.mult * (1 + floor * 0.1);
  const lv = Math.max(1, S.level + floor);
  S.monster = {
    name:`[副本${floor}F] ${base.name}`, skill:base.skill,
    hp:Math.floor((base.hp + base.hp*0.3*lv) * mult),
    atk:Math.floor((base.atk + base.atk*0.3*lv) * mult),
    def:Math.floor((base.def + base.def*0.3*lv) * mult),
    exp:Math.floor(base.exp*lv*mult), money:Math.floor(base.money*lv*mult),
    maxHp:0, lv, type:d.monsterType, weak:base.weak, res:base.res, dodge:base.dodge,
    prefixType:0, prefix:"", isDungeon:true,
  };
  S.monster.maxHp = S.monster.hp;
}

function spawnDungeonBoss(d, floor) {
  const tier = Math.min(5, Math.floor(S.level/20));
  const b = BOSSES[tier] || BOSSES[1];
  const mult = d.mult * 2;
  S.monster = {
    name:`[副本BOSS] ${b.name}`, skill:b.skill,
    hp:Math.floor(b.hp * mult), atk:Math.floor(b.atk * mult),
    def:Math.floor(b.def * mult), exp:Math.floor(b.exp * mult), money:Math.floor(b.money * mult),
    maxHp:0, lv:S.level, type:100+tier, weak:b.weak, res:b.res, dodge:10,
    prefixType:0, prefix:"", isBoss:true, isDungeon:true,
    lines:b.lines || [],
  };
  S.monster.maxHp = S.monster.hp;
}

function dungeonNextFloor() {
  const d = DUNGEONS[S.dungeon.active];
  if (!d) return;
  if (S.dungeon.floor >= d.floors) {
    // 通關
    log(`🎉 副本《${d.name}》通關！`, 'dungeon-text');
    S.money += d.rewards.money;
    S.exp += d.rewards.exp;
    log(`💰 獲得 ${d.rewards.money} 金幣與 ${d.rewards.exp} 經驗`, 'win');
    // 寵物掉落
    if (roll(d.rewards.petChance)) {
      grantRandomPet();
    }
    S.dungeon.cleared = (S.dungeon.cleared || 0) + 1;
    S.dungeon.active = null;
    S.dungeon.floor = 0;
    updateTownUI();
    saveGame();
    checkAchievements();
    setTimeout(() => showScreen('screen-town'), 800);
    return;
  }
  S.dungeon.floor++;
  log(`🏰 進入第 ${S.dungeon.floor} 層...`, 'dungeon-text');
  setTimeout(() => dungeonEncounter(), 600);
}

function dungeonDeath() {
  const d = DUNGEONS[S.dungeon.active];
  const floor = S.dungeon.floor;
  log(`💀 在《${d.name}》第 ${floor} 層倒下...`, 'lose');
  S.dungeon.active = null;
  S.dungeon.floor = 0;
  S.hp = effMaxHp();
  // 死亡懲罰
  const lost = Math.floor(S.money * 0.1);
  S.money -= lost;
  log(`損失了 ${lost} 金幣，被傳送回村莊。`, 'lose');
  updateTownUI();
  saveGame();
  showScreen('screen-town');
}

// 隨機給一隻寵物
function grantRandomPet() {
  const id = pickPet();
  if (!S.pets[id]) {
    S.pets[id] = { level: 1, exp: 0 };
    log(`🐾 獲得新寵物：${PETS[id].name}！`, 'pet-text');
    if (!S.activePet) S.activePet = id;
  } else {
    S.pets[id].exp += 100;
    log(`🐾 寵物 ${PETS[id].name} 獲得 100 經驗！`, 'pet-text');
  }
  checkAchievements();
}
