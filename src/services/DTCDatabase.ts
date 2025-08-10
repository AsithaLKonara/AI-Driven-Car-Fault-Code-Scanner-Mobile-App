import { DiagnosticTroubleCode } from '../types';

export interface DTCInfo {
  code: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  possibleCauses: string[];
  symptoms: string[];
  repairSteps: string[];
  estimatedCost: {
    min: number;
    max: number;
    currency: string;
  };
  safety: {
    safeToDrive: boolean;
    warning: string;
  };
}

class DTCDatabase {
  private dtcDatabase: Map<string, DTCInfo> = new Map();

  constructor() {
    this.initializeDatabase();
  }

  private initializeDatabase() {
    // P0xxx - Powertrain Codes
    this.addDTC({
      code: 'P0300',
      description: 'Random/Multiple Cylinder Misfire Detected',
      severity: 'high',
      category: 'Engine Misfire',
      possibleCauses: [
        'Faulty spark plugs or ignition coils',
        'Clogged fuel injectors',
        'Low fuel pressure',
        'Vacuum leaks',
        'Faulty oxygen sensors'
      ],
      symptoms: [
        'Engine runs rough or stalls',
        'Poor acceleration',
        'Increased fuel consumption',
        'Check Engine Light flashing'
      ],
      repairSteps: [
        'Check and replace spark plugs if worn',
        'Inspect ignition coils for damage',
        'Test fuel pressure and injectors',
        'Check for vacuum leaks',
        'Verify oxygen sensor operation'
      ],
      estimatedCost: { min: 100, max: 800, currency: 'USD' },
      safety: {
        safeToDrive: false,
        warning: 'Engine misfire can cause catalytic converter damage'
      }
    });

    this.addDTC({
      code: 'P0171',
      description: 'System Too Lean (Bank 1)',
      severity: 'medium',
      category: 'Fuel System',
      possibleCauses: [
        'Dirty or faulty mass airflow sensor',
        'Vacuum leaks',
        'Faulty oxygen sensor',
        'Clogged fuel filter',
        'Weak fuel pump'
      ],
      symptoms: [
        'Poor fuel economy',
        'Rough idle',
        'Lack of power',
        'Engine hesitation'
      ],
      repairSteps: [
        'Clean or replace MAF sensor',
        'Check for vacuum leaks',
        'Test oxygen sensor operation',
        'Replace fuel filter',
        'Test fuel pump pressure'
      ],
      estimatedCost: { min: 50, max: 400, currency: 'USD' },
      safety: {
        safeToDrive: true,
        warning: 'Can cause engine damage if left untreated'
      }
    });

    this.addDTC({
      code: 'P0172',
      description: 'System Too Rich (Bank 1)',
      severity: 'medium',
      category: 'Fuel System',
      possibleCauses: [
        'Faulty fuel pressure regulator',
        'Dirty fuel injectors',
        'Faulty oxygen sensor',
        'Clogged air filter',
        'Faulty MAF sensor'
      ],
      symptoms: [
        'Poor fuel economy',
        'Black smoke from exhaust',
        'Rough idle',
        'Engine hesitation'
      ],
      repairSteps: [
        'Check fuel pressure',
        'Clean fuel injectors',
        'Test oxygen sensor',
        'Replace air filter',
        'Clean MAF sensor'
      ],
      estimatedCost: { min: 50, max: 400, currency: 'USD' },
      safety: {
        safeToDrive: true,
        warning: 'Can cause catalytic converter damage'
      }
    });

    this.addDTC({
      code: 'P0420',
      description: 'Catalyst System Efficiency Below Threshold (Bank 1)',
      severity: 'medium',
      category: 'Emission Control',
      possibleCauses: [
        'Faulty catalytic converter',
        'Faulty oxygen sensor',
        'Engine misfire',
        'Fuel system problems',
        'Exhaust leaks'
      ],
      symptoms: [
        'Check Engine Light on',
        'May have no noticeable symptoms',
        'Failed emissions test'
      ],
      repairSteps: [
        'Check for engine misfires first',
        'Test oxygen sensor operation',
        'Inspect for exhaust leaks',
        'Replace catalytic converter if needed'
      ],
      estimatedCost: { min: 200, max: 1500, currency: 'USD' },
      safety: {
        safeToDrive: true,
        warning: 'Will fail emissions test'
      }
    });

    this.addDTC({
      code: 'P0442',
      description: 'Evaporative Emission Control System Leak Detected (Small Leak)',
      severity: 'low',
      category: 'Emission Control',
      possibleCauses: [
        'Loose or damaged gas cap',
        'Cracked or damaged fuel tank',
        'Faulty purge valve',
        'Damaged EVAP hoses',
        'Faulty charcoal canister'
      ],
      symptoms: [
        'Check Engine Light on',
        'May have no noticeable symptoms',
        'Failed emissions test'
      ],
      repairSteps: [
        'Check and tighten gas cap',
        'Inspect fuel tank for damage',
        'Test purge valve operation',
        'Check EVAP hoses for cracks',
        'Inspect charcoal canister'
      ],
      estimatedCost: { min: 20, max: 300, currency: 'USD' },
      safety: {
        safeToDrive: true,
        warning: 'Will fail emissions test'
      }
    });

    this.addDTC({
      code: 'P0506',
      description: 'Idle Control System RPM Lower Than Expected',
      severity: 'low',
      category: 'Idle Control',
      possibleCauses: [
        'Dirty throttle body',
        'Faulty idle air control valve',
        'Vacuum leaks',
        'Faulty throttle position sensor',
        'Carbon buildup in intake'
      ],
      symptoms: [
        'Rough idle',
        'Engine may stall at idle',
        'Poor idle quality'
      ],
      repairSteps: [
        'Clean throttle body',
        'Test idle air control valve',
        'Check for vacuum leaks',
        'Test throttle position sensor',
        'Clean intake system'
      ],
      estimatedCost: { min: 30, max: 200, currency: 'USD' },
      safety: {
        safeToDrive: true,
        warning: 'May cause stalling at stop lights'
      }
    });

    this.addDTC({
      code: 'P0700',
      description: 'Transmission Control System Malfunction',
      severity: 'high',
      category: 'Transmission',
      possibleCauses: [
        'Faulty transmission control module',
        'Wiring issues',
        'Faulty sensors',
        'Low transmission fluid',
        'Internal transmission problems'
      ],
      symptoms: [
        'Transmission shifting problems',
        'Check Engine Light on',
        'Poor performance',
        'Transmission may not shift'
      ],
      repairSteps: [
        'Check transmission fluid level',
        'Scan for transmission codes',
        'Inspect wiring and connectors',
        'Test transmission sensors',
        'Professional diagnosis recommended'
      ],
      estimatedCost: { min: 100, max: 2000, currency: 'USD' },
      safety: {
        safeToDrive: false,
        warning: 'Transmission failure may occur'
      }
    });

    this.addDTC({
      code: 'P1000',
      description: 'OBD System Readiness Test Not Complete',
      severity: 'low',
      category: 'System Readiness',
      possibleCauses: [
        'Battery recently disconnected',
        'ECU recently reset',
        'Insufficient drive cycles',
        'System not ready for testing'
      ],
      symptoms: [
        'Check Engine Light may be on',
        'No noticeable symptoms',
        'Will fail emissions test'
      ],
      repairSteps: [
        'Complete drive cycle (varies by vehicle)',
        'Drive vehicle normally for several days',
        'Ensure all systems are ready',
        'Retest after drive cycle completion'
      ],
      estimatedCost: { min: 0, max: 0, currency: 'USD' },
      safety: {
        safeToDrive: true,
        warning: 'Will fail emissions test until ready'
      }
    });

    // Add more common DTCs...
    this.addDTC({
      code: 'P0128',
      description: 'Coolant Thermostat Temperature Below Regulating Temperature',
      severity: 'medium',
      category: 'Cooling System',
      possibleCauses: [
        'Faulty thermostat',
        'Low coolant level',
        'Faulty coolant temperature sensor',
        'Cooling system leaks'
      ],
      symptoms: [
        'Engine runs cold',
        'Poor fuel economy',
        'Heater may not work properly',
        'Engine may not reach operating temperature'
      ],
      repairSteps: [
        'Check coolant level',
        'Test thermostat operation',
        'Test coolant temperature sensor',
        'Inspect for leaks'
      ],
      estimatedCost: { min: 50, max: 300, currency: 'USD' },
      safety: {
        safeToDrive: true,
        warning: 'Can cause poor fuel economy and emissions'
      }
    });

    this.addDTC({
      code: 'P0131',
      description: 'O2 Sensor Circuit Low Voltage (Bank 1 Sensor 1)',
      severity: 'medium',
      category: 'Oxygen Sensor',
      possibleCauses: [
        'Faulty oxygen sensor',
        'Wiring problems',
        'Faulty PCM',
        'Exhaust leaks',
        'Rich fuel mixture'
      ],
      symptoms: [
        'Poor fuel economy',
        'Rough idle',
        'Check Engine Light on',
        'Failed emissions test'
      ],
      repairSteps: [
        'Test oxygen sensor operation',
        'Check wiring and connectors',
        'Inspect for exhaust leaks',
        'Replace oxygen sensor if needed'
      ],
      estimatedCost: { min: 100, max: 400, currency: 'USD' },
      safety: {
        safeToDrive: true,
        warning: 'Will fail emissions test'
      }
    });
  }

  private addDTC(dtcInfo: DTCInfo) {
    this.dtcDatabase.set(dtcInfo.code, dtcInfo);
  }

  public getDTCInfo(code: string): DTCInfo | null {
    return this.dtcDatabase.get(code) || null;
  }

  public getDTCDescription(code: string): string {
    const dtcInfo = this.getDTCInfo(code);
    return dtcInfo ? dtcInfo.description : `Diagnostic Trouble Code ${code}`;
  }

  public getDTCSeverity(code: string): 'low' | 'medium' | 'high' | 'critical' {
    const dtcInfo = this.getDTCInfo(code);
    return dtcInfo ? dtcInfo.severity : 'low';
  }

  public getDTCCategory(code: string): string {
    const dtcInfo = this.getDTCInfo(code);
    return dtcInfo ? dtcInfo.category : 'Unknown';
  }

  public getDTCInfoForCodes(codes: string[]): DTCInfo[] {
    return codes
      .map(code => this.getDTCInfo(code))
      .filter((info): info is DTCInfo => info !== null);
  }

  public searchDTCs(query: string): DTCInfo[] {
    const results: DTCInfo[] = [];
    const lowerQuery = query.toLowerCase();
    
    for (const dtcInfo of this.dtcDatabase.values()) {
      if (
        dtcInfo.code.toLowerCase().includes(lowerQuery) ||
        dtcInfo.description.toLowerCase().includes(lowerQuery) ||
        dtcInfo.category.toLowerCase().includes(lowerQuery)
      ) {
        results.push(dtcInfo);
      }
    }
    
    return results;
  }

  public getPopularDTCs(): DTCInfo[] {
    const popularCodes = ['P0300', 'P0171', 'P0172', 'P0420', 'P0442', 'P0506'];
    return popularCodes
      .map(code => this.getDTCInfo(code))
      .filter((info): info is DTCInfo => info !== null);
  }
}

export const dtcDatabase = new DTCDatabase();
export default dtcDatabase; 