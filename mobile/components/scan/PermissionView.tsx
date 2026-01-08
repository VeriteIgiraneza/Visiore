import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface PermissionViewProps {
  onRequest: () => void;
}

export default function PermissionView({ onRequest }: PermissionViewProps) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Camera Access Needed</Text>
      <TouchableOpacity style={styles.btn} onPress={onRequest}>
        <Text style={styles.btnText}>Grant Camera Permission</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  title: { 
    fontSize: 18, 
    marginBottom: 20, 
    textAlign: 'center',
    color: '#333'
  },
  btn: { 
    backgroundColor: '#007AFF', 
    padding: 15, 
    borderRadius: 10, 
    width: '100%', 
    alignItems: 'center' 
  },
  btnText: { 
    color: '#FFF', 
    fontWeight: 'bold', 
    fontSize: 18 
  },
});