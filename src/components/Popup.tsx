import { useEffect, useState } from 'react';
import { Country } from '../interfaces';
import { Checkbox, CheckboxValue } from './Checkbox';
import { AmznSwitch } from '../amzn-switch.class';
// @ts-ignore
import Logo from '../icons/icon_128.png';

interface Props {
  countries: Country[];
  onUpdate: (selected: Country[]) => void;
}

export default function Popup({ countries, onUpdate }: Props) {
  const [options, setOptions] = useState(countries);

  useEffect(() => {
    setOptions([...countries]);
  }, [countries]);

  function resetDefaults() {
    setOptions(AmznSwitch.countries);
  }

  function handleCheckbox(checkbox: CheckboxValue) {
    setOptions((prev) => {
      const modifiedOnIndex = prev.findIndex((i) => i.code === checkbox.value);
      const updated = [...prev];
      updated[modifiedOnIndex] = {
        ...updated[modifiedOnIndex],
        enabled: checkbox.checked,
      };
      return updated;
    });
  }

  function showOptions(enabled: boolean) {
    const filteredOptions = options.filter((option) => option.enabled === enabled);
    const disabled = enabled && filteredOptions.length < 2;
    return filteredOptions.map((country, index) => (
      <p key={`${country.code}-${country.order}`}>
        <Checkbox label={country.name}
                  value={country.code}
                  checked={enabled}
                  disabled={disabled}
                  onChange={handleCheckbox}/>
      </p>));
  }

  return (
    <>
      <h1><img src={Logo} alt="Amazon Switch"/> Amazon Switch</h1>
      <p>Enable countries you want to see prices from.</p>
      <fieldset className="form-group">
        <label>Enabled</label>
        {showOptions(true)}
      </fieldset>
      <fieldset className="form-group">
        <label>Disabled</label>
        {showOptions(false)}
      </fieldset>
      <button type="button" onClick={resetDefaults}>Reset Defaults</button>
    </>
  );
}
