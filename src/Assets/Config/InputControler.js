const initInputControler = () => {
  const keys = {
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
  };

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

  //!--!-Keyboard
  window.addEventListener('keydown', handleKeyDown, true);
  window.addEventListener('keyup', handleKeyUp);

  //!--!-Mouse
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
  });

  return keys;
};
export default initInputControler;
