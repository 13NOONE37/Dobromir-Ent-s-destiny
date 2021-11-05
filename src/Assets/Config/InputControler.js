const initInputControler = () => {
  const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    space: false,
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

  //!--!-Keyboard
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  //!--!-Mouse
  window.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    // console.log("mouse click", e);
  });
  window.addEventListener("mousewheel", (e) => {
    e.preventDefault();
    e.stopPropagation();
    // console.log("mouse wheel", e);
  });
  window.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    e.stopPropagation();
    // console.log("contextmenu", e);
  });

  return keys;
};
export default initInputControler;
