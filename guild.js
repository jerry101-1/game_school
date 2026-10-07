// ============================================================
//  ★ 公會系統
//  加入公會 → 獲得屬性加成 → 完成每日任務 → 累積貢獻
// ============================================================

function openGuild() { showScreen('screen-guild'); renderGuild(); }
function closeGuild() { updateTownUI(); showScreen('screen-town'); }

function renderGuild() {
  const c = $('guildContent');
  if (!S.guild.id) {
    // 未加入公會
    let html = `<div class="subtitle" style="text-align:center;padding:8px;">
      選擇一個公會加入，可獲得屬性加成與每日任務
    </div>`;
    for (const [id, g] of Object.entries(GUILDS)) {
      html += `<div class="guild-card">
        <div class="guild-name">${g.icon} ${g.name}</div>
        <div class="subtitle">${g.desc}</div>
        <div class="subtitle" style="color:#ffd54f;margin-top:6px;">加成：${formatBonus(g.bonus)}</div>
        <div style="margin-top:8px;">
          <button class="gold small" onclick="joinGuild('${id}')">
            加入（${g.joinCost} 金）
          </button>
        </div>
      </div>`;
    }
    c.innerHTML = html;
    return;
  }

  // 已加入公會
  const g = GUILDS[S.guild.id];
  let html = `<div class="guild-card">
    <div class="guild-name">${g.icon} ${g.name}</div>
    <div class="subtitle">${g.desc}</div>
    <div class="subtitle" style="color:#ffd54f;margin-top:6px;">加成：${formatBonus(g.bonus)}</div>
  </div>`;

  html += `<div class="panel" style="margin-top:12px;">
    <div class="panel-title">📋 公會任務</div>`;
  g.quests.forEach(q => {
    const cur = S.guild.questProgress[q.key] || 0;
    const done = cur >= q.goal;
    html += `<div class="talent-item">
      <div class="talent-info">
        <div class="talent-name">${q.name}</div>
        <div class="talent-desc">進度：${Math.min(cur, q.goal)} / ${q.goal}</div>
        <div class="talent-desc" style="color:#ffd54f;">獎勵：💰${q.reward.money} ⭐${q.reward.exp}</div>
      </div>
      <button class="gold small" ${done?'':'disabled'} onclick="claimGuildQuest('${q.id}')">
        ${done?'領取':'未完成'}
      </button>
    </div>`;
  });
  html += `</div>`;

  html += `<div class="actions" style="margin-top:12px;">
    <button class="danger" onclick="leaveGuild()">退出公會</button>
  </div>`;

  c.innerHTML = html;
}

function formatBonus(b) {
  const parts = [];
  if (b.atkPct) parts.push(`攻擊 +${b.atkPct}%`);
  if (b.crit) parts.push(`爆擊 +${b.crit}%`);
  if (b.critDmg) parts.push(`爆傷 +${b.critDmg}%`);
  if (b.exp) parts.push(`經驗 +${b.exp}%`);
  if (b.gold) parts.push(`金幣 +${b.gold}%`);
  return parts.join('、') || '無';
}

function joinGuild(id) {
  const g = GUILDS[id];
  if (!g) return;
  if (S.money < g.joinCost) { log('金幣不足！', 'lose'); return; }
  S.money -= g.joinCost;
  S.guild.id = id;
  S.guild.contrib = 0;
  S.guild.questProgress = {};
  S.guild.questClaimed = {};
  log(`🏛️ 加入公會：${g.name}`, 'guild-text');
  checkAchievements();
  renderGuild();
  updateTownUI();
}

function leaveGuild() {
  if (!confirm('確定要退出公會嗎？（已累積的進度會清空）')) return;
  const oldName = GUILDS[S.guild.id]?.name;
  S.guild = { id:null, contrib:0, questProgress:{}, questClaimed:{} };
  log(`退出公會：${oldName}`, 'guild-text');
  renderGuild();
  updateTownUI();
}

function claimGuildQuest(qid) {
  const g = GUILDS[S.guild.id];
  if (!g) return;
  const q = g.quests.find(x => x.id === qid);
  if (!q) return;
  const cur = S.guild.questProgress[q.key] || 0;
  if (cur < q.goal) { log('任務尚未完成！', 'lose'); return; }
  if (S.guild.questClaimed && S.guild.questClaimed[qid]) { log('已領取過！', 'lose'); return; }
  S.money += q.reward.money;
  S.exp += q.reward.exp;
  S.guild.contrib = (S.guild.contrib || 0) + 1;
  if (!S.guild.questClaimed) S.guild.questClaimed = {};
  S.guild.questClaimed[qid] = true;
  log(`📋 完成公會任務：${q.name}！獲得 💰${q.reward.money} ⭐${q.reward.exp}`, 'win');
  renderGuild();
  updateTownUI();
}

// ============================================================
//  ★ 公會任務進度累加（在對應事件發生時呼叫）
// ============================================================
function addGuildProgress(key, amount = 1) {
  if (!S.guild.id) return;
  if (!S.guild.questProgress) S.guild.questProgress = {};
  S.guild.questProgress[key] = (S.guild.questProgress[key] || 0) + amount;

  // 檢查是否達成，達成時提示
  const g = GUILDS[S.guild.id];
  if (!g) return;
  g.quests.forEach(q => {
    if (q.key !== key) return;
    if (S.guild.questClaimed && S.guild.questClaimed[q.id]) return;
    const cur = S.guild.questProgress[key];
    if (cur === q.goal) {
      log(`📋 公會任務《${q.name}》已達成！可至公會領取獎勵。`, 'guild-text');
    }
  });
}
