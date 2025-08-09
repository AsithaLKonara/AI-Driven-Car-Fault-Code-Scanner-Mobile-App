import Config from 'react-native-config';
import { DiagnosticTroubleCode, AIResponse, ChatMessage, VehicleInfo, LiveData } from '../types';

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class AIService {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = Config.OPENAI_API_KEY || '';
  }

  // Explain a diagnostic trouble code using AI
  async explainDTC(dtc: DiagnosticTroubleCode, vehicleInfo?: VehicleInfo): Promise<AIResponse> {
    try {
      const prompt = this.createDTCPrompt(dtc, vehicleInfo);
      const response = await this.callOpenAI(prompt);
      return this.parseAIResponse(response, dtc);
    } catch (error) {
      console.error('AI explanation failed:', error);
      return this.getFallbackResponse(dtc);
    }
  }

  // Get repair suggestions for multiple DTCs
  async getRepairSuggestions(dtcs: DiagnosticTroubleCode[], vehicleInfo?: VehicleInfo): Promise<AIResponse> {
    try {
      const prompt = this.createRepairPrompt(dtcs, vehicleInfo);
      const response = await this.callOpenAI(prompt);
      return this.parseRepairResponse(response, dtcs);
    } catch (error) {
      console.error('AI repair suggestions failed:', error);
      return this.getFallbackRepairResponse(dtcs);
    }
  }

  // Analyze live data for predictive maintenance
  async analyzeLiveData(liveData: LiveData[], vehicleInfo?: VehicleInfo): Promise<string[]> {
    try {
      const prompt = this.createLiveDataPrompt(liveData, vehicleInfo);
      const response = await this.callOpenAI(prompt);
      return this.parsePredictiveAnalysis(response);
    } catch (error) {
      console.error('Live data analysis failed:', error);
      return ['Unable to analyze vehicle data at this time.'];
    }
  }

  // Chat with AI assistant about car issues
  async chatWithAI(messages: ChatMessage[], context?: {
    dtcs?: DiagnosticTroubleCode[];
    vehicleInfo?: VehicleInfo;
    liveData?: LiveData;
  }): Promise<string> {
    try {
      const prompt = this.createChatPrompt(messages, context);
      const response = await this.callOpenAI(prompt);
      return this.parseChatResponse(response);
    } catch (error) {
      console.error('AI chat failed:', error);
      return 'I apologize, but I\'m having trouble responding right now. Please try again later.';
    }
  }

  // Generate maintenance recommendations
  async getMaintenanceRecommendations(
    vehicleInfo: VehicleInfo,
    mileage: number,
    lastMaintenanceDate?: string
  ): Promise<string[]> {
    try {
      const prompt = this.createMaintenancePrompt(vehicleInfo, mileage, lastMaintenanceDate);
      const response = await this.callOpenAI(prompt);
      return this.parseMaintenanceRecommendations(response);
    } catch (error) {
      console.error('Maintenance recommendations failed:', error);
      return ['Regular oil changes every 5,000-7,500 miles', 'Check tire pressure monthly'];
    }
  }

  // Private helper methods

  private async callOpenAI(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert automotive diagnostic technician with extensive knowledge of OBD-II systems, vehicle repair, and maintenance. Provide clear, accurate, and helpful information to vehicle owners.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data: OpenAIResponse = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  private createDTCPrompt(dtc: DiagnosticTroubleCode, vehicleInfo?: VehicleInfo): string {
    let prompt = `Explain the diagnostic trouble code ${dtc.code} (${dtc.description}) in simple terms that a car owner can understand.`;
    
    if (vehicleInfo) {
      prompt += ` The vehicle is a ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}.`;
    }

    prompt += ` Please provide:
1. What this code means in plain English
2. Possible causes (list 3-5 most common)
3. Severity level (low, medium, high, or critical)
4. Whether it's safe to drive
5. Estimated repair cost range
6. Basic troubleshooting steps a DIY mechanic could try

Format your response as JSON with the following structure:
{
  "explanation": "plain English explanation",
  "possibleCauses": ["cause 1", "cause 2", "cause 3"],
  "severity": "low|medium|high|critical",
  "urgency": "immediate|soon|routine",
  "safeTodrive": true/false,
  "estimatedCost": {"min": 50, "max": 500, "currency": "USD"},
  "diySteps": ["step 1", "step 2", "step 3"]
}`;

    return prompt;
  }

  private createRepairPrompt(dtcs: DiagnosticTroubleCode[], vehicleInfo?: VehicleInfo): string {
    const codes = dtcs.map(dtc => `${dtc.code} (${dtc.description})`).join(', ');
    
    let prompt = `I have multiple diagnostic trouble codes: ${codes}.`;
    
    if (vehicleInfo) {
      prompt += ` The vehicle is a ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}.`;
    }

    prompt += ` Please provide a comprehensive repair plan including:
1. Priority order for addressing these codes
2. Which codes might be related to each other
3. Step-by-step repair instructions
4. Tools and parts needed
5. Estimated time and cost for each repair
6. Safety precautions

Format as JSON with repair steps array.`;

    return prompt;
  }

  private createLiveDataPrompt(liveData: LiveData[], vehicleInfo?: VehicleInfo): string {
    const latestData = liveData[liveData.length - 1];
    const dataHistory = liveData.slice(-10); // Last 10 readings

    let prompt = `Analyze this vehicle's live data for potential issues and maintenance needs:

Current readings:
- RPM: ${latestData.rpm}
- Speed: ${latestData.speed} mph
- Coolant Temperature: ${latestData.coolantTemp}°C
- Throttle Position: ${latestData.throttlePosition}%
- Engine Load: ${latestData.engineLoad}%
- Fuel Level: ${latestData.fuelLevel}%

Historical trend (last 10 readings available).`;

    if (vehicleInfo) {
      prompt += ` Vehicle: ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}`;
    }

    prompt += ` Please identify any concerning patterns or values and provide maintenance recommendations.`;

    return prompt;
  }

  private createChatPrompt(messages: ChatMessage[], context?: any): string {
    let prompt = 'You are helping a car owner with their vehicle. Here\'s our conversation:\n\n';
    
    messages.slice(-5).forEach(msg => {
      prompt += `${msg.isUser ? 'User' : 'Assistant'}: ${msg.text}\n`;
    });

    if (context?.dtcs?.length) {
      prompt += `\nCurrent diagnostic codes: ${context.dtcs.map((d: DiagnosticTroubleCode) => d.code).join(', ')}`;
    }

    if (context?.vehicleInfo) {
      const v = context.vehicleInfo;
      prompt += `\nVehicle: ${v.year} ${v.make} ${v.model}`;
    }

    prompt += '\n\nPlease provide a helpful response to the user\'s latest message.';

    return prompt;
  }

  private createMaintenancePrompt(vehicleInfo: VehicleInfo, mileage: number, lastMaintenanceDate?: string): string {
    let prompt = `Generate maintenance recommendations for a ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model} with ${mileage} miles.`;
    
    if (lastMaintenanceDate) {
      prompt += ` Last maintenance was on ${lastMaintenanceDate}.`;
    }

    prompt += ` Provide specific recommendations based on the vehicle's age, mileage, and typical maintenance schedule.`;

    return prompt;
  }

  private parseAIResponse(response: string, dtc: DiagnosticTroubleCode): AIResponse {
    try {
      const parsed = JSON.parse(response);
      return {
        explanation: parsed.explanation || 'AI explanation not available',
        possibleCauses: parsed.possibleCauses || [],
        severity: parsed.severity || dtc.severity,
        urgency: parsed.urgency || 'routine',
        repairSuggestions: parsed.diySteps?.map((step: string, index: number) => ({
          id: `${dtc.code}-step-${index}`,
          title: `Step ${index + 1}`,
          description: step,
          difficulty: 'medium' as const,
          estimatedTime: '30 minutes',
          toolsRequired: ['Basic tools'],
        })) || [],
        estimatedCost: parsed.estimatedCost || { min: 50, max: 500, currency: 'USD' },
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return this.getFallbackResponse(dtc);
    }
  }

  private parseRepairResponse(response: string, dtcs: DiagnosticTroubleCode[]): AIResponse {
    // Simplified parsing - in a real app, you'd have more sophisticated parsing
    return {
      explanation: 'Multiple diagnostic codes detected. Please address them in order of severity.',
      possibleCauses: ['Multiple system issues'],
      severity: 'high',
      urgency: 'soon',
      repairSuggestions: [],
      estimatedCost: { min: 200, max: 1500, currency: 'USD' },
    };
  }

  private parsePredictiveAnalysis(response: string): string[] {
    // Extract recommendations from AI response
    const lines = response.split('\n').filter(line => line.trim().length > 0);
    return lines.slice(0, 5); // Return top 5 recommendations
  }

  private parseChatResponse(response: string): string {
    return response.trim();
  }

  private parseMaintenanceRecommendations(response: string): string[] {
    const lines = response.split('\n').filter(line => line.trim().length > 0);
    return lines.slice(0, 10); // Return top 10 recommendations
  }

  private getFallbackResponse(dtc: DiagnosticTroubleCode): AIResponse {
    return {
      explanation: `Diagnostic trouble code ${dtc.code} indicates an issue with your vehicle. Please consult a qualified mechanic for proper diagnosis.`,
      possibleCauses: ['Sensor malfunction', 'Wiring issue', 'Component failure'],
      severity: dtc.severity,
      urgency: 'soon',
      repairSuggestions: [{
        id: `${dtc.code}-fallback`,
        title: 'Professional Diagnosis',
        description: 'Have a qualified technician diagnose the issue using professional equipment.',
        difficulty: 'hard',
        estimatedTime: '1-2 hours',
        toolsRequired: ['Professional diagnostic tools'],
      }],
      estimatedCost: { min: 100, max: 800, currency: 'USD' },
    };
  }

  private getFallbackRepairResponse(dtcs: DiagnosticTroubleCode[]): AIResponse {
    return {
      explanation: 'Multiple diagnostic codes detected. Professional diagnosis recommended.',
      possibleCauses: ['Multiple system issues'],
      severity: 'high',
      urgency: 'soon',
      repairSuggestions: [],
      estimatedCost: { min: 200, max: 1500, currency: 'USD' },
    };
  }
}

export const aiService = new AIService(); 