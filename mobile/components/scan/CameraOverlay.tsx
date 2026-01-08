import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { CameraView } from 'expo-camera';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CameraOverlayProps {
  cameraRef: React.RefObject<any>;
  flash: 'on' | 'off';
  onCapture: () => void;
}

export default function CameraOverlay({ cameraRef, flash, onCapture }: CameraOverlayProps) {
  return (
    <View style={styles.container}>
      {/* 1. The Camera sits in the background */}
      <CameraView 
        style={StyleSheet.absoluteFillObject} 
        ref={cameraRef} 
        enableTorch={flash === 'on'}
      />

      {/* 2. The UI sits on top using absolute positioning */}
      <View style={styles.uiLayer} pointerEvents="box-none">
        <View style={styles.overlay}>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.captureBtn} onPress={onCapture} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
  uiLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)' 
  },
  controls: { 
    position: 'absolute', 
    bottom: 40, 
    width: '100%', 
    alignItems: 'center' 
  },
  captureBtn: { 
    width: 70, 
    height: 70, 
    borderRadius: 35, 
    backgroundColor: '#FFF', 
    borderWidth: 5, 
    borderColor: 'rgba(255,255,255,0.5)' 
  },
});