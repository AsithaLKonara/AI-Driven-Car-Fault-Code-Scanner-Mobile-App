import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { OBDState, OBDDevice, DiagnosticTroubleCode, LiveData, VehicleInfo, FreezeFrame } from '../../types';
import { obdService } from '../../services/OBDService';

const initialState: OBDState = {
  isConnected: false,
  currentDevice: undefined,
  availableDevices: [],
  isScanning: false,
  currentDTCs: [],
  liveData: undefined,
  vehicleInfo: undefined,
  freezeFrames: [],
  connectionHistory: [],
};

// Async thunks
export const scanForDevices = createAsyncThunk(
  'obd/scanForDevices',
  async (_, { dispatch }) => {
    await obdService.initialize();
    
    return new Promise<OBDDevice[]>((resolve) => {
      const devices: OBDDevice[] = [];
      
      obdService.scanForDevices((discoveredDevices) => {
        devices.push(...discoveredDevices);
        dispatch(setAvailableDevices(discoveredDevices));
      });

      // Resolve after 30 seconds
      setTimeout(() => {
        obdService.stopScan();
        resolve(devices);
      }, 30000);
    });
  }
);

export const connectToDevice = createAsyncThunk(
  'obd/connectToDevice',
  async (deviceId: string, { rejectWithValue }) => {
    try {
      const success = await obdService.connect(deviceId);
      if (!success) {
        throw new Error('Failed to connect to device');
      }
      return deviceId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Connection failed');
    }
  }
);

export const disconnectDevice = createAsyncThunk(
  'obd/disconnectDevice',
  async () => {
    await obdService.disconnect();
  }
);

export const readDTCs = createAsyncThunk(
  'obd/readDTCs',
  async (_, { rejectWithValue }) => {
    try {
      const dtcs = await obdService.readDTCs();
      return dtcs;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to read DTCs');
    }
  }
);

export const clearDTCs = createAsyncThunk(
  'obd/clearDTCs',
  async (_, { rejectWithValue }) => {
    try {
      const success = await obdService.clearDTCs();
      if (!success) {
        throw new Error('Failed to clear DTCs');
      }
      return true;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to clear DTCs');
    }
  }
);

export const readVehicleInfo = createAsyncThunk(
  'obd/readVehicleInfo',
  async (_, { rejectWithValue }) => {
    try {
      const vehicleInfo = await obdService.readVehicleInfo();
      return vehicleInfo;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to read vehicle info');
    }
  }
);

export const startLiveData = createAsyncThunk(
  'obd/startLiveData',
  async (_, { dispatch }) => {
    await obdService.startLiveData((data) => {
      dispatch(updateLiveData(data));
    });
  }
);

export const stopLiveData = createAsyncThunk(
  'obd/stopLiveData',
  async () => {
    obdService.stopLiveData();
  }
);

const obdSlice = createSlice({
  name: 'obd',
  initialState,
  reducers: {
    setAvailableDevices: (state, action: PayloadAction<OBDDevice[]>) => {
      state.availableDevices = action.payload;
    },
    updateLiveData: (state, action: PayloadAction<LiveData>) => {
      state.liveData = action.payload;
    },
    addToConnectionHistory: (state, action: PayloadAction<OBDDevice>) => {
      const existingIndex = state.connectionHistory.findIndex(
        device => device.id === action.payload.id
      );
      if (existingIndex >= 0) {
        state.connectionHistory.splice(existingIndex, 1);
      }
      state.connectionHistory.unshift(action.payload);
      // Keep only last 10 connections
      state.connectionHistory = state.connectionHistory.slice(0, 10);
    },
    resetOBDState: (state) => {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    builder
      // Scan for devices
      .addCase(scanForDevices.pending, (state) => {
        state.isScanning = true;
        state.availableDevices = [];
      })
      .addCase(scanForDevices.fulfilled, (state, action) => {
        state.isScanning = false;
        state.availableDevices = action.payload;
      })
      .addCase(scanForDevices.rejected, (state) => {
        state.isScanning = false;
      })
      
      // Connect to device
      .addCase(connectToDevice.pending, (state) => {
        state.isConnected = false;
      })
      .addCase(connectToDevice.fulfilled, (state, action) => {
        state.isConnected = true;
        const device = state.availableDevices.find(d => d.id === action.payload);
        if (device) {
          state.currentDevice = { ...device, isConnected: true };
          obdSlice.caseReducers.addToConnectionHistory(state, { 
            payload: state.currentDevice, 
            type: 'addToConnectionHistory' 
          });
        }
      })
      .addCase(connectToDevice.rejected, (state) => {
        state.isConnected = false;
        state.currentDevice = undefined;
      })
      
      // Disconnect device
      .addCase(disconnectDevice.fulfilled, (state) => {
        state.isConnected = false;
        if (state.currentDevice) {
          state.currentDevice.isConnected = false;
        }
        state.currentDevice = undefined;
        state.liveData = undefined;
      })
      
      // Read DTCs
      .addCase(readDTCs.fulfilled, (state, action) => {
        state.currentDTCs = action.payload;
      })
      
      // Clear DTCs
      .addCase(clearDTCs.fulfilled, (state) => {
        state.currentDTCs = [];
      })
      
      // Read vehicle info
      .addCase(readVehicleInfo.fulfilled, (state, action) => {
        state.vehicleInfo = action.payload || undefined;
      });
  },
});

export const {
  setAvailableDevices,
  updateLiveData,
  addToConnectionHistory,
  resetOBDState,
} = obdSlice.actions;

export default obdSlice.reducer; 