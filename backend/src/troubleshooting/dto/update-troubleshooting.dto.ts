import { PartialType } from '@nestjs/mapped-types';
import { CreateTroubleshootingDto } from './create-troubleshooting.dto';

export class UpdateTroubleshootingDto extends PartialType(
  CreateTroubleshootingDto,
) {}
