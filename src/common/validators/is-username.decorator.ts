import {
  registerDecorator,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ValidationOptions } from 'joi';

@ValidatorConstraint({ async: true })
class IsUsernameConstraint implements ValidatorConstraintInterface {
  async validate(value: string, _argument: ValidationArguments) {
    return /^[A-Za-z][\w.]{5,12}/.test(value);
  }

  defaultMessage(_argument: ValidationArguments) {
    return `Username tidak valid. Username harus diawali dengan huruf dan hanya boleh mengandung huruf, angka, titik, atau garis bawah. Panjang username harus antara 6 dan 13 karakter.`;
  }
}

export const IsUsername = (validationOptions?: ValidationOptions) => {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUsernameConstraint,
    });
  };
};
