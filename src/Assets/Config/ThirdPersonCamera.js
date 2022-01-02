import * as THREE from 'three';

const ThirdPersonCamera = (camera, currentControlObject, cameraDebug) => {
  // console.log(currentControlObject);
  const calculateIdealOffset = () => {
    const idealOffset = new THREE.Vector3(
      cameraDebug.offsetX,
      cameraDebug.offsetY,
      cameraDebug.offsetZ,
    );
    idealOffset.applyQuaternion(currentControlObject.quaternion);
    idealOffset.add(currentControlObject.position);

    return idealOffset;
  };
  const calculateIdealLookAt = () => {
    const idealLookAt = new THREE.Vector3(
      cameraDebug.lookX,
      cameraDebug.lookY,
      cameraDebug.lookZ,
    );
    idealLookAt.applyQuaternion(currentControlObject.quaternion);
    idealLookAt.add(currentControlObject.position);

    return idealLookAt;
  };

  const idealOffset = calculateIdealOffset();
  const idealLookAt = calculateIdealLookAt();

  camera.position.copy(idealOffset);
  camera.lookAt(idealLookAt);
};
export default ThirdPersonCamera;
