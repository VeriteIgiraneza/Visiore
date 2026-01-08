import React, { useState, useRef, useEffect } from 'react';
import { View, Alert, TouchableOpacity } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';

// Internal Imports
import { uploadReceipt } from '../../services/api';
import CameraOverlay from '../../components/scan/CameraOverlay';
import { ImagePreview } from '../../components/scan/ImagePreview';
import ReceiptReview from '../../components/scan/ReceiptReview';
import LandingView from '../../components/scan/LandingView';
import PermissionView from '../../components/scan/PermissionView';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [flash, setFlash] = useState<'on' | 'off'>('off');
  
  const [aiResults, setAiResults] = useState({
    storeName: '', 
    total: '', 
    date: '', 
    items: []
  });

  const cameraRef = useRef(null);
  const router = useRouter();
  const navigation = useNavigation();

  // Handle Header dynamically
  useEffect(() => {
    if (isCameraActive) {
      navigation.setOptions({
        headerTitle: "Scan",
        headerTitleAlign: 'center',
        headerLeft: () => (
          <TouchableOpacity 
            onPress={() => setIsCameraActive(false)} 
            style={{ marginLeft: 15 }}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity 
            onPress={() => setFlash(f => f === 'on' ? 'off' : 'on')} 
            style={{ marginRight: 15 }}
          >
            <Ionicons name={flash === 'on' ? "flash" : "flash-off"} size={24} color="#007AFF" />
          </TouchableOpacity>
        ),
      });
    } else {
      navigation.setOptions({
        headerTitle: "Scan",
        headerLeft: undefined,
        headerRight: undefined,
      });
    }
  }, [flash, isCameraActive, navigation]);

  // Permission Guard
  if (!permission?.granted) {
    return <PermissionView onRequest={requestPermission} />;
  }

  // --- Logic Functions ---

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await (cameraRef.current as any).takePictureAsync({ 
          quality: 1,
          shutterSound: false 
        });
        setCapturedImage(photo);
        setIsCameraActive(false);
      } catch (e) {
        Alert.alert("Error", "Failed to capture image");
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        // We use the first asset in the selection
        setCapturedImage(result.assets[0]);
      }
    } catch (e) {
      Alert.alert("Error", "Failed to pick image from gallery");
    }
  };

  // --- PLACE IT HERE ---
  const cropAndUpload = async (type: 'FUEL' | 'GENERAL') => {
    if (!capturedImage) return;
    setIsProcessing(true);
    try {
      const cropped = await ImageManipulator.manipulateAsync(
        capturedImage.uri,
        [{ crop: { originX: 0, originY: capturedImage.height * 0.1, width: capturedImage.width, height: capturedImage.height * 0.8 } }],
        { format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      const response = await uploadReceipt(cropped.base64, type);
      
      setAiResults({
        storeName: response.data.merchant || '',
        total: response.data.total?.toString() || '',
        date: response.data.date || '',
        items: response.data.items || []
      });
      
      setCapturedImage(null);
      setIsReviewing(true);
    } catch (e) {
      Alert.alert("Error", "AI Analysis failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Render logic ---

  // 1. Full Camera View Mode
  if (isCameraActive) {
    return <CameraOverlay cameraRef={cameraRef} flash={flash} onCapture={takePicture} />;
  }

  // 2. Standard View (Landing, Preview Modal, Review Modal)
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      
      {/* Show Landing only if we aren't previewing or reviewing */}
      {!capturedImage && !isReviewing && (
        <LandingView 
          onStartScan={() => setIsCameraActive(true)} 
          onImportImage={pickImage}
        />
      )}

      {/* Modal 1: Confirm Photo and Select Type */}
      <ImagePreview 
        visible={!!capturedImage} 
        image={capturedImage?.uri} // Changed imageUri to image
        isProcessing={isProcessing} 
        onAnalyze={(type) => cropAndUpload(type)} 
        onRetake={() => setCapturedImage(null)} 
      />

      {/* Modal 2: Edit/Confirm AI Data */}
      <ReceiptReview 
        visible={isReviewing} 
        data={aiResults} 
        setData={setAiResults} 
        onSave={() => {
          Alert.alert("Success", "Receipt saved successfully!");
          setIsReviewing(false);
          router.push('/(tabs)/receipts');
        }}
        onCancel={() => setIsReviewing(false)}
      />
    </View>
  );
}