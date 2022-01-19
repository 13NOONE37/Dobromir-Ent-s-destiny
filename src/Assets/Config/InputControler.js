const handleControler = () => {
  if (currentObject.type == 'Character') {
    //animation
    switch (keys.motion) {
      case 'FinchFist': {
        break;
      }
      case 'Idle': {
        currentObject.object.animations[2].stop();
        currentObject.object.animations[3].stop();
        currentObject.object.animations[4].stop();
        currentObject.object.animations[1].play();
        break;
      }
      case 'Jump': {
        currentObject.object.animations[2].play();
        break;
      }
      case 'Run': {
        currentObject.object.animations[4].stop();
        currentObject.object.animations[3].play();
        break;
      }
      case 'Walk': {
        currentObject.object.animations[4].play();
        break;
      }
    }
    //Dobromir
    if (!keys.forward && !keys.backward && !keys.left && !keys.right) {
      keys.motion = 'Idle';
    }

    const rotation = currentObject.object.getWorldDirection(
      currentObject.object.rotation.toVector3(),
    );

    const theta = Math.atan2(rotation.x, rotation.z);

    if (keys.forward) {
      const x = Math.sin(theta) * keys.speed,
        y = currentObject.object.body.velocity.y,
        z = Math.cos(theta) * keys.speed;

      currentObject.object.body.setVelocity(x, y, z);
      keys.motion = 'Walk';
      // currentObject.object.animations[4].play();
      // currentObject.object.animations[1].stop();
    }
    if (keys.backward) {
      const x = -Math.sin(theta) * keys.speed,
        y = currentObject.object.body.velocity.y,
        z = -Math.cos(theta) * keys.speed;
      currentObject.object.body.setVelocity(x, y, z);
      keys.motion = 'Walk';

      // currentObject.object.animations[4].play();
      // currentObject.object.animations[1].stop();
    }
    if (keys.left) {
      currentObject.object.body.setAngularVelocityY(1.5);
    } else if (keys.right) {
      currentObject.object.body.setAngularVelocityY(-1.5);
    } else {
      currentObject.object.body.setAngularVelocityY(0);
    }
    if (keys.space && keys.canJump) {
      keys.canJump = false;
      keys.isJumping = true;
      keys.motion = 'Jump';

      // currentObject.object.animations[1].stop();
      // currentObject.object.animations[2].play();
      // console.log(currentObject.object.animations);
      // czesioJumpAction.stop();
      // czesioJumpAction.play();
      setTimeout(() => {
        currentObject.object.body.setVelocityY(10);
        keys.canJump = true;
        currentObject.object.animations[2].stop();
      }, 200);
    }

    //Sprint
    if (keys.forward && keys.shift) {
      // keys.speed = 3.7;
      keys.motion = 'Run';
    }
    if (!keys.shift) {
      if (keys.speed != 1.7) keys.speed = 1.7;
    }

    //action
    if (keys.action) {
    }
  }
  if (currentObject.type == 'Ship') {
    //Ship
    if (
      keys.mouse.x < window.innerWidth / 2 - window.innerWidth / 4 ||
      keys.mouse.x > window.innerWidth / 2 + window.innerWidth / 4
    ) {
      //horizontaly
      if (keys.mouse.x > window.innerWidth / 2) {
        currentObject.object.body.setAngularVelocityY(-0.5);
        //right
      }
      if (keys.mouse.x < window.innerWidth / 2) {
        currentObject.object.body.setAngularVelocityY(0.5);
        // left;
      }
    }
    if (
      keys.mouse.y < window.innerHeight / 2 - window.innerHeight / 4 ||
      keys.mouse.y > window.innerHeight / 2 + window.innerHeight / 4
    ) {
      //verticaly
    }
    if (keys.space) {
      currentObject.object.body.setVelocityY(10);
    }

    if (keys.forward) {
      keys.speed.value = 4;
    }
    if (keys.backward) {
      keys.speed.value = 1;
    }
    if (keys.left) {
      currentObject.object.body.setAngularVelocityX(0.4);
    }
    if (keys.right) {
      currentObject.object.body.setAngularVelocityX(-0.4);
    }
  }
  if (currentObject.type == 'Car') {
    //Ship
  }
};

const currentObject = { object: undefined, type: undefined };
const keys = {
  motion: 'Idle',
  mouse: { x: 0, y: 0 },
  mousePrevious: { x: 0, y: 0 },
  forward: false,
  backward: false,
  left: false,
  right: false,
  space: false,
  canJump: true,
  isJumping: false,
  shift: false,
  action: false,
  speed: 1.7,
};
const initInputControler = () => {
  const handleKeyDown = (e) => {
    switch (e.keyCode) {
      case 87: //w
        keys.forward = true;
        break;

      case 83: //s
        keys.backward = true;
        break;

      case 65: //a
        keys.left = true;
        break;

      case 68: //d
        keys.right = true;
        break;

      case 32: //space
        keys.space = true;
        break;

      case 16: //shift
        keys.shift = true;
        break;

      case 69: //e
        keys.action = true;
        break;
    }
  };
  const handleKeyUp = (e) => {
    switch (e.keyCode) {
      case 87: //w
        keys.forward = false;
        break;

      case 83: //s
        keys.backward = false;
        break;

      case 65: //a
        keys.left = false;
        break;

      case 68: //d
        keys.right = false;
        break;

      case 32: //space
        keys.space = false;
        break;

      case 16: //shift
        keys.shift = false;
        break;

      case 69: //e
        keys.action = false;
        break;
    }
  };

  //!--Keyboard
  window.addEventListener('keydown', handleKeyDown, true);
  window.addEventListener('keyup', handleKeyUp);

  //!--Mouse
  window.addEventListener('click', (e) => {
    e.preventDefault();
    // console.log("mouse click", e);
  });
  window.addEventListener('mousewheel', (e) => {
    e.preventDefault();
    // console.log("mouse wheel", e);
  });
  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    // console.log("contextmenu", e);
  });
  window.addEventListener('mousemove', (e) => {
    keys.mousePrevious.x = keys.mouse.x;
    keys.mousePrevious.y = keys.mouse.y;
    keys.mouse.x = e.clientX;
    keys.mouse.y = e.clientY;
    //
  });
};
const initControler = () => {
  initInputControler();
  return [currentObject, handleControler];
};

export default initControler;
