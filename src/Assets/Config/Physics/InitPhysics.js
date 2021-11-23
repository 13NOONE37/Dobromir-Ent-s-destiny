// import { Ammo } from 'three/examples/js/libs/ammo.wasm';

const gravityConstant = -9.8;
let physicsWorld;
let transformAux1;

const initPhysics = () => {
  //Physics configuration
  let collisionConfiguration =
    new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
  let dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
  let bradphase = new Ammo.btDbvtBroadphase();
  let solver = new Ammo.btSequentialConstraintSolver();
  let softBodySolver = new Ammo.btDefaultSoftBodySolver();

  //World
  physicsWorld = new Ammo.btSoftRigidDynamicsWorld(
    dispatcher,
    bradphase,
    solver,
    collisionConfiguration,
    softBodySolver,
  );
  physicsWorld.setGravity(new Ammo.btVector3(0, gravityConstant, 0));

  transformAux1 = new Ammo.btTransform();
};
export default initPhysics;
export { physicsWorld, transformAux1 };
