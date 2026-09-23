import { Injectable, Logger } from '@nestjs/common';
import { ILlmProvider, LlmGenerationOptions } from '../llm-provider.interface';

@Injectable()
export class MockProvider implements ILlmProvider {
  readonly name = 'mock';
  readonly model = 'biomed-deterministic-v1';
  private readonly logger = new Logger(MockProvider.name);

  async generateText(prompt: string, options?: LlmGenerationOptions): Promise<string> {
    this.logger.log('MockProvider generating deterministic diagnostic text...');
    return (
      'Deterministic Clinical Service Diagnostic:\n\n' +
      'Based on the reported symptoms and error code telemetry, the fluidics baseline manifold ' +
      'pressure has fallen below the 114.0 kPa minimum operating threshold. Recommended action is to ' +
      'verify line pressure with digital manometer 948-CAL-01 at test port TP-FL-01, then inspect Pump P-102 ' +
      'plunger wash seal for wear and replace using kit SP-948-230-01 per Service Bulletin SB-2026-014.'
    );
  }

  async generateStructured<T>(prompt: string, options?: LlmGenerationOptions): Promise<T> {
    this.logger.log('MockProvider synthesizing structured diagnostic analysis...');

    // Extract query hints from prompt
    const hasE1045 = prompt.includes('E1045') || prompt.toLowerCase().includes('pressure');
    
    const mockOutput = {
      summary: hasE1045
        ? 'Fluidics manifold hydraulic instability triggered by low pressure (< 114.0 kPa) during aspiration cycle.'
        : 'General diagnostic assessment for BioMed clinical analyzer.',
      confidenceScore: 0.94,
      documentedFacts: [
        {
          statement: 'Nominal manifold baseline pressure is 120.0 kPa ± 5% (114.0 to 126.0 kPa).',
          source: 'Analyzer X200 Service Manual, Chapter 2, Page 2',
          pageNumber: 2,
        },
        {
          statement: 'Mandatory replacement of Pump P-102 seals with Kalrez kit SP-948-230-01 for instruments on FW 4.2+.',
          source: 'Service Bulletin SB-2026-014, Page 4',
          pageNumber: 4,
        },
      ],
      historicalObservations: [
        {
          observation: 'Failure mode FM-FLUIDICS-PRESSURE-DROP has an occurrence rating of 4 and RPN of 56 in high-throughput labs.',
          confidence: 'High',
        },
      ],
      deterministicRules: [
        {
          rule: 'Manifold pressure < 114.0 kPa triggers immediate cycle abort and error E1045.',
          status: 'VIOLATED',
        },
        {
          rule: 'Sensor zero offset must not exceed ± 1.2 kPa.',
          status: 'CHECK_REQUIRED',
        },
      ],
      aiHypotheses: [
        {
          hypothesis: 'Primary Root Cause: Mechanical seal bypass in Syringe Dispense Pump P-102.',
          probability: 0.72,
          reasoning: 'Continuous duty cycles cause Viton seals to fissure under FW 4.2+ aspiration speeds.',
        },
        {
          hypothesis: 'Secondary Root Cause: Thermal zero-offset drift in Pressure Transducer PS-23.',
          probability: 0.28,
          reasoning: 'Legacy pre-2025Q3 transducers exhibit drift when internal bay temperature exceeds 34°C.',
        },
      ],
      safetyAlerts: [
        {
          level: 'BIOHAZARD',
          directive: 'Wear full PPE (double nitrile gloves, eye protection). Flush lines with 0.5% bleach before disconnecting fittings.',
        },
      ],
      actionPlan: [
        {
          stepNumber: 1,
          action: 'Initiate Hydraulic Depressurization from Service Utilities console.',
          requiresFseApproval: false,
        },
        {
          stepNumber: 2,
          action: 'Connect digital manometer 948-CAL-01 to test port TP-FL-01 and verify zero reading.',
          requiresFseApproval: false,
        },
        {
          stepNumber: 3,
          action: 'Execute 5 dispense sweeps and record physical vs telemetry pressure divergence.',
          requiresFseApproval: false,
        },
        {
          stepNumber: 4,
          action: 'Replace Pump P-102 plunger seal kit with upgraded part SP-948-230-01.',
          requiresFseApproval: true,
          partNumber: 'SP-948-230-01',
        },
      ],
    };

    return mockOutput as unknown as T;
  }
}
