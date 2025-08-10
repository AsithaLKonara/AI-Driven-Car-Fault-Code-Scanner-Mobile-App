import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootState, AppDispatch } from '../store';
import { User, VehicleProfile } from '../types';

const ProfileScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser, currentVehicle } = useSelector(
    (state: RootState) => state.user
  );

  const handleEditProfile = () => {
    // Navigate to profile edit screen
    Alert.alert('Edit Profile', 'Profile editing feature coming soon!');
  };

  const handleVehicleSetup = () => {
    navigation.navigate('VehicleSetup');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const handlePremium = () => {
    navigation.navigate('Premium');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => {
          // Handle logout logic
          console.log('User logged out');
        }},
      ]
    );
  };

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Icon name="person" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>No Profile Found</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => {}}>
            <Text style={styles.loginButtonText}>Login or Create Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          {currentUser.avatar ? (
            <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icon name="person" size={40} color="#fff" />
            </View>
          )}
        </View>
        <Text style={styles.userName}>{currentUser.name}</Text>
        <Text style={styles.userEmail}>{currentUser.email}</Text>
        <View style={styles.subscriptionBadge}>
          <Icon name="star" size={16} color="#FFD700" />
          <Text style={styles.subscriptionText}>
            {currentUser.subscriptionType.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{currentUser.vehicleProfiles.length}</Text>
          <Text style={styles.statLabel}>Vehicles</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{currentUser.gamificationScore}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{currentUser.achievements.length}</Text>
          <Text style={styles.statLabel}>Achievements</Text>
        </View>
      </View>

      {/* Current Vehicle */}
      {currentVehicle && (
        <View style={styles.vehicleCard}>
          <Text style={styles.cardTitle}>Current Vehicle</Text>
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleName}>
              {currentVehicle.vehicleInfo.year} {currentVehicle.vehicleInfo.make} {currentVehicle.vehicleInfo.model}
            </Text>
            <Text style={styles.vehicleNickname}>{currentVehicle.nickname}</Text>
            <Text style={styles.vehicleMileage}>{currentVehicle.mileage.toLocaleString()} miles</Text>
            <View style={styles.healthScoreContainer}>
              <Text style={styles.healthScoreLabel}>Health Score:</Text>
              <View style={[styles.healthScoreBar, { backgroundColor: getHealthScoreColor(currentVehicle.healthScore) }]}>
                <Text style={styles.healthScoreText}>{currentVehicle.healthScore}%</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity style={styles.actionCard} onPress={handleEditProfile}>
          <Icon name="edit" size={24} color="#2196F3" />
          <Text style={styles.actionTitle}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={handleVehicleSetup}>
          <Icon name="directions-car" size={24} color="#4CAF50" />
          <Text style={styles.actionTitle}>Vehicle Setup</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={handleSettings}>
          <Icon name="settings" size={24} color="#FF9800" />
          <Text style={styles.actionTitle}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={handlePremium}>
          <Icon name="star" size={24} color="#FFD700" />
          <Text style={styles.actionTitle}>Premium Features</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Achievements */}
      {currentUser.achievements.length > 0 && (
        <View style={styles.achievementsContainer}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          {currentUser.achievements.slice(0, 3).map((achievement, index) => (
            <View key={index} style={styles.achievementCard}>
              <Icon name="emoji-events" size={24} color="#FFD700" />
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementDescription}>{achievement.description}</Text>
                <Text style={styles.achievementPoints}>+{achievement.points} points</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={20} color="#F44336" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const getHealthScoreColor = (score: number): string => {
  if (score >= 80) return '#4CAF50';
  if (score >= 60) return '#FF9800';
  return '#F44336';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileHeader: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  subscriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  subscriptionText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
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
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  vehicleCard: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  vehicleInfo: {
    alignItems: 'center',
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  vehicleNickname: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  vehicleMileage: {
    fontSize: 16,
    color: '#333',
    marginTop: 8,
  },
  healthScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  healthScoreLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  healthScoreBar: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
  },
  healthScoreText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
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
  actionCard: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
    color: '#333',
  },
  achievementsContainer: {
    margin: 16,
  },
  achievementCard: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  achievementInfo: {
    marginLeft: 16,
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  achievementPoints: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
    marginLeft: 8,
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
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
