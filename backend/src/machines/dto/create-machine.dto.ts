import { IsNotEmpty, IsString, IsArray, IsOptional, IsUUID } from 'class-validator';

export class CreateMachineDto {
  @IsUUID()
  @IsNotEmpty()
  instrumentId: string;

  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @IsString()
  @IsNotEmpty()
  firmwareVersion: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  moduleIds?: string[];
}
