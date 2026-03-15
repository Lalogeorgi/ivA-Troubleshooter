const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Instrument {
  id: string;
  manufacturer: string;
  model: string;
  description?: string;
}

export interface Module {
  id: string;
  name: string;
  description?: string;
}

export interface Machine {
  id: string;
  instrumentId: string;
  serialNumber: string;
  firmwareVersion: string;
  instrument?: Instrument;
  modules?: { module: Module }[];
}

export interface InterventionSession {
  id: string;
  machineId: string;
  engineerName: string;
  notes?: string;
  machine?: Machine;
}

export async function fetchInstruments(): Promise<Instrument[]> {
  const response = await fetch(`${API_URL}/instruments`);
  if (!response.ok) throw new Error('Failed to fetch instruments');
  return response.json();
}

export async function fetchModules(): Promise<Module[]> {
  const response = await fetch(`${API_URL}/modules`);
  if (!response.ok) throw new Error('Failed to fetch modules');
  return response.json();
}

export async function createMachine(data: {
  instrumentId: string;
  serialNumber: string;
  firmwareVersion: string;
  moduleIds: string[];
}): Promise<Machine> {
  const response = await fetch(`${API_URL}/machines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create machine');
  return response.json();
}

export async function createInterventionSession(data: {
  machineId: string;
  engineerName: string;
  notes?: string;
}): Promise<InterventionSession> {
  const response = await fetch(`${API_URL}/intervention-sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create session');
  return response.json();
}
