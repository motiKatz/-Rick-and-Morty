import { ValidatorFn, FormControl } from '@angular/forms';
export const initFormControl = <T>(
  value: T,
  validator: ValidatorFn | null
): FormControl => {
  return new FormControl<T>(value, validator);
};
