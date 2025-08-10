import React, { useEffect, useState } from 'react';
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
import { RootState, AppDispatch } from '../store';
import { explainDTC } from '../store/slices/aiSlice';
import { DiagnosticTroubleCode, AIResponse } from '../types';

const DTCDetailsScreen = ({ route, navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { dtc } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);

  const { vehicleInfo } = useSelector((state: RootState) => state.obd);
  const { currentAnalysis } = useSelector((state: RootState) => state.ai);

  useEffect(() => {
    // Get AI explanation when component mounts
    handleGetAIExplanation();
  }, []);

  useEffect(() => {
    // Update AI response when analysis is complete
    if (currentAnalysis) {
      setAiResponse(currentAnalysis);
    }
  }, [currentAnalysis]);

  const handleGetAIExplanation = async () => {
    if (aiResponse) return; // Already have response

    setIsLoading(true);
    try {
      await dispatch(explainDTC({ dtc, vehicleInfo })).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to get AI explanation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshExplanation = async () => {
    setIsLoading(true);
    try {
      await dispatch(explainDTC({ dtc, vehicleInfo })).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh explanation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatWithAI = () => {
    navigation.navigate('AIChat');
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

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'check-circle';
      default: return 'help';
    }
  };

  const renderSeverityBadge = () => (
    <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(dtc.severity) }]}>
      <Icon name={getSeverityIcon(dtc.severity)} size={16} color="white" />
      <Text style={styles.severityText}>{dtc.severity.toUpperCase()}</Text>
    </View>
  );

  const renderRepairSteps = () => {
    if (!aiResponse?.repairSuggestions || aiResponse.repairSuggestions.length === 0) {
      return (
        <View style={styles.noStepsContainer}>
          <Icon name="build" size={48} color="#ccc" />
          <Text style={styles.noStepsText}>No repair steps available</Text>
        </View>
      );
    }

    return aiResponse.repairSuggestions.map((step, index) => (
      <View key={step.id} style={styles.stepCard}>
        <View style={styles.stepHeader}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>{index + 1}</Text>
          </View>
          <View style={styles.stepInfo}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDescription}>{step.description}</Text>
          </View>
        </View>
        <View style={styles.stepDetails}>
          <View style={styles.stepDetail}>
            <Icon name="schedule" size={16} color="#666" />
            <Text style={styles.stepDetailText}>{step.estimatedTime}</Text>
          </View>
          <View style={styles.stepDetail}>
            <Icon name="build" size={16} color="#666" />
            <Text style={styles.stepDetailText}>
              {step.difficulty.charAt(0).toUpperCase() + step.difficulty.slice(1)}
            </Text>
          </View>
        </View>
      </View>
    ));
  };

  const renderCostEstimate = () => {
    if (!aiResponse?.estimatedCost) return null;

    return (
      <View style={styles.costContainer}>
        <Text style={styles.costTitle}>Estimated Cost</Text>
        <View style={styles.costRange}>
          <Text style={styles.costMin}>${aiResponse.estimatedCost.min}</Text>
          <Text style={styles.costSeparator}>-</Text>
          <Text style={styles.costMax}>${aiResponse.estimatedCost.max}</Text>
        </View>
        <Text style={styles.costCurrency}>{aiResponse.estimatedCost.currency}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.dtcHeader}>
          <Text style={styles.dtcCode}>{dtc.code}</Text>
          {renderSeverityBadge()}
        </View>
        <Text style={styles.dtcDescription}>{dtc.description}</Text>
        <Text style={styles.dtcCategory}>{dtc.category}</Text>
      </View>

      {/* AI Explanation */}
      <View style={styles.aiSection}>
        <View style={styles.sectionHeader}>
          <Icon name="psychology" size={24} color="#9C27B0" />
          <Text style={styles.sectionTitle}>AI Explanation</Text>
          <TouchableOpacity onPress={handleRefreshExplanation} style={styles.refreshButton}>
            <Icon name="refresh" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9C27B0" />
            <Text style={styles.loadingText}>AI is analyzing your fault code...</Text>
          </View>
        ) : aiResponse ? (
          <View style={styles.aiContent}>
            <Text style={styles.explanationText}>{aiResponse.explanation}</Text>
            
            {/* Possible Causes */}
            {aiResponse.possibleCauses && aiResponse.possibleCauses.length > 0 && (
              <View style={styles.causesContainer}>
                <Text style={styles.causesTitle}>Possible Causes:</Text>
                {aiResponse.possibleCauses.map((cause, index) => (
                  <View key={index} style={styles.causeItem}>
                    <Icon name="radio-button-unchecked" size={16} color="#666" />
                    <Text style={styles.causeText}>{cause}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Urgency */}
            <View style={styles.urgencyContainer}>
              <Icon name="schedule" size={20} color="#FF9800" />
              <Text style={styles.urgencyText}>
                Urgency: {aiResponse.urgency.charAt(0).toUpperCase() + aiResponse.urgency.slice(1)}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.noExplanationContainer}>
            <Icon name="psychology" size={48} color="#ccc" />
            <Text style={styles.noExplanationText}>No AI explanation available</Text>
            <TouchableOpacity style={styles.getExplanationButton} onPress={handleGetAIExplanation}>
              <Text style={styles.getExplanationButtonText}>Get AI Explanation</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Repair Steps */}
      {aiResponse && (
        <View style={styles.repairSection}>
          <View style={styles.sectionHeader}>
            <Icon name="build" size={24} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Repair Steps</Text>
          </View>
          {renderRepairSteps()}
        </View>
      )}

      {/* Cost Estimate */}
      {aiResponse && renderCostEstimate()}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.chatButton} onPress={handleChatWithAI}>
          <Icon name="chat" size={20} color="white" />
          <Text style={styles.chatButtonText}>Chat with AI Assistant</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.shareButton}>
          <Icon name="share" size={20} color="#666" />
          <Text style={styles.shareButtonText}>Share Report</Text>
        </TouchableOpacity>
      </View>

      {/* Additional Info */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Additional Information</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Code Type</Text>
            <Text style={styles.infoValue}>{dtc.category}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Severity</Text>
            <Text style={styles.infoValue}>{dtc.severity}</Text>
          </View>
          {dtc.timestamp && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Detected</Text>
              <Text style={styles.infoValue}>
                {new Date(dtc.timestamp).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
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
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dtcHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dtcCode: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  severityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dtcDescription: {
    fontSize: 18,
    color: '#333',
    marginBottom: 8,
    lineHeight: 24,
  },
  dtcCategory: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  aiSection: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  refreshButton: {
    padding: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  aiContent: {
    gap: 16,
  },
  explanationText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  causesContainer: {
    gap: 8,
  },
  causesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  causeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  causeText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  urgencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
  },
  urgencyText: {
    fontSize: 14,
    color: '#E65100',
    fontWeight: '500',
  },
  noExplanationContainer: {
    alignItems: 'center',
    padding: 32,
  },
  noExplanationText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  getExplanationButton: {
    backgroundColor: '#9C27B0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  getExplanationButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  repairSection: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  noStepsContainer: {
    alignItems: 'center',
    padding: 32,
  },
  noStepsText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  stepCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  stepHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  stepDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  stepDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepDetailText: {
    fontSize: 12,
    color: '#666',
  },
  costContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  costTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  costRange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  costMin: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  costSeparator: {
    fontSize: 18,
    color: '#666',
    marginHorizontal: 8,
  },
  costMax: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  costCurrency: {
    fontSize: 14,
    color: '#666',
  },
  actionsContainer: {
    margin: 16,
    gap: 12,
  },
  chatButton: {
    backgroundColor: '#9C27B0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  chatButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shareButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  shareButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  infoSection: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});

export default DTCDetailsScreen;
