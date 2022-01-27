import './style.css';
import * as THREE from 'three';
import Stats from 'stats.js';
import { gsap } from 'gsap';
import { Water } from 'three/examples/jsm/objects/Water';
import initWeatherControler from './Assets/Config/WeatherControler';
import initLoadingManagers from './Assets/Config/LoadingManagers';
import initBasics from './Assets/Config/InitBasics';
import initControler from './Assets/Config/InputControler';
import updateAllMaterials from './Assets/Config/UpdateAllMaterials';
import GenerateGround from './Assets/Enviorment/GenerateGround';

import {
  AmmoPhysics,
  ExtendedMesh,
  ExtendedObject3D,
  PhysicsLoader,
} from '@enable3d/ammo-physics';

import InitStaticModel from './Assets/Utils/InitStaticModel';
import ThirdPersonCamera from './Assets/Config/ThirdPersonCamera';
import getAnimationOrder from './Assets/Utils/getAnimationOrder';

const MainScene = () => {
  const [renderer, camera, controls, scene, composer, gui] = initBasics();

  let mixer;
  const [currentObject, handleControler] = initControler(gui);
  //Animate
  let stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);

  const clock = new THREE.Clock();
  let currentTime = 0;

  const spot = new THREE.SpotLight(0xffffff, 50, 50, Math.PI, 100);
  spot.rotation.x = Math.PI;
  spot.position.set(0, 8, -20);
  scene.add(spot);
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

  const renderBasic = () => {
    // composer.render();
    renderer.render(scene, camera);
    // sunLight.target = currentControlObject; // camera look at controlObject
  };
  const updateEnviorment = (currentTime, deltaTime) => {
    //Other
    // controls.update();
    mixer.update(deltaTime);
    ThirdPersonCamera(camera, currentObject.object, cameraDebug);
    handleControler();
    currentObject.object.body.needUpdate = true;

    //Physics
    physics.update(60);
    physics.updateDebugger();

    //Sun update
    skyEffectControler.elevation = ((currentTime / 50) % 180) + 1;
    skyGuiChanged();
    sunLight.position.x = sunObject.x * 100;
    sunLight.position.y = sunObject.y * 100; //Original 1000
    sunLight.position.z = sunObject.z * 100;

    //water
    // water.material.uniforms['time'].value += 1.0 / 60.0;
    // water.material.uniforms['sunDirection'].value.copy(sunLight).normalize();
  };
  const tick = () => {
    stats.begin();
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - currentTime;
    currentTime = elapsedTime;

    currentObject.object && mixer && updateEnviorment(currentTime, deltaTime);
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

  /*!---Content--! */
  // const waterGeometry = new THREE.CircleBufferGeometry(10, 10);

  // const water = new Water(waterGeometry, {
  //   textureWidth: 512,
  //   textureHeight: 512,
  //   waterNormals: new THREE.TextureLoader().load(
  //     '/waternormals.jpg',
  //     function (texture) {
  //       texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  //     },
  //   ),
  //   sunDirection: new THREE.Vector3(),
  //   sunColor: 0xffffff,
  //   waterColor: 0x001e0f,
  //   distortionScale: 3.7,
  //   fog: scene.fog !== undefined,
  // });

  // water.rotation.x = -Math.PI / 2;
  // water.position.y = 0.1;

  // scene.add(water);

  // const torch = new THREE.Group();
  // const point = new THREE.PointLight(0xff7700, 150, 1000);
  // point.position.y = 1;
  // gui.add(point, 'intensity').name('point light intensity:').min(0).max(1000);
  // torch.add(point, new THREE.PointLightHelper(point));

  // const octGeometry = new THREE.OctahedronBufferGeometry();
  // const octMaterial = new THREE.MeshLambertMaterial({ color: 0xff7700 });

  // const torchOffset = 0.2;
  // const torchCount = 12;
  // const tl = gsap.timeline();
  // tl.repeat(-1);
  // // tl.fromTo(torch.rotation, { y: 0 }, { y: Math.PI, duration: 10 });

  // for (let i = 0; i < torchCount; i++) {
  //   const oct = new THREE.Mesh(octGeometry, octMaterial);
  //   oct.position.x = Math.sin(i) * torchOffset;
  //   oct.position.z = Math.cos(-i) * torchOffset;
  //   oct.scale.set(0.2, 0.4, 0.2);
  //   torch.add(oct);
  //   tl.to(oct.position, { duration: .5, y: 0 + Math.sin(Math.random()) }).to(
  //     oct.position,
  //     {
  //       duration: .5,
  //       y: 0 - Math.sin(Math.random()),
  //     },
  //   );
  // }
  // torch.position.set(0, 3, 0);
  // scene.add(torch);

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

  const createCompoundFromData = (group, data) => {
    const universalMaterial = new THREE.MeshBasicMaterial({
      wireframe: true,
    });
    data.forEach((item) => {
      switch (item.type) {
        case 'box': {
          const box = new THREE.Mesh(
            new BoxBufferGeometry(...item.geometry),
            universalMaterial,
          );
          box.position.set(item.position.x, item.position.y, item.position.z);
          group.add(box);
          break;
        }
        case 'cylinder': {
          const cylinder = new THREE.Mesh(
            new THREE.CylinderBufferGeometry(...item.geometry),
            universalMaterial,
          );
          cylinder.position.set(
            item.position.x,
            item.position.y,
            item.position.z,
          );
          group.add(cylinder);
          break;
        }
      }
    });
  };

  const data = [
    {
      type: 'cylinder',
      geometry: [
        4, //radiusTop
        4, //radiusBottom
        2, //height
        24, //radiusSegments
      ],
      position: {
        x: 0,
        z: 0,
        y: 10,
      },
    },
    {
      type: 'cylinder',
      geometry: [
        4, //radiusTop
        4, //radiusBottom
        2, //height
        24, //radiusSegments
      ],
      position: {
        x: 0,
        z: 0,
        y: -10,
      },
    },
    {
      type: 'cylinder',
      geometry: [
        1, //radiusTop
        1, //radiusBottom
        20, //height
        4, //radiusSegments
      ],
      position: {
        x: 0,
        z: 0,
        y: 0,
      },
    },
  ];
  const wheel = new THREE.Group();
  createCompoundFromData(wheel, data);

  wheel.rotateZ(Math.PI / 2);
  wheel.position.z += 20;
  wheel.position.y += 6;

  const box = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 1));
  box.position.set(0, 10, 10);
  scene.add(box);

  const compound = [
    { shape: 'box', width: 0.5, height: 1, depth: 0.4, y: -0.5, z: 0.5 },
    { shape: 'box', width: 2.4, height: 0.6, depth: 0.4, z: -0.4, y: 0.2 },
    { shape: 'sphere', radius: 0.65, z: -0.25, y: 0.35 },
    { shape: 'box', width: 1.5, height: 0.8, depth: 1, y: 0.2, z: 0.2 },
  ];
  physics.add.existing(box, {
    compound,
    shape: 'compound',
    addChildren: false,
    autoCenter: false,
    fractureImpulse: new THREE.Vector3(0, 5, 0),
  });

  // scene.add(wheelLook);
  // physics.add
  // physics.add.existing(wheelLook, {
  //   shape: 'compund',
  //   compound: wheel,
  //   mass: 1000,
  // });
  console.log(wheel);
  //Dobromir
  modelLoader.load('/Assets/Characters/DobromirModel.glb', (model) => {
    const children = model.scene.children[0];

    currentObject.object = new ExtendedObject3D();
    currentObject.object.add(children);
    currentObject.type = 'Character';
    currentObject.object.scale.set(2, 2, 2);
    console.log(model.animations);

    mixer = new THREE.AnimationMixer(currentObject.object);

    const clampTypes = [
      'Guard',
      'SwordGuard',
      // 'LeftJab',
      // 'RightJab',
      // 'SwordAttack1',
    ];
    for (const clip of model.animations) {
      const action = mixer.clipAction(clip);
      // action.clampWhenFinished = true;
      if (clampTypes.includes(clip.name)) {
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
        action.weight = 1;
      }
      currentObject.object.animations[getAnimationOrder(clip.name)] = action;
    }
    console.log(currentObject.object.animations);

    currentObject.object.position.y = 10;
    scene.add(currentObject.object);
    physics.add.existing(currentObject.object, {
      mass: 100,
      shape: 'hull',
      offset: { y: -2.75 },
      height: currentObject.object.scale.y,
    });
    currentObject.object.body.setFriction(0.8);
    currentObject.object.body.setAngularFactor(0, 0, 0);
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
    const ship = model.scene.getObjectByName('Ship', true);
    ship.position.set(4, 5, 0);
    ship.scale.set(2.5, 2.5, 2.5);

    scene.add(ship);
    physics.add.existing(ship, {
      shape: 'hull',
      width: 7,
      depth: 5.5,
      height: 3,
      // offset: { z: -2, y: 0.5 },
      offset: { z: 0, x: 1.5, y: 0.5 },
      mass: 1000,
    });

    //forest
    // modelLoader.load('/Assets/Enviorment/Tree11.glb', (tree) => {
    //   // initForest(tree.scene.children[0]);
    // });
    // const initForest = (treeBase) => {
    //   const forest = new THREE.Group();
    //   const forestDebug = {
    //     count: 15,
    //     length: 450,
    //     scaleCoefficient: 90,
    //   };

    //   const renderForest = () => {
    //     for (let i = 0; i < forestDebug.count; i++) {
    //       for (let j = 0; j < forestDebug.count; j++) {
    //         const tree = treeBase.clone();

    //         const randomScale = 3 - Math.random();
    //         tree.rotation.y = Math.PI * Math.random();
    //         tree.scale.set(randomScale, randomScale, randomScale);

    //         tree.position.x = i * 12 + (0.5 - Math.random()) * 2;
    //         tree.position.z = j * 12 + (0.5 - Math.random()) * 2;
    //         forest.add(tree);
    //         // physics.add.existing(tree);
    //         // gsap.to(tree.rotation, { duration: 6, y: 2 });
    //       }
    //     }
    //   };
    //   renderForest();

    //   forest.position.set(40, 5, -20);
    //   scene.add(forest);
    //   // physics.add.existing(forest);
    //   factory.add.existing(forest);
    //   // physics.physicsWorld.add.existing(forest);
    //   updateAllMaterials(scene, enviormentMapTexture);
    // };
    // currentControlObject = ship;
    // currentControlObjectType = 'Ship';

    // cameraDebug.lookX = -110;
    // cameraDebug.lookY = 4;
    // cameraDebug.lookZ = 15;
    // cameraDebug.offsetX = 28;
    // cameraDebug.offsetY = 8.5;
    // cameraDebug.offsetZ = -0.3;

    // currentControlObject = ship;

    // InitStaticModel(
    //   physics,
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
