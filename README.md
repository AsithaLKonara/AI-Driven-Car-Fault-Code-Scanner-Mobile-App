# AI-Driven Car Fault Code Scanner Mobile App

A comprehensive cross-platform mobile application that connects to vehicles via OBD-II Bluetooth/Wi-Fi adapters, providing AI-powered diagnostics, repair guidance, and vehicle health management.

## 🚗 Overview

This React Native app empowers vehicle owners, DIY mechanics, and professional workshops with intelligent diagnostic capabilities. It reads fault codes, provides AI-powered explanations, offers repair suggestions, and includes advanced features like predictive maintenance and community interaction.

## ✨ Features

### Core OBD-II Features
- 🔗 Auto-connect to Bluetooth/Wi-Fi ELM327 adapters
- 📊 Read stored, pending, and permanent Diagnostic Trouble Codes (DTC)
- 🔧 Clear fault codes and reset Check Engine Light
- 📈 Real-time live data streaming (RPM, coolant temp, speed, fuel usage, throttle position)
- 🚙 Vehicle info retrieval (VIN, make, model, year)
- 📋 Freeze frame and emission readiness status

### AI-Powered Features
- 🤖 Natural language explanations of fault codes with possible causes
- 📝 Step-by-step DIY repair and diagnostic guides
- 🔮 Predictive maintenance alerts using live sensor data and trends
- 🎯 Personalized tune-up suggestions based on driving behavior
- 💬 AI-driven chat assistant for car-related questions

### Advanced & Social Features
- 🏆 Community challenges & leaderboards
- 🥽 Augmented Reality engine diagnostics
- 🛒 Local marketplace for mechanics and parts
- 📱 Car health social feed
- 📅 AI-generated maintenance scheduler
- 🗣️ Voice assistant integration
- 🎮 Gamification & rewards system

## 🛠️ Technical Stack

| Component | Technology |
|-----------|------------|
| Mobile Framework | React Native 0.80.2 |
| OBD-II Communication | react-native-bluetooth-serial-next |
| Navigation | React Navigation 6 |
| State Management | Redux Toolkit |
| Backend API | Node.js + Express |
| Database | MongoDB |
| AI/NLP | OpenAI GPT API |
| PDF Reports | react-native-pdf |
| Cloud Storage | Firebase Storage |
| Push Notifications | Firebase Cloud Messaging |
| Charts & Graphs | Victory Native |
| UI Components | React Native Elements |

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- React Native CLI
- Android Studio / Xcode
- ELM327 OBD-II Bluetooth adapter

### Setup
```bash
# Clone the repository
git clone https://github.com/AsithaLKonara/AI-Driven-Car-Fault-Code-Scanner-Mobile-App.git
cd AI-Driven-Car-Fault-Code-Scanner-Mobile-App/CarFaultScanner

# Install dependencies
npm install

# iOS setup
cd ios && pod install && cd ..

# Run on Android
npx react-native run-android

# Run on iOS
npx react-native run-ios
```

### Environment Variables
Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
FIREBASE_API_KEY=your_firebase_api_key_here
BACKEND_URL=your_backend_url_here
```

## 🚀 Development Roadmap

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Phase 1: MVP** | 3 weeks | Basic OBD-II connection, fault code read & clear, AI explanation |
| **Phase 2: Core AI** | 4 weeks | AI repair suggestions, live data dashboard, health report export |
| **Phase 3: Advanced** | 5 weeks | Predictive maintenance, tune-up advice, voice assistant |
| **Phase 4: Social & AR** | 6 weeks | Community feed, challenges, marketplace, AR diagnostics |
| **Phase 5: Polish & Launch** | 2 weeks | UI/UX improvements, multi-language support, store submission |

## 📱 Project Structure

```
CarFaultScanner/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # App screens
│   ├── services/           # API and OBD-II services
│   ├── utils/              # Helper functions
│   ├── store/              # Redux store configuration
│   ├── navigation/         # Navigation configuration
│   ├── types/              # TypeScript type definitions
│   └── assets/             # Images, fonts, etc.
├── android/                # Android-specific code
├── ios/                    # iOS-specific code
└── __tests__/              # Test files
```

## 🔧 OBD-II Compatibility

- ELM327 Bluetooth adapters
- ELM327 Wi-Fi adapters
- OBD-II compliant vehicles (1996+)
- Supports protocols: ISO9141-2, KWP2000, ISO14230, ISO15765 (CAN)

## 💰 Monetization

- **Freemium Model**: Free basic features, premium AI diagnostics via subscription
- **In-App Purchases**: Premium tutorials, parts marketplace access
- **Subscription Plans**: Monthly/yearly for full AI features and cloud sync
- **Affiliate Marketing**: Commissions on parts and mechanic bookings
- **Optional Ads**: Non-intrusive ads for free tier users

## 📱 Supported Platforms

- iOS 12.0+
- Android 7.0+ (API level 24+)

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 🚀 Building for Production

### Android
```bash
cd android
./gradlew assembleRelease
```

### iOS
```bash
cd ios
xcodebuild -workspace CarFaultScanner.xcworkspace -scheme CarFaultScanner archive
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Based on [react-native-obd-retriver](https://github.com/rakshitbharat/react-native-obd-retriver)
- OpenAI for AI integration capabilities
- React Native community for excellent libraries and support

## 📞 Support

For support, email support@carfaultscanner.com or create an issue in this repository.

---

**Built with ❤️ for car enthusiasts and DIY mechanics worldwide**
