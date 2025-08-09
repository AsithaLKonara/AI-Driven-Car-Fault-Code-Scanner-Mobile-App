import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootState, AppDispatch } from '../store';
import { scanForDevices, connectToDevice } from '../store/slices/obdSlice';

const DashboardScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isConnected, currentDevice, currentDTCs, liveData } = useSelector(
    (state: RootState) => state.obd
  );
  const { currentUser, currentVehicle } = useSelector(
    (state: RootState) => state.user
  );

  const handleQuickScan = () => {
    if (isConnected) {
      navigation.navigate('Scan');
    } else {
      Alert.alert(
        'Not Connected',
        'Please connect to an OBD-II device first.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Connect', onPress: () => handleConnect() },
        ]
      );
    }
  };

  const handleConnect = async () => {
    try {
      await dispatch(scanForDevices()).unwrap();
      navigation.navigate('Scan');
    } catch (error) {
      Alert.alert('Error', 'Failed to scan for devices. Please check your Bluetooth settings.');
    }
  };

  const handleViewLiveData = () => {
    if (isConnected) {
      navigation.navigate('LiveData');
    } else {
      Alert.alert('Not Connected', 'Please connect to an OBD-II device first.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Car Fault Scanner</Text>
        <Text style={styles.headerSubtitle}>AI-Powered Diagnostics</Text>
      </View>

      {/* Connection Status */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Icon
            name={isConnected ? 'bluetooth-connected' : 'bluetooth-disabled'}
            size={24}
            color={isConnected ? '#4CAF50' : '#F44336'}
          />
          <Text style={styles.statusTitle}>
            {isConnected ? 'Connected' : 'Not Connected'}
          </Text>
        </View>
        {currentDevice && (
          <Text style={styles.deviceName}>{currentDevice.name}</Text>
        )}
        {!isConnected && (
          <TouchableOpacity style={styles.connectButton} onPress={handleConnect}>
            <Text style={styles.connectButtonText}>Connect to OBD-II</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Current Vehicle */}
      {currentVehicle && (
        <View style={styles.vehicleCard}>
          <Text style={styles.cardTitle}>Current Vehicle</Text>
          <Text style={styles.vehicleInfo}>
            {currentVehicle.vehicleInfo.year} {currentVehicle.vehicleInfo.make}{' '}
            {currentVehicle.vehicleInfo.model}
          </Text>
          <Text style={styles.vehicleNickname}>{currentVehicle.nickname}</Text>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={handleQuickScan}>
            <Icon name="search" size={32} color="#2196F3" />
            <Text style={styles.actionTitle}>Quick Scan</Text>
            <Text style={styles.actionDescription}>Read fault codes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleViewLiveData}>
            <Icon name="show-chart" size={32} color="#FF9800" />
            <Text style={styles.actionTitle}>Live Data</Text>
            <Text style={styles.actionDescription}>Real-time monitoring</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('AIChat')}
          >
            <Icon name="chat" size={32} color="#9C27B0" />
            <Text style={styles.actionTitle}>AI Assistant</Text>
            <Text style={styles.actionDescription}>Get help & advice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('History')}
          >
            <Icon name="history" size={32} color="#607D8B" />
            <Text style={styles.actionTitle}>History</Text>
            <Text style={styles.actionDescription}>Past scans & reports</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent DTCs */}
      {currentDTCs.length > 0 && (
        <View style={styles.dtcContainer}>
          <Text style={styles.sectionTitle}>Active Fault Codes</Text>
          {currentDTCs.slice(0, 3).map((dtc, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dtcCard}
              onPress={() => navigation.navigate('DTCDetails', { dtc })}
            >
              <View style={styles.dtcHeader}>
                <Text style={styles.dtcCode}>{dtc.code}</Text>
                <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(dtc.severity) }]}>
                  <Text style={styles.severityText}>{dtc.severity.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.dtcDescription} numberOfLines={2}>
                {dtc.description}
              </Text>
            </TouchableOpacity>
          ))}
          {currentDTCs.length > 3 && (
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('Scan')}
            >
              <Text style={styles.viewAllText}>View All ({currentDTCs.length})</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Live Data Preview */}
      {liveData && (
        <View style={styles.liveDataContainer}>
          <Text style={styles.sectionTitle}>Live Data</Text>
          <View style={styles.liveDataGrid}>
            <View style={styles.liveDataItem}>
              <Text style={styles.liveDataLabel}>RPM</Text>
              <Text style={styles.liveDataValue}>{liveData.rpm.toFixed(0)}</Text>
            </View>
            <View style={styles.liveDataItem}>
              <Text style={styles.liveDataLabel}>Speed</Text>
              <Text style={styles.liveDataValue}>{liveData.speed} mph</Text>
            </View>
            <View style={styles.liveDataItem}>
              <Text style={styles.liveDataLabel}>Coolant</Text>
              <Text style={styles.liveDataValue}>{liveData.coolantTemp}°C</Text>
            </View>
            <View style={styles.liveDataItem}>
              <Text style={styles.liveDataLabel}>Throttle</Text>
              <Text style={styles.liveDataValue}>{liveData.throttlePosition.toFixed(1)}%</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
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
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  statusCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  deviceName: {
    fontSize: 14,
    color: '#666',
    marginLeft: 32,
  },
  connectButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  connectButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  vehicleCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  vehicleInfo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  vehicleNickname: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  actionsContainer: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: 'white',
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  dtcContainer: {
    margin: 16,
  },
  dtcCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  },
  viewAllButton: {
    padding: 12,
    alignItems: 'center',
  },
  viewAllText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  liveDataContainer: {
    margin: 16,
  },
  liveDataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  liveDataItem: {
    backgroundColor: 'white',
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  liveDataLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  liveDataValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default DashboardScreen; 