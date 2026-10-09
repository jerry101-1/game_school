// ============================================================
//  ★ 戰鬥系統 — 戰鬥流程、玩家/怪物行動、擊敗結算
// ============================================================

function startBattle() {
  S.inBattle = true; S.gameOver = false;
  S.skillCD = 0; S.fruitSkillCD = 0;
  S.isDefending = false; S.isShieldActive = false;
  S.monsterFrozen = false; S.monsterCharging = false;
  S.poisonTurns = 0; S.poisonDamage = 0;
  S.burnTurns = 0; S.burnDamage = 0;
  S.combo = 0;
  S.buttonLocked = false;

  if (S.monster.prefixType === 5) {
    S.skillCD += 1;
    log(`【詛咒】${S.monster.name} 的詛咒讓你技能冷卻變慢！`,'skill-text');
  }

  showScreen('screen-battle');
  renderBattleUI();
  setButtonsEnabled(true);

  log(`遭遇 ${S.monster.name} (Lv.${S.monster.lv})！`,'system');
  log(`怪物特性：${S.monster.skill}`,'system');

  if (S.monster.lines && S.monster.lines.length) {
    let i = 0;
    const showNext = () => {
      if (i < S.monster.lines.length) {
        log(S.monster.lines[i], 'boss');
        i++;
        setTimeout(showNext, 900);
      }
    };
    setTimeout(showNext, 500);
  }
}

function setButtonsEnabled(on) {
  S.buttonLocked = !on;
  if (!on) {
    ['btnAttack','btnSkill','btnPower','btnDefend','btnPotion'].forEach(id => $(id).disabled = true);
    $('btnAuto').disabled = false;
    renderFruitSkillBar();
    return;
  }
  $('btnAttack').disabled = false;
  $('btnSkill').disabled = S.skillCD > 0;
  $('btnPower').disabled = false;
  $('btnDefend').disabled = false;
  $('btnPotion').disabled = S.potion <= 0;
  $('btnAuto').disabled = false;
  renderFruitSkillBar();
}

function renderBattleUI() {
  const maxHp = effMaxHp();
  const hpPct = Math.max(0, S.hp / maxHp * 100);
  const bar = $('playerHpBar');
  bar.style.width = hpPct + '%';
  bar.className = 'hp-fill ' + (hpPct > 60 ? 'green' : hpPct > 30 ? 'yellow' : 'red');
  $('playerHpText').textContent = `${Math.max(0,S.hp)} / ${maxHp}`;
  $('battleRole').textContent = S.roleName;
  $('battleLevel').textContent = S.level;
  $('battleAtk').textContent = effAtk();
  $('battleDef').textContent = effDef();
  $('battlePotion').textContent = S.potion;

  const m = S.monster;
  if (m) {
    const mPct = Math.max(0, m.hp / m.maxHp * 100);
    const mBar = $('monsterHpBar');
    mBar.style.width = mPct + '%';
    mBar.className = 'hp-fill ' + (mPct > 60 ? 'green' : mPct > 30 ? 'yellow' : 'red');
    $('monsterHpText').textContent = `${Math.max(0,m.hp)} / ${m.maxHp}`;
    $('monsterName').textContent = m.name;
    $('monsterLv').textContent = Math.max(1, m.lv);
    $('monsterWeak').textContent = elemName(m.weak);
    $('monsterRes').textContent = elemName(m.res);
    $('monsterSkill').textContent = m.skill;
    const pBadge = $('monsterPrefix');
    if (m.prefixType) { pBadge.textContent = m.prefix; pBadge.classList.remove('hidden'); }
    else pBadge.classList.add('hidden');
    const bBadge = $('monsterBoss');
    if (m.isBoss) { bBadge.textContent = S.inAbyss ? `深淵 ${S.abyssFloor}F` : (S.dungeon.active ? `副本 ${S.dungeon.floor}F` : `第 ${S.chapter} 章 BOSS`); bBadge.classList.remove('hidden'); }
    else bBadge.classList.add('hidden');

    updateFavicon(S.hp / effMaxHp());
  }

  const sk = $('btnSkill');
  if (S.skillCD > 0) sk.textContent = `職業技能 (CD:${S.skillCD})`;
  else sk.textContent = '職業技能';
  $('btnPotion').textContent = `藥水 (${S.potion})`;

  const cb = $('comboBadge');
  if (S.combo > 0) { cb.textContent = `🔥 ${S.combo} 連擊`; cb.classList.remove('hidden'); }
  else cb.classList.add('hidden');

  const btnCombo = $('btnCombo');
  if (S.combo >= 5) btnCombo.classList.remove('hidden');
  else btnCombo.classList.add('hidden');

  renderFruitSkillBar();
  renderRoleSkillInfo();
  if (typeof renderPetBattleBar === 'function') renderPetBattleBar();
}

function renderFruitSkillBar() {
  const bar = $('fruitSkillBar');
  if (!S.activeFruit || !S.fruits[S.activeFruit]) {
    bar.innerHTML = '<span class="subtitle">尚未裝備果實</span>';
    return;
  }
  const f = FRUITS[S.activeFruit];
  const data = S.fruits[S.activeFruit];
  let usable = null;
  for (const sk of f.skills) if (data.level >= sk.lv) usable = sk;
  if (!usable) { bar.innerHTML = '<span class="subtitle">果實技能未解鎖</span>'; return; }
  const cdText = S.fruitSkillCD > 0 ? `(CD:${S.fruitSkillCD})` : '';
  const disabled = S.fruitSkillCD > 0 || S.buttonLocked;
  bar.innerHTML = `<button id="btnFruitSkill" class="fruit" ${disabled?'disabled':''} onclick="playerFruitSkill()">
    ${f.icon} ${usable.name} ${cdText}
  </button>`;
}

function renderRoleSkillInfo() {
  const bar = $('roleSkillInfo');
  if (!bar) return;
  const rSkill = getRoleSkill();
  if (!rSkill) { bar.innerHTML = ''; return; }
  bar.innerHTML = `<span class="subtitle">職業技能：${rSkill.name}（${rSkill.desc}）</span>`;
}

// ── 玩家行動 ──
function playerAttack() { if (S.inBattle && !S.gameOver) playerAction(1); }
function playerSkill() {
  if (!S.inBattle || S.gameOver) return;
  if (S.skillCD > 0) { log(`技能還在冷卻中（剩 ${S.skillCD} 回合）`,'system'); return; }
  playerAction(2);
}
function playerPower()  { if (S.inBattle && !S.gameOver) playerAction(3); }
function playerDefend() { if (S.inBattle && !S.gameOver) playerAction(4); }

function playerCombo() {
  if (!S.inBattle || S.gameOver) return;
  if (S.combo < 5) { log('連擊不足！','system'); return; }
  setButtonsEnabled(false);
  const m = S.monster;
  const mult = 2 + S.combo * 0.15;
  let pDmg = Math.round(effAtk() * mult);
  log(`⚡ 【連擊爆發】消耗 ${S.combo} 連擊，造成 ${pDmg} 點毀滅傷害！`,'combo-text');
  m.hp -= pDmg;
  S.combo = 0;
  renderBattleUI();
  if (m.hp <= 0) { m.hp = 0; renderBattleUI(); setTimeout(onMonsterDefeated, 400); return; }
  setTimeout(monsterTurn, 600);
}

function playerPotion() {
  if (!S.inBattle || S.gameOver) return;
  if (S.potion <= 0) { log('沒有藥水了！','lose'); return; }
  setButtonsEnabled(false);
  const maxHp = effMaxHp();
  const heal = Math.floor(maxHp * 0.4);
  S.hp = Math.min(maxHp, S.hp + heal);
  S.potion--;
  log(`【藥水】回復 ${heal} 點 HP！（剩餘 ${S.potion} 瓶）`,'win');
  renderBattleUI();
  setTimeout(monsterTurn, 600);
}

function playerFruitSkill() {
  if (!S.inBattle || S.gameOver) return;
  if (S.fruitSkillCD > 0) { log(`果實技能冷卻中（剩 ${S.fruitSkillCD} 回合）`,'system'); return; }
  if (!S.activeFruit || !S.fruits[S.activeFruit]) return;
  const f = FRUITS[S.activeFruit];
  const data = S.fruits[S.activeFruit];
  let usable = null;
  for (const sk of f.skills) if (data.level >= sk.lv) usable = sk;
  if (!usable) return;

  setButtonsEnabled(false);
  const m = S.monster;
  const fruitBonus = 1 + getTalentBonus().fruitDmg/100;
  let pDmg = Math.round(effAtk() * usable.mult * fruitBonus);
  let element = f.element;
  log(`【${f.name}·${usable.name}】${usable.desc}`,'fruit-text');

  let mult = 1.0;
  if (element === m.weak) { mult = 1.5; log('【弱點命中！】傷害 ×1.5','crit'); }
  else if (element === m.res) { mult = 0.7; log('【抗性】傷害 ×0.7','system'); }
  pDmg = Math.max(1, Math.round(pDmg * mult));

  if (S.activeFruit === 'ice' || S.activeFruit === 'void') {
    if (roll(30)) { S.monsterFrozen = true; log('敵人被凍結！','skill-text'); }
  }
  if (S.activeFruit === 'flame' || S.activeFruit === 'phoenix') {
    S.burnTurns = 3; S.burnDamage = Math.floor(effMaxHp()*0.02) + 5;
    log('敵人被點燃！','skill-text');
  }
  if (['dark','phoenix','light','void'].includes(S.activeFruit)) {
    const steal = Math.floor(pDmg * 0.2);
    S.hp = Math.min(effMaxHp(), S.hp + steal);
    log(`吸收精氣，回復 ${steal} 點 HP！`,'win');
  }

  m.hp -= pDmg;
  log(`造成 ${pDmg} 點傷害！`,'dmg-player');
  const totalCd = getTalentBonus().cd + (getBreakthroughBonus().cd || 0);
  S.fruitSkillCD = Math.max(1, usable.cd - totalCd);
  renderBattleUI();

  if (m.hp <= 0) { m.hp = 0; renderBattleUI(); setTimeout(onMonsterDefeated, 400); return; }
  setTimeout(monsterTurn, 600);
}

function playerAction(action) {
  setButtonsEnabled(false);
  const m = S.monster;
  if (action === 4) {
    S.isDefending = true;
    log('【防禦】你擺出防禦姿態。','system');
    setTimeout(monsterTurn, 500);
    return;
  }

  let pDmg = 0, element = 4;

  if (action === 2) {
    const rSkill = getRoleSkill();
    if (!rSkill) { log('尚未解鎖任何職業技能！', 'lose'); setButtonsEnabled(true); return; }
    const roleBonus = 1 + Math.floor((S.roleLevel - 1) / 10) * 0.10;
    pDmg = Math.round(effAtk() * rSkill.mult * roleBonus);
    S.skillCD = Math.max(1, rSkill.cd - getTalentBonus().cd - (getBreakthroughBonus().cd || 0));
    if (S.roleType === 5) element = 1;
    else if (S.roleType === 6 || S.roleType === 11) element = 3;
    else element = 4;
    log(`【${rSkill.name}】${rSkill.desc}`, 'skill-text');

    if (S.roleType === 2)  { S.isShieldActive = true; log('進入格擋姿態！', 'skill-text'); }
    if (S.roleType === 5)  { if (roll(20)) { S.monsterFrozen = true; log('敵人被凍結！', 'skill-text'); } }
    if (S.roleType === 6 || S.roleType === 11) {
      const st = Math.round(pDmg * 0.4); S.hp = Math.min(effMaxHp(), S.hp + st);
      log(`吸取 ${st} 點 HP！`, 'win');
    }
    if (S.roleType === 7) {
      const heal = Math.floor(effMaxHp() * 0.25); S.hp = Math.min(effMaxHp(), S.hp + heal);
      log(`聖光治癒，回復 ${heal} HP！`, 'win');
    }
    if (S.roleType === 8) {
      const ratio = 1 + (1 - S.hp/effMaxHp()) * 1.5;
      pDmg = Math.round(pDmg * ratio);
    }
    if (S.roleType === 9) { element = rand(1, 4); }
    if (S.roleType === 10) { S.burnTurns = 3; S.burnDamage = Math.floor(effMaxHp()*0.02) + 5; log('附加龍息燃燒！', 'skill-text'); }
  }
  else if (action === 3) {
    if (roll(20)) { log(`【全力一擊】MISS！`,'lose'); pDmg = 0; }
    else {
      pDmg = Math.round(effAtk()*effAtk() / (effAtk()+m.def) * 1.5);
      log(`【全力一擊】全力揮出！`,'system');
    }
  }
  else {
    pDmg = Math.round(effAtk()*effAtk() / (effAtk()+m.def));
  }

  const tal = getTalentBonus();
  if (tal.pierce > 0) pDmg = Math.round(pDmg * (1 + tal.pierce/100));

  let critRate = effCritRate();
  if (action === 3) critRate += 50;
  const isCrit = pDmg > 0 && roll(critRate);
  if (isCrit) pDmg = Math.round(pDmg * (effCritDmg() / 100));

  if (S.combo > 0) pDmg = Math.round(pDmg * (1 + S.combo * 0.05));

  if (pDmg > 0 && roll(m.dodge)) {
    log(`【閃避】${m.name} 躲開了！`,'system');
    pDmg = 0;
  }

  if (pDmg > 0) {
    let mult = 1.0;
    if (element === m.weak) { mult = 1.5; log('【弱點命中！】×1.5','crit'); }
    else if (element === m.res) { mult = 0.7; log('【抗性】×0.7','system'); }
    pDmg = Math.max(1, Math.round(pDmg * mult));
    m.hp -= pDmg;

    if (m.prefixType === 2 && pDmg > 0) {
      const reflect = Math.max(1, Math.floor(pDmg*0.05));
      S.hp -= reflect;
      log(`【荊棘】反傷 ${reflect} 點！`,'lose');
    }

    if (isCrit) {
      S.combo++;
      if (S.combo > S.maxCombo) S.maxCombo = S.combo;
      // ★ 公會連擊任務
      if (typeof addGuildProgress === 'function') {
        if (S.combo === 10) addGuildProgress('maxCombo10', 1);
        if (S.combo === 30) addGuildProgress('maxCombo30', 1);
      }
      checkAchievements();
    }

    if (isCrit) log(`★ 致命一擊！對 ${m.name} 造成 ${pDmg} 點傷害！${S.combo>0?` [${S.combo}連擊]`:''}`,'crit');
    else log(`你對 ${m.name} 造成 ${pDmg} 點傷害！`,'dmg-player');

    const petB = getPetBonus();
    const totalLS = S.lifesteal + (getBreakthroughBonus().lifesteal || 0) + petB.lifesteal;
    if (totalLS > 0) {
      const heal = Math.floor(pDmg * totalLS / 100);
      if (heal > 0) { S.hp = Math.min(effMaxHp(), S.hp + heal); log(`【吸血】回復 ${heal} 點 HP`,'win'); }
    }
  } else {
    log(`沒有造成傷害。`,'system');
    S.combo = 0;
  }

    // ★ 寵物自動攻擊（30% 機率）
  if (typeof petAutoAttack === 'function') petAutoAttack();

  renderBattleUI();
  if (m.hp <= 0) { m.hp = 0; renderBattleUI(); setTimeout(onMonsterDefeated, 400); return; }
  setTimeout(monsterTurn, 600);
}

// ── 怪物回合 ──
function monsterTurn() {
  if (!S.inBattle || S.gameOver) return;
  const m = S.monster;
  if (m.hp <= 0) { onMonsterDefeated(); return; }

  if (S.monsterFrozen) {
    log(`${m.name} 被冰凍，無法行動！`,'system');
    S.monsterFrozen = false;
    endMonsterTurn();
    return;
  }
  if (S.monsterCharging) {
    S.monsterCharging = false;
    let dmg = Math.max(1, Math.round(m.atk*2.5 - effDef()));
    if (S.isDefending) { dmg = Math.max(1, Math.floor(dmg*0.2)); log('【防禦】擋下大部分傷害！','system'); S.isDefending=false; }
    if (S.isShieldActive) { dmg = Math.max(1, Math.floor(dmg*0.3)); log('【格擋】盾牌發揮效果！','system'); S.isShieldActive=false; }
    if (roll(effDodge())) log('【閃避】你閃過了攻擊！','system');
    else { S.hp -= dmg; log(`【大招】${m.name} 造成 ${dmg} 點傷害！`,'dmg-monster'); }
    endMonsterTurn();
    return;
  }
  if (m.type < 100 && roll(15)) {
    S.monsterCharging = true;
    log(`【蓄力】${m.name} 準備大招！`,'system');
    endMonsterTurn();
    return;
  }

  let mDmg = Math.max(1, Math.round(m.atk - effDef()));

  if (roll(30) && m.type !== 7 && m.type < 100) {
    log(`${m.name} 發動技能：【${m.skill}】`,'system');
    switch(m.type) {
      case 1: mDmg = Math.round(m.atk*1.5 - effDef()); break;
      case 2: mDmg = Math.max(1, Math.round(m.atk*0.7-effDef())) + Math.max(1, Math.round(m.atk*0.7-effDef())); break;
      case 3: mDmg = Math.round(m.atk - effDef()*0.5); break;
      case 4: { mDmg = Math.round(m.atk-effDef()); const heal=m.lv*20; m.hp=Math.min(m.maxHp,m.hp+heal); log(`石像鬼回復 ${heal} HP！`,'win'); break; }
      case 5: mDmg = Math.round(m.atk-effDef())*2; break;
      case 6: { mDmg = Math.round(m.atk-effDef()); const heal=Math.floor(mDmg/2); m.hp=Math.min(m.maxHp,m.hp+heal); log(`蘑菇回復 ${heal} HP！`,'win'); break; }
    }
  }
  mDmg = Math.max(1, mDmg);

  if (m.prefixType === 1 && m.hp < m.maxHp*0.3) { mDmg *= 2; log(`【狂暴】${m.name} 攻擊倍增！`,'lose'); }
  if (m.prefixType === 3 && roll(25)) { mDmg *= 2; log(`【迅捷】${m.name} 連續攻擊！`,'lose'); }
  if (m.prefixType === 12) { const heal=Math.floor(m.maxHp*0.05); m.hp=Math.min(m.maxHp,m.hp+heal); log(`【詛咒血脈】${m.name} 回復 ${heal} HP！`,'win'); }

  if (S.isShieldActive) { mDmg = Math.max(1, Math.floor(mDmg*0.3)); log('【格擋】免除 70% 傷害！','system'); S.isShieldActive=false; }
  if (S.isDefending) { mDmg = Math.max(1, Math.floor(mDmg*0.2)); log('【防禦】擋下大部分傷害！','system'); S.isDefending=false; }

  if (roll(effDodge())) {
    log(`【閃避】你閃過了 ${m.name} 的攻擊！`,'system');
  } else {
    S.hp -= mDmg;
    log(`${m.name} 造成 ${mDmg} 點傷害！`,'dmg-monster');
    S.combo = 0;
    if (m.prefixType === 4) {
      const steal = Math.max(1, Math.floor(mDmg*0.3));
      m.hp = Math.min(m.maxHp, m.hp + steal);
      log(`【吸血】${m.name} 回復 ${steal} HP！`,'win');
    }
  }

  if (m.type === 6 && roll(40)) {
    S.poisonTurns = 3; S.poisonDamage = Math.floor(effMaxHp()*0.05);
    log(`【中毒】每回合損失 ${S.poisonDamage} HP！`,'lose');
  }
  if (m.prefixType === 7 && roll(40)) {
    S.poisonTurns = 3; S.poisonDamage = Math.floor(effMaxHp()*0.04);
    log(`【劇毒】你中毒了！`,'lose');
  }
  if (m.prefixType === 8 && roll(40)) {
    S.burnTurns = 3; S.burnDamage = Math.floor(effMaxHp()*0.03) + 5;
    log(`【燃燒】你被點燃了！`,'lose');
  }

  if (S.poisonTurns > 0) {
    S.hp -= S.poisonDamage; S.poisonTurns--;
    log(`【中毒】受到 ${S.poisonDamage} 點毒傷${S.poisonTurns>0?`（剩 ${S.poisonTurns}）`:'（結束）'}`,'lose');
  }
  if (S.burnTurns > 0) {
    S.hp -= S.burnDamage; S.burnTurns--;
    log(`【燃燒】受到 ${S.burnDamage} 點燃傷${S.burnTurns>0?`（剩 ${S.burnTurns}）`:'（結束）'}`,'lose');
  }

  const tal = getTalentBonus();
  const bkr = getBreakthroughBonus();
  const petB = getPetBonus();
  const totalRegen = tal.regen + (bkr.regen || 0) + petB.regen;
  if (totalRegen > 0) {
    const heal = Math.floor(effMaxHp() * totalRegen / 100);
    if (heal > 0) S.hp = Math.min(effMaxHp(), S.hp + heal);
  }

  endMonsterTurn();
}

function endMonsterTurn() {
  if (S.skillCD > 0) S.skillCD--;
  if (S.fruitSkillCD > 0) S.fruitSkillCD--;
  renderBattleUI();

  if (S.hp <= 0) {
    S.hp = 0;
    renderBattleUI();
    log('你被擊敗了...','lose');
    setTimeout(() => {
      if (S.inAbyss) abyssDeath();
      else if (S.dungeon.active) dungeonDeath();
      else handleDeath();
    }, 800);
    return;
  }
  if (S.autoMode) {
    setTimeout(() => { if (S.autoMode && S.inBattle) autoDecide(); }, 500);
  } else {
    setButtonsEnabled(true);
  }
}

function toggleAuto() {
  S.autoMode = !S.autoMode;
  log(S.autoMode ? '【系統】自動模式。' : '【系統】手動模式。','system');
  renderBattleUI();
  if (S.autoMode && S.inBattle) { setButtonsEnabled(false); autoDecide(); }
  else if (S.inBattle && !S.gameOver) { setButtonsEnabled(true); }
}

function autoDecide() {
  if (!S.inBattle || S.gameOver) return;
  if (S.hp < effMaxHp()*0.3 && S.potion > 0) { playerPotion(); return; }
  if (S.combo >= 5) { playerCombo(); return; }
  if (S.activeFruit && S.fruits[S.activeFruit] && S.fruitSkillCD === 0) {
    const f = FRUITS[S.activeFruit];
    const data = S.fruits[S.activeFruit];
    const hasSkill = f.skills.some(sk => data.level >= sk.lv);
    if (hasSkill) { playerFruitSkill(); return; }
  }
  if (S.skillCD === 0) { playerSkill(); return; }
  playerAttack();
}

// ── 怪物擊敗 ──
function onMonsterDefeated() {
  const m = S.monster;
  S.inBattle = false;
  S.gameOver = true;
  setButtonsEnabled(false);

  const tal = getTalentBonus();
  const bk  = getBreakthroughBonus();
  const g   = getGuildBonus();
  const p   = getPetBonus();

  const expBonus  = Math.floor(m.exp   * ((S.playexp - 100) + S.expBonus + tal.exp  + bk.exp  + g.exp  + p.exp)  / 100);
  const totalExp  = m.exp + expBonus;
  const goldBonus = Math.floor(m.money * (S.goldBonus + tal.gold + bk.gold + g.gold + p.gold) / 100);
  const totalGold = m.money + goldBonus;

  S.exp += totalExp;
  S.money += totalGold;
  S.killCount++;
  if (typeof addGuildProgress === 'function') addGuildProgress('killCount', 1);  // ★ 公會任務
  log(`擊敗 ${m.name}！獲得 ${totalExp} 經驗與 ${totalGold} 金幣。`,'win');

  // 果實經驗
  if (S.activeFruit && S.fruits[S.activeFruit]) {
    let fruitExpRatio = m.isBoss ? 0.15 : 0.10;
    if (S.inAbyss) fruitExpRatio += 0.05;
    const fruitExp = Math.max(1, Math.floor(m.exp * fruitExpRatio));
    const gained = gainFruitExp(fruitExp);
    log(`🍇 果實吸收戰鬥精華，獲得 ${gained} 點經驗。`, 'fruit-text');
  }
  // 職業經驗
  if (S.roleType) {
    let roleExpRatio = m.isBoss ? 0.20 : 0.12;
    if (S.inAbyss) roleExpRatio += 0.05;
    const roleExp = Math.max(1, Math.floor(m.exp * roleExpRatio));
    const gained = gainRoleExp(roleExp);
    log(`⭐ 職業吸收戰鬥精華，獲得 ${gained} 點經驗。`, 'talent-text');
  }
  // 寵物經驗
  if (S.activePet && S.pets[S.activePet]) {
    const petExp = Math.max(1, Math.floor(m.exp * 0.08));
    gainPetExp(petExp);
  }
  checkAchievements();

  // 深淵模式
  if (S.inAbyss) {
    const dropRarity = pickRarity(S.abyssFloor / 3);
    const item = genEquipment(S.level, dropRarity);
    S.inventory.push(item);
    log(`🌀 深淵掉落：${item.name}`,'loot');
    if (S.abyssFloor % 5 === 0) { S.potion++; log(`🌀 深淵獎勵：治療藥水 +1`,'win'); }
    if (roll(35)) { setTimeout(() => offerLoot(true), 500); return; }
    setTimeout(() => abyssNextFloor(), 800);
    return;
  }
  // 副本模式
  if (S.dungeon.active) {
    const item = genEquipment(S.level + 5, pickRarity(15));
    S.inventory.push(item);
    log(`🏰 副本掉落：${item.name}`,'loot');
    if (roll(30)) { setTimeout(() => offerLoot(true), 500); return; }
    setTimeout(() => dungeonNextFloor(), 800);
    return;
  }

  // 一般模式掉落
  let dropRate = 25;
  if (m.prefixType > 0) dropRate += 25;
  if (m.type === 7) dropRate = 100;
  if (m.isBoss) dropRate = 100;

  const equipDropRate = 20 + (m.isBoss ? 40 : 0) + (m.prefixType > 0 ? 10 : 0);
  if (roll(equipDropRate)) {
    const item = genEquipment(S.level, pickRarity(S.level / 8 + (m.isBoss ? 30 : 0)));
    S.inventory.push(item);
    log(`🎽 掉落裝備：${item.name}`,'loot');
  }

  if (roll(dropRate)) { setTimeout(() => offerLoot(false), 500); return; }
  afterBattle();
}

// ── 寶箱 ──
function offerLoot(fromAbyss) {
  const pool = [
    {name:'攻擊力 +',type:1,val:rand(3,8)},
    {name:'最大 HP +',type:2,val:rand(20,50)},
    {name:'金幣 +',type:3,val:rand(50,150)},
    {name:'經驗 +',type:4,val:rand(50,120)},
    {name:'防禦力 +',type:5,val:rand(2,5)},
    {name:'回復 HP',type:6,val:30},
    {name:'治療藥水 x1',type:7,val:1},
  ];
  const chosen = [];
  while (chosen.length < 3) {
    const i = rand(0, pool.length-1);
    if (!chosen.includes(i)) chosen.push(i);
  }
  log('★ 怪物掉落了寶箱！請選擇獎勵：','loot');
  showScreen('screen-loot');
  const list = $('lootList');
  list.innerHTML = '';
  chosen.forEach((idx, i) => {
    const l = pool[idx];
    const card = document.createElement('div');
    card.className = 'loot-card';
    card.innerHTML = `<div><div class="loot-name">(${i+1}) ${l.name}</div>
      <div class="loot-val">${l.type === 6 ? '回復 30% 最大 HP' : l.type === 7 ? '藥水 +1' : '+' + l.val}</div></div>
      <button class="small gold">選擇</button>`;
    card.onclick = () => {
      applyLoot(l);
      if (S.dungeon.active) { setTimeout(() => dungeonNextFloor(), 400); }
      else if (fromAbyss) { setTimeout(() => abyssNextFloor(), 400); }
      else { afterBattle(); }
    };
    list.appendChild(card);
  });
}

function applyLoot(l) {
  switch(l.type) {
    case 1: S.atk += l.val; log(`【獎勵】攻擊力 +${l.val}`,'win'); break;
    case 2: S.maxHp += l.val; S.hp += l.val; log(`【獎勵】最大 HP +${l.val}`,'win'); break;
    case 3: S.money += l.val; log(`【獎勵】金幣 +${l.val}`,'win'); break;
    case 4: S.exp += l.val; log(`【獎勵】經驗 +${l.val}`,'win'); break;
    case 5: S.def += l.val; log(`【獎勵】防禦力 +${l.val}`,'win'); break;
    case 6: { const heal=Math.floor(effMaxHp()*0.3); S.hp=Math.min(effMaxHp(),S.hp+heal); log(`【獎勵】回復 ${heal} HP`,'win'); break; }
    case 7: S.potion += l.val; log(`【獎勵】藥水 x${l.val}`,'win'); break;
  }
}

function afterBattle() {
  showScreen('screen-battle');
  if (S.inAbyss) { setTimeout(() => abyssNextFloor(), 600); return; }
  if (S.dungeon.active) { setTimeout(() => dungeonNextFloor(), 600); return; }

  // 升級
  while (S.exp >= S.expNeeded) {
    S.exp -= S.expNeeded;
    S.level++;
    S.expNeeded = Math.floor(100 * Math.pow(S.level, 1.5));
    const hpGain = 100 + S.level * 15;
    const atkGain = 8 + (S.roleType === 3 ? 6 : 3);
    const defGain = 3 + (S.roleType === 2 ? 4 : 1);
    S.maxHp += hpGain;
    S.hp = effMaxHp();
    S.atk += atkGain;
    S.def += defGain;
    if (allTalentsMaxed()) {
      S.breakthroughPoints = (S.breakthroughPoints || 0) + 1;
      log(`★ 【等級提升】Lv.${S.level}！ HP+${hpGain} 攻擊+${atkGain} 防禦+${defGain} 突破點+1`,'win');
    } else {
      S.talentPoints++;
      log(`★ 【等級提升】Lv.${S.level}！ HP+${hpGain} 攻擊+${atkGain} 防禦+${defGain} 天賦+1`,'win');
    }
    if (S.level === 15)  log('🍇 已解鎖果實系統！','fruit-text');
    if (S.level === 50)  log('🍇 抽果費用提升！','fruit-text');
    if (S.level === 100) log('🍇 抽果費用再提升！','fruit-text');
    checkAchievements();
  }

  // BOSS 通關 → 回村
  if (S.isBossFight && S.monster && S.monster.hp <= 0) {
    S.chapter++;
    log(`★ 第 ${S.chapter-1} 章通關！進入第 ${S.chapter} 章！`,'win');
    S.isBossFight = false;
    saveGame();
    returnToTown();
    return;
  }

  // ★ 血量低於 30% → 自動回村
  if (S.hp < effMaxHp() * 0.3) {
    log(`⚠ 血量過低（${S.hp}/${effMaxHp()}），自動返回村莊。`, 'lose');
    setTimeout(() => returnToTown(), 800);
    return;
  }

  // ★ 沒有顯示返回按鈕，直接自動繼續下一場
  log(`⚔ 繼續探索下一場...（血量 ${S.hp}/${effMaxHp()}）`, 'system');
  setTimeout(() => nextEncounter(), 800);
}

function continueAdventure() {
  $('btnContinue').classList.add('hidden');
  $('btnReturn').classList.add('hidden');
  if (S.hp <= 0) { handleDeath(); return; }
  if (S.autoMode) {
    if (S.hp < effMaxHp()*0.3) { log('【自動】血量過低，返回村莊。','system'); returnToTown(); return; }
    setTimeout(nextEncounter, 600);
    return;
  }
  nextEncounter();
}

//回村
function returnToTown() {
  if ($('btnContinue')) $('btnContinue').classList.add('hidden');
  S.autoMode = false;
  S.inBattle = false;
  S.inAbyss = false;
  S.abyssFloor = 0;
  S.dungeon.active = null;
  S.dungeon.floor = 0;
  updateTownUI();
  saveGame();
  showScreen('screen-town');
  log('你回到了村莊。','system');
}
