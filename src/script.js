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

//Lights
const LightDebugObject = {
  color: 0xfff3bf,
  d: 100,
};
const directionalLight = new THREE.DirectionalLight(
  new THREE.Color(LightDebugObject.color),
  4.5
);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024 * 4;
directionalLight.shadow.mapSize.height = 1024 * 4;
directionalLight.shadow.camera.far = 300;
directionalLight.shadow.camera.near = 0.001;

directionalLight.shadow.camera.left = LightDebugObject.d;
directionalLight.shadow.camera.top = LightDebugObject.d;
directionalLight.shadow.camera.right = -LightDebugObject.d;
directionalLight.shadow.camera.bottom = -LightDebugObject.d;
directionalLight.shadow.bias = -0.001;

directionalLight.position.set(50, 50, 50);
directionalLight.target.position.set(0, 0, 0);
scene.add(
  directionalLight,
  directionalLight.target,
  new THREE.DirectionalLightHelper(directionalLight),
  new THREE.CameraHelper(directionalLight.shadow.camera)
);

gui
  .add(directionalLight, "intensity")
  .name("Light Intensity")
  .step(0.1)
  .min(0)
  .max(20);
gui
  .addColor(LightDebugObject, "color")
  .name("Light Color")
  .onFinishChange((value) => {
    LightDebugObject.color = value;
    directionalLight.color = new THREE.Color(value);
  });
gui.add(directionalLight.position, "x").name("Light x").step(1).min(10).max(50);
gui.add(directionalLight.position, "y").name("Light y").step(1).min(10).max(50);
gui.add(directionalLight.position, "z").name("Light z").step(1).min(10).max(50);

//floor
const floorHeightTexture = textureLoader.load(
  "Assets/Enviorment/Thumbnails/Terrain_Alpha (6).jpg"
);

const floorDisplacmentTexture = textureLoader.load(
  "Assets/Enviorment/rock/height.png"
);
const floorAmbientOcclusionTexture = textureLoader.load(
  "Assets/Enviorment/rock/ambientOcclusion.jpg"
);
const floorNormalTexture = textureLoader.load(
  "Assets/Enviorment/rock/normal.jpg"
);
const floorColorTexture = textureLoader.load(
  "Assets/Enviorment/rock/basecolor.jpg"
);
const floorRoughnessTexture = textureLoader.load(
  "Assets/Enviorment/rock/roughness.jpg"
);

const floorGeometry = new THREE.PlaneBufferGeometry(100, 100, 128, 128);
floorGeometry.computeVertexNormals();
floorGeometry.receiveShadow = true;
const floorMaterial = new THREE.MeshStandardMaterial({
  aoMap: floorAmbientOcclusionTexture,
  map: floorColorTexture,
  normalMap: floorNormalTexture,
  roughnessMap: floorRoughnessTexture,
  displacementMap: floorDisplacmentTexture,
  displacementScale: 0,
});

const floor = new THREE.Mesh(floorGeometry, floorMaterial);
//potrzebujemy skopiować koordynaty UV aby zadziałała teksture ambientColor
floor.geometry.setAttribute(
  "uv2",
  new THREE.BufferAttribute(floor.geometry.attributes.uv.array, 2)
);

floor.receiveShadow = true;
floor.castShadow = true;

floor.rotateX(-Math.PI * 0.5);
scene.add(floor);

let mixer = null;

let czesio = null;
modelLoader.load("/Assets/Characters/Czesio/czesio.glb", (model) => {
  czesio = model.scene;
  czesio.children[0].traverse((n) => {
    if (n.isMesh) {
      n.castShadow = true;
      n.receiveShadow = true;
    }
    // if (n.material.map) n.material.map.anisotropy = 16;
  });

  scene.add(czesio);
  // spotLight.lookAt(czesio);
  mixer = new THREE.AnimationMixer(czesio);

  const action = mixer.clipAction(czesio.animations[1]);
  action.play();
  console.log(model.scene);

  gui.add(czesio.position, "x").name("czesio x").min(-50).max(50).step(1);
  gui.add(czesio.position, "z").name("czesio z").min(-50).max(50).step(1);
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
planet.position.copy(directionalLight.position);
scene.add(planet);

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

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
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
