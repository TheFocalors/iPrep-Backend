import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: true })
class isNIKContraint implements ValidatorConstraintInterface {
  async validate(value: string, _argument: ValidationArguments) {
    return /^(1[1-9]|21|[37][1-6]|5[1-3]|6[1-5]|[89][12])\d{2}\d{2}([04][1-9]|[1256][0-9]|[37][01])(0[1-9]|1[0-2])\d{2}\d{4}$/.test(
      value,
    );
  }

  defaultMessage(_argument: ValidationArguments) {
    return `NIK harus valid`;
  }
}

export const IsNIK = (validationOptions?: ValidationOptions) => {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: isNIKContraint,
    });
  };
};
