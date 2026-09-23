import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditEventDto {
  caseId?: string;
  actionType: string;
  performedBy: string;
  details: Record<string, any>;
}

@Injectable()
export class ComplianceAuditService {
  private readonly logger = new Logger(ComplianceAuditService.name);
  private readonly GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Append a tamper-evident audit entry using cryptographic SHA-256 hash chaining
   * in compliance with FDA 21 CFR Part 11 requirements.
   */
  async recordEvent(caseId: string | null, actionType: string, performedBy: string, details: Record<string, any>) {
    // 1. Get the latest audit entry in the sequence
    const latest = await this.prisma.complianceAuditEntry.findFirst({
      orderBy: { sequenceNumber: 'desc' },
    });

    const previousHash = latest ? latest.currentHash : this.GENESIS_HASH;
    const timestamp = new Date();

    // 2. Compute current hash: SHA256(previousHash + actionType + performedBy + details + timestamp)
    const payload = `${previousHash}|${actionType}|${performedBy}|${JSON.stringify(details)}|${timestamp.toISOString()}`;
    const currentHash = crypto.createHash('sha256').update(payload).digest('hex');

    const entry = await this.prisma.complianceAuditEntry.create({
      data: {
        caseId: caseId || undefined,
        actionType,
        performedBy,
        details,
        previousHash,
        currentHash,
        timestamp,
      },
    });

    this.logger.log(`Audit Event #${entry.sequenceNumber} [${actionType}] recorded. Hash: ${currentHash.substring(0, 16)}...`);
    return entry;
  }

  /**
   * Retrieve audit trail for a specific case or overall system
   */
  async getAuditTrail(caseId?: string) {
    return this.prisma.complianceAuditEntry.findMany({
      where: caseId ? { caseId } : undefined,
      orderBy: { sequenceNumber: 'asc' },
    });
  }

  /**
   * Cryptographically verify the integrity of the audit chain
   */
  async verifyChainIntegrity(): Promise<{ valid: boolean; totalEntries: number; tamperedSequenceNumber?: number; error?: string }> {
    const entries = await this.prisma.complianceAuditEntry.findMany({
      orderBy: { sequenceNumber: 'asc' },
    });

    if (entries.length === 0) {
      return { valid: true, totalEntries: 0 };
    }

    let expectedPrevHash = this.GENESIS_HASH;

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      // Check link to previous hash
      if (entry.previousHash !== expectedPrevHash) {
        return {
          valid: false,
          totalEntries: entries.length,
          tamperedSequenceNumber: entry.sequenceNumber,
          error: `Broken chain at sequence #${entry.sequenceNumber}: previousHash mismatch. Expected ${expectedPrevHash}, found ${entry.previousHash}`,
        };
      }

      // Recompute and verify currentHash
      const payload = `${entry.previousHash}|${entry.actionType}|${entry.performedBy}|${JSON.stringify(entry.details)}|${entry.timestamp.toISOString()}`;
      const recomputedHash = crypto.createHash('sha256').update(payload).digest('hex');

      if (entry.currentHash !== recomputedHash) {
        return {
          valid: false,
          totalEntries: entries.length,
          tamperedSequenceNumber: entry.sequenceNumber,
          error: `Tamper detected at sequence #${entry.sequenceNumber}: record content has been altered. Recomputed hash ${recomputedHash} != stored ${entry.currentHash}`,
        };
      }

      expectedPrevHash = entry.currentHash;
    }

    return {
      valid: true,
      totalEntries: entries.length,
    };
  }
}
