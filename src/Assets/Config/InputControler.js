const initInputControler = () => {
  //!--!-Keyboard
  window.addEventListener("keydown", () => {
    console.log("keydown");
  });
  window.addEventListener("keypress", () => {
    console.log("keypress");
  });
  window.addEventListener("keyup", () => {
    console.log("keyup");
  });

  //!--!-Keyboard
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
};
export default initInputControler;
