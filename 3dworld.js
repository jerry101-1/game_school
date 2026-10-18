// ============================================================
//  ★ 3D 荒野探索系統 (Three.js)
// ============================================================
let scene, camera, renderer, player3d;
let monsters3d = [];
let keys3d = { w: false, a: false, s: false, d: false };
let in3dCombat = false;
let animationId3d;

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

  // 初始化 3D 場景
  if (!scene) {
    init3D();
  }
  
  in3dCombat = false;
  document.getElementById('combat-ui3d').style.display = 'none';
}

function init3D() {
  const THREE = window.THREE;
  
  // 場景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB); // 天空藍
  scene.fog = new THREE.Fog(0x87CEEB, 20, 100);

  // 相機
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

  // 渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('canvas3d').appendChild(renderer.domElement);

  // 光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(10, 20, 10);
  scene.add(dirLight);

  // 地面
  const floorGeo = new THREE.PlaneGeometry(200, 200);
  const floorMat = new THREE.MeshLambertMaterial({ color: 0x2e7d32 }); // 草地綠
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // 玩家 (藍色方塊)
  const playerGeo = new THREE.BoxGeometry(1, 2, 1);
  const playerMat = new THREE.MeshLambertMaterial({ color: 0x1e88e5 });
  player3d = new THREE.Mesh(playerGeo, playerMat);
  player3d.position.y = 1;
  scene.add(player3d);

  // 生成怪物 (綠色方塊)
  const monsterGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  const monsterMat = new THREE.MeshLambertMaterial({ color: 0x4caf50 });

  for (let i = 0; i < 20; i++) {
    const m = new THREE.Mesh(monsterGeo, monsterMat);
    m.position.set((Math.random() - 0.5) * 100, 0.75, (Math.random() - 0.5) * 100);
    m.userData = { type: rand(1, 7) }; // 隨機對應你的怪物 ID
    scene.add(m);
    monsters3d.push(m);
  }

  // 鍵盤事件
  document.addEventListener('keydown', e => {
    if (in3dCombat) return;
    if (['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key) || e.key.length === 1) {
      if (e.key === 'w' || e.key === 'ArrowUp') keys3d.w = true;
      if (e.key === 'a' || e.key === 'ArrowLeft') keys3d.a = true;
      if (e.key === 's' || e.key === 'ArrowDown') keys3d.s = true;
      if (e.key === 'd' || e.key === 'ArrowRight') keys3d.d = true;
    }
  });
  document.addEventListener('keyup', e => {
    if (e.key === 'w' || e.key === 'ArrowUp') keys3d.w = false;
    if (e.key === 'a' || e.key === 'ArrowLeft') keys3d.a = false;
    if (e.key === 's' || e.key === 'ArrowDown') keys3d.s = false;
    if (e.key === 'd' || e.key === 'ArrowRight') keys3d.d = false;
  });

  // 渲染迴圈
  function animate3D() {
    animationId3d = requestAnimationFrame(animate3D);

    if (!in3dCombat) {
      // 移動玩家
      let moveSpeed = 0.3;
      if (keys3d.w) player3d.position.z -= moveSpeed;
      if (keys3d.s) player3d.position.z += moveSpeed;
      if (keys3d.a) player3d.position.x -= moveSpeed;
      if (keys3d.d) player3d.position.x += moveSpeed;

      // 限制邊界
      player3d.position.x = Math.max(-95, Math.min(95, player3d.position.x));
      player3d.position.z = Math.max(-95, Math.min(95, player3d.position.z));

      // 鏡頭跟隨
      camera.position.x = player3d.position.x;
      camera.position.y = player3d.position.y + 10;
      camera.position.z = player3d.position.z + 12;
      camera.lookAt(player3d.position.x, player3d.position.y, player3d.position.z);

      // 碰撞偵測
      for (let i = monsters3d.length - 1; i >= 0; i--) {
        const m = monsters3d[i];
        if (m.position.distanceTo(player3d.position) < 2.5) {
          enter3DCombat(m);
          break;
        }
      }
    }
    renderer.render(scene, camera);
  }
  animate3D();
}

function enter3DCombat(monsterMesh) {
  in3dCombat = true;
  document.getElementById('combat-ui3d').style.display = 'block';
  
  // 鏡頭拉近怪物
  camera.position.x = monsterMesh.position.x;
  camera.position.y = monsterMesh.position.y + 5;
  camera.position.z = monsterMesh.position.z + 8;
  camera.lookAt(monsterMesh.position.x, monsterMesh.position.y, monsterMesh.position.z);

  // 準備呼叫你的 2D 戰鬥系統
  // 這裡我們直接借用你的 spawnMonster() 邏輯，但指定怪物類型
  const mType = monsterMesh.userData.type;
  spawnSpecificMonster(mType); 
  
  // 隱藏 3D 畫面，顯示你的 2D 戰鬥畫面
  document.getElementById('canvas3d').classList.add('hidden');
  document.getElementById('ui3d').classList.add('hidden');
  document.getElementById('combat-ui3d').style.display = 'none';
  
  // 標記是從 3D 進來的，打贏後要回去
  S.returnTo3D = true; 
  
  // 開始你原本的戰鬥
  startBattle();
  
  // 移除這隻 3D 怪物
  scene.remove(monsterMesh);
  monsters3d.splice(monsters3d.indexOf(monsterMesh), 1);
}

// 讓玩家可以從 3D 返回村莊
function exit3DExplore() {
  if (animationId3d) cancelAnimationFrame(animationId3d);
  document.getElementById('canvas3d').classList.add('hidden');
  document.getElementById('ui3d').classList.add('hidden');
  document.getElementById('combat-ui3d').style.display = 'none';
  document.getElementById('canvas3d').innerHTML = ''; // 清空 canvas
  
  // 重置狀態
  scene = null;
  monsters3d = [];
  in3dCombat = false;
  
  updateTownUI();
  showScreen('screen-town');
}
