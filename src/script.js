import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";

import initSunLight from "./Assets/Config/SunLight";
import initLoadingManagers from "./Assets/Config/LoadingManagers";

const [textureLoader, cubeTextureLoader, modelLoader] = initLoadingManagers();

//evn texture
const enviormentMapTexture = cubeTextureLoader.load([
  "/Assets/Enviorment/px.png",
  "/Assets/Enviorment/nx.png",
  "/Assets/Enviorment/py.png",
  "/Assets/Enviorment/ny.png",
  "/Assets/Enviorment/pz.png",
  "/Assets/Enviorment/nz.png",
]);

//Base

//Debug
const gui = new dat.GUI();

//Canvas
const canvas = document.querySelector("canvas.webgl");

//Scene
const scene = new THREE.Scene();
scene.environment = enviormentMapTexture;
// scene.background = enviormentMapTexture;

initSunLight(scene, gui);
//Test

//floor
const floorHeightTexture = textureLoader.load(
  "Assets/Enviorment/Thumbnails/Terrain_Alpha (6).jpg"
);

const floorDisplacmentTexture = textureLoader.load(
  "Assets/Enviorment/rock/height.png"
);
floorDisplacmentTexture.repeat.set(10, 10);
floorDisplacmentTexture.wrapS = THREE.RepeatWrapping;
floorDisplacmentTexture.wrapT = THREE.RepeatWrapping;

const floorAmbientOcclusionTexture = textureLoader.load(
  "Assets/Enviorment/rock/ambientOcclusion.jpg"
);
floorAmbientOcclusionTexture.repeat.set(10, 10);
floorAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping;
floorAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping;

const floorNormalTexture = textureLoader.load(
  "Assets/Enviorment/rock/normal.jpg"
);
floorNormalTexture.repeat.set(10, 10);
floorNormalTexture.wrapS = THREE.RepeatWrapping;
floorNormalTexture.wrapT = THREE.RepeatWrapping;

const floorColorTexture = textureLoader.load(
  "Assets/Enviorment/rock/basecolor.jpg"
);
floorColorTexture.repeat.set(10, 10);
floorColorTexture.wrapS = THREE.RepeatWrapping;
floorColorTexture.wrapT = THREE.RepeatWrapping;

const floorRoughnessTexture = textureLoader.load(
  "Assets/Enviorment/rock/roughness.jpg"
);
floorRoughnessTexture.repeat.set(10, 10);
floorRoughnessTexture.wrapS = THREE.RepeatWrapping;
floorRoughnessTexture.wrapT = THREE.RepeatWrapping;

const floorGeometry = new THREE.PlaneBufferGeometry(1500, 1500, 512, 512);
const floorMaterial = new THREE.MeshStandardMaterial({
  aoMap: floorAmbientOcclusionTexture,
  map: floorColorTexture,
  normalMap: floorNormalTexture,
  roughnessMap: floorRoughnessTexture,
  displacementMap: floorDisplacmentTexture,
  displacementScale: 0,
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
//potrzebujemy skopiować koordynaty UV aby zadziałała teksture ambientColor
floor.geometry.setAttribute(
  "uv2",
  new THREE.BufferAttribute(floor.geometry.attributes.uv.array, 2)
);

floor.receiveShadow = true;
floor.castShadow = true;

floor.rotateX(-Math.PI * 0.5);
scene.add(floor);

let mixer = null;

let czesio = null;
modelLoader.load("/Assets/Characters/Czesio/czesio.glb", (model) => {
  model.scene.scale.set(10, 10, 10);
  czesio = model.scene;

  czesio.children[0].traverse((n) => {
    if (n.isMesh) {
      n.castShadow = true;
      n.receiveShadow = true;
    }
    // if (n.material.map) n.material.map.anisotropy = 16;
  });
  scene.add(czesio);

  // mixer = new THREE.AnimationMixer(czesio);

  // const action = mixer.clipAction(czesio.animations[1]);
  // action.play();

  gui.add(czesio.position, "x").name("czesio x").min(-50).max(50).step(1);
  gui.add(czesio.position, "z").name("czesio z").min(-50).max(50).step(1);
});

//Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  //Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  //Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

//Camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  10000
);
camera.position.set(0, 15, 15);
scene.add(camera);

//Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

//Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 2.3;

//Animate
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = clock.getDelta();

  //Update controls
  controls.update();

  //Update mixer
  mixer && mixer.update(deltaTime);

  //Render
  renderer.render(scene, camera);

  //Call tick again on next frame
  window.requestAnimationFrame(tick);
};
tick();
