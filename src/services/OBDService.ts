import { BleManager, Device, State, Characteristic } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';
import { OBDDevice, DiagnosticTroubleCode, LiveData, VehicleInfo, FreezeFrame } from '../types';
import { dtcDatabase } from './DTCDatabase';

export class OBDService {
  private bleManager: BleManager;
  private connectedDevice: Device | null = null;
  private writeCharacteristic: Characteristic | null = null;
  private notifyCharacteristic: Characteristic | null = null;
  private isScanning = false;
  private scanCallback?: (devices: OBDDevice[]) => void;
  private dataCallback?: (data: LiveData) => void;
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  // OBD-II Service and Characteristic UUIDs (standard BLE OBD-II)
  private readonly OBD_SERVICE_UUID = 'FFE0';
  private readonly OBD_WRITE_UUID = 'FFE1';
  private readonly OBD_NOTIFY_UUID = 'FFE2';

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
          address: device.id,
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
      
      // Find OBD service and characteristics
      const services = await device.services();
      const obdService = services.find(service => 
        service.uuid.toUpperCase().includes(this.OBD_SERVICE_UUID) ||
        service.uuid.toUpperCase().includes('180D') // Generic BLE service
      );

      if (!obdService) {
        throw new Error('OBD-II service not found');
      }

      const characteristics = await obdService.characteristics();
      
      // Find write characteristic
      this.writeCharacteristic = characteristics.find(char => 
        char.isWritableWithResponse || char.isWritableWithoutResponse
      ) || null;

      // Find notify characteristic
      this.notifyCharacteristic = characteristics.find(char => 
        char.isNotifiable || char.isIndicatable
      ) || null;

      if (!this.writeCharacteristic) {
        throw new Error('Write characteristic not found');
      }

      // Initialize OBD-II communication
      await this.sendCommand('ATZ'); // Reset
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await this.sendCommand('ATE0'); // Echo off
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await this.sendCommand('ATL0'); // Linefeeds off
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await this.sendCommand('ATS0'); // Spaces off
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await this.sendCommand('ATH0'); // Headers off
      await new Promise(resolve => setTimeout(resolve, 500));

      return true;
    } catch (error) {
      console.error('Failed to connect to device:', error);
      this.connectedDevice = null;
      this.writeCharacteristic = null;
      this.notifyCharacteristic = null;
      return false;
    }
  }

  // Disconnect from device
  async disconnect(): Promise<void> {
    if (this.connectedDevice) {
      await this.connectedDevice.cancelConnection();
      this.connectedDevice = null;
      this.writeCharacteristic = null;
      this.notifyCharacteristic = null;
      this.stopLiveData();
    }
  }

  // Check if connected
  isConnected(): boolean {
    return this.connectedDevice !== null && this.writeCharacteristic !== null;
  }

  // Read Diagnostic Trouble Codes
  async readDTCs(): Promise<DiagnosticTroubleCode[]> {
    if (!this.isConnected()) {
      throw new Error('Not connected to OBD device');
    }

    try {
      // Read stored DTCs
      const storedResponse = await this.sendCommand('03');
      const storedDTCs = this.parseDTCs(storedResponse, 'stored');
      
      // Read pending DTCs
      const pendingResponse = await this.sendCommand('07');
      const pendingDTCs = this.parseDTCs(pendingResponse, 'pending');
      
      // Read permanent DTCs
      const permanentResponse = await this.sendCommand('0A');
      const permanentDTCs = this.parseDTCs(permanentResponse, 'permanent');

      return [...storedDTCs, ...pendingDTCs, ...permanentDTCs];
    } catch (error) {
      console.error('Failed to read DTCs:', error);
      return [];
    }
  }

  // Clear Diagnostic Trouble Codes
  async clearDTCs(): Promise<boolean> {
    if (!this.isConnected()) {
      throw new Error('Not connected to OBD device');
    }

    try {
      const response = await this.sendCommand('04');
      return response.includes('OK') || response.includes('44');
    } catch (error) {
      console.error('Failed to clear DTCs:', error);
      return false;
    }
  }

  // Read vehicle information
  async readVehicleInfo(): Promise<VehicleInfo | null> {
    if (!this.isConnected()) {
      throw new Error('Not connected to OBD device');
    }

    try {
      // Read VIN
      const vinResponse = await this.sendCommand('0902');
      const vin = this.parseVIN(vinResponse);
      
      // Read ECU name
      const ecuResponse = await this.sendCommand('090A');
      const ecuName = this.parseECUName(ecuResponse);
      
      // Read calibration ID
      const calResponse = await this.sendCommand('0909');
      const calibrationId = this.parseCalibrationId(calResponse);

      return {
        vin: vin || 'Unknown',
        make: 'Unknown', // Would need VIN decoder service
        model: 'Unknown',
        year: 0,
        engine: 'Unknown',
        transmission: 'Unknown',
        ecuName: ecuName || 'Unknown',
        calibrationId: calibrationId || 'Unknown',
      };
    } catch (error) {
      console.error('Failed to read vehicle info:', error);
      return null;
    }
  }

  // Start live data monitoring
  async startLiveData(callback: (data: LiveData) => void): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Not connected to OBD device');
    }

    this.dataCallback = callback;
    this.isMonitoring = true;
    
    // Start monitoring loop
    this.monitorLiveData();
  }

  // Stop live data monitoring
  stopLiveData(): void {
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  // Read freeze frames
  async readFreezeFrames(): Promise<FreezeFrame[]> {
    if (!this.isConnected()) {
      throw new Error('Not connected to OBD device');
    }

    try {
      const response = await this.sendCommand('0202');
      return this.parseFreezeFrames(response);
    } catch (error) {
      console.error('Failed to read freeze frames:', error);
      return [];
    }
  }

  // Check emission readiness
  async checkEmissionReadiness(): Promise<{ [key: string]: boolean }> {
    if (!this.isConnected()) {
      throw new Error('Not connected to OBD device');
    }

    try {
      const response = await this.sendCommand('0101');
      // Parse readiness response
      return this.parseEmissionReadiness(response);
    } catch (error) {
      console.error('Failed to check emission readiness:', error);
      return {};
    }
  }

  // Private methods
  private isOBDDevice(name: string): boolean {
    const obdKeywords = [
      'OBD', 'ELM327', 'Bluetooth', 'WiFi', 'Adapter', 'Scanner',
      'Diagnostic', 'Car', 'Vehicle', 'Auto', 'Scan'
    ];
    
    return obdKeywords.some(keyword => 
      name.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private async sendCommand(command: string): Promise<string> {
    if (!this.writeCharacteristic) {
      throw new Error('Write characteristic not available');
    }

    try {
      // Add carriage return and line feed
      const fullCommand = command + '\r\n';
      const data = Buffer.from(fullCommand, 'utf8').toString('base64');
      
      await this.writeCharacteristic.writeWithResponse(data);
      
      // Wait for response
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Command timeout'));
        }, 5000);

        // Listen for response on notify characteristic
        if (this.notifyCharacteristic) {
          this.notifyCharacteristic.monitor((error, characteristic) => {
            if (error) {
              clearTimeout(timeout);
              reject(error);
              return;
            }

            if (characteristic && characteristic.value) {
              const response = Buffer.from(characteristic.value, 'base64').toString('utf8');
              clearTimeout(timeout);
              resolve(response.trim());
            }
          });
        } else {
          // Fallback: wait a bit and return empty response
          setTimeout(() => {
            clearTimeout(timeout);
            resolve('OK');
          }, 1000);
        }
      });
    } catch (error) {
      console.error(`Failed to send command ${command}:`, error);
      throw error;
    }
  }

  private parseDTCs(response: string, type: string): DiagnosticTroubleCode[] {
    const dtcs: DiagnosticTroubleCode[] = [];
    
    // Remove spaces and newlines
    const cleanResponse = response.replace(/[\s\n\r]/g, '');
    
    // Parse response format: 43 01 33 01 34 01 35 01
    if (cleanResponse.length >= 4) {
      const dataLength = parseInt(cleanResponse.substring(2, 4), 16);
      const dataStart = 4;
      
      for (let i = 0; i < dataLength; i += 4) {
        if (dataStart + i + 3 < cleanResponse.length) {
          const code = cleanResponse.substring(dataStart + i, dataStart + i + 4);
          const dtc = this.createDTC(code, type);
          if (dtc) dtcs.push(dtc);
        }
      }
    }
    
    return dtcs;
  }

  private createDTC(code: string, type: string): DiagnosticTroubleCode | null {
    if (code === '0000' || code.length !== 4) return null;
    
    const firstChar = code.charAt(0);
    let category = '';
    
    switch (firstChar) {
      case '0': category = 'P0'; break; // Powertrain
      case '1': category = 'P1'; break; // Powertrain
      case '2': category = 'P2'; break; // Powertrain
      case '3': category = 'P3'; break; // Powertrain
      case '4': category = 'C0'; break; // Chassis
      case '5': category = 'B0'; break; // Body
      case '6': category = 'U0'; break; // Network
      default: category = 'P0';
    }
    
    const fullCode = category + code.substring(1);
    
    return {
      code: fullCode,
      description: this.getDTCDescription(fullCode),
      severity: this.getDTCSeverity(fullCode),
      category: this.getDTCCategory(fullCode),
      type: type as 'stored' | 'pending' | 'permanent',
      timestamp: new Date().toISOString(),
    };
  }

  private parseVIN(response: string): string | null {
    // Parse VIN from response format: 49 02 01 [VIN data]
    const cleanResponse = response.replace(/[\s\n\r]/g, '');
    if (cleanResponse.length >= 8) {
      const vinData = cleanResponse.substring(8);
      // Convert hex to ASCII
      let vin = '';
      for (let i = 0; i < vinData.length; i += 2) {
        const hex = vinData.substring(i, i + 2);
        const charCode = parseInt(hex, 16);
        if (charCode >= 32 && charCode <= 126) {
          vin += String.fromCharCode(charCode);
        }
      }
      return vin.length === 17 ? vin : null;
    }
    return null;
  }

  private parseECUName(response: string): string | null {
    // Parse ECU name from response
    const cleanResponse = response.replace(/[\s\n\r]/g, '');
    if (cleanResponse.length >= 8) {
      const nameData = cleanResponse.substring(8);
      let name = '';
      for (let i = 0; i < nameData.length; i += 2) {
        const hex = nameData.substring(i, i + 2);
        const charCode = parseInt(hex, 16);
        if (charCode >= 32 && charCode <= 126) {
          name += String.fromCharCode(charCode);
        }
      }
      return name || null;
    }
    return null;
  }

  private parseCalibrationId(response: string): string | null {
    // Parse calibration ID from response
    const cleanResponse = response.replace(/[\s\n\r]/g, '');
    if (cleanResponse.length >= 8) {
      const calData = cleanResponse.substring(8);
      let calId = '';
      for (let i = 0; i < calData.length; i += 2) {
        const hex = calData.substring(i, i + 2);
        const charCode = parseInt(hex, 16);
        if (charCode >= 32 && charCode <= 126) {
          calId += String.fromCharCode(charCode);
        }
      }
      return calId || null;
    }
    return null;
  }

  private parseFreezeFrames(response: string): FreezeFrame[] {
    // Parse freeze frame data
    const frames: FreezeFrame[] = [];
    // Implementation would parse specific freeze frame data
    // This is a simplified version
    return frames;
  }

  private parseEmissionReadiness(response: string): { [key: string]: boolean } {
    // Parse emission readiness response
    const readiness: { [key: string]: boolean } = {};
    // Implementation would parse readiness bits
    return readiness;
  }

  private async monitorLiveData(): Promise<void> {
    if (!this.isMonitoring || !this.dataCallback) return;

    const updateData = async () => {
      try {
        const rpm = await this.readRPM();
        const speed = await this.readSpeed();
        const coolantTemp = await this.readCoolantTemp();
        const throttlePosition = await this.readThrottlePosition();
        const fuelLevel = await this.readFuelLevel();
        const engineLoad = await this.readEngineLoad();

        const liveData: LiveData = {
          timestamp: new Date().toISOString(),
          rpm,
          speed,
          coolantTemp,
          throttlePosition,
          fuelLevel,
          engineLoad,
          intakeAirTemp: 25, // Would need actual reading
          fuelPressure: 0, // Would need actual reading
          oxygenSensor: 0, // Would need actual reading
          batteryVoltage: 12.5, // Would need actual reading
          maf: 0, // Would need actual reading
        };

        this.dataCallback!(liveData);
      } catch (error) {
        console.error('Error reading live data:', error);
      }
    };

    // Update every 500ms
    this.monitoringInterval = setInterval(updateData, 500);
  }

  private async readRPM(): Promise<number> {
    try {
      const response = await this.sendCommand('010C');
      return this.parseRPM(response);
    } catch (error) {
      return 0;
    }
  }

  private async readSpeed(): Promise<number> {
    try {
      const response = await this.sendCommand('010D');
      return this.parseSpeed(response);
    } catch (error) {
      return 0;
    }
  }

  private async readCoolantTemp(): Promise<number> {
    try {
      const response = await this.sendCommand('0105');
      return this.parseCoolantTemp(response);
    } catch (error) {
      return 0;
    }
  }

  private async readThrottlePosition(): Promise<number> {
    try {
      const response = await this.sendCommand('0111');
      return this.parseThrottlePosition(response);
    } catch (error) {
      return 0;
    }
  }

  private async readFuelLevel(): Promise<number> {
    try {
      const response = await this.sendCommand('012F');
      return this.parseFuelLevel(response);
    } catch (error) {
      return 0;
    }
  }

  private async readEngineLoad(): Promise<number> {
    try {
      const response = await this.sendCommand('0104');
      return this.parseEngineLoad(response);
    } catch (error) {
      return 0;
    }
  }

  private parseRPM(response: string): number {
    // Parse RPM from response format: 41 0C [RPM data]
    const cleanResponse = response.replace(/[\s\n\r]/g, '');
    if (cleanResponse.length >= 6) {
      const rpmData = cleanResponse.substring(4, 8);
      const rpm = parseInt(rpmData, 16);
      return Math.round(rpm / 4); // Formula: (A * 256 + B) / 4
    }
    return 0;
  }

  private parseSpeed(response: string): number {
    // Parse speed from response format: 41 0D [speed]
    const cleanResponse = response.replace(/[\s\n\r]/g, '');
    if (cleanResponse.length >= 4) {
      const speedData = cleanResponse.substring(4, 6);
      return parseInt(speedData, 16);
    }
    return 0;
  }

  private parseCoolantTemp(response: string): number {
    // Parse coolant temp from response format: 41 05 [temp]
    const cleanResponse = response.replace(/[\s\n\r]/g, '');
    if (cleanResponse.length >= 4) {
      const tempData = cleanResponse.substring(4, 6);
      const temp = parseInt(tempData, 16);
      return temp - 40; // Formula: A - 40
    }
    return 0;
  }

  private parseThrottlePosition(response: string): number {
    // Parse throttle position from response format: 41 11 [position]
    const cleanResponse = response.replace(/[\s\n\r]/g, '');
    if (cleanResponse.length >= 4) {
      const posData = cleanResponse.substring(4, 6);
      const pos = parseInt(posData, 16);
      return Math.round((pos * 100) / 255); // Formula: (A * 100) / 255
    }
    return 0;
  }

  private parseFuelLevel(response: string): number {
    // Parse fuel level from response format: 41 2F [level]
    const cleanResponse = response.replace(/[\s\n\r]/g, '');
    if (cleanResponse.length >= 4) {
      const levelData = cleanResponse.substring(4, 6);
      const level = parseInt(levelData, 16);
      return Math.round((level * 100) / 255); // Formula: (A * 100) / 255
    }
    return 0;
  }

  private parseEngineLoad(response: string): number {
    // Parse engine load from response format: 41 04 [load]
    const cleanResponse = response.replace(/[\s\n\r]/g, '');
    if (cleanResponse.length >= 4) {
      const loadData = cleanResponse.substring(4, 6);
      const load = parseInt(loadData, 16);
      return Math.round((load * 100) / 255); // Formula: (A * 100) / 255
    }
    return 0;
  }

  private getDTCDescription(code: string): string {
    const dtcInfo = dtcDatabase.getDTCInfo(code);
    return dtcInfo ? dtcInfo.description : `Diagnostic Trouble Code ${code}`;
  }

  private getDTCSeverity(code: string): 'low' | 'medium' | 'high' | 'critical' {
    const dtcInfo = dtcDatabase.getDTCInfo(code);
    return dtcInfo ? dtcInfo.severity : 'low';
  }

  private getDTCCategory(code: string): string {
    const dtcInfo = dtcDatabase.getDTCInfo(code);
    return dtcInfo ? dtcInfo.category : 'Unknown';
  }
}

export const obdService = new OBDService(); 