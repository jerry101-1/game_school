// ============================================================
//  ★ 純資料檔 — 所有數值表都在這
//  想改平衡、加怪物、加職業都只改這裡
// ============================================================

// ── 職業（12 種，含 4 階技能） ──
const ROLES = {
  1:{name:"人類劍聖",hp:160,def:15,atk:80,desc:"均衡型，技能必中要害",
    skills:[
      {lv:1,  name:"斬擊",     cd:2,mult:1.8,desc:"基礎劍術，180%傷害"},
      {lv:15, name:"十字斬",   cd:3,mult:2.6,desc:"十字斬擊，260%傷害"},
      {lv:50, name:"聖光斬",   cd:4,mult:4.0,desc:"神聖劍技，400%傷害"},
      {lv:100,name:"劍聖奧義", cd:6,mult:7.0,desc:"劍聖絕學，700%傷害"},
    ]},
  2:{name:"鐵壁戰士",hp:240,def:35,atk:45,desc:"高防高血，技能附格擋",
    skills:[
      {lv:1,  name:"盾擊",     cd:2,mult:1.5,desc:"盾牌猛擊，150%傷害"},
      {lv:15, name:"鐵壁",     cd:3,mult:2.2,desc:"防禦反擊，220%傷害"},
      {lv:50, name:"震地",     cd:4,mult:3.5,desc:"震地重擊，350%傷害"},
      {lv:100,name:"不滅壁壘", cd:6,mult:6.0,desc:"不滅之力，600%傷害"},
    ]},
  3:{name:"疾影刺客",hp:140,def:7,atk:110,desc:"高攻高閃，技能爆傷",
    skills:[
      {lv:1,  name:"影刺",     cd:2,mult:2.0,desc:"快速刺擊，200%傷害"},
      {lv:15, name:"連影",     cd:3,mult:3.0,desc:"殘影連擊，300%傷害"},
      {lv:50, name:"瞬殺",     cd:4,mult:4.5,desc:"瞬間斬殺，450%傷害"},
      {lv:100,name:"暗殺奧義", cd:6,mult:7.5,desc:"必死一擊，750%傷害"},
    ]},
  4:{name:"熱血新手",hp:150,def:9,atk:35,desc:"成長型，技能有等級加成",
    skills:[
      {lv:1,  name:"亂打",     cd:1,mult:1.5,desc:"一頓亂打，150%傷害"},
      {lv:15, name:"努力",     cd:2,mult:2.2,desc:"全力一擊，220%傷害"},
      {lv:50, name:"爆發",     cd:3,mult:3.5,desc:"新手爆發，350%傷害"},
      {lv:100,name:"主角光環", cd:5,mult:6.5,desc:"主角之力，650%傷害"},
    ]},
  5:{name:"奧術法師",hp:130,def:10,atk:95,desc:"技能帶火屬性，機率冰凍",
    skills:[
      {lv:1,  name:"火球術",   cd:2,mult:1.9,desc:"火球術，190%傷害"},
      {lv:15, name:"大火球",   cd:3,mult:2.8,desc:"強化火球，280%傷害"},
      {lv:50, name:"隕石術",   cd:4,mult:4.2,desc:"隕石降臨，420%傷害"},
      {lv:100,name:"超新星",   cd:6,mult:7.2,desc:"超新星爆發，720%傷害"},
    ]},
  6:{name:"暗影刺客",hp:140,def:20,atk:75,desc:"技能帶雷屬性，可吸血",
    skills:[
      {lv:1,  name:"暗影爪",   cd:2,mult:1.7,desc:"暗影爪擊，170%傷害"},
      {lv:15, name:"黑刃",     cd:3,mult:2.5,desc:"黑刃斬，250%傷害"},
      {lv:50, name:"深淵斬",   cd:4,mult:4.0,desc:"深淵之斬，400%傷害"},
      {lv:100,name:"虛無吞噬", cd:6,mult:7.0,desc:"吞噬一切，700%傷害"},
    ]},
  7:{name:"聖光牧師",hp:170,def:18,atk:60,desc:"技能可治療自身",
    skills:[
      {lv:1,  name:"聖光彈",   cd:2,mult:1.6,desc:"聖光彈，160%傷害"},
      {lv:15, name:"治癒術",   cd:3,mult:2.2,desc:"治癒術，220%傷害 + 回血"},
      {lv:50, name:"神聖光束", cd:4,mult:3.6,desc:"神聖光束，360%傷害"},
      {lv:100,name:"天使降臨", cd:6,mult:6.5,desc:"天使降臨，650%傷害"},
    ]},
  8:{name:"狂暴蠻戰",hp:200,def:12,atk:100,desc:"血量越低攻擊越高",
    skills:[
      {lv:1,  name:"猛擊",     cd:2,mult:1.9,desc:"猛擊，190%傷害"},
      {lv:15, name:"狂暴斬",   cd:3,mult:2.8,desc:"狂暴斬，280%傷害"},
      {lv:50, name:"血怒",     cd:4,mult:4.3,desc:"血之憤怒，430%傷害"},
      {lv:100,name:"狂戰士",   cd:6,mult:7.4,desc:"狂戰士之魂，740%傷害"},
    ]},
  9:{name:"元素術士",hp:135,def:14,atk:85,desc:"技能屬性隨機變化",
    skills:[
      {lv:1,  name:"元素彈",   cd:2,mult:1.8,desc:"元素彈，180%傷害"},
      {lv:15, name:"元素爆",   cd:3,mult:2.6,desc:"元素爆發，260%傷害"},
      {lv:50, name:"元素風暴", cd:4,mult:4.1,desc:"元素風暴，410%傷害"},
      {lv:100,name:"混沌理論", cd:6,mult:7.3,desc:"混沌之力，730%傷害"},
    ]},
  10:{name:"龍騎士",hp:190,def:25,atk:90,desc:"全能型，技能附龍息",
    skills:[
      {lv:1,  name:"龍之斬",   cd:2,mult:1.9,desc:"龍之斬，190%傷害"},
      {lv:15, name:"龍息",     cd:3,mult:2.7,desc:"龍息噴吐，270%傷害"},
      {lv:50, name:"龍鱗衝",   cd:4,mult:4.2,desc:"龍鱗衝擊，420%傷害"},
      {lv:100,name:"龍神降臨", cd:6,mult:7.5,desc:"龍神降臨，750%傷害"},
    ]},
  11:{name:"死靈法師",hp:145,def:16,atk:88,desc:"技能吸取生命轉為護盾",
    skills:[
      {lv:1,  name:"亡靈彈",   cd:2,mult:1.7,desc:"亡靈彈，170%傷害"},
      {lv:15, name:"汲取",     cd:3,mult:2.4,desc:"汲取生命，240%傷害"},
      {lv:50, name:"亡靈大軍", cd:4,mult:3.8,desc:"亡靈大軍，380%傷害"},
      {lv:100,name:"死神之鐮", cd:6,mult:6.8,desc:"死神之鐮，680%傷害"},
    ]},
  12:{name:"神射手",hp:150,def:13,atk:105,desc:"高爆擊率，無視部分防禦",
    skills:[
      {lv:1,  name:"精準射擊", cd:2,mult:1.8,desc:"精準射擊，180%傷害"},
      {lv:15, name:"多重箭",   cd:3,mult:2.6,desc:"多重箭，260%傷害"},
      {lv:50, name:"穿甲箭",   cd:4,mult:4.0,desc:"穿甲箭，400%傷害"},
      {lv:100,name:"神之箭",   cd:6,mult:7.2,desc:"神之箭，720%傷害"},
    ]},
};

// ── 怪物詞綴 ──
const PREFIXES = {
  1:{name:"狂暴的",desc:"低血時攻擊×2"},2:{name:"荊棘的",desc:"攻擊時反傷5%"},
  3:{name:"迅捷的",desc:"25%機率攻擊兩次"},4:{name:"吸血的",desc:"攻擊時回復30%傷害"},
  5:{name:"詛咒的",desc:"技能CD+1"},6:{name:"堅硬的",desc:"防禦力×1.5"},
  7:{name:"劇毒的",desc:"攻擊附加中毒"},8:{name:"燃燒的",desc:"攻擊附加燃燒"},
  9:{name:"虛弱的",desc:"攻擊降低你攻擊力"},10:{name:"巨大的",desc:"血量×1.5，攻擊+20%"},
  11:{name:"幽靈的",desc:"閃避率+20%"},12:{name:"詛咒血脈",desc:"每回合回復5%HP"},
};

// ── 普通怪物 ──
const MONSTERS = {
  1:{name:"野生史萊姆",skill:"跳起來壓在你臉上！",hp:50,atk:10,def:2,exp:30,money:20,dodge:0,weak:1,res:4},
  2:{name:"暴躁哥布林",skill:"揮舞著鐵劍亂砍！",hp:120,atk:30,def:5,exp:60,money:40,dodge:5,weak:2,res:1},
  3:{name:"兇猛野狼",skill:"咬向你的喉嚨！",hp:180,atk:40,def:10,exp:100,money:70,dodge:15,weak:1,res:2},
  4:{name:"石像鬼",skill:"石化皮膚猛撞！",hp:350,atk:15,def:50,exp:180,money:90,dodge:0,weak:3,res:4},
  5:{name:"骷髏弓箭手",skill:"射出了冷箭！",hp:100,atk:45,def:1,exp:120,money:80,dodge:10,weak:1,res:3},
  6:{name:"迷幻蘑菇",skill:"散發毒孢子！",hp:150,atk:25,def:15,exp:90,money:60,dodge:5,weak:1,res:2},
  7:{name:"【稀有】黃金波利",skill:"想逃跑！",hp:30,atk:1,def:999,exp:2000,money:2000,dodge:0,weak:3,res:4},
};

// ── BOSS ──
const BOSSES = {
  1:{name:"【第 1 章 BOSS】哥布林王",skill:"舉起巨斧，率領哥布林大軍！",hp:800,atk:50,def:15,exp:500,money:300,weak:2,res:1,
     lines:["「區區人類，也敢闖入我的領地？」","「哥布林大軍，給我上！」","「我的斧頭會讓你後悔來到這裡！」"]},
  2:{name:"【第 2 章 BOSS】石魔像",skill:"石化皮膚，每回合回復 HP！",hp:2000,atk:80,def:60,exp:800,money:500,weak:3,res:4,
     lines:["「轟……轟……」","「大地是我的身軀，你們無法撼動！」","「感受大地的憤怒吧！」"]},
  3:{name:"【第 3 章 BOSS】骷髏領主",skill:"召喚不死大軍，吸取生命！",hp:4000,atk:120,def:50,exp:1500,money:1000,weak:1,res:3,
     lines:["「死亡不是終點，而是開始……」","「你的靈魂將成為我的士兵！」","「亡者們，起來吧！」"]},
  4:{name:"【第 4 章 BOSS】火焰巨龍",skill:"噴吐黑炎，燃燒一切！",hp:8000,atk:200,def:100,exp:3000,money:2000,weak:2,res:1,
     lines:["「渺小的人類……」","「在我的龍息下化為灰燼吧！」","「這是對褻瀆龍族者的審判！」"]},
  5:{name:"【最終 BOSS】毀滅之龍",skill:"世界終焉的化身！",hp:20000,atk:400,def:200,exp:10000,money:10000,weak:3,res:1,
     lines:["「你終於來了……」","「我是世界的終結，也是一切的開端。」","「在虛無中化為塵埃吧！」"]},
};

// ── 果實 ──
const FRUITS = {
  rubber:{name:"橡膠果實",icon:"🟣",rarity:"普通",element:4,desc:"身體化為橡膠，攻擊附帶彈性衝擊",
    skills:[{lv:1,name:"橡膠槍",cd:2,mult:1.5,desc:"伸長手臂攻擊，造成150%傷害"},
            {lv:15,name:"橡膠火箭炮",cd:3,mult:2.2,desc:"蓄力一擊，造成220%傷害"},
            {lv:50,name:"橡膠巨人之拳",cd:4,mult:3.5,desc:"巨大化拳頭，造成350%傷害並暈眩"},
            {lv:100,name:"橡膠覺醒·五檔",cd:6,mult:6.0,desc:"覺醒形態，造成600%傷害並回復30%HP"}]},
  flame:{name:"燒燒果實",icon:"🔴",rarity:"稀有",element:1,desc:"身體化為火焰，攻擊附帶燃燒",
    skills:[{lv:1,name:"火焰拳",cd:2,mult:1.6,desc:"火焰纏繞拳頭，造成160%傷害並附加燃燒"},
            {lv:15,name:"炎帝",cd:3,mult:2.4,desc:"巨大火球，造成240%傷害"},
            {lv:50,name:"螢火·火達摩",cd:4,mult:3.8,desc:"連續火焰攻擊，造成380%傷害"},
            {lv:100,name:"炎帝·業火",cd:6,mult:6.5,desc:"地獄業火，造成650%傷害並附加強力燃燒"}]},
  ice:{name:"冰冰果實",icon:"🔵",rarity:"稀有",element:2,desc:"身體化為寒冰，攻擊附帶冰凍",
    skills:[{lv:1,name:"冰之箭",cd:2,mult:1.5,desc:"射出冰箭，造成150%傷害"},
            {lv:15,name:"冰河時代",cd:3,mult:2.3,desc:"凍結敵人，造成230%傷害並冰凍1回合"},
            {lv:50,name:"冰之聖劍",cd:4,mult:3.6,desc:"冰劍斬擊，造成360%傷害"},
            {lv:100,name:"絕對零度",cd:6,mult:6.2,desc:"凍結一切，造成620%傷害並冰凍2回合"}]},
  thunder:{name:"轟雷果實",icon:"⚡",rarity:"稀有",element:3,desc:"身體化為雷電，攻擊附帶麻痺",
    skills:[{lv:1,name:"雷電拳",cd:2,mult:1.7,desc:"雷電纏繞，造成170%傷害"},
            {lv:15,name:"雷神之怒",cd:3,mult:2.5,desc:"落雷攻擊，造成250%傷害"},
            {lv:50,name:"雷迎",cd:4,mult:4.0,desc:"巨大雷球，造成400%傷害"},
            {lv:100,name:"雷霆·神罰",cd:6,mult:7.0,desc:"天罰雷霆，造成700%傷害無視防禦"}]},
  dark:{name:"暗暗果實",icon:"🌑",rarity:"史詩",element:3,desc:"操控黑暗，攻擊附帶吸血",
    skills:[{lv:1,name:"暗影球",cd:2,mult:1.6,desc:"黑暗球體，造成160%傷害並吸血20%"},
            {lv:15,name:"暗穴",cd:3,mult:2.4,desc:"吞噬一切，造成240%傷害並吸血40%"},
            {lv:50,name:"暗影吞噬",cd:4,mult:3.8,desc:"吞噬敵人，造成380%傷害並吸血60%"},
            {lv:100,name:"黑洞·解放",cd:6,mult:6.8,desc:"釋放黑洞，造成680%傷害並吸血80%"}]},
  light:{name:"閃閃果實",icon:"✨",rarity:"史詩",element:3,desc:"操控光，攻擊附帶神聖傷害",
    skills:[{lv:1,name:"光之刃",cd:2,mult:1.7,desc:"光刃斬擊，造成170%傷害"},
            {lv:15,name:"八咫鏡",cd:3,mult:2.5,desc:"反射光線，造成250%傷害"},
            {lv:50,name:"天叢雲劍",cd:4,mult:4.0,desc:"神聖斬擊，造成400%傷害"},
            {lv:100,name:"光之審判",cd:6,mult:7.2,desc:"神聖審判，造成720%傷害並回復20%HP"}]},
  quake:{name:"震震果實",icon:"💥",rarity:"傳說",element:4,desc:"引發地震，攻擊無視部分防禦",
    skills:[{lv:1,name:"震動拳",cd:2,mult:1.8,desc:"震動攻擊，造成180%傷害無視20%防禦"},
            {lv:15,name:"海震",cd:3,mult:2.6,desc:"引發海震，造成260%傷害"},
            {lv:50,name:"空震",cd:4,mult:4.2,desc:"空間震動，造成420%傷害"},
            {lv:100,name:"震震覺醒·陸沉",cd:6,mult:7.5,desc:"大陸沉沒，造成750%傷害無視50%防禦"}]},
  dragon:{name:"龍龍果實·幻獸種",icon:"🐉",rarity:"傳說",element:1,desc:"化身巨龍，全屬性提升",
    skills:[{lv:1,name:"龍息",cd:2,mult:1.8,desc:"噴吐龍息，造成180%傷害"},
            {lv:15,name:"龍鱗護體",cd:3,mult:2.0,desc:"龍鱗硬化，造成200%傷害並減傷50%"},
            {lv:50,name:"龍之咆哮",cd:4,mult:4.0,desc:"震懾咆哮，造成400%傷害"},
            {lv:100,name:"龍神降臨",cd:6,mult:7.5,desc:"化身龍神，造成750%傷害並全屬性+50%"}]},
  phoenix:{name:"鳳凰果實·幻獸種",icon:"🔥",rarity:"神話",element:1,desc:"不死鳳凰，攻擊附帶重生之力",
    skills:[{lv:1,name:"鳳凰羽",cd:2,mult:1.8,desc:"鳳凰羽毛，造成180%傷害"},
            {lv:15,name:"不死鳥炎",cd:3,mult:2.6,desc:"不死火焰，造成260%傷害並回復15%HP"},
            {lv:50,name:"鳳凰衝擊",cd:4,mult:4.2,desc:"鳳凰俯衝，造成420%傷害並回復25%HP"},
            {lv:100,name:"鳳凰涅槃",cd:6,mult:7.5,desc:"涅槃重生，造成750%傷害並回復50%HP"}]},
  void:{name:"虛空果實",icon:"🌌",rarity:"神話",element:3,desc:"操控虛空，攻擊無視一切防禦",
    skills:[{lv:1,name:"虛空斬",cd:2,mult:1.9,desc:"虛空斬擊，造成190%傷害無視30%防禦"},
            {lv:15,name:"虛空吞噬",cd:3,mult:2.8,desc:"吞噬空間，造成280%傷害"},
            {lv:50,name:"虛空風暴",cd:4,mult:4.5,desc:"虛空風暴，造成450%傷害"},
            {lv:100,name:"虛空寂滅",cd:6,mult:8.0,desc:"寂滅一切，造成800%傷害無視100%防禦"}]},
};

const FRUIT_POOL = [
  {id:"rubber",weight:30},{id:"flame",weight:20},{id:"ice",weight:20},{id:"thunder",weight:20},
  {id:"dark",weight:10},{id:"light",weight:10},{id:"quake",weight:5},{id:"dragon",weight:3},
  {id:"phoenix",weight:2},{id:"void",weight:1},
];

// ── 天賦 ──
const TALENTS = {
  sharp:{branch:'atk',name:'銳利',max:5,desc:lv=>`攻擊力 +${lv*3}%`,effect:'atkPct',per:3},
  lethal:{branch:'atk',name:'致命',max:5,desc:lv=>`爆擊率 +${lv*2}%`,effect:'crit',per:2},
  rage:{branch:'atk',name:'狂暴',max:5,desc:lv=>`爆擊傷害 +${lv*10}%`,effect:'critDmg',per:10},
  pierce:{branch:'atk',name:'穿透',max:3,desc:lv=>`無視防禦 +${lv*5}%`,effect:'pierce',per:5},
  tough:{branch:'def',name:'堅韌',max:5,desc:lv=>`最大HP +${lv*5}%`,effect:'hpPct',per:5},
  iron:{branch:'def',name:'鐵壁',max:5,desc:lv=>`防禦力 +${lv*5}%`,effect:'defPct',per:5},
  agile:{branch:'def',name:'靈巧',max:5,desc:lv=>`閃避率 +${lv*2}%`,effect:'dodge',per:2},
  regen:{branch:'def',name:'再生',max:3,desc:lv=>`每回合回復 ${lv}% HP`,effect:'regen',per:1},
  greed:{branch:'util',name:'貪婪',max:5,desc:lv=>`金幣 +${lv*10}%`,effect:'gold',per:10},
  wisdom:{branch:'util',name:'悟性',max:5,desc:lv=>`經驗 +${lv*10}%`,effect:'exp',per:10},
  swift:{branch:'util',name:'迅捷',max:2,desc:lv=>`技能CD -${lv}`,effect:'cd',per:1},
  fruitful:{branch:'util',name:'果能',max:5,desc:lv=>`果實傷害 +${lv*10}%`,effect:'fruitDmg',per:10},
};

const BREAKTHROUGH_MILESTONES = {
  3:  { key:'crit',      name:'銳利領悟',  desc:'爆擊率 +5%' },
  5:  { key:'critDmg',   name:'致命專精',  desc:'爆擊傷害 +20%' },
  10: { key:'cd',        name:'技能掌握',  desc:'技能 CD 永久 -1' },
  15: { key:'lifesteal', name:'血之誓約',  desc:'吸血 +10%' },
  20: { key:'regen',     name:'不死之身',  desc:'每回合回復 3% HP' },
  30: { key:'allStats',  name:'覺醒',      desc:'所有屬性 +20%' },
  50: { key:'god',       name:'神之領域',  desc:'所有屬性再 +30%' },
  100:{ key:'transcend', name:'超越極限',  desc:'所有屬性再 +50%' },
};

const RARITY = {
  1:{name:'普通',affixes:0,mult:1.0},2:{name:'精良',affixes:1,mult:1.2},
  3:{name:'稀有',affixes:1,mult:1.5},4:{name:'史詩',affixes:2,mult:1.9},
  5:{name:'傳說',affixes:2,mult:2.4},6:{name:'神話',affixes:3,mult:3.0},
};

const SLOT_DATA = {
  weapon:{name:'武器',pre:['破舊的','銳利的','嗜血的','雷鳴的','烈焰的','寒冰的','虛空的','龍牙的'],base:['長劍','巨斧','匕首','法杖','弓','戰錘','雙刀','長槍']},
  armor:{name:'防具',pre:['堅韌的','厚重的','輕盈的','守護的','神聖的','暗影的','龍鱗的'],base:['皮甲','鎖子甲','板甲','法袍','長袍','戰甲','斗篷']},
  accessory:{name:'飾品',pre:['祝福的','詛咒的','古老的','幸運的','神秘的','魔法的'],base:['戒指','項鍊','護符','耳環','腰帶','徽章']},
};

const AFFIX_POOL = [
  {stat:'atk',label:'攻擊',base:5,scale:1.5,pct:false},
  {stat:'def',label:'防禦',base:3,scale:1.0,pct:false},
  {stat:'hp',label:'生命',base:30,scale:8,pct:false},
  {stat:'crit',label:'爆擊率',base:3,scale:0.3,pct:true},
  {stat:'critDmg',label:'爆擊傷害',base:10,scale:1,pct:true},
  {stat:'lifesteal',label:'吸血',base:3,scale:0.2,pct:true},
  {stat:'reflect',label:'反傷',base:5,scale:0.3,pct:true},
  {stat:'dodge',label:'閃避',base:2,scale:0.15,pct:true},
  {stat:'gold',label:'金幣',base:10,scale:0.5,pct:true},
  {stat:'exp',label:'經驗',base:10,scale:0.5,pct:true},
];

// ══════════════════════════════════════════════════════════════
//  ★★★ 新系統資料：寵物、副本、公會 ★★★
// ══════════════════════════════════════════════════════════════

// ── 寵物（8 種） ──
const PETS = {
  slime:  {name:"小史萊姆", icon:"🟢", rarity:"普通", desc:"從史萊姆王手下救出的幼體",
    baseAtk:5, baseHp:30,
    skill:{name:"黏液噴射", mult:1.2, effect:"none", desc:"噴射黏液，120% 攻擊"},
    passive:{name:"韌性", desc:"主人受到傷害時，有 10% 機率減免 30%"}},
  goblin: {name:"哥布林小弟", icon:"👺", rarity:"普通", desc:"被馴服的哥布林",
    baseAtk:8, baseHp:40,
    skill:{name:"偷襲", mult:1.4, effect:"none", desc:"偷襲敵人，140% 攻擊"},
    passive:{name:"貪婪", desc:"戰鬥結束金幣 +10%"}},
  wolf:   {name:"狼崽", icon:"🐺", rarity:"精良", desc:"野狼的幼崽",
    baseAtk:12, baseHp:50,
    skill:{name:"撕咬", mult:1.6, effect:"bleed", desc:"撕咬敵人，160% 攻擊 + 流血"},
    passive:{name:"迅捷", desc:"主人閃避 +5%"}},
  mage:   {name:"小妖精", icon:"🧚", rarity:"精良", desc:"從魔法森林來的妖精",
    baseAtk:15, baseHp:35,
    skill:{name:"魔法彈", mult:1.8, effect:"burn", desc:"魔法彈，180% 攻擊 + 燃燒"},
    passive:{name:"智慧", desc:"經驗 +15%"}},
  dragon: {name:"幼龍", icon:"🐲", rarity:"稀有", desc:"稀有的幼龍",
    baseAtk:25, baseHp:80,
    skill:{name:"龍息", mult:2.2, effect:"burn", desc:"龍息噴吐，220% 攻擊 + 強力燃燒"},
    passive:{name:"龍威", desc:"全屬性 +5%"}},
  phoenix:{name:"鳳凰雛鳥", icon:"🐦", rarity:"史詩", desc:"浴火重生的鳳凰寶寶",
    baseAtk:35, baseHp:60,
    skill:{name:"火焰羽", mult:2.5, effect:"burn", desc:"火焰羽毛，250% 攻擊"},
    passive:{name:"重生", desc:"主人每回合回復 2% HP"}},
  demon:  {name:"小惡魔", icon:"😈", rarity:"傳說", desc:"從深淵召喚的惡魔",
    baseAtk:50, baseHp:100,
    skill:{name:"暗影爪", mult:3.0, effect:"lifesteal", desc:"暗影爪，300% 攻擊 + 吸血"},
    passive:{name:"嗜血", desc:"主人吸血 +10%"}},
  god:    {name:"神獸·麒麟", icon:"🦄", rarity:"神話", desc:"傳說中的神獸",
    baseAtk:80, baseHp:200,
    skill:{name:"聖獸一擊", mult:4.0, effect:"all", desc:"400% 攻擊 + 全屬性效果"},
    passive:{name:"神佑", desc:"全屬性 +20%"}},
};

const PET_POOL = [
  {id:"slime",  weight:35},
  {id:"goblin", weight:25},
  {id:"wolf",   weight:15},
  {id:"mage",   weight:12},
  {id:"dragon", weight:7},
  {id:"phoenix",weight:3},
  {id:"demon",  weight:2},
  {id:"god",    weight:1},
];

// ── 副本（5 個） ──
const DUNGEONS = {
  slime_cave: {name:"史萊姆洞穴", icon:"🟢", minLv:1, reqRole:0,
    floors:3, monsterType:1, mult:1.0,
    desc:"新手副本，適合 Lv.1~10",
    rewards:{money:200, exp:300, petChance:30}},
  goblin_camp: {name:"哥布林營地", icon:"👺", minLv:10, reqRole:0,
    floors:5, monsterType:2, mult:1.5,
    desc:"中階副本，適合 Lv.10~30",
    rewards:{money:800, exp:1200, petChance:25}},
  wolf_forest: {name:"狼之森", icon:"🐺", minLv:30, reqRole:0,
    floors:7, monsterType:3, mult:2.5,
    desc:"高階副本，適合 Lv.30~60",
    rewards:{money:3000, exp:5000, petChance:20}},
  dragon_nest: {name:"龍巢", icon:"🐲", minLv:60, reqRole:0,
    floors:10, monsterType:4, mult:4.0,
    desc:"頂級副本，適合 Lv.60~100",
    rewards:{money:15000, exp:25000, petChance:15}},
  void_rift:  {name:"虛空裂縫", icon:"🌌", minLv:100, reqRole:0,
    floors:15, monsterType:6, mult:7.0,
    desc:"深淵副本，適合 Lv.100+",
    rewards:{money:80000, exp:120000, petChance:10}},
};

// ── 公會（3 個可加入） ──
const GUILDS = {
  sword:   {name:"劍之公會", icon:"⚔️", desc:"崇尚力量的公會",
    bonus:{atkPct:10, crit:5},
    joinCost:5000,
    quests:[
      {id:"sword_q1", name:"擊殺 10 隻怪物", goal:10, key:"killCount", reward:{money:500, exp:800}},
      {id:"sword_q2", name:"擊殺 50 隻怪物", goal:50, key:"killCount", reward:{money:2000, exp:3000}},
    ]},
  mage:    {name:"魔法公會", icon:"🔮", desc:"崇尚知識的公會",
    bonus:{exp:20, gold:10},
    joinCost:5000,
    quests:[
      {id:"mage_q1", name:"抽果 5 次",     goal:5,  key:"fruitDraw",  reward:{money:500, exp:800}},
      {id:"mage_q2", name:"抽果 30 次",    goal:30, key:"fruitDraw",  reward:{money:3000, exp:5000}},
    ]},
  assassin:{name:"暗影公會", icon:"🗡️", desc:"崇尚速度的公會",
    bonus:{crit:10, critDmg:30},
    joinCost:5000,
    quests:[
      {id:"assassin_q1", name:"達成 10 連擊",  goal:1,  key:"maxCombo10", reward:{money:500, exp:800}},
      {id:"assassin_q2", name:"達成 30 連擊",  goal:1,  key:"maxCombo30", reward:{money:3000, exp:5000}},
    ]},
};
