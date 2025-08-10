import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { VictoryLine, VictoryChart, VictoryAxis, VictoryTheme } from 'victory-native';
import { RootState, AppDispatch } from '../store';
import { startLiveData, stopLiveData } from '../store/slices/obdSlice';
import { analyzeLiveData } from '../store/slices/aiSlice';
import { LiveData } from '../types';

const LiveDataScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [dataHistory, setDataHistory] = useState<LiveData[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'rpm' | 'speed' | 'temp' | 'throttle'>('rpm');

  const { isConnected, liveData, vehicleInfo } = useSelector((state: RootState) => state.obd);
  const { isProcessing } = useSelector((state: RootState) => state.ai);

  useEffect(() => {
    if (liveData) {
      setDataHistory(prev => [...prev, liveData].slice(-50)); // Keep last 50 readings
    }
  }, [liveData]);

  const handleStartMonitoring = async () => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Please connect to an OBD-II device first.');
      return;
    }

    try {
      setIsMonitoring(true);
      await dispatch(startLiveData()).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to start live data monitoring.');
      setIsMonitoring(false);
    }
  };

  const handleStopMonitoring = async () => {
    try {
      await dispatch(stopLiveData()).unwrap();
      setIsMonitoring(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to stop live data monitoring.');
    }
  };

  const handleAnalyzeData = async () => {
    if (dataHistory.length === 0) {
      Alert.alert('No Data', 'Please collect some live data first.');
      return;
    }

    try {
      await dispatch(analyzeLiveData({ liveData: dataHistory, vehicleInfo })).unwrap();
      Alert.alert('Analysis Complete', 'Check the AI Assistant for detailed recommendations.');
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze data. Please try again.');
    }
  };

  const getMetricData = () => {
    return dataHistory.map((data, index) => ({
      x: index,
      y: getMetricValue(data, selectedMetric),
    }));
  };

  const getMetricValue = (data: LiveData, metric: string) => {
    switch (metric) {
      case 'rpm': return data.rpm;
      case 'speed': return data.speed;
      case 'temp': return data.coolantTemp;
      case 'throttle': return data.throttlePosition;
      default: return 0;
    }
  };

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'rpm': return 'RPM';
      case 'speed': return 'Speed (mph)';
      case 'temp': return 'Coolant Temp (°C)';
      case 'throttle': return 'Throttle Position (%)';
      default: return '';
    }
  };

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'rpm': return '#FF5722';
      case 'speed': return '#2196F3';
      case 'temp': return '#FF9800';
      case 'throttle': return '#4CAF50';
      default: return '#9C27B0';
    }
  };

  const renderMetricCard = (title: string, value: number, unit: string, icon: string, color: string) => (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <Icon name={icon} size={24} color={color} />
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={[styles.metricValue, { color }]}>
        {value.toFixed(1)} {unit}
      </Text>
    </View>
  );

  const renderChart = () => {
    if (dataHistory.length < 2) {
      return (
        <View style={styles.noDataContainer}>
          <Icon name="show-chart" size={48} color="#ccc" />
          <Text style={styles.noDataText}>Collect data to see charts</Text>
        </View>
      );
    }

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{getMetricLabel(selectedMetric)} Over Time</Text>
        <VictoryChart
          theme={VictoryTheme.material}
          width={350}
          height={200}
          padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
        >
          <VictoryAxis
            dependentAxis
            tickFormat={(t: any) => `${t}`}
            style={{
              axis: { stroke: '#ccc' },
              grid: { stroke: '#f0f0f0' },
              tickLabels: { fontSize: 10, fill: '#666' },
            }}
          />
          <VictoryAxis
            tickFormat={(t: any) => `${t}s`}
            style={{
              axis: { stroke: '#ccc' },
              tickLabels: { fontSize: 10, fill: '#666' },
            }}
          />
          <VictoryLine
            data={getMetricData()}
            style={{
              data: { stroke: getMetricColor(selectedMetric), strokeWidth: 2 },
            }}
            animate={{
              duration: 2000,
              onLoad: { duration: 1000 },
            }}
          />
        </VictoryChart>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live Data Monitor</Text>
        <Text style={styles.headerSubtitle}>Real-time Vehicle Diagnostics</Text>
      </View>

      {/* Connection Status */}
      {!isConnected && (
        <View style={styles.connectionWarning}>
          <Icon name="bluetooth-disabled" size={24} color="#F44336" />
          <Text style={styles.connectionWarningText}>
            Connect to OBD-II device to view live data
          </Text>
        </View>
      )}

      {/* Monitoring Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            isMonitoring ? styles.stopButton : styles.startButton,
          ]}
          onPress={isMonitoring ? handleStopMonitoring : handleStartMonitoring}
          disabled={!isConnected}
        >
          <Icon
            name={isMonitoring ? 'stop' : 'play-arrow'}
            size={20}
            color="white"
          />
          <Text style={styles.controlButtonText}>
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Text>
        </TouchableOpacity>

        {dataHistory.length > 0 && (
          <TouchableOpacity
            style={styles.analyzeButton}
            onPress={handleAnalyzeData}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Icon name="psychology" size={20} color="white" />
                <Text style={styles.analyzeButtonText}>AI Analysis</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Current Metrics Grid */}
      {liveData && (
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>Current Readings</Text>
          <View style={styles.metricsGrid}>
            {renderMetricCard('RPM', liveData.rpm, 'rpm', 'speed', '#FF5722')}
            {renderMetricCard('Speed', liveData.speed, 'mph', 'speed', '#2196F3')}
            {renderMetricCard('Coolant', liveData.coolantTemp, '°C', 'thermostat', '#FF9800')}
            {renderMetricCard('Throttle', liveData.throttlePosition, '%', 'speed', '#4CAF50')}
            {renderMetricCard('Engine Load', liveData.engineLoad, '%', 'build', '#9C27B0')}
            {renderMetricCard('Fuel Level', liveData.fuelLevel, '%', 'local-gas-station', '#607D8B')}
          </View>
        </View>
      )}

      {/* Chart Section */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Data Visualization</Text>
        
        {/* Metric Selector */}
        <View style={styles.metricSelector}>
          {(['rpm', 'speed', 'temp', 'throttle'] as const).map((metric) => (
            <TouchableOpacity
              key={metric}
              style={[
                styles.metricTab,
                selectedMetric === metric && styles.metricTabActive,
              ]}
              onPress={() => setSelectedMetric(metric)}
            >
              <Text style={[
                styles.metricTabText,
                selectedMetric === metric && styles.metricTabTextActive,
              ]}>
                {getMetricLabel(metric)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {renderChart()}
      </View>

      {/* Data Statistics */}
      {dataHistory.length > 0 && (
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Data Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Data Points</Text>
              <Text style={styles.statValue}>{dataHistory.length}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Duration</Text>
              <Text style={styles.statValue}>
                {Math.round(dataHistory.length * 0.5)}s
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Status</Text>
              <Text style={[styles.statValue, { color: isMonitoring ? '#4CAF50' : '#F44336' }]}>
                {isMonitoring ? 'Active' : 'Stopped'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Empty State */}
      {!isMonitoring && dataHistory.length === 0 && (
        <View style={styles.emptyState}>
          <Icon name="show-chart" size={64} color="#ccc" />
          <Text style={styles.emptyStateTitle}>No Live Data</Text>
          <Text style={styles.emptyStateMessage}>
            Start monitoring to see real-time vehicle data and charts
          </Text>
        </View>
      )}
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
  connectionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  connectionWarningText: {
    marginLeft: 12,
    color: '#D32F2F',
    flex: 1,
  },
  controlsContainer: {
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
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  analyzeButton: {
    backgroundColor: '#9C27B0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  metricsContainer: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: 'white',
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  chartSection: {
    margin: 16,
  },
  metricSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 4,
  },
  metricTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  metricTabActive: {
    backgroundColor: '#2196F3',
  },
  metricTabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  metricTabTextActive: {
    color: 'white',
  },
  chartContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  noDataContainer: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  noDataText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  statsContainer: {
    margin: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    backgroundColor: 'white',
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 32,
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

export default LiveDataScreen; 