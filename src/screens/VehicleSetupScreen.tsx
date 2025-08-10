import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootState, AppDispatch } from '../store';
import { VehicleInfo, VehicleProfile } from '../types';

interface VehicleFormData {
  nickname: string;
  make: string;
  model: string;
  year: string;
  engine: string;
  transmission: string;
  vin: string;
  mileage: string;
}

const VehicleSetupScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { vehicleInfo } = useSelector((state: RootState) => state.obd);
  
  const [formData, setFormData] = useState<VehicleFormData>({
    nickname: '',
    make: '',
    model: '',
    year: '',
    engine: '',
    transmission: '',
    vin: '',
    mileage: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isScanningVIN, setIsScanningVIN] = useState(false);

  // Auto-fill from OBD if available
  useEffect(() => {
    if (vehicleInfo) {
      setFormData(prev => ({
        ...prev,
        make: vehicleInfo.make || '',
        model: vehicleInfo.model || '',
        year: vehicleInfo.year?.toString() || '',
        engine: vehicleInfo.engine || '',
        transmission: vehicleInfo.transmission || '',
        vin: vehicleInfo.vin || '',
      }));
    }
  }, [vehicleInfo]);

  const handleInputChange = (field: keyof VehicleFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleScanVIN = async () => {
    if (!formData.vin.trim()) {
      Alert.alert('Error', 'Please enter a VIN to scan');
      return;
    }

    setIsScanningVIN(true);
    try {
      // In a real app, this would call a VIN decoder API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Mock VIN decode result
      const mockDecodedVIN = {
        make: 'Toyota',
        model: 'Camry',
        year: '2020',
        engine: '2.5L 4-Cylinder',
        transmission: '8-Speed Automatic',
      };

      setFormData(prev => ({
        ...prev,
        make: mockDecodedVIN.make,
        model: mockDecodedVIN.model,
        year: mockDecodedVIN.year,
        engine: mockDecodedVIN.engine,
        transmission: mockDecodedVIN.transmission,
      }));

      Alert.alert('Success', 'VIN decoded successfully! Vehicle information has been filled in.');
    } catch (error) {
      Alert.alert('Error', 'Failed to decode VIN. Please check the number and try again.');
    } finally {
      setIsScanningVIN(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.nickname.trim()) {
      Alert.alert('Error', 'Please enter a nickname for your vehicle');
      return false;
    }
    if (!formData.make.trim()) {
      Alert.alert('Error', 'Please enter the vehicle make');
      return false;
    }
    if (!formData.model.trim()) {
      Alert.alert('Error', 'Please enter the vehicle model');
      return false;
    }
    if (!formData.year.trim()) {
      Alert.alert('Error', 'Please enter the vehicle year');
      return false;
    }
    if (!formData.mileage.trim()) {
      Alert.alert('Error', 'Please enter the current mileage');
      return false;
    }
    return true;
  };

  const handleSaveVehicle = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // In a real app, this would save to the store and potentially to a backend
      const vehicleProfile: VehicleProfile = {
        id: Date.now().toString(),
        userId: currentUser?.id || 'unknown',
        vehicleInfo: {
          vin: formData.vin || 'Unknown',
          make: formData.make,
          model: formData.model,
          year: parseInt(formData.year),
          engine: formData.engine || 'Unknown',
          transmission: formData.transmission || 'Unknown',
        },
        nickname: formData.nickname,
        mileage: parseInt(formData.mileage),
        maintenanceHistory: [],
        healthScore: 100,
        lastScanDate: new Date().toISOString(),
      };

      // Here you would dispatch an action to save the vehicle profile
      // dispatch(addVehicleProfile(vehicleProfile));
      
      Alert.alert(
        'Success',
        'Vehicle profile created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save vehicle profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoDetect = () => {
    if (vehicleInfo) {
      Alert.alert(
        'Auto-Detect Vehicle',
        'Vehicle information detected from OBD-II connection. Would you like to use this data?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Use Detected Data',
            onPress: () => {
              setFormData(prev => ({
                ...prev,
                make: vehicleInfo.make || '',
                model: vehicleInfo.model || '',
                year: vehicleInfo.year?.toString() || '',
                engine: vehicleInfo.engine || '',
                transmission: vehicleInfo.transmission || '',
                vin: vehicleInfo.vin || '',
              }));
            },
          },
        ]
      );
    } else {
      Alert.alert('No Vehicle Data', 'No vehicle information detected. Please connect to an OBD-II device first.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="directions-car" size={48} color="#2196F3" />
        <Text style={styles.headerTitle}>Vehicle Setup</Text>
        <Text style={styles.headerSubtitle}>
          Add your vehicle to get personalized diagnostics and maintenance reminders
        </Text>
      </View>

      {/* Auto-Detect Section */}
      {vehicleInfo && (
        <View style={styles.autoDetectSection}>
          <View style={styles.autoDetectHeader}>
            <Icon name="auto-awesome" size={24} color="#4CAF50" />
            <Text style={styles.autoDetectTitle}>Vehicle Detected</Text>
          </View>
          <Text style={styles.autoDetectText}>
            We detected vehicle information from your OBD-II connection
          </Text>
          <TouchableOpacity
            style={styles.autoDetectButton}
            onPress={handleAutoDetect}
          >
            <Text style={styles.autoDetectButtonText}>Use Detected Data</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Vehicle Information Form */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Vehicle Information</Text>

        {/* Nickname */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Vehicle Nickname *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.nickname}
            onChangeText={(value) => handleInputChange('nickname', value)}
            placeholder="e.g., My Daily Driver, Work Truck"
            placeholderTextColor="#999"
          />
        </View>

        {/* VIN */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>VIN (Vehicle Identification Number)</Text>
          <View style={styles.vinContainer}>
            <TextInput
              style={[styles.textInput, styles.vinInput]}
              value={formData.vin}
              onChangeText={(value) => handleInputChange('vin', value.toUpperCase())}
              placeholder="1HGBH41JXMN109186"
              placeholderTextColor="#999"
              maxLength={17}
            />
            <TouchableOpacity
              style={styles.scanVINButton}
              onPress={handleScanVIN}
              disabled={isScanningVIN}
            >
              {isScanningVIN ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Icon name="qr-code-scanner" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.inputHint}>
            Enter the 17-character VIN to auto-fill vehicle details
          </Text>
        </View>

        {/* Make and Model */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.inputLabel}>Make *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.make}
              onChangeText={(value) => handleInputChange('make', value)}
              placeholder="e.g., Toyota"
              placeholderTextColor="#999"
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.inputLabel}>Model *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.model}
              onChangeText={(value) => handleInputChange('model', value)}
              placeholder="e.g., Camry"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Year and Mileage */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.inputLabel}>Year *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.year}
              onChangeText={(value) => handleInputChange('year', value)}
              placeholder="e.g., 2020"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={4}
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.inputLabel}>Current Mileage *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.mileage}
              onChangeText={(value) => handleInputChange('mileage', value)}
              placeholder="e.g., 50000"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Engine and Transmission */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.inputLabel}>Engine</Text>
            <TextInput
              style={styles.textInput}
              value={formData.engine}
              onChangeText={(value) => handleInputChange('engine', value)}
              placeholder="e.g., 2.5L 4-Cylinder"
              placeholderTextColor="#999"
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.inputLabel}>Transmission</Text>
            <TextInput
              style={styles.textInput}
              value={formData.transmission}
              onChangeText={(value) => handleInputChange('transmission', value)}
              placeholder="e.g., 8-Speed Automatic"
              placeholderTextColor="#999"
            />
          </View>
        </View>
      </View>

      {/* Quick Add Options */}
      <View style={styles.quickAddSection}>
        <Text style={styles.sectionTitle}>Quick Add Common Vehicles</Text>
        
        <View style={styles.quickAddGrid}>
          {[
            { make: 'Toyota', model: 'Camry', year: '2020' },
            { make: 'Honda', model: 'Civic', year: '2019' },
            { make: 'Ford', model: 'F-150', year: '2021' },
            { make: 'Chevrolet', model: 'Silverado', year: '2020' },
          ].map((vehicle, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickAddCard}
              onPress={() => {
                setFormData(prev => ({
                  ...prev,
                  make: vehicle.make,
                  model: vehicle.model,
                  year: vehicle.year,
                }));
              }}
            >
              <Text style={styles.quickAddText}>
                {vehicle.year} {vehicle.make} {vehicle.model}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Save Button */}
      <View style={styles.saveSection}>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSaveVehicle}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Icon name="save" size={20} color="white" />
              <Text style={styles.saveButtonText}>Save Vehicle Profile</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Help Text */}
      <View style={styles.helpSection}>
        <Text style={styles.helpText}>
          * Required fields. You can always update this information later in your profile settings.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 24,
    alignItems: 'center',
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  autoDetectSection: {
    backgroundColor: '#E8F5E8',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  autoDetectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  autoDetectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginLeft: 8,
  },
  autoDetectText: {
    fontSize: 14,
    color: '#2E7D32',
    marginBottom: 12,
  },
  autoDetectButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  autoDetectButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  formSection: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  vinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vinInput: {
    flex: 1,
    marginRight: 12,
  },
  scanVINButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  quickAddSection: {
    margin: 16,
  },
  quickAddGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAddCard: {
    backgroundColor: 'white',
    width: '48%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  quickAddText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  saveSection: {
    margin: 16,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  helpSection: {
    margin: 16,
    marginBottom: 32,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default VehicleSetupScreen;
