import * as THREE from 'three';

const ThirdPersonCamera = (camera, currentControlObject, cameraDebug) => {
  const calculateIdealOffset = () => {
    const idealOffset = new THREE.Vector3(
      cameraDebug.offsetX,
      cameraDebug.offsetY,
      cameraDebug.offsetZ,
    );
    idealOffset.applyQuaternion(currentControlObject.parent.quaternion);
    idealOffset.add(currentControlObject.parent.position);

    return idealOffset;
  };
  const calculateIdealLookAt = () => {
    const idealLookAt = new THREE.Vector3(
      cameraDebug.lookX,
      cameraDebug.lookY,
      cameraDebug.lookZ,
    );
    idealLookAt.applyQuaternion(currentControlObject.parent.quaternion);
    idealLookAt.add(currentControlObject.parent.position);

    return idealLookAt;
  };

  const idealOffset = calculateIdealOffset();
  const idealLookAt = calculateIdealLookAt();

  camera.position.copy(idealOffset);
  camera.lookAt(idealLookAt);
};
export default ThirdPersonCamera;
