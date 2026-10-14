// ============================================================
//  ★ 賭場系統
// ============================================================

function openGamble() { showScreen('screen-gamble'); renderGamble(); }
function closeGamble() { updateTownUI(); showScreen('screen-town'); }

function renderGamble() {
  const c = $('gambleContent');
  c.innerHTML = `
    <div class="subtitle" style="text-align:center;padding:8px;">
      🎰 歡迎來到賭場！金幣：<b style="color:#ffd54f;">${S.money.toLocaleString()}</b>
    </div>

    <div class="gamble-grid">
      <button class="gamble-card" onclick="openSlots()">
        <span class="gc-icon">🎰</span>
        <span class="gc-name">拉霸機</span>
        <span class="gc-desc">押 1000 金，最高 50 倍</span>
      </button>
      <button class="gamble-card" onclick="openDice()">
        <span class="gc-icon">🎲</span>
        <span class="gc-name">骰子比大小</span>
        <span class="gc-desc">猜大小，贏就翻倍</span>
      </button>
      <button class="gamble-card" onclick="openGuess()">
        <span class="gc-icon">🃏</span>
        <span class="gc-name">猜數字</span>
        <span class="gc-desc">猜 1~10，最高 10 倍</span>
      </button>
      <button class="gamble-card" onclick="openDuel()">
        <span class="gc-icon">⚔️</span>
        <span class="gc-name">決鬥賭局</span>
        <span class="gc-desc">用裝備賭裝備</span>
      </button>
    </div>

    <div class="panel" style="margin-top:12px;">
      <div class="panel-title">📜 賭場記錄</div>
      <div id="gambleLog" style="max-height:150px;overflow-y:auto;font-size:12px;">
        ${S.gambleLog ? S.gambleLog.slice(-20).map(l => `<div>${l}</div>`).join('') : '<div class="subtitle">還沒有賭過</div>'}
      </div>
    </div>
  `;
}

function gambleLog(msg, cls = '') {
  if (!S.gambleLog) S.gambleLog = [];
  const time = new Date().toLocaleTimeString();
  S.gambleLog.push(`[${time}] ${msg}`);
  if (S.gambleLog.length > 100) S.gambleLog.shift();
  log(msg, cls);
}

// ══════════════════════════════════════════════════════════
//  🎰 拉霸機
// ══════════════════════════════════════════════════════════
function openSlots() {
  const cost = 1000;
  if (S.money < cost) { log('金幣不足！需要 1000 金。', 'lose'); return; }

  S.money -= cost;
  const symbols = ['🍒','🍋','🔔','💎','7️⃣'];
  const weights = [40, 30, 15, 10, 5]; // 權重（越低越稀有）

  // 隨機抽 3 個
  const spin = [];
  for (let i = 0; i < 3; i++) {
    let r = Math.random() * 100;
    let sum = 0;
    for (let j = 0; j < weights.length; j++) {
      sum += weights[j];
      if (r < sum) { spin.push(symbols[j]); break; }
    }
  }

  // 計算獎勵
  let reward = 0;
  let msg = '';
  const [a, b, c] = spin;
  if (a === b && b === c) {
    // 三個相同
    switch (a) {
      case '7️⃣': reward = cost * 50; msg = '🎉🎉🎉 三個 7！超級大獎 50 倍！'; break;
      case '💎': reward = cost * 20; msg = '💎💎💎 三個鑽石！20 倍！'; break;
      case '🔔': reward = cost * 10; msg = '🔔🔔🔔 三個鈴鐺！10 倍！'; break;
      case '🍋': reward = cost * 5;  msg = '🍋🍋🍋 三個檸檬！5 倍！'; break;
      case '🍒': reward = cost * 3;  msg = '🍒🍒🍒 三個櫻桃！3 倍！'; break;
    }
  } else if (a === b || b === c || a === c) {
    // 兩個相同
    reward = cost * 2;
    msg = `兩個 ${a === b ? a : (b === c ? b : a)} 相同！2 倍！`;
  } else {
    msg = '槓龜，下次會更好';
  }

  S.money += reward;

  // 顯示動畫
  const c2 = $('gambleContent');
  c2.innerHTML = `
    <div style="text-align:center;padding:30px 10px;">
      <div style="font-size:4em;letter-spacing:20px;">${spin.join(' ')}</div>
      <div style="margin-top:20px;font-size:1.3em;color:${reward > 0 ? '#4caf50' : '#f44336'};">
        ${msg}
      </div>
      <div style="margin-top:10px;color:#ffd54f;">
        ${reward > 0 ? `獲得 ${reward.toLocaleString()} 金幣！` : `損失 ${cost.toLocaleString()} 金幣`}
      </div>
      <div class="actions" style="margin-top:20px;">
        <button class="gold" onclick="openSlots()">再拉一次（1000 金）</button>
        <button onclick="renderGamble()">返回賭場</button>
      </div>
    </div>
  `;

  gambleLog(`🎰 拉霸機：${spin.join(' ')}｜${reward > 0 ? '+' + reward : '-' + cost}`, reward > 0 ? 'win' : 'lose');
  updateTownUI();
}

// ══════════════════════════════════════════════════════════
//  🎲 骰子比大小
// ══════════════════════════════════════════════════════════
let diceBet = 1000;

function openDice() {
  const c = $('gambleContent');
  c.innerHTML = `
    <div style="text-align:center;padding:20px;">
      <div style="font-size:1.3em;margin-bottom:20px;">🎲 骰子比大小</div>
      <div class="subtitle">莊家骰 vs 你骰，點數大者贏</div>
      <div class="subtitle">賠率 1:1（贏翻倍，輸全輸）</div>

      <div style="margin:20px 0;">
        <div class="subtitle">下注金額：</div>
        <input type="number" id="diceBetInput" value="${diceBet}" min="100" step="100"
          style="width:200px;text-align:center;background:#1a1a25;border:1px solid #2a2a3a;color:#4fc3f7;padding:8px;border-radius:6px;font-family:inherit;font-size:16px;">
      </div>

      <div class="actions">
        <button class="small" onclick="setDiceBet(100)">100</button>
        <button class="small" onclick="setDiceBet(1000)">1K</button>
        <button class="small" onclick="setDiceBet(10000)">10K</button>
        <button class="small" onclick="setDiceBet(100000)">100K</button>
        <button class="small" onclick="setDiceBet(S.money)">全押</button>
      </div>

      <div class="actions" style="margin-top:20px;">
        <button class="gold" style="font-size:1.1em;padding:12px 24px;" onclick="playDice()">🎲 開始擲骰</button>
        <button onclick="renderGamble()">返回賭場</button>
      </div>

      <div id="diceResult" style="margin-top:20px;font-size:1.2em;"></div>
    </div>
  `;
}

function setDiceBet(amount) {
  diceBet = Math.max(100, Math.min(amount, S.money));
  const input = $('diceBetInput');
  if (input) input.value = diceBet;
}

function playDice() {
  const input = $('diceBetInput');
  const bet = Math.floor(parseInt(input.value) || 0);
  if (bet < 100) { log('最低下注 100 金！', 'lose'); return; }
  if (bet > S.money) { log('金幣不足！', 'lose'); return; }

  const playerRoll = rand(1, 6) + rand(1, 6);
  const dealerRoll = rand(1, 6) + rand(1, 6);

  let result = '';
  let color = '';
  if (playerRoll > dealerRoll) {
    S.money += bet;
    result = `🎉 你贏了！+${bet.toLocaleString()} 金`;
    color = '#4caf50';
    gambleLog(`🎲 骰子：你 ${playerRoll} vs 莊 ${dealerRoll}｜贏 +${bet}`, 'win');
  } else if (playerRoll < dealerRoll) {
    S.money -= bet;
    result = `💀 你輸了！-${bet.toLocaleString()} 金`;
    color = '#f44336';
    gambleLog(`🎲 骰子：你 ${playerRoll} vs 莊 ${dealerRoll}｜輸 -${bet}`, 'lose');
  } else {
    result = `🤝 平手！不輸不贏`;
    color = '#ffd54f';
    gambleLog(`🎲 骰子：你 ${playerRoll} vs 莊 ${dealerRoll}｜平手`, 'system');
  }

  const resultDiv = $('diceResult');
  resultDiv.innerHTML = `
    <div style="font-size:1.5em;margin-bottom:10px;">
      你：<span style="color:#4fc3f7;">${playerRoll}</span>
      vs
      莊家：<span style="color:#f44336;">${dealerRoll}</span>
    </div>
    <div style="color:${color};">${result}</div>
  `;

  updateTownUI();
}

// ══════════════════════════════════════════════════════════
//  🃏 猜數字
// ══════════════════════════════════════════════════════════
function openGuess() {
  const c = $('gambleContent');
  c.innerHTML = `
    <div style="text-align:center;padding:20px;">
      <div style="font-size:1.3em;margin-bottom:20px;">🃏 猜數字</div>
      <div class="subtitle">1~10 之間猜一個數字</div>
      <div class="subtitle">猜中：賠率 10 倍</div>
      <div class="subtitle">差 1：賠率 3 倍</div>
      <div class="subtitle">差 2：賠率 1.5 倍</div>

      <div style="margin:20px 0;">
        <div class="subtitle">下注金額：</div>
        <input type="number" id="guessBetInput" value="1000" min="100" step="100"
          style="width:200px;text-align:center;background:#1a1a25;border:1px solid #2a2a3a;color:#4fc3f7;padding:8px;border-radius:6px;font-family:inherit;font-size:16px;">
      </div>

      <div class="subtitle" style="margin-top:20px;">選擇你要猜的數字：</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:10px;">
        ${[1,2,3,4,5,6,7,8,9,10].map(n =>
          `<button class="gamble-num" onclick="playGuess(${n})">${n}</button>`
        ).join('')}
      </div>

      <div class="actions" style="margin-top:20px;">
        <button onclick="renderGamble()">返回賭場</button>
      </div>

      <div id="guessResult" style="margin-top:20px;font-size:1.2em;"></div>
    </div>
  `;
}

function playGuess(guess) {
  const input = $('guessBetInput');
  const bet = Math.floor(parseInt(input.value) || 0);
  if (bet < 100) { log('最低下注 100 金！', 'lose'); return; }
  if (bet > S.money) { log('金幣不足！', 'lose'); return; }

  const answer = rand(1, 10);
  const diff = Math.abs(guess - answer);
  let multiplier = 0;
  let result = '';

  if (diff === 0) { multiplier = 10; result = '🎉 完全命中！'; }
  else if (diff === 1) { multiplier = 3; result = '🔥 差一點！'; }
  else if (diff === 2) { multiplier = 1.5; result = '😊 接近了！'; }
  else { multiplier = 0; result = '💀 差太遠了...'; }

  const reward = Math.floor(bet * multiplier);
  const profit = reward - bet;
  S.money += profit;

  const color = profit > 0 ? '#4caf50' : (profit < 0 ? '#f44336' : '#ffd54f');

  const resultDiv = $('guessResult');
  resultDiv.innerHTML = `
    <div style="margin-bottom:10px;">
      答案：<span style="color:#ffd54f;font-size:1.3em;">${answer}</span>
      ｜你猜：<span style="color:#4fc3f7;font-size:1.3em;">${guess}</span>
    </div>
    <div style="color:${color};">${result}</div>
    <div style="margin-top:8px;color:${color};">
      ${profit > 0 ? `+${profit.toLocaleString()} 金` : (profit < 0 ? `${profit.toLocaleString()} 金` : '不輸不贏')}
    </div>
  `;

  gambleLog(`🃏 猜數字：猜 ${guess}，答案 ${answer}｜${profit > 0 ? '+' + profit : profit}`, profit > 0 ? 'win' : (profit < 0 ? 'lose' : 'system'));
  updateTownUI();
}

// ══════════════════════════════════════════════════════════
//  ⚔️ 決鬥賭局（用裝備賭裝備）
// ══════════════════════════════════════════════════════════
let duelSelection = [];

function openDuel() {
  const c = $('gambleContent');
  const weapons = S.inventory.filter(i => i.slot === 'weapon');

  if (weapons.length === 0) {
    c.innerHTML = `
      <div style="text-align:center;padding:40px;">
        <div style="font-size:1.3em;margin-bottom:20px;">⚔️ 決鬥賭局</div>
        <div class="subtitle">你沒有可用的武器來賭</div>
        <div class="actions" style="margin-top:20px;">
          <button onclick="renderGamble()">返回賭場</button>
        </div>
      </div>
    `;
    return;
  }

  c.innerHTML = `
    <div style="text-align:center;padding:15px;">
      <div style="font-size:1.3em;margin-bottom:10px;">⚔️ 決鬥賭局</div>
      <div class="subtitle">選一把武器，跟莊家決鬥</div>
      <div class="subtitle">贏：獲得同稀有度隨機武器</div>
      <div class="subtitle">輸：失去賭注武器</div>
      <div class="subtitle">勝率：依武器稀有度（越稀有越不利）</div>
    </div>

    <div style="max-height:300px;overflow-y:auto;margin-top:10px;">
      ${weapons.map(w => {
        const rar = RARITY[w.rarity];
        const winRate = [0, 70, 60, 50, 40, 30, 20][w.rarity];
        return `<div class="equip-bag-item" style="cursor:pointer;" onclick="pickDuelWeapon('${w.uid}')">
          <div style="flex:1;">
            <div class="equip-item-name rarity-${w.rarity}">${w.name} <span class="subtitle">[${rar.name}] Lv.${w.level}</span></div>
            <div class="subtitle">勝率：${winRate}%</div>
          </div>
        </div>`;
      }).join('')}
    </div>

    <div class="actions" style="margin-top:20px;">
      <button onclick="renderGamble()">返回賭場</button>
    </div>
  `;
}

function pickDuelWeapon(uid) {
  const weapon = S.inventory.find(i => i.uid === uid);
  if (!weapon) return;

  const winRate = [0, 70, 60, 50, 40, 30, 20][weapon.rarity];
  const roll100 = rand(1, 100);

  if (roll100 <= winRate) {
    // 贏了：獲得同稀有度隨機武器
    const newWeapon = genEquipment(weapon.level, weapon.rarity);
    newWeapon.slot = 'weapon';
    S.inventory.push(newWeapon);
    log(`⚔️ 決鬥勝利！獲得 ${newWeapon.name}`, 'win');
    gambleLog(`⚔️ 決鬥：${weapon.name} 贏得 ${newWeapon.name}`, 'win');

    showDuelResult(true, weapon, newWeapon);
  } else {
    // 輸了：失去賭注武器
    S.inventory = S.inventory.filter(i => i.uid !== uid);
    log(`⚔️ 決鬥失敗！失去 ${weapon.name}`, 'lose');
    gambleLog(`⚔️ 決鬥：${weapon.name} 輸了`, 'lose');

    showDuelResult(false, weapon, null);
  }

  renderEquip && renderEquip();
  updateTownUI();
}

function showDuelResult(won, betWeapon, wonWeapon) {
  const c = $('gambleContent');
  c.innerHTML = `
    <div style="text-align:center;padding:30px;">
      <div style="font-size:3em;">${won ? '🏆' : '💀'}</div>
      <div style="font-size:1.3em;margin:15px 0;color:${won ? '#4caf50' : '#f44336'};">
        ${won ? '決鬥勝利！' : '決鬥失敗...'}
      </div>
      <div class="subtitle">賭注：${betWeapon.name}</div>
      ${won ? `<div class="subtitle" style="color:#ffd54f;margin-top:8px;">贏得：${wonWeapon.name} [${RARITY[wonWeapon.rarity].name}]</div>` : ''}
      <div class="actions" style="margin-top:20px;">
        <button class="gold" onclick="openDuel()">再賭一場</button>
        <button onclick="renderGamble()">返回賭場</button>
      </div>
    </div>
  `;
}
