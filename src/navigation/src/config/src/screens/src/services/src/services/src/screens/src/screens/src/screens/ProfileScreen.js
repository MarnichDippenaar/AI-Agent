import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Picker } from '@react-native-picker/picker';

const ProfileScreen = () => {
  const [profile, setProfile] = useState({
    name: '',
    farmName: '',
    soilType: 'clay',
    crops: '',
    location: {
      latitude: '',
      longitude: '',
    },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userId = auth().currentUser.uid;
      const userDoc = await firestore()
        .collection('users')
        .doc(userId)
        .get();
      
      if (userDoc.exists) {
        setProfile(userDoc.data());
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const saveProfile = async () => {
    try {
      const userId = auth().currentUser.uid;
      await firestore()
        .collection('users')
        .doc(userId)
        .set(profile);
      
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Farmer Name</Text>
        <TextInput
          style={styles.input}
          value={profile.name}
          onChangeText={(text) => setProfile({ ...profile, name: text })}
          placeholder="Enter your name"
        />

        <Text style={styles.label}>Farm Name</Text>
        <TextInput
          style={styles.input}
          value={profile.farmName}
          onChangeText={(text) => setProfile({ ...profile, farmName: text })}
          placeholder="Enter farm name"
        />

        <Text style={styles.label}>Soil Type</Text>
        <Picker
          selectedValue={profile.soilType}
          style={styles.picker}
          onValueChange={(value) => setProfile({ ...profile, soilType: value })}
        >
          <Picker.Item label="Clay" value="clay" />
          <Picker.Item label="Sandy" value="sandy" />
          <Picker.Item label="Loamy" value="loamy" />
          <Picker.Item label="Silt" value="silt" />
        </Picker>

        <Text style={styles.label}>Crops (comma-separated)</Text>
        <TextInput
          style={styles.input}
          value={profile.crops}
          onChangeText={(text) => setProfile({ ...profile, crops: text })}
          placeholder="e.g., corn, wheat, soybeans"
        />

        <Text style={styles.label}>Location</Text>
        <View style={styles.locationContainer}>
          <TextInput
            style={[styles.input, styles.locationInput]}
            value={String(profile.location.latitude)}
            onChangeText={(text) =>
              setProfile({
                ...profile,
                location: { ...profile.location, latitude: text },
              })
            }
            placeholder="Latitude"
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.locationInput]}
            value={String(profile.location.longitude)}
            onChangeText={(text) =>
              setProfile({
                ...profile,
                location: { ...profile.location, longitude: text },
              })
            }
            placeholder="Longitude"
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
          <Text style={styles.saveButtonText}>Save Profile</Text>
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
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  picker: {
    backgroundColor: 'white',
    marginBottom: 15,
  },
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationInput: {
    flex: 0.48,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
