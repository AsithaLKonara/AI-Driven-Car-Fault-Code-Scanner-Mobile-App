import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserState, User, VehicleProfile, ScanRecord, UserPreferences } from '../../types';

const initialState: UserState = {
  currentUser: undefined,
  isAuthenticated: false,
  currentVehicle: undefined,
  scanHistory: [],
  preferences: {
    units: 'metric',
    language: 'en',
    notifications: {
      maintenance: true,
      dtcAlerts: true,
      community: false,
    },
    privacy: {
      shareData: false,
      analytics: true,
    },
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.currentUser = undefined;
      state.isAuthenticated = false;
      state.currentVehicle = undefined;
    },
    setCurrentVehicle: (state, action: PayloadAction<VehicleProfile>) => {
      state.currentVehicle = action.payload;
    },
    addVehicleProfile: (state, action: PayloadAction<VehicleProfile>) => {
      if (state.currentUser) {
        state.currentUser.vehicleProfiles.push(action.payload);
      }
    },
    updateVehicleProfile: (state, action: PayloadAction<VehicleProfile>) => {
      if (state.currentUser) {
        const index = state.currentUser.vehicleProfiles.findIndex(
          v => v.id === action.payload.id
        );
        if (index >= 0) {
          state.currentUser.vehicleProfiles[index] = action.payload;
        }
      }
      if (state.currentVehicle?.id === action.payload.id) {
        state.currentVehicle = action.payload;
      }
    },
    removeVehicleProfile: (state, action: PayloadAction<string>) => {
      if (state.currentUser) {
        state.currentUser.vehicleProfiles = state.currentUser.vehicleProfiles.filter(
          v => v.id !== action.payload
        );
      }
      if (state.currentVehicle?.id === action.payload) {
        state.currentVehicle = undefined;
      }
    },
    addScanRecord: (state, action: PayloadAction<ScanRecord>) => {
      state.scanHistory.unshift(action.payload);
      // Keep only last 100 scans
      state.scanHistory = state.scanHistory.slice(0, 100);
    },
    updatePreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    updateGamificationScore: (state, action: PayloadAction<number>) => {
      if (state.currentUser) {
        state.currentUser.gamificationScore += action.payload;
      }
    },
    addAchievement: (state, action: PayloadAction<any>) => {
      if (state.currentUser) {
        state.currentUser.achievements.push(action.payload);
      }
    },
  },
});

export const {
  setUser,
  clearUser,
  setCurrentVehicle,
  addVehicleProfile,
  updateVehicleProfile,
  removeVehicleProfile,
  addScanRecord,
  updatePreferences,
  updateGamificationScore,
  addAchievement,
} = userSlice.actions;

export default userSlice.reducer; 