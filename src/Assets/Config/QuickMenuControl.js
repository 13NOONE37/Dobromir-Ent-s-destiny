const quickMenu = document.querySelector('.quickMenu');
const buttons = quickMenu.children[0].children;

let params = { keys: null };
const changeCurrentSign = (e) => {
  console.log(e.target.className);
  if (e.target.className == 'sword') {
    params.keys.isSwordInHand = true;
    params.keys.toggleSword();
  } else if (e.target.className == 'fist') {
    params.keys.isSwordInHand = false;
    params.keys.toggleSword();
  } else {
    params.keys.currentSign = e.target.className;
  }
};
const showQuickMenu = (keys) => {
  params.keys = keys;
  quickMenu.classList.toggle('showQuickMenu');
  for (const button of buttons) {
    button.addEventListener('mouseover', changeCurrentSign);
  }
};
const hideQuickMenu = () => {
  quickMenu.classList.toggle('showQuickMenu');
  for (const button of buttons) {
    button.removeEventListener('mouseover', changeCurrentSign);
  }
};
export { showQuickMenu, hideQuickMenu };
