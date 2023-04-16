import { Settings } from '../interfaces/settings.interface';

export class ChromeHelpers {
  static getOptions(): Promise<Settings> {
    return chrome.storage.sync.get(['options', 'version', 'updatedOn']).then((result) => {
      return {
        ...result.options,
        version: result.version,
        updatedOn: result.updatedOn,
      };
    });
  }

  static setOptions(options: Settings) {
    chrome.storage.sync.set({ options, updatedOn: new Date().getTime() });
  }
}
