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

  constructor(url?: string) {
    this.current = this.detectCurrent();
    this.menu = this.createMenuElement();
    this.url = url || window.location.href;
    this.hostname = url ? new URL(url).hostname : window.location.hostname;
  }

  addMenu(element: HTMLElement) {
    element.appendChild(this.menu);
  }

  getList() {
    return AmznSwitch.countries.reduce((accum, country) => {
      if (this.current === country) {
        return accum;
      }
      const cntry = country.replace('com.', '');
      return `${accum}
      <a class="amzns-link nav-link nav-item" href="${this.localizeUrl(country)}">
        <span class="icp-nav-flag icp-nav-flag-${cntry} icp-nav-flag-lop"></span>
        <span class="nav-text" translate="no">${country}</span>
      </a>`;
    }, '');
  }

  private localizeUrl(country: string): string {
    const url = this.url || window.location.href
    return url.replace(`amazon.${this.current}`, `amazon.${country}`);
  }

  private detectCurrent(): string {
    let hostname;
    if(this.url) {
      hostname = new URL(this.url, '').hostname;
    } else {
      hostname = window.location.hostname
    }
    return hostname.replace(/^.+amazon\./, '');
  }

  private createMenuElement(): HTMLElement {
    return this.parser
      .parseFromString(this.getTemplate(), 'text/html')
      .querySelector('.amzns-list');
  }

  private getTemplate() {
    return `
    <span class="nav-icon nav-arrow" style="visibility: visible;"></span>
    <div class="amzns-list nav-flyout">
      <div class="nav-arrow"><div class="nav-arrow-inner"></div></div>
      ${this.getList()}
    </div>
    `;
  }
}
