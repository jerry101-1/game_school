function openRebirth() { showScreen('screen-rebirth'); renderRebirth(); }
function closeRebirth() { updateTownUI(); showScreen('screen-town'); }

function renderRebirth() {
  const c = $('rebirthContent');
  const points = getRebirthPointsGained();
  
  let html = `
    <div style="text-align:center; padding:10px; margin-bottom:15px;">
      <div style="font-size:1.2em;color:#ffd54f;">第 ${S.rebirthCount || 0} 次轉生</div>
      <div style="font-size:2em;color:#ff5252;font-weight:bold;margin-top:10px;">
        ${formatNumber(S.rebirthPoints || 0)} <span style="font-size:0.5em;color:#fff;">點數</span>
      </div>
    </div>

    <div class="panel" style="border-color:#ff5252; background:linear-gradient(135deg,#2a1a1a,#151520);">
      <div class="panel-title" style="color:#ff5252;">🔥 進行轉生</div>
      <div class="subtitle">重置等級、章節、金幣、裝備、突破、天賦。</div>
      <div class="subtitle" style="color:#4caf50;">保留職業、果實、寵物、公會、成就。</div>
      
      <div style="margin-top:10px;font-size:1.2em;text-align:center;">
        目前可獲得：<b style="color:#ffd54f;">${formatNumber(points)}</b> 點數
      </div>
      
      <button class="danger" style="width:100%;margin-top:10px;font-size:1.1em;padding:12px;" onclick="doRebirth()">
        執行轉生
      </button>
    </div>

    <div class="panel" style="margin-top:15px;">
      <div class="panel-title">✨ 消耗點數強化 (永久生效)</div>
      
      <div class="talent-item" style="flex-wrap: wrap; gap: 8px;">
        <div class="talent-info" style="min-width: 150px;">
          <div class="talent-name">⚔️ 攻擊強化 <span style="color:#4caf50;">+${S.rebirthBonusAtk || 0}%</span></div>
          <div class="talent-desc">每消耗 1 點，永久增加 10% 攻擊</div>
        </div>
        <div style="display:flex; gap:4px;">
          <button class="danger small" onclick="upgradeRebirth('atk', 1)">+1</button>
          <button class="danger small" onclick="upgradeRebirth('atk', 10)">+10</button>
          <button class="danger small" onclick="upgradeRebirth('atk', 100)">+100</button>
          <button class="gold small" onclick="upgradeRebirth('atk', 'max')">Max</button>
        </div>
      </div>
      
      <div class="talent-item" style="flex-wrap: wrap; gap: 8px;">
        <div class="talent-info" style="min-width: 150px;">
          <div class="talent-name">🩷 生命強化 <span style="color:#4caf50;">+${S.rebirthBonusHp || 0}%</span></div>
          <div class="talent-desc">每消耗 1 點，永久增加 10% HP</div>
        </div>
        <div style="display:flex; gap:4px;">
          <button class="danger small" onclick="upgradeRebirth('hp', 1)">+1</button>
          <button class="danger small" onclick="upgradeRebirth('hp', 10)">+10</button>
          <button class="danger small" onclick="upgradeRebirth('hp', 100)">+100</button>
          <button class="gold small" onclick="upgradeRebirth('hp', 'max')">Max</button>
        </div>
      </div>

      <div class="talent-item" style="flex-wrap: wrap; gap: 8px;">
        <div class="talent-info" style="min-width: 150px;">
          <div class="talent-name">⭐ 經驗強化 <span style="color:#4caf50;">+${S.rebirthBonusExp || 0}%</span></div>
          <div class="talent-desc">每消耗 1 點，永久增加 20% 經驗</div>
        </div>
        <div style="display:flex; gap:4px;">
          <button class="danger small" onclick="upgradeRebirth('exp', 1)">+1</button>
          <button class="danger small" onclick="upgradeRebirth('exp', 10)">+10</button>
          <button class="danger small" onclick="upgradeRebirth('exp', 100)">+100</button>
          <button class="gold small" onclick="upgradeRebirth('exp', 'max')">Max</button>
        </div>
      </div>

      <div class="talent-item" style="flex-wrap: wrap; gap: 8px;">
        <div class="talent-info" style="min-width: 150px;">
          <div class="talent-name">💰 金幣強化 <span style="color:#4caf50;">+${S.rebirthBonusGold || 0}%</span></div>
          <div class="talent-desc">每消耗 1 點，永久增加 20% 金幣</div>
        </div>
        <div style="display:flex; gap:4px;">
          <button class="danger small" onclick="upgradeRebirth('gold', 1)">+1</button>
          <button class="danger small" onclick="upgradeRebirth('gold', 10)">+10</button>
          <button class="danger small" onclick="upgradeRebirth('gold', 100)">+100</button>
          <button class="gold small" onclick="upgradeRebirth('gold', 'max')">Max</button>
        </div>
      </div>
    </div>
  `;
  c.innerHTML = html;
}
