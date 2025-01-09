import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { getCurrentLocation } from '../services/LocationService';
import { getWeather } from '../services/WeatherService';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const HomeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [quickTips, setQuickTips] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);

      const weatherData = await getWeather(
        currentLocation.latitude,
        currentLocation.longitude
      );
      setWeather(weatherData);

      const userId = auth().currentUser.uid;
      const userDoc = await firestore().collection('users').doc(userId).get();
      const userData = userDoc.data();

      generateQuickTips(weatherData, userData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQuickTips = (weatherData, userData) => {
    const tips = [];
    if (weatherData.main.temp > 30) {
      tips.push('High temperature alert: Consider additional irrigation');
    }
    if (weatherData.main.humidity > 80) {
      tips.push('High humidity: Monitor for potential fungal diseases');
    }
    if (weatherData.rain) {
      tips.push('Rain expected: Hold off on irrigation');
    }
    setQuickTips(tips);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData().finally(() => setRefreshing(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.weatherContainer}>
        <Text style={styles.sectionTitle}>Current Weather</Text>
        {weather && (
          <>
            <Text style={styles.temperature}>
              {Math.round(weather.main.temp)}°C
            </Text>
            <Text style={styles.weatherDesc}>
              {weather.weather[0].description}
            </Text>
            <Text>Humidity: {weather.main.humidity}%</Text>
          </>
        )}
      </View>

      <View style={styles.tipsContainer}>
        <Text style={styles.sectionTitle}>Today's Tips</Text>
        {quickTips.map((tip, index) => (
          <View key={index} style={styles.tipCard}>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Advisory')}
        >
          <Text style={styles.actionButtonText}>Get Detailed Advice</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.actionButtonText}>Update Farm Profile</Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherContainer: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  weatherDesc: {
    fontSize: 18,
    marginVertical: 5,
  },
  tipsContainer: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  tipCard: {
    backgroundColor: '#f0f8ff',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  tipText: {
    fontSize: 16,
  },
  actionsContainer: {
    margin: 10,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
  },
  actionButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
