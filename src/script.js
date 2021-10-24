import "./style.css";
import * as THREE from "three";
import Stats from "stats.js";

import initSunLight from "./Assets/Config/SunLight";
import initLoadingManagers from "./Assets/Config/LoadingManagers";
import initBasics from "./Assets/Config/InitBasics";

const [textureLoader, cubeTextureLoader, modelLoader] = initLoadingManagers();

/*!--Base--!*/
//eviorment texture
const enviormentMapTexture = cubeTextureLoader.load([
  "/Assets/Enviorment/px.png",
  "/Assets/Enviorment/nx.png",
  "/Assets/Enviorment/py.png",
  "/Assets/Enviorment/ny.png",
  "/Assets/Enviorment/pz.png",
  "/Assets/Enviorment/nz.png",
]);

//Init basics
const [renderer, camera, controls, scene, gui, composer] = initBasics();
scene.environment = enviormentMapTexture;

//Init lights
initSunLight(scene, gui, camera);

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
const floorMaterial = new THREE.MeshToonMaterial({
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
modelLoader.load("/Assets/Characters/czesio2.glb", (model) => {
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

  mixer = new THREE.AnimationMixer(czesio);
  // mixer.timeScale = 2.0;
  console.log(model);
  const action = mixer.clipAction(model.animations[1]);
  console.log(action);
  action.play();

  gui.add(czesio.position, "x").name("czesio x").min(-50).max(50).step(1);
  gui.add(czesio.position, "z").name("czesio z").min(-50).max(50).step(1);
  gui.add(czesio.position, "y").name("czesio y").min(-50).max(50).step(1);
});

//Animate
let stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

const clock = new THREE.Clock();
let timeCurrent = 0;

const tick = () => {
  stats.begin();
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - timeCurrent;
  timeCurrent = elapsedTime;

  //Update controls
  controls.update();
  //Update mixer
  mixer && mixer.update(deltaTime);

  //Render
  // renderer.render(scene, camera);
  composer.render();

  stats.end();
  //Call tick again on next frame
  window.requestAnimationFrame(tick);
};
tick();
