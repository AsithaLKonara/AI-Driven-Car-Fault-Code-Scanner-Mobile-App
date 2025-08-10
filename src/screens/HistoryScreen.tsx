import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootState } from '../store';
import { ScanRecord, MaintenanceRecord } from '../types';

const HistoryScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<'scans' | 'maintenance'>('scans');
  const { scanHistory } = useSelector((state: RootState) => state.user);
  const { currentVehicle } = useSelector((state: RootState) => state.user);

  // Mock data for demonstration
  const mockScanHistory: ScanRecord[] = [
    {
      id: '1',
      timestamp: Date.now() - 86400000, // 1 day ago
      vehicleId: 'vehicle1',
      dtcs: [
        { code: 'P0300', description: 'Random/Multiple Cylinder Misfire Detected', severity: 'high', category: 'Powertrain' },
        { code: 'P0171', description: 'System Too Lean (Bank 1)', severity: 'medium', category: 'Powertrain' },
      ],
      notes: 'Engine running rough, check spark plugs and fuel system',
    },
    {
      id: '2',
      timestamp: Date.now() - 172800000, // 2 days ago
      vehicleId: 'vehicle1',
      dtcs: [],
      notes: 'Routine scan - no issues found',
    },
    {
      id: '3',
      timestamp: Date.now() - 259200000, // 3 days ago
      vehicleId: 'vehicle1',
      dtcs: [
        { code: 'P0420', description: 'Catalyst System Efficiency Below Threshold', severity: 'medium', category: 'Powertrain' },
      ],
      notes: 'Catalytic converter may need replacement',
    },
  ];

  const mockMaintenanceHistory: MaintenanceRecord[] = [
    {
      id: '1',
      date: '2024-01-15',
      type: 'oil_change',
      description: 'Synthetic oil change and filter replacement',
      cost: 45.00,
      mileage: 75000,
      location: 'Local Auto Shop',
      notes: 'Used 5W-30 synthetic oil',
    },
    {
      id: '2',
      date: '2024-01-10',
      type: 'brake_service',
      description: 'Front brake pad replacement and rotor resurfacing',
      cost: 180.00,
      mileage: 74800,
      location: 'Local Auto Shop',
      notes: 'Brakes working well now',
    },
    {
      id: '3',
      date: '2023-12-20',
      type: 'tire_rotation',
      description: 'Tire rotation and balance',
      cost: 25.00,
      mileage: 73000,
      location: 'Local Auto Shop',
      notes: 'Tires wearing evenly',
    },
  ];

  const renderScanItem = ({ item }: { item: ScanRecord }) => (
    <TouchableOpacity
      style={styles.historyCard}
      onPress={() => navigation.navigate('DTCDetails', { dtc: item.dtcs[0] || null })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.dateContainer}>
          <Icon name="schedule" size={16} color="#666" />
          <Text style={styles.dateText}>
            {new Date(item.timestamp).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          {item.dtcs.length > 0 ? (
            <View style={styles.issueBadge}>
              <Icon name="warning" size={16} color="#FF9800" />
              <Text style={styles.issueText}>{item.dtcs.length} Issue{item.dtcs.length !== 1 ? 's' : ''}</Text>
            </View>
          ) : (
            <View style={styles.clearBadge}>
              <Icon name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.clearText}>Clear</Text>
            </View>
          )}
        </View>
      </View>

      {item.dtcs.length > 0 && (
        <View style={styles.dtcPreview}>
          {item.dtcs.slice(0, 2).map((dtc, index) => (
            <View key={index} style={styles.dtcItem}>
              <Text style={styles.dtcCode}>{dtc.code}</Text>
              <Text style={styles.dtcDescription} numberOfLines={1}>
                {dtc.description}
              </Text>
            </View>
          ))}
          {item.dtcs.length > 2 && (
            <Text style={styles.moreDTCs}>+{item.dtcs.length - 2} more</Text>
          )}
        </View>
      )}

      {item.notes && (
        <Text style={styles.notes} numberOfLines={2}>
          {item.notes}
        </Text>
      )}

      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.viewButton}>
          <Text style={styles.viewButtonText}>View Details</Text>
          <Icon name="arrow-forward" size={16} color="#2196F3" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderMaintenanceItem = ({ item }: { item: MaintenanceRecord }) => (
    <View style={styles.historyCard}>
      <View style={styles.cardHeader}>
        <View style={styles.dateContainer}>
          <Icon name="schedule" size={16} color="#666" />
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        <View style={styles.costContainer}>
          <Text style={styles.costText}>${item.cost.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.maintenanceInfo}>
        <View style={[styles.typeBadge, { backgroundColor: getMaintenanceTypeColor(item.type) }]}>
          <Text style={styles.typeText}>{getMaintenanceTypeLabel(item.type)}</Text>
        </View>
        <Text style={styles.mileageText}>{item.mileage.toLocaleString()} miles</Text>
      </View>

      <Text style={styles.description}>{item.description}</Text>

      {item.location && (
        <View style={styles.locationContainer}>
          <Icon name="location-on" size={16} color="#666" />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
      )}

      {item.notes && (
        <Text style={styles.notes} numberOfLines={2}>
          {item.notes}
        </Text>
      )}
    </View>
  );

  const getMaintenanceTypeColor = (type: string): string => {
    switch (type) {
      case 'oil_change': return '#4CAF50';
      case 'brake_service': return '#FF9800';
      case 'tire_rotation': return '#2196F3';
      case 'inspection': return '#9C27B0';
      case 'repair': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getMaintenanceTypeLabel = (type: string): string => {
    switch (type) {
      case 'oil_change': return 'Oil Change';
      case 'brake_service': return 'Brake Service';
      case 'tire_rotation': return 'Tire Rotation';
      case 'inspection': return 'Inspection';
      case 'repair': return 'Repair';
      default: return 'Other';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
        <Text style={styles.headerSubtitle}>Track your vehicle's health</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'scans' && styles.activeTab]}
          onPress={() => setActiveTab('scans')}
        >
          <Icon name="search" size={20} color={activeTab === 'scans' ? '#2196F3' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'scans' && styles.activeTabText]}>
            Scan History
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'maintenance' && styles.activeTab]}
          onPress={() => setActiveTab('maintenance')}
        >
          <Icon name="build" size={20} color={activeTab === 'maintenance' ? '#2196F3' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'maintenance' && styles.activeTabText]}>
            Maintenance
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'scans' ? (
        <FlatList
          data={mockScanHistory}
          renderItem={renderScanItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={mockMaintenanceHistory}
          renderItem={renderMaintenanceItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Empty State */}
      {((activeTab === 'scans' && mockScanHistory.length === 0) ||
        (activeTab === 'maintenance' && mockMaintenanceHistory.length === 0)) && (
        <View style={styles.emptyState}>
          <Icon name="history" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>
            No {activeTab === 'scans' ? 'scan' : 'maintenance'} history yet
          </Text>
          <Text style={styles.emptyStateSubtext}>
            {activeTab === 'scans' 
              ? 'Start by performing your first diagnostic scan'
              : 'Add your first maintenance record'
            }
          </Text>
        </View>
      )}
    </View>
  );
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#E3F2FD',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#2196F3',
  },
  listContainer: {
    padding: 16,
  },
  historyCard: {
    backgroundColor: 'white',
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  issueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  issueText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  clearBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  clearText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  dtcPreview: {
    marginBottom: 12,
  },
  dtcItem: {
    marginBottom: 8,
  },
  dtcCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dtcDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  moreDTCs: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  maintenanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  mileageText: {
    fontSize: 14,
    color: '#666',
  },
  costContainer: {
    alignItems: 'flex-end',
  },
  costText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    lineHeight: 22,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  notes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  cardFooter: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  viewButtonText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
    marginRight: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default HistoryScreen;
