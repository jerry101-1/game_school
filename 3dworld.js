// ============================================================
//  ★ 2.5D 荒野探索系統 (Three.js) - 質感升級版
// ============================================================

let scene, camera, renderer, player3d;
let monsters3d = [];
let targetPosition = null; // 滑鼠點擊的目標位置
let in3dCombat = false;
let animationId3d;

// 用於滑鼠射線偵測 (點擊地面)
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let floorMesh; 

function start3DExplore() {
  if (!window.THREE) {
    log('⚠️ Three.js 尚未載入，無法啟動 3D 模式。', 'lose');
    return;
  }

  // 隱藏所有 2D UI，顯示 3D 畫布
  document.querySelectorAll('[id^="screen-"]').forEach(el => el.classList.add('hidden'));
  const canvas3d = document.getElementById('canvas3d');
  canvas3d.classList.remove('hidden');
  document.getElementById('ui3d').classList.remove('hidden');
  document.getElementById('btnExit3d').classList.remove('hidden');

  // 初始化 3D 場景
  if (!scene) {
    init3D();
  }
  
  in3dCombat = false;
  document.getElementById('combat-ui3d').style.display = 'none';
}

function init3D() {
  const THREE = window.THREE;
  
  // 1. 場景與霧氣
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e); // 暗色系天空
  scene.fog = new THREE.Fog(0x1a1a2e, 20, 70);

  // 2. 相機 (設定為 2.5D 俯視角，約 45 度)
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 25, 25);
  camera.lookAt(0, 0, 0);

  // 3. 渲染器與開啟即時陰影
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true; // ★ 開啟陰影
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 柔和陰影
  document.getElementById('canvas3d').appendChild(renderer.domElement);

  // 4. 光源 (材質光影的關鍵)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // 環境光
  scene.add(ambientLight);
  
  const dirLight = new THREE.DirectionalLight(0xffffff, 1); // 主光源
  dirLight.position.set(20, 30, 10);
  dirLight.castShadow = true; // ★ 光源投射陰影
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.left = -50;
  dirLight.shadow.camera.right = 50;
  dirLight.shadow.camera.top = 50;
  dirLight.shadow.camera.bottom = -50;
  scene.add(dirLight);

  // 5. 地面 (帶有光影與接收陰影)
  const floorGeo = new THREE.PlaneGeometry(200, 200);
  const floorMat = new THREE.MeshStandardMaterial({ 
    color: 0x2e7d32, 
    roughness: 0.8, // 粗糙度，讓它看起來像草地
    metalness: 0.2 
  });
  floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true; // ★ 地面接收陰影
  scene.add(floorMesh);

  // 6. 玩家 (圓柱體 + 金屬材質)
  const playerGeo = new THREE.CylinderGeometry(0.8, 0.8, 2, 16);
  const playerMat = new THREE.MeshStandardMaterial({ color: 0x1e88e5, roughness: 0.3, metalness: 0.8 });
  player3d = new THREE.Mesh(playerGeo, playerMat);
  player3d.position.set(0, 1, 0);
  player3d.castShadow = true; // ★ 玩家投射陰影
  scene.add(player3d);

  // 7. 生成怪物 (帶有光影)
  spawn3DMonsters();

  // 8. 滑鼠點擊事件
  document.addEventListener('mousedown', onMouseDown);
  
  // 9. 視窗縮放
  window.addEventListener('resize', onWindowResize);

  // 10. 渲染迴圈
  animate3D();
}

function spawn3DMonsters() {
  const THREE = window.THREE;
  const monsterGeo = new THREE.SphereGeometry(0.8, 16, 16); // 改成球體(像史萊姆)
  const monsterMat = new THREE.MeshStandardMaterial({ color: 0x4caf50, roughness: 0.5 });

  for (let i = 0; i < 15; i++) {
    const m = new THREE.Mesh(monsterGeo, monsterMat);
    m.position.set((Math.random() - 0.5) * 80, 0.8, (Math.random() - 0.5) * 80);
    m.castShadow = true; // ★ 怪物投射陰影
    m.userData = { type: Math.floor(Math.random() * 7) + 1, hp: 50 };
    scene.add(m);
    monsters3d.push(m);
  }
}

// ★ 滑鼠點擊地面移動
function onMouseDown(event) {
  if (in3dCombat) return;
  const THREE = window.THREE;

  // 將滑鼠座標轉換為 3D 空間座標
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(floorMesh);

  if (intersects.length > 0) {
    targetPosition = intersects[0].point;
  }
}

// ★ 特效：命中時的爆炸火花
function playHitEffect(position, color = 0xff0000) {
  const THREE = window.THREE;
  const particleGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  const particleMat = new THREE.MeshBasicMaterial({ color: color });

  for (let i = 0; i < 15; i++) {
    const particle = new THREE.Mesh(particleGeo, particleMat);
    particle.position.copy(position);
    
    // 隨機散射方向
    particle.userData.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.5,
      Math.random() * 0.5,
      (Math.random() - 0.5) * 0.5
    );
    
    scene.add(particle);
    
    // 0.5 秒後消失
    setTimeout(() => {
      scene.remove(particle);
    }, 500);

    // 這裡應該用 requestAnimationFrame 讓粒子飛出去，為了簡化先直接略過粒子飛行，只做閃爍
  }
}

function animate3D() {
  animationId3d = requestAnimationFrame(animate3D);
  const THREE = window.THREE;

  // 處理怪物特效 (讓它們上下浮動)
  monsters3d.forEach(m => {
    m.position.y = 0.8 + Math.sin(Date.now() * 0.003 + m.position.x) * 0.2;
    m.rotation.y += 0.01;
  });

  if (!in3dCombat && player3d) {
    // ★ 滑鼠點擊移動邏輯
    if (targetPosition) {
      const direction = new THREE.Vector3().subVectors(targetPosition, player3d.position);
      direction.y = 0; // 保持在地面移動
      const distance = direction.length();

      if (distance > 0.5) {
        direction.normalize();
        let moveSpeed = 0.3;
        player3d.position.addScaledVector(direction, moveSpeed);
        
        // 玩家面向移動方向
        player3d.rotation.y = Math.atan2(direction.x, direction.z);
      } else {
        targetPosition = null; // 到達目的地
      }
    }

    // 鏡頭跟隨玩家 (維持 2.5D 角度)
    camera.position.x = player3d.position.x;
    camera.position.z = player3d.position.z + 25;
    camera.position.y = 25;
    camera.lookAt(player3d.position.x, 0, player3d.position.z);

    // 碰撞偵測
    for (let i = monsters3d.length - 1; i >= 0; i--) {
      const m = monsters3d[i];
      if (m.position.distanceTo(player3d.position) < 2.0) {
        enter3DCombat(m);
        break;
      }
    }
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

function enter3DCombat(monsterMesh) {
  in3dCombat = true;
  targetPosition = null; // 停止移動
  
  // 播放受擊特效
  playHitEffect(monsterMesh.position, 0xff0000);

  document.getElementById('combat-ui3d').style.display = 'block';
  document.getElementById('combat-monster-name').innerText = monsterMesh.userData.type === 1 ? '野生史萊姆' : '未知怪物';
  
  // 準備呼叫你的 2D 戰鬥系統
  const mType = monsterMesh.userData.type;
  spawnSpecificMonster(mType); 

  // 隱藏 3D 畫面，顯示 2D 戰鬥畫面
  document.getElementById('canvas3d').classList.add('hidden');
  document.getElementById('ui3d').classList.add('hidden');
  document.getElementById('btnExit3d').classList.add('hidden');
  document.getElementById('combat-ui3d').style.display = 'none';
  
  S.returnTo3D = true; 
  startBattle();
  
  // 移除這隻 3D 怪物
  scene.remove(monsterMesh);
  monsters3d.splice(monsters3d.indexOf(monsterMesh), 1);
}

function exit3DExplore() {
  if (animationId3d) cancelAnimationFrame(animationId3d);
  document.getElementById('canvas3d').classList.add('hidden');
  document.getElementById('ui3d').classList.add('hidden');
  document.getElementById('btnExit3d').classList.add('hidden');
  document.getElementById('combat-ui3d').style.display = 'none';
  
  // 完全重置 3D
  if (renderer) {
    document.getElementById('canvas3d').innerHTML = '';
  }
  scene = null;
  monsters3d = [];
  in3dCombat = false;
  
  updateTownUI();
  showScreen('screen-town');
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============================================================
//  ★ 需要在你的 core.js 或 battle.js 加入的輔助函式
// ============================================================
// 讓 3D 戰鬥可以指定生成哪種怪物
window.spawnSpecificMonster = function(type) {
  // 這裡借用你原本的 spawnMonster 邏輯，但強制指定怪物類型
  // 如果你原本的 spawnMonster 是隨機的，你可以複製裡面的生成邏輯來修改
  const base = MONSTERS[type] || MONSTERS[1];
  const lv = Math.max(1, S.level + rand(-1, 1));
  
  let tpl = {
    name: base.name, skill: base.skill,
    hp: base.hp + Math.floor(base.hp * 0.3) * lv,
    atk: base.atk + Math.floor(base.atk * 0.3) * lv,
    def: base.def + Math.floor(base.def * 0.3) * lv,
    exp: base.exp * lv, money: base.money * lv,
    weak: base.weak, res: base.res, dodge: base.dodge,
  };
  
  S.monster = { ...tpl, maxHp: tpl.hp, lv, type, prefixType: 0, prefix: "", name: base.name };
};
