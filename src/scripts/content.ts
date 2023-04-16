import { AmznSwitch } from './amzn-switch.class';

const amzn = new AmznSwitch();

addEventListener('DOMContentLoaded', (event) => {
  init();
});

function init() {
  const container: HTMLElement = document.querySelector('#nav-logo');
  amzn.addMenu(container);
}
