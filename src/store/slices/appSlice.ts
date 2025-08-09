import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppConfigState } from '../../types';

const initialState: AppConfigState = {
  isFirstLaunch: true,
  version: '1.0.0',
  environment: 'development',
  features: {
    aiChat: true,
    socialFeatures: false,
    arDiagnostics: false,
    voiceAssistant: false,
  },
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setFirstLaunchComplete: (state) => {
      state.isFirstLaunch = false;
    },
    updateVersion: (state, action: PayloadAction<string>) => {
      state.version = action.payload;
    },
    setEnvironment: (state, action: PayloadAction<'development' | 'staging' | 'production'>) => {
      state.environment = action.payload;
    },
    toggleFeature: (state, action: PayloadAction<keyof AppConfigState['features']>) => {
      state.features[action.payload] = !state.features[action.payload];
    },
    setFeature: (state, action: PayloadAction<{ feature: keyof AppConfigState['features']; enabled: boolean }>) => {
      state.features[action.payload.feature] = action.payload.enabled;
    },
    updateFeatures: (state, action: PayloadAction<Partial<AppConfigState['features']>>) => {
      state.features = { ...state.features, ...action.payload };
    },
  },
});

export const {
  setFirstLaunchComplete,
  updateVersion,
  setEnvironment,
  toggleFeature,
  setFeature,
  updateFeatures,
} = appSlice.actions;

export default appSlice.reducer; 