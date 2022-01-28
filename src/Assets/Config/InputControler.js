import getAnimationOrder from '../Utils/getAnimationOrder';
import { showQuickMenu, hideQuickMenu } from './QuickMenuControl';

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
    if (
      !keys.forward &&
      !keys.backward &&
      !keys.left &&
      !keys.right &&
      !keys.rightMouse
    ) {
      if (activeAction === undefined) {
        activeAction =
          currentObject.object.animations[getAnimationOrder('Idle')];
        currentObject.object.animations[getAnimationOrder('Idle')].play();
      } else if (
        activeAction !==
        currentObject.object.animations[getAnimationOrder('Idle')]
      ) {
        keys.isBlocking = false;
        // currentObject.object.animations[getAnimationOrder('SwordGuard')].stop();
        fadeToAction(
          currentObject.object.animations[getAnimationOrder('Idle')],
          0.5,
        );
      }
    }
    if (keys.forward && !keys.shift && !keys.isBlocking) {
      currentObject.object.body.setVelocity(x, y, z);
      activeAction !==
        currentObject.object.animations[getAnimationOrder('Walk')] &&
        fadeToAction(
          currentObject.object.animations[getAnimationOrder('Walk')],
          0.5,
        );
    }
    if (keys.backward && !keys.isBlocking) {
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

    if (keys.jump && keys.canJump && !keys.isJumping) {
      if (keys.canJump && !keys.isJumping) {
        currentObject.object.animations[getAnimationOrder('Jump')].play();
        keys.canJump = false;
        keys.isJumping = true;
        setTimeout(() => {
          currentObject.object.body.setVelocityY(10);
          currentObject.object.animations[getAnimationOrder('Jump')].stop();
          keys.isJumping = false;
        }, 150);
      }
    }
    if (!keys.jump && !keys.isJumping) {
      keys.canJump = true;
    }

    //Sprint
    if (keys.forward && keys.shift && !keys.isBlocking) {
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
    //sign
    if (keys.sign) {
      // if (
      //   activeAction !==
      //   currentObject.object.animations[getAnimationOrder('Guard')]
      // ) {
      //   currentObject.object.animations[getAnimationOrder('Guard')].play();
      //   activeAction =
      //     currentObject.object.animations[getAnimationOrder('Guard')];
      // }
    }

    //leftMouse
    if (keys.leftMouse) {
      if (keys.isSwordInHand) {
        if (
          activeAction !==
          currentObject.object.animations[getAnimationOrder('SwordAttack1')]
        ) {
          // currentObject.object.animations[
          //   getAnimationOrder('SwordAttack1')
          // ].play();

          fadeToAction(
            currentObject.object.animations[getAnimationOrder('SwordAttack1')],
            0.2,
          );
        }
      } else {
        if (
          activeAction !==
          currentObject.object.animations[getAnimationOrder('LeftJab')]
        ) {
          fadeToAction(
            currentObject.object.animations[getAnimationOrder('LeftJab')],
            0.2,
          );
        }
      }
    }

    if (keys.rightMouse && !keys.isBlocking) {
      if (keys.isSwordInHand) {
        if (
          activeAction !==
          currentObject.object.animations[getAnimationOrder('SwordGuard')]
        ) {
          keys.isBlocking = true;
          fadeToAction(
            currentObject.object.animations[getAnimationOrder('SwordGuard')],
            0.1,
          );
        }
      } else {
        if (
          activeAction !==
          currentObject.object.animations[getAnimationOrder('Guard')]
        ) {
          keys.isBlocking = true;
          fadeToAction(
            currentObject.object.animations[getAnimationOrder('Guard')],
            0.1,
          );
        }
      }
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

let activeAction, previousAction;

const currentObject = { object: undefined, type: undefined };
const keys = {
  mouse: { x: 0, y: 0 },
  mousePrevious: { x: 0, y: 0 },
  leftMouse: false,
  rightMouse: false,

  forward: false,
  backward: false,
  left: false,
  right: false,
  shift: false,

  jump: false,
  canJump: true,
  isJumping: false,

  action: false,
  sign: false,
  currentSign: 'igni',
  isSwordInHand: true,
  isBlocking: false,
  speed: 1.7,
};
const initInputControler = () => {
  const handleKeyDown = (e) => {
    if (!e.repeat) {
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
          keys.sign = true;
          showQuickMenu(keys);
          break;
      }
    }
  };
  const handleKeyUp = (e) => {
    if (!e.repeat) {
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
          console.log(keys.isSwordInHand, keys.currentSign);
          break;
        case 81: //q
          keys.sign = false;
          hideQuickMenu();
          break;
      }
    }
  };
  //TODO:trzeba się zastanowić czy nie zrobić tego wybierania na zasadzie, że wybierana jest to co jest zaznaczone w momencie puszczenia q
  //!--Keyboard
  window.addEventListener('keydown', handleKeyDown, true);
  window.addEventListener('keyup', handleKeyUp);

  //!--Mouse
  window.addEventListener('mousedown', (e) => {
    e.preventDefault();
    switch (e.button) {
      case 0: //lmb
        keys.leftMouse = true;
        break;
      case 1: //middle
        break;
      case 2: //rmb
        keys.rightMouse = true;

        break;
    }
  });
  window.addEventListener('mouseup', (e) => {
    e.preventDefault();
    switch (e.button) {
      case 0: //lmb
        keys.leftMouse = false;
        break;
      case 1: //middle
        break;
      case 2: //rmb
        keys.rightMouse = false;

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
const initControler = (gui) => {
  gui.add(keys, 'isSwordInHand').onChange((e) => {
    currentObject.object.children[0].children[0].children[0].children[0].children[2].children[0].children[0].children[2].children[1].visible =
      e;
  });
  initInputControler();
  return [currentObject, handleControler];
};

export default initControler;
