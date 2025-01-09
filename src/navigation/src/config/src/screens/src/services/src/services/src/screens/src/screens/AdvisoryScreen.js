import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { getAIAdvice } from '../services/AIService';
import { getWeather } from '../services/WeatherService';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const AdvisoryScreen = () => {
  const [loading, setLoading] = useState(true);
  const [advice, setAdvice] = useState(null);
  const [categories, setCategories] = useState({});

  useEffect(() => {
    loadAdvice();
  }, []);

  const loadAdvice = async () => {
    try {
      setLoading(true);
      const userId = auth().currentUser.uid;
      
      const userDoc = await firestore()
        .collection('users')
        .doc(userId)
        .get();
      const userProfile = userDoc.data();

      const weatherData = await getWeather(
        userProfile.location.latitude,
        userProfile.location.longitude
      );

      const aiAdvice = await getAIAdvice(userProfile, weatherData);
      const categorizedAdvice = parseAdvice(aiAdvice);
      setCategories(categorizedAdvice);
      setAdvice(aiAdvice);
    } catch (error) {
      console.error('Error loading advice:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseAdvice = (aiAdvice) => {
    const categories = {
      cropCare: [],
      pestManagement: [],
      irrigation: [],
      general: []
    };

    const sentences = aiAdvice.split('.');
    sentences.forEach(sentence => {
      if (sentence.toLowerCase().includes('pest') || sentence.toLowerCase().includes('disease')) {
        categories.pestManagement.push(sentence);
      } else if (sentence.toLowerCase().includes('water') || sentence.toLowerCase().includes('irrigation')) {
        categories.irrigation.push(sentence);
      } else if (sentence.toLowerCase().includes('crop') || sentence.toLowerCase().includes('plant')) {
        categories.cropCare.push(sentence);
      } else {
        categories.general.push(sentence);
      }
    });

    return categories;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.refreshButton} onPress={loadAdvice}>
        <Text style={styles.refreshButtonText}>Refresh Advice</Text>
      </TouchableOpacity>

      {Object.entries(categories).map(([category, adviceList]) => (
        adviceList.length > 0 && (
          <View key={category} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
            {adviceList.map((item, index) => (
              <View key={index} style={styles.adviceCard}>
                <Text style={styles.adviceText}>{item.trim()}</Text>
              </View>
            ))}
          </View>
        )
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  refreshButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  adviceCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  adviceText: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default AdvisoryScreen;
