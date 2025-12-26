import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getReceiptById, deleteReceipt } from '../../services/api';

export default function ReceiptDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReceipt();
  }, [id]);

  const loadReceipt = async () => {
    try {
      const response = await getReceiptById(id as string);
      setReceipt(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load receipt');
      console.error(error);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Receipt',
      'Are you sure you want to delete this receipt?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReceipt(id as string);
              Alert.alert('Success', 'Receipt deleted');
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete receipt');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${(amount || 0).toFixed(2)}`;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!receipt) {
    return (
      <View style={styles.centerContainer}>
        <Text>Receipt not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Receipt Image */}
      {receipt.imageBase64 && (
        <Image
          source={{ uri: `data:image/jpeg;base64,${receipt.imageBase64}` }}
          style={styles.receiptImage}
          resizeMode="contain"
        />
      )}

      {/* Main Info Card */}
      <View style={styles.card}>
        <Text style={styles.merchant}>{receipt.merchant}</Text>
        <Text style={styles.date}>{formatDate(receipt.date)} • {receipt.transactionTime || 'N/A'}</Text>
        
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>{formatCurrency(receipt.total)}</Text>
        </View>

        <View style={styles.badges}>
          <View style={styles.badge}>
            <Ionicons name="pricetag" size={16} color="#007AFF" />
            <Text style={styles.badgeText}>{receipt.category}</Text>
          </View>
          <View style={styles.badge}>
            <Ionicons name="card" size={16} color="#007AFF" />
            <Text style={styles.badgeText}>{receipt.paymentMethod}</Text>
          </View>
        </View>
      </View>

      {/* Store & Payment Detail Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Store & Payment Info</Text>
        
        {receipt.storeAddress && (
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#666" />
            <Text style={styles.infoText}>{receipt.storeAddress}</Text>
          </View>
        )}

        {receipt.storePhone && (
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color="#666" />
            <Text style={styles.infoText}>{receipt.storePhone}</Text>
          </View>
        )}
        
        <View style={styles.infoRow}>
          <Ionicons name="receipt-outline" size={18} color="#666" />
          <Text style={styles.infoText}>Receipt #: {receipt.receiptNumber || 'N/A'}</Text>
        </View>

        {receipt.paymentCardLast4 && (
          <View style={styles.infoRow}>
            <Ionicons name="card-outline" size={18} color="#666" />
            <Text style={styles.infoText}>Card Ending In: **** {receipt.paymentCardLast4}</Text>
          </View>
        )}
      </View>

      {/* Technical Metadata Grid */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Transaction Metadata</Text>
        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>AID</Text>
            <Text style={styles.metaValue}>{receipt.AID || 'N/A'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Auth Code</Text>
            <Text style={styles.metaValue}>{receipt.authCode || 'N/A'}</Text>
          </View>
        </View>
        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Terminal ID</Text>
            <Text style={styles.metaValue}>{receipt.terminalId || 'N/A'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Cashier</Text>
            <Text style={styles.metaValue}>{receipt.cashier || 'N/A'}</Text>
          </View>
        </View>
      </View>

      {/* Items List with UPC */}
      {receipt.items && receipt.items.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items ({receipt.items.length})</Text>
          {receipt.items.map((item: any, index: number) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.upc ? <Text style={styles.itemUpc}>UPC: {item.upc}</Text> : null}
                {item.quantity > 1 && (
                  <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                )}
              </View>
              <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Price Breakdown */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Price Breakdown</Text>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Subtotal</Text>
          <Text style={styles.breakdownValue}>
            {formatCurrency(receipt.subtotal || receipt.total)}
          </Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Tax</Text>
          <Text style={styles.breakdownValue}>{formatCurrency(receipt.tax)}</Text>
        </View>
        <View style={[styles.breakdownRow, styles.breakdownTotal]}>
          <Text style={styles.breakdownTotalLabel}>Total</Text>
          <Text style={styles.breakdownTotalValue}>
            {formatCurrency(receipt.total)}
          </Text>
        </View>
      </View>

      {/* Notes & Tags */}
      {(receipt.notes || (receipt.tags && receipt.tags.length > 0)) && (
        <View style={styles.card}>
          {receipt.notes && (
            <>
              <Text style={styles.cardTitle}>Notes</Text>
              <Text style={styles.notes}>{receipt.notes}</Text>
            </>
          )}
          {receipt.tags && receipt.tags.length > 0 && (
            <View style={receipt.notes ? {marginTop: 15} : {}}>
               <Text style={styles.cardTitle}>Tags</Text>
               <View style={styles.tags}>
                {receipt.tags.map((tag: string, index: number) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {/* Delete Button */}
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Ionicons name="trash-outline" size={20} color="white" />
        <Text style={styles.deleteButtonText}>Delete Receipt</Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  receiptImage: { width: '100%', height: 350, backgroundColor: '#000' },
  card: {
    backgroundColor: 'white',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  merchant: { fontSize: 22, fontWeight: 'bold', color: '#000', marginBottom: 4 },
  date: { fontSize: 14, color: '#666', marginBottom: 16 },
  totalContainer: { backgroundColor: '#F8F9FA', padding: 12, borderRadius: 8, marginBottom: 12 },
  totalLabel: { fontSize: 12, color: '#666' },
  totalAmount: { fontSize: 28, fontWeight: 'bold', color: '#007AFF' },
  badges: { flexDirection: 'row', gap: 8 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
  },
  badgeText: { fontSize: 12, color: '#007AFF', fontWeight: '500' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  infoText: { fontSize: 14, color: '#444', flexShrink: 1 },
  metaGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  metaItem: { flex: 1 },
  metaLabel: { fontSize: 11, color: '#999', textTransform: 'uppercase' },
  metaValue: { fontSize: 14, color: '#333', fontWeight: '500' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, color: '#000', fontWeight: '500' },
  itemUpc: { fontSize: 11, color: '#888', marginTop: 2 },
  itemQuantity: { fontSize: 12, color: '#666' },
  itemPrice: { fontSize: 14, fontWeight: '600', color: '#000' },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  breakdownLabel: { fontSize: 14, color: '#666' },
  breakdownValue: { fontSize: 14, color: '#000' },
  breakdownTotal: { borderTopWidth: 1, borderTopColor: '#EEE', marginTop: 8, paddingTop: 8 },
  breakdownTotalLabel: { fontSize: 16, fontWeight: 'bold' },
  breakdownTotalValue: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' },
  notes: { fontSize: 14, color: '#444', lineHeight: 20 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#F0F0F0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  tagText: { fontSize: 12, color: '#555' },
  deleteButton: { backgroundColor: '#FF3B30', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', margin: 12, padding: 14, borderRadius: 12, gap: 8 },
  deleteButtonText: { color: 'white', fontSize: 15, fontWeight: '600' },
  bottomPadding: { height: 40 },
});