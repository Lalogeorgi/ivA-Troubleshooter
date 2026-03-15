import { MachinesService } from './machines.service';
import { CreateMachineDto } from './dto/create-machine.dto';
export declare class MachinesController {
    private readonly machinesService;
    constructor(machinesService: MachinesService);
    create(createMachineDto: CreateMachineDto): Promise<({
        instrument: {
            id: string;
            manufacturer: string;
            model: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        modules: ({
            module: {
                id: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            machineId: string;
            moduleId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        instrumentId: string;
        serialNumber: string;
        firmwareVersion: string;
        installationDate: Date | null;
    }) | null>;
    findOne(id: string): Promise<{
        instrument: {
            id: string;
            manufacturer: string;
            model: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        modules: ({
            module: {
                id: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            machineId: string;
            moduleId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        instrumentId: string;
        serialNumber: string;
        firmwareVersion: string;
        installationDate: Date | null;
    }>;
}
