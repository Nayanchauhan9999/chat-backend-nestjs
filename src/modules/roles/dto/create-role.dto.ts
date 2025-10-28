import { IsNotEmptyObjectConstraints } from './../../../utils/constraints';
import {
  IsDefined,
  IsNotEmpty,
  IsObject,
  IsOptional,
  Validate,
} from 'class-validator';

export class CreateRoleDto {
  @IsDefined({ message: 'Role Name is required' })
  @IsNotEmpty()
  roleName: string;

  @IsDefined({ message: 'Permissions is required' })
  @IsObject({ message: 'Permission should be object' })
  @Validate(IsNotEmptyObjectConstraints)
  permission: object;

  @IsOptional()
  status: object;
}
