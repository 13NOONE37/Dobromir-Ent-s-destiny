import { ExtendedObject3D } from '@enable3d/ammo-physics';

const InitStaticModel = (
  physics,
  currentScene,
  visibleObj,
  physicalObj,
  mass = 0,
  positionCoefficient = { x: 0, y: 0, z: 0 },
  rotationCoefficient = { x: 0, y: 180, z: 0 },
  scaleCoefficient = { x: 1, y: 1, z: 1 },
  moveCeo = { x: 0, y: 0, z: 0 },
) => {
  const position = {
    x: visibleObj.position.x + positionCoefficient.x + moveCeo.x,
    y: visibleObj.position.y + positionCoefficient.y + moveCeo.y,
    z: visibleObj.position.z + positionCoefficient.z + moveCeo.z,
  };
  const rotation = {
    x: visibleObj.rotation.x + rotationCoefficient.x,
    y: visibleObj.rotation.y + rotationCoefficient.y,
    z: visibleObj.rotation.z + rotationCoefficient.z,
  };

  const visibleObject = new ExtendedObject3D();
  visibleObject.add(visibleObj);
  const physicalObject = new ExtendedObject3D();
  physicalObject.add(physicalObj);

  //Apply Position
  visibleObject.position.set(position.x, position.y, position.z);
  physicalObject.position.set(position.x, position.y, position.z);
  //Apply Rotation
  visibleObject.rotation.reorder('YXZ');
  visibleObject.rotation.set(rotation.x, rotation.y, rotation.z);
  physicalObject.rotation.reorder('YXZ');
  physicalObject.rotation.set(rotation.x, rotation.y, rotation.z);
  //Apply Scale
  visibleObject.scale.set(
    scaleCoefficient.x,
    scaleCoefficient.y,
    scaleCoefficient.z,
  );
  physicalObject.scale.set(
    scaleCoefficient.x,
    scaleCoefficient.y,
    scaleCoefficient.z,
  );

  currentScene.add(visibleObject);
  physics.add.existing(physicalObject, {
    shape: 'concave',
    mass: mass,
    collisionFlags: 1,
    autoCenter: false,
  });
};

export default InitStaticModel;
