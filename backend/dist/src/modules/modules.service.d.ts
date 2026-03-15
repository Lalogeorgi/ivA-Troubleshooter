import { PrismaService } from '../prisma/prisma.service';
export declare class ModulesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
    }[]>;
}
