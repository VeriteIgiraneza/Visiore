import React from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';

interface ReceiptReviewProps {
  visible: boolean;
  data: any;
  setData: (data: any) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function ReceiptReview({ visible, data, setData, onSave, onCancel }: ReceiptReviewProps) {
  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.reviewContainer}>
        <Text style={styles.modalTitle}>Review Details</Text>
        <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.label}>Store Name</Text>
          <TextInput 
            style={styles.input} 
            value={data.storeName}
            onChangeText={(text) => setData({...data, storeName: text})}
          />

          <Text style={styles.label}>Total Amount ($)</Text>
          <TextInput 
            style={styles.input} 
            keyboardType="numeric"
            value={data.total}
            onChangeText={(text) => setData({...data, total: text})}
          />

          <Text style={styles.label}>Date</Text>
          <TextInput 
            style={styles.input} 
            value={data.date}
            onChangeText={(text) => setData({...data, date: text})}
          />

          <Text style={styles.label}>Items Detected</Text>
          {data.items.map((item: any, index: number) => (
            <View key={index} style={styles.itemRow}>
                <TextInput 
                style={[styles.input, { flex: 2, marginBottom: 0 }]} 
                value={item.name} 
                />
                <TextInput 
                style={[styles.input, { flex: 1, marginLeft: 10, marginBottom: 0 }]} 
                value={item.price?.toString()} 
                />
            </View>
            ))}
        </ScrollView>

        <View style={styles.modalActions}>
          <TouchableOpacity style={styles.btn} onPress={onSave}>
            <Text style={styles.btnText}>Confirm & Save</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onCancel}>
            <Text style={{ color: 'red', marginTop: 15 }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  reviewContainer: { flex: 1, padding: 25, backgroundColor: '#F2F2F7', paddingTop: 60 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  label: { fontSize: 14, color: '#8E8E93', marginBottom: 5, fontWeight: '600', textTransform: 'uppercase' },
  input: { 
    backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 20, fontSize: 16, color: '#000',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2
  },
  itemRow: { flexDirection: 'row', marginBottom: 10 },
  modalActions: { width: '100%', alignItems: 'center', marginTop: 20 },
  btn: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
});