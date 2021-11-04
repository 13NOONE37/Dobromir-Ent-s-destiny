import "./style.css";
import * as THREE from "three";
import Stats from "stats.js";

import initWeatherControler from "./Assets/Config/WeatherControler";
import initLoadingManagers from "./Assets/Config/LoadingManagers";
import initBasics from "./Assets/Config/InitBasics";
import initInputControler from "./Assets/Config/InputControler";

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
const [renderer, camera, controls, scene, gui] = initBasics();

// enviormentMapTexture.encoding = THREE.sRGBEncoding;
scene.environment = enviormentMapTexture;
scene.background = enviormentMapTexture;

//Control keyboard & mouse
initInputControler();

//Init lights
// const [sunLight, sunObject] = initWeatherControler(scene, gui);
const [sunLight, sunObject, skyEffectControler, skyGuiChanged, clouds] =
  initWeatherControler(renderer, scene, gui, modelLoader);
//Test

//floor
const floorGeometry = new THREE.PlaneBufferGeometry(25000, 25000, 512, 512);
const floorMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#44ffee"),
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.receiveShadow = true;
floor.castShadow = true;
floor.rotateX(-Math.PI * 0.5);
scene.add(floor);

let mixer = null;
let czesio = null;

modelLoader.load("/Assets/Characters/czesio2.glb", (model) => {
  model.scene.scale.set(2, 2, 2);
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

  const action = mixer.clipAction(model.animations[1]);
  action.play();
});

//Animate
let stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

const clock = new THREE.Clock();
let currentTime = 0;

const tick = () => {
  stats.begin();
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - currentTime;
  currentTime = elapsedTime;

  //Update controls
  controls.update();
  //Update mixer
  mixer && mixer.update(deltaTime);

  //Sun update
  skyEffectControler.elevation = ((currentTime / 50) % 180) + 1;
  skyGuiChanged();
  sunLight.position.x = sunObject.x * 1000;
  sunLight.position.y = sunObject.y * 1000;
  sunLight.position.z = sunObject.z * 1000;

  //Clouds

  // console.log(sunObject);

  //Render
  renderer.render(scene, camera);

  stats.end();
  //Call tick again on next frame
  window.requestAnimationFrame(tick);
};
tick();
