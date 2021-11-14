import "./style.css";
import * as THREE from "three";
import Stats from "stats.js";
import { gsap } from "gsap";

import initWeatherControler from "./Assets/Config/WeatherControler";
import initLoadingManagers from "./Assets/Config/LoadingManagers";
import initBasics from "./Assets/Config/InitBasics";
import initInputControler from "./Assets/Config/InputControler";
import updateAllMaterials from "./Assets/Config/UpdateAllMaterials";

/*!--Base--!*/

//Init basics
const [renderer, camera, controls, scene, gui] = initBasics();
const [textureLoader, cubeTextureLoader, modelLoader, enviormentMapTexture] =
  initLoadingManagers(scene);

//Control keyboard & mouse
const keys = initInputControler();

//Init lights
// const [sunLight, sunObject] = initWeatherControler(scene, gui);
const [sunLight, sunObject, skyEffectControler, skyGuiChanged, clouds] =
  initWeatherControler(renderer, scene, gui, modelLoader);
//Test

//floor

const texture1 = textureLoader.load(
  "/Assets/Enviorment/Thumbnails/Terrain_Alpha (3).jpg"
);

const texture2 = textureLoader.load(
  "/Assets/Enviorment/Thumbnails/AmbientOcclusionMap.jpg"
);
const texture3 = textureLoader.load(
  "/Assets/Enviorment/Thumbnails/NormalMap.jpg"
);
const texture4 = textureLoader.load(
  "/Assets/Enviorment/Thumbnails/SpecularMap.jpg"
);

const groundAmbient = textureLoader.load("/Assets/Dirt/Ambient.jpg");
const groundDisplacment = textureLoader.load("/Assets/Dirt/Displacment.jpg");
const groundNormal = textureLoader.load("/Assets/Dirt/Normal.jpg");
const groundBaseColor = textureLoader.load("/Assets/Dirt/BaseColor.jpg");
const groundBump = textureLoader.load("/Assets/Dirt/Bump.jpg");

const wrapValue = 256;

groundAmbient.wrapS = THREE.RepeatWrapping;
groundAmbient.wrapT = THREE.RepeatWrapping;
groundAmbient.repeat.set(wrapValue, wrapValue);

groundDisplacment.wrapS = THREE.RepeatWrapping;
groundDisplacment.wrapT = THREE.RepeatWrapping;
groundDisplacment.repeat.set(wrapValue, wrapValue);

groundNormal.wrapS = THREE.RepeatWrapping;
groundNormal.wrapT = THREE.RepeatWrapping;
groundNormal.repeat.set(wrapValue, wrapValue);

groundBaseColor.wrapS = THREE.RepeatWrapping;
groundBaseColor.wrapT = THREE.RepeatWrapping;
groundBaseColor.repeat.set(wrapValue, wrapValue);

groundBump.wrapS = THREE.RepeatWrapping;
groundBump.wrapT = THREE.RepeatWrapping;
groundBump.repeat.set(wrapValue, wrapValue);

const floorGeometry = new THREE.PlaneBufferGeometry(2500, 2500, 1024, 1024);
const floorMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#aaa"),
  aoMap: groundAmbient,
  displacementMap: groundDisplacment,
  displacementScale: 1.05,
  normalMap: groundNormal,
  map: groundBaseColor,
  bumpMap: groundBump,
  bumpScale: 1.05,
});

const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotateX(-Math.PI * 0.5);

//delete it
floor.castShadow = true;
floor.receiveShadow = true;

floor.geometry.setAttribute(
  "uv2",
  new THREE.BufferAttribute(floor.geometry.attributes.uv.array, 2)
);
scene.add(floor);

//forest
const initForest = (treeBase) => {
  const forest = new THREE.Group();
  const forestDebug = {
    count: 15,
    length: 450,
    scaleCoefficient: 90,
  };

  const renderForest = () => {
    for (let i = 0; i < forestDebug.count; i++) {
      for (let j = 0; j < forestDebug.count; j++) {
        const tree = treeBase.clone();

        const randomScale = 3 - Math.random();
        tree.rotation.y = Math.PI * Math.random();
        tree.scale.set(randomScale, randomScale, randomScale);

        tree.position.x = i * 12 + (0.5 - Math.random()) * 2;
        tree.position.z = j * 12 + (0.5 - Math.random()) * 2;
        forest.add(tree);
        // gsap.to(tree.rotation, { duration: 6, y: 2 });
      }
    }
  };
  renderForest();

  forest.position.set(50, 0.1, 0);
  scene.add(forest);
  updateAllMaterials(scene, enviormentMapTexture);
};

modelLoader.load("/Assets/Enviorment/Tree11.glb", (tree) => {
  initForest(tree.scene.children[0]);
});

let mixer = null;
let czesioWalkAction = null;
let czesio = null;

modelLoader.load("/Assets/Characters/czesioCopy.glb", (model) => {
  czesio = model.scene.children[0];

  czesio.position.y = -0.1;

  scene.add(czesio);

  mixer = new THREE.AnimationMixer(czesio);

  czesioWalkAction = mixer.clipAction(model.animations[3]);
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

//Camera control funciton
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
  skyEffectControler.elevation = (currentTime % 180) + 1; //Original skyEffectControler.elevation = ((currentTime / 50) % 180) + 1;
  skyGuiChanged();
  sunLight.position.x = sunObject.x * 100;
  sunLight.position.y = sunObject.y * 100; //Original 1000
  sunLight.position.z = sunObject.z * 100;

  // czesio && thirdPersonCamera();
  //Clouds

  //Move character
  if (keys.forward) {
    sunLight.lookAt(czesio.position);
    czesio.translateOnAxis(new THREE.Vector3(0, 0, 1), 0.1);
    czesioWalkAction.play();
  }
  if (czesioWalkAction && !keys.forward && !keys.backward) {
    czesioWalkAction.stop();
  }

  if (keys.backward) {
    czesio.translateOnAxis(new THREE.Vector3(0, 0, -1), 0.1);
    czesioWalkAction.play();
  }
  if (keys.left) {
    // czesio.position.x += 0.1;
    czesio.rotation.y += 0.05;
  }
  if (keys.right) {
    // czesio.position.x -= 0.1;
    czesio.rotation.y -= 0.05;
  }
  if (keys.space) {
    gsap
      .from(czesio.position, { duration: 1, y: 2 })
      .to(czesio.position, { duration: 1, y: 0 });
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
