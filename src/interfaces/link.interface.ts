import { Country } from './country.interface';

export interface CountryLink extends Country {
  href?: string;
}
