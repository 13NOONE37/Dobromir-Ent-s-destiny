import './style.css';
import * as THREE from 'three';
import Stats from 'stats.js';
import { gsap } from 'gsap';

import initWeatherControler from './Assets/Config/WeatherControler';
import initLoadingManagers from './Assets/Config/LoadingManagers';
import initBasics from './Assets/Config/InitBasics';
import initInputControler from './Assets/Config/InputControler';
import updateAllMaterials from './Assets/Config/UpdateAllMaterials';
import GenerateGround from './Assets/Enviorment/GenerateGround';

import {
  AmmoPhysics,
  ExtendedMesh,
  PhysicsLoader,
} from '@enable3d/ammo-physics';

const MainScene = () => {
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

    // currentControlObject && thirdPersonCamera();

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
    //Physics
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    cube.body.needUpdate = true; // this is how you update kinematic borderImageSlice:
    physics.update(elapsedTime);
    physics.updateDebugger();

    objectControler();
    updateEnviorment(currentTime, deltaTime);
    renderBasic(deltaTime);

    stats.end();
    window.requestAnimationFrame(tick);
  };

  const init = async () => {
    tick();
  };
  const physics = new AmmoPhysics(scene);
  physics.debug.enable(true);

  const { factory } = physics; // the factory will make/add object without physics

  // blue box
  physics.add.box({ x: 0.05, y: 10 }, { lambert: { color: 0x2194ce } });
  // static ground
  physics.add.ground({ width: 20, height: 20 });

  // green sphere
  const geometry = new THREE.BoxBufferGeometry();
  const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(0, 5, 0);
  scene.add(cube);
  physics.add.existing(cube);
  cube.body.setCollisionFlags(2); // make it kinematic

  /*!--Base--!*/
  const [textureLoader, cubeTextureLoader, modelLoader, enviormentMapTexture] =
    initLoadingManagers(scene, init);
  const [sunLight, sunObject, skyEffectControler, skyGuiChanged, clouds] =
    initWeatherControler(renderer, scene, gui, modelLoader);
  const keys = initInputControler();

  /*!---Content--! */
  GenerateGround(textureLoader, scene, physics);
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
          // physics.add.existing(tree);
          // gsap.to(tree.rotation, { duration: 6, y: 2 });
        }
      }
    };
    renderForest();

    forest.position.set(50, 2.85, 0);
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
    czesio.position.set(2, 1.2, 0);
    scene.add(czesio);
    physics.add.existing(czesio);

    mixer = new THREE.AnimationMixer(czesio);

    czesioWalkAction = mixer.clipAction(model.animations[3]);

    czesioIdleAction = mixer.clipAction(model.animations[2]);
    czesioIdleAction.setDuration(8);
  });
};
PhysicsLoader('/Ammo/', () => MainScene());
