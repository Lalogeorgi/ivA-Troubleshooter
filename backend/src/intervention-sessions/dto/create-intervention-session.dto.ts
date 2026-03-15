import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateInterventionSessionDto {
  @IsUUID()
  @IsNotEmpty()
  machineId: string;

  @IsString()
  @IsNotEmpty()
  engineerName: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
