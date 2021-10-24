import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";

const initBasics = () => {
  //Basic
  const gui = new dat.GUI();

  const canvas = document.querySelector("canvas.webgl");

  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  window.addEventListener("resize", () => {
    //Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    //Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    camera.layers.enable(1);

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    //Update postprocesing
    composer.setSize(sizes.width, sizes.height);
  });

  //Scene
  const scene = new THREE.Scene();

  //Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
  });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.physicallyCorrectLights = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.autoClear = false;

  //Camera
  const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    10000
  );
  camera.position.set(0, 15, 15);
  scene.add(camera);

  //Controls
  const controls = new OrbitControls(camera, canvas);

  controls.enableDamping = true;

  //Postprocesing
  let composer;
  //bloom
  const params = {
    exposure: 1.2,
    bloomStrength: 3,
    bloomThreshold: 0.9,
    bloomRadius: 1,
  };
  const renderScene = new RenderPass(scene, camera);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(sizes.width, sizes.height),
    0.5,
    0,
    0
  );
  bloomPass.threshold = params.bloomThreshold;
  bloomPass.strength = params.bloomStrength;
  bloomPass.radius = params.bloomRadius;

  gui.add(params, "exposure", 0.1, 2).onChange(function (value) {
    renderer.toneMappingExposure = Math.pow(value, 4.0);
  });

  gui.add(params, "bloomThreshold", 0.0, 1.0).onChange(function (value) {
    bloomPass.threshold = Number(value);
  });

  gui.add(params, "bloomStrength", 0.0, 3.0).onChange(function (value) {
    bloomPass.strength = Number(value);
  });

  gui
    .add(params, "bloomRadius", 0.0, 1.0)
    .step(0.01)
    .onChange(function (value) {
      bloomPass.radius = Number(value);
    });

  //Finish
  composer = new EffectComposer(renderer);
  composer.setSize(sizes.width, sizes.height);
  composer.setPixelRatio(Math.min(2, window.devicePixelRatio));

  composer.addPass(renderScene);
  composer.addPass(bloomPass);

  return [renderer, camera, controls, scene, gui, composer];
};
export default initBasics;
