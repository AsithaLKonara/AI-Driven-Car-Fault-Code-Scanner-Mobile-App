import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AIState, ChatMessage, AIResponse, DiagnosticTroubleCode, VehicleInfo, LiveData } from '../../types';
import { aiService } from '../../services/AIService';

const initialState: AIState = {
  isProcessing: false,
  chatHistory: [],
  currentAnalysis: undefined,
  recommendations: [],
};

// Async thunks
export const explainDTC = createAsyncThunk(
  'ai/explainDTC',
  async ({ dtc, vehicleInfo }: { dtc: DiagnosticTroubleCode; vehicleInfo?: VehicleInfo }) => {
    const response = await aiService.explainDTC(dtc, vehicleInfo);
    return response;
  }
);

export const getRepairSuggestions = createAsyncThunk(
  'ai/getRepairSuggestions',
  async ({ dtcs, vehicleInfo }: { dtcs: DiagnosticTroubleCode[]; vehicleInfo?: VehicleInfo }) => {
    const response = await aiService.getRepairSuggestions(dtcs, vehicleInfo);
    return response;
  }
);

export const analyzeLiveData = createAsyncThunk(
  'ai/analyzeLiveData',
  async ({ liveData, vehicleInfo }: { liveData: LiveData[]; vehicleInfo?: VehicleInfo }) => {
    const recommendations = await aiService.analyzeLiveData(liveData, vehicleInfo);
    return recommendations;
  }
);

export const sendChatMessage = createAsyncThunk(
  'ai/sendChatMessage',
  async ({ 
    message, 
    context 
  }: { 
    message: string; 
    context?: { 
      dtcs?: DiagnosticTroubleCode[]; 
      vehicleInfo?: VehicleInfo; 
      liveData?: LiveData; 
    } 
  }, { getState, dispatch }) => {
    const state = getState() as { ai: AIState };
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: Date.now(),
    };
    
    dispatch(addChatMessage(userMessage));
    
    // Get AI response
    const aiResponse = await aiService.chatWithAI([...state.ai.chatHistory, userMessage], context);
    
    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: aiResponse,
      isUser: false,
      timestamp: Date.now() + 1,
    };
    
    return aiMessage;
  }
);

export const getMaintenanceRecommendations = createAsyncThunk(
  'ai/getMaintenanceRecommendations',
  async ({ 
    vehicleInfo, 
    mileage, 
    lastMaintenanceDate 
  }: { 
    vehicleInfo: VehicleInfo; 
    mileage: number; 
    lastMaintenanceDate?: string; 
  }) => {
    const recommendations = await aiService.getMaintenanceRecommendations(
      vehicleInfo, 
      mileage, 
      lastMaintenanceDate
    );
    return recommendations;
  }
);

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    addChatMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.chatHistory.push(action.payload);
      // Keep only last 50 messages
      state.chatHistory = state.chatHistory.slice(-50);
    },
    clearChatHistory: (state) => {
      state.chatHistory = [];
    },
    setCurrentAnalysis: (state, action: PayloadAction<AIResponse>) => {
      state.currentAnalysis = action.payload;
    },
    clearCurrentAnalysis: (state) => {
      state.currentAnalysis = undefined;
    },
    addRecommendation: (state, action: PayloadAction<any>) => {
      state.recommendations.push(action.payload);
    },
    removeRecommendation: (state, action: PayloadAction<string>) => {
      state.recommendations = state.recommendations.filter(r => r.id !== action.payload);
    },
    clearRecommendations: (state) => {
      state.recommendations = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Explain DTC
      .addCase(explainDTC.pending, (state) => {
        state.isProcessing = true;
      })
      .addCase(explainDTC.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.currentAnalysis = action.payload;
      })
      .addCase(explainDTC.rejected, (state) => {
        state.isProcessing = false;
      })
      
      // Get repair suggestions
      .addCase(getRepairSuggestions.pending, (state) => {
        state.isProcessing = true;
      })
      .addCase(getRepairSuggestions.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.currentAnalysis = action.payload;
      })
      .addCase(getRepairSuggestions.rejected, (state) => {
        state.isProcessing = false;
      })
      
      // Analyze live data
      .addCase(analyzeLiveData.pending, (state) => {
        state.isProcessing = true;
      })
      .addCase(analyzeLiveData.fulfilled, (state, action) => {
        state.isProcessing = false;
        // Convert recommendations to proper format
        const recommendations = action.payload.map((rec, index) => ({
          id: `live-data-${Date.now()}-${index}`,
          type: 'maintenance' as const,
          title: 'Live Data Analysis',
          description: rec,
          priority: 'medium' as const,
        }));
        state.recommendations.push(...recommendations);
      })
      .addCase(analyzeLiveData.rejected, (state) => {
        state.isProcessing = false;
      })
      
      // Send chat message
      .addCase(sendChatMessage.pending, (state) => {
        state.isProcessing = true;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.chatHistory.push(action.payload);
        state.chatHistory = state.chatHistory.slice(-50);
      })
      .addCase(sendChatMessage.rejected, (state) => {
        state.isProcessing = false;
      })
      
      // Get maintenance recommendations
      .addCase(getMaintenanceRecommendations.pending, (state) => {
        state.isProcessing = true;
      })
      .addCase(getMaintenanceRecommendations.fulfilled, (state, action) => {
        state.isProcessing = false;
        const recommendations = action.payload.map((rec, index) => ({
          id: `maintenance-${Date.now()}-${index}`,
          type: 'maintenance' as const,
          title: 'Maintenance Recommendation',
          description: rec,
          priority: 'medium' as const,
        }));
        state.recommendations.push(...recommendations);
      })
      .addCase(getMaintenanceRecommendations.rejected, (state) => {
        state.isProcessing = false;
      });
  },
});

export const {
  addChatMessage,
  clearChatHistory,
  setCurrentAnalysis,
  clearCurrentAnalysis,
  addRecommendation,
  removeRecommendation,
  clearRecommendations,
} = aiSlice.actions;

export default aiSlice.reducer; 