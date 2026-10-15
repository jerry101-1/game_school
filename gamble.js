// ============================================================
//  ★ 賭場系統 — 8 種玩法
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
      <button class="gamble-card" onclick="openRoulette()">
        <span class="gc-icon">🎡</span>
        <span class="gc-name">輪盤</span>
        <span class="gc-desc">押數字/顏色，最高 36 倍</span>
      </button>
      <button class="gamble-card" onclick="openBlackjack()">
        <span class="gc-icon">🂡</span>
        <span class="gc-name">21 點</span>
        <span class="gc-desc">經典撲克，贏莊家翻倍</span>
      </button>
      <button class="gamble-card" onclick="openHorse()">
        <span class="gc-icon">🐎</span>
        <span class="gc-name">賽馬</span>
        <span class="gc-desc">押 5 匹馬之一，賠率不同</span>
      </button>
      <button class="gamble-card" onclick="openLottery()">
        <span class="gc-icon">🎁</span>
        <span class="gc-name">抽獎箱</span>
        <span class="gc-desc">花 10 萬抽隨機神裝</span>
      </button>
    </div>

    <div class="panel" style="margin-top:12px;">
      <div class="panel-title">📜 賭場記錄</div>
      <div id="gambleLog" style="max-height:150px;overflow-y:auto;font-size:12px;">
        ${S.gambleLog && S.gambleLog.length
          ? S.gambleLog.slice(-20).reverse().map(l => `<div>${l}</div>`).join('')
          : '<div class="subtitle">還沒有賭過</div>'}
      </div>
      <div class="actions" style="margin-top:8px;">
        <button class="small danger" onclick="clearGambleLog()">清空記錄</button>
      </div>
    </div>
  `;
}

function gambleLog(msg, cls = '') {
  if (!S.gambleLog) S.gambleLog = [];
  const time = new Date().toLocaleTimeString('zh-TW', {hour12:false});
  S.gambleLog.push(`[${time}] ${msg}`);
  if (S.gambleLog.length > 100) S.gambleLog.shift();
  log(msg, cls);
}

function clearGambleLog() {
  S.gambleLog = [];
  renderGamble();
}

// ══════════════════════════════════════════════════════════
//  🎰 拉霸機
// ══════════════════════════════════════════════════════════
function openSlots() {
  const cost = 1000;
  if (S.money < cost) { log('金幣不足！需要 1000 金。', 'lose'); return; }

  S.money -= cost;
  const symbols = ['🍒','🍋','🔔','💎','7️⃣'];
  const weights = [40, 30, 15, 10, 5];

  const spin = [];
  for (let i = 0; i < 3; i++) {
    let r = Math.random() * 100;
    let sum = 0;
    for (let j = 0; j < weights.length; j++) {
      sum += weights[j];
      if (r < sum) { spin.push(symbols[j]); break; }
    }
  }

  let reward = 0, msg = '';
  const [a, b, c] = spin;
  if (a === b && b === c) {
    switch (a) {
      case '7️⃣': reward = cost * 50; msg = '🎉🎉🎉 三個 7！超級大獎 50 倍！'; break;
      case '💎': reward = cost * 20; msg = '💎💎💎 三個鑽石！20 倍！'; break;
      case '🔔': reward = cost * 10; msg = '🔔🔔🔔 三個鈴鐺！10 倍！'; break;
      case '🍋': reward = cost * 5;  msg = '🍋🍋🍋 三個檸檬！5 倍！'; break;
      case '🍒': reward = cost * 3;  msg = '🍒🍒🍒 三個櫻桃！3 倍！'; break;
    }
  } else if (a === b || b === c || a === c) {
    reward = cost * 2;
    msg = `兩個 ${a === b ? a : (b === c ? b : a)} 相同！2 倍！`;
  } else {
    msg = '槓龜，下次會更好';
  }

  S.money += reward;

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

  let result = '', color = '';
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
      <div class="subtitle">猜中：10 倍｜差 1：3 倍｜差 2：1.5 倍</div>

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
  let multiplier = 0, result = '';

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
      <div class="subtitle">贏：獲得同稀有度隨機武器｜輸：失去賭注武器</div>
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
    const newWeapon = genEquipment(weapon.level, weapon.rarity);
    newWeapon.slot = 'weapon';
    newWeapon.name = SLOT_DATA.weapon.pre[rand(0,SLOT_DATA.weapon.pre.length-1)]
                   + SLOT_DATA.weapon.base[rand(0,SLOT_DATA.weapon.base.length-1)];
    S.inventory.push(newWeapon);
    log(`⚔️ 決鬥勝利！獲得 ${newWeapon.name}`, 'win');
    gambleLog(`⚔️ 決鬥：${weapon.name} 贏得 ${newWeapon.name}`, 'win');
    showDuelResult(true, weapon, newWeapon);
  } else {
    S.inventory = S.inventory.filter(i => i.uid !== uid);
    log(`⚔️ 決鬥失敗！失去 ${weapon.name}`, 'lose');
    gambleLog(`⚔️ 決鬥：${weapon.name} 輸了`, 'lose');
    showDuelResult(false, weapon, null);
  }

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

// ══════════════════════════════════════════════════════════
//  🎡 輪盤
// ══════════════════════════════════════════════════════════
let rouletteBet = 1000;
let rouletteType = 'number';
let rouletteValue = 0;

function openRoulette() {
  const c = $('gambleContent');
  c.innerHTML = `
    <div style="text-align:center;padding:20px;">
      <div style="font-size:1.3em;margin-bottom:10px;">🎡 輪盤</div>
      <div class="subtitle">莊家轉出 0~36，押中賠率不同</div>
      <div class="subtitle">押數字：36 倍｜押紅黑：2 倍｜押單雙：2 倍</div>

      <div style="margin:20px 0;">
        <div class="subtitle">下注金額：</div>
        <input type="number" id="rouletteBetInput" value="${rouletteBet}" min="100" step="100"
          style="width:200px;text-align:center;background:#1a1a25;border:1px solid #2a2a3a;color:#4fc3f7;padding:8px;border-radius:6px;font-family:inherit;font-size:16px;">
      </div>

      <div class="subtitle" style="margin-top:15px;">選擇下注方式：</div>
      <div class="actions" style="margin-top:10px;">
        <button class="small" onclick="setRouletteType('red')" style="background:#c62828;">🔴 紅（2倍）</button>
        <button class="small" onclick="setRouletteType('black')" style="background:#212121;">⚫ 黑（2倍）</button>
        <button class="small" onclick="setRouletteType('even')" style="background:#1565c0;">雙（2倍）</button>
        <button class="small" onclick="setRouletteType('odd')" style="background:#1565c0;">單（2倍）</button>
      </div>

      <div class="subtitle" style="margin-top:15px;">或直接押數字（36 倍）：</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center;margin-top:10px;max-width:600px;margin-left:auto;margin-right:auto;">
        ${Array.from({length:37}, (_, i) => {
          const color = i === 0 ? '#00897b' : ([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(i) ? '#c62828' : '#212121');
          return `<button class="roulette-num" style="background:${color};" onclick="playRoulette(${i})">${i}</button>`;
        }).join('')}
      </div>

      <div class="actions" style="margin-top:20px;">
        <button onclick="renderGamble()">返回賭場</button>
      </div>

      <div id="rouletteResult" style="margin-top:20px;font-size:1.2em;"></div>
    </div>
  `;
}

function setRouletteType(type) {
  rouletteType = type;
  const input = $('rouletteBetInput');
  const bet = Math.floor(parseInt(input.value) || 0);
  if (bet < 100) { log('最低下注 100 金！', 'lose'); return; }
  if (bet > S.money) { log('金幣不足！', 'lose'); return; }
  playRouletteSpin(bet, type, null);
}

function playRoulette(number) {
  const input = $('rouletteBetInput');
  const bet = Math.floor(parseInt(input.value) || 0);
  if (bet < 100) { log('最低下注 100 金！', 'lose'); return; }
  if (bet > S.money) { log('金幣不足！', 'lose'); return; }
  playRouletteSpin(bet, 'number', number);
}

function playRouletteSpin(bet, type, number) {
  const result = rand(0, 36);
  const isRed = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(result);
  const isEven = result !== 0 && result % 2 === 0;

  let won = false, multiplier = 0;
  if (type === 'number' && number === result) { won = true; multiplier = 36; }
  else if (type === 'red' && isRed) { won = true; multiplier = 2; }
  else if (type === 'black' && !isRed && result !== 0) { won = true; multiplier = 2; }
  else if (type === 'even' && isEven) { won = true; multiplier = 2; }
  else if (type === 'odd' && !isEven && result !== 0) { won = true; multiplier = 2; }

  const reward = won ? bet * multiplier : 0;
  const profit = reward - bet;
  S.money += profit;

  const resultColor = result === 0 ? '#00897b' : (isRed ? '#c62828' : '#212121');
  const profitColor = profit > 0 ? '#4caf50' : '#f44336';

  const resultDiv = $('rouletteResult');
  resultDiv.innerHTML = `
    <div style="margin:15px 0;">
      輪盤結果：
      <span style="display:inline-block;width:60px;height:60px;line-height:60px;border-radius:50%;background:${resultColor};color:#fff;font-size:1.8em;font-weight:bold;text-align:center;vertical-align:middle;margin-left:10px;">${result}</span>
    </div>
    <div style="color:${profitColor};font-size:1.3em;">
      ${won ? `🎉 中獎 ${multiplier} 倍！` : '💀 沒中...'}
    </div>
    <div style="color:${profitColor};margin-top:8px;">
      ${profit > 0 ? `+${profit.toLocaleString()} 金` : `${profit.toLocaleString()} 金`}
    </div>
  `;

  gambleLog(`🎡 輪盤：${result}${isRed?'紅':(result===0?'綠':'黑')}｜${type}｜${profit > 0 ? '+' + profit : profit}`, profit > 0 ? 'win' : 'lose');
  updateTownUI();
}

// ══════════════════════════════════════════════════════════
//  🂡 21 點
// ══════════════════════════════════════════════════════════
let bjState = null;

function openBlackjack() {
  bjState = null;
  renderBlackjack();
}

function renderBlackjack() {
  const c = $('gambleContent');
  if (!bjState) {
    c.innerHTML = `
      <div style="text-align:center;padding:20px;">
        <div style="font-size:1.3em;margin-bottom:10px;">🂡 21 點</div>
        <div class="subtitle">比點數接近 21，超過爆牌</div>
        <div class="subtitle">贏莊家：2 倍｜平手：退還</div>

        <div style="margin:20px 0;">
          <div class="subtitle">下注金額：</div>
          <input type="number" id="bjBetInput" value="1000" min="100" step="100"
            style="width:200px;text-align:center;background:#1a1a25;border:1px solid #2a2a3a;color:#4fc3f7;padding:8px;border-radius:6px;font-family:inherit;font-size:16px;">
        </div>

        <div class="actions">
          <button class="gold" style="font-size:1.1em;padding:12px 24px;" onclick="startBlackjack()">🂡 開始發牌</button>
          <button onclick="renderGamble()">返回賭場</button>
        </div>
      </div>
    `;
    return;
  }

  const { playerCards, dealerCards, bet, phase } = bjState;
  const playerSum = calcBJ(playerCards);
  const dealerSum = calcBJ(dealerCards);

  c.innerHTML = `
    <div style="text-align:center;padding:20px;">
      <div style="font-size:1.3em;margin-bottom:15px;">🂡 21 點</div>

      <div style="margin:15px 0;">
        <div class="subtitle">莊家 ${phase === 'playing' ? '（一張蓋牌）' : `（合計 ${dealerSum}）`}</div>
        <div style="font-size:2em;margin:8px 0;">
          ${dealerCards.map((card, i) => {
            if (phase === 'playing' && i === 1) return '<span style="color:#888;">🂠</span>';
            return renderCard(card);
          }).join(' ')}
        </div>
      </div>

      <div style="margin:15px 0;">
        <div class="subtitle">你的牌（合計 ${playerSum}）</div>
        <div style="font-size:2em;margin:8px 0;">
          ${playerCards.map(renderCard).join(' ')}
        </div>
      </div>

      <div style="margin:15px 0;color:#ffd54f;">
        下注：${bet.toLocaleString()} 金
      </div>

      ${phase === 'playing' ? `
        <div class="actions" style="margin-top:20px;">
          <button class="gold" onclick="bjHit()">要牌</button>
          <button class="danger" onclick="bjStand()">停牌</button>
        </div>
      ` : `
        <div class="actions" style="margin-top:20px;">
          <button class="gold" onclick="openBlackjack()">再玩一局</button>
          <button onclick="renderGamble()">返回賭場</button>
        </div>
      `}

      <div id="bjResult" style="margin-top:15px;font-size:1.2em;"></div>
    </div>
  `;

  if (phase === 'done' && bjState.resultText) {
    const div = $('bjResult');
    if (div) div.innerHTML = `<div style="color:${bjState.resultColor};">${bjState.resultText}</div>`;
  }
}

function renderCard(card) {
  const suits = { '♠': 'black', '♥': 'red', '♦': 'red', '♣': 'black' };
  const color = suits[card.suit] === 'red' ? '#f44336' : '#eee';
  return `<span style="color:${color};">${card.rank}${card.suit}</span>`;
}

function calcBJ(cards) {
  let sum = 0;
  let aces = 0;
  for (const c of cards) {
    if (c.rank === 'A') { sum += 11; aces++; }
    else if (['J','Q','K'].includes(c.rank)) sum += 10;
    else sum += parseInt(c.rank);
  }
  while (sum > 21 && aces > 0) { sum -= 10; aces--; }
  return sum;
}

function randomCard() {
  const suits = ['♠','♥','♦','♣'];
  const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  return { suit: suits[rand(0,3)], rank: ranks[rand(0,12)] };
}

function startBlackjack() {
  const input = $('bjBetInput');
  const bet = Math.floor(parseInt(input.value) || 0);
  if (bet < 100) { log('最低下注 100 金！', 'lose'); return; }
  if (bet > S.money) { log('金幣不足！', 'lose'); return; }

  S.money -= bet;
  bjState = {
    playerCards: [randomCard(), randomCard()],
    dealerCards: [randomCard(), randomCard()],
    bet,
    phase: 'playing',
  };

  // 檢查 21 點
  if (calcBJ(bjState.playerCards) === 21) {
    bjState.phase = 'playing';
    bjStand();
    return;
  }

  renderBlackjack();
}

function bjHit() {
  if (!bjState || bjState.phase !== 'playing') return;
  bjState.playerCards.push(randomCard());
  const sum = calcBJ(bjState.playerCards);
  if (sum > 21) {
    // 爆牌
    bjState.phase = 'done';
    bjState.resultText = `💀 爆牌！失去 ${bjState.bet.toLocaleString()} 金`;
    bjState.resultColor = '#f44336';
    gambleLog(`🂡 21點：爆牌 ${sum}｜-${bjState.bet}`, 'lose');
    updateTownUI();
  }
  renderBlackjack();
}

function bjStand() {
  if (!bjState || bjState.phase !== 'playing') return;

  // 莊家補牌到 17
  while (calcBJ(bjState.dealerCards) < 17) {
    bjState.dealerCards.push(randomCard());
  }

  const playerSum = calcBJ(bjState.playerCards);
  const dealerSum = calcBJ(bjState.dealerCards);

  bjState.phase = 'done';
  let profit = 0;
  if (playerSum > 21) {
    bjState.resultText = `💀 你爆牌了！-${bjState.bet.toLocaleString()} 金`;
    bjState.resultColor = '#f44336';
    profit = 0;
  } else if (dealerSum > 21) {
    bjState.resultText = `🎉 莊家爆牌！+${bjState.bet.toLocaleString()} 金`;
    bjState.resultColor = '#4caf50';
    profit = bjState.bet * 2;
  } else if (playerSum > dealerSum) {
    bjState.resultText = `🎉 你贏了！+${bjState.bet.toLocaleString()} 金`;
    bjState.resultColor = '#4caf50';
    profit = bjState.bet * 2;
  } else if (playerSum < dealerSum) {
    bjState.resultText = `💀 你輸了！-${bjState.bet.toLocaleString()} 金`;
    bjState.resultColor = '#f44336';
    profit = 0;
  } else {
    bjState.resultText = `🤝 平手！退還 ${bjState.bet.toLocaleString()} 金`;
    bjState.resultColor = '#ffd54f';
    profit = bjState.bet;
  }

  S.money += profit;
  gambleLog(`🂡 21點：你 ${playerSum} vs 莊 ${dealerSum}｜${profit > bjState.bet ? '+' + (profit - bjState.bet) : (profit === bjState.bet ? '平手' : '-' + bjState.bet)}`, profit > bjState.bet ? 'win' : (profit === bjState.bet ? 'system' : 'lose'));
  updateTownUI();
  renderBlackjack();
}

// ══════════════════════════════════════════════════════════
//  🐎 賽馬
// ══════════════════════════════════════════════════════════
const HORSES = [
  { id: 1, name: '旋風', icon: '🐎', odds: 2.0, winRate: 40 },
  { id: 2, name: '烈焰', icon: '🐎', odds: 3.0, winRate: 25 },
  { id: 3, name: '暗影', icon: '🐎', odds: 5.0, winRate: 15 },
  { id: 4, name: '疾風', icon: '🐎', odds: 8.0, winRate: 10 },
  { id: 5, name: '傳奇', icon: '🐎', odds: 15.0, winRate: 5 },
];

function openHorse() {
  const c = $('gambleContent');
  c.innerHTML = `
    <div style="text-align:center;padding:20px;">
      <div style="font-size:1.3em;margin-bottom:10px;">🐎 賽馬大賽</div>
      <div class="subtitle">押 5 匹馬之一，賠率不同</div>

      <div style="margin:20px 0;">
        <div class="subtitle">下注金額：</div>
        <input type="number" id="horseBetInput" value="1000" min="100" step="100"
          style="width:200px;text-align:center;background:#1a1a25;border:1px solid #2a2a3a;color:#4fc3f7;padding:8px;border-radius:6px;font-family:inherit;font-size:16px;">
      </div>

      <div style="margin-top:20px;display:flex;flex-direction:column;gap:8px;">
        ${HORSES.map(h => `
          <div class="equip-bag-item" style="cursor:pointer;border-color:#ffd54f;" onclick="playHorse(${h.id})">
            <div style="flex:1;">
              <div style="font-weight:bold;font-size:15px;">${h.icon} 第 ${h.id} 號馬：${h.name}</div>
              <div class="subtitle">賠率 ${h.odds} 倍｜勝率 ${h.winRate}%</div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="actions" style="margin-top:20px;">
        <button onclick="renderGamble()">返回賭場</button>
      </div>

      <div id="horseResult" style="margin-top:20px;font-size:1.2em;"></div>
    </div>
  `;
}

function playHorse(horseId) {
  const input = $('horseBetInput');
  const bet = Math.floor(parseInt(input.value) || 0);
  if (bet < 100) { log('最低下注 100 金！', 'lose'); return; }
  if (bet > S.money) { log('金幣不足！', 'lose'); return; }

  // 加權抽贏家
  const total = HORSES.reduce((s, h) => s + h.winRate, 0);
  let r = Math.random() * total;
  let winner = HORSES[0];
  for (const h of HORSES) {
    r -= h.winRate;
    if (r <= 0) { winner = h; break; }
  }

  const myHorse = HORSES.find(h => h.id === horseId);
  const won = winner.id === horseId;
  const profit = won ? Math.floor(bet * (myHorse.odds - 1)) : -bet;
  S.money += profit;

  const color = profit > 0 ? '#4caf50' : '#f44336';

  const resultDiv = $('horseResult');
  resultDiv.innerHTML = `
    <div style="margin:15px 0;font-size:1.3em;">
      🏆 冠軍：<span style="color:#ffd54f;">${winner.icon} 第 ${winner.id} 號 ${winner.name}</span>
    </div>
    <div style="color:${color};font-size:1.3em;">
      ${won ? `🎉 你贏了！${myHorse.odds} 倍！` : `💀 你輸了...`}
    </div>
    <div style="color:${color};margin-top:8px;">
      ${profit > 0 ? `+${profit.toLocaleString()} 金` : `${profit.toLocaleString()} 金`}
    </div>
  `;

  gambleLog(`🐎 賽馬：押 ${myHorse.name}，冠軍 ${winner.name}｜${profit > 0 ? '+' + profit : profit}`, profit > 0 ? 'win' : 'lose');
  updateTownUI();
}

// ══════════════════════════════════════════════════════════
//  🎁 抽獎箱
// ══════════════════════════════════════════════════════════
function openLottery() {
  const cost = 100000;
  const c = $('gambleContent');
  c.innerHTML = `
    <div style="text-align:center;padding:20px;">
      <div style="font-size:1.3em;margin-bottom:10px;">🎁 神裝抽獎箱</div>
      <div class="subtitle">花費 100,000 金，隨機抽一件神裝</div>
      <div class="subtitle">（保證稀有度 ≥ 4）</div>

      <div style="margin:30px 0;">
        <div style="font-size:3em;">🎁</div>
      </div>

      <div class="actions">
        <button class="gold" style="font-size:1.1em;padding:12px 24px;" onclick="drawLottery()">🎁 開箱（10 萬金）</button>
        <button onclick="renderGamble()">返回賭場</button>
      </div>

      <div id="lotteryResult" style="margin-top:20px;"></div>
    </div>
  `;
}

function drawLottery() {
  const cost = 100000;
  if (S.money < cost) { log('金幣不足！需要 100,000 金。', 'lose'); return; }

  S.money -= cost;

  // 保證稀有度 ≥ 4（史詩以上）
  const rarity = pickRarity(50); // bonus 50 → 提高高稀有度機率
  const item = genEquipment(S.level + 10, Math.max(4, rarity));
  S.inventory.push(item);

  const rar = RARITY[item.rarity];
  const colorMap = {4:'#ba68c8', 5:'#ffd54f', 6:'#ff5252'};

  const resultDiv = $('lotteryResult');
  resultDiv.innerHTML = `
    <div style="padding:15px;background:#1a1a25;border:2px solid ${colorMap[item.rarity]};border-radius:8px;">
      <div style="font-size:2em;margin-bottom:10px;">🎁</div>
      <div style="font-size:1.3em;color:${colorMap[item.rarity]};font-weight:bold;">
        ${item.name}
      </div>
      <div class="subtitle" style="margin-top:8px;">[${rar.name}] Lv.${item.level}</div>
      <div style="margin-top:10px;font-size:12px;">
        ${item.affixes.map(a => `<span class="equip-affix">${a.label}</span>`).join('')}
      </div>
    </div>
    <div class="actions" style="margin-top:15px;">
      <button class="gold" onclick="drawLottery()">再抽一次（10 萬金）</button>
      <button onclick="renderGamble()">返回賭場</button>
    </div>
  `;

  gambleLog(`🎁 抽獎箱：獲得 ${item.name} [${rar.name}]`, 'win');
  updateTownUI();
}
