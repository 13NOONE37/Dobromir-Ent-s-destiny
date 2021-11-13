import * as THREE from "three";

const updateAllMaterials = (scene, enviormentMapTexture) => {
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
export default updateAllMaterials;
