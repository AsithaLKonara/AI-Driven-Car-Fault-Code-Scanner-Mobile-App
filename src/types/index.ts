// OBD-II Related Types
export interface OBDDevice {
  id: string;
  name: string;
  address: string;
  isConnected: boolean;
}

export interface DiagnosticTroubleCode {
  code: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  type?: 'stored' | 'pending' | 'permanent';
  timestamp?: string;
  aiExplanation?: string;
  repairSteps?: RepairStep[];
}

export interface RepairStep {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  toolsRequired: string[];
  imageUrl?: string;
}

export interface LiveData {
  timestamp: string;
  rpm: number;
  speed: number;
  coolantTemp: number;
  fuelLevel: number;
  throttlePosition: number;
  engineLoad: number;
  intakeAirTemp: number;
  fuelPressure: number;
  oxygenSensor: number;
  batteryVoltage?: number;
  maf?: number;
}

export interface VehicleInfo {
  vin: string;
  make: string;
  model: string;
  year: number;
  engine: string;
  transmission: string;
  ecuName?: string;
  calibrationId?: string;
}

export interface FreezeFrame {
  dtc: string;
  timestamp: number;
  data: LiveData;
}

// AI Related Types
export interface AIResponse {
  explanation: string;
  possibleCauses: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  urgency: 'immediate' | 'soon' | 'routine';
  repairSuggestions: RepairStep[];
  estimatedCost: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
  attachments?: {
    type: 'image' | 'dtc' | 'livedata';
    data: any;
  }[];
}

// User & Social Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  vehicleProfiles: VehicleProfile[];
  subscriptionType: 'free' | 'premium' | 'pro';
  gamificationScore: number;
  achievements: Achievement[];
}

export interface VehicleProfile {
  id: string;
  userId: string;
  vehicleInfo: VehicleInfo;
  nickname: string;
  mileage: number;
  maintenanceHistory: MaintenanceRecord[];
  healthScore: number;
  lastScanDate: string;
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  type: 'oil_change' | 'brake_service' | 'tire_rotation' | 'inspection' | 'repair' | 'other';
  description: string;
  cost: number;
  mileage: number;
  location?: string;
  notes?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  points: number;
}

// Navigation Types
export type RootStackParamList = {
  Home: undefined;
  Scan: undefined;
  LiveData: undefined;
  History: undefined;
  Profile: undefined;
  VehicleSetup: undefined;
  DTCDetails: { dtc: DiagnosticTroubleCode };
  AIChat: undefined;
  Settings: undefined;
  Premium: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Scan: undefined;
  LiveData: undefined;
  History: undefined;
  Profile: undefined;
};

// App State Types
export interface AppState {
  obd: OBDState;
  user: UserState;
  ai: AIState;
  app: AppConfigState;
}

export interface OBDState {
  isConnected: boolean;
  currentDevice?: OBDDevice;
  availableDevices: OBDDevice[];
  isScanning: boolean;
  currentDTCs: DiagnosticTroubleCode[];
  liveData?: LiveData;
  vehicleInfo?: VehicleInfo;
  freezeFrames: FreezeFrame[];
  connectionHistory: OBDDevice[];
}

export interface UserState {
  currentUser?: User;
  isAuthenticated: boolean;
  currentVehicle?: VehicleProfile;
  scanHistory: ScanRecord[];
  preferences: UserPreferences;
}

export interface ScanRecord {
  id: string;
  timestamp: number;
  vehicleId: string;
  dtcs: DiagnosticTroubleCode[];
  liveDataSnapshot?: LiveData;
  notes?: string;
}

export interface UserPreferences {
  units: 'metric' | 'imperial';
  language: string;
  notifications: {
    maintenance: boolean;
    dtcAlerts: boolean;
    community: boolean;
  };
  privacy: {
    shareData: boolean;
    analytics: boolean;
  };
}

export interface AIState {
  isProcessing: boolean;
  chatHistory: ChatMessage[];
  currentAnalysis?: AIResponse;
  recommendations: Recommendation[];
}

export interface Recommendation {
  id: string;
  type: 'maintenance' | 'repair' | 'upgrade' | 'tip';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  cost?: number;
}

export interface AppConfigState {
  isFirstLaunch: boolean;
  version: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    aiChat: boolean;
    socialFeatures: boolean;
    arDiagnostics: boolean;
    voiceAssistant: boolean;
  };
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

export interface OBDError extends AppError {
  deviceId?: string;
  command?: string;
}

export interface NetworkError extends AppError {
  status?: number;
  endpoint?: string;
} 