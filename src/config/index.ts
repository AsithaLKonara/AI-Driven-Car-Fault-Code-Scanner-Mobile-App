// App Configuration
export const CONFIG = {
  // AI Service Configuration
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'your_openai_api_key_here',
  OPENAI_BASE_URL: 'https://api.openai.com/v1',
  
  // App Configuration
  APP_ENV: process.env.APP_ENV || 'development',
  
  // OBD Configuration
  OBD_SCAN_TIMEOUT: 30000,
  OBD_COMMAND_TIMEOUT: 5000,
  
  // Features
  ENABLE_AI_CHAT: true,
  ENABLE_SOCIAL_FEATURES: false,
  ENABLE_AR_DIAGNOSTICS: false,
  ENABLE_VOICE_ASSISTANT: false,
};

export default CONFIG; 