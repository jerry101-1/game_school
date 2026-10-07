// ============================================================
//  ★ 啟動
// ============================================================

function startGame() {
  S.playerName = $('inputName').value.trim() || "無名勇者";
  const n = rand(1,100);
  if (n<=5) S.roleType=1; else if (n<=12) S.roleType=2; else if (n<=20) S.roleType=3;
  else if (n<=35) S.roleType=4; else if (n<=45) S.roleType=5; else if (n<=55) S.roleType=6;
  else if (n<=63) S.roleType=7; else if (n<=72) S.roleType=8; else if (n<=80) S.roleType=9;
  else if (n<=88) S.roleType=10; else if (n<=95) S.roleType=11; else S.roleType=12;

  const role = ROLES[S.roleType];
  S.roleName = role.name;
  S.maxHp = role.hp; S.hp = role.hp;
  S.atk = role.atk; S.def = role.def;
  S.money = 0; S.level = 1; S.exp = 0; S.expNeeded = 100;
  S.chapter = 1; S.killCount = 0; S.runCount = 1; S.potion = 3;
  S.swordLevel = S.shieldLevel = S.contractLevel = S.expShopLevel = 0;
  S.playexp = 100;
  S.fruits = {}; S.activeFruit = null;
  S.equipment = {weapon:null,armor:null,accessory:null};
  S.inventory = [];
  S.talentPoints = 0; S.talents = {};
  S.breakthroughLevel = 0; S.breakthroughPoints = 0; S.breakthroughMilestones = {};
  S.roleLevel = 1; S.roleExp = 0; S.roleLevels = { [S.roleType]: 1 };
  S.abyssFloor = 0; S.abyssBest = 0; S.inAbyss = false;
  S.dungeon = { active:null, floor:0, cleared:0 };
  S.guild = { id:null, contrib:0, questProgress:{}, questClaimed:{} };
  S.pets = {}; S.activePet = null;
  S.combo = 0; S.maxCombo = 0;
  S.achievements = {};
  S.critRate = 15; S.critDmg = 100; S.lifesteal = 0; S.reflect = 0;
  S.goldBonus = 0; S.expBonus = 0; S.cdReduce = 0; S.fruitDmgBonus = 0;
  S.playerDodge = 5;
  if (S.roleType === 3) S.playerDodge += 10;
  if (S.roleType === 12) S.playerDodge += 5;
  S.buttonLocked = false; S.monster = null; S.inBattle = false; S.gameOver = false;

  clearLog();
  log(`歡迎你，${S.playerName}！`, 'system');
  log(`你的職業是：${S.roleName} (Lv.1)`, 'system');
  log(`【職業特性】${role.desc}`, 'system');
  updateTownUI();
  showScreen('screen-town');
  checkAchievements();
}

function handleDeath() {
  S.inBattle = false;
  S.gameOver = true;
  log('【你倒下了】','lose');
  const lostMoney = Math.floor(S.money * 0.25);
  S.money -= lostMoney;
  S.hp = effMaxHp();
  S.potion = Math.max(S.potion, 1);
  S.runCount++;
  S.abyssFloor = 0;
  S.inAbyss = false;
  log(`損失了 ${lostMoney} 金幣，但重新站了起來。`,'system');
  updateTownUI();
  saveGame();
  showScreen('screen-town');
}

// 鍵盤快捷鍵
document.addEventListener('keydown', e => {
  if (!S.inBattle || S.gameOver || S.autoMode) return;
  switch(e.key) {
    case '1': playerAttack(); break;
    case '2': if (S.skillCD === 0) playerSkill(); break;
    case '3': playerPower(); break;
    case '4': playerDefend(); break;
    case '5': if (S.potion > 0) playerPotion(); break;
    case '6': if ($('btnFruitSkill') && !$('btnFruitSkill').disabled) playerFruitSkill(); break;
    case 'q': if (S.combo >= 5) playerCombo(); break;
  }
});

// 初始化
(function init() {
  if (loadGame()) {
    log(`歡迎回來，${S.playerName}！`,'system');
    updateTownUI();
    showScreen('screen-town');
    checkAchievements();
  } else {
    showScreen('screen-start');
  }
  log('按 1-6 可使用快捷鍵（戰鬥中），Q 連擊爆發。','system');
})();
