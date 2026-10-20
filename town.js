// ============================================================
//  ★ 村莊 — 商店、果實、裝備、天賦、深淵、轉職、合成
// ============================================================

// ── 子選單切換 ──
function openTrainMenu()   { showScreen('screen-train'); }
function openCollectMenu() { showScreen('screen-collect'); }
function openSystemMenu()  { showScreen('screen-system'); }
function backToTown()      { updateTownUI(); showScreen('screen-town'); }

// ── 商店 ──
function openShop() { showScreen('screen-shop'); renderShop(); }
function closeShop() { updateTownUI(); showScreen('screen-town'); }

// ============================================================
//  ★ 商店批量購買
// ============================================================
let shopBatch = 1;

function setShopBatch(n) {
  shopBatch = n;
  document.querySelectorAll('.batch-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.batch === String(n));
  });
  renderShop();
}

function renderShop() {
  $('shopMoney').textContent = `（金幣：${S.money}）`;
  const items = [];

  / ── 武器強化 ──
  items.push({
    name: '強化武器',
    desc: () => `Lv.${formatNumber(S.swordLevel)}（+${formatNumber(5 + S.swordLevel * 2)} 攻擊）`,
    cost: () => S.swordLevel === 0 ? 50 : 50 + S.swordLevel * 30,
    maxCount: () => {
      // 用數學公式直接反推，無視上限
      let lv = S.swordLevel;
      if (lv === 0) return S.money >= 50 ? 1 : 0;
      const a = 50 + lv * 30;
      const d = 30;
      return Math.max(0, Math.floor((-a + Math.sqrt(a*a + 2*d*S.money)) / d));
    },
    singleAction: () => {
      const cost = S.swordLevel === 0 ? 50 : 50 + S.swordLevel * 30;
      S.atk += 5 + S.swordLevel * 2; S.money -= cost; S.swordLevel++;
    },
    batchAction: (n) => {
      // 一次加完，不跑迴圈
      const totalCost = n * (50 + S.swordLevel * 30) + 15 * n * (n - 1);
      const totalGain = n * 5 + S.swordLevel * 2 * n + n * (n - 1);
      S.money -= totalCost;
      S.atk += totalGain;
      S.swordLevel += n;
      return `武器強化 ${formatNumber(n)} 次！攻擊力共 +${formatNumber(totalGain)}`;
    },
    logClass: 'win',
  });

  // ── 護甲強化 ──
  items.push({
    name: '強化護甲',
    desc: () => `Lv.${formatNumber(S.shieldLevel)}（+${formatNumber(3 + S.shieldLevel * 2)} 防禦）`,
    cost: () => S.shieldLevel === 0 ? 50 : 50 + S.shieldLevel * 30,
    maxCount: () => {
      let lv = S.shieldLevel;
      if (lv === 0) return S.money >= 50 ? 1 : 0;
      const a = 50 + lv * 30;
      const d = 30;
      return Math.max(0, Math.floor((-a + Math.sqrt(a*a + 2*d*S.money)) / d));
    },
    singleAction: () => {
      const cost = S.shieldLevel === 0 ? 50 : 50 + S.shieldLevel * 30;
      S.def += 3 + S.shieldLevel * 2; S.money -= cost; S.shieldLevel++;
    },
    batchAction: (n) => {
      const totalCost = n * (50 + S.shieldLevel * 30) + 15 * n * (n - 1);
      const totalGain = n * 3 + S.shieldLevel * 2 * n + n * (n - 1);
      S.money -= totalCost;
      S.def += totalGain;
      S.shieldLevel += n;
      return `護甲強化 ${formatNumber(n)} 次！防禦力共 +${formatNumber(totalGain)}`;
    },
    logClass: 'win',
  });

  // ── 體力強化 ──
  items.push({
    name: '增加體力',
    desc: () => '+20 最大血量',
    cost: () => 50,
    maxCount: () => Math.floor(S.money / 50), // 直接除，沒有上限
    singleAction: () => { S.maxHp += 20; S.hp = effMaxHp(); S.money -= 50; },
    batchAction: (n) => {
      S.maxHp += 20 * n;
      S.hp = effMaxHp();
      S.money -= 50 * n;
      return `體力強化 ${formatNumber(n)} 次！最大 HP +${formatNumber(20*n)}`;
    },
    logClass: 'win',
  });

  // ── 治療藥水 ──
  items.push({
    name: '治療藥水',
    desc: () => '戰鬥中回復 40% HP',
    cost: () => 100,
    maxCount: () => Math.floor(S.money / 100),
    singleAction: () => { S.potion++; S.money -= 100; },
    batchAction: (n) => {
      S.potion += n;
      S.money -= 100 * n;
      return `購買 ${n} 瓶藥水！（目前 ${S.potion} 瓶）`;
    },
    logClass: 'win',
  });

        // ── 惡魔契約 ──
    items.push({
      name: '簽訂惡魔契約',
      desc: () => `+${formatNumber(250 + S.contractLevel * 100)} 攻擊 / -${formatNumber(100 + S.contractLevel * 50)} HP`,
      cost: () => S.contractLevel === 0 ? 500 : 500 + S.contractLevel * 500,
      maxCount: () => {
        // 這裡因為 HP 有上限保護，我們就固定給 50000 次，直接算完
        return Math.min(50000, Math.floor(S.money / (500 + S.contractLevel * 500)));
      },
      singleAction: () => {
        S.atk += 250 + S.contractLevel * 100;
        S.maxHp -= 100 + S.contractLevel * 50;
        S.money -= 500 + S.contractLevel * 500;
        S.contractLevel++;
        if (S.maxHp < 100) S.maxHp = 100;
        if (S.hp > effMaxHp()) S.hp = effMaxHp();
      },
      batchAction: (n) => {
        let totalAtk = 0;
        for (let i = 0; i < n; i++) {
          S.atk += 250 + S.contractLevel * 100;
          S.maxHp -= 100 + S.contractLevel * 50;
          S.money -= 500 + S.contractLevel * 500;
          S.contractLevel++;
        }
        if (S.maxHp < 100) S.maxHp = 100;
        if (S.hp > effMaxHp()) S.hp = effMaxHp();
        return `簽訂 ${formatNumber(n)} 層契約！`;
      },
      logClass: 'skill-text',
    });

      // ── 時空學習秘典 ──
    items.push({
      name: '時空學習秘典',
      desc: () => `經驗 +${S.expShopLevel === 0 ? 20 : 15}%`,
      cost: () => S.expShopLevel === 0 ? 600 : 600 + S.expShopLevel * 500,
      maxCount: () => {
        // 等比數列，用數學公式一次算完
        let lv = S.expShopLevel;
        if (lv === 0) return S.money >= 600 ? 1 : 0;
        return Math.max(0, Math.floor((Math.sqrt(500*500 + 4*500*(S.money + 600)) - 500) / 1000));
      },
      singleAction: () => {
        const cost = S.expShopLevel === 0 ? 600 : 600 + S.expShopLevel * 500;
        S.playexp += S.expShopLevel === 0 ? 20 : 15;
        S.money -= cost; S.expShopLevel++;
      },
      batchAction: (n) => {
        let totalGain = 0;
        for (let i = 0; i < n; i++) {
          S.playexp += S.expShopLevel === 0 ? 20 : 15;
          S.money -= (S.expShopLevel === 0 ? 600 : 600 + S.expShopLevel * 500);
          S.expShopLevel++;
          totalGain += (S.expShopLevel === 0 ? 20 : 15);
        }
        return `閱讀秘典 ${formatNumber(n)} 次！經驗加成 +${formatNumber(totalGain)}%`;
      },
      logClass: 'win',
    });

  // ── 隨機裝備 ──
  items.push({
    name: '🛒 購買隨機裝備',
    desc: () => '依等級生成隨機裝備',
    cost: () => 200 + S.level * 20,
    maxCount: () => 1,
    singleAction: () => {
      const cost = 200 + S.level * 20;
      const item = genEquipment(S.level, pickRarity(S.level/5));
      S.inventory.push(item);
      S.money -= cost;
      log(`獲得裝備：${item.name}`,'win');
    },
    batchAction: (n) => {
      const cost = 200 + S.level * 20;
      for (let i = 0; i < n; i++) {
        const item = genEquipment(S.level, pickRarity(S.level/5));
        S.inventory.push(item);
        S.money -= cost;
      }
      return `購買 ${n} 件隨機裝備`;
    },
    logClass: 'win',
    noBatch: true,
  });

  // ── 繪製清單 ──
  const list = $('shopList');
  list.innerHTML = '';
  items.forEach(it => {
    const unitCost = it.cost();
    const maxCount = it.maxCount ? it.maxCount() : 1;
    let count = shopBatch === 'max' ? maxCount : shopBatch;
    if (it.noBatch) count = Math.min(count, 1);
    if (count > maxCount) count = maxCount;
    if (count < 0) count = 0;
    const totalCost = unitCost * count;
    const canBuy = count > 0 && S.money >= totalCost;

    const row = document.createElement('div');
    row.className = 'shop-item';

    let countText = '';
    if (shopBatch === 'max') countText = `（可買 ${maxCount} 個）`;
    else if (count > 0 && count !== shopBatch) countText = `（買 ${count} 個，金幣不足）`;
    else if (count > 0) countText = `（買 ${count} 個）`;
    else countText = `（金幣不足）`;

    row.innerHTML = `
      <div style="flex:1;">
        <div style="font-weight:bold;">${it.name}</div>
        <div class="subtitle">${it.desc()}</div>
      </div>
      <div style="text-align:right;white-space:nowrap;">
        <div class="cost">${totalCost.toLocaleString()} 金 <span class="buy-preview">${countText}</span></div>
        <button class="small" ${canBuy?'':'disabled'}>購買 ×${count}</button>
      </div>
    `;

    row.querySelector('button').onclick = () => {
      if (!canBuy) { log('金幣不足！','lose'); return; }
      if (count === 1) {
        it.singleAction();
        log(`${it.name} 完成！`, it.logClass || 'win');
      } else {
        const msg = it.batchAction(count);
        if (msg) log(`【批量】${msg}`, it.logClass || 'win');
      }
      renderShop();
      updateTownUI();
      checkAchievements();
    };
    list.appendChild(row);
  });
}

// ── 果實 ──
let fruitTab = 'draw';
function openFruit() { showScreen('screen-fruit'); renderFruit(); }
function closeFruit() { updateTownUI(); showScreen('screen-town'); }
function switchFruitTab(t) {
  fruitTab = t;
  document.querySelectorAll('#screen-fruit .tab').forEach(x => x.classList.toggle('active', x.dataset.tab === t));
  renderFruit();
}
function drawCost() {
  if (S.level < 15) return null;
  if (S.level < 50) return 500;
  if (S.level < 100) return 1500;
  return 3000;
}
function fruitExpNeeded(lv) { return Math.floor(100 * Math.pow(lv, 1.4)); }
function gainFruitExp(baseExp) {
  if (!S.activeFruit || !S.fruits[S.activeFruit]) return 0;
  const data = S.fruits[S.activeFruit];
  const f = FRUITS[S.activeFruit];
  if (!f || !data) return 0;
  const gained = Math.max(1, Math.floor(baseExp));
  data.exp += gained;
  while (data.exp >= fruitExpNeeded(data.level)) {
    data.exp -= fruitExpNeeded(data.level);
    data.level++;
    const unlocked = f.skills.find(sk => sk.lv === data.level);
    if (unlocked) log(`🍇 ${f.name} 解鎖新技能：${unlocked.name}！`, 'fruit-text');
  }
  return gained;
}
function pickFruit() {
  const total = FRUIT_POOL.reduce((s,p)=>s+p.weight,0);
  let r = Math.random() * total;
  for (const p of FRUIT_POOL) { r -= p.weight; if (r <= 0) return p.id; }
  return FRUIT_POOL[0].id;
}
function renderFruit() {
  $('fruitMoney').textContent = `（金幣：${S.money}）`;
  const c = $('fruitContent');
  if (fruitTab === 'draw') {
    const cost = drawCost();
    if (cost === null) {
      c.innerHTML = `<div class="subtitle" style="padding:20px;text-align:center;">🍇 需要達到 <b style="color:#ffd54f;">Lv.15</b> 才能開始抽果實！<br>（目前 Lv.${S.level}）</div>`;
      return;
    }
    c.innerHTML = `<div style="text-align:center;padding:10px;">
      <div class="subtitle">每次抽果消耗 <b style="color:#ffd54f;">${cost} 金幣</b></div>
      <div class="subtitle" style="margin-bottom:10px;">目前等級 Lv.${S.level}｜金幣 ${S.money}</div>
      <div class="actions">
        <button class="fruit" onclick="drawFruit(1)">抽 1 次（${cost} 金）</button>
        <button class="fruit" onclick="drawFruit(10)">抽 10 次（${cost*10} 金）</button>
      </div>
    </div>`;
    return;
  }
  if (fruitTab === 'bag') {
    const owned = Object.keys(S.fruits);
    if (!owned.length) { c.innerHTML = `<div class="subtitle" style="padding:20px;text-align:center;">🎒 背包空空如也</div>`; return; }
    c.innerHTML = owned.map(id => {
      const f = FRUITS[id], data = S.fruits[id];
      const isActive = S.activeFruit === id;
      const skills = f.skills.map(sk => {
        const unlocked = data.level >= sk.lv;
        return `<div class="fruit-skill" style="color:${unlocked?'#80cbc4':'#555'}">${unlocked?'✓':'🔒'} Lv.${sk.lv} ${sk.name}｜${sk.desc}（CD ${sk.cd}）</div>`;
      }).join('');
      return `<div class="fruit-card ${isActive?'active':''}">
        <div class="fruit-name">${f.icon} ${f.name}</div>
        <div class="fruit-lv">Lv.${data.level}｜經驗 ${data.exp}｜屬性：${elemName(f.element)}</div>
        <div class="fruit-bar"><div class="fruit-bar-fill" style="width:${Math.min(100, Math.floor(data.exp/fruitExpNeeded(data.level)*100))}%"></div></div>
        <div class="subtitle">${f.desc}</div>${skills}
        <div style="margin-top:8px;">${isActive?'<button class="gold small" onclick="unequipFruit()">卸下</button>':`<button class="fruit small" onclick="equipFruit('${id}')">裝備</button>`}</div>
      </div>`;
    }).join('');
    return;
  }
}
function drawFruit(times) {
  const cost = drawCost() * times;
  if (S.money < cost) { log('金幣不足！','lose'); return; }
  S.money -= cost;
  if (typeof addGuildProgress === 'function') addGuildProgress('fruitDraw', times);
  const results = [];
  for (let i = 0; i < times; i++) {
    const id = pickFruit();
    if (!S.fruits[id]) { S.fruits[id] = {level:1,exp:0}; results.push({id,isNew:true}); }
    else {
      S.fruits[id].exp += 50;
      while (S.fruits[id].exp >= fruitExpNeeded(S.fruits[id].level)) {
        S.fruits[id].exp -= fruitExpNeeded(S.fruits[id].level);
        S.fruits[id].level++;
      }
      results.push({id,isNew:false});
    }
  }
  const c = $('fruitContent');
  let html = `<div style="text-align:center;margin-bottom:10px;"><b style="color:#ffd54f;">抽果結果</b></div>`;
  html += results.map(r => {
    const f = FRUITS[r.id];
    return `<div class="fruit-card"><span class="fruit-name">${f.icon} ${f.name}</span>${r.isNew?'<span style="color:#4caf50;font-size:12px;"> NEW!</span>':'<span style="color:#888;font-size:12px;">（重複 +50經驗）</span>'}</div>`;
  }).join('');
  html += `<div class="actions"><button class="fruit" onclick="renderFruit()">返回</button></div>`;
  c.innerHTML = html;
  log(`抽果 ${times} 次，消耗 ${cost} 金幣。`, 'fruit-text');
  updateTownUI();
  checkAchievements();
}
function equipFruit(id) { S.activeFruit = id; renderFruit(); }
function unequipFruit() { S.activeFruit = null; renderFruit(); }

// ── 裝備 UI ──
let equipTab = 'worn';
function openEquip() { showScreen('screen-equip'); renderEquip(); }
function closeEquip() { updateTownUI(); showScreen('screen-town'); }
function switchEquipTab(t) {
  equipTab = t;
  document.querySelectorAll('#screen-equip .tab').forEach(x => x.classList.toggle('active', x.dataset.tab === t));
  renderEquip();
}
function renderEquip() {
  $('equipMoney').textContent = `（金幣：${S.money}｜背包 ${S.inventory.length} 件）`;
  const c = $('equipContent');
  const itemHTML = (item, actions = true) => {
    if (!item) return '';
    const rar = RARITY[item.rarity];
    const affixHTML = item.affixes.map(a => `<span class="equip-affix">${a.label}</span>`).join('');
    return `<div class="equip-bag-item">
      <div style="flex:1;">
        <div class="equip-item-name rarity-${item.rarity}">${item.name} <span class="subtitle">[${rar.name}] Lv.${item.level}</span></div>
        <div>${affixHTML}</div>
      </div>
      ${actions?`<div style="white-space:nowrap;">
        <button class="small gold" onclick="equipItemById('${item.uid}')">裝備</button>
        <button class="small danger" onclick="sellItemById('${item.uid}')">賣出</button>
      </div>`:''}
    </div>`;
  };
  if (equipTab === 'worn') {
    let html = '';
    for (const slot of ['weapon','armor','accessory']) {
      const item = S.equipment[slot];
      const sd = SLOT_DATA[slot];
      html += `<div class="equip-slot">
        <span class="slot-name">${sd.name}</span>
        <div style="flex:1;">${item ? itemHTML(item, false) : '<span class="subtitle">（未裝備）</span>'}</div>
        ${item?`<button class="small danger" onclick="unequipSlotById('${slot}')">卸下</button>`:''}
      </div>`;
    }
    const total = {atk:0,def:0,hp:0,crit:0,critDmg:0};
    for (const slot of ['weapon','armor','accessory']) {
      const item = S.equipment[slot];
      if (!item) continue;
      for (const a of item.affixes) if (a.stat in total) total[a.stat] += a.val;
    }
    html += `<div style="margin-top:12px;padding-top:10px;border-top:1px solid #2a2a3a;">
      <div class="subtitle">── 裝備總加成 ──</div>
      <div class="stat-row"><span>攻擊 +${total.atk}</span><span>防禦 +${total.def}</span><span>生命 +${total.hp}</span></div>
      <div class="stat-row"><span>爆擊 +${total.crit}%</span><span>爆傷 +${total.critDmg}%</span></div>
    </div>`;
    c.innerHTML = html;
    return;
  }
  if (equipTab === 'bag') {
    if (!S.inventory.length) {
      c.innerHTML = `<div class="subtitle" style="padding:20px;text-align:center;">🎒 背包沒有裝備</div>`;
      return;
    }
    const sorted = [...S.inventory].sort((a,b) => b.rarity - a.rarity || b.level - a.level);
    c.innerHTML = sorted.map(item => itemHTML(item, true)).join('');
  }
}
function equipItemById(uid) { const item = S.inventory.find(i => i.uid === uid); if (item) equipItem(item); }
function sellItemById(uid) { const item = S.inventory.find(i => i.uid === uid); if (item) sellItem(item); }
function unequipSlotById(slot) { unequipSlot(slot); }
function equipItem(item) {
  const slot = item.slot;
  const old = S.equipment[slot];
  if (old) { applyEquipStats(old, -1); S.inventory.push(old); }
  S.inventory = S.inventory.filter(i => i.uid !== item.uid);
  S.equipment[slot] = item;
  applyEquipStats(item, 1);
  log(`裝備了 ${item.name}`, 'win');
  checkAchievements();
  renderEquip();
}
function unequipSlot(slot) {
  const old = S.equipment[slot];
  if (!old) return;
  applyEquipStats(old, -1);
  S.inventory.push(old);
  S.equipment[slot] = null;
  renderEquip();
}
function sellItem(item) {
  const price = (5 + item.level * 3) * item.rarity;
  S.money += price;
  S.inventory = S.inventory.filter(i => i.uid !== item.uid);
  log(`賣出 ${item.name}，獲得 ${price} 金幣。`, 'loot');
  renderEquip();
  updateTownUI();
}

// ── 天賦樹 ──
function openTalent() { showScreen('screen-talent'); renderTalent(); }
function closeTalent() { updateTownUI(); showScreen('screen-town'); }
function renderTalent() {
  $('talentPoints').textContent = `（可用點數：${S.talentPoints}）`;
  const branches = {
    atk: {name:'⚔ 攻擊', color:'#f44336'},
    def: {name:'🛡 防禦', color:'#4fc3f7'},
    util:{name:'✨ 特殊', color:'#ffd54f'},
  };
  let html = '';
  for (const [bid, br] of Object.entries(branches)) {
    html += `<div class="talent-branch"><div class="talent-branch-title" style="color:${br.color};">${br.name}</div>`;
    for (const [tid, t] of Object.entries(TALENTS)) {
      if (t.branch !== bid) continue;
      const lv = S.talents[tid] || 0;
      const canUp = lv < t.max && S.talentPoints > 0;
      html += `<div class="talent-item"><div class="talent-info">
        <div class="talent-name">${t.name} <span class="talent-lv">Lv.${lv}/${t.max}</span></div>
        <div class="talent-desc">${t.desc(lv)}</div></div>
        <button class="talent small" ${canUp?'':'disabled'} onclick="upgradeTalent('${tid}')">+1</button></div>`;
    }
    html += `</div>`;
  }
  // ★ 天賦全滿時顯示兌換區
  if (allTalentsMaxed() && S.talentPoints > 0) {
    html += `<div class="talent-branch" style="border-color:#ffd54f;background:linear-gradient(135deg,#1a1a10,#2a2a10);">
      <div class="talent-branch-title" style="color:#ffd54f;">✨ 天賦點兌換</div>
      <div class="subtitle">天賦已全滿，剩下的天賦點可以兌換其他資源。</div>
      <div class="stat-row" style="margin-top:8px;">
        <span>可用天賦點：<span style="color:#ffd54f;font-weight:bold;">${S.talentPoints}</span></span>
      </div>
      <div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:8px;">
        <button class="talent small" style="background:#f9a825;color:#111;" onclick="exchangeTalent('money')">
          💰 1 天賦點 → 5,000 金
        </button>
        <button class="talent small" style="background:#8e24aa;" onclick="exchangeTalent('bp')">
          ✦ 1 天賦點 → 1 突破點
        </button>
        <button class="talent small" style="background:#00897b;" onclick="exchangeTalent('potion')">
          🧪 1 天賦點 → 5 藥水
        </button>
        <button class="talent small" style="background:#c62828;" onclick="exchangeTalentAll('bp')">
          ✦✦ 全部換突破點
        </button>
        <button class="talent small" style="background:#1565c0;" onclick="exchangeTalentAll('money')">
          💰 全部換金幣
        </button>
      </div>
    </div>`;
  }
  html += renderBreakthroughSection();
  $('talentContent').innerHTML = html;
}

function renderBreakthroughSection() {
  const bkLv = S.breakthroughLevel || 0;
  const bkPt = S.breakthroughPoints || 0;
  const cost = breakthroughCost();
  const maxed = allTalentsMaxed();
  const canBreak = maxed && bkPt > 0 && S.money >= cost;

  // 計算 Max 能升幾級
  let maxLevels = 0;
  if (maxed && bkPt > 0) {
    let tempLv = bkLv, tempMoney = S.money, tempBp = bkPt;
    while (tempBp > 0) {
      const lvCost = tempLv < 50 ? 500 * (tempLv + 1) : 500 * 50 + 100 * (tempLv - 49);
      if (tempMoney < lvCost) break;
      tempMoney -= lvCost;
      tempLv++;
      tempBp--;
      maxLevels++;
      if (maxLevels > 10000) break;
    }
  }
  const canBreakMax = maxed && bkPt > 0 && maxLevels > 0;

  let html = `<div class="talent-branch" style="border-color:#ff5252;background:linear-gradient(135deg,#151520,#2a1a1a);">
    <div class="talent-branch-title" style="color:#ff5252;">✦ 突破系統</div>
    <div class="stat-row">
      <span>突破等級：<span style="color:#ff5252;font-weight:bold;">Lv.${bkLv}</span></span>
      <span>突破點：<span style="color:#ffd54f;font-weight:bold;">${bkPt}</span></span>
    </div>
    <div class="subtitle" style="margin-top:6px;color:${maxed?'#4caf50':'#ff9800'};">
      ${maxed ? '✓ 天賦已全部點滿，每次升級 +1 突破點' : '⚠ 需要先將所有天賦點滿才可突破'}
    </div>
    <div class="subtitle" style="margin-top:8px;color:#4fc3f7;">
      每級加成：攻擊/防禦/HP +2%、爆擊 +3%、爆傷 +5%、經驗/金幣 +3%
    </div>
    <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:8px;">
      <button class="talent" style="background:#c62828;" ${canBreak?'':'disabled'} onclick="doBreakthrough()">
        ✦ +1
      </button>
      <button class="talent" style="background:#ef6c00;" ${canBreak?'':'disabled'} onclick="doBreakthroughCustom(100)">
        ✦ +100
      </button>
      <button class="talent" style="background:#f9a825;color:#111;" ${canBreak?'':'disabled'} onclick="doBreakthroughCustom(1000)">
        ✦ +1000
      </button>
      <button class="talent" style="background:#8e24aa;" ${canBreakMax?'':'disabled'} onclick="doBreakthroughMax()">
        ✦✦ Max
      </button>
    </div>`;

  // 突破點兌換區
  if (bkPt >= 5) {
    html += `<div style="margin-top:12px;padding-top:10px;border-top:1px solid #2a2a3a;">
      <div class="subtitle" style="margin-bottom:8px;">── 突破點兌換 ──</div>
      <div class="actions">
        ${bkPt >= 10 ? `<button class="talent small" style="background:#f9a825;color:#111;" onclick="exchangeBreakthrough('money')">
          💰 10 突破點 → 50,000 金幣
        </button>` : ''}
        ${bkPt >= 5 ? `<button class="talent small" style="background:#00897b;" onclick="exchangeBreakthrough('potion')">
          🧪 5 突破點 → 3 藥水
        </button>` : ''}
      </div>
    </div>`;
  }

  html += `<div style="margin-top:14px;padding-top:10px;border-top:1px solid #2a2a3a;">
    <div class="subtitle" style="margin-bottom:8px;">── 里程碑 ──</div>`;

  for (const [lv, ms] of Object.entries(BREAKTHROUGH_MILESTONES)) {
    const unlocked = S.breakthroughMilestones && S.breakthroughMilestones[ms.key];
    const reached = bkLv >= parseInt(lv);
    const color = unlocked ? '#4caf50' : reached ? '#ffd54f' : '#888';
    const icon = unlocked ? '✓' : reached ? '★' : '🔒';
    html += `<div class="talent-item" style="padding:6px 0;">
      <div class="talent-info">
        <div class="talent-name" style="color:${color};">${icon} Lv.${lv} ${ms.name}</div>
        <div class="talent-desc">${ms.desc}</div>
      </div>
    </div>`;
  }
  html += `</div></div>`;
  return html;
}

function upgradeTalent(id) {
  const t = TALENTS[id];
  if (!t) return;
  const lv = S.talents[id] || 0;
  if (lv >= t.max) return;
  if (S.talentPoints <= 0) { log('沒有天賦點！','lose'); return; }
  S.talents[id] = lv + 1;
  S.talentPoints--;
  log(`天賦 ${t.name} 提升至 Lv.${lv+1}`,'talent-text');
  renderTalent();
  updateTownUI();
}
function resetTalents() {
  if (S.money < 1000) { log('金幣不足！需要 1000 金。','lose'); return; }
  let totalPoints = 0;
  for (const lv of Object.values(S.talents)) totalPoints += lv;
  if (totalPoints === 0) { log('沒有天賦可重置。','system'); return; }
  S.money -= 1000;
  S.talentPoints += totalPoints;
  S.talents = {};
  log(`重置天賦，返還 ${totalPoints} 點。`,'talent-text');
  renderTalent();
  updateTownUI();
}

// ── 深淵 ──
function openAbyss() { showScreen('screen-abyss'); renderAbyss(); }
function closeAbyss() { updateTownUI(); showScreen('screen-town'); }
function renderAbyss() {
  const c = $('abyssContent');
  if (S.abyssFloor === 0) {
    c.innerHTML = `<div class="abyss-floor">
      <div class="abyss-floor-num">∞</div>
      <div class="subtitle">深淵無盡，越深越強</div>
      <div class="abyss-record">歷史最高：第 ${S.abyssBest} 層</div>
      <div class="actions" style="margin-top:16px;">
        <button class="abyss" onclick="startAbyss()">🌀 挑戰深淵</button>
      </div>
      <div class="subtitle" style="margin-top:12px;font-size:11px;">
        ⚠ 深淵中無法返回村莊（除非戰敗）<br>⚠ 怪物強度隨層數遞增<br>⚠ 每 10 層出現 BOSS
      </div>
    </div>`;
  }
}
function startAbyss() {
  S.abyssFloor = 1;
  S.inAbyss = true;
  S.hp = effMaxHp();
  log('🌀 進入深淵第 1 層...','abyss');
  showScreen('screen-adventure');
  setTimeout(() => abyssEncounter(), 800);
}
function abyssEncounter() {
  if (S.hp <= 0) { abyssDeath(); return; }
  const floor = S.abyssFloor;
  const isBoss = floor % 10 === 0;
  if (isBoss) { log(`★ 深淵第 ${floor} 層 BOSS！`,'boss'); spawnAbyssBoss(floor); }
  else spawnAbyssMonster(floor);
  startBattle();
}
function spawnAbyssMonster(floor) {
  const type = rand(1, 6);
  const base = MONSTERS[type];
  const mult = 1 + floor * 0.25;
  const lv = Math.max(1, S.level + Math.floor(floor/3));
  S.monster = {
    name:`[深淵${floor}F] ${base.name}`, skill:base.skill,
    hp:Math.floor((base.hp + base.hp*0.3*lv) * mult),
    atk:Math.floor((base.atk + base.atk*0.3*lv) * mult),
    def:Math.floor((base.def + base.def*0.3*lv) * mult),
    exp:Math.floor(base.exp*lv*mult), money:Math.floor(base.money*lv*mult),
    maxHp:0, lv, type, weak:base.weak, res:base.res, dodge:base.dodge,
    prefixType:0, prefix:"", isAbyss:true,
  };
  if (floor >= 5 && roll(40)) {
    const pt = rand(1,12);
    S.monster.prefixType = pt;
    S.monster.prefix = PREFIXES[pt].name;
    S.monster.name = S.monster.prefix + S.monster.name;
    if (pt === 6) S.monster.def = Math.floor(S.monster.def*1.5);
    if (pt === 10) { S.monster.hp = Math.floor(S.monster.hp*1.5); S.monster.atk = Math.floor(S.monster.atk*1.2); }
    if (pt === 11) S.monster.dodge += 20;
  }
  S.monster.maxHp = S.monster.hp;
}
function spawnAbyssBoss(floor) {
  const tier = Math.min(5, Math.floor(floor/10));
  const b = BOSSES[tier] || BOSSES[5];
  const mult = 1 + floor * 0.15;
  S.monster = {
    name:`[深淵${floor}F] ${b.name}`, skill:b.skill,
    hp:Math.floor(b.hp*mult), atk:Math.floor(b.atk*mult),
    def:Math.floor(b.def*mult), exp:Math.floor(b.exp*mult), money:Math.floor(b.money*mult),
    maxHp:0, lv:S.level, type:100+tier, weak:b.weak, res:b.res, dodge:10,
    prefixType:0, prefix:"", isBoss:true, isAbyss:true,
    lines:b.lines || [],
  };
  S.monster.maxHp = S.monster.hp;
}
function abyssDeath() {
  const reward = S.abyssFloor * 50;
  S.money += reward;
  S.abyssBest = Math.max(S.abyssBest, S.abyssFloor);
  log(`🌀 深淵挑戰結束（第 ${S.abyssFloor} 層），獲得 ${reward} 金幣。`,'lose');
  S.abyssFloor = 0;
  S.inAbyss = false;
  S.hp = effMaxHp();
  updateTownUI();
  saveGame();
  showScreen('screen-town');
  checkAchievements();
}
function abyssNextFloor() {
  S.abyssFloor++;
  log(`🌀 進入深淵第 ${S.abyssFloor} 層...`,'abyss');
  setTimeout(() => abyssEncounter(), 600);
}

// ── 一般冒險 ──
function goAdventure() {
  if (S.hp <= 0) S.hp = effMaxHp();
  S.inAbyss = false;
  S.dungeon.active = null;
  showScreen('screen-adventure');
  updateAdventureUI();
  log('你踏入了荒野...','system');
  setTimeout(nextEncounter, 500);
}
function updateAdventureUI() {
  $('advHp').textContent = `${Math.max(0,S.hp)}/${effMaxHp()}`;
  $('advMoney').textContent = S.money;
  $('advExp').textContent = `${S.exp}/${S.expNeeded}`;
  $('advPotion').textContent = S.potion;
}
function nextEncounter() {
  if (S.hp <= 0) { handleDeath(); return; }
  if (!S.isBossFight && roll(30)) {
    triggerRandomEvent();
    if (S.hp <= 0) { handleDeath(); return; }
  }
  S.isBossFight = false;
  if (S.level >= S.chapter * 10 && S.chapter <= 5) {
    S.isBossFight = true;
    log(`★ 第 ${S.chapter} 章 BOSS 出現！`,'boss');
  }
  if (S.isBossFight) spawnBoss(S.chapter);
  else spawnMonster();
  startBattle();
}
function spawnMonster() {
  const type = rand(1, 7);
  const lv = Math.max(1, S.level + rand(-1, 1));
  let tpl;
  if (S.level >= 50 && type === 7) {
    tpl = {name:"【最終魔王】毀滅之龍",skill:"吐出終結一切的黑炎！",
      hp:5000+1000*lv,atk:300+80*lv,def:150+100*lv,exp:20000,money:50000,weak:3,res:1,dodge:0};
  } else {
    const base = MONSTERS[type];
    tpl = {
      name:base.name, skill:base.skill,
      hp:base.hp + Math.floor(base.hp*0.3)*lv,
      atk:base.atk + Math.floor(base.atk*0.3)*lv,
      def:base.def + Math.floor(base.def*0.3)*lv,
      exp:base.exp*lv, money:base.money*lv,
      weak:base.weak, res:base.res, dodge:base.dodge,
    };
  }
  let prefixType = 0, prefix = "";
  if (type !== 7 && roll(30)) {
    prefixType = rand(1,12);
    prefix = PREFIXES[prefixType].name;
    if (prefixType === 6) tpl.def = Math.floor(tpl.def*1.5);
    if (prefixType === 10) { tpl.hp = Math.floor(tpl.hp*1.5); tpl.atk = Math.floor(tpl.atk*1.2); }
    if (prefixType === 11) tpl.dodge += 20;
  }
  S.monster = {...tpl, maxHp:tpl.hp, lv, type, prefixType, prefix, name:prefix + tpl.name};
  if (prefixType) log(`詞綴：${prefix}（${PREFIXES[prefixType].desc}）`,'skill-text');
}
function spawnBoss(ch) {
  const b = BOSSES[ch] || BOSSES[5];
  const lv = Math.max(1, ch * 10);
  S.monster = {
    name:b.name, skill:b.skill,
    hp:b.hp + Math.floor(b.hp*0.1)*lv,
    atk:b.atk + b.atk*0.1*lv,
    def:b.def + b.def*0.1*lv,
    exp:b.exp*lv, money:b.money*lv,
    maxHp:0, lv, type:100+ch, weak:b.weak, res:b.res, dodge:10,
    prefixType:0, prefix:"", isBoss:true,
    lines:b.lines || [],
  };
  S.monster.maxHp = S.monster.hp;
}

// ── 轉職神殿 ──
let pendingJobChoices = [];
function openJobChange() { showScreen('screen-job'); renderJobChange(); }
function closeJobChange() { updateTownUI(); showScreen('screen-town'); }
function renderJobChange() {
  const c = $('jobContent');
  const curRole = ROLES[S.roleType];
  const curLv = S.roleLevel || 1;

  if (pendingJobChoices.length === 0) {
    const cost = 1000 + S.level * 20;
    let html = `<div style="text-align:center;padding:10px;">
      <div class="subtitle">目前職業</div>
      <div style="font-size:1.2em;color:#4fc3f7;font-weight:bold;margin:6px 0;">${curRole.name} Lv.${curLv}</div>
      <div class="subtitle">職業經驗：${S.roleExp || 0} / ${roleExpNeeded(curLv)}</div>
      <div class="subtitle" style="margin-top:12px;">轉職花費：<b style="color:#ffd54f;">${cost} 金幣</b></div>
      <div class="subtitle" style="font-size:11px;margin-top:8px;">
        ⚠ 抽出的 3 個職業中若有已擁有的，會繼承原等級<br>⚠ 新職業從 Lv.1 開始
      </div>
      <div class="actions" style="margin-top:16px;">
        <button class="skill" onclick="rollJobChange()">🎲 抽 3 個職業（${cost} 金）</button>
      </div>
    </div>`;
    const owned = Object.entries(S.roleLevels || {});
    if (owned.length > 0) {
      html += `<div style="margin-top:16px;padding-top:12px;border-top:1px solid #2a2a3a;">
        <div class="subtitle" style="margin-bottom:8px;">── 已擁有的職業 ──</div>`;
      owned.forEach(([rt, lv]) => {
        const r = ROLES[rt];
        if (!r) return;
        const isCur = parseInt(rt) === S.roleType;
        html += `<div class="talent-item"><div class="talent-info">
          <div class="talent-name" style="color:${isCur?'#4caf50':'#ccc'};">${isCur?'✓ ':''}${r.name} Lv.${lv}</div>
          <div class="talent-desc">${r.desc}</div></div>
          ${isCur?'':'<span class="subtitle">（未裝備）</span>'}
        </div>`;
      });
      html += `</div>`;
    }
    c.innerHTML = html;
    return;
  }

  let html = `<div style="text-align:center;padding:8px;"><div class="subtitle">選擇你想轉職的職業：</div></div>`;
  pendingJobChoices.forEach((rt, i) => {
    const r = ROLES[rt];
    const ownedLv = S.roleLevels[rt];
    const isOwned = !!ownedLv;
    html += `<div class="fruit-card ${isOwned?'active':''}" style="cursor:pointer;" onclick="chooseJob(${i})">
      <div class="fruit-name">${r.name} ${isOwned?`<span style="color:#ffd54f;font-size:12px;">[繼承 Lv.${ownedLv}]</span>`:'<span style="color:#4caf50;font-size:12px;">[新]</span>'}</div>
      <div class="fruit-lv">HP:${r.hp} 攻:${r.atk} 防:${r.def}</div>
      <div class="subtitle">${r.desc}</div>
    </div>`;
  });
  html += `<div class="actions" style="margin-top:10px;"><button class="danger" onclick="cancelJobChange()">放棄本次</button></div>`;
  c.innerHTML = html;
}
function rollJobChange() {
  const cost = 1000 + S.level * 20;
  if (S.money < cost) { log(`金幣不足！需要 ${cost} 金。`, 'lose'); return; }
  S.money -= cost;
  const allTypes = Object.keys(ROLES).map(Number);
  const pool = [...allTypes];
  pendingJobChoices = [];
  for (let i = 0; i < 3 && pool.length > 0; i++) {
    const idx = rand(0, pool.length - 1);
    pendingJobChoices.push(pool[idx]);
    pool.splice(idx, 1);
  }
  log(`🎲 抽到：${pendingJobChoices.map(t => ROLES[t].name).join('、')}`, 'skill-text');
  renderJobChange();
  updateTownUI();
}
function chooseJob(idx) {
  const rt = pendingJobChoices[idx];
  if (!rt) return;
  const role = ROLES[rt];
  const ownedLv = S.roleLevels[rt];
  const newLv = ownedLv || 1;
  const newExp = ownedLv ? (S.roleExp || 0) : 0;

  S.roleType = rt;
  S.roleName = role.name;
  S.roleLevel = newLv;
  S.roleExp = newExp;
  S.roleLevels[rt] = newLv;

  recalcBaseStats();
  log(`🔄 轉職成功！新職業：${role.name} Lv.${newLv}`, 'skill-text');
  if (ownedLv) log(`（繼承原本等級 Lv.${ownedLv}）`, 'skill-text');
  pendingJobChoices = [];
  renderJobChange();
  updateTownUI();
  checkAchievements();
}
function cancelJobChange() { pendingJobChoices = []; renderJobChange(); }
function recalcBaseStats() {
  const role = ROLES[S.roleType];
  for (const slot of ['weapon','armor','accessory']) applyEquipStats(S.equipment[slot], -1);
  S.maxHp = role.hp;
  S.atk = role.atk;
  S.def = role.def;
  S.atk += S.contractLevel * 250;
  S.maxHp -= S.contractLevel * 100;
  if (S.maxHp < 100) S.maxHp = 100;  // ★ 保護
  for (const slot of ['weapon','armor','accessory']) applyEquipStats(S.equipment[slot], 1);
  if (S.hp > effMaxHp()) S.hp = effMaxHp();
  if (S.hp < 1) S.hp = 1;
}

// ── 武器合成 ──
let forgeSelection = [];
const FORGE_SUCCESS_RATE = {2:0.95, 3:0.85, 4:0.70, 5:0.50, 6:0.30};
function openForge() { showScreen('screen-forge'); forgeSelection = []; renderForge(); }
function closeForge() { updateTownUI(); showScreen('screen-town'); }
function renderForge() {
  const c = $('forgeContent');
  const weapons = S.inventory.filter(i => i.slot === 'weapon');
  const grouped = {};
  weapons.forEach(w => {
    if (!grouped[w.rarity]) grouped[w.rarity] = [];
    grouped[w.rarity].push(w);
  });
  let html = `<div class="subtitle" style="padding:8px;">
    ⚒️ 選 3 把<b style="color:#ffd54f;">同稀有度</b>武器 → 合成 1 把高一階武器<br>
    <span style="color:#ff5252;">失敗有機率爆掉！</span>
  </div>`;
  if (forgeSelection.length > 0) {
    html += `<div style="background:#1a1a25;border:1px solid #ffd54f;border-radius:6px;padding:8px;margin:8px 0;">
      <div class="subtitle">已選擇 ${forgeSelection.length}/3：</div>`;
    forgeSelection.forEach(uid => {
      const item = S.inventory.find(i => i.uid === uid);
      if (item) html += `<div class="subtitle" style="color:#ffd54f;">• ${item.name} [${RARITY[item.rarity].name}]</div>`;
    });
    html += `</div>`;
  }
  for (let r = 1; r <= 5; r++) {
    const list = grouped[r];
    if (!list || !list.length) continue;
    const nextR = r + 1;
    const rate = FORGE_SUCCESS_RATE[nextR];
    html += `<div style="margin-top:12px;padding-top:10px;border-top:1px solid #2a2a3a;">
      <div class="subtitle" style="margin-bottom:6px;">
        [${RARITY[r].name}] ×${list.length}
        ${list.length >= 3 ? `→ 可合成 [${RARITY[nextR]?.name || '?'}]（成功率 ${Math.round(rate*100)}%）` : '（需要 3 把）'}
      </div>`;
    list.forEach(w => {
      const isSel = forgeSelection.includes(w.uid);
      html += `<div class="equip-bag-item" style="cursor:pointer;border-color:${isSel?'#ffd54f':'#2a2a3a'};" onclick="toggleForgeSelect('${w.uid}')">
        <div style="flex:1;">
          <div class="equip-item-name rarity-${w.rarity}">${isSel?'✓ ':''}${w.name} <span class="subtitle">[${RARITY[w.rarity].name}] Lv.${w.level}</span></div>
          <div>${w.affixes.map(a => `<span class="equip-affix">${a.label}</span>`).join('')}</div>
        </div>
      </div>`;
    });
    html += `</div>`;
  }
  const canForge = forgeSelection.length === 3;
  const firstItem = forgeSelection[0] ? S.inventory.find(i => i.uid === forgeSelection[0]) : null;
  const allSameRarity = forgeSelection.every(uid => {
    const it = S.inventory.find(i => i.uid === uid);
    return it && firstItem && it.rarity === firstItem.rarity;
  });
  html += `<div class="actions" style="margin-top:16px;">
    <button class="danger" ${canForge && allSameRarity ? '' : 'disabled'} onclick="doForge()">⚒️ 合成</button>
    <button onclick="clearForgeSelection()">清除選擇</button>
  </div>`;
  c.innerHTML = html;
}
function toggleForgeSelect(uid) {
  const idx = forgeSelection.indexOf(uid);
  if (idx >= 0) { forgeSelection.splice(idx, 1); }
  else {
    if (forgeSelection.length >= 3) { log('最多選 3 把！', 'system'); return; }
    if (forgeSelection.length > 0) {
      const first = S.inventory.find(i => i.uid === forgeSelection[0]);
      const cur = S.inventory.find(i => i.uid === uid);
      if (first && cur && first.rarity !== cur.rarity) { log('只能選同稀有度的武器！', 'lose'); return; }
    }
    forgeSelection.push(uid);
  }
  renderForge();
}
function clearForgeSelection() { forgeSelection = []; renderForge(); }
function doForge() {
  if (forgeSelection.length !== 3) return;
  const items = forgeSelection.map(uid => S.inventory.find(i => i.uid === uid)).filter(Boolean);
  if (items.length !== 3) return;
  const rarity = items[0].rarity;
  const nextRarity = rarity + 1;
  if (nextRarity > 6) { log('已達最高稀有度！', 'lose'); return; }
  const rate = FORGE_SUCCESS_RATE[nextRarity];
  const success = Math.random() < rate;
  S.inventory = S.inventory.filter(i => !forgeSelection.includes(i.uid));
  if (success) {
    const avgLv = Math.round(items.reduce((s,i)=>s+i.level,0)/3);
    const newItem = genEquipment(avgLv, nextRarity);
    S.inventory.push(newItem);
    log(`⚒️ 合成成功！獲得 ${newItem.name} [${RARITY[nextRarity].name}]`, 'win');
  } else {
    const r = rand(1, 100);
    let keptCount = r <= 40 ? 0 : r <= 70 ? 1 : 2;
    for (let i = 0; i < keptCount; i++) S.inventory.push(items[i]);
    log(`💥 合成失敗！${keptCount === 0 ? '全部武器爆掉了...' : `損失 ${3-keptCount} 把武器`}`, 'lose');
  }
  forgeSelection = [];
  renderForge();
  updateTownUI();
  checkAchievements();
}

// ── 隨機事件 ──
function triggerRandomEvent() {
  const e = rand(1, 6);
  log('[事件] ','system');
  switch(e) {
    case 1: { const heal=Math.floor(effMaxHp()*0.3); S.hp=Math.min(effMaxHp(),S.hp+heal); log(`發現生命藥水！回復 ${heal} HP。`,'win'); break; }
    case 2: { const dmg=10+2*S.level; S.hp-=dmg; log(`踩到毒箭陷阱！受到 ${dmg} 點傷害！`,'lose'); break; }
    case 3: { const gain=3*S.level; S.atk+=gain; log(`磨利了武器！攻擊力 +${gain}`,'win'); break; }
    case 4: { const gain=Math.floor(50*(S.playexp/100)*S.level); S.exp+=gain; log(`撿到失傳卷軸！+${gain} 經驗。`,'win'); break; }
    case 5: { S.playexp+=5; log(`受到高人指點！經驗加成提升至 ${S.playexp}%。`,'win'); break; }
    case 6: { log('找到隱藏商店！','loot'); S.money+=100; S.potion++; const item = genEquipment(S.level+5, pickRarity(30)); S.inventory.push(item); log(`商人送了你 100 金幣、1 瓶藥水、以及 ${item.name}`,'win'); checkAchievements(); break; }
  }
  if (S.hp <= 0) S.hp = 0;
}
