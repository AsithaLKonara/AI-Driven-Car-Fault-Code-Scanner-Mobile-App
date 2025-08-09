import { BleManager, Device, State } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';
import { OBDDevice, DiagnosticTroubleCode, LiveData, VehicleInfo, FreezeFrame } from '../types';

export class OBDService {
  private bleManager: BleManager;
  private connectedDevice: Device | null = null;
  private isScanning = false;
  private scanCallback?: (devices: OBDDevice[]) => void;
  private dataCallback?: (data: LiveData) => void;

  constructor() {
    this.bleManager = new BleManager();
  }

  // Initialize BLE and request permissions
  async initialize(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);

        const allPermissionsGranted = Object.values(granted).every(
          permission => permission === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allPermissionsGranted) {
          throw new Error('Bluetooth permissions not granted');
        }
      }

      const state = await this.bleManager.state();
      if (state !== State.PoweredOn) {
        throw new Error('Bluetooth is not enabled');
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize OBD service:', error);
      return false;
    }
  }

  // Scan for OBD-II devices
  async scanForDevices(callback: (devices: OBDDevice[]) => void): Promise<void> {
    if (this.isScanning) return;

    this.isScanning = true;
    this.scanCallback = callback;
    const discoveredDevices: Map<string, OBDDevice> = new Map();

    this.bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('Scan error:', error);
        this.stopScan();
        return;
      }

      if (device && device.name && this.isOBDDevice(device.name)) {
        const obdDevice: OBDDevice = {
          id: device.id,
          name: device.name,
          address: device.id, // BLE uses device ID as address
          isConnected: false,
        };

        discoveredDevices.set(device.id, obdDevice);
        callback(Array.from(discoveredDevices.values()));
      }
    });

    // Stop scanning after 30 seconds
    setTimeout(() => {
      if (this.isScanning) {
        this.stopScan();
      }
    }, 30000);
  }

  // Stop scanning for devices
  stopScan(): void {
    if (this.isScanning) {
      this.bleManager.stopDeviceScan();
      this.isScanning = false;
    }
  }

  // Connect to an OBD-II device
  async connect(deviceId: string): Promise<boolean> {
    try {
      const device = await this.bleManager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      
      this.connectedDevice = device;
      
      // Initialize OBD-II communication
      await this.sendCommand('ATZ'); // Reset
      await this.sendCommand('ATE0'); // Echo off
      await this.sendCommand('ATL0'); // Line feeds off
      await this.sendCommand('ATS0'); // Spaces off
      await this.sendCommand('ATH1'); // Headers on
      await this.sendCommand('ATSP0'); // Auto protocol

      return true;
    } catch (error) {
      console.error('Connection failed:', error);
      return false;
    }
  }

  // Disconnect from current device
  async disconnect(): Promise<void> {
    if (this.connectedDevice) {
      try {
        await this.connectedDevice.cancelConnection();
      } catch (error) {
        console.error('Disconnect error:', error);
      }
      this.connectedDevice = null;
    }
  }

  // Check if connected
  isConnected(): boolean {
    return this.connectedDevice !== null;
  }

  // Read Diagnostic Trouble Codes
  async readDTCs(): Promise<DiagnosticTroubleCode[]> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    try {
      const storedCodes = await this.sendCommand('03'); // Read stored DTCs
      const pendingCodes = await this.sendCommand('07'); // Read pending DTCs
      
      const dtcs: DiagnosticTroubleCode[] = [];
      
      // Parse stored codes
      const storedParsed = this.parseDTCs(storedCodes, 'stored');
      dtcs.push(...storedParsed);
      
      // Parse pending codes
      const pendingParsed = this.parseDTCs(pendingCodes, 'pending');
      dtcs.push(...pendingParsed);

      return dtcs;
    } catch (error) {
      console.error('Failed to read DTCs:', error);
      throw error;
    }
  }

  // Clear Diagnostic Trouble Codes
  async clearDTCs(): Promise<boolean> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    try {
      const response = await this.sendCommand('04'); // Clear DTCs
      return response.includes('44') || response.includes('OK');
    } catch (error) {
      console.error('Failed to clear DTCs:', error);
      return false;
    }
  }

  // Read Vehicle Information
  async readVehicleInfo(): Promise<VehicleInfo | null> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    try {
      const vinResponse = await this.sendCommand('0902'); // Request VIN
      const vin = this.parseVIN(vinResponse);
      
      if (!vin) return null;

      // For demo purposes, we'll simulate vehicle info lookup
      // In a real app, you'd use the VIN to lookup vehicle details from a database
      return {
        vin,
        make: 'Unknown',
        model: 'Unknown',
        year: 2020,
        engine: 'Unknown',
        transmission: 'Unknown',
      };
    } catch (error) {
      console.error('Failed to read vehicle info:', error);
      return null;
    }
  }

  // Start live data monitoring
  async startLiveData(callback: (data: LiveData) => void): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    this.dataCallback = callback;
    this.monitorLiveData();
  }

  // Stop live data monitoring
  stopLiveData(): void {
    this.dataCallback = undefined;
  }

  // Read freeze frame data
  async readFreezeFrames(): Promise<FreezeFrame[]> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    try {
      const response = await this.sendCommand('02'); // Read freeze frame data
      return this.parseFreezeFrames(response);
    } catch (error) {
      console.error('Failed to read freeze frames:', error);
      return [];
    }
  }

  // Private helper methods

  private isOBDDevice(name: string): boolean {
    const obdKeywords = ['obd', 'elm327', 'obdii', 'elm', 'scan'];
    return obdKeywords.some(keyword => 
      name.toLowerCase().includes(keyword)
    );
  }

  private async sendCommand(command: string): Promise<string> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    try {
      // This is a simplified implementation
      // In a real app, you'd need to find the correct service and characteristic UUIDs
      // for your specific OBD-II adapter
      const serviceUUID = '0000fff0-0000-1000-8000-00805f9b34fb';
      const characteristicUUID = '0000fff1-0000-1000-8000-00805f9b34fb';
      
      const commandWithCR = command + '\r';
      const encodedCommand = Buffer.from(commandWithCR, 'utf8').toString('base64');
      
      await this.connectedDevice.writeCharacteristicWithoutResponseForService(
        serviceUUID,
        characteristicUUID,
        encodedCommand
      );

      // Wait for response
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await this.connectedDevice.readCharacteristicForService(
        serviceUUID,
        characteristicUUID
      );

      return Buffer.from(response.value || '', 'base64').toString('utf8');
    } catch (error) {
      console.error('Command failed:', command, error);
      throw error;
    }
  }

  private parseDTCs(response: string, type: string): DiagnosticTroubleCode[] {
    const dtcs: DiagnosticTroubleCode[] = [];
    
    // Simplified DTC parsing - in a real app, you'd have a comprehensive DTC database
    const dtcPattern = /([PBCU]\d{4})/g;
    const matches = response.match(dtcPattern);
    
    if (matches) {
      matches.forEach(code => {
        dtcs.push({
          code,
          description: this.getDTCDescription(code),
          severity: this.getDTCSeverity(code),
          category: this.getDTCCategory(code),
        });
      });
    }

    return dtcs;
  }

  private parseVIN(response: string): string | null {
    // Simplified VIN parsing
    const vinMatch = response.match(/49\s*02\s*01\s*([A-HJ-NPR-Z0-9]{17})/);
    return vinMatch ? vinMatch[1] : null;
  }

  private parseFreezeFrames(response: string): FreezeFrame[] {
    // Simplified freeze frame parsing
    // In a real implementation, you'd parse the actual freeze frame data
    return [];
  }

  private async monitorLiveData(): Promise<void> {
    if (!this.dataCallback || !this.connectedDevice) return;

    try {
      // Read various PIDs for live data
      const rpmResponse = await this.sendCommand('010C'); // Engine RPM
      const speedResponse = await this.sendCommand('010D'); // Vehicle speed
      const coolantResponse = await this.sendCommand('0105'); // Coolant temperature
      const throttleResponse = await this.sendCommand('0111'); // Throttle position
      
      const liveData: LiveData = {
        timestamp: Date.now(),
        rpm: this.parseRPM(rpmResponse),
        speed: this.parseSpeed(speedResponse),
        coolantTemp: this.parseCoolantTemp(coolantResponse),
        throttlePosition: this.parseThrottlePosition(throttleResponse),
        fuelLevel: 0, // Would need additional PID requests
        engineLoad: 0,
        intakeAirTemp: 0,
        fuelPressure: 0,
        oxygenSensor: 0,
      };

      this.dataCallback(liveData);

      // Continue monitoring
      setTimeout(() => this.monitorLiveData(), 1000);
    } catch (error) {
      console.error('Live data monitoring error:', error);
    }
  }

  private parseRPM(response: string): number {
    // Parse RPM from PID 0C response
    const match = response.match(/41\s*0C\s*([0-9A-F]{2})\s*([0-9A-F]{2})/);
    if (match) {
      const a = parseInt(match[1], 16);
      const b = parseInt(match[2], 16);
      return (a * 256 + b) / 4;
    }
    return 0;
  }

  private parseSpeed(response: string): number {
    // Parse speed from PID 0D response
    const match = response.match(/41\s*0D\s*([0-9A-F]{2})/);
    return match ? parseInt(match[1], 16) : 0;
  }

  private parseCoolantTemp(response: string): number {
    // Parse coolant temperature from PID 05 response
    const match = response.match(/41\s*05\s*([0-9A-F]{2})/);
    return match ? parseInt(match[1], 16) - 40 : 0;
  }

  private parseThrottlePosition(response: string): number {
    // Parse throttle position from PID 11 response
    const match = response.match(/41\s*11\s*([0-9A-F]{2})/);
    return match ? (parseInt(match[1], 16) * 100) / 255 : 0;
  }

  private getDTCDescription(code: string): string {
    // Simplified DTC descriptions - in a real app, you'd have a comprehensive database
    const descriptions: { [key: string]: string } = {
      'P0300': 'Random/Multiple Cylinder Misfire Detected',
      'P0301': 'Cylinder 1 Misfire Detected',
      'P0302': 'Cylinder 2 Misfire Detected',
      'P0420': 'Catalyst System Efficiency Below Threshold',
      'P0171': 'System Too Lean (Bank 1)',
      'P0174': 'System Too Lean (Bank 2)',
    };
    return descriptions[code] || 'Unknown diagnostic trouble code';
  }

  private getDTCSeverity(code: string): 'low' | 'medium' | 'high' | 'critical' {
    // Simplified severity assessment
    if (code.startsWith('P03')) return 'critical'; // Ignition system
    if (code.startsWith('P02')) return 'high'; // Fuel system
    if (code.startsWith('P01')) return 'medium'; // Fuel/air metering
    return 'low';
  }

  private getDTCCategory(code: string): string {
    const categories: { [key: string]: string } = {
      'P0': 'Powertrain',
      'P1': 'Powertrain (Manufacturer Specific)',
      'P2': 'Powertrain',
      'P3': 'Powertrain',
      'B0': 'Body',
      'B1': 'Body (Manufacturer Specific)',
      'C0': 'Chassis',
      'C1': 'Chassis (Manufacturer Specific)',
      'U0': 'Network',
      'U1': 'Network (Manufacturer Specific)',
    };
    
    const prefix = code.substring(0, 2);
    return categories[prefix] || 'Unknown';
  }
}

export const obdService = new OBDService(); 