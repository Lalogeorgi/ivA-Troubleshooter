import { PrismaService } from '../prisma/prisma.service';
export declare class InstrumentsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        manufacturer: string;
        model: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        manufacturer: string;
        model: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
