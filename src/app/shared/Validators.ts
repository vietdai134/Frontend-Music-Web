// src/app/shared/validators/validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function minSelectionValidator(min: number = 1): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string[];
    return value && value.length >= min ? null : { minSelection: { required: min, actual: value?.length || 0 } };
  };
}