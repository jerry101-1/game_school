// ============================================================
//  ★ 公會系統 2.0（公會王 + 技能樹）
// ============================================================

let guildTab = 'quests'; // 當前分頁：quests(任務) / skills(技能) / boss(世界王)

function openGuild() { showScreen('screen-guild'); renderGuild(); }
function closeGuild() { updateTownUI(); showScreen('screen-town'); }

function renderGuild() {
  const c = $('guildContent');
  
  if (!S.guild.id) {
    // 未加入公會畫面保持不變
    let html = `<div class="subtitle" style="text-align:center;padding:8px;">選擇一個公會加入，可獲得屬性加成與每日任務</div>`;
    for (const [id, g] of Object.entries(GUILDS)) {
      html += `<div class="guild-card">
        <div class="guild-name">${g.icon} ${g.name}</div>
        <div class="subtitle">${g.desc}</div>
        <div class="subtitle" style="color:#ffd54f;margin-top:6px;">加成：${formatBonus(g.bonus)}</div>
        <div style="margin-top:8px;">
          <button class="gold small" onclick="joinGuild('${id}')">加入（${g.joinCost} 金）</button>
        </div>
      </div>`;
    }
    c.innerHTML = html;
    return;
  }

  // 已加入公會畫面
  const g = GUILDS[S.guild.id];
  let html = `<div class="guild-card">
    <div class="guild-name">${g.icon} ${g.name}</div>
    <div class="subtitle">${g.desc} ｜ 公會貢獻：<b style="color:#4fc3f7;">${formatNumber(S.guild.contrib || 0)}</b></div>
  </div>`;

  // 分頁切換按鈕
  html += `<div class="tabs" style="margin-top:15px;">
    <div class="tab ${guildTab === 'quests' ? 'active' : ''}" onclick="guildTab='quests';renderGuild();">📋 每日任務</div>
    <div class="tab ${guildTab === 'skills' ? 'active' : ''}" onclick="guildTab='skills';renderGuild();">✨ 公會技能</div>
    <div class="tab ${guildTab === 'boss' ? 'active' : ''}" onclick="guildTab='boss';renderGuild();">👹 世界王</div>
  </div>`;

  // --- 每日任務分頁 ---
  if (guildTab === 'quests') {
    html += `<div class="panel" style="margin-top:0;">`;
    g.quests.forEach(q => {
      const cur = S.guild.questProgress[q.key] || 0;
      const done = cur >= q.goal;
      const claimed = S.guild.questClaimed && S.guild.questClaimed[q.id];
      html += `<div class="talent-item">
        <div class="talent-info">
          <div class="talent-name">${q.name}</div>
          <div class="talent-desc">進度：${formatNumber(Math.min(cur, q.goal))} / ${formatNumber(q.goal)}</div>
          <div class="talent-desc" style="color:#ffd54f;">獎勵：💰${formatNumber(q.reward.money)} ⭐${formatNumber(q.reward.exp)} 貢獻</div>
        </div>
        <button class="gold small" ${(done && !claimed) ? '' : 'disabled'} onclick="claimGuildQuest('${q.id}')">
          ${claimed ? '已領取' : (done ? '領取' : '未完成')}
        </button>
      </div>`;
    });
    html += `</div>`;
  }

  // --- 公會技能分頁 ---
  else if (guildTab === 'skills') {
    html += `<div class="panel" style="margin-top:0;">
      <div class="subtitle">消耗公會貢獻，解鎖永久屬性加成。</div>`;
    for (const [id, skill] of Object.entries(GUILD_SKILLS)) {
      const lv = S.guildSkills[id] || 0;
      const cost = 10 + lv * 15; // 花費貢獻點
      const canUp = lv < skill.max && (S.guild.contrib || 0) >= cost;
      html += `<div class="talent-item">
        <div class="talent-info">
          <div class="talent-name">${skill.name} <span class="talent-lv">Lv.${lv}/${skill.max}</span></div>
          <div class="talent-desc">${skill.desc}</div>
        </div>
        <button class="talent small" ${canUp ? '' : 'disabled'} onclick="upgradeGuildSkill('${id}', ${cost})">
          升級 (${cost} 貢獻)
        </button>
      </div>`;
    }
    html += `</div>`;
  }

  // --- 世界王分頁 ---
  else if (guildTab === 'boss') {
    html += `<div class="panel" style="margin-top:0; text-align:center;">
      <div class="panel-title" style="color:#f44336; justify-content:center;">👹 公會世界王</div>
      <div class="subtitle">挑戰公會首領，依照傷害排名獲得大量貢獻。</div>
      <div style="font-size:2em; margin:10px 0;">🦖</div>
      <div style="font-size:1.2em; color:#ffd54f; font-weight:bold;">${GUILD_BOSS.name}</div>
      <div class="subtitle">HP：${formatNumber(GUILD_BOSS.hp)}</div>
      <div class="actions" style="margin-top:15px;">
        <button class="danger" style="padding:15px 30px; font-size:1.2em;" onclick="challengeGuildBoss()">發起挑戰</button>
      </div>
      <div class="subtitle" style="margin-top:10px; color:#888;">※ 每天只能挑戰一次，失敗後可重複挑戰。</div>
    </div>`;
  }

  html += `<div class="actions" style="margin-top:15px;">
    <button class="danger" onclick="leaveGuild()">退出公會</button>
  </div>`;

  c.innerHTML = html;
}

// 升級公會技能
function upgradeGuildSkill(id, cost) {
  if ((S.guild.contrib || 0) < cost) { log('貢獻點不足！', 'lose'); return; }
  if (!S.guildSkills) S.guildSkills = {};
  if ((S.guildSkills[id] || 0) >= GUILD_SKILLS[id].max) return;

  S.guild.contrib -= cost;
  S.guildSkills[id] = (S.guildSkills[id] || 0) + 1;
  log(`✨ 公會技能【${GUILD_SKILLS[id].name}】提升至 Lv.${S.guildSkills[id]}！`, 'win');
  renderGuild();
  updateTownUI();
}

// 挑戰公會王
function challengeGuildBoss() {
  // 複製一份公會王的資料到戰鬥用的 monster 物件
  S.monster = {
    name: GUILD_BOSS.name,
    skill: GUILD_BOSS.skill,
    hp: GUILD_BOSS.hp,
    maxHp: GUILD_BOSS.hp,
    atk: GUILD_BOSS.atk,
    def: GUILD_BOSS.def,
    exp: GUILD_BOSS.exp,
    money: GUILD_BOSS.money,
    weak: GUILD_BOSS.weak,
    res: GUILD_BOSS.res,
    dodge: GUILD_BOSS.dodge,
    lv: S.level + 10,
    type: 999, // 特殊 ID 代表公會王
    prefixType: 0,
    prefix: "",
    isBoss: true,
    isGuildBoss: true, // 標記為公會王
  };
  
  log(`⚔️ 你向 ${GUILD_BOSS.name} 發起了挑戰！`, 'boss');
  startBattle();
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

// 加入與退出公會 (保持不變)
function joinGuild(id) {
  const g = GUILDS[id];
  if (!g) return;
  if (S.money < g.joinCost) { log('金幣不足！', 'lose'); return; }
  S.money -= g.joinCost;
  S.guild.id = id;
  S.guild.contrib = 0;
  S.guild.questProgress = {};
  S.guild.questClaimed = {};
  if (!S.guildSkills) S.guildSkills = {};
  log(`🏛️ 加入公會：${g.name}`, 'guild-text');
  checkAchievements();
  renderGuild();
  updateTownUI();
}

function leaveGuild() {
  if (!confirm('確定要退出公會嗎？（已累積的進度會清空）')) return;
  const oldName = GUILDS[S.guild.id]?.name;
  S.guild = { id:null, contrib:0, questProgress:{}, questClaimed:{} };
  S.guildSkills = {};
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
  S.guild.contrib = (S.guild.contrib || 0) + 5; // 固定給 5 點貢獻
  if (!S.guild.questClaimed) S.guild.questClaimed = {};
  S.guild.questClaimed[qid] = true;
  log(`📋 完成公會任務：${q.name}！獲得 💰${formatNumber(q.reward.money)} ⭐${formatNumber(q.reward.exp)} 與 5 貢獻`, 'win');
  renderGuild();
  updateTownUI();
}

function addGuildProgress(key, amount = 1) {
  if (!S.guild.id) return;
  if (!S.guild.questProgress) S.guild.questProgress = {};
  S.guild.questProgress[key] = (S.guild.questProgress[key] || 0) + amount;

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
