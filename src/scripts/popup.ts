import Tab = chrome.tabs.Tab;
import { AmznSwitch } from './amzn-switch.class';

(function () {
  chrome.tabs.query(
    { active: true },
    (tabs) => {
      const tab = tabs[0];
      popup(tab);
    },
  );
})();

function popup(tab: Tab) {
  const url = tab.url;
  if(!/amazon/.test(url)) {
    return;
  }
  const amzn = new AmznSwitch(url)
  const container = document.querySelector('.countries');
  container.innerHTML = amzn.getList();

  container.addEventListener('click', (e: MouseEvent) => {
    e.preventDefault()
    tab.url = (e.target as HTMLAnchorElement).href;
  });
}
