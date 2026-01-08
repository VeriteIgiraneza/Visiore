import React from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ImagePreviewProps {
  image: string;
  onCancel: () => void;
  onAnalyze: (type: 'AUTO' | 'FUEL' | 'GENERAL') => void;
  isProcessing: boolean;
}

export const ImagePreview = ({ image, onCancel, onAnalyze, isProcessing }: ImagePreviewProps) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: image }} style={styles.image} />
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={onCancel}
          disabled={isProcessing}
        >
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.analyzeButton, styles.generalButton]} 
            onPress={() => onAnalyze('GENERAL')}
            disabled={isProcessing}
          >
            <Ionicons name="cart-outline" size={24} color="white" />
            <Text style={styles.buttonText}>Regular Receipt</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.analyzeButton, styles.fuelButton]} 
            onPress={() => onAnalyze('FUEL')}
            disabled={isProcessing}
          >
            <Ionicons name="beaker-outline" size={24} color="white" />
            <Text style={styles.buttonText}>Gas/Fuel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  image: { flex: 1, resizeMode: 'contain' },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%'
  },
  analyzeButton: {
    flex: 1,
    flexDirection: 'row',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  generalButton: { backgroundColor: '#3b82f6' },
  fuelButton: { backgroundColor: '#10b981' },
  cancelButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white'
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});