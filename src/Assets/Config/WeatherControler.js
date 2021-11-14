import * as THREE from "three";
import { MeshBasicMaterial } from "three";
import { Sky } from "three/examples/jsm/objects/Sky";

const initWeatherControler = (renderer, scene, gui, modelLoader) => {
  //!--> LIGHTS

  //Ambient
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  //HemisphereLight
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6); //0.6

  hemiLight.color.setHSL(0.6, 1, 0.6);
  hemiLight.groundColor.setHSL(0.095, 1, 0.75);
  hemiLight.position.set(0, 50, 0);
  // scene.add(hemiLight);

  //directionalLight
  const directionalLight = new THREE.DirectionalLight(0xffffff, 12); //10
  directionalLight.color.setHSL(0.1, 1, 0.95); //#fff4e2
  directionalLight.position.set(-1, 10, 1); // dirLight.position.set(550, 1000, 0);
  directionalLight.position.multiplyScalar(30);

  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024 * 4;
  directionalLight.shadow.mapSize.height = 1024 * 4;

  const d = 100;

  directionalLight.shadow.camera.left = -d;
  directionalLight.shadow.camera.top = d;
  directionalLight.shadow.camera.right = d;
  directionalLight.shadow.camera.bottom = -d;

  directionalLight.shadow.bias = -0.0001;
  directionalLight.shadow.camera.far = 500;

  scene.add(
    directionalLight,
    new THREE.DirectionalLightHelper(directionalLight),
    new THREE.CameraHelper(directionalLight.shadow.camera)
  );

  //SKY

  let sky, sun, effectController, guiChanged;
  const initSky = () => {
    // Add Sky
    sky = new Sky();
    sky.scale.setScalar(450000);
    scene.add(sky);

    sun = new THREE.Vector3();

    /// GUI

    //Dla nocy
    //turbidy: 20,
    // minCeoficient: 0,
    // minDirectionalG:0.7,
    // exposure:0.07

    effectController = {
      turbidity: 10,
      rayleigh: 3,
      mieCoefficient: 0.005,
      mieDirectionalG: 0.7,
      elevation: 72,
      azimuth: 180,
      exposure: renderer.toneMappingExposure,
    };

    guiChanged = () => {
      const uniforms = sky.material.uniforms;
      uniforms["turbidity"].value = effectController.turbidity;
      uniforms["rayleigh"].value = effectController.rayleigh;
      uniforms["mieCoefficient"].value = effectController.mieCoefficient;
      uniforms["mieDirectionalG"].value = effectController.mieDirectionalG;

      const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
      const theta = THREE.MathUtils.degToRad(effectController.azimuth);

      sun.setFromSphericalCoords(1, phi, theta);

      uniforms["sunPosition"].value.copy(sun);

      renderer.toneMappingExposure = effectController.exposure;
    };

    const SkyProperties = gui.addFolder("Sky");
    SkyProperties.add(effectController, "turbidity", 0.0, 20.0, 0.1).onChange(
      guiChanged
    );
    SkyProperties.add(effectController, "rayleigh", 0.0, 4, 0.001).onChange(
      guiChanged
    );
    SkyProperties.add(
      effectController,
      "mieCoefficient",
      0.0,
      0.1,
      0.001
    ).onChange(guiChanged);
    SkyProperties.add(
      effectController,
      "mieDirectionalG",
      0.0,
      1,
      0.001
    ).onChange(guiChanged);
    SkyProperties.add(effectController, "elevation", 0, 180, 0.1).onChange(
      guiChanged
    );
    SkyProperties.add(effectController, "azimuth", -180, 180, 0.1).onChange(
      guiChanged
    );
    SkyProperties.add(effectController, "exposure", 0, 1, 0.0001).onChange(
      guiChanged
    );

    guiChanged();
  };
  initSky();

  const renderClouds = () => {
    const cloudDebug = {
      count: 250,
      radius: 15000,
      height: 3000,
      scaleCoefficient: 90,
    };
    let cloud1, cloud2, cloud3;
    const initClouds = () => {
      for (let i = 0; i < cloudDebug.count; i++) {
        let cloud;

        switch (((Math.floor(Math.random() * 10) + i) % 3) + 1) {
          case 1: {
            cloud = cloud1.clone();
            break;
          }
          case 2: {
            cloud = cloud2.clone();
            break;
          }
          case 3: {
            cloud = cloud3.clone();
            break;
          }
        }

        const scaleOfCloud = Math.max(
          10,
          Math.random() * cloudDebug.scaleCoefficient
        );
        cloud.scale.set(scaleOfCloud, scaleOfCloud, scaleOfCloud);
        cloud.rotation.x = Math.random() * Math.PI;
        cloud.rotation.z = Math.random() * Math.PI;

        cloud.position.y = cloudDebug.height;
        cloud.position.x = (0.5 - Math.random()) * cloudDebug.radius;
        cloud.position.z = (0.5 - Math.random()) * cloudDebug.radius;
        scene.add(cloud);
      }
    };
    modelLoader.load("/Assets/Enviorment/cloud1.glb", (cloud11) => {
      modelLoader.load("/Assets/Enviorment/cloud2.glb", (cloud22) => {
        modelLoader.load("/Assets/Enviorment/cloud3.glb", (cloud33) => {
          cloud1 = cloud11.scene;
          cloud2 = cloud22.scene;
          cloud3 = cloud33.scene;
          initClouds();
        });
      });
    });

    return [cloud1, cloud2, cloud3];
  };
  const clouds = renderClouds();

  return [directionalLight, sun, effectController, guiChanged, clouds];
};

export default initWeatherControler;
