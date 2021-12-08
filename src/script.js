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
  ExtendedObject3D,
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
      idealOffset.applyQuaternion(currentControlObject.parent.quaternion);
      idealOffset.add(currentControlObject.parent.position);

      return idealOffset;
    };
    const calculateIdealLookAt = () => {
      const idealLookAt = new THREE.Vector3(
        cameraDebug.lookX,
        cameraDebug.lookY,
        cameraDebug.lookZ,
      );
      idealLookAt.applyQuaternion(currentControlObject.parent.quaternion);
      idealLookAt.add(currentControlObject.parent.position);

      return idealLookAt;
    };

    const idealOffset = calculateIdealOffset();
    const idealLookAt = calculateIdealLookAt();

    camera.position.copy(idealOffset);
    camera.lookAt(idealLookAt);
  };

  const renderBasic = () => {
    renderer.render(scene, camera);
    // sunLight.target = currentControlObject; // camera look at controlObject
  };

  let speed = { value: 1.7 };
  gui.add(speed, 'value').min(1).max(5);

  const objectControler = (elapsedTime) => {
    const moveCharacter = (0.5 - keys.mouse.x / window.innerWidth) * Math.PI;
    const theta = czesio.world.theta;
    if (
      czesioWalkAction &&
      !keys.forward &&
      !keys.backward &&
      !keys.left &&
      !keys.right
    ) {
      // turn player
      //  if (!isIdle) {
      // const directionTheta = Math.atan2(walkDirection.x, walkDirection.z) + Math.PI
      // const playerTheta = czesio.world.theta + Math.PI
      // const diff = directionTheta - playerTheta
      // if (diff > 0.25) czesio.body.setAngularVelocityY(10)
      // if (diff < -0.25) czesio.body.setAngularVelocityY(-10)
      // }
      czesio.body.setVelocity(0, 0, 0);
      czesioWalkAction.stop();
      czesioIdleAction.play();
    }

    if (keys.forward) {
      console.log(czesio.body);
      czesio.body.setVelocityZ(speed.value);
      czesioWalkAction.play();
      czesioIdleAction.stop();
    }
    if (keys.backward) {
      // czesio.translateOnAxis(new THREE.Vector3(0, 0, -1), 0.1);
      czesio.body.setVelocityZ(-speed.value);
      czesioWalkAction.play();
      czesioIdleAction.stop();
    }
    if (keys.left) {
      czesio.rotateY(Math.PI * 0.5);
      czesio.body.setVelocityX(speed.value);
      czesioWalkAction.play();
      czesioIdleAction.stop();
    }

    if (keys.right) {
      czesio.rotateY(-Math.PI * 0.5);
      czesio.body.setVelocityX(-speed.value);
      czesioWalkAction.play();
      czesioIdleAction.stop();
    }
    if (keys.space && !keys.isJumping) {
      czesioJumpAction.stop();
      czesioJumpAction.play();
      console.log(czesio.world.theta);
      setTimeout(() => {
        czesio.body.applyForceY(16);
      }, 200);
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
    physics.update(60);
    physics.updateDebugger();

    // const x = (keys.mouse.x / window.innerWidth) * 4 - 1;
    // const y = -(keys.mouse.y / window.innerHeight) * 4 + 1;

    // czesio.rotation.y = -x;

    objectControler(elapsedTime);
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

  /*!--Base--!*/
  const [textureLoader, cubeTextureLoader, modelLoader, enviormentMapTexture] =
    initLoadingManagers(scene, init);
  const [sunLight, sunObject, skyEffectControler, skyGuiChanged, clouds] =
    initWeatherControler(renderer, scene, gui, modelLoader);
  const keys = initInputControler();

  /*!---Content--! */

  // GenerateGround(textureLoader, scene, physics);

  const groundMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#ff781f'),
  });
  // 'https://github.com/enable3d/enable3d-website/blob/master/src/examples/3rd-person-camera.html',
  physics.add.ground(
    {
      width: 500,
      height: 500,
      widthSegments: 512,
      heightSegments: 512,
    },
    { custom: groundMaterial },
  );

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

    forest.position.set(40, 5, -20);
    scene.add(forest);
    // physics.add.existing(forest);
    factory.add.existing(forest);
    // physics.physicsWorld.add.existing(forest);
    updateAllMaterials(scene, enviormentMapTexture);
  };

  modelLoader.load('/Assets/Enviorment/Tree11.glb', (tree) => {
    initForest(tree.scene.children[0]);
  });

  let mixer = null;
  let czesio, czesioWalkAction, czesioIdleAction, czesioJumpAction;

  modelLoader.load('/Assets/Characters/Czesio2.glb', (model) => {
    const children = model.scene.children[0];
    currentControlObject = children;

    czesio = new ExtendedObject3D();
    czesio.add(children);

    scene.add(czesio);
    physics.add.existing(czesio, {
      mass: 20,
      shape: 'capsule',
      radius: 1.2,
      height: 1.25,
      offset: { y: -1.95 },
    });
    czesio.body.setFriction(0.8);
    czesio.body.setAngularFactor(0, 0, 0);
    czesio.body.setAngularVelocityY(0);

    mixer = new THREE.AnimationMixer(czesio);

    czesioWalkAction = mixer.clipAction(model.animations[4]);
    czesioJumpAction = mixer.clipAction(model.animations[3]);
    czesioJumpAction.setLoop(THREE.LoopOnce);

    czesioIdleAction = mixer.clipAction(model.animations[2]);
    czesioIdleAction.setDuration(8);
  });
  modelLoader.load('/Assets/Enviorment/house.glb', (model) => {
    const children = model.scene.children[0];
    console.log(children);
    children.position.set(0, 0, 0);
    const house = new ExtendedObject3D();
    house.add(children);

    scene.add(house);
    physics.add.existing(house, {
      mass: 100,
      shape: 'hull',
    });
  });
};
PhysicsLoader('/Ammo/', () => MainScene());
