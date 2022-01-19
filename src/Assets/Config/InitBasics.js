import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';

const initBasics = () => {
  const ENTIRE_SCENE = 0,
    BLOOM_SCENE = 1;
  const bloomLayer = new THREE.Layers();
  bloomLayer.set(BLOOM_SCENE);

  //Basic
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  const gui = new dat.GUI();
  const canvas = document.querySelector('canvas.webgl');
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
  });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setClearColor(0x101000);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.physicallyCorrectLights = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.autoClear = false;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    10000,
  );

  camera.position.set(0, 15, 15);
  scene.add(camera);

  const controls = new OrbitControls(camera, canvas);
  // controls.maxPolarAngle = Math.PI * 0.5 - 0.01;
  // controls.enableDamping = true;

  let composer;

  window.addEventListener('resize', () => {
    //Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    //Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    //Update postprocesing
    composer.setSize(sizes.width, sizes.height);
  });

  var obj = new THREE.Mesh(
    new THREE.BoxGeometry(5, 5, 4),
    new THREE.MeshLambertMaterial({
      color: 0x150505,
      wireframe: false,
    }),
  );
  obj.position.z = 0.25;
  scene.add(obj);

  var objBack = new THREE.Mesh(
    new THREE.BoxGeometry(5, 5, 1),
    new THREE.MeshBasicMaterial({
      color: 'red',
      wireframe: false,
    }),
  );
  objBack.position.z = -2.25;
  objBack.layers.enable(BLOOM_SCENE);
  scene.add(objBack);

  //Postprocesing
  const renderScene = new RenderPass(scene, camera);
  const params = {
    exposure: 1,
    bloomStrength: 1.5, //1.5,
    bloomThreshold: 0.15,
    bloomRadius: 0,
  };
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(sizes.width, sizes.height),
    1.5,
    0.4,
    0.85,
  );
  bloomPass.threshold = params.bloomThreshold;
  bloomPass.strength = params.bloomStrength;
  bloomPass.radius = params.bloomRadius;
  bloomPass.renderToScreen = true;

  composer = new EffectComposer(renderer);
  composer.setSize(sizes.width, sizes.height);

  composer.addPass(renderScene);
  composer.addPass(bloomPass);
  // renderer.gammaInput = true
  // renderer.gammaOutput = true
  // renderer.toneMappingExposure = Math.pow(0.9, 4.0)

  gui.add(params, 'exposure', 0.1, 2).onChange(function (value) {
    renderer.toneMappingExposure = Math.pow(value, 4.0);
  });

  gui.add(params, 'bloomThreshold', 0.0, 1.0).onChange(function (value) {
    bloomPass.threshold = Number(value);
  });

  gui.add(params, 'bloomStrength', 0.0, 3.0).onChange(function (value) {
    bloomPass.strength = Number(value);
  });

  gui
    .add(params, 'bloomRadius', 0.0, 1.0)
    .step(0.01)
    .onChange(function (value) {
      bloomPass.radius = Number(value);
    });
  // let RenderTargetClass = null;
  // if (renderer.getPixelRatio() === 1 && renderer.capabilities.isWebGL2) {
  //   RenderTargetClass = THREE.WebGLMultisampleRenderTarget;
  //   //Jeśli pixelratio jest równy jeden i obsługiwany jest webgl2.0 używamy MSAA
  // } else {
  //   RenderTargetClass = THREE.WebGLRenderTarget;
  //   //jeśli pixelratio jest powyżej 1 nie używamy antyaliasu bo zadziała domyślny
  // }
  // const renderTarget = new RenderTargetClass(800, 600, {
  //   minFilter: THREE.LinearFilter,
  //   magFilter: THREE.LinearFilter,
  //   format: THREE.RGBAFormat,
  //   encoding: THREE.sRGBEncoding,
  // });

  return [
    renderer,
    camera,
    controls,
    scene,
    composer,
    ENTIRE_SCENE,
    BLOOM_SCENE,

    gui,
  ];
};
export default initBasics;
