import * as THREE from 'three';

export default (textureLoader, scene) => {
  const texture1 = textureLoader.load(
    '/Assets/Enviorment/Thumbnails/Terrain_Alpha (3).jpg',
  );

  const texture2 = textureLoader.load(
    '/Assets/Enviorment/Thumbnails/AmbientOcclusionMap.jpg',
  );
  const texture3 = textureLoader.load(
    '/Assets/Enviorment/Thumbnails/NormalMap.jpg',
  );
  const texture4 = textureLoader.load(
    '/Assets/Enviorment/Thumbnails/SpecularMap.jpg',
  );

  const groundAmbient = textureLoader.load('/Assets/Dirt/Ambient.jpg');
  const groundDisplacment = textureLoader.load('/Assets/Dirt/Displacment.jpg');
  const groundNormal = textureLoader.load('/Assets/Dirt/Normal.jpg');
  const groundBaseColor = textureLoader.load('/Assets/Dirt/BaseColor.jpg');
  const groundBump = textureLoader.load('/Assets/Dirt/Bump.jpg');

  const wrapValue = 256;

  groundAmbient.wrapS = THREE.RepeatWrapping;
  groundAmbient.wrapT = THREE.RepeatWrapping;
  groundAmbient.repeat.set(wrapValue, wrapValue);

  groundDisplacment.wrapS = THREE.RepeatWrapping;
  groundDisplacment.wrapT = THREE.RepeatWrapping;
  groundDisplacment.repeat.set(wrapValue, wrapValue);

  groundNormal.wrapS = THREE.RepeatWrapping;
  groundNormal.wrapT = THREE.RepeatWrapping;
  groundNormal.repeat.set(wrapValue, wrapValue);

  groundBaseColor.wrapS = THREE.RepeatWrapping;
  groundBaseColor.wrapT = THREE.RepeatWrapping;
  groundBaseColor.repeat.set(wrapValue, wrapValue);
  groundBump.wrapS = THREE.RepeatWrapping;
  groundBump.wrapT = THREE.RepeatWrapping;
  groundBump.repeat.set(wrapValue, wrapValue);

  const floorGeometry = new THREE.PlaneBufferGeometry(2500, 2500, 1024, 1024);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#aaa'),
    aoMap: groundAmbient,
    // displacementMap: groundDisplacment,
    // displacementScale: 1.1,
    normalMap: groundNormal,
    map: groundBaseColor,
    // bumpMap: groundBump,
    // bumpScale: 1.1,
  });

  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotateX(-Math.PI * 0.5);

  floor.geometry.setAttribute(
    'uv2',
    new THREE.BufferAttribute(floor.geometry.attributes.uv.array, 2),
  );
  scene.add(floor);
  physics.add.existing(floor, { mass: 0 });
};
