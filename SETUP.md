# AI-Driven Car Fault Code Scanner - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- ELM327 OBD-II Bluetooth adapter for testing

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AsithaLKonara/AI-Driven-Car-Fault-Code-Scanner-Mobile-App.git
   cd AI-Driven-Car-Fault-Code-Scanner-Mobile-App/CarFaultScanner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup** (macOS only)
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

## Required API Keys

### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account and generate an API key
3. Add to `.env`: `OPENAI_API_KEY=your_key_here`

### Firebase Configuration (Optional)
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Add your app and download the configuration
3. Update the Firebase keys in `.env`

## Android Setup

1. **Enable Developer Options**
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
   - Go to Settings > Developer Options
   - Enable "USB Debugging"

2. **Android Permissions**
   The app requires the following permissions:
   - `ACCESS_FINE_LOCATION` - For Bluetooth device scanning
   - `BLUETOOTH_SCAN` - For scanning Bluetooth devices
   - `BLUETOOTH_CONNECT` - For connecting to OBD-II adapters

## iOS Setup

1. **iOS Permissions**
   The app requires Bluetooth permissions which are automatically requested.

2. **Info.plist Configuration**
   Add Bluetooth usage descriptions to `ios/CarFaultScanner/Info.plist`:
   ```xml
   <key>NSBluetoothAlwaysUsageDescription</key>
   <string>This app uses Bluetooth to connect to OBD-II diagnostic adapters</string>
   ```

## Running the App

### Android
```bash
npx react-native run-android
```

### iOS
```bash
npx react-native run-ios
```

## OBD-II Adapter Setup

1. **Purchase a compatible ELM327 adapter**
   - Bluetooth ELM327 v1.5 or higher recommended
   - Ensure it supports your vehicle's OBD-II protocol

2. **Pair the adapter**
   - Plug adapter into your vehicle's OBD-II port
   - Turn on ignition (don't start engine for initial setup)
   - Pair the Bluetooth adapter with your phone
   - Default PIN is usually `1234` or `0000`

3. **Test connection**
   - Open the app
   - Go to "Scan" tab
   - Tap "Scan for Devices"
   - Select your OBD-II adapter
   - Try reading fault codes

## Troubleshooting

### Common Issues

1. **Bluetooth permissions denied**
   - Check app permissions in device settings
   - Ensure location services are enabled (required for Bluetooth scanning)

2. **OBD-II adapter not found**
   - Ensure adapter is properly paired with your device
   - Try unpairing and re-pairing the adapter
   - Check if adapter is compatible with your vehicle

3. **Cannot read fault codes**
   - Ensure vehicle ignition is on
   - Check OBD-II port connection
   - Try different adapter if available

4. **AI features not working**
   - Verify OpenAI API key is correctly set in `.env`
   - Check internet connection
   - Ensure you have API credits available

### Build Issues

1. **Metro bundler issues**
   ```bash
   npx react-native start --reset-cache
   ```

2. **Android build issues**
   ```bash
   cd android && ./gradlew clean && cd ..
   npx react-native run-android
   ```

3. **iOS build issues**
   ```bash
   cd ios && pod install && cd ..
   npx react-native run-ios
   ```

## Development

### Project Structure
```
src/
├── components/     # Reusable UI components
├── screens/       # App screens
├── services/      # API and OBD-II services
├── store/         # Redux store and slices
├── navigation/    # Navigation configuration
├── types/         # TypeScript definitions
└── utils/         # Helper functions
```

### Adding New Features

1. Create feature branch: `git checkout -b feature/new-feature`
2. Implement changes following the existing code structure
3. Test thoroughly with real OBD-II adapter
4. Submit pull request

### Testing

- Test with real OBD-II adapter when possible
- Test on both Android and iOS devices
- Verify AI features work with valid API keys
- Test offline functionality

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Check existing issues for solutions
- Review the troubleshooting section above

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Happy coding! 🚗💻** 