let scene, camera, renderer, controls;
let brainModel;
const partsInfo = {
  "cerebrum": { name: "Cerebrum", func: "Higher cognitive functions: thinking, memory, voluntary movement, sensory processing." },
  "cerebellum": { name: "Cerebellum", func: "Coordination, balance, and fine motor control." },
  "brainstem": { name: "Brainstem", func: "Vital functions: breathing, heart rate, sleep, and basic reflexes." },
  // Add more as your model has named meshes
};

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111122);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 5);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.getElementById('container').appendChild(renderer.domElement);

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const directional = new THREE.DirectionalLight(0xffffff, 0.8);
  directional.position.set(5, 5, 5);
  scene.add(directional);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Raycaster for clicking
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  renderer.domElement.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      let obj = intersects[0].object;
      while (obj && !partsInfo[obj.name?.toLowerCase()]) obj = obj.parent;
      
      if (obj && partsInfo[obj.name?.toLowerCase()]) {
        const info = partsInfo[obj.name.toLowerCase()];
        document.getElementById('details').innerHTML = `
          <strong>${info.name}</strong><br>
          ${info.func}
        `;
      }
    }
  });

  // Load a brain model (replace URL with your own hosted .glb)
  const loader = new THREE.GLTFLoader();
  
  // Example: Use a public brain model URL (or host your own in /models/brain.glb)
  // For testing, you can use a placeholder or download one from Sketchfab/CGTrader
  loader.load('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/BrainStem/glTF/BrainStem.gltf', 
    (gltf) => {
      brainModel = gltf.scene;
      brainModel.scale.set(0.02, 0.02, 0.02); // Adjust scale
      scene.add(brainModel);
      
      // Try to name parts if not already named
      brainModel.traverse((child) => {
        if (child.isMesh) {
          child.name = child.name || 'cerebrum'; // fallback
        }
      });
    },
    undefined,
    (error) => {
      console.error('Error loading model:', error);
      // Fallback: simple colored spheres representing parts
      createFallbackBrain();
    }
  );
}

function createFallbackBrain() {
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  
  const cerebrum = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color: 0xff9999}));
  cerebrum.position.set(0, 0.5, 0);
  cerebrum.name = "cerebrum";
  scene.add(cerebrum);

  const cerebellum = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color: 0x99ff99}));
  cerebellum.scale.set(0.6, 0.6, 0.6);
  cerebellum.position.set(0, -1, 0);
  cerebellum.name = "cerebellum";
  scene.add(cerebellum);

  const brainstem = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 1.5, 16), 
    new THREE.MeshPhongMaterial({color: 0x9999ff}));
  brainstem.position.set(0, -2, 0);
  brainstem.name = "brainstem";
  scene.add(brainstem);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}