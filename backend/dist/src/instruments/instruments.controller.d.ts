import { InstrumentsService } from './instruments.service';
export declare class InstrumentsController {
    private readonly instrumentsService;
    constructor(instrumentsService: InstrumentsService);
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
