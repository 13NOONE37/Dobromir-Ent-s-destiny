import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

const initLoadingManagers = () => {
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

  return [textureLoader, cubeTextureLoader, modelLoader];
};
export default initLoadingManagers;
