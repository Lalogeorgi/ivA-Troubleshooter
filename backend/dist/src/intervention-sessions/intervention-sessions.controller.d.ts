import { InterventionSessionsService } from './intervention-sessions.service';
import { CreateInterventionSessionDto } from './dto/create-intervention-session.dto';
export declare class InterventionSessionsController {
    private readonly interventionSessionsService;
    constructor(interventionSessionsService: InterventionSessionsService);
    create(createDto: CreateInterventionSessionDto): Promise<{
        machine: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        machineId: string;
        engineerName: string;
        notes: string | null;
        startedAt: Date;
    }>;
    findOne(id: string): Promise<{
        machine: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        machineId: string;
        engineerName: string;
        notes: string | null;
        startedAt: Date;
    }>;
}
