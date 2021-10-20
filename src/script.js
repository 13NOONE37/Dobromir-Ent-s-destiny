import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as dat from "dat.gui";

import vertexShader from "/static/Assets/Shaders/terrain1/vertex.glsl";
import fragmentShader from "/static/Assets/Shaders/terrain1/fragment.glsl";

//Loader
const loaderManager = new THREE.LoadingManager(
  () => {
    console.log("load");
  },
  () => {
    console.log("progress");
  },
  () => {
    console.log("error");
  }
);
const textureLoader = new THREE.TextureLoader(loaderManager);
const cubeTextureLoader = new THREE.CubeTextureLoader(loaderManager);
const modelLoader = new GLTFLoader(loaderManager);

//evn texture
const enviormentMapTexture = cubeTextureLoader.load([
  "/Assets/Enviorment/px.png",
  "/Assets/Enviorment/nx.png",
  "/Assets/Enviorment/py.png",
  "/Assets/Enviorment/ny.png",
  "/Assets/Enviorment/pz.png",
  "/Assets/Enviorment/nz.png",
]);

//Update all materials
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      child.material.envMap = enviormentMapTexture;
      child.material.envMapIntensity = 1.0;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};

//Base

//Debug
const gui = new dat.GUI();

//Canvas
const canvas = document.querySelector("canvas.webgl");

//Scene
const scene = new THREE.Scene();
scene.environment = enviormentMapTexture;
// scene.background = enviormentMapTexture;

//Test
let mixer = null;

modelLoader.load("/Assets/Characters/Czesio/czesio.glb", (model) => {
  console.log(model);
  model.scene.children[0].traverse((n) => {
    if (n.isMesh) {
      n.castShadow = true;
      n.receiveShadow = true;
    }
    // if (n.material.map) n.material.map.anisotropy = 16;
  });

  scene.add(model.scene);
  mixer = new THREE.AnimationMixer(model.scene);

  const action = mixer.clipAction(model.animations[1]);
  action.play();
});

const debugObject = {
  depthColor: "#186691",
  surfaceColor: "#9bd8ff",
};
const planetG = new THREE.SphereBufferGeometry(10, 256, 256, 0.5);
const planetM = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  side: THREE.DoubleSide,
  uniforms: {
    uTime: { value: 0 },
    seaSpeed: { value: 1 },
    uBigWavesElevations: { value: 0.5 },
    uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
    uMicroWaveIterations: { value: 0 },
    uSmallWavesSpeed: { value: 0 },
    uSmallWavesElevation: { value: 0 },
    uSmallWavesFrequency: { value: 0 },
    uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
    uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
  },
});

const planet = new THREE.Mesh(planetG, planetM);
// scene.add(planet);

gui.add(planetM, "wireframe");
gui
  .add(planetM.uniforms.seaSpeed, "value")
  .min(0)
  .max(3)
  .step(0.01)
  .name("Sea speed");
gui
  .add(planetM.uniforms.uBigWavesElevations, "value")
  .min(0)
  .max(5)
  .step(0.01)
  .name("uBigWavesElevations");
gui
  .add(planetM.uniforms.uBigWavesFrequency.value, "x")
  .min(0)
  .max(15)
  .step(0.01)
  .name("uBigWavesFrequency x");
gui
  .add(planetM.uniforms.uBigWavesFrequency.value, "y")
  .min(0)
  .max(15)
  .step(0.01)
  .name("uBigWavesFrequency y");
gui
  .add(planetM.uniforms.uMicroWaveIterations, "value")
  .min(0)
  .max(15)
  .step(0.01)
  .name("uMicroWavesIterations");
gui
  .add(planetM.uniforms.uSmallWavesElevation, "value")
  .min(0)
  .max(5)
  .step(0.01)
  .name("uSmallWavesElevation");
gui
  .add(planetM.uniforms.uSmallWavesFrequency, "value")
  .min(0)
  .max(5)
  .step(0.01)
  .name("uSmallWavesFrequency");
gui
  .add(planetM.uniforms.uSmallWavesSpeed, "value")
  .min(0)
  .max(15)
  .step(0.01)
  .name("uSmallWavesSpeed");

gui
  .addColor(debugObject, "depthColor")
  .name("depth color")
  .onChange(() => {
    planetM.uniforms.uDepthColor.value.set(debugObject.depthColor);
  });

gui
  .addColor(debugObject, "surfaceColor")
  .name("surface color")
  .onChange(() => {
    planetM.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor);
  });

//Lights
const hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 4);
const hemiHelper = new THREE.HemisphereLightHelper(hemiLight);
scene.add(hemiLight, hemiHelper);

const spotLight = new THREE.SpotLight(0xffa95c, 4);
spotLight.castShadow = true;
spotLight.shadow.bias = -0.0001;
spotLight.shadow.mapSize.width = 1024 * 4;
spotLight.shadow.mapSize.height = 1024 * 4;

const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLight, spotLightHelper);

//floor
const floorGeometry = new THREE.PlaneBufferGeometry(100, 100, 256, 256);
const floorMaterial = new THREE.MeshStandardMaterial();

const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.receiveShadow = true;
floor.rotateX(-Math.PI * 0.5);
scene.add(floor);

//Sizes
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

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

//Camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(0, 15, 15);
scene.add(camera);

//Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

//Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 2.3;

//Animate
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = clock.getDelta();

  planetM.uniforms.uTime.value = elapsedTime;

  //update light
  // spotLight.position.set(
  //   camera.position.x + 10,
  //   camera.position.y + 10,
  //   camera.position.z + 10
  // );
  //Update controls
  controls.update();

  //Update mixer
  mixer && mixer.update(deltaTime);

  //Render
  renderer.render(scene, camera);

  //Call tick again on next frame
  window.requestAnimationFrame(tick);
};
tick();
