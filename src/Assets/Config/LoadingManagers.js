import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import updateAllMaterials from "./UpdateAllMaterials";

const initLoadingManagers = (scene) => {
  const loaderManager = new THREE.LoadingManager(
    () => {
      console.log("load");
      updateAllMaterials(scene, enviormentMapTexture);
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

  const enviormentMapTexture = cubeTextureLoader.load([
    "/Assets/Enviorment/px.png",
    "/Assets/Enviorment/nx.png",
    "/Assets/Enviorment/py.png",
    "/Assets/Enviorment/ny.png",
    "/Assets/Enviorment/pz.png",
    "/Assets/Enviorment/nz.png",
  ]);
  enviormentMapTexture.encoding = THREE.sRGBEncoding;
  scene.environment = enviormentMapTexture;
  scene.background = enviormentMapTexture;

  return [textureLoader, cubeTextureLoader, modelLoader, enviormentMapTexture];
};
export default initLoadingManagers;
