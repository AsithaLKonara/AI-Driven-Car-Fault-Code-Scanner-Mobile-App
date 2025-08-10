import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootState, AppDispatch } from '../store';
import { UserPreferences } from '../types';

const SettingsScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { preferences } = useSelector((state: RootState) => state.user);
  
  // Local state for settings
  const [localPreferences, setLocalPreferences] = useState<UserPreferences>({
    units: 'imperial',
    language: 'en',
    notifications: {
      maintenance: true,
      dtcAlerts: true,
      community: false,
    },
    privacy: {
      shareData: false,
      analytics: true,
    },
  });

  const handleUnitChange = (unit: 'metric' | 'imperial') => {
    setLocalPreferences(prev => ({
      ...prev,
      units: unit,
    }));
  };

  const handleNotificationChange = (type: keyof typeof localPreferences.notifications, value: boolean) => {
    setLocalPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: value,
      },
    }));
  };

  const handlePrivacyChange = (type: keyof typeof localPreferences.privacy, value: boolean) => {
    setLocalPreferences(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [type]: value,
      },
    }));
  };

  const handleSaveSettings = () => {
    // Here you would dispatch an action to save preferences
    Alert.alert('Success', 'Settings saved successfully!');
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'Data export feature coming soon!');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          // Handle account deletion
          console.log('Account deletion requested');
        }},
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About Car Fault Scanner',
      'Version 1.0.0\n\nAI-powered car diagnostic tool that helps you understand and resolve vehicle issues.\n\n© 2024 Car Fault Scanner'
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Customize your experience</Text>
      </View>

      {/* Units Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Display Units</Text>
        <View style={styles.unitSelector}>
          <TouchableOpacity
            style={[
              styles.unitOption,
              localPreferences.units === 'metric' && styles.unitOptionActive
            ]}
            onPress={() => handleUnitChange('metric')}
          >
            <Text style={[
              styles.unitOptionText,
              localPreferences.units === 'metric' && styles.unitOptionTextActive
            ]}>
              Metric (km/h, °C)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.unitOption,
              localPreferences.units === 'imperial' && styles.unitOptionActive
            ]}
            onPress={() => handleUnitChange('imperial')}
          >
            <Text style={[
              styles.unitOptionText,
              localPreferences.units === 'imperial' && styles.unitOptionTextActive
            ]}>
              Imperial (mph, °F)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="build" size={24} color="#4CAF50" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Maintenance Reminders</Text>
              <Text style={styles.settingDescription}>Get notified about upcoming maintenance</Text>
            </View>
          </View>
          <Switch
            value={localPreferences.notifications.maintenance}
            onValueChange={(value) => handleNotificationChange('maintenance', value)}
            trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
            thumbColor={localPreferences.notifications.maintenance ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="warning" size={24} color="#FF9800" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>DTC Alerts</Text>
              <Text style={styles.settingDescription}>Notifications for new fault codes</Text>
            </View>
          </View>
          <Switch
            value={localPreferences.notifications.dtcAlerts}
            onValueChange={(value) => handleNotificationChange('dtcAlerts', value)}
            trackColor={{ false: '#E0E0E0', true: '#FF9800' }}
            thumbColor={localPreferences.notifications.dtcAlerts ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="people" size={24} color="#9C27B0" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Community Updates</Text>
              <Text style={styles.settingDescription}>News and community features</Text>
            </View>
          </View>
          <Switch
            value={localPreferences.notifications.community}
            onValueChange={(value) => handleNotificationChange('community', value)}
            trackColor={{ false: '#E0E0E0', true: '#9C27B0' }}
            thumbColor={localPreferences.notifications.community ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Privacy Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy & Data</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="share" size={24} color="#2196F3" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Share Diagnostic Data</Text>
              <Text style={styles.settingDescription}>Help improve diagnostic accuracy</Text>
            </View>
          </View>
          <Switch
            value={localPreferences.privacy.shareData}
            onValueChange={(value) => handlePrivacyChange('shareData', value)}
            trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
            thumbColor={localPreferences.privacy.shareData ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="analytics" size={24} color="#607D8B" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Analytics</Text>
              <Text style={styles.settingDescription}>Help improve app performance</Text>
            </View>
          </View>
          <Switch
            value={localPreferences.privacy.analytics}
            onValueChange={(value) => handlePrivacyChange('analytics', value)}
            trackColor={{ false: '#E0E0E0', true: '#607D8B' }}
            thumbColor={localPreferences.privacy.analytics ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="person" size={24} color="#FF9800" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Edit Profile</Text>
              <Text style={styles.settingDescription}>Update your personal information</Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="security" size={24} color="#4CAF50" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Change Password</Text>
              <Text style={styles.settingDescription}>Update your account password</Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="download" size={24} color="#2196F3" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Export Data</Text>
              <Text style={styles.settingDescription}>Download your diagnostic history</Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="help" size={24} color="#9C27B0" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Help & FAQ</Text>
              <Text style={styles.settingDescription}>Find answers to common questions</Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="email" size={24} color="#FF9800" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Contact Support</Text>
              <Text style={styles.settingDescription}>Get help from our team</Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handleAbout}>
          <View style={styles.settingInfo}>
            <Icon name="info" size={24} color="#607D8B" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>About</Text>
              <Text style={styles.settingDescription}>App version and information</Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>

      {/* Danger Zone */}
      <View style={styles.dangerSection}>
        <Text style={styles.dangerSectionTitle}>Danger Zone</Text>
        <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
          <Icon name="delete-forever" size={20} color="#F44336" />
          <Text style={styles.dangerButtonText}>Delete Account</Text>
        </TouchableOpacity>
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
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  unitSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  unitOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  unitOptionActive: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  unitOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  unitOptionTextActive: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dangerSection: {
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
  dangerSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 16,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#F44336',
  },
  dangerButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default SettingsScreen;
