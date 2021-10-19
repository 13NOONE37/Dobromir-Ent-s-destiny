import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";

import vertexShader from "./Assets/Shaders/terrain1/vertex.glsl";
import fragmentShader from "./Assets/Shaders/terrain1/fragment.glsl";

//Base

//Debug
const gui = new dat.GUI();

//Canvas
const canvas = document.querySelector("canvas.webgl");

//Scene
const scene = new THREE.Scene();

//Test

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

const plane = new THREE.Mesh(planetG, planetM);
plane.rotateX(Math.PI * 0.5);
scene.add(plane);

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
const light = new THREE.AmbientLight(0xffffff, 50);
light.position.set(5, 5, 5);
scene.add(light);

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

//Animate
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  planetM.uniforms.uTime.value = elapsedTime;

  //Update controls
  controls.update();

  //Render
  renderer.render(scene, camera);

  //Call tick again on next frame
  window.requestAnimationFrame(tick);
};
tick();
