/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isNotEmptyObject', async: false })
export class IsNotEmptyObjectConstraints
  implements ValidatorConstraintInterface
{
  validate(value: any): boolean {
    return value && typeof value === 'object' && Object.keys(value).length > 0;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return validationArguments?.property + ' can not be empty';
  }
}
