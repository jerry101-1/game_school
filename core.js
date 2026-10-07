// ============================================================
//  ★ 核心 — S 狀態物件、工具函式、屬性計算、成就
// ============================================================

const S = {
  // 基本
  playerName:"無名勇者", roleType:4, roleName:"弱小的新手",
  level:1, exp:0, expNeeded:100,
  maxHp:150, hp:150, atk:35, def:9,
  money:0, potion:3, playexp:100,
  chapter:1, killCount:0, runCount:1,

  // 商店
  swordLevel:0, shieldLevel:0, contractLevel:0, expShopLevel:0,

  // 果實 / 裝備
  fruits:{}, activeFruit:null,
  equipment:{weapon:null,armor:null,accessory:null}, inventory:[],

  // 天賦 / 突破
  talentPoints:0, talents:{},
  breakthroughLevel:0, breakthroughPoints:0, breakthroughMilestones:{},

  // 職業等級（轉職繼承用）
  roleLevel:1, roleExp:0, roleLevels:{},

  // 深淵
  abyssFloor:0, abyssBest:0, inAbyss:false,

  // ★ 新：副本 / 公會 / 寵物
  dungeon: { active:null, floor:0 },   // 當前副本進度
  guild: { id:null, contrib:0, questProgress:{} },  // 公會
  pets: {},        // 擁有的寵物 {petId: {level, exp}}
  activePet: null, // 出戰中的寵物 id

  // 連擊 / 成就
  combo:0, maxCombo:0, achievements:{},

  // 額外屬性
  critRate:15, critDmg:100, lifesteal:0, reflect:0,
  goldBonus:0, expBonus:0, cdReduce:0, fruitDmgBonus:0,

  // 戰鬥暫存
  monster:null, skillCD:0, fruitSkillCD:0,
  isDefending:false, isShieldActive:false,
  monsterFrozen:false, monsterCharging:false,
  poisonTurns:0, poisonDamage:0, burnTurns:0, burnDamage:0,
  autoMode:false, inBattle:false, gameOver:false, isBossFight:false,
  playerDodge:5, buttonLocked:false,
};

// ── DOM 工具 ──
const $ = id => document.getElementById(id);
const show = id => $(id).classList.remove('hidden');
const hide = id => $(id).classList.add('hidden');
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const roll = pct => Math.random() * 100 < pct;

// ── 紀錄（保留最新 60 條） ──
const LOG_LIMIT = 60;
function log(msg, cls = '') {
  const logDiv = $('log');
  const div = document.createElement('div');
  div.textContent = msg;
  if (cls) div.className = cls;
  logDiv.appendChild(div);
  while (logDiv.children.length > LOG_LIMIT) logDiv.removeChild(logDiv.firstChild);
  logDiv.scrollTop = logDiv.scrollHeight;
}
function clearLog() { $('log').innerHTML = ''; }

// ── 畫面切換 ──
function showScreen(name) {
  ['screen-start','screen-town','screen-shop','screen-loot',
   'screen-fruit','screen-equip','screen-talent','screen-abyss',
   'screen-adventure','screen-battle','screen-job','screen-forge',
   'screen-dungeon','screen-guild','screen-pet','screen-cloud',
   'screen-train','screen-collect','screen-system']
    .forEach(s => hide(s));
  if (name) show(name);
}

// ── 屬性名稱 ──
function elemName(e) { return {1:'火',2:'冰',3:'雷',4:'物理'}[e] || '無'; }

// ── 天賦加成 ──
function getTalentBonus() {
  const b = {atkPct:0,crit:0,critDmg:0,pierce:0,hpPct:0,defPct:0,
             dodge:0,regen:0,gold:0,exp:0,cd:0,fruitDmg:0};
  for (const [id, lv] of Object.entries(S.talents)) {
    const t = TALENTS[id];
    if (!t || !lv) continue;
    b[t.effect] += t.per * lv;
  }
  return b;
}

function allTalentsMaxed() {
  for (const [id, t] of Object.entries(TALENTS)) {
    if ((S.talents[id] || 0) < t.max) return false;
  }
  return true;
}

function getBreakthroughBonus() {
  const lv = S.breakthroughLevel || 0;
  const ms = S.breakthroughMilestones || {};
  const b = {atkPct:lv*2, defPct:lv*2, hpPct:lv*2,
             crit:lv*3, critDmg:lv*5, exp:lv*3, gold:lv*3,
             lifesteal:0, regen:0, cd:0};
  if (ms.crit)      b.crit += 5;
  if (ms.critDmg)   b.critDmg += 20;
  if (ms.cd)        b.cd += 1;
  if (ms.lifesteal) b.lifesteal += 10;
  if (ms.regen)     b.regen += 3;
  if (ms.allStats)  { b.atkPct += 20; b.defPct += 20; b.hpPct += 20; }
  if (ms.god)       { b.atkPct += 30; b.defPct += 30; b.hpPct += 30; }
  if (ms.transcend) { b.atkPct += 50; b.defPct += 50; b.hpPct += 50; }
  return b;
}

// ── 公會加成 ──
function getGuildBonus() {
  if (!S.guild.id) return {atkPct:0,crit:0,critDmg:0,exp:0,gold:0};
  const g = GUILDS[S.guild.id];
  if (!g) return {atkPct:0,crit:0,critDmg:0,exp:0,gold:0};
  return {
    atkPct: g.bonus.atkPct || 0,
    crit:   g.bonus.crit || 0,
    critDmg:g.bonus.critDmg || 0,
    exp:    g.bonus.exp || 0,
    gold:   g.bonus.gold || 0,
  };
}

// ── 寵物加成（被動）──
function getPetBonus() {
  if (!S.activePet || !S.pets[S.activePet]) return {atkPct:0,exp:0,gold:0,crit:0,lifesteal:0,regen:0};
  const p = PETS[S.activePet];
  const pet = S.pets[S.activePet];
  const lvBonus = 1 + (pet.level - 1) * 0.05; // 每級 +5% 效果
  const b = {atkPct:0,exp:0,gold:0,crit:0,lifesteal:0,regen:0};
  switch(S.activePet) {
    case 'goblin':  b.gold += 10 * lvBonus; break;
    case 'wolf':    b.crit += 5 * lvBonus; break;
    case 'mage':    b.exp += 15 * lvBonus; break;
    case 'dragon':  b.atkPct += 5 * lvBonus; break;
    case 'phoenix': b.regen += 2 * lvBonus; break;
    case 'demon':   b.lifesteal += 10 * lvBonus; break;
    case 'god':     b.atkPct += 20 * lvBonus; break;
  }
  return b;
}

// ── 有效屬性（含所有加成） ──
function effAtk() {
  const t = getTalentBonus(), b = getBreakthroughBonus(),
        g = getGuildBonus(), p = getPetBonus();
  return Math.floor(S.atk * (1 + (t.atkPct + b.atkPct + g.atkPct + p.atkPct)/100));
}
function effDef() {
  const t = getTalentBonus(), b = getBreakthroughBonus();
  return Math.floor(S.def * (1 + (t.defPct + b.defPct)/100));
}
function effMaxHp() {
  const t = getTalentBonus(), b = getBreakthroughBonus();
  return Math.floor(S.maxHp * (1 + (t.hpPct + b.hpPct)/100));
}
function effDodge()    { return S.playerDodge + getTalentBonus().dodge; }
function effCritRate() {
  const t = getTalentBonus(), b = getBreakthroughBonus(), g = getGuildBonus(), p = getPetBonus();
  return S.critRate + t.crit + b.crit + g.crit + p.crit;
}
function effCritDmg() {
  const t = getTalentBonus(), b = getBreakthroughBonus(), g = getGuildBonus();
  return S.critDmg + t.critDmg + b.critDmg + g.critDmg;
}

// ── 突破花費 / 執行 ──
function breakthroughCost() { return 500 * ((S.breakthroughLevel || 0) + 1); }
function doBreakthrough() {
  if (!allTalentsMaxed()) { log('需要先將所有天賦點滿！', 'lose'); return; }
  if ((S.breakthroughPoints || 0) <= 0) { log('沒有突破點！', 'lose'); return; }
  const cost = breakthroughCost();
  if (S.money < cost) { log(`金幣不足！需要 ${cost} 金。`, 'lose'); return; }
  S.money -= cost;
  S.breakthroughPoints--;
  S.breakthroughLevel = (S.breakthroughLevel || 0) + 1;
  const ms = BREAKTHROUGH_MILESTONES[S.breakthroughLevel];
  if (ms && !S.breakthroughMilestones[ms.key]) {
    S.breakthroughMilestones[ms.key] = true;
    log(`✦ 突破里程碑 Lv.${S.breakthroughLevel}：${ms.name}！`, 'win');
  }
  log(`✦ 突破成功！突破等級 Lv.${S.breakthroughLevel}`, 'win');
  renderTalent();
  updateTownUI();
  checkAchievements();
}

// ── 職業技能查詢 ──
function getRoleSkill() {
  const role = ROLES[S.roleType];
  if (!role || !role.skills) return null;
  const rLv = S.roleLevel || 1;
  let usable = null;
  for (const sk of role.skills) if (rLv >= sk.lv) usable = sk;
  return usable;
}
function roleExpNeeded(lv) { return Math.floor(80 * Math.pow(lv, 1.3)); }
function gainRoleExp(baseExp) {
  if (!S.roleType) return 0;
  S.roleExp = (S.roleExp || 0) + baseExp;
  while (S.roleExp >= roleExpNeeded(S.roleLevel || 1)) {
    S.roleExp -= roleExpNeeded(S.roleLevel || 1);
    S.roleLevel = (S.roleLevel || 1) + 1;
    const role = ROLES[S.roleType];
    const unlocked = role.skills.find(sk => sk.lv === S.roleLevel);
    if (unlocked) log(`⭐ ${role.name} 解鎖新技能：${unlocked.name}！`, 'talent-text');
  }
  return baseExp;
}

// ── 裝備生成 ──
function pickRarity(bonus = 0) {
  const r = Math.random() * 100 - bonus;
  if (r < 1) return 6;
  if (r < 5) return 5;
  if (r < 15) return 4;
  if (r < 35) return 3;
  if (r < 65) return 2;
  return 1;
}
function genEquipment(level, forcedRarity) {
  const rarity = forcedRarity || pickRarity(0);
  const rar = RARITY[rarity];
  const slotKeys = ['weapon','armor','accessory'];
  const slot = slotKeys[rand(0,2)];
  const sd = SLOT_DATA[slot];
  const name = sd.pre[rand(0,sd.pre.length-1)] + sd.base[rand(0,sd.base.length-1)];
  const affixes = [];
  if (slot === 'weapon') {
    const v = Math.round((5 + level*1.5) * rar.mult);
    affixes.push({stat:'atk',val:v,label:`攻擊 +${v}`});
  } else if (slot === 'armor') {
    const v = Math.round((20 + level*6) * rar.mult);
    affixes.push({stat:'hp',val:v,label:`生命 +${v}`});
  } else {
    const v = Math.round((3 + level*1) * rar.mult);
    const types = [
      {stat:'atk',val:v,label:`攻擊 +${v}`},
      {stat:'hp',val:Math.round(v*5),label:`生命 +${Math.round(v*5)}`},
      {stat:'crit',val:Math.max(1,Math.round(v/3)),label:`爆擊率 +${Math.max(1,Math.round(v/3))}%`},
    ];
    affixes.push(types[rand(0,types.length-1)]);
  }
  const used = new Set(affixes.map(a=>a.stat));
  for (let i = 0; i < rar.affixes; i++) {
    let tries = 0;
    while (tries++ < 20) {
      const a = AFFIX_POOL[rand(0,AFFIX_POOL.length-1)];
      if (used.has(a.stat)) continue;
      const v = Math.max(1, Math.round((a.base + level*a.scale) * rar.mult));
      affixes.push({stat:a.stat,val:v,label:`${a.label} +${v}${a.pct?'%':''}`});
      used.add(a.stat);
      break;
    }
  }
  return {uid:'eq_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),slot,name,rarity,level,affixes};
}

function applyEquipStats(item, sign = 1) {
  if (!item) return;
  for (const a of item.affixes) {
    switch(a.stat) {
      case 'atk':       S.atk += sign * a.val; break;
      case 'def':       S.def += sign * a.val; break;
      case 'hp':        S.maxHp += sign * a.val; if (sign>0) S.hp += a.val; break;
      case 'crit':      S.critRate += sign * a.val; break;
      case 'critDmg':   S.critDmg += sign * a.val; break;
      case 'lifesteal': S.lifesteal += sign * a.val; break;
      case 'reflect':   S.reflect += sign * a.val; break;
      case 'dodge':     S.playerDodge += sign * a.val; break;
      case 'gold':      S.goldBonus += sign * a.val; break;
      case 'exp':       S.expBonus += sign * a.val; break;
    }
  }
  if (S.hp > effMaxHp()) S.hp = effMaxHp();
}

// ── 成就 ──
const ACHIEVEMENTS = {
  firstBlood:{name:'初試啼聲',desc:'擊殺第一隻怪物',check:()=>S.killCount>=1},
  kill10:{name:'小有成就',desc:'累積擊殺 10 隻怪物',check:()=>S.killCount>=10},
  kill100:{name:'百人斬',desc:'累積擊殺 100 隻怪物',check:()=>S.killCount>=100},
  kill1000:{name:'千人斬',desc:'累積擊殺 1000 隻怪物',check:()=>S.killCount>=1000},
  lv10:{name:'嶄露頭角',desc:'達到 Lv.10',check:()=>S.level>=10},
  lv30:{name:'老練勇者',desc:'達到 Lv.30',check:()=>S.level>=30},
  lv50:{name:'傳說英雄',desc:'達到 Lv.50',check:()=>S.level>=50},
  lv100:{name:'神話人物',desc:'達到 Lv.100',check:()=>S.level>=100},
  rich:{name:'小富翁',desc:'持有 10000 金幣',check:()=>S.money>=10000},
  richer:{name:'大富翁',desc:'持有 100000 金幣',check:()=>S.money>=100000},
  fruit1:{name:'果實初體驗',desc:'抽到第一顆果實',check:()=>Object.keys(S.fruits).length>=1},
  fruit5:{name:'果實收藏家',desc:'收集 5 種果實',check:()=>Object.keys(S.fruits).length>=5},
  fruitAll:{name:'果實大師',desc:'收集全部 10 種果實',check:()=>Object.keys(S.fruits).length>=10},
  boss1:{name:'首領挑戰者',desc:'擊敗第 1 章 BOSS',check:()=>S.chapter>=2},
  boss5:{name:'世界救世主',desc:'通關全部章節',check:()=>S.chapter>=6},
  combo10:{name:'連擊新手',desc:'單場達成 10 連擊',check:()=>S.maxCombo>=10},
  combo30:{name:'連擊大師',desc:'單場達成 30 連擊',check:()=>S.maxCombo>=30},
  abyss10:{name:'深淵探索者',desc:'深淵抵達第 10 層',check:()=>S.abyssBest>=10},
  abyss30:{name:'深淵征服者',desc:'深淵抵達第 30 層',check:()=>S.abyssBest>=30},
  abyss100:{name:'深淵主宰',desc:'深淵抵達第 100 層',check:()=>S.abyssBest>=100},
  equip6:{name:'神裝上身',desc:'裝備一件神話裝備',check:()=>Object.values(S.equipment).some(e=>e&&e.rarity===6)},
  fullEquip:{name:'裝備齊全',desc:'三個部位都裝備',check:()=>Object.values(S.equipment).every(e=>e)},
  pet1:{name:'第一隻寵物',desc:'獲得第一隻寵物',check:()=>Object.keys(S.pets).length>=1},
  pet5:{name:'寵物大師',desc:'收集 5 種寵物',check:()=>Object.keys(S.pets).length>=5},
  petAll:{name:'寵物收藏家',desc:'收集全部 8 種寵物',check:()=>Object.keys(S.pets).length>=8},
  guild1:{name:'加入公會',desc:'加入任意公會',check:()=>!!S.guild.id},
  dungeon1:{name:'副本新手',desc:'完成一次副本',check:()=>S.dungeon.cleared>=1},
  dungeon5:{name:'副本專家',desc:'完成 5 次副本',check:()=>(S.dungeon.cleared||0)>=5},
};

function checkAchievements() {
  for (const [id, a] of Object.entries(ACHIEVEMENTS)) {
    if (S.achievements[id]) continue;
    if (a.check()) {
      S.achievements[id] = true;
      popupAchievement(a.name, a.desc);
      log(`🏆 成就解鎖：${a.name}`, 'ach-text');
    }
  }
}
function popupAchievement(name, desc) {
  const el = document.createElement('div');
  el.className = 'achievement-popup';
  el.innerHTML = `<div class="ach-icon">🏆</div>
    <div><div class="ach-title">成就解鎖！</div>
    <div class="ach-name">${name}</div>
    <div class="ach-desc">${desc}</div></div>`;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add('show'), 50);
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 500); }, 3500);
}

// ── 村莊 UI 更新 ──
function updateTownUI() {
  $('townRole').textContent = S.roleName;
  $('townLevel').textContent = S.level;
  $('townRoleLv').textContent = S.roleLevel || 1;
  $('townBkLv').textContent = S.breakthroughLevel || 0;
  $('townHp').textContent = `${S.hp}/${effMaxHp()}`;
  $('townMoney').textContent = S.money;
  $('townAtk').textContent = effAtk();
  $('townDef').textContent = effDef();
  $('townPotion').textContent = S.potion;
  $('townChapter').textContent = S.chapter;
  $('townExp').textContent = `${S.exp}/${S.expNeeded}`;
  $('townKill').textContent = S.killCount;
  $('townTalent').textContent = S.talentPoints;
  $('townAbyss').textContent = S.abyssBest;
  $('townGuild').textContent = S.guild.id ? GUILDS[S.guild.id].name : '無';
  $('townPet').textContent = S.activePet ? PETS[S.activePet].name : '無';
}
