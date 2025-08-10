import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const { width } = Dimensions.get('window');

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
}

const PremiumScreen = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly');
  const { currentUser } = useSelector((state: RootState) => state.user);

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'monthly',
      name: 'Monthly Premium',
      price: 9.99,
      period: 'month',
      features: [
        'Unlimited AI diagnostics',
        'Advanced repair guides',
        'Priority customer support',
        'Ad-free experience',
        'Export reports to PDF',
        'Vehicle maintenance reminders'
      ]
    },
    {
      id: 'yearly',
      name: 'Annual Premium',
      price: 99.99,
      period: 'year',
      features: [
        'All Monthly features',
        '2 months free',
        'Exclusive premium content',
        'Advanced analytics dashboard',
        'Custom vehicle profiles',
        'Priority feature requests'
      ],
      popular: true
    },
    {
      id: 'lifetime',
      name: 'Lifetime Premium',
      price: 299.99,
      period: 'one-time',
      features: [
        'All Premium features forever',
        'Lifetime updates',
        'Premium support',
        'Exclusive community access',
        'Beta feature access',
        'Merchandise discounts'
      ]
    }
  ];

  const premiumFeatures = [
    {
      icon: 'psychology',
      title: 'Advanced AI Diagnostics',
      description: 'Get detailed explanations and repair suggestions powered by advanced AI'
    },
    {
      icon: 'build',
      title: 'Professional Repair Guides',
      description: 'Step-by-step repair instructions with photos and videos'
    },
    {
      icon: 'analytics',
      title: 'Advanced Analytics',
      description: 'Track vehicle health over time with detailed reports and trends'
    },
    {
      icon: 'notifications',
      title: 'Smart Maintenance Reminders',
      description: 'Get notified about upcoming maintenance based on your vehicle'
    },
    {
      icon: 'cloud',
      title: 'Cloud Sync & Backup',
      description: 'Access your data from any device with automatic cloud backup'
    },
    {
      icon: 'support',
      title: 'Priority Support',
      description: 'Get help faster with dedicated premium support team'
    }
  ];

  const handleSubscribe = (plan: SubscriptionPlan) => {
    Alert.alert(
      'Subscribe to Premium',
      `Would you like to subscribe to ${plan.name} for $${plan.price}/${plan.period}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Subscribe', 
          onPress: () => {
            // In a real app, this would integrate with payment processing
            Alert.alert('Success', 'Subscription activated! Welcome to Premium!');
          }
        }
      ]
    );
  };

  const handleRestorePurchase = () => {
    Alert.alert('Restore Purchase', 'Checking for previous purchases...');
    // In a real app, this would restore previous subscriptions
  };

  const currentPlan = subscriptionPlans.find(plan => plan.id === selectedPlan);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="star" size={48} color="#FFD700" />
        <Text style={styles.headerTitle}>Upgrade to Premium</Text>
        <Text style={styles.headerSubtitle}>
          Unlock advanced features and get professional-level diagnostics
        </Text>
      </View>

      {/* Current Status */}
      {currentUser?.subscriptionType === 'premium' ? (
        <View style={styles.currentPlanCard}>
          <Icon name="check-circle" size={24} color="#4CAF50" />
          <Text style={styles.currentPlanText}>
            You are currently on a Premium plan
          </Text>
        </View>
      ) : (
        <View style={styles.currentPlanCard}>
          <Icon name="info" size={24} color="#2196F3" />
          <Text style={styles.currentPlanText}>
            You are currently on the Free plan
          </Text>
        </View>
      )}

      {/* Subscription Plans */}
      <View style={styles.plansSection}>
        <Text style={styles.sectionTitle}>Choose Your Plan</Text>
        
        {subscriptionPlans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              plan.popular && styles.popularPlanCard
            ]}
            onPress={() => setSelectedPlan(plan.id)}
          >
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>MOST POPULAR</Text>
              </View>
            )}
            
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{plan.name}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.currency}>$</Text>
                <Text style={styles.price}>{plan.price}</Text>
                <Text style={styles.period}>/{plan.period}</Text>
              </View>
            </View>

            <View style={styles.featuresList}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Icon name="check" size={16} color="#4CAF50" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.subscribeButton,
                plan.popular && styles.popularSubscribeButton
              ]}
              onPress={() => handleSubscribe(plan)}
            >
              <Text style={styles.subscribeButtonText}>
                {plan.id === 'lifetime' ? 'Get Lifetime Access' : 'Subscribe Now'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>

      {/* Premium Features */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Premium Features</Text>
        
        <View style={styles.featuresGrid}>
          {premiumFeatures.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <Icon name={feature.icon as any} size={32} color="#2196F3" />
              <Text style={styles.featureCardTitle}>{feature.title}</Text>
              <Text style={styles.featureCardDescription}>
                {feature.description}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* FAQ Section */}
      <View style={styles.faqSection}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        
        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>
            Can I cancel my subscription anytime?
          </Text>
          <Text style={styles.faqAnswer}>
            Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your current billing period.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>
            Is there a free trial?
          </Text>
          <Text style={styles.faqAnswer}>
            Yes! New users get a 7-day free trial of Premium features to experience the full power of our app.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>
            What payment methods do you accept?
          </Text>
          <Text style={styles.faqAnswer}>
            We accept all major credit cards, PayPal, and Apple Pay/Google Pay on mobile devices.
          </Text>
        </View>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestorePurchase}
        >
          <Text style={styles.restoreButtonText}>Restore Purchase</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => Alert.alert('Contact Support', 'Contact our support team for help.')}
        >
          <Text style={styles.contactButtonText}>Contact Support</Text>
        </TouchableOpacity>
      </View>

      {/* Terms */}
      <View style={styles.termsSection}>
        <Text style={styles.termsText}>
          By subscribing, you agree to our Terms of Service and Privacy Policy. 
          Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period.
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
  currentPlanCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  currentPlanText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  plansSection: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    position: 'relative',
  },
  popularPlanCard: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: 16,
    color: '#666',
    marginRight: 2,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  period: {
    fontSize: 14,
    color: '#666',
    marginLeft: 2,
  },
  featuresList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  subscribeButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  popularSubscribeButton: {
    backgroundColor: '#FFD700',
  },
  subscribeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  featuresSection: {
    margin: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    backgroundColor: 'white',
    width: (width - 48) / 2,
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
  featureCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
    color: '#333',
  },
  featureCardDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  faqSection: {
    margin: 16,
  },
  faqItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bottomActions: {
    margin: 16,
    gap: 12,
  },
  restoreButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  restoreButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactButton: {
    backgroundColor: '#666',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsSection: {
    margin: 16,
    marginBottom: 32,
  },
  termsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default PremiumScreen;
