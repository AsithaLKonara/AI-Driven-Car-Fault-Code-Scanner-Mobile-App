import { configureStore } from '@reduxjs/toolkit';
import obdReducer from './slices/obdSlice';
import userReducer from './slices/userSlice';
import aiReducer from './slices/aiSlice';
import appReducer from './slices/appSlice';

export const store = configureStore({
  reducer: {
    obd: obdReducer,
    user: userReducer,
    ai: aiReducer,
    app: appReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 