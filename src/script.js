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
const keys = initInputControler();

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

modelLoader.load("/Assets/Characters/czesioCopy.glb", (model) => {
  console.log(model);

  model.scene.scale.set(2, 2, 2);
  model.scene.position.y = -0.1;

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

  const action = mixer.clipAction(model.animations[3]);
  action.play();
});

//Animate
let stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

const clock = new THREE.Clock();
let currentTime = 0;

const cameraDebug = {
  lookX: 0,
  lookY: 0,
  lookZ: 100,

  offsetX: 0,
  offsetY: 15,
  offsetZ: -20,
};
const cameraFolder = gui.addFolder("Camera");
cameraFolder.add(cameraDebug, "lookX").min(0).max(100).name("lookX");
cameraFolder.add(cameraDebug, "lookY").min(0).max(100).name("lookY");
cameraFolder.add(cameraDebug, "lookZ").min(0).max(100).name("lookZ");
cameraFolder.add(cameraDebug, "offsetX").min(0).max(100).name("offsetX");
cameraFolder.add(cameraDebug, "offsetY").min(0).max(100).name("offsetY");
cameraFolder.add(cameraDebug, "offsetZ").min(-50).max(100).name("offsetZ");

const thirdPersonCamera = () => {
  const calculateIdealOffset = () => {
    const idealOffset = new THREE.Vector3(
      cameraDebug.offsetX,
      cameraDebug.offsetY,
      cameraDebug.offsetZ
    );
    idealOffset.applyQuaternion(czesio.quaternion);
    idealOffset.add(czesio.position);

    return idealOffset;
  };
  const calculateIdealLookAt = () => {
    const idealLookAt = new THREE.Vector3(
      cameraDebug.lookX,
      cameraDebug.lookY,
      cameraDebug.lookZ
    );
    idealLookAt.applyQuaternion(czesio.quaternion);
    idealLookAt.add(czesio.position);

    return idealLookAt;
  };

  const idealOffset = calculateIdealOffset();
  const idealLookAt = calculateIdealLookAt();

  camera.position.copy(idealOffset);
  camera.lookAt(idealLookAt);
};

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

  // czesio && thirdPersonCamera();
  //Clouds

  //Move character
  if (keys.forward) {
    czesio.position.z += 0.1;
  }
  if (keys.backward) {
    czesio.position.z -= 0.1;
  }
  if (keys.left) {
    // czesio.position.x += 0.1;
    czesio.rotation.y += 0.05;
  }
  if (keys.right) {
    // czesio.position.x -= 0.1;
    czesio.rotation.y -= 0.05;
  }
  // console.log(
  //   "Może Lepiej zrealizować te funkcje poprzez wysyłanie postaci aktualnie grywalnej do kontrolera i poruszania przez gsap"
  // );

  //Render
  renderer.render(scene, camera);

  stats.end();
  //Call tick again on next frame
  window.requestAnimationFrame(tick);
};
tick();
