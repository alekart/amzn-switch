import { AmznSwitch } from '../amzn-switch.class';
import { useEffect, useState } from 'react';
import { ChromeHelpers } from '../helpers/chrome-helpers.class';
import Popup from './Popup';
import { Country } from '../interfaces';

export default function App() {
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    ChromeHelpers.getSettings().then(({ countries }) => {
      setCountries(countries);
    });
  }, []);

  function handleUpdate(updated: Country[]) {
    ChromeHelpers.setSettings({ countries: updated });
  }

  return <>
    <Popup countries={countries} onUpdate={handleUpdate}/>
  </>;
}
