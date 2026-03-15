import { Injectable } from '@nestjs/common';
import { CreateErrorCodeDto } from './dto/create-error-code.dto';
import { UpdateErrorCodeDto } from './dto/update-error-code.dto';

@Injectable()
export class ErrorCodesService {
  create(createErrorCodeDto: CreateErrorCodeDto) {
    return 'This action adds a new errorCode';
  }

  findAll() {
    return `This action returns all errorCodes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} errorCode`;
  }

  update(id: number, updateErrorCodeDto: UpdateErrorCodeDto) {
    return `This action updates a #${id} errorCode`;
  }

  remove(id: number) {
    return `This action removes a #${id} errorCode`;
  }
}
