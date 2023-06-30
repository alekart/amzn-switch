import { from, mergeMap, Observable, of, throwError } from 'rxjs';
import { Link, Price } from './interfaces';

export class AmznSwitch {
  static countries = [
    'fr',
    'com.be',
    'de',
    'es',
    'it',
    'nl',
  ];

  current: string;
  menu: HTMLElement;
  parser = new DOMParser();
  url: string;
  hostname: string;
  links: Link[];

  constructor(url?: string) {
    this.current = this.detectCurrent();
    this.links = this.getCountriesLinks();
    this.menu = this.createMenuElement(this.links);
    this.getPrices(this.links);
    this.url = url || window.location.href;
    this.hostname = url ? new URL(url).hostname : window.location.hostname;
  }

  addMenu(element: HTMLElement) {
    element.appendChild(this.menu);
  }

  private getPrices(links: Link[]) {
    links.forEach((link) => {
      this.getPrice(link.href).subscribe((price) => {
        this.addPriceToMenu(price, link.flag);
        this.addPriceInPage(price, link);
      });
    });
  }

  private getPrice(url: string): Observable<Price> {
    return from(new Promise<Price>((resolve, reject) => {
      const port = chrome.runtime.connect({ name: 'amazonSwitch' });
      port.postMessage({ url });
      port.onMessage.addListener((msg) => {
        if (msg?.price) {
          resolve(msg.price);
        }
      });
    })).pipe(mergeMap((response) => {
      if (!response) {
        throwError(() => 'Could not get price');
      }
      return of(response);
    }));
  }

  private getList(links: Link[]) {
    return links.reduce((accum, link) => {
      const elementId = `amzn-switch-${link.country}`;
      return `${accum}
      <a id="${elementId}" class="amzns-link nav-link nav-item" href="${link.href}">
        <span class="icp-nav-flag icp-nav-flag-${link.flag} icp-nav-flag-lop"></span>
        <span class="nav-text" translate="no">${link.flag}</span>
        <span id="amzns-price-${link.flag}" class="amzns-price"></span>
      </a>`;
    }, '');
  }

  private getCountriesLinks(): Link[] {
    return AmznSwitch.countries.reduce((accum, country) => {
      if (this.current === country) {
        return accum;
      }
      const flag = country.replace('com.', '');
      const href = this.localizeUrl(country);
      return [...accum, { href: href, flag, country }];
    }, [] as Link[]);
  }

  private addPriceToMenu(price: Price, country: string) {
    const priceHolder = this.menu.querySelector(`#amzns-price-${country}`);
    const { whole, decimals, symbol } = price;
    if (priceHolder) {
      priceHolder.innerHTML = `
            <span class="a-price-whole">
              ${whole}<!--
          --><span class="a-price-decimal">,</span><!--
          --></span><!--
          --><span class="a-price-fraction">${decimals}</span><!--
          --><span class="a-price-symbol">${symbol}</span>`;
    }
  }

  private addPriceInPage(price: Price, link: Link) {
    const priceHolder = document.querySelector(`.priceToPay`);
    const priceTmpl = `
      <a id="page-price-${link.flag}" class="amzns-in-page" href="${link.href}">
        <span class="icp-nav-flag icp-nav-flag-${link.flag} icp-nav-flag-lop"></span><!--
          --><span class="a-price-whole">
              ${price.whole}<!--
          --><span class="a-price-decimal">,</span><!--
          --></span><!--
          --><span class="a-price-fraction">${price.decimals}</span><!--
          --><span class="a-price-symbol">${price.symbol}</span>
      </a>
    `;
    priceHolder.innerHTML = `${priceHolder.innerHTML}${priceTmpl}`;
  }

  private localizeUrl(country: string): string {
    const url = this.url || window.location.href;
    return url.replace(`amazon.${this.current}`, `amazon.${country}`);
  }

  private detectCurrent(): string {
    let hostname;
    if (this.url) {
      hostname = new URL(this.url, '').hostname;
    } else {
      hostname = window.location.hostname;
    }
    return hostname.replace(/^.+amazon\./, '');
  }

  private createMenuElement(links: Link[]): HTMLElement {
    return this.parser
      .parseFromString(this.getTemplate(links), 'text/html')
      .querySelector('.amzns-list');
  }

  private getTemplate(links: Link[]) {
    return `
    <span class="nav-icon nav-arrow" style="visibility: visible;"></span>
    <div class="amzns-list nav-flyout">
      <div class="nav-arrow"><div class="nav-arrow-inner"></div></div>
      ${this.getList(links)}
    </div>
    `;
  }
}
