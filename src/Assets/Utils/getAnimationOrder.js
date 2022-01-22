const animationsOrder = [
  'Idle',
  'Walk',
  'Run',
  'Jump',
  'Crouch',
  'FistClench',
  'FistUnClench',
  'Guard',
  'LeftJab',
  'RightJab',
  'SwordGuard',
  'SwordAttack1',
];

const getAnimationOrder = (name) => animationsOrder.indexOf(name);

export default getAnimationOrder;
