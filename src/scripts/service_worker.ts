import { parse } from 'node-html-parser';
import { Price } from './interfaces';

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(function (msg) {
    if (msg.url) {
      fetchPrice(msg.url).then((price) => {
        port.postMessage({ price });
      });
    }
  });
});

/**
 * Fetch the content of the provided url and search a product price on it.
 * If price is not present return null. If price is found return its parts.
 * @param url of the amazon product page
 */
function fetchPrice(url: string): Promise<Price | null> {
  return fetch(url, {
    method: 'GET',
  }).then((r) => {
    return r.text();
  }).then((html) => {
    const tree = parse(html);
    const priceElement = tree.querySelector('.priceToPay');
    if (!priceElement) {
      return null;
    }
    const whole = tree.querySelector('.a-price-whole')?.innerText.replace(/\D/g, '');
    const decimals = tree.querySelector('.a-price-fraction')?.innerText.replace(/\D/g, '');
    const symbol = tree.querySelector('.a-price-symbol')?.innerText.trim();
    return {whole, decimals, symbol};
  });
}
