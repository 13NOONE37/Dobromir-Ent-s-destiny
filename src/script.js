import './style.css';
import * as THREE from 'three';
import Stats from 'stats.js';
import { gsap } from 'gsap';
import Ammo from 'ammo.js/builds/ammo';

import initWeatherControler from './Assets/Config/WeatherControler';
import initLoadingManagers from './Assets/Config/LoadingManagers';
import initBasics from './Assets/Config/InitBasics';
import initInputControler from './Assets/Config/InputControler';
import updateAllMaterials from './Assets/Config/UpdateAllMaterials';
import GenerateGround from './Assets/Enviorment/GenerateGround';

const [renderer, camera, controls, scene, gui] = initBasics();

//Animate
let stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

const clock = new THREE.Clock();
let currentTime = 0;

//Camera
const cameraDebug = {
  lookX: 0,
  lookY: 0,
  lookZ: 15,

  offsetX: 0,
  offsetY: 5,
  offsetZ: -7,
};
const cameraFolder = gui.addFolder('Camera');
cameraFolder.add(cameraDebug, 'lookX').min(-100).max(100).name('lookX');
cameraFolder.add(cameraDebug, 'lookY').min(-100).max(100).name('lookY');
cameraFolder.add(cameraDebug, 'lookZ').min(-100).max(100).name('lookZ');
cameraFolder.add(cameraDebug, 'offsetX').min(-100).max(100).name('offsetX');
cameraFolder.add(cameraDebug, 'offsetY').min(-100).max(100).name('offsetY');
cameraFolder.add(cameraDebug, 'offsetZ').min(-100).max(100).name('offsetZ');
let currentControlObject = null;
const thirdPersonCamera = () => {
  const calculateIdealOffset = () => {
    const idealOffset = new THREE.Vector3(
      cameraDebug.offsetX,
      cameraDebug.offsetY,
      cameraDebug.offsetZ,
    );
    idealOffset.applyQuaternion(currentControlObject.quaternion);
    idealOffset.add(currentControlObject.position);

    return idealOffset;
  };
  const calculateIdealLookAt = () => {
    const idealLookAt = new THREE.Vector3(
      cameraDebug.lookX,
      cameraDebug.lookY,
      cameraDebug.lookZ,
    );
    idealLookAt.applyQuaternion(currentControlObject.quaternion);
    idealLookAt.add(currentControlObject.position);

    return idealLookAt;
  };

  const idealOffset = calculateIdealOffset();
  const idealLookAt = calculateIdealLookAt();

  camera.position.copy(idealOffset);
  camera.lookAt(idealLookAt);
};

const renderBasic = () => {
  renderer.render(scene, camera);
};
const objectControler = () => {
  if (keys.forward) {
    sunLight.lookAt(czesio.position);
    czesio.translateOnAxis(new THREE.Vector3(0, 0, 1), 0.1);
    czesioWalkAction.play();
    czesioIdleAction.stop();
  }
  if (czesioWalkAction && !keys.forward && !keys.backward) {
    czesioWalkAction.stop();
    czesioIdleAction.play();
  }

  if (keys.backward) {
    czesio.translateOnAxis(new THREE.Vector3(0, 0, -1), 0.1);
    czesioWalkAction.play();
    czesioIdleAction.stop();
  }
  if (keys.left) {
    // czesio.position.x += 0.1;
    czesio.rotation.y += 0.035;
  }
  if (keys.right) {
    // czesio.position.x -= 0.1;
    czesio.rotation.y -= 0.035;
  }
  if (keys.space) {
  }
  //Może Lepiej zrealizować te funkcje poprzez wysyłanie postaci aktualnie grywalnej do kontrolera i poruszania przez gsap
};
const updateEnviorment = (currentTime, deltaTime) => {
  //Update
  controls.update();
  mixer && mixer.update(deltaTime);

  currentControlObject && thirdPersonCamera();

  //Sun update
  skyEffectControler.elevation = ((currentTime / 50) % 180) + 1;
  skyGuiChanged();
  sunLight.position.x = sunObject.x * 100;
  sunLight.position.y = sunObject.y * 100; //Original 1000
  sunLight.position.z = sunObject.z * 100;
};
const tick = () => {
  stats.begin();
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - currentTime;
  currentTime = elapsedTime;

  objectControler();
  updateEnviorment(currentTime, deltaTime);
  renderBasic(deltaTime);

  stats.end();
  window.requestAnimationFrame(tick);
};

/*!--Base--!*/
const [textureLoader, cubeTextureLoader, modelLoader, enviormentMapTexture] =
  initLoadingManagers(scene, tick);
const [sunLight, sunObject, skyEffectControler, skyGuiChanged, clouds] =
  initWeatherControler(renderer, scene, gui, modelLoader);
const keys = initInputControler();

/*!---Content--! */

const init = () => {
  tick();
};

Ammo().then(init);

GenerateGround(textureLoader, scene);
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

modelLoader.load('/Assets/Enviorment/Tree11.glb', (tree) => {
  initForest(tree.scene.children[0]);
});

let mixer = null;
let czesio, czesioWalkAction, czesioIdleAction;

modelLoader.load('/Assets/Characters/Czesio.glb', (model) => {
  czesio = model.scene.children[0];
  currentControlObject = czesio;

  scene.add(czesio);
  mixer = new THREE.AnimationMixer(czesio);

  czesioWalkAction = mixer.clipAction(model.animations[3]);

  czesioIdleAction = mixer.clipAction(model.animations[2]);
  czesioIdleAction.setDuration(8);
});
