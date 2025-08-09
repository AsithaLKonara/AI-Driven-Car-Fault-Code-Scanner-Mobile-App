import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootState, AppDispatch } from '../store';
import {
  scanForDevices,
  connectToDevice,
  disconnectDevice,
  readDTCs,
  clearDTCs,
} from '../store/slices/obdSlice';
import { explainDTC } from '../store/slices/aiSlice';

const ScanScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isReading, setIsReading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const {
    isConnected,
    currentDevice,
    availableDevices,
    isScanning,
    currentDTCs,
  } = useSelector((state: RootState) => state.obd);
  
  const { isProcessing } = useSelector((state: RootState) => state.ai);

  const handleScanForDevices = async () => {
    try {
      await dispatch(scanForDevices()).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to scan for devices. Please check your Bluetooth settings.');
    }
  };

  const handleConnectToDevice = async (deviceId: string) => {
    try {
      await dispatch(connectToDevice(deviceId)).unwrap();
      Alert.alert('Success', 'Connected to OBD-II device successfully!');
    } catch (error) {
      Alert.alert('Error', `Failed to connect: ${error}`);
    }
  };

  const handleDisconnect = async () => {
    try {
      await dispatch(disconnectDevice()).unwrap();
      Alert.alert('Success', 'Disconnected from OBD-II device.');
    } catch (error) {
      Alert.alert('Error', 'Failed to disconnect device.');
    }
  };

  const handleReadDTCs = async () => {
    if (!isConnected) {
      Alert.alert('Error', 'Please connect to an OBD-II device first.');
      return;
    }

    setIsReading(true);
    try {
      await dispatch(readDTCs()).unwrap();
      Alert.alert('Success', `Found ${currentDTCs.length} diagnostic trouble codes.`);
    } catch (error) {
      Alert.alert('Error', `Failed to read DTCs: ${error}`);
    } finally {
      setIsReading(false);
    }
  };

  const handleClearDTCs = async () => {
    if (!isConnected) {
      Alert.alert('Error', 'Please connect to an OBD-II device first.');
      return;
    }

    Alert.alert(
      'Clear Fault Codes',
      'Are you sure you want to clear all diagnostic trouble codes? This will also turn off the Check Engine Light.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              await dispatch(clearDTCs()).unwrap();
              Alert.alert('Success', 'Diagnostic trouble codes cleared successfully.');
            } catch (error) {
              Alert.alert('Error', `Failed to clear DTCs: ${error}`);
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  };

  const handleDTCPress = async (dtc: any) => {
    navigation.navigate('DTCDetails', { dtc });
    
    // Get AI explanation in the background
    try {
      await dispatch(explainDTC({ dtc }));
    } catch (error) {
      console.log('Failed to get AI explanation:', error);
    }
  };

  const renderDeviceItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => handleConnectToDevice(item.id)}
    >
      <Icon name="bluetooth" size={24} color="#2196F3" />
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{item.name}</Text>
        <Text style={styles.deviceAddress}>{item.address}</Text>
      </View>
      <Icon name="chevron-right" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  const renderDTCItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.dtcItem} onPress={() => handleDTCPress(item)}>
      <View style={styles.dtcHeader}>
        <Text style={styles.dtcCode}>{item.code}</Text>
        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
          <Text style={styles.severityText}>{item.severity.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.dtcDescription}>{item.description}</Text>
      <Text style={styles.dtcCategory}>{item.category}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Connection Section */}
      <View style={styles.connectionSection}>
        <View style={styles.connectionHeader}>
          <Icon
            name={isConnected ? 'bluetooth-connected' : 'bluetooth-disabled'}
            size={24}
            color={isConnected ? '#4CAF50' : '#F44336'}
          />
          <Text style={styles.connectionTitle}>
            {isConnected ? 'Connected' : 'Not Connected'}
          </Text>
        </View>
        
        {currentDevice && (
          <View style={styles.currentDevice}>
            <Text style={styles.deviceName}>{currentDevice.name}</Text>
            <TouchableOpacity style={styles.disconnectButton} onPress={handleDisconnect}>
              <Text style={styles.disconnectButtonText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isConnected && (
          <TouchableOpacity
            style={styles.scanButton}
            onPress={handleScanForDevices}
            disabled={isScanning}
          >
            {isScanning ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.scanButtonText}>Scan for Devices</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Available Devices */}
      {!isConnected && availableDevices.length > 0 && (
        <View style={styles.devicesSection}>
          <Text style={styles.sectionTitle}>Available Devices</Text>
          <FlatList
            data={availableDevices}
            renderItem={renderDeviceItem}
            keyExtractor={(item) => item.id}
            style={styles.devicesList}
          />
        </View>
      )}

      {/* Scan Controls */}
      {isConnected && (
        <View style={styles.controlsSection}>
          <TouchableOpacity
            style={[styles.controlButton, styles.readButton]}
            onPress={handleReadDTCs}
            disabled={isReading}
          >
            {isReading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Icon name="search" size={20} color="white" />
                <Text style={styles.controlButtonText}>Read Fault Codes</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.clearButton]}
            onPress={handleClearDTCs}
            disabled={isClearing || currentDTCs.length === 0}
          >
            {isClearing ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Icon name="clear" size={20} color="white" />
                <Text style={styles.controlButtonText}>Clear Codes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Diagnostic Trouble Codes */}
      {currentDTCs.length > 0 && (
        <View style={styles.dtcsSection}>
          <Text style={styles.sectionTitle}>
            Fault Codes ({currentDTCs.length})
          </Text>
          <FlatList
            data={currentDTCs}
            renderItem={renderDTCItem}
            keyExtractor={(item, index) => `${item.code}-${index}`}
            style={styles.dtcsList}
          />
        </View>
      )}

      {/* Empty State */}
      {isConnected && currentDTCs.length === 0 && !isReading && (
        <View style={styles.emptyState}>
          <Icon name="check-circle" size={64} color="#4CAF50" />
          <Text style={styles.emptyStateTitle}>No Fault Codes Found</Text>
          <Text style={styles.emptyStateMessage}>
            Your vehicle appears to be running normally. No diagnostic trouble codes were detected.
          </Text>
        </View>
      )}
    </View>
  );
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return '#F44336';
    case 'high': return '#FF9800';
    case 'medium': return '#FFC107';
    case 'low': return '#4CAF50';
    default: return '#9E9E9E';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  connectionSection: {
    backgroundColor: 'white',
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  connectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  connectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  currentDevice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
  },
  disconnectButton: {
    backgroundColor: '#F44336',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  disconnectButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  scanButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  devicesSection: {
    backgroundColor: 'white',
    marginTop: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  devicesList: {
    maxHeight: 200,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  deviceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  deviceAddress: {
    fontSize: 12,
    color: '#666',
  },
  controlsSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  readButton: {
    backgroundColor: '#4CAF50',
  },
  clearButton: {
    backgroundColor: '#FF5722',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dtcsSection: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 8,
    padding: 16,
  },
  dtcsList: {
    flex: 1,
  },
  dtcItem: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  dtcHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dtcCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  severityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  dtcDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dtcCategory: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ScanScreen; 