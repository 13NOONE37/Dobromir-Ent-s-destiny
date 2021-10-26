import * as THREE from "three";

import vertexShader from "/static/Assets/Shaders/Sun/vertex.glsl";
import fragmentShader from "/static/Assets/Shaders/Sun/fragment.glsl";

const initWeatherControler = (scene, gui) => {
  //!--> Sun <--!//
  const LightDebugObject = {
    surfaceColor: 0xfff3bf,
    depthColor: 0xfff3bf,
    d: 1000,
  };
  const directionalLight = new THREE.DirectionalLight(
    new THREE.Color(LightDebugObject.color),
    10
  );
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024 * 4;
  directionalLight.shadow.mapSize.height = 1024 * 4;
  directionalLight.shadow.camera.far = 2500;
  directionalLight.shadow.camera.near = 1;

  directionalLight.shadow.camera.left = LightDebugObject.d;
  directionalLight.shadow.camera.top = LightDebugObject.d;
  directionalLight.shadow.camera.right = -LightDebugObject.d;
  directionalLight.shadow.camera.bottom = -LightDebugObject.d;
  directionalLight.shadow.bias = -0.001;

  directionalLight.position.set(550, 1000, 0);
  directionalLight.target.position.set(0, 0, 0);
  scene.add(
    directionalLight,
    directionalLight.target
    // new THREE.DirectionalLightHelper(directionalLight),
    // new THREE.CameraHelper(directionalLight.shadow.camera)
  );

  gui
    .add(directionalLight, "intensity")
    .name("Light Intensity")
    .step(0.1)
    .min(0)
    .max(20);
  gui
    .addColor(LightDebugObject, "surfaceColor")
    .name("Light SurfaceColor")
    .onFinishChange((value) => {
      LightDebugObject.surfaceColor = value;
      directionalLight.color = new THREE.Color(value);
      sunM.uniforms.uSurfaceColor = { value: new THREE.Color(value) };
    });
  gui
    .addColor(LightDebugObject, "depthColor")
    .name("Light DepthColor")
    .onFinishChange((value) => {
      sunM.uniforms.uDepthColor = { value: new THREE.Color(value) };
    });
  gui
    .add(directionalLight.position, "x")
    .name("Light x")
    .step(1)
    .min(10)
    .max(50);
  gui
    .add(directionalLight.position, "y")
    .name("Light y")
    .step(1)
    .min(10)
    .max(50);
  gui
    .add(directionalLight.position, "z")
    .name("Light z")
    .step(1)
    .min(10)
    .max(50);

  const sunG = new THREE.SphereBufferGeometry(100, 16, 16, 0.5);
  const sunM = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      uSurfaceColor: { value: new THREE.Color(LightDebugObject.surfaceColor) },
      uDepthColor: { value: new THREE.Color(LightDebugObject.depthColor) },
    },
  });

  const sun = new THREE.Mesh(sunG, sunM);
  sun.layers.set(1);
  sun.position.copy(directionalLight.position);

  scene.add(sun);

  const ambientLight = new THREE.AmbientLight(LightDebugObject.surfaceColor, 1);
  scene.add(ambientLight);

  //!--> Cluds <--!//
  const cloudGeometry = new THREE.PlaneBufferGeometry(1500, 1500, 512, 512);
  const cloudMaterial = new THREE.MeshBasicMaterial({ color: 0x87cbde });
  const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
  cloud.rotateX(Math.PI * 0.5);
  cloud.position.y = directionalLight.position.y;
  cloud.layers.set(1);
  scene.add(cloud);

  return [directionalLight, sun];
};

export default initWeatherControler;
