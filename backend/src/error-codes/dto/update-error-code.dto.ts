import { PartialType } from '@nestjs/mapped-types';
import { CreateErrorCodeDto } from './create-error-code.dto';

export class UpdateErrorCodeDto extends PartialType(CreateErrorCodeDto) {}
