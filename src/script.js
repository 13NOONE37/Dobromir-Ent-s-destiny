import './style.css';
import * as THREE from 'three';
import Stats from 'stats.js';
import { gsap } from 'gsap';
import { Water } from 'three/examples/jsm/objects/Water';
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

import InitStaticModel from './Assets/Utils/InitStaticModel';

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

  let xspeed = { value: 1.7 };
  gui.add(xspeed, 'value').min(1).max(5);

  const objectControler = (elapsedTime) => {
    if (
      czesioWalkAction &&
      !keys.forward &&
      !keys.backward &&
      !keys.left &&
      !keys.right
    ) {
      czesioWalkAction.stop();
      czesioIdleAction.play();
    }

    const speed = xspeed.value;
    const rotation = czesio.getWorldDirection(czesio.rotation.toVector3());

    const theta = Math.atan2(rotation.x, rotation.z);

    if (keys.forward) {
      const x = Math.sin(theta) * speed,
        y = czesio.body.velocity.y,
        z = Math.cos(theta) * speed;

      czesio.body.setVelocity(x, y, z);
      czesioWalkAction.play();
      czesioIdleAction.stop();
    }
    if (keys.backward) {
      const x = -Math.sin(theta) * speed,
        y = czesio.body.velocity.y,
        z = -Math.cos(theta) * speed;
      czesio.body.setVelocity(x, y, z);
      czesioWalkAction.play();
      czesioIdleAction.stop();
    }
    if (keys.left) {
      czesio.body.setAngularVelocityY(1.5);
    } else if (keys.right) {
      czesio.body.setAngularVelocityY(-1.5);
    } else {
      czesio.body.setAngularVelocityY(0);
    }
    if (keys.space && keys.canJump) {
      keys.canJump = false;
      keys.isJumping = true;
      czesioJumpAction.stop();
      czesioJumpAction.play();
      setTimeout(() => {
        czesio.body.setVelocityY(10);
        keys.canJump = true;
      }, 200);
      setTimeout(() => (keys.isJumping = false), 200);
    }

    //Sprint
    if (keys.shift) {
      xspeed.value = 3.7;
    }
    if (!keys.shift) {
      xspeed.value = 1.7;
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

    //water
    water.material.uniforms['time'].value += 1.0 / 60.0;
    water.material.uniforms['sunDirection'].value.copy(sunLight).normalize();
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
  const waterGeometry = new THREE.CircleBufferGeometry(10, 10);
  const water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load(
      '/waternormals.jpg',
      function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      },
    ),
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 3.7,
    fog: scene.fog !== undefined,
  });

  water.rotation.x = -Math.PI / 2;
  water.position.y = 1;

  scene.add(water);

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
    // initForest(tree.scene.children[0]);
  });

  let mixer = null;
  let czesio, czesioWalkAction, czesioIdleAction, czesioJumpAction;

  modelLoader.load('/Assets/Characters/Czesio2.glb', (model) => {
    const children = model.scene.children[0];
    currentControlObject = children;

    czesio = new ExtendedObject3D();
    czesio.add(children);
    // czesio.scale.set(0.4, 0.4, 0.4);

    scene.add(czesio);
    physics.add.existing(czesio, {
      mass: 20,
      shape: 'capsule',
      radius: 1.55,
      height: 1.25,
      offset: { y: -2.3 },
    });
    czesio.body.setFriction(0.8);
    czesio.body.setAngularFactor(0, 0, 0);

    mixer = new THREE.AnimationMixer(czesio);

    czesioWalkAction = mixer.clipAction(model.animations[4]);
    czesioJumpAction = mixer.clipAction(model.animations[3]);
    czesioJumpAction.setLoop(THREE.LoopOnce);

    czesioIdleAction = mixer.clipAction(model.animations[2]);
    czesioIdleAction.setDuration(8);
  });

  //Rat's John
  modelLoader.load('/Assets/Farm.glb', (model) => {
    const moveAllTo = { x: 0, y: 0, z: 0 };
    //Grass
    const grass = model.scene.getObjectByName('Grass1010', true);
    grass.position.set(20 + moveAllTo.x, 0.5 + moveAllTo.y, 0 + moveAllTo.z);
    grass.rotateY(Math.PI * 0.5);
    scene.add(grass);

    //Statics
    InitStaticModel(
      physics,
      scene,
      model.scene.getObjectByName('Fence', true),
      model.scene.getObjectByName('FencePhysics', true),
      0,
      { x: 10, y: -1.2, z: 0 },
      { x: 0, y: -Math.PI * 0.5, z: 0 },
      undefined,
      moveAllTo,
    );
    InitStaticModel(
      physics,
      scene,
      model.scene.getObjectByName('House', true),
      model.scene.getObjectByName('HousePhysics', true),
      0,
      { x: 0, y: 6, z: -20 },
      { x: 0, y: Math.PI * 0.5, z: 0 },
      undefined,
      moveAllTo,
    );
    InitStaticModel(
      physics,
      scene,
      model.scene.getObjectByName('WoodPile', true),
      model.scene.getObjectByName('WoodPilePhysics', true),
      0,
      { x: -10, y: 0.45, z: -22 },
      { x: 0, y: Math.PI * 0.5, z: 0 },
      undefined,
      moveAllTo,
    );
    InitStaticModel(
      physics,
      scene,
      model.scene.getObjectByName('Weel', true),
      model.scene.getObjectByName('WeelPhysics', true),
      0,
      { x: -20, y: 0.5, z: -5 },
      { x: 0, y: Math.PI * 0.5, z: 0 },
      undefined,
      moveAllTo,
    );
    //Trees
    InitStaticModel(
      physics,
      scene,
      model.scene.getObjectByName('Oak1', true),
      model.scene.getObjectByName('Oak1Physics', true),
      0,
      {
        x: 55,
        y: 0,
        z: -20,
      },
      undefined,
      undefined,
      moveAllTo,
    );
    InitStaticModel(
      physics,
      scene,
      model.scene.getObjectByName('Oak2', true),
      model.scene.getObjectByName('Oak2Physics', true),
      0,
      {
        x: 55,
        y: 0,
        z: 15,
      },
      {
        x: 0,
        y: Math.PI * 0.75,
        z: 0,
      },
      undefined,
      moveAllTo,
    );

    const appleTree1 = model.scene.getObjectByName('AppleTree2', true);
    const appleTree2 = model.scene.getObjectByName('AppleTree2', true);
    const appleTree1Phy = model.scene.getObjectByName(
      'AppleTree1Physics',
      true,
    );
    const appleTree2Phy = model.scene.getObjectByName(
      'AppleTree2Physics',
      true,
    );
    InitStaticModel(
      physics,
      scene,
      appleTree1.clone(),
      appleTree1Phy.clone(),
      0,
      {
        x: -16,
        y: 0.35,
        z: 22,
      },
      undefined,
      undefined,
      moveAllTo,
    );
    InitStaticModel(
      physics,
      scene,
      appleTree2.clone(),
      appleTree2Phy.clone(),
      0,
      {
        x: -8,
        y: 0.35,
        z: 22,
      },
      undefined,
      undefined,
      moveAllTo,
    );
    InitStaticModel(
      physics,
      scene,
      appleTree1.clone(),
      appleTree1Phy.clone(),
      0,
      {
        x: 0,
        y: 0.35,
        z: 22,
      },
      undefined,
      undefined,
      moveAllTo,
    );
    InitStaticModel(
      physics,
      scene,
      appleTree2.clone(),
      appleTree2Phy.clone(),
      0,
      {
        x: 8,
        y: 0.35,
        z: 22,
      },
      undefined,
      undefined,
      moveAllTo,
    );

    // TODO: we have to make it dynamic object
    // InitStaticModel(physics,
    //   scene,
    //   model.scene.getObjectByName('Ship', true),
    //   model.scene.getObjectByName('ShipPhysics', true),
    //   0,
    //   { x: 0, y: 3.2, z: 0 },
    //   { x: 0, y: 0, z: 0 },
    //   { x: 2, y: 2, z: 2 },
    // );
  });
};
PhysicsLoader('/Ammo/', () => MainScene());
