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
exports.InterventionSessionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let InterventionSessionsService = class InterventionSessionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createDto) {
        const { machineId, engineerName, notes } = createDto;
        const machine = await this.prisma.machine.findUnique({
            where: { id: machineId },
        });
        if (!machine) {
            throw new common_1.NotFoundException(`Machine with ID ${machineId} not found`);
        }
        return this.prisma.interventionSession.create({
            data: {
                machineId,
                engineerName,
                notes,
            },
            include: {
                machine: {
                    include: {
                        instrument: true,
                        modules: {
                            include: {
                                module: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async findOne(id) {
        const session = await this.prisma.interventionSession.findUnique({
            where: { id },
            include: {
                machine: {
                    include: {
                        instrument: true,
                        modules: {
                            include: {
                                module: true,
                            },
                        },
                    },
                },
            },
        });
        if (!session) {
            throw new common_1.NotFoundException(`Intervention session with ID ${id} not found`);
        }
        return session;
    }
};
exports.InterventionSessionsService = InterventionSessionsService;
exports.InterventionSessionsService = InterventionSessionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InterventionSessionsService);
//# sourceMappingURL=intervention-sessions.service.js.map