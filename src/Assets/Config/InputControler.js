import getAnimationOrder from '../Utils/getAnimationOrder';

const fadeToAction = (animation, duration) => {
  previousAction = activeAction;
  activeAction = animation;
  // console.log(previousAction, activeAction);
  if (previousAction !== activeAction) {
    previousAction.fadeOut(duration);
  }
  activeAction
    .reset()
    .setEffectiveTimeScale(1)
    .setEffectiveWeight(1)
    .fadeIn(duration)
    .play();
};
const handleControler = () => {
  if (currentObject.type == 'Character') {
    const rotation = currentObject.object.getWorldDirection(
      currentObject.object.rotation.toVector3(),
    );
    const theta = Math.atan2(rotation.x, rotation.z);
    const x = Math.sin(theta) * keys.speed,
      y = currentObject.object.body.velocity.y,
      z = Math.cos(theta) * keys.speed;

    //Dobromir
    if (!keys.forward && !keys.backward && !keys.left && !keys.right) {
      if (activeAction === undefined) {
        activeAction =
          currentObject.object.animations[getAnimationOrder('Idle')];
        currentObject.object.animations[getAnimationOrder('Idle')].play();
      } else if (
        activeAction !==
        currentObject.object.animations[getAnimationOrder('Idle')]
      ) {
        fadeToAction(
          currentObject.object.animations[getAnimationOrder('Idle')],
          0.5,
        );
      }
    }
    if (keys.forward && !keys.shift) {
      currentObject.object.body.setVelocity(x, y, z);
      activeAction !==
        currentObject.object.animations[getAnimationOrder('Walk')] &&
        fadeToAction(
          currentObject.object.animations[getAnimationOrder('Walk')],
          0.5,
        );
    }
    if (keys.backward) {
      currentObject.object.body.setVelocity(-x, y, -z);
      activeAction !==
        currentObject.object.animations[getAnimationOrder('Walk')] &&
        fadeToAction(
          currentObject.object.animations[getAnimationOrder('Walk')],
          0.5,
        );
    }
    if (keys.left) {
      currentObject.object.body.setAngularVelocityY(1.5);
    } else if (keys.right) {
      currentObject.object.body.setAngularVelocityY(-1.5);
    } else {
      currentObject.object.body.setAngularVelocityY(0);
    }

    if (keys.jump && keys.canJump) {
      keys.canJump = false;
      keys.isJumping = true;

      currentObject.object.animations[getAnimationOrder('Jump')].play();
      setTimeout(() => {
        currentObject.object.body.setVelocityY(10);
        keys.canJump = true;
        currentObject.object.animations[getAnimationOrder('Jump')].stop();
      }, 200);
    }

    //Sprint
    if (keys.forward && keys.shift) {
      keys.speed = 3.7;
      const x = Math.sin(theta) * keys.speed,
        y = currentObject.object.body.velocity.y,
        z = Math.cos(theta) * keys.speed;

      currentObject.object.body.setVelocity(x, y, z);

      activeAction !==
        currentObject.object.animations[getAnimationOrder('Run')] &&
        fadeToAction(
          currentObject.object.animations[getAnimationOrder('Run')],
          0.5,
        );
    }
    if (!keys.shift) {
      if (keys.speed != 1.7) keys.speed = 1.7;
    }

    //action
    if (keys.action) {
    }
    //block
    if (keys.block) {
      // activeAction !==
      //   currentObject.object.animations[getAnimationOrder('Guard')] &&
      //   fadeToAction(
      //     currentObject.object.animations[getAnimationOrder('Guard')],
      //     0.5,
      //   );
      currentObject.object.animations[getAnimationOrder('Guard')].play();
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
    if (keys.jump) {
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

const api = { state: 'Walking' };
let activeAction, previousAction;

const currentObject = { object: undefined, type: undefined };
const keys = {
  motion: 'Idle',
  mouse: { x: 0, y: 0 },
  mousePrevious: { x: 0, y: 0 },
  forward: false,
  backward: false,
  left: false,
  right: false,
  jump: false,
  canJump: true,
  isJumping: false,
  shift: false,
  action: false,
  block: false,
  leftMouse: false,
  rightMouse: false,

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
        keys.jump = true;
        break;

      case 16: //shift
        keys.shift = true;
        break;

      case 69: //e
        keys.action = true;
        break;
      case 81: //q
        keys.block = true;
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

      case 32: //jump
        keys.jump = false;
        break;

      case 16: //shift
        keys.shift = false;
        break;

      case 69: //e
        keys.action = false;
        break;
      case 81: //q
        keys.block = false;
        break;
    }
  };

  //!--Keyboard
  window.addEventListener('keydown', handleKeyDown, true);
  window.addEventListener('keyup', handleKeyUp);

  //!--Mouse
  window.addEventListener('mousedown', (e) => {
    e.preventDefault();
    switch (e.button) {
      case 0: //lmb
        keys.leftMouse = !keys.leftMouse;
        break;
      case 1: //middle
        break;
      case 2: //rmb
        keys.rightMouse = !keys.rightMouse;

        break;
    }
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
