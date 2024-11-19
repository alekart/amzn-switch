import { Country, Settings } from '../interfaces';
import { AmznSwitch } from '../amzn-switch.class';

export class ChromeHelpers {
  static async getSettings(): Promise<Settings> {
    const settings = await chrome.storage.sync.get(['countries']);
    const savedCountries: Country[] = settings?.countries || [];
    if (!savedCountries?.length) {
      return {
        countries: AmznSwitch.countries,
      };
    }
    const mergedCountries = AmznSwitch.countries.reduce((accum: Country[], country) => {
      const inSaved = savedCountries.find((saved) => saved.code === country.code) || {};
      return [
        ...accum,
        {...country, ...inSaved},
      ];
    }, [])
    return {
      countries: mergedCountries,
    };
  }

  static async setSettings(settings: Settings): Promise<void> {
    return chrome.storage.sync.set({
      ...settings,
    });
  }
}
