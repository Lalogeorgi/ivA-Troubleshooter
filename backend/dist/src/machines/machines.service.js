"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MachinesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MachinesService = class MachinesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async upsert(createMachineDto) {
        const { instrumentId, serialNumber, firmwareVersion, moduleIds } = createMachineDto;
        const instrument = await this.prisma.instrument.findUnique({
            where: { id: instrumentId },
        });
        if (!instrument) {
            throw new common_1.NotFoundException(`Instrument with ID ${instrumentId} not found`);
        }
        const machine = await this.prisma.machine.upsert({
            where: { serialNumber },
            update: {
                firmwareVersion,
                instrumentId,
            },
            create: {
                serialNumber,
                firmwareVersion,
                instrumentId,
            },
        });
        if (moduleIds && moduleIds.length > 0) {
            await this.prisma.machineModule.deleteMany({
                where: { machineId: machine.id },
            });
            await this.prisma.machineModule.createMany({
                data: moduleIds.map((moduleId) => ({
                    machineId: machine.id,
                    moduleId,
                })),
            });
        }
        return this.prisma.machine.findUnique({
            where: { id: machine.id },
            include: {
                instrument: true,
                modules: {
                    include: {
                        module: true,
                    },
                },
            },
        });
    }
    async findOne(id) {
        const machine = await this.prisma.machine.findUnique({
            where: { id },
            include: {
                instrument: true,
                modules: {
                    include: {
                        module: true,
                    },
                },
            },
        });
        if (!machine) {
            throw new common_1.NotFoundException(`Machine with ID ${id} not found`);
        }
        return machine;
    }
};
exports.MachinesService = MachinesService;
exports.MachinesService = MachinesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MachinesService);
//# sourceMappingURL=machines.service.js.map