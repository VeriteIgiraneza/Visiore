import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LandingViewProps {
  onStartScan: () => void;
  onImportImage: () => void;
}

export default function LandingView({ onStartScan, onImportImage }: LandingViewProps) {
  return (
    <View style={styles.center}>
      <Ionicons name="receipt" size={100} color="#007AFF" />
      
      {/* Primary Action: Camera */}
      <TouchableOpacity style={styles.btn} onPress={onStartScan}>
        <Ionicons name="camera" size={20} color="#FFF" style={{ marginRight: 10 }} />
        <Text style={styles.btnText}>Scan Receipt</Text>
      </TouchableOpacity>

      {/* Secondary Action: Gallery */}
      <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={onImportImage}>
        <Ionicons name="images" size={20} color="#007AFF" style={{ marginRight: 10 }} />
        <Text style={[styles.btnText, styles.btnTextSecondary]}>Import from Gallery</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20,
    backgroundColor: '#fff'
  },
  btn: { 
    backgroundColor: '#007AFF', 
    padding: 15, 
    borderRadius: 12, 
    width: '100%', 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25
  },
  btnSecondary: {
    backgroundColor: '#E5F1FF', // Light blue background
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#007AFF'
  },
  btnText: { 
    color: '#FFF', 
    fontWeight: 'bold', 
    fontSize: 18 
  },
  btnTextSecondary: {
    color: '#007AFF'
  }
});