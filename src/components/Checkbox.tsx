import { ChangeEvent, useState } from 'react';
import { noop } from 'rxjs';

export interface CheckboxValue {
  checked: boolean;
  value: string;
}

interface Props {
  label: string;
  value: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (value: CheckboxValue) => void;
}
export function Checkbox({label, value, checked, disabled = false, onChange = noop}: Props) {
  const [chkd, setChkd] = useState(checked);

  function handleChecked(event: ChangeEvent<HTMLInputElement>) {
    const checked = event.target.checked;
    setChkd(checked);
    onChange({checked, value});
  }
  return <label>
    <input type="checkbox" checked={chkd} value={value} disabled={disabled} onChange={handleChecked}/>
    {label}
  </label>
}
